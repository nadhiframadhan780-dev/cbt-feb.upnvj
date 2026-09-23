import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, StudentAnswer, ExamAttempt } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  getQuestionsForExam, 
  getOrCreateExamAttempt, 
  saveStudentAnswer, 
  submitExamAttempt 
} from '../services/firestoreService';
import { formatTimer, formatIndonesianTime } from '../utils/formatters';
import { UPNVJ_LOGO, STUDY_PROGRAMS } from '../constants/programs';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CloudCheck, 
  CloudOff, 
  Menu, 
  X,
  FileQuestion,
  Info
} from 'lucide-react';

interface ExamRoomProps {
  exam: Exam;
  onFinishExam: (result: { score: number; totalPoints: number; percentage: number }) => void;
  onExit: () => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({ exam, onFinishExam, onExit }) => {
  const { student, user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  
  // Timer state (seconds remaining)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(exam.durationMinutes * 60);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load attempt and questions on mount
  useEffect(() => {
    async function initExam() {
      if (!student) return;
      setLoading(true);
      try {
        const uid = user?.uid || student.uid || student.nim;
        const [qList, att] = await Promise.all([
          getQuestionsForExam(exam.id),
          getOrCreateExamAttempt(exam.id, student, uid)
        ]);

        setQuestions(qList);
        setAttempt(att);

        // Calculate timer remaining from server endAt vs current time
        const now = Date.now();
        const endAtMs = new Date(exam.endAt).getTime();
        const totalDurationSeconds = exam.durationMinutes * 60;
        
        let initialSeconds = Math.min(
          totalDurationSeconds,
          Math.max(0, Math.floor((endAtMs - now) / 1000))
        );

        if (initialSeconds <= 0) {
          initialSeconds = totalDurationSeconds; // fallback for preview/testing
        }

        setRemainingSeconds(initialSeconds);

        // Restore any saved answers from localStorage
        const storedAnswers: Record<string, StudentAnswer> = {};
        qList.forEach(q => {
          const localKey = `cbt_answer_${att.id}_${q.id}`;
          const cached = localStorage.getItem(localKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              storedAnswers[q.id] = {
                questionId: q.id,
                answer: parsed.answer,
                isFlagged: parsed.isFlagged || false,
                savedAt: parsed.savedAt || new Date().toISOString()
              };
            } catch (e) {
              // Ignore corrupt cache
            }
          }
        });

        if (Object.keys(storedAnswers).length > 0) {
          setAnswers(storedAnswers);
        }
      } catch (err) {
        console.error('Error initializing exam:', err);
      } finally {
        setLoading(false);
      }
    }

    initExam();
  }, [exam, student, user]);

  // Anti-accident leave guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian CBT sedang berlangsung. Jika Anda keluar, lembar pengerjaan tetap tersimpan.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Real-time Countdown Timer
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, questions, answers, attempt]);

  // Auto-submit when time expires
  const handleAutoSubmitOnTimeout = async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    const result = await submitExamAttempt(attempt.id, exam, questions, answers);
    onFinishExam(result);
  };

  const currentQuestion = questions[currentIndex];

  // Save answer handler
  const handleAnswerChange = (val: string | string[]) => {
    if (!currentQuestion || !attempt || !student) return;

    const currentAns = answers[currentQuestion.id];
    const isFlagged = currentAns?.isFlagged || false;
    const nowIso = new Date().toISOString();

    const updated: StudentAnswer = {
      questionId: currentQuestion.id,
      answer: val,
      isFlagged,
      savedAt: nowIso
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: updated
    }));

    // Auto-save to Firestore & Local Storage
    setSyncStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      const ok = await saveStudentAnswer(attempt.id, currentQuestion.id, student.uid, val, isFlagged);
      const timeStr = new Date().toLocaleTimeString('id-ID');
      setLastSavedTime(timeStr);
      setSyncStatus(ok ? 'saved' : 'offline');
    }, 400);
  };

  // Toggle Ragu-ragu
  const toggleFlagCurrent = async () => {
    if (!currentQuestion || !attempt || !student) return;

    const currentAns = answers[currentQuestion.id];
    const newFlagged = !currentAns?.isFlagged;

    const updated: StudentAnswer = {
      questionId: currentQuestion.id,
      answer: currentAns?.answer || '',
      isFlagged: newFlagged,
      savedAt: new Date().toISOString()
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: updated
    }));

    await saveStudentAnswer(attempt.id, currentQuestion.id, student.uid, updated.answer, newFlagged);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    const result = await submitExamAttempt(attempt.id, exam, questions, answers);
    setConfirmSubmitModal(false);
    onFinishExam(result);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Mempersiapkan Lembar Ujian CBT...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Menghubungkan ke server pangkalan data FEB UPNVJ
        </p>
      </div>
    );
  }

  // Answered questions summary
  const answeredCount = questions.filter(q => {
    const a = answers[q.id]?.answer;
    if (Array.isArray(a)) return a.length > 0;
    return typeof a === 'string' && a.trim().length > 0;
  }).length;

  const flaggedCount = Object.values(answers).filter(a => a.isFlagged).length;

  // Warning colors for timer
  const isCritical = remainingSeconds <= 60;
  const isStrongWarning = remainingSeconds <= 300 && remainingSeconds > 60;
  const isWarning = remainingSeconds <= 600 && remainingSeconds > 300;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col transition-colors selection:bg-teal-500 selection:text-white">
      
      {/* Top Fixed Header with Synchronized Timer & Auto-Save */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Identity & Course */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p-1 bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              <img src={UPNVJ_LOGO} alt="UPNVJ" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  {exam.examType}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-xs">
                  {exam.courseCode} - {exam.courseName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Mahasiswa: {student?.name} ({student?.nim})
              </p>
            </div>
          </div>

          {/* Real-time Server Synchronized Countdown Timer */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-mono text-sm sm:text-base font-extrabold border transition-all ${
                isCritical
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-400 animate-pulse'
                  : isStrongWarning
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-400'
                  : isWarning
                  ? 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            {/* Auto-save Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {syncStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tersimpan {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
                </>
              ) : syncStatus === 'saving' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tersimpan Lokal</span>
                </>
              )}
            </div>

            {/* Mobile Navigator Drawer Toggle */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              aria-label="Nomor Soal"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Question and Answer Interface (Col 1-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-sm">
              
              {/* Question Header: Number & Points */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                    SOAL NO. {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-400">
                    dari {questions.length} soal
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Bobot: {currentQuestion?.points} Poin
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-medium mb-6">
                {currentQuestion?.question}
              </div>

              {/* Optional Question Image */}
              {currentQuestion?.imageUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-80 bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-2">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Lampiran Soal"
                    className="max-h-72 w-auto object-contain rounded-xl"
                  />
                </div>
              )}

              {/* Answer Input depending on Question Type */}
              <div className="mt-8 space-y-3">
                {/* 1. Multiple Choice / True-False / MC Image */}
                {(currentQuestion?.type === 'multiple_choice' || 
                  currentQuestion?.type === 'multiple_choice_image' || 
                  currentQuestion?.type === 'true_false') && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((opt) => {
                      const isSelected = answers[currentQuestion.id]?.answer === opt.id || answers[currentQuestion.id]?.answer === opt.text;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleAnswerChange(opt.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-500 shadow-xs'
                              : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed pt-1">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Multiple Select (Checkboxes) */}
                {currentQuestion?.type === 'multiple_select' && (
                  <div className="space-y-3">
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-2">
                      * Pilih seluruh opsi jawaban yang menurut Anda benar
                    </p>
                    {currentQuestion.options?.map((opt) => {
                      const currentSelectedList = (answers[currentQuestion.id]?.answer as string[]) || [];
                      const isChecked = currentSelectedList.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const updatedList = isChecked
                              ? currentSelectedList.filter(item => item !== opt.id)
                              : [...currentSelectedList, opt.id];
                            handleAnswerChange(updatedList);
                          }}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                            isChecked
                              ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-500'
                              : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-teal-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            <strong className="mr-1">{opt.id}.</strong> {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Short Answer */}
                {currentQuestion?.type === 'short_answer' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Tuliskan Jawaban Singkat:
                    </label>
                    <input
                      type="text"
                      placeholder="Ketik jawaban singkat Anda di sini..."
                      value={(answers[currentQuestion.id]?.answer as string) || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                {/* 4. Essay */}
                {currentQuestion?.type === 'essay' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Lembar Jawaban Uraian / Essay:
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Ketikkan argumen, analisis akademis, dan jawaban lengkap Anda di sini..."
                      value={(answers[currentQuestion.id]?.answer as string) || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons: Previous, Flag, Next */}
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                {/* Ragu-ragu (Bookmark / Flag) Button */}
                <button
                  type="button"
                  onClick={toggleFlagCurrent}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    answers[currentQuestion?.id]?.isFlagged
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{answers[currentQuestion?.id]?.isFlagged ? 'Ditandai Ragu-ragu' : 'Ragu-ragu'}</span>
                </button>

                {/* Next Button */}
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 cursor-pointer"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSubmitModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    <span>Selesai & Kumpulkan</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT: Question Number Navigation Grid (Col 9-12 Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 p-6 shadow-sm">
              
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Nomor Soal
                </h4>
                <span className="text-xs font-mono text-slate-500">
                  {answeredCount}/{questions.length} Dijawab
                </span>
              </div>

              {/* Numbers Grid: 5 columns */}
              <div className="grid grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const hasAnswer = ans && (
                    (Array.isArray(ans.answer) && ans.answer.length > 0) ||
                    (typeof ans.answer === 'string' && ans.answer.trim().length > 0)
                  );
                  const isFlagged = ans?.isFlagged;
                  const isActive = idx === currentIndex;

                  let bgClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                  if (isFlagged) {
                    bgClass = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                  } else if (hasAnswer) {
                    bgClass = 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${bgClass} ${
                        isActive ? 'ring-2 ring-teal-400 dark:ring-teal-300 ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'hover:scale-105'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Color Legend */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-teal-600 inline-block" />
                  <span>Sudah Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 inline-block" />
                  <span>Belum Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" />
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded border-2 border-teal-500 inline-block" />
                  <span>Soal Aktif</span>
                </div>
              </div>

              {/* Big Submit Button */}
              <button
                type="button"
                onClick={() => setConfirmSubmitModal(true)}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kumpulkan Ujian</span>
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* Mobile Drawer Navigation for Question Numbers */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Navigasi Soal Ujian
              </h4>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 overflow-y-auto p-1 flex-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const hasAnswer = ans && (
                  (Array.isArray(ans.answer) && ans.answer.length > 0) ||
                  (typeof ans.answer === 'string' && ans.answer.trim().length > 0)
                );
                const isFlagged = ans?.isFlagged;
                const isActive = idx === currentIndex;

                let bgClass = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                if (isFlagged) {
                  bgClass = 'bg-amber-400 text-amber-950 font-bold';
                } else if (hasAnswer) {
                  bgClass = 'bg-teal-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobileNavOpen(false);
                    }}
                    className={`h-11 rounded-xl border text-xs font-mono font-bold flex items-center justify-center ${bgClass} ${
                      isActive ? 'ring-2 ring-teal-400 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                setConfirmSubmitModal(true);
              }}
              className="mt-4 w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              Kumpulkan Ujian Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Kumpulkan Ujian */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Apakah Anda yakin ingin mengumpulkan ujian?
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Setelah dikumpulkan, seluruh jawaban Anda akan dikunci dan tidak dapat diubah kembali.
            </p>

            {/* Answered summary badge */}
            <div className="my-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-slate-400 block text-[10px]">Telah Dijawab:</span>
                <span className="font-bold text-teal-600 font-mono text-sm">{answeredCount} Soal</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Belum Dijawab:</span>
                <span className="font-bold text-rose-600 font-mono text-sm">{questions.length - answeredCount} Soal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal & Lanjutkan
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
