import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SambutanDekan } from './components/SambutanDekan';
import { ProgramStudiSection } from './components/ProgramStudiSection';
import { LoginModal } from './components/LoginModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StudentDashboard } from './components/StudentDashboard';
import { PreExamModal } from './components/PreExamModal';
import { ExamRoom } from './components/ExamRoom';
import { ExamFinished } from './components/ExamFinished';
import { PeraturanKetentuanPage } from './components/PeraturanKetentuanPage';
import { PanduanPage } from './components/PanduanPage';
import { BantuanPage } from './components/BantuanPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { STUDY_PROGRAMS } from './constants/programs';
import { Exam, StudyProgram } from './types';
import { testFirestoreConnection } from './lib/firebase';
import { Sparkles, GraduationCap, Scale } from 'lucide-react';

const MainApp: React.FC = () => {
  const { student, isAdmin, adminUser, selectedProgramSlug, setSelectedProgramSlug } = useAuth();
  
  // Views: 'home' | 'cbt-dashboard' | 'exam-room' | 'exam-finished' | 'peraturan' | 'panduan' | 'bantuan' | 'admin'
  const [currentView, setCurrentView] = useState<string>('home');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [preExamModalOpen, setPreExamModalOpen] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<{ score: number; totalPoints: number; percentage: number } | null>(null);

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Sync URL hash with program slug
  useEffect(() => {
    if (currentView === 'cbt-dashboard' && selectedProgramSlug) {
      const targetProg = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);
      if (targetProg) {
        window.location.hash = targetProg.pageUrl;
        document.title = `CBT ${targetProg.name} — FEB UPN Veteran Jakarta`;
      }
    } else if (currentView === 'exam-room' && activeExam) {
      document.title = `Ujian: ${activeExam.title} — CBT FEB UPNVJ`;
    } else if (currentView === 'peraturan') {
      window.location.hash = 'peraturan-ketentuan';
      document.title = 'Peraturan & Ketentuan Ujian — CBT FEB UPNVJ';
    } else if (currentView === 'admin') {
      document.title = 'Panel Administrator CBT FEB UPNVJ';
    } else {
      window.location.hash = '';
      document.title = 'CBT FEB UPN Veteran Jakarta';
    }
  }, [currentView, selectedProgramSlug, activeExam]);

  // Handle study program selection from landing page
  const handleSelectProgram = (program: StudyProgram) => {
    setSelectedProgramSlug(program.slug);
    if (student) {
      setCurrentView('cbt-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoginModalOpen(true);
    }
  };

  // Login successful callback
  const handleLoginSuccess = (programSlug: string) => {
    setSelectedProgramSlug(programSlug);
    setCurrentView('cbt-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Pre-Exam Rules modal
  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setPreExamModalOpen(true);
  };

  // Confirmed start exam -> enters ExamRoom
  const handleConfirmStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setPreExamModalOpen(false);
    setCurrentView('exam-room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Finished exam handler
  const handleFinishExam = (result: { score: number; totalPoints: number; percentage: number }) => {
    setExamResult(result);
    setCurrentView('exam-finished');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle View navigation
  const handleNavigateView = (view: string) => {
    if (view === 'admin-login-prompt') {
      if (isAdmin && adminUser?.email.toLowerCase().trim() === 'nadhiframadhan780@gmail.com') {
        setCurrentView('admin');
      } else {
        setAdminLoginModalOpen(true);
      }
      return;
    }

    if (view === 'admin') {
      if (isAdmin && adminUser?.email.toLowerCase().trim() === 'nadhiframadhan780@gmail.com') {
        setCurrentView('admin');
      } else {
        setAdminLoginModalOpen(true);
      }
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      
      {/* Navbar (Hidden only during live full-focus Exam Room) */}
      {currentView !== 'exam-room' && (
        <Navbar
          currentView={currentView}
          setCurrentView={handleNavigateView}
          onOpenLoginModal={() => setLoginModalOpen(true)}
        />
      )}

      {/* Evaluator Quick Simulation Bar (Student & Academic Guidelines only - No Admin button) */}
      {currentView === 'home' && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulasi Pengujian Peserta Mahasiswa:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedProgramSlug('cbt-s1-akuntansi');
                  setLoginModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 cursor-pointer shadow-xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulasi S1 Akuntansi</span>
              </button>
              <button
                onClick={() => {
                  setSelectedProgramSlug('cbt-d3-perbankan-keuangan');
                  setLoginModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 cursor-pointer shadow-xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulasi D3 Perbankan</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('peraturan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-800 font-bold border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                <Scale className="w-3.5 h-3.5 text-slate-600" />
                <span>Peraturan & Ketentuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ROUTER */}
      <div className="flex-1">
        {/* 1. Landing Page */}
        {currentView === 'home' && (
          <>
            <HeroSection
              onStartExamClick={() => {
                document.getElementById('pilih-prodi')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onGuideClick={() => {
                setCurrentView('panduan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRulesClick={() => {
                setCurrentView('peraturan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <SambutanDekan />
            <ProgramStudiSection onSelectProgram={handleSelectProgram} />
          </>
        )}

        {/* 2. CBT Student Dashboard per Prodi */}
        {currentView === 'cbt-dashboard' && (
          <StudentDashboard
            onBackToHome={() => setCurrentView('home')}
            onStartExam={handleStartExam}
            onGoToRules={() => {
              setCurrentView('peraturan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 3. Live Examination Workspace with Anti-Cheat & Screen Timeout Notice */}
        {currentView === 'exam-room' && activeExam && (
          <ExamRoom
            exam={activeExam}
            onFinishExam={handleFinishExam}
            onExit={() => setCurrentView('cbt-dashboard')}
          />
        )}

        {/* 4. Exam Finished Celebration & Auto Logout option */}
        {currentView === 'exam-finished' && activeExam && student && examResult && (
          <ExamFinished
            exam={activeExam}
            student={student}
            result={examResult}
            onBackToDashboard={() => setCurrentView('cbt-dashboard')}
          />
        )}

        {/* 5. Peraturan & Ketentuan Ujian (Light theme, 30m mobile rule, 3x warnings) */}
        {currentView === 'peraturan' && (
          <PeraturanKetentuanPage
            onBack={() => setCurrentView('home')}
            onGoToExam={() => {
              setCurrentView('home');
              setTimeout(() => {
                document.getElementById('pilih-prodi')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {/* 6. Panduan Ujian */}
        {currentView === 'panduan' && (
          <PanduanPage
            onBack={() => setCurrentView('home')}
            onGoToExam={() => {
              setCurrentView('home');
              setTimeout(() => {
                document.getElementById('pilih-prodi')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onGoToRules={() => {
              setCurrentView('peraturan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 7. Bantuan & FAQ */}
        {currentView === 'bantuan' && (
          <BantuanPage 
            onBack={() => setCurrentView('home')} 
            onGoToRules={() => {
              setCurrentView('peraturan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 8. Admin Panel (Protected by nadhiframadhan780@gmail.com) */}
        {currentView === 'admin' && (
          <AdminDashboard onBackToHome={() => setCurrentView('home')} />
        )}
      </div>

      {/* Footer (Hidden during live exam) */}
      {currentView !== 'exam-room' && (
        <Footer onNavClick={handleNavigateView} />
      )}

      {/* Student Login & Verification Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Admin Login Modal (Strict Google Login for nadhiframadhan780@gmail.com) */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Pre-Exam Rules Modal */}
      <PreExamModal
        exam={activeExam}
        isOpen={preExamModalOpen}
        onClose={() => setPreExamModalOpen(false)}
        onConfirmStart={handleConfirmStartExam}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
