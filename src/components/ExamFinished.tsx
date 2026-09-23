import React from 'react';
import { Exam, StudentProfile } from '../types';
import { UPNVJ_LOGO } from '../constants/programs';
import { 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Printer 
} from 'lucide-react';

interface ExamFinishedProps {
  exam: Exam;
  student: StudentProfile;
  result: {
    score: number;
    totalPoints: number;
    percentage: number;
  };
  onBackToDashboard: () => void;
}

export const ExamFinished: React.FC<ExamFinishedProps> = ({
  exam,
  student,
  result,
  onBackToDashboard
}) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 transition-colors">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-xl text-center overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Institution Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl p-1 bg-white border border-slate-200 shadow-xs flex items-center justify-center">
            <img src={UPNVJ_LOGO} alt="UPNVJ" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900">
              CBT FEB UPN Veteran Jakarta
            </h4>
            <p className="text-[10px] text-slate-500">
              Tanda Terima Penyerahan Digital
            </p>
          </div>
        </div>

        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 mb-6 shadow-xs animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Celebration Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ujian Berhasil Dikumpulkan!
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Seluruh jawaban Anda telah tersimpan dan diverifikasi di server cloud CBT Fakultas Ekonomi dan Bisnis UPNVJ.
        </p>

        {/* Result Card (If exam configured to show score) */}
        {exam.showScore ? (
          <div className="my-6 p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Perolehan Nilai Mentah
            </span>
            <div className="mt-2 flex items-baseline justify-center gap-1 font-mono">
              <span className="text-4xl sm:text-5xl font-extrabold text-teal-900">
                {result.score}
              </span>
              <span className="text-lg text-teal-700">/{result.totalPoints}</span>
            </div>
            <p className="mt-1 text-xs font-bold text-teal-700">
              Persentase Capaian: {result.percentage}%
            </p>
            <p className="mt-2 text-[10px] text-slate-500">
              *Nilai akhir tetap mengacu pada keputusan resmi dan pembobotan dosen pengampu.
            </p>
          </div>
        ) : (
          <div className="my-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Kebijakan Pengumuman Nilai</p>
              <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                Hasil evaluasi ujian ini akan diumumkan oleh Dosen Pengampu secara kolektif melalui portal SIMAK UPN Veteran Jakarta.
              </p>
            </div>
          </div>
        )}

        {/* Meta Submission Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2 mb-8">
          <div className="flex justify-between">
            <span className="text-slate-500">Mata Kuliah:</span>
            <span className="font-bold text-slate-900">{exam.courseName} ({exam.courseCode})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Nama Mahasiswa:</span>
            <span className="font-bold text-slate-900">{student.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">NIM:</span>
            <span className="font-mono font-bold text-slate-900">{student.nim}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Program Studi:</span>
            <span className="font-semibold text-slate-800">{student.program}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-500">Waktu Penyerahan:</span>
            <span className="font-mono font-semibold text-emerald-700">
              {new Date().toLocaleTimeString('id-ID')} WIB
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Tanda Terima</span>
          </button>

          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard CBT</span>
          </button>
        </div>

        {/* Security Stamp */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Terverifikasi Digital Signature FEB UPNVJ</span>
        </div>

      </div>
    </div>
  );
};
