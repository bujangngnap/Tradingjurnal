import React from 'react';
import type { Trade, TradeUpdate } from '../types/trade';
import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, CheckCircle2, XCircle, AlertCircle, PlusCircle, CheckSquare, Trash2, Camera } from 'lucide-react';

interface TradeCardProps {
  trade: Trade;
  onAddUpdate: (trade: Trade) => void;
  onCloseTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onViewImage: (url: string) => void;
}

export const TradeCard: React.FC<TradeCardProps> = ({
  trade,
  onAddUpdate,
  onCloseTrade,
  onDeleteTrade,
  onViewImage,
}) => {
  const isBuy = trade.side === 'BUY';
  const isOpen = trade.status === 'OPEN';
  const isWin = trade.status === 'CLOSED_TP' || trade.profit_money > 0;


  const getStatusBadge = () => {
    switch (trade.status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>RUNNING</span>
          </span>
        );
      case 'CLOSED_TP':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TP HIT (WIN)</span>
          </span>
        );
      case 'CLOSED_SL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>SL HIT (LOSS)</span>
          </span>
        );
      case 'CLOSED_BE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>BREAK EVEN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>MANUAL CLOSED</span>
          </span>
        );
    }
  };

  const getUpdateIcon = (type: TradeUpdate['update_type']) => {
    switch (type) {
      case 'ENTRY':
        return <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 ring-4 ring-[#161616]" />;
      case 'PROGRESS':
        return <div className="w-2.5 h-2.5 rounded-full bg-[#F5B942] ring-4 ring-[#161616]" />;
      case 'SL_TO_BE':
        return <div className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-[#161616]" />;
      case 'PARTIAL_TP':
        return <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#161616]" />;
      case 'EXIT':
        return isWin 
          ? <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-4 ring-[#161616]" />
          : <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-4 ring-[#161616]" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 ring-4 ring-[#161616]" />;
    }
  };

  return (
    <div className="bg-[#161616] rounded-3xl border border-[#262626] hover:border-zinc-700/80 transition-all p-5 sm:p-6 shadow-xl relative overflow-hidden group">
      
      {/* Side Glow Line */}
      <div 
        className={`absolute top-0 left-0 bottom-0 w-1.5 ${
          isBuy ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
        }`} 
      />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#262626]/80">
        
        <div className="flex items-center space-x-2.5">
          {/* Side Indicator */}
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase ${
            isBuy 
              ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' 
              : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
          }`}>
            {isBuy ? <ArrowUpRight className="w-4 h-4 stroke-[3]" /> : <ArrowDownRight className="w-4 h-4 stroke-[3]" />}
            <span>{trade.side}</span>
          </div>

          {/* Instrument Pair */}
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white mono-num">
            {trade.pair}
          </span>

          {/* Lot Size */}
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono font-medium">
            {trade.lot.toFixed(2)} Lot
          </span>

          {/* Timeframe & Session */}
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 font-medium">
            {trade.timeframe}
          </span>
          {trade.session && (
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400/90 border border-amber-500/20 font-medium">
              {trade.session} Session
            </span>
          )}
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center space-x-2">
          {getStatusBadge()}

          <button
            onClick={() => onDeleteTrade(trade.id)}
            title="Hapus Trade"
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Trade Specs Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
        <div className="bg-[#1C1C1C] p-3 rounded-2xl border border-[#262626]">
          <span className="text-zinc-400 text-[11px] block mb-0.5">Entry Price</span>
          <span className="font-mono font-bold text-sm text-zinc-100">{trade.entry_price.toFixed(2)}</span>
        </div>

        <div className="bg-[#1C1C1C] p-3 rounded-2xl border border-[#262626]">
          <span className="text-zinc-400 text-[11px] block mb-0.5">Stop Loss (SL)</span>
          <span className="font-mono font-bold text-sm text-red-400">{trade.sl_price.toFixed(2)}</span>
        </div>

        <div className="bg-[#1C1C1C] p-3 rounded-2xl border border-[#262626]">
          <span className="text-zinc-400 text-[11px] block mb-0.5">Take Profit (TP)</span>
          <span className="font-mono font-bold text-sm text-emerald-400">{trade.tp_price.toFixed(2)}</span>
        </div>

        <div className="bg-[#1C1C1C] p-3 rounded-2xl border border-[#262626]">
          <span className="text-zinc-400 text-[11px] block mb-0.5">Risk / Reward (RR)</span>
          <span className="font-mono font-bold text-sm text-[#F5B942]">
            1:{trade.rr_ratio.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Profit / Floating Display */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 mb-4">
        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Opened: {new Date(trade.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">
              {isOpen ? 'Floating:' : 'Realized PnL:'}
            </span>
            <span className={`text-base font-extrabold font-mono ${
              trade.profit_money > 0 
                ? 'text-[#22C55E]' 
                : trade.profit_money < 0 
                ? 'text-[#EF4444]' 
                : 'text-zinc-300'
            }`}>
              {trade.profit_money >= 0 ? `+$${trade.profit_money.toFixed(2)}` : `-$${Math.abs(trade.profit_money).toFixed(2)}`}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              ({trade.profit_point >= 0 ? `+${trade.profit_point}` : trade.profit_point} pts)
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Reason */}
      <div className="mb-5 bg-[#141414] p-3.5 rounded-2xl border border-[#222222]">
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-[#F5B942]" />
          <span>Reason / SMC Plan</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
          {trade.reason}
        </p>
      </div>

      {/* Screenshot Preview (if attached) */}
      {trade.screenshot_before && (
        <div className="mb-5">
          <div 
            onClick={() => onViewImage(trade.screenshot_before!)}
            className="relative h-44 rounded-2xl overflow-hidden border border-[#262626] cursor-pointer group/img"
          >
            <img 
              src={trade.screenshot_before} 
              alt="Trade Setup Chart"
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex items-end p-3">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                <Camera className="w-3.5 h-3.5 text-[#F5B942]" />
                <span>Klik untuk zoom screenshot chart</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Timeline (Discord / Social Stream Style) */}
      <div className="border-t border-[#262626] pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
          <span>Timeline Perjalanan Trade ({trade.updates.length} Updates)</span>
          <span className="text-[10px] text-zinc-400 font-mono lowercase">live log stream</span>
        </h4>

        <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
          {trade.updates.map((update) => (
            <div key={update.id} className="relative group/timeline">
              {/* Dot Icon */}
              <div className="absolute -left-5 top-1">
                {getUpdateIcon(update.update_type)}
              </div>

              {/* Update Content */}
              <div className="bg-[#121212] p-3 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span className="font-mono font-medium">
                    {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {update.floating_points !== undefined && update.floating_points !== 0 && (
                    <span className={`font-mono font-bold ${
                      update.floating_points > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {update.floating_points > 0 ? `+${update.floating_points}` : update.floating_points} pts
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-[13px] text-zinc-200">
                  {update.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 pt-4 border-t border-[#262626] flex items-center justify-between gap-3">
        {isOpen ? (
          <>
            <button
              onClick={() => onAddUpdate(trade)}
              className="flex-1 flex items-center justify-center space-x-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm border border-zinc-700 active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#F5B942]" />
              <span>+ Add Timeline Update</span>
            </button>

            <button
              onClick={() => onCloseTrade(trade)}
              className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm border border-emerald-500/30 active:scale-98 transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Close Position</span>
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Trade ini sudah selesai dicatat.</span>
            <span className="font-mono font-semibold text-zinc-300">
              Closed: {trade.closed_at ? new Date(trade.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
