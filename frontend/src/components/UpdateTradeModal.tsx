import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { Trade, TradeUpdate, UpdateType } from '../types/trade';

interface UpdateTradeModalProps {
  isOpen: boolean;
  trade: Trade | null;
  onClose: () => void;
  onSaveUpdate: (tradeId: string, update: Omit<TradeUpdate, 'id' | 'trade_id' | 'created_at'>) => void;
}

export const UpdateTradeModal: React.FC<UpdateTradeModalProps> = ({
  isOpen,
  trade,
  onClose,
  onSaveUpdate,
}) => {
  if (!isOpen || !trade) return null;

  const [updateType, setUpdateType] = useState<UpdateType>('PROGRESS');
  const [currentPrice, setCurrentPrice] = useState<string>(trade.entry_price.toString());
  const [floatingPoints, setFloatingPoints] = useState<string>('100.0');
  const [floatingMoney, setFloatingMoney] = useState<string>('50.0');
  const [message, setMessage] = useState<string>('🚀 Running update: Posisi running +100 point. Momentum kuat.');

  const applyPreset = (type: UpdateType, defaultMsg: string, defaultPts?: number) => {
    setUpdateType(type);
    setMessage(defaultMsg);
    if (defaultPts !== undefined) {
      setFloatingPoints(defaultPts.toString());
      // Estimate USD for gold: points * 10 * lot or points * lot
      const estDollar = (defaultPts * trade.lot).toFixed(1);
      setFloatingMoney(estDollar);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSaveUpdate(trade.id, {
      update_type: updateType,
      message: message.trim(),
      current_price: parseFloat(currentPrice) || undefined,
      floating_points: parseFloat(floatingPoints) || undefined,
      floating_money: parseFloat(floatingMoney) || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161616] border border-[#262626] rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#262626] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">Tambah Update Live Timeline</h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              {trade.side} {trade.pair} @ {trade.entry_price} ({trade.lot} Lot)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5 sm:mb-2">Pilih Quick Milestone:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('PROGRESS', '🚀 Running update: Trade running +50 point.', 50)}
                className="text-left p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#F5B942]/50 hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                🚀 +50 Point Milestone
              </button>

              <button
                type="button"
                onClick={() => applyPreset('PROGRESS', '🚀 Running update: Trade sudah +100 point! RR meningkat.', 100)}
                className="text-left p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#F5B942]/50 hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                🚀 +100 Point Milestone
              </button>

              <button
                type="button"
                onClick={() => applyPreset('SL_TO_BE', `🛡️ Stop Loss sudah dipindahkan ke Break Even (${trade.entry_price}). Posisi bebas risiko.`, 80)}
                className="text-left p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-blue-300 transition-all cursor-pointer"
              >
                🛡️ SL to Break Even (BE)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('PARTIAL_TP', '💰 Ambil partial profit 50% lot, sisa posisi dibiarkan runner ke target final.', 120)}
                className="text-left p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
              >
                💰 Take Partial Profit
              </button>
            </div>
          </div>

          {/* Metrics (Price, Points, Profit) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div>
              <label className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 block mb-1">Harga Saat Ini</label>
              <input
                type="number"
                step="any"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-bold text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 block mb-1">Points</label>
              <input
                type="number"
                step="any"
                value={floatingPoints}
                onChange={(e) => setFloatingPoints(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 block mb-1">Floating ($)</label>
              <input
                type="number"
                step="any"
                value={floatingMoney}
                onChange={(e) => setFloatingMoney(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Timeline Message Log */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Pesan Log Perjalanan</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contoh: Running +100 point, struktur M5 masih bullish kuat..."
              className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl p-3 text-xs sm:text-sm text-zinc-100 focus:outline-none"
              required
            />
          </div>

          </div>

          {/* Sticky Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[#262626] bg-[#161616] flex items-center justify-end space-x-2.5 sm:space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#F5B942] hover:bg-[#efa823] text-black active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Update</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
