import React from 'react';
import { 
  Play, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Scale,
  Award
} from 'lucide-react';

interface HeroSectionProps {
  onStartExamClick: () => void;
  onGuideClick: () => void;
  onRulesClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onStartExamClick, 
  onGuideClick,
  onRulesClick
}) => {
  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50">
      
      {/* Abstract Glowing Accent Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-amber-300/20 via-teal-400/20 to-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -right-12 w-80 h-80 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-teal-200 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 tracking-wide">
              Ujian Digital yang Terintegrasi, Aman, dan Efisien
            </span>
            <span className="hidden sm:inline text-teal-700 text-xs">• Semester 2026/2027</span>
          </div>

          {/* Hero Big Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Computer Based Test <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700">
              Fakultas Ekonomi dan Bisnis
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Platform resmi pelaksanaan Ujian Tengah Semester (UTS) dan Ujian Akhir Semester (UAS) digital bagi mahasiswa Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta berkarakter integritas Bela Negara.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartExamClick}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-teal-700/25 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Mulai Ujian</span>
            </button>

            <button
              onClick={onRulesClick}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-xs hover:bg-slate-50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Scale className="w-5 h-5 text-teal-700" />
              <span>Peraturan & Ketentuan</span>
            </button>

            <button
              onClick={onGuideClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-sm sm:text-base border border-slate-200 shadow-xs hover:bg-slate-50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Panduan Ujian</span>
            </button>
          </div>

          {/* Institutional Trust Badges */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Enkripsi Jawaban Cloud Firestore</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Sinkronisasi Waktu Server Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Google SSO Domain @upnvj.ac.id</span>
            </div>
          </div>

        </div>

        {/* Dashboard Preview Graphic with Clean Light Styling */}
        <div className="mt-16 max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400/20 via-amber-300/20 to-emerald-400/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700" />
          
          <div className="relative rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-xl overflow-hidden">
            
            {/* Top Mockup Window Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">
                  https://cbt-feb.upnvj.ac.id/live-exam
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                <span>CBT ENGINE V2.6 AKTIF</span>
              </div>
            </div>

            {/* Inner Dashboard Simulation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Mockup Card */}
              <div className="md:col-span-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                    UTS SEDANG BERLANGSUNG
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    Sisa Waktu: 01:24:36
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Pengantar Akuntansi I — AKT101
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Soal No. 1: Dalam persamaan dasar akuntansi, hubungan yang benar antara aset, liabilitas, dan ekuitas adalah...
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-teal-500 bg-teal-50 text-teal-900 font-semibold shadow-xs">
                    ✓ A. Aset = Liabilitas + Ekuitas
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700">
                    B. Aset = Liabilitas - Ekuitas
                  </div>
                </div>
              </div>

              {/* Right Mockup Numbers Grid */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-3">
                    Navigasi Butir Soal
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px] font-bold">
                    <span className="p-2 rounded-lg bg-teal-700 text-white text-center">1</span>
                    <span className="p-2 rounded-lg bg-teal-700 text-white text-center">2</span>
                    <span className="p-2 rounded-lg bg-amber-400 text-amber-950 text-center">3</span>
                    <span className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-center">4</span>
                    <span className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-center">5</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500">
                  <span>Auto-save aktif • Tersimpan ke Cloud Firestore</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
