import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UPNVJ_LOGO, STUDY_PROGRAMS } from '../constants/programs';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  BookOpen,
  ChevronDown
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
  const { user, student, isAdmin, logout, selectedProgramSlug } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-teal-100/60 dark:border-slate-800 transition-colors shadow-xs">
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
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  CBT FEB <span className="text-teal-600 dark:text-teal-400">UPNVJ</span>
                </span>
                <span className="hidden md:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                  Resmi
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Computer Based Test — Fakultas Ekonomi dan Bisnis
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentView === 'home' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40 font-semibold' 
                  : 'hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
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
              className="px-3.5 py-2 rounded-lg transition-colors hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
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
              className="px-3.5 py-2 rounded-lg transition-colors hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
            >
              Program Studi
            </button>
            <button
              onClick={() => handleNavClick('panduan')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentView === 'panduan' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40 font-semibold' 
                  : 'hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Panduan
            </button>
            <button
              onClick={() => handleNavClick('bantuan')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentView === 'bantuan' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40 font-semibold' 
                  : 'hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Bantuan
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'admin' 
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 font-bold' 
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth Actions */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800/80 transition-all hover:scale-105"
              aria-label="Toggle Dark Mode"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* User Session Profile or Login CTA */}
            {student ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100/50 dark:hover:bg-teal-900/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-400/40">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                      {student.name}
                    </p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400">
                      NIM: {student.nim}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {student.email}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                        {student.program} ({student.cohort})
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('cbt-dashboard')}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4 text-teal-600" />
                        Dashboard CBT Prodi
                      </button>
                      <button
                        onClick={() => handleNavClick('panduan')}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        Panduan Mengikuti Ujian
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={async () => {
                          if (window.confirm('Apakah Anda yakin ingin keluar dari sesi CBT?')) {
                            await logout();
                            handleNavClick('home');
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
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
                className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold tracking-wide text-white transition-all duration-300 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-xl hover:shadow-lg hover:shadow-teal-700/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
              >
                <span>Masuk CBT</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Program Studi
          </button>
          <button
            onClick={() => handleNavClick('panduan')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Panduan Ujian
          </button>
          <button
            onClick={() => handleNavClick('bantuan')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bantuan & Kontak
          </button>
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Management
            </button>
          )}

          {student && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleNavClick('cbt-dashboard')}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 flex items-center gap-2"
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
