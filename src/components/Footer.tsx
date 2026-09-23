import React from 'react';
import { UPNVJ_LOGO } from '../constants/programs';
import { ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavClick: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Identity & Mission (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl p-1 bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                <img src={UPNVJ_LOGO} alt="UPNVJ" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  CBT FEB UPN Veteran Jakarta
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fakultas Ekonomi dan Bisnis
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Platform Computer Based Test resmi UTS dan UAS bagi mahasiswa Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta. Mewujudkan evaluasi pembelajaran berintegritas dan berkarakter Bela Negara.
            </p>

            <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Ujian Terakreditasi & Terverifikasi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Tautan Navigasi
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Beranda Utama
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('panduan')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Panduan Mengikuti Ujian
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('bantuan')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Pusat Bantuan & FAQ
                </button>
              </li>
              <li>
                <a href="#sambutan-dekan" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Sambutan Dekan
                </a>
              </li>
            </ul>
          </div>

          {/* Program Studi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Program Studi FEB
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>D3 Perbankan dan Keuangan</li>
              <li>D3 Akuntansi</li>
              <li>S1 Manajemen</li>
              <li>S1 Akuntansi</li>
              <li>S1 Ekonomi Syariah</li>
              <li>S1 Ekonomi Pembangunan</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Kontak Kampus
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>Jl. RS. Fatmawati, Pondok Labu, Jakarta Selatan 12450</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-mono">cbt.feb@upnvj.ac.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-mono">(021) 7656971</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Fakultas Ekonomi dan Bisnis UPN Veteran Jakarta. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            <span>Ujian Digital FEB UPNVJ</span>
            <span className="text-slate-400">•</span>
            <span>Versi Produksi CBT</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
