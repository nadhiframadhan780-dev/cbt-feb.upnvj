import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Laptop, 
  Wifi, 
  Clock, 
  Scale, 
  Download, 
  HelpCircle, 
  GraduationCap, 
  BookOpen, 
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { UPNVJ_LOGO } from '../constants/programs';

interface PeraturanKetentuanPageProps {
  onBack: () => void;
  onGoToExam: () => void;
}

export const PeraturanKetentuanPage: React.FC<PeraturanKetentuanPageProps> = ({ onBack, onGoToExam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>('tata-tertib');

  const categories = [
    { id: 'all', label: 'Semua Ketentuan' },
    { id: 'syarat', label: '1. Syarat Peserta' },
    { id: 'perangkat', label: '2. Perangkat & Teknis' },
    { id: 'tata-tertib', label: '3. Tata Tertib Ujian' },
    { id: 'pelanggaran', label: '4. Pelanggaran & Sanksi' },
    { id: 'kendala', label: '5. Force Majeure' },
    { id: 'penilaian', label: '6. Penyerahan & Nilai' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Dokumen</span>
          </button>

          <button
            onClick={onGoToExam}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm"
          >
            <span>Masuk ke Ujian</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl mb-10 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/50 text-teal-200 text-xs font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            Pedoman Standar Akademik FEB UPNVJ
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Peraturan & Ketentuan Pelaksanaan Ujian CBT
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Tata tertib resmi pelaksanaan Ujian Tengah Semester (UTS) dan Ujian Akhir Semester (UAS) berbasis komputer pada Fakultas Ekonomi dan Bisnis UPN “Veteran” Jakarta. Seluruh sivitas akademika wajib menegakkan kejujuran dan disiplin Bela Negara.
          </p>

          <div className="mt-6 pt-6 border-t border-teal-700/60 flex flex-wrap items-center gap-6 text-xs text-teal-200 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SK Dekan FEB No. 104/UN61.1/AK/2026
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Pakta Integritas Mahasiswa Bela Negara
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-300" />
              Berlaku Semester Gasal & Genap 2026/2027
            </span>
          </div>
        </div>
      </div>

      {/* KETENTUAN KHUSUS SMARTPHONE / HP (Requirement 9) */}
      <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-400 shadow-sm mb-8 flex flex-col md:flex-row items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <Clock className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider">
              Penting & Wajib Dibaca
            </span>
            <span className="text-xs font-bold text-amber-900">Ketentuan Pengerjaan Melalui Smartphone / HP</span>
          </div>
          <h3 className="text-base font-extrabold text-amber-950 mt-1">
            Wajib Mengatur Waktu Tunggu Layar (Screen Timeout) Minimal 30 Menit
          </h3>
          <p className="text-xs text-amber-900 leading-relaxed mt-1.5">
            Bagi mahasiswa yang terpaksa mengerjakan soal menggunakan Smartphone/HP, <b>WAJIB mengatur batas waktu tidur layar (Screen Timeout / Layar Kunci Otomatis) sekurang-kurangnya 30 menit atau 'Jangan Pernah Mati'</b> sebelum menekan tombol Mulai Ujian. 
          </p>
          <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
            <p className="font-semibold text-amber-900">Mengapa pengaturan ini mutlak diperlukan?</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Jika layar ponsel padam/mati saat Anda sedang membaca soal atau berpikir, sistem operasi seluler akan memicu pemutusan fokus browser (blur/hidden event). Hal ini akan <b>secara otomatis terhitung oleh sistem pengawas sebagai aktivitas keluar dari tab (indikasi kecurangan)</b>. Jika peringatan terakumulasi lebih dari 3 kali, ujian Anda akan otomatis terkumpul dengan <b>NILAI 0</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills & Quick Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari kata kunci aturan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* SECTION 1: Syarat & Ketentuan Umum Peserta */}
      {(activeCategory === 'all' || activeCategory === 'syarat') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Bagian I</span>
              <h2 className="text-lg font-bold text-slate-900">Ketentuan Umum & Persyaratan Peserta Ujian</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>1. Terdaftar Aktif Pada Semester Berjalan</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">
                Mahasiswa wajib terdaftar aktif secara akademis dan administrasi pada semester berjalan. Mata kuliah yang diujikan harus tercantum secara sah pada Kartu Rencana Studi (KRS) yang telah divalidasi oleh Dosen Pembimbing Akademik (PA).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>2. Wajib Menggunakan Akun Google Institusi</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">
                Autentikasi ke sistem CBT FEB hanya diperkenankan menggunakan akun Google dengan domain resmi universitas (<span className="font-mono text-teal-700 font-semibold">@upnvj.ac.id</span>). Akun pribadi (seperti @gmail.com) otomatis ditolak oleh firewall sistem.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>3. Verifikasi Data Mahasiswa (NIM & Angkatan)</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">
                Peserta wajib memastikan Nama Lengkap, Nomor Induk Mahasiswa (NIM), Program Studi, dan Angkatan sesuai dengan data resmi pada Pangkalan Data Pendidikan Tinggi (PDDikti) dan SIMAK FEB UPNVJ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>4. Kewajiban Menyiapkan Identitas Resmi</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">
                Peserta wajib menyiapkan Kartu Tanda Mahasiswa (KTM) fisik/digital atau Kartu Ujian Resmi yang dicetak melalui sistem SIMAK untuk keperluan verifikasi sewaktu-waktu oleh Dosen Pengawas.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: Standar Perangkat & Spesifikasi Teknis */}
      {(activeCategory === 'all' || activeCategory === 'perangkat') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Bagian II</span>
              <h2 className="text-lg font-bold text-slate-900">Standar Perangkat Komputer & Spesifikasi Teknis</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-teal-600" />
                Perangkat Komputer / Laptop
              </h3>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
                <li>Sistem operasi: Windows 10/11, macOS Catalina+, atau Linux.</li>
                <li>RAM minimal 4 GB (disarankan 8 GB).</li>
                <li>Tidak diperkenankan menggunakan Smartphone/HP untuk mengerjakan ujian utama karena keterbatasan resolusi dan render formula.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Peramban Web (Browser)
              </h3>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
                <li>Wajib menggunakan Google Chrome versi 120+ atau Microsoft Edge terbaru.</li>
                <li>Aktifkan JavaScript dan Local Storage pada setelan peramban.</li>
                <li>Nonaktifkan ekstensi pemblokir skrip (AdBlock, NoScript) atau ekstensi pihak ketiga yang berpotensi mengganggu auto-save.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-teal-600" />
                Koneksi Internet & Catu Daya
              </h3>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
                <li>Kecepatan internet stabil minimal 5 Mbps.</li>
                <li>Pastikan daya baterai terisi penuh dan laptop tersambung langsung ke charger selama pengerjaan.</li>
                <li>Siapkan paket data seluler cadangan (tethering) apabila jaringan WiFi utama mengalami penurunan kecepatan.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: Tata Tertib Saat Ujian Berlangsung */}
      {(activeCategory === 'all' || activeCategory === 'tata-tertib') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Bagian III</span>
              <h2 className="text-lg font-bold text-slate-900">Tata Tertib & Kode Etik Pengerjaan Ujian</h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
              <div>
                <h3 className="font-bold text-teal-900 text-sm">Hadir di Portal CBT 15 Menit Sebelum Ujian</h3>
                <p className="text-teal-800 leading-relaxed mt-0.5">
                  Peserta wajib membuka portal CBT FEB dan menyelesaikan tahapan login Google serta pemilihan prodi sekurang-kurangnya 15 menit sebelum jadwal mulai. Keterlambatan tidak akan menambah durasi ujian.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Integritas Pengerjaan Mandiri</h3>
                <p className="text-slate-600 leading-relaxed mt-0.5">
                  Ujian bersifat mandiri dan tertutup (closed-book), kecuali jika ada instruksi tertulis khusus dari Dosen Pengampu pada lembar soal. Dilarang berdiskusi, meminta bantuan orang lain, atau bertukar jawaban dalam bentuk apa pun.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Larangan Membuka Tab & Aplikasi Tambahan</h3>
                <p className="text-slate-600 leading-relaxed mt-0.5">
                  Selama timer ujian berjalan, peserta dilarang membuka tab peramban baru, mencari jawaban via Search Engine, menggunakan generator AI (ChatGPT, Gemini, dsb.), atau menjalankan aplikasi remote desktop.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pemantauan Aktivitas Layar (Activity Tracking)</h3>
                <p className="text-slate-600 leading-relaxed mt-0.5">
                  Sistem CBT FEB dilengkapi pemantau perpindahan fokus tab (blur/focus events). Setiap kali jendela ujian diminimalkan atau beralih ke tab lain, sistem mencatat log insiden dan melaporkannya ke lembar berita acara pengawas.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">5</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Larangan Penggandaan & Penyebarluasan Soal</h3>
                <p className="text-slate-600 leading-relaxed mt-0.5">
                  Seluruh butir soal, studi kasus, gambar, dan instrumen evaluasi merupakan dokumen rahasia akademik Fakultas Ekonomi dan Bisnis UPNVJ. Tindakan mengambil tangkapan layar (screenshot), memfoto layar dengan ponsel, atau membagikan soal ke media sosial adalah pelanggaran berat UU Hak Cipta dan Statuta UPNVJ.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Klasifikasi Pelanggaran & Sanksi Akademik */}
      {(activeCategory === 'all' || activeCategory === 'pelanggaran') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Bagian IV</span>
              <h2 className="text-lg font-bold text-slate-900">Klasifikasi Pelanggaran & Sanksi Disiplin Akademik</h2>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-1/4">Tingkat Pelanggaran</th>
                  <th className="px-5 py-3.5 w-2/4">Bentuk Tindakan Pelanggaran</th>
                  <th className="px-5 py-3.5 w-1/4">Sanksi Disiplin Bela Negara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-amber-700 align-top">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200">
                      Pelanggaran Ringan
                    </span>
                  </td>
                  <td className="px-5 py-4 space-y-1 align-top">
                    <p>• Terlambat masuk ke ruang ujian tanpa pemberitahuan sah.</p>
                    <p>• Tidak menyiapkan tanda pengenal identitas mahasiswa (KTM/KRS).</p>
                    <p>• Membuka tab lain tanpa indikasi menyalin jawaban.</p>
                  </td>
                  <td className="px-5 py-4 text-slate-800 font-semibold align-top">
                    Teguran tertulis dari Pengawas dan pengurangan nilai ujian sebesar 10% s.d. 20%.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-orange-700 align-top">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200">
                      Pelanggaran Sedang
                    </span>
                  </td>
                  <td className="px-5 py-4 space-y-1 align-top">
                    <p>• Bekerja sama atau berdiskusi dengan sesama peserta ujian.</p>
                    <p>• Menggunakan catatan/buku referensi pada mata kuliah closed-book.</p>
                    <p>• Menggunakan bantuan tool AI tanpa izin dosen pengampu.</p>
                  </td>
                  <td className="px-5 py-4 text-rose-700 font-semibold align-top">
                    Pembatalan nilai ujian pada mata kuliah bersangkutan (Dinyatakan mendapat <span className="font-bold text-rose-800 font-mono">Nilai E</span>).
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-rose-700 align-top">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200">
                      Pelanggaran Berat
                    </span>
                  </td>
                  <td className="px-5 py-4 space-y-1 align-top">
                    <p>• Menggunakan jasa Joki Ujian (dikerjakan oleh orang lain).</p>
                    <p>• Menjadi joki atau membantu mengerjakan ujian orang lain.</p>
                    <p>• Memotret, merekam, atau menyebarkan soal ujian ke grup publik / komersial.</p>
                    <p>• Melakukan hacking, peretasan database CBT, atau eksploitasi sistem.</p>
                  </td>
                  <td className="px-5 py-4 text-rose-800 font-bold align-top">
                    Nilai E pada seluruh mata kuliah semester berjalan, Skorsing Akademik selama 1–2 Semester, dan Sidang Komite Etik Dekanat FEB UPNVJ.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 5: Prosedur Kendala Teknis (Force Majeure) */}
      {(activeCategory === 'all' || activeCategory === 'kendala') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Bagian V</span>
              <h2 className="text-lg font-bold text-slate-900">Prosedur Penanganan Kendala Teknis (Force Majeure)</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4 text-teal-600" />
                Jika Terjadi Gangguan Internet / Mati Listrik
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sistem CBT FEB dilengkapi teknologi <span className="font-semibold text-slate-800">Auto-Save & Offline Resilience</span>. Seluruh jawaban yang telah dipilih tetap aman di memori lokal peramban. Begitu koneksi internet pulih, sistem akan otomatis mengirimkan jawaban ke server Firestore tanpa ada data yang hilang.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Batas Waktu Lapor ke Helpdesk CBT
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Apabila peserta mengalami kendala teknis fatal yang tidak dapat diselesaikan secara mandiri, wajib segera menghubungi Helpdesk CBT FEB via WhatsApp (<span className="font-mono font-semibold text-teal-700">+62 812-9876-5432</span>) maksimal <span className="font-bold text-slate-900">10 menit</span> setelah kejadian dengan menyertakan bukti foto layar dan identitas.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: Tata Cara Pengumpulan & Pengumuman Nilai */}
      {(activeCategory === 'all' || activeCategory === 'penilaian') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Bagian VI</span>
              <h2 className="text-lg font-bold text-slate-900">Ketentuan Penyerahan Lembar Jawaban & Nilai Akhir</h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h3 className="font-bold text-emerald-950 mb-1">1. Konfirmasi Penyerahan Ujian</h3>
              <p className="leading-relaxed">
                Sebelum mengakhiri ujian, pastikan indikator seluruh nomor soal telah berwarna hijau (terjawab). Klik tombol <b>"Kumpulkan Ujian"</b> dan pastikan layar peramban beralih ke halaman konfirmasi bertanda centang hijau dengan teks: <i>"Ujian Berhasil Dikumpulkan & Terkunci"</i>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">2. Auto-Submit Saat Timer Berakhir</h3>
              <p className="leading-relaxed">
                Apabila batas waktu pengerjaan habis sebelum peserta menekan tombol kumpulkan, sistem CBT FEB secara otomatis mengunci lembar ujian dan mengirimkan seluruh jawaban terakhir yang tersimpan ke server.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">3. Kebijakan Nilai & Masa Sanggah</h3>
              <p className="leading-relaxed">
                Nilai akhir hasil evaluasi UTS dan UAS akan dipublikasikan oleh Dosen Pengampu melalui portal SIMAK UPNVJ sesuai kalender akademik. Pengajuan sanggah nilai dilayani paling lambat <span className="font-bold text-slate-800">3 × 24 jam</span> setelah pengumuman nilai resmi.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Agreement Call To Action */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border-2 border-teal-600/60 p-8 sm:p-10 text-center shadow-md">
        <ShieldCheck className="w-12 h-12 text-teal-700 mx-auto mb-3" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Komitmen Integritas Akademik Bela Negara
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Dengan mengikuti ujian CBT FEB UPN “Veteran” Jakarta, Anda secara sadar menyatakan telah membaca, memahami, dan berjanji menjunjung tinggi kejujuran serta bersedia menerima seluruh konsekuensi peraturan di atas.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGoToExam}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md shadow-teal-700/25 transition-all cursor-pointer hover:scale-105"
          >
            <span>Saya Menyetujui & Siap Mulai Ujian</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
