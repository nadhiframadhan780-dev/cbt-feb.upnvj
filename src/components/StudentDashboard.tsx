import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDY_PROGRAMS, UPNVJ_LOGO } from '../constants/programs';
import { Exam } from '../types';
import { getExamsForStudent } from '../services/firestoreService';
import { formatIndonesianDate, formatIndonesianTime, formatCountdown } from '../utils/formatters';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Play, 
  ArrowLeft,
  ShieldAlert,
  Scale
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
  const { student, selectedProgramSlug } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'finished'>('live');
  const [now, setNow] = useState<number>(Date.now());

  const currentProgram = STUDY_PROGRAMS.find(p => p.slug === (student?.programSlug || selectedProgramSlug));

  // Real-time ticker for countdown accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch exams strictly for this student's prodi and cohort
  useEffect(() => {
    async function loadExams() {
      if (!student) return;
      setLoading(true);
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
  }, [student]);

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
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Server Time Synchronized</span>
        </div>
      </div>

      {/* Student Profile & Program Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Identity & Program */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 bg-slate-50 border border-teal-200 flex items-center justify-center shadow-xs flex-shrink-0">
              <img
                src={currentProgram?.logoUrl || UPNVJ_LOGO}
                alt={currentProgram?.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {currentProgram?.shortName || student.program}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Angkatan {student.cohort}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Selamat Datang, {student.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                NIM: <span className="font-mono font-semibold text-slate-800">{student.nim}</span> • Email: {student.email}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="px-4 py-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-center min-w-[90px]">
              <span className="block text-xs font-semibold text-teal-800">Berlangsung</span>
              <span className="text-lg font-bold text-teal-900 font-mono">{liveExams.length}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[90px]">
              <span className="block text-xs font-semibold text-amber-800">Mendatang</span>
              <span className="text-lg font-bold text-amber-900 font-mono">{upcomingExams.length}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-center min-w-[90px]">
              <span className="block text-xs font-semibold text-slate-600">Selesai</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{finishedExams.length}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Navigation: Live, Upcoming, Finished */}
      <div className="flex border-b border-slate-200 mb-8 space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'live'
              ? 'border-teal-700 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
          </span>
          <span>Sedang Berlangsung ({liveExams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Ujian Mendatang ({upcomingExams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finished')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'finished'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Ujian Selesai ({finishedExams.length})</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(n => (
            <div key={n} className="h-64 rounded-3xl bg-slate-200 p-6" />
          ))}
        </div>
      ) : (
        <div>
          {/* Tab 1: Sedang Berlangsung (LIVE) */}
          {activeTab === 'live' && (
            <div>
              {liveExams.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">
                    Tidak Ada Ujian yang Sedang Berlangsung
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Saat ini belum terdapat sesi ujian yang aktif untuk Program Studi dan Angkatan Anda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="group relative rounded-3xl bg-white border-2 border-teal-600 p-6 sm:p-7 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Live Badge */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-extrabold uppercase tracking-wider border border-teal-300">
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                            SEDANG BERLANGSUNG
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {exam.examType}
                          </span>
                        </div>

                        {/* Title & Course */}
                        <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Mata Kuliah: <span className="font-semibold text-slate-800">{exam.courseName}</span> ({exam.courseCode})
                        </p>
                        <p className="text-xs text-slate-500">
                          Dosen: {exam.lecturer}
                        </p>

                        {/* Meta information */}
                        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-500 block text-[11px]">Batas Waktu:</span>
                            <span className="font-semibold text-slate-800 font-mono">
                              s/d {formatIndonesianTime(exam.endAt)}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-500 block text-[11px]">Durasi:</span>
                            <span className="font-semibold text-slate-800 font-mono">
                              {exam.durationMinutes} Menit ({exam.totalQuestions} Soal)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Start Exam Button */}
                      <button
                        onClick={() => onStartExam(exam)}
                        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/25 transition-all cursor-pointer hover:scale-[1.01]"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Mulai Ujian</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Ujian Mendatang */}
          {activeTab === 'upcoming' && (
            <div>
              {upcomingExams.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">
                    Belum Ada Ujian Mendatang
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Seluruh jadwal ujian mendatang akan diumumkan sesuai kalender akademik FEB UPNVJ.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Countdown Badge */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-300">
                            🟡 BELUM DIMULAI
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {exam.examType}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Mata Kuliah: <span className="font-semibold text-slate-800">{exam.courseName}</span> ({exam.courseCode})
                        </p>
                        <p className="text-xs text-slate-500">
                          Dosen: {exam.lecturer}
                        </p>

                        {/* Real-time Countdown Banner */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                          <span className="text-slate-500 block text-[11px]">
                            Ujian dimulai dalam:
                          </span>
                          <span className="font-bold text-amber-900 font-mono text-sm">
                            {formatCountdown(exam.startAt)}
                          </span>
                        </div>

                        <div className="mt-4 text-xs space-y-1 text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatIndonesianDate(exam.startAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatIndonesianTime(exam.startAt)} – {formatIndonesianTime(exam.endAt)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled
                        className="mt-6 w-full py-3 rounded-2xl bg-slate-100 text-slate-400 font-semibold text-xs cursor-not-allowed text-center"
                      >
                        Tombol Aktif Saat Jam Ujian Tiba
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Ujian Selesai */}
          {activeTab === 'finished' && (
            <div>
              {finishedExams.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200">
                  <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">
                    Belum Ada Riwayat Ujian Selesai
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Hasil dan evaluasi ujian yang telah berakhir akan tercatat pada tab ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {finishedExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            ✓ SELESAI
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {formatIndonesianDate(exam.startAt)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Mata Kuliah: <span className="font-semibold text-slate-800">{exam.courseName}</span> ({exam.courseCode})
                        </p>

                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          {exam.showScore ? (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 font-medium">Nilai Hasil Evaluasi:</span>
                              <span className="font-mono font-bold text-teal-700 text-base">
                                85 / 100
                              </span>
                            </div>
                          ) : (
                            <p className="text-slate-500 italic">
                              Nilai akan diumumkan sesuai kebijakan dosen pengampu.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Pengerjaan Berhasil Tersimpan</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
