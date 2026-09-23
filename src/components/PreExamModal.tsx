import React, { useState } from 'react';
import { Exam } from '../types';
import { formatIndonesianDate, formatIndonesianTime } from '../utils/formatters';
import { 
  X, 
  Clock, 
  FileCheck, 
  ShieldAlert, 
  Play
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Gradient Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-teal-600 to-emerald-600" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200">
              Konfirmasi Pelaksanaan Ujian
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1.5 leading-snug">
              {exam.title}
            </h3>
            <p className="text-xs text-slate-500">
              {exam.courseName} ({exam.courseCode}) • {exam.lecturer}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Summary Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Jenis Ujian</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{exam.examType}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Durasi</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{exam.durationMinutes} Menit</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Jumlah Soal</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{exam.totalQuestions} Soal</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Waktu Selesai</span>
              <span className="font-bold text-slate-900 font-mono text-xs">{formatIndonesianTime(exam.endAt)}</span>
            </div>
          </div>

          {/* Academic Instructions */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900 text-xs">
              <FileCheck className="w-4 h-4 text-teal-700" />
              <span>Petunjuk & Tata Tertib Ujian</span>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">
              {exam.instructions || '1. Berdoalah sebelum memulai ujian.\n2. Pastikan daya baterai dan jaringan stabil.\n3. Dilarang bekerja sama atau menggunakan materi yang tidak diizinkan.\n4. Jawaban tersimpan otomatis secara berkala.'}
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-950 leading-relaxed">
              Sistem mencatat waktu mulai, aktivitas pengisian, dan waktu penyerahan. Saat timer habis, jawaban Anda akan otomatis dikumpulkan ke server CBT.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs font-semibold text-slate-800 leading-normal">
              Saya telah membaca dan memahami petunjuk serta bersedia mematuhi seluruh tata tertib ujian akademik FEB UPNVJ.
            </span>
          </label>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          
          <button
            disabled={!agreed}
            onClick={() => onConfirmStart(exam)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Mulai Ujian</span>
          </button>
        </div>

      </div>
    </div>
  );
};
