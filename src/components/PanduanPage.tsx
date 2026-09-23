import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Laptop, 
  Wifi, 
  Clock, 
  Lock,
  ArrowRight,
  Scale
} from 'lucide-react';

interface PanduanPageProps {
  onBack: () => void;
  onGoToExam: () => void;
  onGoToRules?: () => void;
}

export const PanduanPage: React.FC<PanduanPageProps> = ({ onBack, onGoToExam, onGoToRules }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-3">
          {onGoToRules && (
            <button
              onClick={onGoToRules}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-xs cursor-pointer"
            >
              <Scale className="w-4 h-4 text-teal-700" />
              <span>Peraturan & Ketentuan</span>
            </button>
          )}

          <button
            onClick={onGoToExam}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm cursor-pointer"
          >
            <span>Pilih Prodi & Ujian</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5 text-teal-700" />
          SOP & Tata Cara CBT
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Panduan Mengikuti Ujian CBT
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Ikuti panduan langkah demi langkah berikut untuk memastikan proses pengerjaan UTS dan UAS Anda berjalan lancar, aman, dan tanpa kendala teknis.
        </p>
      </div>

      {/* 4 Steps Timeline Grid */}
      <div className="space-y-6 mb-12">
        
        {/* Step 1 */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-extrabold text-teal-700 text-lg flex-shrink-0 shadow-xs">
            1
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Persiapan Perangkat & Akun Google Institusi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pastikan Anda menggunakan Laptop/PC dengan browser Google Chrome atau Microsoft Edge versi terbaru. Login ke portal CBT FEB hanya dapat dilakukan menggunakan akun email resmi universitas dengan domain <b>@upnvj.ac.id</b>.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-teal-800">
              <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200">Koneksi min. 5 Mbps</span>
              <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200">Daya Baterai Penuh</span>
              <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200">Akun @upnvj.ac.id</span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-extrabold text-amber-700 text-lg flex-shrink-0 shadow-xs">
            2
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Pilih Program Studi & Verifikasi Data Mahasiswa
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pilih kartu Program Studi Anda pada halaman beranda utama. Masukkan NIM dan tentukan Angkatan Anda pada formulir verifikasi. Sistem akan menyelaraskan daftar soal ujian yang menjadi hak akademik Anda.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-extrabold text-teal-700 text-lg flex-shrink-0 shadow-xs">
            3
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Pengerjaan Ujian & Auto-Save Real-Time
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Setiap jawaban yang Anda pilih akan disimpan secara otomatis ke server cloud Firestore. Gunakan tombol <b>"Ragu-ragu"</b> berwarna kuning untuk menandai nomor yang ingin Anda tinjau kembali sebelum batas waktu berakhir.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Hijau = Sudah Dijawab</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900">Kuning = Ragu-ragu</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300">Putih = Belum Dijawab</span>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-extrabold text-emerald-700 text-lg flex-shrink-0 shadow-xs">
            4
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Pengumpulan Lembar Jawaban & Tanda Terima
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Setelah selesai memeriksa seluruh jawaban, klik tombol <b>"Kumpulkan Ujian"</b>. Anda akan menerima tanda terima digital resmi dengan waktu penyerahan terenkripsi. Bila waktu habis, sistem otomatis melakukan auto-submit.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
