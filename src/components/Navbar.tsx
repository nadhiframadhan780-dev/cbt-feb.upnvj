import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UPNVJ_LOGO, STUDY_PROGRAMS } from '../constants/programs';
import { 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  BookOpen,
  ChevronDown,
  Scale
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setCurrentView,
  onOpenLoginModal
}) => {
  const { user, student, isAdmin, adminUser, logout, selectedProgramSlug } = useAuth();
  const isStrictAdmin = isAdmin && adminUser?.email.toLowerCase().trim() === 'nadhiframadhan780@gmail.com';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const selectedProgram = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Academic Identity */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-amber-400 via-teal-500 to-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img 
                src={UPNVJ_LOGO} 
                alt="Logo UPN Veteran Jakarta" 
                className="w-full h-full object-contain rounded-lg bg-white p-1"
                loading="eager"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                  CBT FEB <span className="text-teal-700">UPNVJ</span>
                </span>
                <span className="hidden md:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Resmi
                </span>
              </div>
              <span className="text-xs text-slate-500 hidden sm:block">
                Computer Based Test — Fakultas Ekonomi dan Bisnis
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-600">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'home' 
                  ? 'text-teal-700 bg-teal-50 font-bold' 
                  : 'hover:text-teal-700 hover:bg-slate-100'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => {
                if (currentView === 'home') {
                  document.getElementById('sambutan-dekan')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNavClick('home');
                  setTimeout(() => {
                    document.getElementById('sambutan-dekan')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="px-3.5 py-2 rounded-xl transition-colors hover:text-teal-700 hover:bg-slate-100 cursor-pointer"
            >
              Tentang
            </button>

            <button
              onClick={() => {
                if (currentView === 'home') {
                  document.getElementById('pilih-prodi')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNavClick('home');
                  setTimeout(() => {
                    document.getElementById('pilih-prodi')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="px-3.5 py-2 rounded-xl transition-colors hover:text-teal-700 hover:bg-slate-100 cursor-pointer"
            >
              Program Studi
            </button>

            {/* Peraturan & Ketentuan */}
            <button
              onClick={() => handleNavClick('peraturan')}
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'peraturan' 
                  ? 'text-teal-700 bg-teal-50 font-bold' 
                  : 'hover:text-teal-700 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 text-teal-600" />
              <span>Peraturan & Ketentuan</span>
            </button>

            <button
              onClick={() => handleNavClick('panduan')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'panduan' 
                  ? 'text-teal-700 bg-teal-50 font-bold' 
                  : 'hover:text-teal-700 hover:bg-slate-100'
              }`}
            >
              Panduan
            </button>

            <button
              onClick={() => handleNavClick('bantuan')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'bantuan' 
                  ? 'text-teal-700 bg-teal-50 font-bold' 
                  : 'hover:text-teal-700 hover:bg-slate-100'
              }`}
            >
              Bantuan
            </button>

            {isStrictAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'admin' 
                    ? 'text-amber-800 bg-amber-100 font-bold border border-amber-300' 
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Auth Actions */}
          <div className="flex items-center space-x-3">
            {/* User Session Profile or Login CTA */}
            {student ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-teal-200 bg-teal-50/80 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-400/40">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {student.name}
                    </p>
                    <p className="text-[10px] text-teal-700">
                      NIM: {student.nim}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {student.email}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                        {student.program} ({student.cohort})
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('cbt-dashboard')}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 text-teal-700" />
                        Dashboard CBT Prodi
                      </button>
                      <button
                        onClick={() => handleNavClick('peraturan')}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Scale className="w-4 h-4 text-teal-700" />
                        Peraturan & Ketentuan
                      </button>
                      <button
                        onClick={() => handleNavClick('panduan')}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-amber-600" />
                        Panduan Mengikuti Ujian
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={async () => {
                          if (window.confirm('Apakah Anda yakin ingin keluar dari sesi CBT?')) {
                            await logout();
                            handleNavClick('home');
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold tracking-wide text-white transition-all duration-300 bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
              >
                <span>Masuk CBT</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1.5 shadow-lg">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Beranda
          </button>
          <button
            onClick={() => {
              handleNavClick('home');
              setTimeout(() => {
                document.getElementById('sambutan-dekan')?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Tentang FEB UPNVJ
          </button>
          <button
            onClick={() => {
              handleNavClick('home');
              setTimeout(() => {
                document.getElementById('pilih-prodi')?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Program Studi
          </button>
          <button
            onClick={() => handleNavClick('peraturan')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-teal-800 bg-teal-50 flex items-center gap-2"
          >
            <Scale className="w-4 h-4 text-teal-700" />
            <span>Peraturan & Ketentuan</span>
          </button>
          <button
            onClick={() => handleNavClick('panduan')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Panduan Ujian
          </button>
          <button
            onClick={() => handleNavClick('bantuan')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Bantuan & Kontak
          </button>
          {isStrictAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-amber-800 bg-amber-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Management</span>
            </button>
          )}

          {student && (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => handleNavClick('cbt-dashboard')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-teal-800 bg-teal-50 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Halaman CBT {student.program}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
