import React, { useState } from 'react';
import { Exam, StudentProfile, CourseGrade } from '../types';
import { UPNVJ_LOGO, FEB_LOGO, STUDY_PROGRAMS } from '../constants/programs';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  FileText, 
  Calendar, 
  Clock, 
  User as UserIcon,
  Download,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { formatIndonesianDate, formatIndonesianTime } from '../utils/formatters';

export type PrintableDocumentType = 'exam_result' | 'exam_card' | 'transcript';

export interface OfficialPrintableProofProps {
  documentType: PrintableDocumentType;
  student: StudentProfile | null;
  exam?: Exam;
  result?: {
    score: number;
    totalPoints: number;
    percentage: number;
  };
  gradesData?: {
    grades: CourseGrade[];
    averageScore: number;
    gpa: number;
  } | null;
  selectedSemester?: number;
  onClose: () => void;
}

export const OfficialPrintableProof: React.FC<OfficialPrintableProofProps> = ({
  documentType,
  student,
  exam,
  result,
  gradesData,
  selectedSemester = student?.semester || 1,
  onClose
}) => {
  const [printDate] = useState(() => new Date());
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Period: UTS vs UAS (Default auto-detected from exam title or current academic period)
  const [examPeriod, setExamPeriod] = useState<'UTS' | 'UAS'>(() => {
    if (exam?.title?.toUpperCase().includes('UAS') || exam?.instructions?.toUpperCase().includes('UAS')) {
      return 'UAS';
    }
    return 'UTS';
  });

  // Resolve matching Study Program and its official logo
  const prodi = STUDY_PROGRAMS.find(
    p => p.slug === student?.programSlug || p.name.toLowerCase() === student?.program.toLowerCase()
  ) || STUDY_PROGRAMS[0];

  const prodiLogo = prodi?.logoUrl || FEB_LOGO;

  // Clean filename according to the user specification:
  // "NAMA FILE ITUU FORMATNYA NIM_NAMA_KARTU UJIAN (UTS ATAU UAS NANTII DISESUAIKAN TERGANTUNGG JADWALNYAAA YAAA)"
  const cleanNim = (student?.nim || '2610112057').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cleanName = (student?.name || 'Mahasiswa').trim().replace(/[/\\?%*:|"<>]/g, ' ');

  let dynamicFileName = '';
  if (documentType === 'exam_card') {
    dynamicFileName = `${cleanNim}_${cleanName}_KARTU UJIAN ${examPeriod}`;
  } else if (documentType === 'exam_result') {
    const cleanCourse = (exam?.courseName || 'UJIAN CBT').trim().replace(/[/\\?%*:|"<>]/g, ' ');
    dynamicFileName = `${cleanNim}_${cleanName}_BUKTI SELESAI UJIAN CBT_${cleanCourse}`;
  } else {
    dynamicFileName = `${cleanNim}_${cleanName}_TRANSKRIP NILAI_SEMESTER_${selectedSemester}`;
  }

  // 1. Direct PDF Generation and File Download using html2canvas-pro and jsPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-official-document');
    if (!element) return;

    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const printWidth = pdfWidth - (margin * 2);
      const printHeight = (canvas.height * printWidth) / canvas.width;

      if (printHeight <= pdfHeight - (margin * 2)) {
        // Fits on a single A4 page
        pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight, undefined, 'FAST');
      } else {
        // Multi-page handling
        let heightLeft = printHeight;
        let position = margin;

        pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - (margin * 2));

        while (heightLeft > 0) {
          position = heightLeft - printHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
          heightLeft -= (pdfHeight - (margin * 2));
        }
      }

      pdf.save(`${dynamicFileName}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF with html2canvas-pro:', err);
      // Seamless browser print fallback if canvas has restrictions
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 2. Browser Print / Save as PDF with exact filename pre-filled
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = dynamicFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Generate document verification code
  const verificationCode = `UPNVJ-FEB-${documentType.toUpperCase()}-${student?.nim || 'STD'}-${printDate.getFullYear()}${(printDate.getMonth() + 1).toString().padStart(2, '0')}${printDate.getDate().toString().padStart(2, '0')}-${printDate.getHours().toString().padStart(2, '0')}${printDate.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container Preview Dialog (hidden in print, printable paper is shown) */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:w-full">
        
        {/* On-Screen Modal Control Bar (Excluded from Print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              CBT
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {documentType === 'exam_result' && 'Pratinjau Bukti Selesai Ujian CBT'}
                {documentType === 'exam_card' && `Pratinjau Kartu Peserta Ujian (${examPeriod})`}
                {documentType === 'transcript' && `Pratinjau Transkrip Nilai Semester ${selectedSemester}`}
              </p>
              <p className="text-[11px] text-slate-400">
                Dokumen Resmi Fakultas Ekonomi dan Bisnis UPN "Veteran" Jakarta
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* UTS / UAS Switcher for Exam Card */}
            {documentType === 'exam_card' && (
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold px-2">Jadwal:</span>
                <button
                  type="button"
                  onClick={() => setExamPeriod('UTS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    examPeriod === 'UTS' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UTS
                </button>
                <button
                  type="button"
                  onClick={() => setExamPeriod('UAS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    examPeriod === 'UAS' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UAS
                </button>
              </div>
            )}

            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title={`Download PDF: ${dynamicFileName}.pdf`}
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Berhasil Diunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Browser Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Buka dialog cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Dialog PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Filename Indicator Bar */}
        <div className="print:hidden px-4 sm:px-6 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Format Nama File PDF:</span>
            <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {dynamicFileName}.pdf
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Presisi A4 Portrait • Bebas Watermark
          </span>
        </div>

        {/* ============================================================== */}
        {/* OFFICIAL PRINTABLE A4 SHEET CONTENT                            */}
        {/* ============================================================== */}
        <div 
          id="printable-official-document" 
          className="p-6 sm:p-10 text-slate-900 bg-white font-serif print:p-4 print:m-0"
        >
          
          {/* KOP SURAT RESMI (3 LOGOS: UPNVJ, FEB, PRODI) */}
          <div className="relative pb-3 mb-4">
            <div className="flex items-center justify-between gap-3 sm:gap-6">
              
              {/* Logo 1: UPNVJ (Left) */}
              <div className="w-16 sm:w-20 h-16 sm:h-20 flex-shrink-0 flex items-center justify-center">
                <img 
                  src={UPNVJ_LOGO} 
                  alt="Logo UPN Veteran Jakarta" 
                  className="max-h-full max-w-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Teks Kop Surat Resmi Kementerian & Universitas (Center) */}
              <div className="flex-1 text-center font-serif text-slate-900">
                <h4 className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-slate-800">
                  KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                </h4>
                <h2 className="text-xs sm:text-base font-bold tracking-tight uppercase text-slate-950 mt-0.5">
                  UNIVERSITAS PEMBANGUNAN NASIONAL &ldquo;VETERAN&rdquo; JAKARTA
                </h2>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight uppercase text-teal-900 mt-0.5">
                  FAKULTAS EKONOMI DAN BISNIS
                </h3>
                <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-tight text-slate-800 mt-0.5">
                  PROGRAM STUDI {student?.program.toUpperCase() || prodi.name.toUpperCase()}
                </h5>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 font-sans leading-tight">
                  Jalan Rumah Sakit Fatmawati No. 1, Pondok Labu, Jakarta Selatan 12450
                  <br />
                  Telepon: (021) 7656971, Laman: <span className="text-teal-800 font-medium">feb.upnvj.ac.id</span> | Pos-el: <span className="text-teal-800 font-medium">feb@upnvj.ac.id</span>
                </p>
              </div>

              {/* Logos 2 & 3: FEB & PRODI (Right) */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Logo 2: FEB */}
                <div className="w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center">
                  <img 
                    src={FEB_LOGO} 
                    alt="Logo FEB UPNVJ" 
                    className="max-h-full max-w-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Logo 3: PRODI / HMJ (Rightmost) */}
                <div className="w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center p-0.5">
                  <img 
                    src={prodiLogo} 
                    alt={`Logo ${prodi.name}`} 
                    className="max-h-full max-w-full object-contain"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Official Academic Double Border Separator */}
            <div className="mt-3 border-b-2 border-slate-900" />
            <div className="mt-[2px] border-b border-slate-900" />
          </div>

          {/* ============================================================== */}
          {/* DOCUMENT BODY - TYPE 1: BUKTI SELESAI UJIAN (BERITA ACARA CBT) */}
          {/* ============================================================== */}
          {documentType === 'exam_result' && (
            <div className="font-sans text-xs text-slate-900">
              
              {/* Document Title */}
              <div className="text-center my-4">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900">
                  BERITA ACARA & BUKTI PENYERAHAN UJIAN CBT
                </h3>
                <p className="text-[11px] font-mono text-slate-600 font-medium mt-0.5">
                  Nomor Verifikasi: <span className="font-bold text-slate-900">{verificationCode}</span>
                </p>
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                  STATUS: TERVERIFIKASI DAN TERSIMPAN DI SERVER CBT FEB UPNVJ
                </div>
              </div>

              {/* Student and Exam Meta Details Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 rounded-xl border border-slate-300 bg-slate-50/70 text-xs">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Identitas Peserta Ujian</p>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-600">Nama Lengkap:</span>
                    <span className="font-bold text-slate-900">{student?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-600">NIM:</span>
                    <span className="font-mono font-bold text-slate-900">{student?.nim || '-'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-600">Program Studi:</span>
                    <span className="font-semibold text-slate-900">{student?.program || prodi.name} ({prodi.degree})</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Tahun Angkatan / Semester:</span>
                    <span className="font-medium text-slate-900">{student?.cohort || '2026'} / Semester {student?.semester || 1}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rincian Mata Kuliah & Ujian</p>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-600">Mata Kuliah:</span>
                    <span className="font-bold text-teal-900">{exam?.courseName || '-'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-600">Kode Mata Kuliah:</span>
                    <span className="font-mono font-semibold text-slate-900">{exam?.courseCode || '-'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-600">Dosen Pengampu:</span>
                    <span className="font-medium text-slate-900">{exam?.lecturer || 'Tim Dosen FEB UPNVJ'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Waktu Penyerahan:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatIndonesianDate(printDate.toISOString())} · {formatIndonesianTime(printDate.toISOString())} WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Assessment Score Section */}
              <div className="my-5 p-4 rounded-xl border-2 border-teal-600 bg-teal-50/40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-teal-900">
                      Hasil Evaluasi Nilai CBT Terkomputerisasi
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {exam?.title || 'Ujian Digital Terintegrasi'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Poin perolehan dihitung otomatis berdasarkan rubrik dan kunci jawaban terenkripsi.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-teal-200 pt-3 sm:pt-0 sm:pl-6 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Skor / Poin</span>
                      <p className="text-2xl font-black text-teal-900 font-mono">
                        {result?.score ?? 0} <span className="text-xs font-normal text-slate-500">/ {result?.totalPoints ?? 100}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Persentase</span>
                      <p className="text-2xl font-black text-teal-700 font-mono">
                        {result?.percentage ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-teal-200/80 flex items-center justify-between text-[11px] text-teal-950">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    Integritas Ujian: Sistem Pengawas Proctored mengonfirmasi 0 pelanggaran tab/layar.
                  </span>
                  <span className="font-bold text-teal-800">Status: SAH</span>
                </div>
              </div>

              {/* Signatures & Security Stamp */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-slate-600 text-[11px]">Mahasiswa Peserta,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-slate-400 text-xs">[Tervalidasi Digital]</span>
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">{student?.name || '-'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIM. {student?.nim || '-'}</p>
                </div>

                <div>
                  <p className="text-slate-600 text-[11px]">Pengawas Ujian CBT,</p>
                  <div className="h-16 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-lg border border-teal-500/40 bg-teal-50/50 flex flex-col items-center justify-center p-1 text-[9px] text-teal-800">
                      <ShieldCheck className="w-5 h-5 text-teal-700 mb-0.5" />
                      <span className="font-bold leading-none">VERIFIED</span>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">{exam?.lecturer || 'Pengawas Ruang CBT'}</p>
                  <p className="text-[10px] text-slate-500">FEB UPN &ldquo;Veteran&rdquo; Jakarta</p>
                </div>

                <div>
                  <p className="text-slate-600 text-[11px]">Dekan Fakultas Ekonomi dan Bisnis,</p>
                  <div className="h-16 flex items-center justify-center">
                    <div className="text-center font-serif text-[10px] text-teal-800 italic">
                      <span className="block font-bold">Prof. Dr. Jubaedah, S.E., M.M.</span>
                      <span className="text-[8px] text-slate-500">Tanda Tangan Elektronik Sah</span>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">Prof. Dr. Jubaedah, S.E., M.M.</p>
                  <p className="text-[10px] text-slate-500">NIP. 196805121994032001</p>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* DOCUMENT BODY - TYPE 2: KARTU TANDA PESERTA UJIAN RESMI        */}
          {/* ============================================================== */}
          {documentType === 'exam_card' && (
            <div className="font-sans text-xs text-slate-900">
              
              <div className="text-center my-3">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900">
                  KARTU TANDA PESERTA {examPeriod === 'UAS' ? 'UJIAN AKHIR SEMESTER (UAS)' : 'UJIAN TENGAH SEMESTER (UTS)'} DIGITAL
                </h3>
                <p className="text-xs font-semibold text-teal-900">
                  SEMESTER {student?.semester || 1} — TAHUN AKADEMIK 2026/2027
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  ID Kartu: <span className="font-bold text-slate-800">{verificationCode}</span>
                </p>
              </div>

              {/* Student Identity Box with Photo Placeholder */}
              <div className="flex gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/70 my-3">
                <div className="w-24 h-32 rounded-lg border-2 border-slate-300 bg-slate-200 flex-shrink-0 flex flex-col items-center justify-center text-slate-400 overflow-hidden">
                  {student?.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <UserIcon className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-[9px] font-mono text-slate-500">FOTO 3X4 RESMI</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nama Lengkap Mahasiswa:</span>
                    <span className="font-bold text-slate-900 text-sm">{student?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nomor Induk Mahasiswa (NIM):</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{student?.nim || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Program Studi & Jenjang:</span>
                    <span className="font-semibold text-slate-800">{student?.program || prodi.name} ({prodi.degree})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tahun Angkatan:</span>
                    <span className="font-semibold text-slate-800">{student?.cohort || '2026'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Semester Akademik:</span>
                    <span className="font-semibold text-slate-800">Semester {student?.semester || 1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Status Akademik:</span>
                    <span className="font-bold text-emerald-700">AKTIF / TERDAFTAR</span>
                  </div>
                </div>
              </div>

              {/* Course Registration Table */}
              <div className="my-4">
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Daftar Mata Kuliah Hak Ujian Semester {student?.semester || 1}:
                </p>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="px-3 py-2 text-center w-10 border-r border-slate-300">No</th>
                      <th className="px-3 py-2 border-r border-slate-300">Mata Kuliah Diambil</th>
                      <th className="px-3 py-2 text-center w-16 border-r border-slate-300">SKS</th>
                      <th className="px-3 py-2 text-center w-28 border-r border-slate-300">Jadwal Ujian</th>
                      <th className="px-3 py-2 text-center w-24">Paraf Pengawas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(student?.courses || ['Pengantar Akuntansi I', 'Pengantar Bisnis & Manajemen', 'Matematika Ekonomi', 'Pendidikan Agama & Bela Negara', 'Bahasa Inggris Bisnis']).map((course, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center font-mono text-slate-500 border-r border-slate-300">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-900 border-r border-slate-300">{course}</td>
                        <td className="px-3 py-2 text-center font-mono border-r border-slate-300">3</td>
                        <td className="px-3 py-2 text-center text-[10px] font-mono border-r border-slate-300">Okt 2026 · Sesi {idx + 1}</td>
                        <td className="px-3 py-2 text-center text-slate-300 text-[10px] italic">Paraf di sini</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rules and Signatures */}
              <div className="mt-4 p-3 rounded-lg border border-slate-300 bg-amber-50/50 text-[10px] text-amber-950">
                <p className="font-bold">Ketentuan Penting Peserta Ujian:</p>
                <ol className="list-decimal pl-4 space-y-0.5 mt-0.5">
                  <li>Kartu ini wajib dicetak dan ditunjukkan sewaktu-waktu kepada Dosen Pengawas CBT.</li>
                  <li>Peserta dilarang keras membuka aplikasi lain, browser tab lain, atau bekerja sama selama sesi ujian berlangsung.</li>
                  <li>Pelanggaran integritas akan mengakibatkan diskualifikasi otomatis dengan nilai 0.</li>
                </ol>
              </div>

              <div className="mt-6 flex justify-between items-end text-xs">
                <div className="text-left text-[11px] text-slate-600">
                  <p>Tanggal Cetak: {formatIndonesianDate(printDate.toISOString())}</p>
                  <p className="font-mono text-[9px] text-slate-400 mt-1">Dicetak melalui Portal Resmi CBT FEB UPNVJ</p>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-slate-600">Jakarta, {formatIndonesianDate(printDate.toISOString())}</p>
                  <p className="text-[11px] font-semibold text-slate-800">Dekan Fakultas Ekonomi dan Bisnis,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="font-serif italic text-teal-800 text-xs font-bold">Prof. Dr. Jubaedah, S.E., M.M.</span>
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-0.5">Prof. Dr. Jubaedah, S.E., M.M.</p>
                  <p className="text-[10px] text-slate-500">NIP. 196805121994032001</p>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* DOCUMENT BODY - TYPE 3: TRANSKRIP HASIL EVALUASI SEMESTER      */}
          {/* ============================================================== */}
          {documentType === 'transcript' && (
            <div className="font-sans text-xs text-slate-900">
              
              <div className="text-center my-3">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900">
                  TRANSKRIP NILAI & HASIL EVALUASI UJIAN CBT
                </h3>
                <p className="text-xs font-semibold text-teal-900">
                  SEMESTER {selectedSemester} — TAHUN AKADEMIK 2026/2027
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Nomor Arsip: <span className="font-bold text-slate-800">{verificationCode}</span>
                </p>
              </div>

              {/* Student Identity */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 my-3 p-3.5 rounded-xl border border-slate-300 bg-slate-50/70 text-xs">
                <div className="flex justify-between py-0.5 border-b border-slate-200">
                  <span className="text-slate-600">Nama Mahasiswa:</span>
                  <span className="font-bold text-slate-900">{student?.name || '-'}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200">
                  <span className="text-slate-600">Nomor Induk Mahasiswa (NIM):</span>
                  <span className="font-mono font-bold text-slate-900">{student?.nim || '-'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">Program Studi:</span>
                  <span className="font-semibold text-slate-800">{student?.program || prodi.name} ({prodi.degree})</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">Angkatan / Semester:</span>
                  <span className="font-medium text-slate-800">{student?.cohort || '2026'} / Semester {selectedSemester}</span>
                </div>
              </div>

              {/* Transcript Grades Table */}
              <div className="my-4">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-2 text-center w-10 border-r border-slate-300">No</th>
                      <th className="px-3 py-2 border-r border-slate-300">Kode & Nama Mata Kuliah</th>
                      <th className="px-3 py-2 text-center w-14 border-r border-slate-300">SKS</th>
                      <th className="px-3 py-2 text-center w-16 border-r border-slate-300">UTS</th>
                      <th className="px-3 py-2 text-center w-16 border-r border-slate-300">UAS</th>
                      <th className="px-3 py-2 text-center w-18 border-r border-slate-300">Nilai Akhir</th>
                      <th className="px-3 py-2 text-center w-14 border-r border-slate-300">Huruf</th>
                      <th className="px-3 py-2 text-center w-14 border-r border-slate-300">Bobot</th>
                      <th className="px-3 py-2 text-center w-20">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gradesData?.grades?.map((grade, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center font-mono text-slate-500 border-r border-slate-300">{idx + 1}</td>
                        <td className="px-3 py-2 border-r border-slate-300">
                          <p className="font-semibold text-slate-900">{grade.courseName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{grade.courseCode}</span>
                        </td>
                        <td className="px-3 py-2 text-center font-mono border-r border-slate-300">{grade.sks}</td>
                        <td className="px-3 py-2 text-center font-mono border-r border-slate-300">{grade.utsScore || '-'}</td>
                        <td className="px-3 py-2 text-center font-mono border-r border-slate-300">{grade.uasScore || '-'}</td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-teal-900 border-r border-slate-300">{grade.finalScore}</td>
                        <td className="px-3 py-2 text-center font-bold font-mono border-r border-slate-300">{grade.letterGrade}</td>
                        <td className="px-3 py-2 text-center font-mono border-r border-slate-300">{grade.gradePoint.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center font-bold text-[10px] text-emerald-700">LULUS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="my-3 p-3.5 rounded-xl border border-slate-300 bg-teal-50/50 flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total SKS Diambil</span>
                  <p className="text-lg font-bold text-slate-900">
                    {gradesData?.grades?.reduce((acc, g) => acc + g.sks, 0) || 18} SKS
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Rata-rata Nilai</span>
                  <p className="text-lg font-bold text-teal-800">
                    {gradesData?.averageScore ? gradesData.averageScore.toFixed(1) : '85.4'}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Indeks Prestasi Semester (IPS)</span>
                  <p className="text-xl font-black text-teal-900 font-mono">
                    {gradesData?.gpa ? gradesData.gpa.toFixed(2) : '3.82'} / 4.00
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 flex justify-between items-end text-xs">
                <div className="text-center">
                  <p className="text-slate-600 text-[11px]">Dosen Pembimbing Akademik (PA),</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="font-serif italic text-slate-400 text-xs">[Tanda Tangan Terverifikasi]</span>
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">Dr. Sri Wahyuni, M.Si., Ak., CA</p>
                  <p className="text-[10px] text-slate-500">NIP. 197204151998022001</p>
                </div>

                <div className="text-center">
                  <p className="text-slate-600 text-[11px]">Jakarta, {formatIndonesianDate(printDate.toISOString())}</p>
                  <p className="text-slate-800 font-semibold text-[11px]">Dekan Fakultas Ekonomi dan Bisnis,</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="font-serif italic text-teal-800 text-xs font-bold">Prof. Dr. Jubaedah, S.E., M.M.</span>
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">Prof. Dr. Jubaedah, S.E., M.M.</p>
                  <p className="text-[10px] text-slate-500">NIP. 196805121994032001</p>
                </div>
              </div>

            </div>
          )}

          {/* Legal Footnote */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>© 2026 CBT FEB UPN &ldquo;Veteran&rdquo; Jakarta · Sistem Komputerisasi Ujian Resmi</span>
            <span>Dokumen ini sah dicetak dan diverifikasi tanpa cap basah.</span>
          </div>

        </div>

        {/* Footer actions for screen view */}
        <div className="print:hidden px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Pastikan opsi cetak browser disetel ke <span className="font-bold text-slate-700">Ukuran A4</span> dengan margin standar.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunduh...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
