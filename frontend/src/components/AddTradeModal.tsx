import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Clipboard, 
  Link2 
} from 'lucide-react';
import type { Trade, TradeSide } from '../types/trade';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tradeData: Omit<Trade, 'id' | 'updates' | 'opened_at' | 'status' | 'profit_point' | 'profit_money'>) => void;
}

const COMMON_PAIRS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'NAS100', 'US30', 'BTCUSD'];
const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];
const SESSIONS = ['London', 'New York', 'Asian'] as const;

const QUICK_TAGS = [
  'Liquidity Sweep',
  'Bullish BOS M5',
  'Bearish CHoCH',
  'FVG Retest',
  'Support M5',
  'Order Block M15',
  'Premium Zone Reject',
  'Discount Zone Tap'
];

export const AddTradeModal: React.FC<AddTradeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [pair, setPair] = useState('XAUUSD');
  const [side, setSide] = useState<TradeSide>('BUY');
  const [entryPrice, setEntryPrice] = useState<string>('3765.20');
  const [slPrice, setSlPrice] = useState<string>('3760.00');
  const [tpPrice, setTpPrice] = useState<string>('3780.00');
  const [lot, setLot] = useState<string>('0.50');
  const [timeframe, setTimeframe] = useState('M5');
  const [session, setSession] = useState<'London' | 'New York' | 'Asian'>('London');
  const [reason, setReason] = useState('Support M5 + Liquidity Sweep selesai, entry konfirmasi BOS M5.');
  
  // Screenshot states (Drag & drop, paste, or URL)
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'dropzone' | 'url'>('dropzone');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculated RR and metrics
  const [riskPoints, setRiskPoints] = useState<number>(0);
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [rrRatio, setRrRatio] = useState<number>(0);

  useEffect(() => {
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(slPrice) || 0;
    const tp = parseFloat(tpPrice) || 0;

    if (entry > 0 && sl > 0 && tp > 0) {
      const isGold = pair.toUpperCase().includes('XAU');
      const multiplier = isGold ? 10 : 10000;

      const riskDiff = Math.abs(entry - sl);
      const rewardDiff = Math.abs(tp - entry);

      const calculatedRiskPts = Number((riskDiff * multiplier).toFixed(1));
      const calculatedRewardPts = Number((rewardDiff * multiplier).toFixed(1));

      setRiskPoints(calculatedRiskPts);
      setRewardPoints(calculatedRewardPts);

      if (riskDiff > 0) {
        setRrRatio(Number((rewardDiff / riskDiff).toFixed(2)));
      } else {
        setRrRatio(0);
      }
    }
  }, [entryPrice, slPrice, tpPrice, pair]);

  // Handle image file selection
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setScreenshotData(e.target.result as string);
        setScreenshotName(file.name || 'screenshot.png');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard paste (Ctrl+V) handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(slPrice);
    const tp = parseFloat(tpPrice);
    const lotSize = parseFloat(lot);

    if (!entry || !sl || !tp || !lotSize) {
      alert('Mohon isi Entry, SL, TP, dan Lot dengan angka yang valid.');
      return;
    }

    onSave({
      pair: pair.toUpperCase(),
      side,
      entry_price: entry,
      sl_price: sl,
      tp_price: tp,
      lot: lotSize,
      timeframe,
      session,
      reason,
      rr_ratio: rrRatio,
      screenshot_before: screenshotData.trim() || undefined,
    });

    onClose();
  };

  const handleAppendTag = (tag: string) => {
    setReason(prev => prev ? `${prev} • ${tag}` : tag);
  };

  return (
    <div 
      onPaste={handlePaste}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-[#161616] border border-[#262626] rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#262626] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-[#F5B942]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Catat Posisi Trade Baru</h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">Log entry SMC & Drag & Drop Screenshot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* Pair & Side Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Instrumen / Pair</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="e.g. XAUUSD"
                className="flex-1 bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none uppercase"
                required
              />
              {/* Direction Toggle */}
              <div className="flex p-1 bg-[#1C1C1C] rounded-xl border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    side === 'BUY'
                      ? 'bg-[#22C55E] text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>BUY</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    side === 'SELL'
                      ? 'bg-[#EF4444] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>SELL</span>
                </button>
              </div>
            </div>

            {/* Quick Pair Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_PAIRS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPair(p)}
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    pair === p 
                      ? 'bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/40' 
                      : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Grid (Entry, SL, TP, Lot) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-red-400 block mb-1">Stop Loss (SL)</label>
              <input
                type="number"
                step="any"
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-red-500/30 focus:border-red-400 rounded-xl px-3 py-2 text-sm font-mono font-bold text-red-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-emerald-400 block mb-1">Take Profit (TP)</label>
              <input
                type="number"
                step="any"
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Lot Size</label>
              <input
                type="number"
                step="0.01"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Live Risk-Reward Visualizer Pill */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">Risk: <strong className="text-red-400 font-mono">{riskPoints} pts</strong></span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Reward: <strong className="text-emerald-400 font-mono">{rewardPoints} pts</strong></span>
            </div>
            <div>
              <span className="text-zinc-400 mr-1.5">R:R Ratio:</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/30 font-mono font-bold">
                1:{rrRatio || '0.00'}
              </span>
            </div>
          </div>

          {/* Timeframe & Session */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Timeframe Entry</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
              >
                {TIMEFRAMES.map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as any)}
                className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
              >
                {SESSIONS.map(s => (
                  <option key={s} value={s}>{s} Session</option>
                ))}
              </select>
            </div>
          </div>

          {/* SMC Reason & Strategy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">Alasan Entry (SMC / S&R)</label>
              <span className="text-[11px] text-zinc-400">Catat setup dengan disiplin</span>
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan eksekusi: BOS, Liquidity Grab, FVG tap, atau reaksi di Key Level..."
              className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl p-3 text-xs sm:text-sm text-zinc-100 focus:outline-none"
              required
            />

            {/* Quick SMC tag chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_TAGS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAppendTag(t)}
                  className="inline-flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-[#F5B942] hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <Tag className="w-2.5 h-2.5" />
                  <span>+{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SCREENSHOT ENTRY: DRAG & DROP + CLIPBOARD PASTE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-[#F5B942]" />
                <span>Screenshot Chart Entry</span>
              </label>

              {/* Mode Toggle */}
              <div className="flex items-center space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setUploadMode('dropzone')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    uploadMode === 'dropzone' ? 'bg-[#F5B942]/20 text-[#F5B942]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Drag & Drop / Paste
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    uploadMode === 'url' ? 'bg-[#F5B942]/20 text-[#F5B942]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {uploadMode === 'dropzone' ? (
              screenshotData ? (
                /* Image Preview Card */
                <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-black/40 group/preview">
                  <img 
                    src={screenshotData} 
                    alt="Preview Setup" 
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-end justify-between p-3">
                    <span className="text-xs font-mono text-zinc-200 truncate max-w-[240px]">
                      {screenshotName || 'Screenshot Chart'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setScreenshotData(''); setScreenshotName(''); }}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-[#F5B942] bg-[#F5B942]/10 scale-101' 
                      : 'border-zinc-700/80 hover:border-[#F5B942]/60 bg-zinc-900/50 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#F5B942]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">
                        Drag & Drop gambar chart ke sini, atau <span className="text-[#F5B942] underline">pilih file</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center justify-center space-x-1">
                        <Clipboard className="w-3 h-3" />
                        <span>Bisa langsung tekan <strong>Ctrl + V</strong> (Paste dari Snipping Tool)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* URL Input Mode */
              <div className="space-y-1">
                <div className="relative">
                  <Link2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={screenshotData}
                    onChange={(e) => setScreenshotData(e.target.value)}
                    placeholder="Paste TradingView image link atau upload image URL..."
                    className="w-full bg-[#1C1C1C] border border-[#262626] focus:border-[#F5B942] rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          </div>

          {/* Sticky Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[#262626] bg-[#161616] flex items-center justify-end space-x-2.5 sm:space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#F5B942] to-[#E5A830] hover:from-[#f8c45e] text-black shadow-lg shadow-[#F5B942]/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              Simpan & Buka Posisi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
