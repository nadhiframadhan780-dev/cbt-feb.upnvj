import React from 'react';
import { HelpCircle, Mail, Phone, MapPin, ArrowLeft, MessageSquare, ShieldQuestion } from 'lucide-react';

interface BantuanPageProps {
  onBack: () => void;
}

export const BantuanPage: React.FC<BantuanPageProps> = ({ onBack }) => {
  const faqs = [
    {
      q: 'Bagaimana jika akun Google saya bukan domain @upnvj.ac.id?',
      a: 'Sistem CBT FEB UPNVJ secara ketat membatasi akses hanya untuk akun Google resmi universitas (@upnvj.ac.id) atau akun yang telah didaftarkan khusus oleh admin akademik FEB. Silakan gunakan fitur ganti akun di pop-up Google.'
    },
    {
      q: 'Bagaimana jika koneksi internet terputus saat sedang mengerjakan ujian?',
      a: 'Jangan panik. Sistem CBT kami dilengkapi teknologi penyimpanan lokal (offline resilience) dan auto-save real-time. Jawaban Anda tetap tersimpan di browser dan akan otomatis tersinkronisasi ke server saat koneksi internet pulih.'
    },
    {
      q: 'Data mahasiswa saya tidak ditemukan saat memasukkan NIM?',
      a: 'Pastikan Anda telah memilih Program Studi yang tepat dan memasukkan NIM tanpa spasi. Jika masih belum ditemukan, hubungi bagian administrasi akademik prodi Anda untuk sinkronisasi KRS.'
    },
    {
      q: 'Apakah saya bisa mengubah jawaban yang sudah tersimpan sebelum submit?',
      a: 'Bisa. Selama timer ujian belum habis dan tombol "Kumpulkan Ujian" belum dikonfirmasi, Anda bebas mengubah pilihan jawaban atau kembali ke nomor soal yang ditandai ragu-ragu.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors">
      
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </button>

      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          Pusat Informasi & Dukungan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pusat Bantuan CBT FEB UPNVJ
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Layanan bantuan teknis dan pertanyaan seputar pelaksanaan ujian online FEB UPN “Veteran” Jakarta.
        </p>
      </div>

      {/* FAQ Accordion Grid */}
      <div className="space-y-4 mb-14">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldQuestion className="w-5 h-5 text-teal-600" />
          Pertanyaan Sering Diajukan (FAQ)
        </h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-xs"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {faq.q}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 mx-auto mb-3 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Email Layanan</h4>
          <p className="text-xs text-slate-500 font-mono">cbt.feb@upnvj.ac.id</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto mb-3 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Helpdesk WhatsApp</h4>
          <p className="text-xs text-slate-500 font-mono">+62 812-9876-5432</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto mb-3 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Laboratorium Komputer</h4>
          <p className="text-xs text-slate-500">Gedung FEB Lt. 3, UPNVJ Pondok Labu</p>
        </div>
      </div>

    </div>
  );
};
