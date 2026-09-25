import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDY_PROGRAMS, UPNVJ_LOGO, PRODI_COURSES_MAP } from '../constants/programs';
import { Exam, CourseGrade } from '../types';
import { 
  getExamsForStudent, 
  getStudentGrades, 
  subscribeToAllExams, 
  listenRealtimeChanges 
} from '../services/firestoreService';
import { formatIndonesianDate, formatIndonesianTime, formatCountdown } from '../utils/formatters';
import { OfficialPrintableProof, PrintableDocumentType } from './OfficialPrintableProof';
import { RealtimeClock } from './RealtimeClock';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Play, 
  ArrowLeft,
  ShieldAlert,
  Scale,
  User as UserIcon,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  BarChart2,
  Check,
  AlertCircle,
  LogOut,
  Lock,
  AlertOctagon,
  MessageSquare,
  ExternalLink,
  Mail
} from 'lucide-react';

interface StudentDashboardProps {
  onBackToHome: () => void;
  onStartExam: (exam: Exam) => void;
  onGoToRules?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  onBackToHome, 
  onStartExam,
  onGoToRules
}) => {
  const { student, selectedProgramSlug, user, logout } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  
  // Navigation Tabs: 'exams' | 'profile' | 'grades'
  const [mainTab, setMainTab] = useState<'exams' | 'profile' | 'grades'>('exams');
  const [examSubTab, setExamSubTab] = useState<'live' | 'upcoming' | 'finished'>('live');
  const [now, setNow] = useState<number>(Date.now());

  // Grades state
  const [gradesData, setGradesData] = useState<{ grades: CourseGrade[]; averageScore: number; gpa: number } | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(student?.semester || 1);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [printableDoc, setPrintableDoc] = useState<PrintableDocumentType | null>(null);

  const currentProgram = STUDY_PROGRAMS.find(p => p.slug === (student?.programSlug || selectedProgramSlug));

  // Real-time ticker for countdown accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch exams strictly for this student's prodi and cohort with real-time updates
  useEffect(() => {
    if (!student) return;

    async function loadExams() {
      if (!student) return;
      try {
        const data = await getExamsForStudent(student.programSlug, student.cohort);
        setExams(data);
      } catch (err) {
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExams();

    // Real-time listener for instantly published or scheduled exams
    const unsubExams = subscribeToAllExams((allLiveExams) => {
      if (!student) return;
      if (allLiveExams && allLiveExams.length > 0) {
        const studentExams = allLiveExams.filter(e => {
          const matchProgram = e.programSlug === student.programSlug || (e.targetPrograms && e.targetPrograms.includes(student.programSlug));
          const matchCohort = (e.targetCohorts && e.targetCohorts.includes(student.cohort));
          return matchProgram && matchCohort && e.active !== false;
        });
        if (studentExams.length > 0) {
          setExams(studentExams);
        }
      }
    });

    const unsubEvents = listenRealtimeChanges(() => {
      loadExams();
    });

    return () => {
      unsubExams();
      unsubEvents();
    };
  }, [student]);

  // Load integrated grades (Requirement 6)
  useEffect(() => {
    async function loadGrades() {
      if (!student) return;
      setLoadingGrades(true);
      try {
        const res = await getStudentGrades(student.nim, student.programSlug, selectedSemester);
        setGradesData(res);
      } catch (err) {
        console.error('Error loading student grades:', err);
      } finally {
        setLoadingGrades(false);
      }
    }
    loadGrades();
  }, [student, selectedSemester]);

  if (!student) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Sesi CBT Membutuhkan Autentikasi
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Silakan login dan verifikasi data mahasiswa FEB UPNVJ terlebih dahulu.
          </p>
          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-xs cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Categorize exams based on current time
  const liveExams = exams.filter(e => {
    const start = new Date(e.startAt).getTime();
    const end = new Date(e.endAt).getTime();
    return now >= start && now <= end;
  });

  const upcomingExams = exams.filter(e => {
    const start = new Date(e.startAt).getTime();
    return now < start;
  });

  const finishedExams = exams.filter(e => {
    const end = new Date(e.endAt).getTime();
    return now > end;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Top Academic Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda Utama</span>
          </button>

          {onGoToRules && (
            <button
              onClick={onGoToRules}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-xs cursor-pointer"
            >
              <Scale className="w-4 h-4 text-teal-700" />
              <span>Peraturan & Ketentuan</span>
            </button>
          )}

          <button
            onClick={() => setLogoutModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors shadow-xs cursor-pointer"
            title="Keluar dari sesi akun CBT"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Keluar Sesi</span>
          </button>

          <RealtimeClock variant="badge" />
        </div>

        {/* Main View Mode Selector (Exams, Profile, Grades) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setMainTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'exams'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal Ujian
          </button>

          <button
            onClick={() => setMainTab('grades')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'grades'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Rekap Nilai & IPK</span>
          </button>

          <button
            onClick={() => setMainTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'profile'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-teal-700" />
            <span>Profil Lengkap</span>
          </button>
        </div>
      </div>

      {/* Program Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex-shrink-0 flex items-center justify-center">
            <img 
              src={currentProgram?.logoUrl || UPNVJ_LOGO} 
              alt={currentProgram?.name} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Semester Aktif: {student.semester || 1}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Angkatan {student.cohort}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {student.name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              NIM: {student.nim} • Program Studi: {student.program}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-3 px-4 rounded-2xl border text-xs ${
            student.status === 'temporary_inactive'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : student.status === 'permanent_inactive'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}>
            <span className="text-[10px] uppercase font-bold block opacity-80">Status Peserta</span>
            <span className="font-bold flex items-center gap-1.5 mt-0.5">
              {student.status === 'temporary_inactive' ? (
                <>
                  <Clock className="w-4 h-4 text-amber-600" /> Nonaktif Sementara
                </>
              ) : student.status === 'permanent_inactive' ? (
                <>
                  <AlertOctagon className="w-4 h-4 text-rose-600" /> Nonaktif Permanen
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" /> Terverifikasi CBT FEB
                </>
              )}
            </span>
          </div>

          {/* Action: Print Official Exam Card */}
          <button
            onClick={() => setPrintableDoc('exam_card')}
            className="p-3 px-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-850 hover:bg-teal-100 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="Cetak Kartu Tanda Peserta Ujian Resmi (UPNVJ, FEB, & Prodi)"
          >
            <Printer className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">Cetak Kartu Ujian</span>
          </button>

          <button
            onClick={() => setLogoutModalOpen(true)}
            className="p-3 px-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="Keluar dari akun CBT"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Account Status Alert: Temporary Inactive */}
      {student.status === 'temporary_inactive' && (
        <div className="mb-8 p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Peringatan Sistem Akademik
              </span>
              <h3 className="text-base font-black text-amber-950 mt-0.5">
                STATUS AKUN: NONAKTIF SEMENTARA
              </h3>
            </div>
          </div>
          <p className="text-sm font-bold text-amber-950 mt-3 leading-relaxed">
            "AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN"
          </p>
          <p className="text-xs text-amber-800 mt-2">
            Akses pengerjaan ruang ujian sedang ditangguhkan. Silakan hubungi proktor ruang ujian atau panitia CBT FEB UPNVJ untuk permohonan pembukaan kembali akun Anda.
          </p>
        </div>
      )}

      {/* Account Status Alert: Permanent Inactive */}
      {student.status === 'permanent_inactive' && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-rose-50 border-2 border-rose-400 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center flex-shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2.5 py-0.5 rounded-full">
                Pemberitahuan Status Akademik
              </span>
              <h3 className="text-base font-black text-rose-950 mt-0.5">
                STATUS AKUN: NONAKTIF PERMANEN
              </h3>
            </div>
          </div>
          <p className="text-sm font-bold text-rose-950 mt-3 leading-relaxed">
            "AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL &quot;VETERAN&quot; JAKARTA, JIKAA INII KELIRUU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT"
          </p>
          
          <div className="mt-5 pt-4 border-t border-rose-200 flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/6281290001920?text=Halo%20Admin%20CBT%20FEB%20UPNVJ,%20saya%20ingin%20mengonfirmasi%20status%20akun%20mahasiswa%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi Helpdesk CBT via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:cbt.feb@upnvj.ac.id?subject=Konfirmasi%20Status%20Akun%20Mahasiswa%20CBT%20FEB%20UPNVJ"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 font-bold text-xs transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-rose-600" />
              <span>Kirim Email Akademik</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= VIEW 1: EXAMS LIST ================= */}
      {mainTab === 'exams' && (
        <>
          {/* Subtabs for Live, Upcoming, Finished */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
            <button
              onClick={() => setExamSubTab('live')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                examSubTab === 'live'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sedang Berlangsung ({liveExams.length})</span>
            </button>

            <button
              onClick={() => setExamSubTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                examSubTab === 'upcoming'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Terjadwal ({upcomingExams.length})</span>
            </button>

            <button
              onClick={() => setExamSubTab('finished')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                examSubTab === 'finished'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Riwayat Selesai ({finishedExams.length})</span>
            </button>
          </div>

          {/* Exams Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuat jadwal ujian...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {examSubTab === 'live' && liveExams.map(exam => (
                <div key={exam.id} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Sedang Aktif
                      </span>
                      <span className="font-mono text-xs font-bold text-teal-700">
                        {exam.durationMinutes} Menit
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {exam.courseName} ({exam.courseCode}) • {exam.lecturer}
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Batas Penyerahan:</span>
                        <span className="font-mono font-bold text-slate-800">{formatIndonesianTime(exam.endAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Soal:</span>
                        <span className="font-bold text-slate-800">{exam.totalQuestions} Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {student.status === 'temporary_inactive' || student.status === 'permanent_inactive' ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                        title={student.status === 'temporary_inactive' ? 'Akun nonaktif sementara karena tidak hadir hari ujian' : 'Akun nonaktif permanen'}
                      >
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Akses Ujian Ditangguhkan ({student.status === 'temporary_inactive' ? 'Nonaktif Sementara' : 'Nonaktif Permanen'})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartExam(exam)}
                        className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Masuk Ruang Ujian CBT</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {examSubTab === 'live' && liveExams.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Tidak ada ujian yang sedang aktif saat ini untuk angkatan Anda.
                </div>
              )}

              {examSubTab === 'upcoming' && upcomingExams.map(exam => (
                <div key={exam.id} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between opacity-90">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        Terjadwal
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {exam.durationMinutes} Menit
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {exam.courseName} ({exam.courseCode}) • {exam.lecturer}
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Jadwal Buka:</span>
                        <span className="font-bold text-slate-800">{formatIndonesianDate(exam.startAt)} • {formatIndonesianTime(exam.startAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Ruang Ujian Belum Dibuka</span>
                    </button>
                  </div>
                </div>
              ))}

              {examSubTab === 'upcoming' && upcomingExams.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Belum ada jadwal ujian mendatang.
                </div>
              )}

              {examSubTab === 'finished' && finishedExams.map(exam => (
                <div key={exam.id} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                      Selesai
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {exam.courseName} ({exam.courseCode})
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Status: Lembar Jawaban Terkunci</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= VIEW 2: PROFIL LENGKAP MAHASISWA (Requirement 5) ================= */}
      {mainTab === 'profile' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Biodata & Profil Akademik Lengkap</h2>
                <p className="text-xs text-slate-500">Terdaftar di Pangkalan Data CBT FEB UPN “Veteran” Jakarta</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo & Quick Identity Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-teal-50 to-slate-50 border border-teal-100 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-teal-700 text-white flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-md mb-4">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name.charAt(0).toUpperCase()
                  )}
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{student.name}</h3>
                <p className="font-mono text-xs font-bold text-teal-700 mt-0.5">NIM: {student.nim}</p>
                <span className="inline-block mt-3 text-[10px] font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Mahasiswa Aktif (Semester {student.semester || 1})
                </span>
              </div>

              {/* Detail Profile Attributes Grid */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fakultas</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">Fakultas Ekonomi dan Bisnis</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Program Studi</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{student.program}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tahun Angkatan</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{student.cohort}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Semester Berjalan</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">Semester {student.semester || 1}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Institusi / Google</span>
                  <span className="font-mono font-semibold text-slate-800 mt-0.5 block truncate">{student.email}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Hak Akses CBT</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Peserta Ujian Resmi
                  </span>
                </div>
              </div>
            </div>

            {/* Registered Courses on this Semester */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  Daftar Mata Kuliah Diambil (Semester {student.semester || 1})
                </h4>
                <span className="text-xs text-slate-400">
                  {(student.courses || PRODI_COURSES_MAP[student.programSlug]?.[student.semester || 1] || []).length} Mata Kuliah
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(student.courses && student.courses.length > 0 
                  ? student.courses 
                  : (PRODI_COURSES_MAP[student.programSlug]?.[student.semester || 1] || [])
                ).map((courseName, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      {courseName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= VIEW 3: REKAP NILAI & IPK TERINTEGRASI (Requirement 6) ================= */}
      {mainTab === 'grades' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards (Rata-rata Nilai, IPK, Total SKS) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Nilai Ujian</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {gradesData?.averageScore || 0}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Indeks Prestasi (IPK)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                    {gradesData?.gpa.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xs text-slate-400">/4.00</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Predikat Akademik</span>
                <span className="text-sm font-black text-amber-800 block mt-0.5">
                  {(gradesData?.gpa || 0) >= 3.5 ? 'Sangat Memuaskan (Pujian)' : 'Memuaskan'}
                </span>
              </div>
            </div>
          </div>

          {/* Grades Table Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Transkrip Nilai Ujian Otomatis Terintegrasi</h2>
                <p className="text-xs text-slate-500">Nilai dihitung otomatis dari hasil ujian CBT dan rekap evaluasi berkala</p>
              </div>

              {/* Semester Selector Pill & Print Button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Pilih Semester:</span>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-teal-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setPrintableDoc('transcript')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                  title="Cetak Transkrip Nilai Resmi dengan Kop Surat & Logo"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-700" />
                  <span>Cetak Transkrip Resmi</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">No</th>
                    <th className="px-4 py-3.5">Mata Kuliah</th>
                    <th className="px-4 py-3.5 text-center">SKS</th>
                    <th className="px-4 py-3.5 text-center">Nilai UTS</th>
                    <th className="px-4 py-3.5 text-center">Nilai UAS</th>
                    <th className="px-4 py-3.5 text-center">Nilai Akhir</th>
                    <th className="px-4 py-3.5 text-center">Huruf</th>
                    <th className="px-4 py-3.5 text-center">Bobot</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {gradesData?.grades.map((grade, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{grade.courseName}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{grade.courseCode}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">{grade.sks}</td>
                      <td className="px-4 py-3.5 text-center font-mono">{grade.utsScore || '-'}</td>
                      <td className="px-4 py-3.5 text-center font-mono">{grade.uasScore || '-'}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-teal-800">{grade.finalScore}</td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-semibold">{grade.gradePoint.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" /> Lulus
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Academic Summary Footer */}
            <div className="mt-6 p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span>Seluruh nilai terintegrasi secara otomatis dan tersinkronisasi dengan basis data fakultas.</span>
              </div>
              <div className="font-mono font-bold text-teal-900 whitespace-nowrap">
                Rata-rata: {gradesData?.averageScore} • IPK: {gradesData?.gpa.toFixed(2)}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-rose-500 absolute top-0 left-0" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Keluar dari Sesi CBT?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari akun CBT {student.name}? Anda perlu verifikasi ulang saat ingin masuk ke sistem ujian.
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
                onClick={async () => {
                  setLogoutModalOpen(false);
                  await logout();
                  onBackToHome();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Ya, Keluar Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Proof Modal & Print Layout */}
      {printableDoc && (
        <OfficialPrintableProof
          documentType={printableDoc}
          student={student}
          gradesData={gradesData}
          selectedSemester={selectedSemester}
          onClose={() => setPrintableDoc(null)}
        />
      )}

    </div>
  );
};
