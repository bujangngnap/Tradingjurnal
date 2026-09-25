import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, CheckSquare } from 'lucide-react';
import type { Trade, TradeStatus } from '../types/trade';

interface CloseTradeModalProps {
  isOpen: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirmClose: (tradeId: string, exitPrice: number, status: TradeStatus, notes?: string) => void;
}

export const CloseTradeModal: React.FC<CloseTradeModalProps> = ({
  isOpen,
  trade,
  onClose,
  onConfirmClose,
}) => {
  if (!isOpen || !trade) return null;

  const [status, setStatus] = useState<TradeStatus>('CLOSED_TP');
  const [exitPrice, setExitPrice] = useState<string>(trade.tp_price.toString());
  const [notes, setNotes] = useState<string>('Disiplin sesuai trading plan SMC.');

  // Real-time calculation
  const [estPoints, setEstPoints] = useState<number>(0);
  const [estMoney, setEstMoney] = useState<number>(0);

  useEffect(() => {
    const exit = parseFloat(exitPrice);
    if (!exit) return;

    const isGold = trade.pair.toUpperCase().includes('XAU');
    const pointDiff = trade.side === 'BUY' ? (exit - trade.entry_price) : (trade.entry_price - exit);

    const pts = isGold ? Number((pointDiff * 10).toFixed(1)) : Number((pointDiff * 10000).toFixed(1));
    const money = isGold 
      ? Number((pointDiff * 100 * trade.lot).toFixed(2)) 
      : Number((pointDiff * 100000 * trade.lot).toFixed(2));

    setEstPoints(pts);
    setEstMoney(money);
  }, [exitPrice, trade]);

  const selectOutcome = (outcome: TradeStatus) => {
    setStatus(outcome);
    if (outcome === 'CLOSED_TP') {
      setExitPrice(trade.tp_price.toString());
      setNotes('🎯 Target tercapai! Take Profit tersentuh dengan sempurna.');
    } else if (outcome === 'CLOSED_SL') {
      setExitPrice(trade.sl_price.toString());
      setNotes('🛑 Stop Loss tersentuh. Risiko terkontrol, no revenge trade.');
    } else if (outcome === 'CLOSED_BE') {
      setExitPrice(trade.entry_price.toString());
      setNotes('🛡️ Ditutup di harga Break Even. Modal selamat.');
    } else {
      setNotes('Manual exit sebelum target karena ada tanda pembalikan arah.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exit = parseFloat(exitPrice);
    if (!exit) {
      alert('Mohon masukkan harga exit yang valid.');
      return;
    }

    onConfirmClose(trade.id, exit, status, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161616] border border-[#262626] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">Tutup Posisi Trade</h3>
            <p className="text-xs text-zinc-400">
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Outcome Buttons */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">Pilih Hasil Penutupan:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectOutcome('CLOSED_TP')}
                className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'CLOSED_TP'
                    ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>🎯 TP Hit (Win)</span>
              </button>

              <button
                type="button"
                onClick={() => selectOutcome('CLOSED_SL')}
                className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'CLOSED_SL'
                    ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <XCircle className="w-4 h-4 text-[#EF4444]" />
                <span>🛑 SL Hit (Loss)</span>
              </button>

              <button
                type="button"
                onClick={() => selectOutcome('CLOSED_BE')}
                className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'CLOSED_BE'
                    ? 'bg-zinc-700/60 text-zinc-200 border-zinc-500'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-zinc-300" />
                <span>🛡️ Break Even</span>
              </button>

              <button
                type="button"
                onClick={() => selectOutcome('CLOSED_MANUAL')}
                className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'CLOSED_MANUAL'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Manual Exit</span>
              </button>
            </div>
          </div>

          {/* Exit Price */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Harga Exit Final</label>
            <input
              type="number"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none"
              required
            />
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block">Kalkulasi Net PnL:</span>
              <span className={`text-xl font-extrabold font-mono ${
                estMoney > 0 ? 'text-[#22C55E]' : estMoney < 0 ? 'text-[#EF4444]' : 'text-zinc-300'
              }`}>
                {estMoney >= 0 ? `+$${estMoney.toFixed(2)}` : `-$${Math.abs(estMoney).toFixed(2)}`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-400 block">Jarak PnL Points:</span>
              <span className="text-base font-mono font-bold text-zinc-200">
                {estPoints >= 0 ? `+${estPoints}` : estPoints} pts
              </span>
            </div>
          </div>

          {/* Evaluation / Notes */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Catatan Evaluasi Penutupan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl p-3 text-xs text-zinc-100 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#262626] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#22C55E] hover:bg-[#1fb355] text-black active:scale-95 transition-all cursor-pointer"
            >
              Konfirmasi Selesai & Tutup
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
