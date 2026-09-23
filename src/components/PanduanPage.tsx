import React from 'react';
import { 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Wifi, 
  Clock, 
  Laptop, 
  ShieldCheck,
  FileText
} from 'lucide-react';

interface PanduanPageProps {
  onBack: () => void;
  onGoToExam: () => void;
}

export const PanduanPage: React.FC<PanduanPageProps> = ({ onBack, onGoToExam }) => {
  const steps = [
    {
      num: 1,
      title: 'Login Akun Google Resmi',
      desc: 'Masuk menggunakan akun Google dengan domain resmi (@upnvj.ac.id) atau akun yang telah terdaftar pada pangkalan data FEB.'
    },
    {
      num: 2,
      title: 'Pilih Program Studi',
      desc: 'Pilih salah satu dari 6 Program Studi yang sesuai dengan status terdaftar Anda di Fakultas Ekonomi dan Bisnis.'
    },
    {
      num: 3,
      title: 'Verifikasi NIM & Angkatan',
      desc: 'Masukkan Nama Lengkap sesuai KRS, Nomor Induk Mahasiswa (NIM), dan tahun Angkatan (2023–2026).'
    },
    {
      num: 4,
      title: 'Periksa Jadwal Ujian',
      desc: 'Periksa mata kuliah, jenis ujian (UTS/UAS), durasi, dan batas waktu pengerjaan pada tab Ujian Berlangsung.'
    },
    {
      num: 5,
      title: 'Koneksi Internet Stabil',
      desc: 'Pastikan koneksi internet stabil dan daya baterai laptop/komputer mencukupi selama durasi ujian.'
    },
    {
      num: 6,
      title: 'Klik "Mulai Ujian"',
      desc: 'Baca petunjuk khusus dosen, centang persetujuan tata tertib, dan klik tombol Mulai Ujian.'
    },
    {
      num: 7,
      title: 'Pengerjaan Soal CBT',
      desc: 'Jawab setiap butir pertanyaan dengan teliti. Anda dapat menggunakan tombol "Ragu-ragu" untuk menandai soal.'
    },
    {
      num: 8,
      title: 'Pastikan Status Tersimpan',
      desc: 'Sistem CBT dilengkapi auto-save real-time. Pastikan indikator "Jawaban Tersimpan" berwarna hijau di bagian atas.'
    },
    {
      num: 9,
      title: 'Klik "Kumpulkan Ujian"',
      desc: 'Setelah seluruh soal terjawab, klik tombol "Kumpulkan Ujian" dan konfirmasi pada jendela pop-up.'
    },
    {
      num: 10,
      title: 'Konfirmasi Tanda Terima',
      desc: 'Tunggu hingga muncul tanda centang hijau "Ujian Berhasil Dikumpulkan" sebagai bukti sah keikutsertaan UTS/UAS.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors">
      
      {/* Top Breadcrumb Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </button>

      {/* Page Heading */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-300 mb-3">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          Prosedur Operasional Standar
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Panduan Mengikuti Ujian CBT
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Tata cara resmi pelaksanaan Ujian Tengah Semester (UTS) dan Ujian Akhir Semester (UAS) Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta.
        </p>
      </div>

      {/* 10 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {steps.map((st) => (
          <div
            key={st.num}
            className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-600/20">
              {st.num}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {st.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Important Technical Tips */}
      <div className="rounded-3xl glass-panel border border-amber-200 dark:border-amber-800/70 p-8 sm:p-10 mb-12 shadow-sm bg-amber-50/30 dark:bg-amber-950/20">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Aturan & Larangan Selama Ujian
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-700 dark:text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-teal-600" />
              Satu Perangkat
            </h4>
            <p className="leading-relaxed">
              Mahasiswa dilarang login secara bersamaan dari dua atau lebih perangkat komputer yang berbeda.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Auto-Submit Otomatis
            </h4>
            <p className="leading-relaxed">
              Saat waktu habis, ujian akan otomatis terkunci dan dikirimkan tanpa toleransi keterlambatan.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Integritas Bela Negara
            </h4>
            <p className="leading-relaxed">
              Segala bentuk kecurangan atau plagiarisme akan dikenakan sanksi nilai E dan skorsing akademik.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <button
          onClick={onGoToExam}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all cursor-pointer hover:scale-105"
        >
          <span>Pilih Program Studi & Mulai Ujian</span>
        </button>
      </div>

    </div>
  );
};
