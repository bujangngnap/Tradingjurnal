import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TradeFeedView } from './components/TradeFeedView';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { NewsCalendarView } from './components/NewsCalendarView';
import { LiveMarketTicker } from './components/LiveMarketTicker';
import { AddTradeModal } from './components/AddTradeModal';
import { UpdateTradeModal } from './components/UpdateTradeModal';
import { CloseTradeModal } from './components/CloseTradeModal';
import { ImageModal } from './components/ImageModal';
import { AuthModal } from './components/AuthModal';
import { TradeStore } from './services/tradeStore';
import { ApiService } from './services/api';
import { AuthService } from './services/auth';
import type { Trade, TradeUpdate, TradeStatus } from './types/trade';
import type { User } from './types/auth';
import { Zap, Database, Lock, ShieldCheck, Flame } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'dashboard' | 'calendar' | 'news'>('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !AuthService.isAuthenticated());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoadingTrades, setIsLoadingTrades] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [updatingTrade, setUpdatingTrade] = useState<Trade | null>(null);
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Load trades for the authenticated user
  const loadTrades = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      setTrades([]);
      setIsBackendConnected(false);
      return;
    }

    setIsLoadingTrades(true);
    try {
      const apiTrades = await ApiService.getTrades();
      setTrades(apiTrades || []);
      setIsBackendConnected(true);
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED') {
        setCurrentUser(null);
        setIsAuthModalOpen(true);
        setTrades([]);
      } else {
        console.warn('Backend API connection issue:', e);
      }
    } finally {
      setIsLoadingTrades(false);
    }
  }, []);

  // Initialize & verify session on mount
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      loadTrades();
      // Verify session token validity with server
      AuthService.fetchCurrentUser().then(user => {
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          setIsAuthModalOpen(true);
          setTrades([]);
        }
      });
    } else {
      setIsAuthModalOpen(true);
    }
  }, [loadTrades]);

  // Auth Success Handler
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    loadTrades();
  };

  // Logout Handler
  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setTrades([]);
    setIsBackendConnected(false);
    setIsAuthModalOpen(true);
  };

  const stats = TradeStore.calculateStats(trades);
  const openTradesCount = trades.filter(t => t.status === 'OPEN').length;

  const handleOpenAddModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleSaveNewTrade = async (
    tradeData: Omit<Trade, 'id' | 'updates' | 'opened_at' | 'status' | 'profit_point' | 'profit_money'>
  ) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await ApiService.createTrade(tradeData);
      await loadTrades();
      setActiveTab('feed');
    } catch (e) {
      console.error('API create failed:', e);
      alert('Gagal menyimpan trade ke server. Silakan coba lagi.');
    }
  };

  const handleSaveUpdate = async (tradeId: string, update: Omit<TradeUpdate, 'id' | 'trade_id' | 'created_at'>) => {
    try {
      await ApiService.addUpdate(tradeId, update);
      await loadTrades();
    } catch (e) {
      console.error('API update failed:', e);
      alert('Gagal menyimpan update progress trade.');
    }
  };

  const handleConfirmClose = async (tradeId: string, exitPrice: number, status: TradeStatus, notes?: string) => {
    try {
      await ApiService.closeTrade(tradeId, exitPrice, status, notes);
      await loadTrades();
    } catch (e) {
      console.error('API close failed:', e);
      alert('Gagal menutup trade pada server.');
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus trade ini dari jurnal Anda?')) {
      try {
        await ApiService.deleteTrade(tradeId);
        await loadTrades();
      } catch (e) {
        console.error('API delete failed:', e);
        alert('Gagal menghapus trade.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0B0B] text-zinc-100 flex flex-col font-sans selection:bg-[#F5B942]/30 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTrade={handleOpenAddModal}
        openTradesCount={openTradesCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Real-Time Live TradingView Market Ticker Tape */}
      <LiveMarketTicker />

      {/* Quick Status Bar */}
      <div className="w-full max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#0D0D0D] border-b border-[#222222] py-1.5 px-3 sm:px-8 text-xs shrink-0">
        <div className="flex items-center justify-between gap-4 whitespace-nowrap min-w-full">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-zinc-400">
              Live Feed: <strong className="text-[#F5B942]">TradingView Stream</strong> (Real-time)
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] shrink-0">
            {/* Quick jump to News Calendar */}
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Kalender News</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            </button>

            {currentUser ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/20 font-bold">
                <ShieldCheck className="w-3 h-3 text-[#F5B942]" />
                <span>Akun: {currentUser.name}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700 font-medium">
                <Lock className="w-3 h-3" />
                <span>Belum Login</span>
              </span>
            )}

            {isBackendConnected && (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                <Database className="w-3 h-3" />
                <span>TiDB Cloud (Isolated)</span>
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
        {/* Economic News Calendar is accessible anytime */}
        {activeTab === 'news' ? (
          <NewsCalendarView />
        ) : !currentUser ? (
          /* Unauthenticated Landing Card for Journal views */
          <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-3xl bg-[#141414] border border-[#2A2A2A] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#F5B942] to-transparent" />
            <div className="w-16 h-16 rounded-2xl bg-[#1D1D1D] border border-[#333333] shadow-lg shadow-[#F5B942]/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-[#F5B942]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sistem Multi-User Trading Journal
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-lg mx-auto leading-relaxed">
              Setiap trader memiliki akun dan jurnal pribadi yang 100% terisolasi. Data analisis, win rate, dan riwayat posisi trading Anda aman dan privat.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#F5B942] to-[#E5A830] text-black font-extrabold text-sm shadow-lg shadow-[#F5B942]/20 hover:shadow-[#F5B942]/35 active:scale-95 transition-all cursor-pointer"
              >
                Masuk atau Daftar Akun Gratis
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-zinc-300 font-bold text-sm border border-[#333333] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Lihat Kalender Berita Ekonomi</span>
              </button>
            </div>
            <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-zinc-500">
              <span className="flex items-center space-x-1">
                <span>✓</span> <span>Gratis Selamanya</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>✓</span> <span>Data Terenkripsi</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>✓</span> <span>TiDB Cloud Serverless</span>
              </span>
            </div>
          </div>
        ) : isLoadingTrades ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <div className="w-8 h-8 border-2 border-[#F5B942] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Memuat data jurnal trading Anda...</p>
          </div>
        ) : (
          <>
            {activeTab === 'feed' && (
              <TradeFeedView
                trades={trades}
                onAddUpdate={(trade) => setUpdatingTrade(trade)}
                onCloseTrade={(trade) => setClosingTrade(trade)}
                onDeleteTrade={handleDeleteTrade}
                onViewImage={(url) => setPreviewImageUrl(url)}
                onOpenNewTrade={handleOpenAddModal}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView trades={trades} stats={stats} />
            )}

            {activeTab === 'calendar' && (
              <CalendarView trades={trades} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] bg-[#0E0E0E] py-6 px-4 text-center text-xs text-zinc-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-wider">TRADING JOURNAL PRO</span>
            <span>v1.0 (Multi-User Cloud)</span>
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
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        isDismissable={Boolean(currentUser)}
      />

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
