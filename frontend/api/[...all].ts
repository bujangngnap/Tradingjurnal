import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      port: parseInt(process.env.DB_PORT || '4000', 10),
      user: process.env.DB_USERNAME || '3AfGUBQu5UTrZXg.root',
      password: process.env.DB_PASSWORD || '5yJBpbhCAxDB730M',
      database: process.env.DB_DATABASE || 'trading_journal_pro',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, ''); // strip trailing slash
  const db = getPool();

  try {
    // -------------------------------------------------------------
    // 1. GET /api/v1/trades & POST /api/v1/trades
    // -------------------------------------------------------------
    if (pathname === '/api/v1/trades' || pathname === '/api/trades') {
      if (req.method === 'GET') {
        const status = url.searchParams.get('status');
        const pair = url.searchParams.get('pair');

        let query = 'SELECT * FROM trades WHERE 1=1';
        const params: any[] = [];

        if (status && status !== 'ALL') {
          query += ' AND status = ?';
          params.push(status);
        }
        if (pair && pair !== 'ALL') {
          query += ' AND pair = ?';
          params.push(pair);
        }

        query += ' ORDER BY opened_at DESC';

        const [trades]: any = await db.query(query, params);

        if (trades.length > 0) {
          const tradeIds = trades.map((t: any) => t.id);
          const [updates]: any = await db.query(
            `SELECT * FROM trade_updates WHERE trade_id IN (?) ORDER BY created_at ASC`,
            [tradeIds]
          );

          const updateMap: Record<string, any[]> = {};
          for (const u of updates) {
            if (!updateMap[u.trade_id]) updateMap[u.trade_id] = [];
            updateMap[u.trade_id].push(u);
          }

          for (const t of trades) {
            t.updates = updateMap[t.id] || [];
          }
        }

        return res.status(200).json({ success: true, data: trades });
      }

      if (req.method === 'POST') {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const {
          pair,
          side,
          entry_price,
          sl_price,
          tp_price,
          lot,
          timeframe,
          session,
          reason,
          screenshot_before,
        } = body;

        const ep = parseFloat(entry_price) || 0;
        const sl = parseFloat(sl_price) || 0;
        const tp = parseFloat(tp_price) || 0;
        const risk = Math.abs(ep - sl);
        const reward = Math.abs(tp - ep);
        const rr = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;

        const now = new Date();

        const [insertRes]: any = await db.query(
          `INSERT INTO trades 
            (pair, side, entry_price, sl_price, tp_price, lot, timeframe, session, reason, status, profit_point, profit_money, rr_ratio, screenshot_before, opened_at, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', 0, 0, ?, ?, ?, ?, ?)`,
          [
            pair.toUpperCase(),
            side.toUpperCase(),
            ep,
            sl,
            tp,
            parseFloat(lot) || 0.1,
            timeframe || 'M5',
            session || null,
            reason || '',
            rr,
            screenshot_before || null,
            now,
            now,
            now,
          ]
        );

        const tradeId = insertRes.insertId;

        // Insert initial ENTRY update
        await db.query(
          `INSERT INTO trade_updates 
            (trade_id, update_type, message, current_price, floating_points, floating_money, created_at, updated_at) 
           VALUES (?, 'ENTRY', ?, ?, 0, 0, ?, ?)`,
          [
            tradeId,
            `Posisi ${side.toUpperCase()} dieksekusi di harga ${ep}. SL: ${sl} | TP: ${tp}`,
            ep,
            now,
            now,
          ]
        );

        const [newTradeRows]: any = await db.query('SELECT * FROM trades WHERE id = ?', [tradeId]);
        const newTrade = newTradeRows[0];
        const [updates]: any = await db.query('SELECT * FROM trade_updates WHERE trade_id = ?', [tradeId]);
        newTrade.updates = updates;

        return res.status(201).json({ success: true, data: newTrade });
      }
    }

    // -------------------------------------------------------------
    // 2. PATCH /api/v1/trades/:id/close
    // -------------------------------------------------------------
    const closeMatch = pathname.match(/^\/api(?:\/v1)?\/trades\/(\d+)\/close$/);
    if (closeMatch && req.method === 'PATCH') {
      const tradeId = closeMatch[1];
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { exit_price, status, notes } = body;

      const [tradeRows]: any = await db.query('SELECT * FROM trades WHERE id = ?', [tradeId]);
      if (tradeRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Trade not found' });
      }

      const trade = tradeRows[0];
      const ep = parseFloat(trade.entry_price);
      const exitP = parseFloat(exit_price);
      const isGold = trade.pair.toUpperCase().includes('XAU');
      const pointMultiplier = isGold ? 10 : 10000;
      const moneyMultiplier = isGold ? 100 : 100000;

      let profitPoints = 0;
      if (trade.side === 'BUY') {
        profitPoints = (exitP - ep) * pointMultiplier;
      } else {
        profitPoints = (ep - exitP) * pointMultiplier;
      }

      const profitMoney = (profitPoints / pointMultiplier) * parseFloat(trade.lot) * (isGold ? 100 : 10);
      const now = new Date();

      await db.query(
        `UPDATE trades 
         SET status = ?, exit_price = ?, profit_point = ?, profit_money = ?, closed_at = ?, updated_at = ? 
         WHERE id = ?`,
        [
          status,
          exitP,
          parseFloat(profitPoints.toFixed(1)),
          parseFloat(profitMoney.toFixed(2)),
          now,
          now,
          tradeId,
        ]
      );

      // Add EXIT update message
      const exitMsg = notes
        ? `🛑 Trade ditutup: Exit di ${exitP} (${profitPoints >= 0 ? '+' : ''}${profitPoints.toFixed(0)} pts | ${profitMoney >= 0 ? '+' : ''}$${profitMoney.toFixed(2)}). Catatan: ${notes}`
        : `🛑 Trade ditutup: Exit di ${exitP} (${profitPoints >= 0 ? '+' : ''}${profitPoints.toFixed(0)} pts | ${profitMoney >= 0 ? '+' : ''}$${profitMoney.toFixed(2)})`;

      await db.query(
        `INSERT INTO trade_updates 
          (trade_id, update_type, message, current_price, floating_points, floating_money, created_at, updated_at) 
         VALUES (?, 'EXIT', ?, ?, ?, ?, ?, ?)`,
        [tradeId, exitMsg, exitP, profitPoints, profitMoney, now, now]
      );

      const [updatedRows]: any = await db.query('SELECT * FROM trades WHERE id = ?', [tradeId]);
      const updatedTrade = updatedRows[0];
      const [updates]: any = await db.query('SELECT * FROM trade_updates WHERE trade_id = ?', [tradeId]);
      updatedTrade.updates = updates;

      return res.status(200).json({ success: true, data: updatedTrade });
    }

    // -------------------------------------------------------------
    // 3. POST /api/v1/trades/:id/updates
    // -------------------------------------------------------------
    const updateMatch = pathname.match(/^\/api(?:\/v1)?\/trades\/(\d+)\/updates$/);
    if (updateMatch && req.method === 'POST') {
      const tradeId = updateMatch[1];
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { update_type, message, current_price, floating_points, floating_money, screenshot_url } = body;

      const now = new Date();
      const [insertRes]: any = await db.query(
        `INSERT INTO trade_updates 
          (trade_id, update_type, message, current_price, floating_points, floating_money, screenshot_url, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tradeId,
          update_type || 'PROGRESS',
          message || '',
          current_price || null,
          floating_points || 0,
          floating_money || 0,
          screenshot_url || null,
          now,
          now,
        ]
      );

      // If SL_TO_BE, update the trade's SL to entry price
      if (update_type === 'SL_TO_BE') {
        await db.query('UPDATE trades SET sl_price = entry_price WHERE id = ?', [tradeId]);
      }

      const [newUpdateRows]: any = await db.query('SELECT * FROM trade_updates WHERE id = ?', [insertRes.insertId]);
      return res.status(201).json({ success: true, data: newUpdateRows[0] });
    }

    // -------------------------------------------------------------
    // 4. GET & DELETE /api/v1/trades/:id
    // -------------------------------------------------------------
    const singleMatch = pathname.match(/^\/api(?:\/v1)?\/trades\/(\d+)$/);
    if (singleMatch) {
      const tradeId = singleMatch[1];

      if (req.method === 'GET') {
        const [rows]: any = await db.query('SELECT * FROM trades WHERE id = ?', [tradeId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Trade not found' });
        const trade = rows[0];
        const [updates]: any = await db.query('SELECT * FROM trade_updates WHERE trade_id = ?', [tradeId]);
        trade.updates = updates;
        return res.status(200).json({ success: true, data: trade });
      }

      if (req.method === 'DELETE') {
        await db.query('DELETE FROM trade_updates WHERE trade_id = ?', [tradeId]);
        await db.query('DELETE FROM trades WHERE id = ?', [tradeId]);
        return res.status(200).json({ success: true, message: 'Trade deleted' });
      }
    }

    // -------------------------------------------------------------
    // 5. GET /api/v1/analytics/overview
    // -------------------------------------------------------------
    if (pathname === '/api/v1/analytics/overview' || pathname === '/api/analytics/overview') {
      const [closedTrades]: any = await db.query("SELECT * FROM trades WHERE status != 'OPEN'");
      const [allTrades]: any = await db.query('SELECT * FROM trades');

      const totalTrades = allTrades.length;
      const wins = closedTrades.filter((t: any) => parseFloat(t.profit_money) > 0);
      const losses = closedTrades.filter((t: any) => parseFloat(t.profit_money) < 0);

      const winCount = wins.length;
      const lossCount = losses.length;
      const winRate = closedTrades.length > 0 ? parseFloat(((winCount / closedTrades.length) * 100).toFixed(1)) : 0;

      const netProfitMoney = closedTrades.reduce((acc: number, t: any) => acc + parseFloat(t.profit_money || 0), 0);
      const netProfitPoints = closedTrades.reduce((acc: number, t: any) => acc + parseFloat(t.profit_point || 0), 0);

      const avgRR =
        allTrades.length > 0
          ? parseFloat((allTrades.reduce((acc: number, t: any) => acc + parseFloat(t.rr_ratio || 0), 0) / allTrades.length).toFixed(1))
          : 0;

      const todayStr = new Date().toISOString().slice(0, 10);
      const profitToday = closedTrades
        .filter((t: any) => t.closed_at && String(t.closed_at).startsWith(todayStr))
        .reduce((acc: number, t: any) => acc + parseFloat(t.profit_money || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalTrades,
          winCount,
          lossCount,
          winRate,
          netProfitMoney: Math.round(netProfitMoney),
          netProfitPoints: Math.round(netProfitPoints),
          avgRR,
          profitToday: Math.round(profitToday),
        },
      });
    }

    // Default 404 for unknown API routes
    return res.status(404).json({ success: false, message: `Route ${req.method} ${pathname} not found` });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
