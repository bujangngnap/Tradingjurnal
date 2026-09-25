import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/auth';
import type { User as AuthUser } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
  isDismissable?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  isDismissable = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password minimal 6 karakter');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await AuthService.register(name, email, password);
        if (res.user) {
          onSuccess(res.user);
        }
      } else {
        const res = await AuthService.login(email, password);
        if (res.user) {
          onSuccess(res.user);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden shadow-black/80">
        
        {/* Subtle Gold Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#F5B942] to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B942]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button if dismissable */}
        {isDismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#333333] shadow-md shadow-[#F5B942]/10 mb-3">
              <ShieldCheck className="w-6 h-6 text-[#F5B942]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Trader'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {mode === 'login'
                ? 'Masuk untuk mengakses jurnal trading pribadi Anda'
                : 'Daftar gratis untuk mencatat jurnal trading Anda secara mandiri'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-[#1A1A1A] rounded-xl border border-[#262626] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#2A2A2A] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#2A2A2A] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start space-x-2.5 p-3.5 mb-5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Nama Lengkap / Trader Nickname
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Masam Trader"
                    className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@domain.com"
                  className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Password {mode === 'register' && '(Min. 6 Karakter)'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Ulangi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#F5B942] to-[#E5A830] hover:from-[#f8c45e] hover:to-[#efa823] text-black font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-[#F5B942]/20 hover:shadow-[#F5B942]/35 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sekarang</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Buat Akun Trader</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-[#222222] text-center">
            <p className="text-xs text-zinc-500">
              🔒 Jurnal Anda 100% terisolasi & terenkripsi aman di cloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
