import { StudyProgram } from '../types';

export const UPNVJ_LOGO = 'https://www.upnvj.ac.id/id/files/thumb/89f8a80e388ced3704b091e21f510755/520';
export const FEB_LOGO = 'https://feb.upnvj.ac.id/wp-content/uploads/2021/07/logo-feb.png';

export const STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: 'd3-perbankan-keuangan',
    name: 'D3 Perbankan dan Keuangan',
    shortName: 'D3 Perbankan & Keuangan',
    degree: 'D3',
    slug: 'cbt-d3-perbankan-keuangan',
    pageUrl: 'cbt-d3-perbankan-keuangan.upnvj.html',
    logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2021/01/HMJ_DPK_-_FEB-removebg-preview-2.png',
    description: 'Menghasilkan lulusan ahli madya profesional, kompeten di bidang operasional perbankan, pasar modal, dan tata kelola keuangan modern.',
    active: true,
  },
  {
    id: 'd3-akuntansi',
    name: 'D3 Akuntansi',
    shortName: 'D3 Akuntansi',
    degree: 'D3',
    slug: 'cbt-d3-akuntansi',
    pageUrl: 'cbt-d3-akuntansi.upnvj.html',
    logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2023/06/d3-ak.jpeg',
    description: 'Fokus pada keahlian praktis pelaporan keuangan, perpajakan, audit terapan, dan pemanfaatan perangkat lunak akuntansi standar industri.',
    active: true,
  },
  {
    id: 's1-manajemen',
    name: 'S1 Manajemen',
    shortName: 'S1 Manajemen',
    degree: 'S1',
    slug: 'cbt-s1-manajemen',
    pageUrl: 'cbt-s1-manajemen.upnvj.html',
    logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2021/01/HMJ_SIM_-_FEB-removebg-preview-2-220x220.png',
    description: 'Mempersiapkan calon manajer, wirausahawan, dan konsultan strategis dengan keunggulan inovasi digital dan kepemimpinan berwawasan kebangsaan.',
    active: true,
  },
  {
    id: 's1-akuntansi',
    name: 'S1 Akuntansi',
    shortName: 'S1 Akuntansi',
    degree: 'S1',
    slug: 'cbt-s1-akuntansi',
    pageUrl: 'cbt-s1-akuntansi.upnvj.html',
    logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2023/06/AK-s1-220x220.png',
    description: 'Mendidik akuntan berintegritas tinggi dengan keahlian IFRS, analisis audit, akuntansi forensik, dan tata kelola korporasi bereputasi.',
    active: true,
  },
  {
    id: 's1-ekonomi-syariah',
    name: 'S1 Ekonomi Syariah',
    shortName: 'S1 Ekonomi Syariah',
    degree: 'S1',
    slug: 'cbt-s1-ekonomi-syariah',
    pageUrl: 'cbt-s1-ekonomi-syariah.upnvj.html',
    logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2021/01/HMJ_ES_-_FEB-removebg-preview-2-220x220.png',
    description: 'Mengembangkan keilmuan ekonomi dan perbankan syariah yang adaptif terhadap teknologi keuangan islam, fatwa DSN, dan filantropi islam.',
    active: true,
  },
  {
    id: 's1-ekonomi-pembangunan',
    name: 'S1 Ekonomi Pembangunan',
    shortName: 'S1 Ekonomi Pembangunan',
    degree: 'S1',
    slug: 'cbt-s1-ekonomi-pembangunan',
    pageUrl: 'cbt-s1-ekonomi-pembangunan.upnvj.html',
    logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2021/01/HMJ-EP-FEB-3-220x220.png',
    description: 'Kajian mendalam kebijakan makroekonomi, perencanaan pembangunan berkelanjutan, ekonometrika terapan, dan ekonomi publik terpadu.',
    active: true,
  },
];

