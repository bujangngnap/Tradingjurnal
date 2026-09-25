import type { Trade, TradeUpdate, DashboardStats, TradeStatus } from '../types/trade';

const STORAGE_KEY = 'trading_journal_pro_trades_v1';

// Seed demo trades with realistic SMC XAUUSD setups
const INITIAL_TRADES: Trade[] = [
  {
    id: 'tr-1',
    pair: 'XAUUSD',
    side: 'BUY',
    entry_price: 3765.20,
    sl_price: 3760.00,
    tp_price: 3780.00,
    lot: 0.50,
    timeframe: 'M5',
    session: 'London',
    reason: 'Liquidity sweep below Asian Low + Bullish CHoCH on M5 + FVG tap. Clean RR setup.',
    status: 'OPEN',
    profit_point: 100.0,
    profit_money: 50.0,
    rr_ratio: 2.85,
    screenshot_before: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    opened_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updates: [
      {
        id: 'up-1',
        trade_id: 'tr-1',
        update_type: 'ENTRY',
        message: 'Order Buy limit executed at 3765.20 following M5 confirmation candle.',
        current_price: 3765.20,
        floating_points: 0,
        floating_money: 0,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'up-2',
        trade_id: 'tr-1',
        update_type: 'PROGRESS',
        message: '🚀 Running update: Price reached 3766.20 (+100 point). Strong bullish momentum.',
        current_price: 3766.20,
        floating_points: 100.0,
        floating_money: 50.0,
        created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        id: 'up-3',
        trade_id: 'tr-1',
        update_type: 'SL_TO_BE',
        message: '🛡️ Stop Loss moved to Break Even (3765.20). Trade is now completely risk-free.',
        current_price: 3768.50,
        floating_points: 330.0,
        floating_money: 165.0,
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      }
    ]
  },
  {
    id: 'tr-2',
    pair: 'XAUUSD',
    side: 'SELL',
    entry_price: 3778.40,
    sl_price: 3783.00,
    tp_price: 3762.00,
    exit_price: 3762.00,
    lot: 0.80,
    timeframe: 'M15',
    session: 'New York',
    reason: 'NY Session High sweep + Bearish Engulfing reject key daily resistance zone.',
    status: 'CLOSED_TP',
    profit_point: 164.0,
    profit_money: 1312.0,
    rr_ratio: 3.56,
    screenshot_before: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    opened_at: new Date(Date.now() - 86400000).toISOString(),
    closed_at: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    updates: [
      {
        id: 'up-4',
        trade_id: 'tr-2',
        update_type: 'ENTRY',
        message: 'Sell market order filled at 3778.40 right after NY open volatility push.',
        current_price: 3778.40,
        floating_points: 0,
        floating_money: 0,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'up-5',
        trade_id: 'tr-2',
        update_type: 'PROGRESS',
        message: 'Running +100 points, breaking through internal structure support.',
        current_price: 3768.40,
        floating_points: 100.0,
        floating_money: 800.0,
        created_at: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      },
      {
        id: 'up-6',
        trade_id: 'tr-2',
        update_type: 'EXIT',
        message: '🎯 TAKE PROFIT HIT! Exit price 3762.00 (+164 points). Target liquidity captured cleanly.',
        current_price: 3762.00,
        floating_points: 164.0,
        floating_money: 1312.0,
        created_at: new Date(Date.now() - 86400000 + 7200000).toISOString(),
      }
    ]
  },
  {
    id: 'tr-3',
    pair: 'EURUSD',
    side: 'BUY',
    entry_price: 1.08450,
    sl_price: 1.08320,
    tp_price: 1.08850,
    exit_price: 1.08320,
    lot: 1.00,
    timeframe: 'M5',
    session: 'London',
    reason: 'London expansion retest of M5 demand block. Early invalidation.',
    status: 'CLOSED_SL',
    profit_point: -13.0,
    profit_money: -130.0,
    rr_ratio: 3.08,
    opened_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    closed_at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    updates: [
      {
        id: 'up-7',
        trade_id: 'tr-3',
        update_type: 'ENTRY',
        message: 'Buy limit triggered at 1.08450.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'up-8',
        trade_id: 'tr-3',
        update_type: 'EXIT',
        message: '🛑 STOP LOSS HIT (-13 pips). Plan respected, no revenge trade.',
        current_price: 1.08320,
        floating_points: -13.0,
        floating_money: -130.0,
        created_at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
      }
    ]
  },
  {
    id: 'tr-4',
    pair: 'XAUUSD',
    side: 'BUY',
    entry_price: 3740.10,
    sl_price: 3734.00,
    tp_price: 3758.00,
    exit_price: 3758.00,
    lot: 0.60,
    timeframe: 'M5',
    session: 'Asian',
    reason: 'Tokyo range consolidation breakout with strong volume candle.',
    status: 'CLOSED_TP',
    profit_point: 179.0,
    profit_money: 1074.0,
    rr_ratio: 2.93,
    opened_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    closed_at: new Date(Date.now() - 86400000 * 3 + 10800000).toISOString(),
    updates: [
      {
        id: 'up-9',
        trade_id: 'tr-4',
        update_type: 'ENTRY',
        message: 'Buy execution at 3740.10.',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'up-10',
        trade_id: 'tr-4',
        update_type: 'EXIT',
        message: '🎯 Full TP Hit at 3758.00 (+179 points)! Excellent runner.',
        created_at: new Date(Date.now() - 86400000 * 3 + 10800000).toISOString(),
      }
    ]
  }
];

