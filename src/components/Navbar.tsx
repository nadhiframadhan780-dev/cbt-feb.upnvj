import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UPNVJ_LOGO, FEB_LOGO, STUDY_PROGRAMS } from '../constants/programs';
import { 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
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
  const { showToast } = useNotification();
  const isStrictAdmin = isAdmin && adminUser?.email.toLowerCase().trim() === 'nadhiframadhan780@gmail.com';
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const selectedProgram = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      await logout();
      handleNavClick('home');
      showToast('info', 'Sesi Berakhir', 'Anda telah berhasil keluar dari akun CBT FEB UPNVJ.');
    } catch (err) {
      console.error('Logout error:', err);
      handleNavClick('home');
    }
  };

  const isAuthenticated = Boolean(student || isStrictAdmin);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Academic Identity */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group select-none"
            >
              <div className="h-10 sm:h-12 flex-shrink-0 flex items-center">
                <img 
                  src={FEB_LOGO} 
                  alt="Logo Fakultas Ekonomi dan Bisnis UPN Veteran Jakarta" 
                  className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                />
              </div>
              <div className="hidden sm:flex flex-col pl-3 border-l border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                    CBT FEB <span className="text-teal-700">UPNVJ</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Resmi
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Ujian Digital Terintegrasi
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
            </nav>

            {/* Right Auth Actions */}
            <div className="flex items-center space-x-3">
              {/* User Session Profile or Login CTA */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-teal-200 bg-teal-50/80 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-400/40">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={student?.name || adminUser?.name || 'User'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        (student?.name || adminUser?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {student?.name || adminUser?.name || 'Administrator'}
                      </p>
                      <p className="text-[10px] text-teal-700">
                        {student ? `NIM: ${student.nim}` : 'Admin FEB'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {student?.name || adminUser?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {student?.email || adminUser?.email}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          {student ? `${student.program} (${student.cohort})` : 'Super Administrator'}
                        </span>
                      </div>

                      <div className="py-1">
                        {student && (
                          <button
                            onClick={() => handleNavClick('cbt-dashboard')}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <GraduationCap className="w-4 h-4 text-teal-700" />
                            Dashboard CBT Mahasiswa
                          </button>
                        )}
                        {isStrictAdmin && (
                          <button
                            onClick={() => handleNavClick('admin')}
                            className="w-full text-left px-4 py-2.5 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-bold"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Buka Panel Administrator
                          </button>
                        )}
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
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setLogoutModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar dari Akun</span>
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
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
            {isAuthenticated && (
              <div className="p-3 mb-2 rounded-2xl bg-teal-50 border border-teal-200">
                <p className="text-xs font-bold text-slate-900">
                  {student?.name || adminUser?.name}
                </p>
                <p className="text-[11px] text-teal-800">
                  {student ? `NIM: ${student.nim} • ${student.program}` : 'Administrator FEB'}
                </p>
              </div>
            )}

            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
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
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
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
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Program Studi
            </button>
            <button
              onClick={() => handleNavClick('peraturan')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-teal-800 bg-teal-50 flex items-center gap-2 cursor-pointer"
            >
              <Scale className="w-4 h-4 text-teal-700" />
              <span>Peraturan & Ketentuan</span>
            </button>
            <button
              onClick={() => handleNavClick('panduan')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Panduan Ujian
            </button>
            <button
              onClick={() => handleNavClick('bantuan')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Bantuan & Kontak
            </button>

            {student && (
              <button
                onClick={() => handleNavClick('cbt-dashboard')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-teal-800 bg-teal-50 flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Halaman CBT {student.program}</span>
              </button>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Sesi CBT</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal (In-App Modal, No window.confirm) */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl overflow-hidden">
            {/* Top Accent Strip */}
            <div className="h-1.5 w-full bg-rose-500 absolute top-0 left-0" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Konfirmasi Keluar Sesi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari sesi CBT FEB UPN “Veteran” Jakarta? Seluruh sesi Anda akan diakhiri dan Anda perlu login kembali untuk mengakses sistem.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Ya, Keluar Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
