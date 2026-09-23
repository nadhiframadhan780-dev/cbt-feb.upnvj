import React, { useState } from 'react';
import { Exam } from '../types';
import { formatIndonesianDate, formatIndonesianTime } from '../utils/formatters';
import { 
  X, 
  BookOpen, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Play,
  FileCheck
} from 'lucide-react';

interface PreExamModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (exam: Exam) => void;
}

export const PreExamModal: React.FC<PreExamModalProps> = ({
  exam,
  isOpen,
  onClose,
  onConfirmStart
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Gradient Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-teal-500 to-emerald-600" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              Konfirmasi Pelaksanaan Ujian
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 leading-snug">
              {exam.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {exam.courseName} ({exam.courseCode}) • {exam.lecturer}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Summary Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[10px]">Jenis Ujian</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{exam.examType}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[10px]">Durasi</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{exam.durationMinutes} Menit</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[10px]">Jumlah Soal</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{exam.totalQuestions} Soal</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[10px]">Waktu Selesai</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{formatIndonesianTime(exam.endAt)}</span>
            </div>
          </div>

          {/* Academic Instructions */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-200 text-xs">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Petunjuk & Tata Tertib Ujian</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-[11px]">
              {exam.instructions || '1. Berdoalah sebelum memulai ujian.\n2. Pastikan daya baterai dan jaringan stabil.\n3. Dilarang bekerja sama atau menggunakan materi yang tidak diizinkan.\n4. Jawaban tersimpan otomatis secara berkala.'}
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
              Sistem mencatat waktu mulai, aktivitas pengisian, dan waktu penyerahan. Saat timer habis, jawaban Anda akan otomatis dikumpulkan ke server CBT.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">
              Saya telah membaca dan memahami petunjuk serta bersedia mematuhi seluruh tata tertib ujian akademik FEB UPNVJ.
            </span>
          </label>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          
          <button
            disabled={!agreed}
            onClick={() => onConfirmStart(exam)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Mulai Ujian</span>
          </button>
        </div>

      </div>
    </div>
  );
};
