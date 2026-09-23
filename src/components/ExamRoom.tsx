import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, StudentAnswer, ExamAttempt } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  getQuestionsForExam, 
  getOrCreateExamAttempt, 
  saveStudentAnswer, 
  submitExamAttempt 
} from '../services/firestoreService';
import { 
  Clock, 
  CheckCircle2, 
  Flag, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Save, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface ExamRoomProps {
  exam: Exam;
  onFinishExam: (result: { score: number; totalPoints: number; percentage: number }) => void;
  onExit: () => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({ exam, onFinishExam, onExit }) => {
  const { student, user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(exam.durationMinutes * 60);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load attempt and questions on mount
  useEffect(() => {
    async function initExam() {
      if (!student) return;
      try {
        setLoading(true);
        // Load questions
        const qData = await getQuestionsForExam(exam.id);
        setQuestions(qData);

        // Load or create attempt
        const uid = user?.uid || student.uid || 'demo-student-uid';
        const attemptData = await getOrCreateExamAttempt(exam.id, student, uid);
        setAttempt(attemptData);

        // Restore local storage answers if available
        const localAnswers: Record<string, StudentAnswer> = {};
        qData.forEach(q => {
          const stored = localStorage.getItem(`cbt_answer_${attemptData.id}_${q.id}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              localAnswers[q.id] = {
                questionId: q.id,
                answer: parsed.answer,
                isFlagged: parsed.isFlagged || false,
                savedAt: parsed.savedAt || new Date().toISOString()
              };
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        });
        if (Object.keys(localAnswers).length > 0) {
          setAnswers(localAnswers);
        }

      } catch (err) {
        console.error('Failed to initialize exam room:', err);
      } finally {
        setLoading(false);
      }
    }
    initExam();
  }, [exam, student, user]);

  // Window leave protection (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian sedang berlangsung! Jawaban Anda telah tersimpan secara berkala.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Synchronized countdown timer
  useEffect(() => {
    if (loading || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, remainingSeconds]);

  // Auto-Save answer to Firestore and Local Storage
  const handleSelectAnswer = (questionId: string, answerValue: string | string[]) => {
    if (!student || !attempt) return;

    const existingFlag = answers[questionId]?.isFlagged || false;
    const newAnswer: StudentAnswer = {
      questionId,
      answer: answerValue,
      isFlagged: existingFlag,
      savedAt: new Date().toISOString()
    };

    const updated = { ...answers, [questionId]: newAnswer };
    setAnswers(updated);
    setSyncStatus('saving');

    // Debounce Firestore write
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveStudentAnswer(attempt.id, questionId, student.nim, answerValue, existingFlag);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Auto-save network error, fallback to local memory:', err);
        setSyncStatus('offline');
      }
    }, 600);
  };

  // Toggle flagged question status (ragu-ragu)
  const handleToggleFlag = (questionId: string) => {
    if (!student || !attempt) return;
    const current = answers[questionId];
    const newFlag = current ? !current.isFlagged : true;

    const updatedAnswer: StudentAnswer = {
      questionId,
      answer: current ? current.answer : '',
      isFlagged: newFlag,
      savedAt: new Date().toISOString()
    };

    setAnswers(prev => ({ ...prev, [questionId]: updatedAnswer }));

    if (current && current.answer) {
      saveStudentAnswer(attempt.id, questionId, student.nim, current.answer, newFlag);
    }
  };

  // Submit and Finish Exam
  const handleConfirmSubmit = async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);

    try {
      const result = await submitExamAttempt(attempt.id, exam, questions, answers);
      onFinishExam(result);
    } catch (err) {
      console.error('Error submitting exam:', err);
    } finally {
      setSubmitting(false);
      setConfirmSubmitModal(false);
    }
  };

  // Auto-submit when timer expires
  const handleAutoSubmit = () => {
    handleConfirmSubmit();
  };

  // Format time (HH:MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-sm">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 text-sm">Menyiapkan Lembar Soal Ujian...</h3>
          <p className="text-xs text-slate-500 mt-1">Mengunduh butir soal dan mengaktifkan auto-save.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const currentAnswerObj = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = (qId: string) => {
    const ans = answers[qId]?.answer;
    if (ans === undefined || ans === '') return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  };
  const isFlagged = (qId: string) => answers[qId]?.isFlagged || false;

  const totalAnswered = questions.filter(q => isAnswered(q.id)).length;
  const isTimeCritical = remainingSeconds <= 300; // Under 5 minutes

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col transition-colors select-none">
      
      {/* Top Real-Time Examination HUD Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Exam Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-800 text-xs shadow-xs">
              CBT
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-md">
                {exam.title}
              </h2>
              <p className="text-[11px] text-slate-500">
                {student?.name} ({student?.nim})
              </p>
            </div>
          </div>

          {/* Center Sync Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
            {syncStatus === 'synced' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-600 font-medium">Tersimpan ke Cloud</span>
              </>
            )}
            {syncStatus === 'saving' && (
              <>
                <Save className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span className="text-teal-700 font-medium">Menyimpan...</span>
              </>
            )}
            {syncStatus === 'offline' && (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-700 font-medium">Cadangan Lokal Aktif</span>
              </>
            )}
          </div>

          {/* Right Timer & Finish Action */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Real-Time Countdown Box */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm shadow-xs ${
              isTimeCritical 
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' 
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            {/* Finish Exam Button */}
            <button
              onClick={() => setConfirmSubmitModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kumpulkan Ujian</span>
              <span className="sm:hidden">Selesai</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Question Content & Options (Col 1-8) */}
        <main className="lg:col-span-8 flex flex-col justify-between">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            
            {/* Question Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-xs">
                  Soal Nomor {currentIdx + 1}
                </span>
                <span className="text-xs text-slate-400">
                  dari {questions.length} Butir
                </span>
              </div>

              {/* Ragu-Ragu Toggle Button */}
              {currentQ && (
                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isFlagged(currentQ.id)
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isFlagged(currentQ.id) ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isFlagged(currentQ.id) ? 'Ditandai Ragu-ragu' : 'Ragu-ragu'}</span>
                </button>
              )}
            </div>

            {/* Question Prompt */}
            {currentQ && (
              <div className="space-y-6">
                <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                  {currentQ.question}
                </div>

                {/* Optional Image in Question */}
                {currentQ.imageUrl && (
                  <div className="my-4 rounded-2xl overflow-hidden border border-slate-200 max-h-80 bg-slate-100 flex items-center justify-center">
                    <img src={currentQ.imageUrl} alt="Lampiran Soal" className="max-h-80 object-contain" />
                  </div>
                )}

                {/* Options Layout (Multiple Choice, True/False, Essay) */}
                <div className="pt-2 space-y-3">
                  
                  {/* Type: Multiple Choice / Multiple Choice Image */}
                  {(currentQ.type === 'multiple_choice' || currentQ.type === 'multiple_choice_image') && currentQ.options && (
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt) => {
                        const isSelected = currentAnswerObj?.answer === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-2 border-teal-600 text-teal-950 font-semibold shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-teal-700 text-white'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}>
                              {opt.id}
                            </span>
                            <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">
                              {opt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type: True / False */}
                  {currentQ.type === 'true_false' && (
                    <div className="space-y-2.5">
                      {['Benar', 'Salah'].map((val) => {
                        const isSelected = currentAnswerObj?.answer === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSelectAnswer(currentQ.id, val)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-2 border-teal-600 text-teal-950 font-semibold shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-teal-700 text-white'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}>
                              {val === 'Benar' ? 'B' : 'S'}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold">
                              {val}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type: Short Answer */}
                  {currentQ.type === 'short_answer' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-600">
                        Tuliskan jawaban singkat Anda di bawah ini:
                      </label>
                      <input
                        type="text"
                        placeholder="Ketik jawaban..."
                        value={(currentAnswerObj?.answer as string) || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  )}

                  {/* Type: Essay */}
                  {currentQ.type === 'essay' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-600">
                        Uraikan jawaban Anda secara komprehensif:
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Ketik uraian jawaban..."
                        value={(currentAnswerObj?.answer as string) || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        className="w-full p-4 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed"
                      />
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Bottom Next/Prev Question Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Terjawab: {totalAnswered} dari {questions.length} Soal
            </span>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all cursor-pointer"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setConfirmSubmitModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all cursor-pointer"
              >
                <span>Kumpulkan Ujian</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Right Column: Question Navigator Matrix (Col 9-12) */}
        <aside className="lg:col-span-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">
                Navigasi Soal
              </h3>
              <span className="text-xs font-mono font-bold text-teal-700">
                {totalAnswered}/{questions.length} Selesai
              </span>
            </div>

            {/* Color Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-teal-700" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md border border-slate-300 bg-white" />
                <span>Belum Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md ring-2 ring-teal-600 bg-teal-50" />
                <span>Soal Aktif</span>
              </div>
            </div>

            {/* Questions Number Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const answered = isAnswered(q.id);
                const flag = isFlagged(q.id);
                const isCurrent = currentIdx === idx;

                let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-teal-500';
                if (answered && !flag) {
                  btnStyle = 'bg-teal-700 text-white border-teal-700';
                } else if (flag) {
                  btnStyle = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all relative border flex items-center justify-center cursor-pointer ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-offset-2 ring-teal-600' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {flag && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-700" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Auto-Save & Integrity Academic Badge */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-save Firestore aktif</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400">
                Jawaban Anda disimpan otomatis ke cloud database secara berkala.
              </p>
            </div>

          </div>
        </aside>

      </div>

      {/* Confirmation Submit Modal */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Kumpulkan Lembar Jawaban Ujian?
            </h3>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Anda telah menjawab <span className="font-bold text-slate-800">{totalAnswered}</span> dari <span className="font-bold text-slate-800">{questions.length}</span> soal. Setelah dikumpulkan, lembar jawaban akan terkunci permanen.
            </p>

            {totalAnswered < questions.length && (
              <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Perhatian: Masih ada <b>{questions.length - totalAnswered} soal</b> yang belum Anda jawab!</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmSubmitModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kembali Periksa
              </button>

              <button
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Mengirimkan Lembar Ujian...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ya, Kumpulkan Sekarang</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
