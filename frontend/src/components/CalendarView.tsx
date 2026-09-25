import React, { useState } from 'react';
import type { Trade } from '../types/trade';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  trades: Trade[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: Trade[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map trades by day string "YYYY-MM-DD"
  const tradesByDate: Record<string, Trade[]> = {};
  trades.forEach(t => {
    const dateStr = (t.closed_at || t.opened_at).slice(0, 10);
    if (!tradesByDate[dateStr]) tradesByDate[dateStr] = [];
    tradesByDate[dateStr].push(t);
  });

  return (
    <div className="space-y-6">
      
      {/* Calendar Header */}
      <div className="bg-[#161616] p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#262626] flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-extrabold text-white">
              {monthNames[month]} {year}
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 hidden xs:block">Heatmap P&L Harian (Hijau Win / Merah Loss)</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[11px] sm:text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            Bulan Ini
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#161616] p-2.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#262626] shadow-xl overflow-hidden">
        
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 sm:mb-2 text-center">
          {daysOfWeek.map((day, idx) => (
            <div 
              key={day} 
              className={`py-1 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty slots for previous month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-28 rounded-lg sm:rounded-2xl bg-zinc-950/40 border border-zinc-900/40 opacity-30" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTrades = tradesByDate[dayStr] || [];
            
            const closedDayTrades = dayTrades.filter(t => t.status !== 'OPEN');
            const totalPnL = closedDayTrades.reduce((acc, curr) => acc + curr.profit_money, 0);
            const hasTrades = dayTrades.length > 0;
            const isWinDay = hasTrades && totalPnL > 0;
            const isLossDay = hasTrades && totalPnL < 0;

            return (
              <div
                key={dayStr}
                onClick={() => hasTrades && setSelectedDayTrades({ date: dayStr, trades: dayTrades })}
                className={`h-16 sm:h-28 rounded-lg sm:rounded-2xl p-1 sm:p-2.5 flex flex-col justify-between border transition-all ${
                  hasTrades ? 'cursor-pointer hover:scale-102 hover:shadow-lg' : 'cursor-default'
                } ${
                  isWinDay
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/30 hover:border-[#22C55E]'
                    : isLossDay
                    ? 'bg-[#EF4444]/10 border-[#EF4444]/30 hover:border-[#EF4444]'
                    : hasTrades
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-[#121212] border-[#222222] hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] sm:text-xs font-mono font-bold ${
                    hasTrades ? 'text-white' : 'text-zinc-500'
                  }`}>
                    {dayNum}
                  </span>
                  {hasTrades && (
                    <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-black/40 text-zinc-300">
                      {dayTrades.length}<span className="hidden sm:inline"> trade</span>
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div className="mt-auto">
                    <div className={`font-mono font-extrabold text-[9px] sm:text-sm tracking-tighter sm:tracking-tight ${
                      isWinDay ? 'text-[#22C55E]' : isLossDay ? 'text-[#EF4444]' : 'text-amber-400'
                    }`}>
                      {totalPnL >= 0 ? `+$${totalPnL.toFixed(0)}` : `-$${Math.abs(totalPnL).toFixed(0)}`}
                    </div>
                    <div className="hidden sm:block text-[9px] sm:text-[10px] text-zinc-400 truncate mt-0.5">
                      {dayTrades.map(t => t.pair).join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto text-[9px] text-zinc-700 font-mono hidden sm:block">No trade</div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Day Drawer / Modal */}
      {selectedDayTrades && (
        <div className="bg-[#161616] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#262626] shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#262626]">
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                Daftar Trade: {selectedDayTrades.date}
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                {selectedDayTrades.trades.length} posisi tercatat
              </p>
            </div>
            <button
              onClick={() => setSelectedDayTrades(null)}
              className="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 mt-3 sm:mt-4">
            {selectedDayTrades.trades.map(t => (
              <div key={t.id} className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#1C1C1C] border border-[#262626] flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded ${
                      t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {t.side}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-white font-mono">{t.pair}</span>
                    <span className="text-[11px] sm:text-xs text-zinc-400 font-mono">{t.lot} Lot</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 line-clamp-1">{t.reason}</p>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-extrabold text-xs sm:text-sm ${
                    t.profit_money >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {t.profit_money >= 0 ? `+$${t.profit_money}` : `-$${Math.abs(t.profit_money)}`}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-zinc-500">
                    RR 1:{t.rr_ratio}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
