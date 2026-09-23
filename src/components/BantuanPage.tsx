import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Scale
} from 'lucide-react';

interface BantuanPageProps {
  onBack: () => void;
  onGoToRules?: () => void;
}

export const BantuanPage: React.FC<BantuanPageProps> = ({ onBack, onGoToRules }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana jika koneksi internet saya terputus saat sedang mengerjakan ujian?',
      a: 'Jangan panik! Seluruh jawaban yang telah Anda pilih tersimpan secara offline di browser lokal Anda. Tetap berada di halaman ujian dan periksa jaringan Anda. Begitu koneksi tersambung kembali, sistem akan otomatis menyinkronkan jawaban ke server Firestore.'
    },
    {
      q: 'Mengapa saya tidak dapat login menggunakan akun Google pribadi saya?',
      a: 'Sesuai dengan ketentuan keamanan akademik, sistem CBT FEB UPNVJ hanya mengizinkan akun email universitas resmi dengan domain @upnvj.ac.id. Akun selain domain tersebut otomatis ditolak oleh firewall sistem.'
    },
    {
      q: 'Apa yang terjadi jika durasi waktu ujian habis sebelum saya menekan tombol kumpulkan?',
      a: 'Sistem CBT dilengkapi mekanisme auto-submit. Begitu waktu countdown mencapai 00:00:00, lembar ujian otomatis dikunci dan seluruh jawaban terakhir yang tersimpan akan langsung dikirimkan ke server evaluasi.'
    },
    {
      q: 'Di mana saya dapat melihat nilai hasil ujian UTS/UAS?',
      a: 'Jika dosen pengampu mengaktifkan fitur tampilkan nilai, Anda dapat melihat skor langsung pada layar tanda terima setelah submit. Namun jika kebijakan dosen menghendaki kurasi penilaian, nilai resmi akan diumumkan secara kolektif via portal SIMAK UPNVJ.'
    },
    {
      q: 'Bagaimana jika soal bergambar atau formula matematika tidak muncul?',
      a: 'Gunakan fitur reload cache peramban dengan menekan tombol Ctrl + F5 (Windows) atau Cmd + Shift + R (Mac). Pastikan ekstensi pemblokir skrip seperti AdBlock telah dimatikan.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Beranda</span>
        </button>

        {onGoToRules && (
          <button
            onClick={onGoToRules}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-xs cursor-pointer"
          >
            <Scale className="w-4 h-4 text-teal-700" />
            <span>Peraturan & Ketentuan</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          Pusat Bantuan & FAQ
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ada Pertanyaan atau Kendala Teknis?
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Temukan jawaban atas pertanyaan umum seputar pelaksanaan CBT FEB atau hubungi tim helpdesk kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: FAQ Accordion (Col 1-8) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-xs sm:text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-teal-700 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Contact Helpdesk Card (Col 9-12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Layanan Helpdesk FEB
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-slate-900">Email CBT FEB</span>
                  <a href="mailto:cbt.feb@upnvj.ac.id" className="text-teal-700 hover:underline font-mono">
                    cbt.feb@upnvj.ac.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-slate-900">Telepon / WhatsApp</span>
                  <span className="font-mono text-slate-800">+62 812-9876-5432</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-slate-900">Jam Operasional Ujian</span>
                  <span>Senin – Jumat (07.30 – 17.00 WIB)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-slate-900">Ruang CBT Center</span>
                  <span>Gedung Moh. Yamin Lt. 2, FEB UPNVJ Kampus Pondok Labu</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a
                href="https://wa.me/6281298765432"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all cursor-pointer"
              >
                <span>Hubungi Pengawas via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