export class TradeStore {
  static getTrades(): Trade[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveTrades(INITIAL_TRADES);
      return INITIAL_TRADES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TRADES;
    }
  }

  static saveTrades(trades: Trade[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }

  static addTrade(data: Omit<Trade, 'id' | 'updates' | 'opened_at' | 'status' | 'profit_point' | 'profit_money'>): Trade {
    const trades = this.getTrades();
    const newId = `tr-${Date.now()}`;
    const openedAt = new Date().toISOString();

    const initialUpdate: TradeUpdate = {
      id: `up-${Date.now()}`,
      trade_id: newId,
      update_type: 'ENTRY',
      message: `Posisi ${data.side} dieksekusi di ${data.entry_price.toFixed(2)}. SL: ${data.sl_price.toFixed(2)} | TP: ${data.tp_price.toFixed(2)}`,
      current_price: data.entry_price,
      floating_points: 0,
      floating_money: 0,
      created_at: openedAt,
    };

    const newTrade: Trade = {
      ...data,
      id: newId,
      status: 'OPEN',
      profit_point: 0,
      profit_money: 0,
      opened_at: openedAt,
      updates: [initialUpdate],
    };

    trades.unshift(newTrade);
    this.saveTrades(trades);
    return newTrade;
  }

  static addUpdate(tradeId: string, update: Omit<TradeUpdate, 'id' | 'trade_id' | 'created_at'>): Trade | null {
    const trades = this.getTrades();
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return null;

    const newUpdate: TradeUpdate = {
      ...update,
      id: `up-${Date.now()}`,
      trade_id: tradeId,
      created_at: new Date().toISOString(),
    };

    if (update.floating_points !== undefined) {
      trade.profit_point = update.floating_points;
    }
    if (update.floating_money !== undefined) {
      trade.profit_money = update.floating_money;
    }

    trade.updates.push(newUpdate);
    this.saveTrades(trades);
    return trade;
  }

  static closeTrade(tradeId: string, exitPrice: number, status: TradeStatus, notes?: string): Trade | null {
    const trades = this.getTrades();
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return null;

    trade.status = status;
    trade.exit_price = exitPrice;
    trade.closed_at = new Date().toISOString();

    // Auto-calculate profit points based on side & instrument
    const isGold = trade.pair.toUpperCase().includes('XAU');
    const pointDiff = trade.side === 'BUY' 
      ? (exitPrice - trade.entry_price) 
      : (trade.entry_price - exitPrice);

    // For XAUUSD: 1 dollar move = 10 points (or 100 pips)
    trade.profit_point = isGold ? Number((pointDiff * 10).toFixed(1)) : Number((pointDiff * 10000).toFixed(1));
    
    // Profit money = points * lot * dollar per point
    trade.profit_money = isGold 
      ? Number((pointDiff * 100 * trade.lot).toFixed(2)) 
      : Number((pointDiff * 100000 * trade.lot).toFixed(2));

    const closeUpdate: TradeUpdate = {
      id: `up-${Date.now()}`,
      trade_id: tradeId,
      update_type: 'EXIT',
      message: `${status === 'CLOSED_TP' ? '🎯 TP HIT' : status === 'CLOSED_SL' ? '🛑 SL HIT' : '🔒 Trade Ditutup'}: Exit di ${exitPrice.toFixed(2)} (${trade.profit_point >= 0 ? '+' : ''}${trade.profit_point} point | ${trade.profit_money >= 0 ? '+$' : '-$'}${Math.abs(trade.profit_money)}). ${notes || ''}`,
      current_price: exitPrice,
      floating_points: trade.profit_point,
      floating_money: trade.profit_money,
      created_at: trade.closed_at,
    };

    trade.updates.push(closeUpdate);
    this.saveTrades(trades);
    return trade;
  }

  static deleteTrade(tradeId: string): void {
    const trades = this.getTrades().filter(t => t.id !== tradeId);
    this.saveTrades(trades);
  }

  static calculateStats(trades: Trade[]): DashboardStats {
    const closed = trades.filter(t => t.status !== 'OPEN');
    const totalTrades = trades.length;
    const wins = closed.filter(t => t.profit_money > 0);
    const losses = closed.filter(t => t.profit_money < 0);

    const winRate = closed.length > 0 ? Number(((wins.length / closed.length) * 100).toFixed(1)) : 0;
    const netProfitMoney = Number(closed.reduce((acc, curr) => acc + curr.profit_money, 0).toFixed(2));
    const netProfitPoints = Number(closed.reduce((acc, curr) => acc + curr.profit_point, 0).toFixed(1));
    const avgRR = trades.length > 0 ? Number((trades.reduce((acc, curr) => acc + curr.rr_ratio, 0) / trades.length).toFixed(2)) : 0;

    // Today's profit
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTrades = closed.filter(t => t.closed_at?.startsWith(todayStr));
    const profitToday = Number(todayTrades.reduce((acc, curr) => acc + curr.profit_money, 0).toFixed(2));

    return {
      totalTrades,
      winRate,
      winCount: wins.length,
      lossCount: losses.length,
      netProfitMoney,
      netProfitPoints,
      avgRR,
      profitToday,
      bestPair: 'XAUUSD',
      bestTimeframe: 'M5',
      bestSession: 'London',
    };
  }
}
