import React, { useState, useEffect } from 'react';
import { Plus, Calendar, LayoutDashboard, Radio } from 'lucide-react';


interface NavbarProps {
  activeTab: 'feed' | 'dashboard' | 'calendar';
  setActiveTab: (tab: 'feed' | 'dashboard' | 'calendar') => void;
  onOpenNewTrade: () => void;
  openTradesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTrade,
  openTradesCount,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#262626] bg-[#0B0B0B]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-[#F5B942]/20 border border-white/20">
              <img src="/logo.png" alt="Trading Journal Pro" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">TRADING JOURNAL</span>
                <span className="bg-[#F5B942]/20 text-[#F5B942] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F5B942]/30 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">XAUUSD & Forex Precision Journal</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#161616] p-1.5 rounded-2xl border border-[#262626]">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'feed'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Radio className="w-4 h-4 text-[#F5B942]" />
              <span>Trade Feed</span>
              {openTradesCount > 0 && (
                <span className="ml-1 bg-[#22C55E]/20 text-[#22C55E] text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {openTradesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Calendar</span>
            </button>
          </nav>

          {/* Actions & Live Clock */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">UTC TIME</span>
              <span className="text-xs font-mono font-medium text-zinc-200">{time || '00:00:00'}</span>
            </div>

            <button
              onClick={onOpenNewTrade}
              className="group flex items-center space-x-2 bg-gradient-to-r from-[#F5B942] to-[#E5A830] hover:from-[#f8c45e] hover:to-[#efa823] text-black font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-[#F5B942]/20 hover:shadow-[#F5B942]/30 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
              <span>+ New Trade</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
