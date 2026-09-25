import React, { useEffect, useRef, useState } from 'react';
import { Flame, ShieldAlert, Globe, ExternalLink, Filter, Info, Bell, CheckCircle2 } from 'lucide-react';

export const NewsCalendarView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [importance, setImportance] = useState<'high' | 'high_medium' | 'all'>('high_medium');
  const [currencyGroup, setCurrencyGroup] = useState<'major' | 'usd_only' | 'all'>('major');
  const [locale, setLocale] = useState<'id' | 'en'>('id');

  // Map importance filter for TradingView widget:
  // -1: low, 0: medium, 1: high
  const getImportanceFilter = () => {
    if (importance === 'high') return '1';
    if (importance === 'high_medium') return '0,1';
    return '-1,0,1';
  };

  const getCurrencyFilter = () => {
    if (currencyGroup === 'usd_only') return 'USD';
    if (currencyGroup === 'major') return 'USD,EUR,GBP,JPY,AUD,CAD,CHF';
    return undefined;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget script & iframe
    containerRef.current.innerHTML = '';

    // Create wrapper div required by TradingView
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = '100%';

    const widgetInner = document.createElement('div');
    widgetInner.className = 'tradingview-widget-container__widget';
    widgetInner.style.width = '100%';
    widgetInner.style.height = '100%';
    widgetContainer.appendChild(widgetInner);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;

    const widgetConfig: Record<string, any> = {
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '650',
      locale: locale,
      importanceFilter: getImportanceFilter(),
    };

    const currencyFilter = getCurrencyFilter();
    if (currencyFilter) {
      widgetConfig.currencyFilter = currencyFilter;
    }

    script.innerHTML = JSON.stringify(widgetConfig);
    widgetContainer.appendChild(script);

    containerRef.current.appendChild(widgetContainer);
  }, [importance, currencyGroup, locale]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#141414] p-5 sm:p-7 rounded-3xl border border-[#262626] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5B942]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5B942] shrink-0 mt-0.5">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Kalender Berita Ekonomi
                </h2>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>Real-Time</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Pantau rilis data makroekonomi global (NFP, CPI, FOMC, Suku Bunga) persis seperti di Investing.com untuk antisipasi lonjakan volatilitas dan spread.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
            <a
              href="https://id.investing.com/economic-calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#333333] transition-all cursor-pointer shadow-sm"
            >
              <span>Buka di Investing.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* SMC Trader's Rule & Gold Cheat-sheet */}
        <div className="mt-6 pt-5 border-t border-[#222222] grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2E2E2E] flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-200 block mb-0.5">Aturan Disiplin Waktu</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Hindari entry baru <strong className="text-amber-400">15 menit sebelum & sesudah</strong> berita bintang 3 (High Impact) karena spread melebar & rawan slippage.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2E2E2E] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-200 block mb-0.5">Banteng Hijau (Actual &gt; Forecast)</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Data USD menguat (Bullish USD). Emas (<strong className="text-emerald-400">XAUUSD</strong>) berpotensi mengalami tekanan turun (Bearish dump).
              </p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2E2E2E] flex items-start space-x-3">
            <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-200 block mb-0.5">Banteng Merah (Actual &lt; Forecast)</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Data USD melemah (Bearish USD). Emas (<strong className="text-rose-400">XAUUSD</strong>) berpotensi melonjak naik (Bullish pump).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#161616] p-3.5 sm:p-4 rounded-2xl border border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-[#F5B942]" />
            <span>Filter Dampak:</span>
          </div>

          <button
            onClick={() => setImportance('high')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              importance === 'high'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Hanya High Impact (3 Bintang)</span>
          </button>

          <button
            onClick={() => setImportance('high_medium')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              importance === 'high_medium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>High & Medium (Rekomendasi)</span>
          </button>

          <button
            onClick={() => setImportance('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              importance === 'all'
                ? 'bg-[#2A2A2A] text-white border border-zinc-600 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            Semua Level
          </button>
        </div>

        {/* Currency Filter & Language */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-[#1F1F1F] p-1 rounded-xl border border-[#303030]">
            <button
              onClick={() => setCurrencyGroup('usd_only')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                currencyGroup === 'usd_only'
                  ? 'bg-[#F5B942] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              USD / Gold
            </button>
            <button
              onClick={() => setCurrencyGroup('major')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                currencyGroup === 'major'
                  ? 'bg-[#F5B942] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Major FX
            </button>
          </div>

          <button
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            title="Ganti Bahasa Kalender"
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#1F1F1F] hover:bg-[#282828] text-zinc-300 rounded-xl border border-[#303030] transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#F5B942]" />
            <span className="uppercase font-bold text-[11px]">{locale}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Economic Calendar Card */}
      <div className="bg-[#121212] rounded-3xl border border-[#262626] p-4 sm:p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#F5B942]" />
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Live Feed Data Makroekonomi
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Waktu otomatis menyesuaikan timezone browser Anda
          </span>
        </div>

        {/* TradingView Widget Mount Container */}
        <div
          ref={containerRef}
          className="w-full min-h-[650px] overflow-hidden rounded-2xl bg-[#0F0F0F]"
        />
      </div>

    </div>
  );
};
