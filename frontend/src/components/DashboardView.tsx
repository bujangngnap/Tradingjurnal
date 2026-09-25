import React from 'react';
import type { Trade, DashboardStats } from '../types/trade';
import { 
  Award, 
  Target, 
  DollarSign, 
  Clock, 
  Flame, 
  BarChart3, 
  Compass 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';


interface DashboardViewProps {
  trades: Trade[];
  stats: DashboardStats;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ trades, stats }) => {
  // Generate Equity Growth Data
  let cumulativeProfit = 10000; // default starting balance
  const equityData = [
    { name: 'Start', equity: cumulativeProfit, profit: 0 }
  ];

  const closedTradesChronological = [...trades]
    .filter(t => t.status !== 'OPEN')
    .sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());

  closedTradesChronological.forEach((trade, idx) => {
    cumulativeProfit += trade.profit_money;
    equityData.push({
      name: `T#${idx + 1} (${trade.pair})`,
      equity: Number(cumulativeProfit.toFixed(2)),
      profit: trade.profit_money,
    });
  });

  // Session Statistics
  const sessions = ['London', 'New York', 'Asian'] as const;
  const sessionStats = sessions.map(sess => {
    const sessTrades = trades.filter(t => t.session === sess && t.status !== 'OPEN');
    const wins = sessTrades.filter(t => t.profit_money > 0).length;
    const rate = sessTrades.length > 0 ? ((wins / sessTrades.length) * 100).toFixed(0) : '0';
    const profit = sessTrades.reduce((acc, curr) => acc + curr.profit_money, 0);
    return {
      session: sess,
      trades: sessTrades.length,
      winRate: rate,
      profit: Number(profit.toFixed(2)),
    };
  });

  // Timeframe Statistics
  const tfMap: Record<string, { count: number; wins: number; profit: number }> = {};
  trades.forEach(t => {
    if (!tfMap[t.timeframe]) tfMap[t.timeframe] = { count: 0, wins: 0, profit: 0 };
    tfMap[t.timeframe].count++;
    if (t.status !== 'OPEN' && t.profit_money > 0) tfMap[t.timeframe].wins++;
    if (t.status !== 'OPEN') tfMap[t.timeframe].profit += t.profit_money;
  });

  const timeframeData = Object.entries(tfMap).map(([tf, data]) => ({
    timeframe: tf,
    count: data.count,
    winRate: data.count > 0 ? ((data.wins / data.count) * 100).toFixed(0) : '0',
    profit: Number(data.profit.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      
      {/* 5 High-Impact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Trades */}
        <div className="bg-[#161616] p-4 sm:p-5 rounded-3xl border border-[#262626] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Trade</span>
            <Target className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.totalTrades}</div>
          <div className="mt-1 flex items-center space-x-2 text-[11px] text-zinc-400">
            <span className="text-emerald-400 font-bold">{stats.winCount} W</span>
            <span>•</span>
            <span className="text-red-400 font-bold">{stats.lossCount} L</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#161616] p-4 sm:p-5 rounded-3xl border border-[#262626] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Win Rate</span>
            <Award className="w-4 h-4 text-[#F5B942]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#F5B942] font-mono">
            {stats.winRate}%
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            Target SMC: &gt;60%
          </div>
        </div>

        {/* Net Profit ($) */}
        <div className="bg-[#161616] p-4 sm:p-5 rounded-3xl border border-[#262626] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Net Profit ($)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${
            stats.netProfitMoney >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
          }`}>
            {stats.netProfitMoney >= 0 ? `+$${stats.netProfitMoney.toLocaleString()}` : `-$${Math.abs(stats.netProfitMoney).toLocaleString()}`}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono">
            {stats.netProfitPoints >= 0 ? `+${stats.netProfitPoints}` : stats.netProfitPoints} total pts
          </div>
        </div>

        {/* Average RR */}
        <div className="bg-[#161616] p-4 sm:p-5 rounded-3xl border border-[#262626] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Average RR</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            1:{stats.avgRR}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-semibold">
            Risk Asymmetric OK
          </div>
        </div>

        {/* Profit Hari Ini */}
        <div className="col-span-2 lg:col-span-1 bg-[#161616] p-4 sm:p-5 rounded-3xl border border-[#262626] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Profit Hari Ini</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${
            stats.profitToday >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
          }`}>
            {stats.profitToday >= 0 ? `+$${stats.profitToday.toLocaleString()}` : `-$${Math.abs(stats.profitToday).toLocaleString()}`}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            Realized 24h
          </div>
        </div>

      </div>

      {/* Main Chart: Equity Growth Curve */}
      <div className="bg-[#161616] p-5 sm:p-6 rounded-3xl border border-[#262626] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">Equity Growth Curve</h3>
            <p className="text-xs text-zinc-400">Pertumbuhan saldo akun berbasis trade histori kumulatif</p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span className="text-zinc-300 font-semibold">Simulated Equity: ${equityData[equityData.length - 1]?.equity.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="#52525b" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={11} 
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderColor: '#3f3f46', 
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Equity']}
              />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#22C55E" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#equityGlow)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Grid: Sessions & Timeframes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Session Performance */}
        <div className="bg-[#161616] p-5 sm:p-6 rounded-3xl border border-[#262626]">
          <div className="flex items-center space-x-2 mb-4">
            <Compass className="w-4 h-4 text-[#F5B942]" />
            <h4 className="font-extrabold text-sm sm:text-base text-white">Performa Sesi Trading</h4>
          </div>

          <div className="space-y-3">
            {sessionStats.map(s => (
              <div key={s.session} className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-[#262626] flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-zinc-100 block">{s.session} Session</span>
                  <span className="text-xs text-zinc-400">{s.trades} trades dieksekusi</span>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-[#F5B942] font-mono font-bold mr-2">
                    {s.winRate}% WR
                  </span>
                  <span className={`font-mono font-bold text-sm ${s.profit >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {s.profit >= 0 ? `+$${s.profit}` : `-$${Math.abs(s.profit)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeframe Performance */}
        <div className="bg-[#161616] p-5 sm:p-6 rounded-3xl border border-[#262626]">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-extrabold text-sm sm:text-base text-white">Breakdown Timeframe Entry</h4>
          </div>

          <div className="space-y-3">
            {timeframeData.map(tf => (
              <div key={tf.timeframe} className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-[#262626] flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-zinc-100 block">{tf.timeframe} Setup</span>
                  <span className="text-xs text-zinc-400">{tf.count} entries</span>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-emerald-400 font-mono font-bold mr-2">
                    {tf.winRate}% WR
                  </span>
                  <span className={`font-mono font-bold text-sm ${tf.profit >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {tf.profit >= 0 ? `+$${tf.profit}` : `-$${Math.abs(tf.profit)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
