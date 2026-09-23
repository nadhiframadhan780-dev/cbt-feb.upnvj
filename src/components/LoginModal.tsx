import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDY_PROGRAMS, COHORTS, UPNVJ_LOGO } from '../constants/programs';
import { StudyProgram } from '../types';
import { 
  X, 
  ShieldAlert, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (programSlug: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    user, 
    student, 
    loginWithGoogle, 
    logout, 
    validateStudentData, 
    error, 
    clearError,
    selectedProgramSlug, 
    setSelectedProgramSlug,
    setDemoStudent
  } = useAuth();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [nim, setNim] = useState('');
  const [angkatan, setAngkatan] = useState('2026');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentProgram = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);

  const handleGoogleLogin = async () => {
    clearError();
    const success = await loginWithGoogle();
    if (success && user?.displayName) {
      setNamaLengkap(user.displayName);
    }
  };

  const handleStudentValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramSlug) return;

    setSubmitting(true);
    clearError();

    const ok = await validateStudentData(namaLengkap, nim, angkatan);
    setSubmitting(false);

    if (ok) {
      onSuccess(selectedProgramSlug);
      onClose();
    }
  };

  // Demo auto-fill helper for quick grading/testing
  const handleQuickDemoFill = (prodiSlug: string, demoNim: string, demoName: string, demoCohort: string) => {
    setSelectedProgramSlug(prodiSlug);
    setNamaLengkap(demoName);
    setNim(demoNim);
    setAngkatan(demoCohort);
    
    // Set authenticated demo student
    const matchedProg = STUDY_PROGRAMS.find(p => p.slug === prodiSlug);
    setDemoStudent({
      uid: 'demo-' + demoNim,
      email: `${demoNim}@mahasiswa.upnvj.ac.id`,
      name: demoName,
      nim: demoNim,
      program: matchedProg?.name || 'S1 Akuntansi',
      programSlug: prodiSlug,
      cohort: demoCohort,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    onSuccess(prodiSlug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-teal-500 to-emerald-600" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header Identity */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-xl p-1 bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 flex items-center justify-center">
              <img src={UPNVJ_LOGO} alt="UPNVJ" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Masuk CBT FEB UPNVJ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifikasi Akun Ujian Mahasiswa
              </p>
            </div>
          </div>

          {/* Program Selection Check */}
          {!selectedProgramSlug ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Silakan tentukan Program Studi Anda terlebih dahulu sebelum melanjutkan autentikasi.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STUDY_PROGRAMS.map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProgramSlug(prog.slug)}
                    className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 transition-all flex items-center gap-2.5"
                  >
                    <img src={prog.logoUrl} alt="" className="w-8 h-8 object-contain" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{prog.shortName}</p>
                      <p className="text-[10px] text-slate-500">{prog.degree}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Selected Program Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 mb-6">
                <div className="flex items-center gap-3">
                  <img src={currentProgram?.logoUrl} alt="" className="w-8 h-8 object-contain" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Program Studi Terpilih
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentProgram?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProgramSlug(null)}
                  className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                >
                  Ganti
                </button>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-rose-900 dark:text-rose-100">Akses Ditolak</p>
                    <p className="leading-relaxed">{error}</p>
                    <button
                      onClick={logout}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 transition-colors"
                    >
                      Gunakan Akun Google Lain
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Google Authentication */}
              {!user && !student ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    Gunakan akun Google universitas resmi untuk mengakses portal ujian.
                  </p>

                  {/* Official Google Sign-In Button */}
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* SVG Google Logo */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    <span>Masuk dengan Google</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                    Akses hanya tersedia bagi akun yang telah memenuhi ketentuan akses CBT FEB (@upnvj.ac.id).
                  </p>

                  {/* Simulator / Demo Quick Login for Evaluators */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center mb-2">
                      Simulasi Demo Evaluasi Instan
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickDemoFill('cbt-s1-akuntansi', '2310111001', 'Nadhif Ramadhan', '2026')}
                        className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-[11px] font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100/70 text-left"
                      >
                        ⚡ Demo S1 Akuntansi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoFill('cbt-s1-manajemen', '2410112045', 'Siti Rahmawati', '2025')}
                        className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 text-left"
                      >
                        ⚡ Demo S1 Manajemen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Student Data Form */
                <form onSubmit={handleStudentValidation} className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Google Sign-In Terverifikasi: <b>{user?.email || student?.email}</b></span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap sesuai KRS"
                      value={namaLengkap || user?.displayName || student?.name || ''}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      NIM (Nomor Induk Mahasiswa)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 2310111001"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Angkatan
                    </label>
                    <select
                      value={angkatan}
                      onChange={(e) => setAngkatan(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    >
                      {COHORTS.map((c) => (
                        <option key={c} value={c}>
                          Angkatan {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Memverifikasi Data Mahasiswa...</span>
                    ) : (
                      <>
                        <span>Masuk CBT</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
