import React from 'react';
import { UPNVJ_LOGO } from '../constants/programs';
import { ShieldCheck, Scale, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavClick: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="border-t border-slate-200 bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Identity & Mission (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl p-1 bg-white border border-teal-200 flex items-center justify-center shadow-xs">
                <img src={UPNVJ_LOGO} alt="UPNVJ" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  CBT FEB UPN Veteran Jakarta
                </h3>
                <p className="text-xs text-slate-500">
                  Fakultas Ekonomi dan Bisnis
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Platform Computer Based Test resmi UTS dan UAS bagi mahasiswa Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta. Mewujudkan evaluasi pembelajaran berintegritas dan berkarakter Bela Negara.
            </p>

            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Ujian Terakreditasi & Terverifikasi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Tautan Navigasi
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  Beranda Utama
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('peraturan')} className="hover:text-teal-700 transition-colors font-bold text-teal-800 flex items-center gap-1 cursor-pointer">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Peraturan & Ketentuan</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('panduan')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  Panduan Mengikuti Ujian
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('bantuan')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  Pusat Bantuan & FAQ
                </button>
              </li>
              <li>
                <a href="#sambutan-dekan" className="hover:text-teal-700 transition-colors cursor-pointer">
                  Sambutan Dekan
                </a>
              </li>
            </ul>
          </div>

          {/* Program Studi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Program Studi FEB
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Kontak Kampus
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <span>Jl. RS. Fatmawati, Pondok Labu, Jakarta Selatan 12450</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span className="font-mono">cbt.feb@upnvj.ac.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span className="font-mono">(021) 7656971</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Admin portal access */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Fakultas Ekonomi dan Bisnis UPN Veteran Jakarta. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              <span>Ujian Digital FEB UPNVJ</span>
              <span className="text-slate-400">•</span>
              <span>Versi Produksi CBT</span>
            </p>
            <button
              onClick={() => onNavClick('admin-login-prompt')}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Akses Khusus Administrator nadhiframadhan780@gmail.com"
            >
              <span>🔒 Admin FEB</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
