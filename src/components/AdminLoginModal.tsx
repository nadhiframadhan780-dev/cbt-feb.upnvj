import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  ShieldAlert,
  KeyRound,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginAdminWithGoogle, loginAdminWithPasscode, loading } = useAuth();
  const { showToast, showModalAlert } = useNotification();
  const [loginTab, setLoginTab] = useState<'google' | 'passcode'>(
    typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'passcode' : 'google'
  );
  const [adminEmail, setAdminEmail] = useState('nadhiframadhan780@gmail.com');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await loginAdminWithGoogle();
      if (result.success) {
        showToast('success', 'Otorisasi Berhasil', result.message);
        onSuccess();
        onClose();
      } else {
        setErrorMessage(result.message);
        // If domain error on Vercel, auto switch to passcode tab
        if (result.message.includes('Domain Vercel') || result.message.includes('auth/unauthorized-domain')) {
          setLoginTab('passcode');
        } else {
          showModalAlert(
            'error',
            'Akses Administrator Ditolak!',
            result.message,
            'Unauthorized Access (403)',
            'Tutup'
          );
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Terjadi kesalahan autentikasi Google.');
      setLoginTab('passcode');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMessage('Silakan masukkan Kode Keamanan Master.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await loginAdminWithPasscode(adminEmail, passcode);
      if (result.success) {
        showToast('success', 'Otorisasi Berhasil', result.message);
        onSuccess();
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal memverifikasi kode keamanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Top Gold/Emerald Security Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-teal-600 to-emerald-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-700 mx-auto mb-3 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] uppercase tracking-wider mb-1">
            Restricted Admin Area
          </span>

          <h3 className="text-xl font-black text-slate-900 leading-tight">
            Autentikasi Administrator CBT
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setLoginTab('google');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              loginTab === 'google'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Google OAuth
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginTab('passcode');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              loginTab === 'passcode'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-teal-600" />
            <span>Kode Master Vercel</span>
          </button>
        </div>

        {/* Restriction Info Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left text-xs text-amber-950 space-y-1 mb-4">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Akses Khusus Nadhif Ramadhan</span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            Hanya akun resmi <b>nadhiframadhan780@gmail.com</b> yang dapat masuk ke panel ini.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-4 text-left leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Tab 1: Google OAuth */}
        {loginTab === 'google' && (
          <div className="space-y-3">
            <button
              type="button"
              disabled={submitting || loading}
              onClick={handleAdminGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-slate-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{submitting ? 'Memverifikasi Otorisasi...' : 'Masuk dengan Google Administrator'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginTab('passcode')}
              className="w-full flex items-center justify-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold py-1"
            >
              <span>Muncul kendala domain Vercel? Masuk dengan Kode Master</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Tab 2: Passcode Fallback for Vercel */}
        {loginTab === 'passcode' && (
          <form onSubmit={handlePasscodeLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Administrator
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="nadhiframadhan780@gmail.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kode Keamanan Master (PIN)
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                placeholder="Masukkan Kode Keamanan Master"
                autoFocus
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1.5">
                <HelpCircle className="w-3 h-3 text-teal-600 flex-shrink-0" />
                <span>Gunakan kode master FEB: <b className="font-mono text-slate-800">febupnvj2026</b></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !passcode.trim()}
              className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Memverifikasi...' : 'Buka Admin Panel Sekarang'}
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Tutup
          </button>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Terproteksi FEB UPNVJ</span>
          </div>
        </div>

      </div>
    </div>
  );
};