export const COHORTS = ['2023', '2024', '2025', '2026'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Standard Semester Courses per Study Program for quick selection & auto-fill
export const PRODI_COURSES_MAP: Record<string, Record<number, string[]>> = {
  'cbt-s1-akuntansi': {
    1: ['Pengantar Akuntansi I', 'Pengantar Bisnis & Manajemen', 'Matematika Ekonomi', 'Pendidikan Agama & Bela Negara', 'Bahasa Inggris Bisnis'],
    2: ['Pengantar Akuntansi II', 'Statistika Ekonomi', 'Mikroekonomi Terapan', 'Hukum Bisnis & Etika Profesi', 'Sistem Informasi Manajemen'],
    3: ['Akuntansi Keuangan Menengah I', 'Akuntansi Biaya', 'Makroekonomi', 'Perpajakan I', 'Sistem Informasi Akuntansi'],
    4: ['Akuntansi Keuangan Menengah II', 'Akuntansi Manajemen', 'Perpajakan II', 'Metodologi Penelitian Akuntansi', 'Manajemen Keuangan'],
    5: ['Akuntansi Keuangan Lanjutan I', 'Auditing I', 'Teori Akuntansi', 'Akuntansi Sektor Publik', 'Analisis Laporan Keuangan'],
    6: ['Akuntansi Keuangan Lanjutan II', 'Auditing II & Praktikum', 'Audit Forensik & Investigasi Keuangan', 'Manajemen Stratejik', 'Perilaku Organisasi'],
    7: ['Seminar Akuntansi Keuangan', 'Tata Kelola Korporasi (GCG)', 'Akuntansi Keberlanjutan & ESG', 'Kapita Selekta Akuntansi'],
    8: ['Skripsi / Tugas Akhir', 'Praktik Kerja Lapangan (Magang Industri)']
  },
  'cbt-s1-manajemen': {
    1: ['Pengantar Manajemen', 'Pengantar Bisnis Digital', 'Matematika Bisnis', 'Pendidikan Karakter Bela Negara', 'Bahasa Indonesia Ilmiah'],
    2: ['Manajemen Pemasaran', 'Manajemen Operasional', 'Mikroekonomi', 'Statistika Bisnis', 'Komunikasi Bisnis & Negosiasi'],
    3: ['Manajemen Keuangan Korporasi', 'Manajemen Sumber Daya Manusia', 'Makroekonomi Bisnis', 'Perilaku Konsumen', 'Riset Pemasaran'],
    4: ['Manajemen Stratejik', 'Manajemen Risiko Bisnis', 'Pasar Modal & Portofolio', 'Kewirausahaan & Inovasi', 'E-Commerce & Digital Marketing'],
    5: ['Manajemen Keuangan Internasional', 'Manajemen Rantai Pasok (SCM)', 'Pengembangan Organisasi', 'Metodologi Penelitian Manajemen', 'Studi Kelayakan Bisnis'],
    6: ['Manajemen Proyek Digital', 'Etika Bisnis & Tanggung Jawab Sosial', 'Kepemimpinan Transformatif', 'Pemasaran Global', 'Seminar Manajemen'],
    7: ['Kapita Selekta Manajemen', 'Magang Merdeka Kampus Merdeka (MBKM)', 'Proyek Kewirausahaan Terapan'],
    8: ['Skripsi / Ujian Komprehensif Manajemen']
  },
  'cbt-d3-perbankan-keuangan': {
    1: ['Pengantar Ilmu Perbankan', 'Dasar-dasar Akuntansi', 'Matematika Keuangan', 'Bela Negara & Kepribadian', 'Operasional Frontliner'],
    2: ['Operasional Lembaga Perbankan & Syariah', 'Akuntansi Perbankan', 'Manajemen Perkreditan', 'Pelayanan Nasabah Prima (Service Excellence)', 'Hukum Perbankan'],
    3: ['Manajemen Dana & Likuiditas Bank', 'Praktikum Teller & Customer Service', 'Analisis Laporan Keuangan Bank', 'Perpajakan Lembaga Keuangan', 'Aplikasi Komputer Perbankan'],
    4: ['Manajemen Risiko Perbankan', 'Pasar Modal & Instrumen Keuangan', 'Teknologi Finansial (Fintech)', 'Audit Internal Perbankan', 'Metodologi Tugas Akhir'],
    5: ['Simulasi Mini Bank', 'Pemasaran Produk Keuangan', 'Praktik Kerja Lapangan (PKL Perbankan)', 'Etika Profesi Bankir'],
    6: ['Karya Tulis Ilmiah / Tugas Akhir Terapan', 'Ujian Sertifikasi Kompetensi Perbankan (LSP)']
  },
  'cbt-d3-akuntansi': {
    1: ['Pengantar Akuntansi Dasar', 'Pengantar Perpajakan', 'Aplikasi Perkantoran Bisnis', 'Pendidikan Karakter Bela Negara', 'Matematika Bisnis Terapan'],
    2: ['Akuntansi Keuangan Terapan I', 'Praktikum Akuntansi Biaya', 'Perpajakan Penghasilan (PPh)', 'Pengantar Manajemen', 'Statistika Terapan'],
    3: ['Akuntansi Keuangan Terapan II', 'Praktikum Perpajakan Terapan (e-Faktur & e-Bupot)', 'Praktikum Komputer Akuntansi (Accurate / SAP)', 'Akuntansi Manajemen Terapan', 'Pengauditan Praktis'],
    4: ['Praktikum Audit Terapan', 'Akuntansi Sektor Publik Terapan', 'Perpajakan Pertambahan Nilai (PPN & PPnBM)', 'Analisis Finansial Terapan', 'Metodologi Tugas Akhir'],
    5: ['Praktik Kerja Industri / Magang Kantor Akuntan Publik (KAP)', 'Simulasi Pembukuan UMKM', 'Etika Profesi Teknisi Akuntansi'],
    6: ['Laporan Tugas Akhir Terapan', 'Sertifikasi Kompetensi Akuntansi (BNSP / LSP)']
  },
  'cbt-s1-ekonomi-syariah': {
    1: ['Pengantar Ekonomi Islam', 'Fiqh Ibadah & Muamalah I', 'Matematika Ekonomi Islam', 'Pendidikan Bela Negara', 'Bahasa Arab Ekonomi'],
    2: ['Fiqh Muamalah Kontemporer & Lembaga Keuangan Syariah', 'Sejarah Pemikiran Ekonomi Islam', 'Mikroekonomi Islam', 'Pengantar Manajemen Syariah', 'Statistika Terapan'],
    3: ['Makroekonomi Islam', 'Manajemen Perbankan Syariah', 'Akuntansi Syariah', 'Pasar Modal & Sukuk Syariah', 'Manajemen Zakat, Infak, Sedekah & Wakaf (ZISWAF)'],
    4: ['Manajemen Risiko Lembaga Keuangan Syariah', 'Hukum Bisnis Syariah & Fatwa DSN-MUI', 'Ushul Fiqh Ekonomi', 'Metodologi Penelitian Ekonomi Syariah', 'Ekonomi Moneter Islam'],
    5: ['Audit Syariah & Governance', 'Fintech Syariah & Ekonomi Digital', 'Asuransi Syariah (Takaful)', 'Kewirausahaan Berbasis Syariah', 'Studi Kelayakan Bisnis Islam'],
    6: ['Pemberdayaan Ekonomi Umat', 'Filantropi & Keuangan Sosial Islam', 'Seminar Ekonomi & Keuangan Syariah', 'Perdagangan Internasional Islam'],
    7: ['Kapita Selekta Keuangan Syariah', 'Magang MBKM Perbankan Syariah'],
    8: ['Skripsi Ekonomi Syariah']
  },
  'cbt-s1-ekonomi-pembangunan': {
    1: ['Pengantar Teori Ekonomi Mikro', 'Pengantar Teori Ekonomi Makro', 'Matematika untuk Ekonom I', 'Pendidikan Karakter Bela Negara', 'Bahasa Inggris Akademik'],
    2: ['Ekonomi Pembangunan I', 'Statistika Induktif Ekonomi', 'Matematika untuk Ekonom II', 'Sosiologi & Kelembagaan Ekonomi', 'Ekonomi Moneter I'],
    3: ['Ekonometrika & Perencanaan Pembangunan', 'Ekonomi Publik & Keuangan Negara', 'Ekonomi Pembangunan II', 'Ekonomi Regional & Perkotaan', 'Ekonomi Sumber Daya Alam & Lingkungan'],
    4: ['Ekonometrika Terapan (Stata / EViews)', 'Perencanaan & Evaluasi Proyek Pembangunan', 'Ekonomi Perdagangan Internasional', 'Ekonomi Ketenagakerjaan & Kependudukan', 'Metodologi Penelitian Ekonomi'],
    5: ['Ekonomi Moneter Lanjutan', 'Ekonomi Industri & Persaingan Usaha', 'Perekonomian Indonesia', 'Analisis Kebijakan Fiskal', 'Sistem Informasi Geografis (SIG) Ekonomi'],
    6: ['Seminar Ekonomi Pembangunan', 'Ekonomi Politik Pembangunan', 'Model Perencanaan Pembangunan', 'Valuasi Ekonomi Lingkungan'],
    7: ['Kapita Selekta Pembangunan Daerah', 'Magang Kebijakan Publik (Bappenas / Bappeda / BI / Kemenkeu)'],
    8: ['Skripsi Ekonomi Pembangunan']
  }
};
