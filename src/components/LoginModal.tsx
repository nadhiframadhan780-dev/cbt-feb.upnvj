import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDY_PROGRAMS, COHORTS, UPNVJ_LOGO, PRODI_COURSES_MAP } from '../constants/programs';
import { 
  X, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
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
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const currentProgram = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);

  const handleGoogleLogin = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success && user?.displayName) {
        setNamaLengkap(user.displayName);
      }
    } finally {
      setGoogleLoading(false);
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
      semester: 1,
      courses: PRODI_COURSES_MAP[prodiSlug]?.[1] || ['Pengantar Akuntansi I', 'Mikroekonomi'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    onSuccess(prodiSlug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-teal-600 to-emerald-600" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header Identity */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-xl p-1 bg-teal-50 border border-teal-200 flex items-center justify-center shadow-xs">
              <img src={UPNVJ_LOGO} alt="UPNVJ" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Masuk CBT FEB UPNVJ
              </h3>
              <p className="text-xs text-slate-500">
                Verifikasi Peserta Ujian Digital Semester
              </p>
            </div>
          </div>

          {/* Program Selection Check */}
          {!selectedProgramSlug ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>Pilih Program Studi Anda di bawah ini untuk memulai login ujian:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STUDY_PROGRAMS.map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProgramSlug(prog.slug)}
                    className="p-3 text-left rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50 transition-all flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img src={prog.logoUrl} alt="" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900">{prog.shortName}</p>
                      <p className="text-[10px] text-slate-500">{prog.degree}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Selected Program Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50 border border-teal-200 mb-5">
                <div className="flex items-center gap-3">
                  <img src={currentProgram?.logoUrl} alt="" className="w-8 h-8 object-contain" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      Program Studi Terpilih
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      {currentProgram?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProgramSlug(null)}
                  className="text-xs text-teal-700 hover:text-teal-900 hover:underline font-bold cursor-pointer"
                >
                  Ganti
                </button>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-rose-900">Perhatian:</p>
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Main Student Entry Form (Direct & Reliable) */}
              <form onSubmit={handleStudentValidation} className="space-y-3.5 text-left">
                {user ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Akun Google Terhubung: <b>{user.email}</b></span>
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nadhif Ramadhan"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIM (Nomor Induk Mahasiswa)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2310111001"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Angkatan
                  </label>
                  <select
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono shadow-2xs"
                  >
                    {COHORTS.map((c) => (
                      <option key={c} value={c}>
                        Angkatan {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Memverifikasi Peserta Ujian...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Masuk Ruang Ujian CBT Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Optional: Google Sign-In or Vercel Info */}
              {typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-center text-xs text-teal-950">
                    <p className="font-bold text-teal-900">Login Peserta CBT Mandiri Aktif</p>
                    <p className="text-[11px] text-teal-800/80 mt-0.5">
                      Cukup masukkan Nama, NIM, dan Angkatan Anda pada formulir di atas untuk langsung memulai ujian.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>{googleLoading ? 'Menghubungkan...' : 'Atau Tautkan Akun Google (@upnvj.ac.id)'}</span>
                  </button>
                </div>
              )}

              {/* 1-Click Fast Demo Simulator */}
              <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Uji Coba Cepat 1-Klik</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('cbt-s1-akuntansi', '2310111001', 'Nadhif Ramadhan', '2026')}
                    className="p-2 rounded-xl bg-teal-50/80 border border-teal-200 text-[11px] font-semibold text-teal-900 hover:bg-teal-100 text-left transition-colors cursor-pointer"
                  >
                    ⚡ Demo S1 Akuntansi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('cbt-s1-manajemen', '2410112045', 'Siti Rahmawati', '2025')}
                    className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 text-left transition-colors cursor-pointer"
                  >
                    ⚡ Demo S1 Manajemen
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
