import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TradeFeedView } from './components/TradeFeedView';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { AddTradeModal } from './components/AddTradeModal';
import { UpdateTradeModal } from './components/UpdateTradeModal';
import { CloseTradeModal } from './components/CloseTradeModal';
import { ImageModal } from './components/ImageModal';
import { TradeStore } from './services/tradeStore';
import { ApiService } from './services/api';
import type { Trade, TradeUpdate, TradeStatus } from './types/trade';
import { Zap, Database } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'dashboard' | 'calendar'>('feed');
  const [trades, setTrades] = useState<Trade[]>(() => TradeStore.getTrades());
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [updatingTrade, setUpdatingTrade] = useState<Trade | null>(null);
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Load trades from API or fallback to TradeStore
  const loadTrades = async () => {
    try {
      const apiTrades = await ApiService.getTrades();
      if (apiTrades && apiTrades.length > 0) {
        setTrades(apiTrades);
        setIsBackendConnected(true);
        return;
      }
    } catch (e) {
      console.warn('Backend API not responding, using local offline storage:', e);
    }
    // Fallback to local store
    setTrades(TradeStore.getTrades());
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const stats = TradeStore.calculateStats(trades);
  const openTradesCount = trades.filter(t => t.status === 'OPEN').length;

  const handleSaveNewTrade = async (tradeData: Omit<Trade, 'id' | 'updates' | 'opened_at' | 'status' | 'profit_point' | 'profit_money'>) => {
    try {
      if (isBackendConnected) {
        await ApiService.createTrade(tradeData);
        await loadTrades();
        setActiveTab('feed');
        return;
      }
    } catch (e) {
      console.error('API create failed, saving to local store:', e);
    }
    TradeStore.addTrade(tradeData);
    setTrades(TradeStore.getTrades());
    setActiveTab('feed');
  };

  const handleSaveUpdate = async (tradeId: string, update: Omit<TradeUpdate, 'id' | 'trade_id' | 'created_at'>) => {
    try {
      if (isBackendConnected) {
        await ApiService.addUpdate(tradeId, update);
        await loadTrades();
        return;
      }
    } catch (e) {
      console.error('API update failed, saving locally:', e);
    }
    TradeStore.addUpdate(tradeId, update);
    setTrades(TradeStore.getTrades());
  };

  const handleConfirmClose = async (tradeId: string, exitPrice: number, status: TradeStatus, notes?: string) => {
    try {
      if (isBackendConnected) {
        await ApiService.closeTrade(tradeId, exitPrice, status, notes);
        await loadTrades();
        return;
      }
    } catch (e) {
      console.error('API close failed, closing locally:', e);
    }
    TradeStore.closeTrade(tradeId, exitPrice, status, notes);
    setTrades(TradeStore.getTrades());
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus trade ini dari jurnal?')) {
      try {
        if (isBackendConnected) {
          await ApiService.deleteTrade(tradeId);
          await loadTrades();
          return;
        }
      } catch (e) {
        console.error('API delete failed, deleting locally:', e);
      }
      TradeStore.deleteTrade(tradeId);
      setTrades(TradeStore.getTrades());
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0B0B] text-zinc-100 flex flex-col font-sans selection:bg-[#F5B942]/30 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTrade={() => setIsAddModalOpen(true)}
        openTradesCount={openTradesCount}
      />

      {/* Global Market Ticker Bar */}
      <div className="w-full max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#111111] border-b border-[#222222] py-1.5 sm:py-2 px-3 sm:px-8 text-xs shrink-0">
        <div className="inline-flex items-center justify-between gap-4 sm:gap-6 whitespace-nowrap min-w-full">
          <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-[#F5B942]">XAUUSD</strong>
              <span className="text-zinc-200">3,766.20</span>
              <span className="text-emerald-400 font-bold">+1.24%</span>
            </span>

            <span className="flex items-center space-x-1.5 text-zinc-400">
              <strong className="text-white">EURUSD</strong>
              <span>1.08450</span>
              <span className="text-emerald-400">+0.18%</span>
            </span>

            <span className="flex items-center space-x-1.5 text-zinc-400">
              <strong className="text-white">GBPUSD</strong>
              <span>1.29520</span>
              <span className="text-red-400">-0.05%</span>
            </span>

            <span className="hidden md:flex items-center space-x-1.5 text-zinc-400">
              <strong className="text-white">US30</strong>
              <span>42,120</span>
              <span className="text-emerald-400">+0.45%</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] shrink-0">
            {isBackendConnected ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                <Database className="w-3 h-3" />
                <span>Laravel 11 API</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                <Database className="w-3 h-3" />
                <span>Local Storage</span>
              </span>
            )}
            
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              <Zap className="w-3 h-3" />
              <span>London Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8 min-w-0">
        {activeTab === 'feed' && (
          <TradeFeedView
            trades={trades}
            onAddUpdate={(trade) => setUpdatingTrade(trade)}
            onCloseTrade={(trade) => setClosingTrade(trade)}
            onDeleteTrade={handleDeleteTrade}
            onViewImage={(url) => setPreviewImageUrl(url)}
            onOpenNewTrade={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView trades={trades} stats={stats} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView trades={trades} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] bg-[#0E0E0E] py-6 px-4 text-center text-xs text-zinc-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-wider">TRADING JOURNAL PRO</span>
            <span>v1.0 (MVP)</span>
          </div>
          <p className="text-zinc-500">
            Dibuat untuk trader berdisiplin tinggi • Siap integrasi MT5 & AI Trading Coach
          </p>
          <div className="flex items-center space-x-4 text-zinc-400">
            <span>Linear Aesthetic</span>
            <span>•</span>
            <span>Strict SMC Rules</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddTradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewTrade}
      />

      <UpdateTradeModal
        isOpen={!!updatingTrade}
        trade={updatingTrade}
        onClose={() => setUpdatingTrade(null)}
        onSaveUpdate={handleSaveUpdate}
      />

      <CloseTradeModal
        isOpen={!!closingTrade}
        trade={closingTrade}
        onClose={() => setClosingTrade(null)}
        onConfirmClose={handleConfirmClose}
      />

      <ImageModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

    </div>
  );
}

export default App;
