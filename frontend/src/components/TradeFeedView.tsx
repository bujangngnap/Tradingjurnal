import React, { useState } from 'react';
import type { Trade } from '../types/trade';
import { TradeCard } from './TradeCard';
import { Filter, Sparkles, TrendingUp } from 'lucide-react';

interface TradeFeedViewProps {
  trades: Trade[];
  onAddUpdate: (trade: Trade) => void;
  onCloseTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onViewImage: (url: string) => void;
  onOpenNewTrade: () => void;
}

export const TradeFeedView: React.FC<TradeFeedViewProps> = ({
  trades,
  onAddUpdate,
  onCloseTrade,
  onDeleteTrade,
  onViewImage,
  onOpenNewTrade,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'WIN' | 'LOSS'>('ALL');
  const [pairFilter, setPairFilter] = useState<string>('ALL');

  const filteredTrades = trades.filter((trade) => {
    // Status filter
    if (statusFilter === 'OPEN' && trade.status !== 'OPEN') return false;
    if (statusFilter === 'WIN' && trade.profit_money <= 0) return false;
    if (statusFilter === 'LOSS' && (trade.status === 'OPEN' || trade.profit_money >= 0)) return false;

    // Pair filter
    if (pairFilter !== 'ALL' && trade.pair !== pairFilter) return false;

    return true;
  });

  const uniquePairs = Array.from(new Set(trades.map(t => t.pair)));

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Filter Bar */}
      <div className="bg-[#161616] p-4 sm:p-5 rounded-3xl border border-[#262626] flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            Semua ({trades.length})
          </button>

          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-amber-400/90 hover:text-amber-300 bg-amber-400/10 border border-amber-400/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Running ({trades.filter(t => t.status === 'OPEN').length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('WIN')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'WIN'
                ? 'bg-[#22C55E] text-black shadow-md'
                : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
            }`}
          >
            Win ({trades.filter(t => t.profit_money > 0).length})
          </button>

          <button
            onClick={() => setStatusFilter('LOSS')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'LOSS'
                ? 'bg-[#EF4444] text-white shadow-md'
                : 'text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20'
            }`}
          >
            Loss ({trades.filter(t => t.status !== 'OPEN' && t.profit_money < 0).length})
          </button>
        </div>

        {/* Pair Filter Dropdown / Chips */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={pairFilter}
            onChange={(e) => setPairFilter(e.target.value)}
            className="bg-[#1C1C1C] border border-[#262626] rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Pair</option>
            {uniquePairs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Feed List */}
      {filteredTrades.length > 0 ? (
        <div className="space-y-6">
          {filteredTrades.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onAddUpdate={onAddUpdate}
              onCloseTrade={onCloseTrade}
              onDeleteTrade={onDeleteTrade}
              onViewImage={onViewImage}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#161616] rounded-3xl border border-[#262626] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-[#F5B942]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Belum Ada Trade di Kategori Ini</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Catat setup trading Anda sekarang untuk mulai melihat timeline perjalanan trade seperti media sosial.
            </p>
          </div>
          <button
            onClick={onOpenNewTrade}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#F5B942] to-[#E5A830] text-black font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-[#F5B942]/20 cursor-pointer active:scale-95 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>+ Buka Posisi Trade Baru</span>
          </button>
        </div>
      )}

    </div>
  );
};
