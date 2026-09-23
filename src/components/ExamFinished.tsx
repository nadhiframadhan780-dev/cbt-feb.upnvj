import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Exam, StudentProfile } from '../types';
import { formatIndonesianDate, formatIndonesianTime } from '../utils/formatters';
import { CheckCircle2, Award, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface ExamFinishedProps {
  exam: Exam;
  student: StudentProfile;
  result: { score: number; totalPoints: number; percentage: number };
  onBackToDashboard: () => void;
}

export const ExamFinished: React.FC<ExamFinishedProps> = ({
  exam,
  student,
  result,
  onBackToDashboard
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if confetti not supported
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="max-w-xl w-full rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
        
        {/* Top Glow Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Big Checkmark Emblem */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/25">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Congratulatory Heading */}
        <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300/80 mb-3">
          Status: Berhasil Terkumpul & Terkunci
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ujian Berhasil Dikumpulkan
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Jawaban Anda telah berhasil dienkripsi dan tersimpan di pangkalan data CBT Fakultas Ekonomi dan Bisnis UPN Veteran Jakarta.
        </p>

        {/* Exam Metadata Card */}
        <div className="my-8 p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Mata Kuliah:</span>
            <span className="font-bold text-slate-900 dark:text-white">{exam.courseName} ({exam.courseCode})</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Jenis Ujian:</span>
            <span className="font-bold text-teal-700 dark:text-teal-300">{exam.examType}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Nama Mahasiswa / NIM:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name} ({student.nim})</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Waktu Penyerahan:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {formatIndonesianDate(new Date())}, {formatIndonesianTime(new Date())}
            </span>
          </div>

          {/* Conditional Score Presentation */}
          <div className="pt-2">
            {exam.showScore ? (
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 block">Nilai Perolehan CBT:</span>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400">Persentase: {result.percentage}%</span>
                </div>
                <span className="text-2xl font-extrabold font-mono text-teal-700 dark:text-teal-300">
                  {result.score} / {result.totalPoints || 100}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Award className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Nilai akhir akan diumumkan oleh Dosen Pengampu sesuai kalender akademik FEB.</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Signature */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-8">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Otoritas Sertifikasi Ujian CBT FEB UPN “Veteran” Jakarta</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all cursor-pointer hover:scale-105"
        >
          <span>Kembali ke Dashboard CBT</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
