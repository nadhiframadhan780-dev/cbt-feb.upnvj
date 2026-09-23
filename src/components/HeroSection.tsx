import React from 'react';
import { 
  Play, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  Lock, 
  Award,
  ChevronRight,
  Database
} from 'lucide-react';
import { UPNVJ_LOGO } from '../constants/programs';

interface HeroSectionProps {
  onStartExamClick: () => void;
  onGuideClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartExamClick, onGuideClick }) => {
  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden transition-colors">
      
      {/* Abstract Glowing Gradient Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-400/15 via-teal-500/20 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-teal-600/10 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -right-12 w-80 h-80 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/90 border border-teal-200/80 dark:border-teal-800/60 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
              Ujian Digital yang Terintegrasi, Aman, dan Efisien.
            </span>
            <span className="hidden sm:inline text-teal-600 dark:text-teal-400 text-xs">• Semester 2026/2027</span>
          </div>

          {/* Hero Big Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Computer Based Test <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 dark:from-teal-400 dark:via-emerald-400 dark:to-amber-400">
              Fakultas Ekonomi dan Bisnis
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Platform pelaksanaan UTS dan UAS digital bagi mahasiswa Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta dengan integritas akademik berkarakter Bela Negara.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartExamClick}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-teal-700/25 hover:shadow-teal-700/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Mulai Ujian</span>
            </button>

            <button
              onClick={onGuideClick}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base border border-slate-200/90 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Pelajari Panduan</span>
            </button>
          </div>

          {/* Institutional Trust Badges */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Enkripsi Jawaban Firestore</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Sinkronisasi Waktu Server</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Google SSO Domain @upnvj.ac.id</span>
            </div>
          </div>

        </div>

        {/* Dashboard Preview Graphic with Floating Academic Elements */}
        <div className="mt-16 max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-teal-500/30 to-emerald-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
            
            {/* Top Mockup Window Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  https://cbt-feb.upnvj.ac.id/live-exam
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>CBT ENGINE V2.6 LIVE</span>
              </div>
            </div>

            {/* Inner Dashboard Simulation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Mockup Card */}
              <div className="md:col-span-8 p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    UTS SEDANG BERLANGSUNG
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    Sisa Waktu: 01:24:36
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Pengantar Akuntansi I — AKT101
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Soal No. 1: Dalam persamaan dasar akuntansi, hubungan yang benar antara aset, liabilitas, dan ekuitas adalah...
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold">
                    ✓ A. Aset = Liabilitas + Ekuitas
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    B. Aset = Liabilitas - Ekuitas
                  </div>
                </div>
              </div>

              {/* Right Mockup Numbers Grid */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-3">
                    Navigasi Butir Soal
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px] font-bold">
                    <span className="p-2 rounded-lg bg-teal-600 text-white text-center">1</span>
                    <span className="p-2 rounded-lg bg-teal-600 text-white text-center">2</span>
                    <span className="p-2 rounded-lg bg-amber-400 text-amber-950 text-center">3</span>
                    <span className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 text-center">4</span>
                    <span className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 text-center">5</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>Auto-save aktif • Tersimpan ke Firestore</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
