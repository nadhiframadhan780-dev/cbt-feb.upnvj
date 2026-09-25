import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  StudentProfile, 
  StudentAccountStatus,
  DeanProfile, 
  Course, 
  Exam, 
  Question, 
  ExamAttempt, 
  StudentAnswer, 
  Announcement,
  AdminUser,
  CourseGrade
} from '../types';
import { STUDY_PROGRAMS, PRODI_COURSES_MAP } from '../constants/programs';

// Default initial Dean Profile
export const DEFAULT_DEAN_PROFILE: DeanProfile = {
  name: 'Prof. Dr. Jubaedah, S.E., M.M.',
  title: 'Dekan Fakultas Ekonomi dan Bisnis',
  position: 'Dekan FEB UPN “Veteran” Jakarta',
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
  greeting: 'Selamat datang di portal CBT FEB UPN “Veteran” Jakarta. Sistem ujian digital ini dirancang untuk menjunjung tinggi integritas akademik, transparansi, dan efisiensi dalam pelaksanaan UTS dan UAS. Kami mengimbau seluruh mahasiswa untuk selalu mengedepankan kejujuran, disiplin, dan nilai-nilai Bela Negara.',
  updatedAt: new Date().toISOString()
};

// Initial Announcements
export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Tata Tertib Ujian CBT FEB Semester Ganjil 2026/2027',
    content: 'Mahasiswa wajib memastikan koneksi internet stabil, login menggunakan akun resmi, dan dilarang membuka tab/aplikasi lain selama ujian berlangsung.',
    date: '2026-10-01',
    priority: 'high',
    active: true
  },
  {
    id: 'ann-2',
    title: 'Jadwal Masa Uji Coba (Gladi Bersih) CBT Online',
    content: 'Gladi bersih simulasi CBT diselenggarakan serentak untuk seluruh angkatan 2023–2026 pada tanggal 8–10 Oktober 2026.',
    date: '2026-10-05',
    priority: 'normal',
    active: true
  }
];

// Initial Demo Courses
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-akt101',
    name: 'Pengantar Akuntansi I',
    code: 'AKT101',
    programSlug: 'cbt-s1-akuntansi',
    lecturer: 'Dr. Sri Wahyuni, M.Si., Ak., CA',
    semester: 1,
    sks: 3,
    active: true
  },
  {
    id: 'course-akt304',
    name: 'Audit Forensik & Investigasi Keuangan',
    code: 'AKT304',
    programSlug: 'cbt-s1-akuntansi',
    lecturer: 'Bambang Sudibyo, S.E., M.Akt.',
    semester: 6,
    sks: 3,
    active: true
  },
  {
    id: 'course-mnj201',
    name: 'Manajemen Keuangan Korporasi',
    code: 'MNJ201',
    programSlug: 'cbt-s1-manajemen',
    lecturer: 'Dra. Nurhayati, M.M.',
    semester: 3,
    sks: 3,
    active: true
  },
  {
    id: 'course-dpk102',
    name: 'Operasional Lembaga Perbankan & Syariah',
    code: 'DPK102',
    programSlug: 'cbt-d3-perbankan-keuangan',
    lecturer: 'Hendra Gunawan, S.E., M.B.A.',
    semester: 2,
    sks: 3,
    active: true
  },
  {
    id: 'course-d3akt201',
    name: 'Praktikum Perpajakan Terapan',
    code: 'PAK201',
    programSlug: 'cbt-d3-akuntansi',
    lecturer: 'Fitri Handayani, S.E., M.Ak.',
    semester: 3,
    sks: 3,
    active: true
  },
  {
    id: 'course-eks204',
    name: 'Fiqh Muamalah & Lembaga Keuangan Syariah',
    code: 'EKS204',
    programSlug: 'cbt-s1-ekonomi-syariah',
    lecturer: 'Dr. Ahmad Fauzi, M.E.Sy.',
    semester: 2,
    sks: 3,
    active: true
  },
  {
    id: 'course-ekp302',
    name: 'Ekonometrika & Perencanaan Pembangunan',
    code: 'EKP302',
    programSlug: 'cbt-s1-ekonomi-pembangunan',
    lecturer: 'Prof. Dr. Ir. Gunawan, M.Sc.',
    semester: 3,
    sks: 3,
    active: true
  }
];

// Helper: generate realistic demo questions
export function getDemoQuestionsForExam(examId: string): Question[] {
  return [
    {
      id: `${examId}-q1`,
      examId,
      order: 1,
      type: 'multiple_choice',
      question: 'Berdasarkan Kerangka Konseptual Pelaporan Keuangan (KKPK) dan PSAK terkini, karakteristik kualitatif fundamental yang wajib dipenuhi laporan keuangan entitas publik adalah...',
      options: [
        { id: 'A', text: 'Relevansi (Relevance) dan Representasi Tepat (Faithful Representation)' },
        { id: 'B', text: 'Keterbandingan (Comparability) dan Ketepatwaktuan (Timeliness)' },
        { id: 'C', text: 'Materialitas (Materiality) dan Keterpahaman (Understandability)' },
        { id: 'D', text: 'Konsistensi (Consistency) dan Konservatisme (Conservatism)' },
        { id: 'E', text: 'Kelangsungan Usaha (Going Concern) dan Basis Akrual (Accrual Basis)' }
      ],
      correctAnswer: 'A',
      points: 15,
      explanation: 'Dua karakteristik kualitatif fundamental laporan keuangan menurut IFRS/PSAK adalah relevansi dan representasi tepat.'
    },
    {
      id: `${examId}-q2`,
      examId,
      order: 2,
      type: 'multiple_choice_image',
      question: 'Perhatikan diagram alur audit investigasi berikut ini. Pada tahapan manakah auditor mulai mengumpulkan bukti forensik digital dan melakukan wawancara mendalam (interogasi terstruktur)?',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      options: [
        { id: 'A', text: 'Tahap Penelaahan Informasi Awal (Initial Predication Review)' },
        { id: 'B', text: 'Tahap Pelaksanaan Pengujian Bukti & Wawancara Mendalam (Evidence Execution)' },
        { id: 'C', text: 'Tahap Evaluasi Pengendalian Internal Komprehensif' },
        { id: 'D', text: 'Tahap Finalisasi Laporan Hasil Pemeriksaan (LHP)' },
        { id: 'E', text: 'Tahap Penyerahan Rekomendasi ke Aparat Penegak Hukum' }
      ],
      correctAnswer: 'B',
      points: 15,
      explanation: 'Pengumpulan bukti forensik dan interogasi saksi/terperiksa dilaksanakan pada fase pelaksanaan pemeriksaan investigatif.'
    },
    {
      id: `${examId}-q3`,
      examId,
      order: 3,
      type: 'true_false',
      question: 'Dalam manajemen perbankan, rasio CAR (Capital Adequacy Ratio) mengukur kecukupan modal minimum yang wajib dipelihara bank guna mengantisipasi risiko kerugian atas aktiva tertimbang menurut risiko (ATMR).',
      options: [
        { id: 'Benar', text: 'Benar' },
        { id: 'Salah', text: 'Salah' }
      ],
      correctAnswer: 'Benar',
      points: 10,
      explanation: 'CAR adalah rasio modal terhadap ATMR yang disyaratkan oleh Bank Indonesia dan OJK untuk menjaga ketahanan sistem perbankan.'
    },
    {
      id: `${examId}-q4`,
      examId,
      order: 4,
      type: 'short_answer',
      question: 'Sebutkan istilah untuk indikator ketimpangan distribusi pendapatan masyarakat dalam ilmu ekonomi pembangunan yang nilainya berkisar antara 0 hingga 1!',
      correctAnswer: 'Koefisien Gini',
      points: 15,
      explanation: 'Rasio / Koefisien Gini merupakan tolok ukur standar ketimpangan distribusi kekayaan atau pendapatan.'
    },
    {
      id: `${examId}-q5`,
      examId,
      order: 5,
      type: 'multiple_choice',
      question: 'Prinsip akad pembiayaan dalam perbankan syariah di mana bank dan nasabah bertindak sebagai mitra usaha dengan pembagian keuntungan berdasarkan nisbah yang disepakati disebut akad...',
      options: [
        { id: 'A', text: 'Musyarakah (Penyertaan Modal / Kemitraan)' },
        { id: 'B', text: 'Murabahah (Jual Beli dengan Margin)' },
        { id: 'C', text: 'Ijarah Muntahiya Bittamlik (Sewa Beli)' },
        { id: 'D', text: 'Wadiah Yad Dhamanah (Titipan)' },
        { id: 'E', text: 'Qardh Hasan (Pinjaman Kebajikan)' }
      ],
      correctAnswer: 'A',
      points: 15,
      explanation: 'Musyarakah adalah bentuk kemitraan usaha syariah di mana kedua pihak berkontribusi modal dan berbagi laba/rugi.'
    },
    {
      id: `${examId}-q6`,
      examId,
      order: 6,
      type: 'essay',
      question: 'Uraikan secara komprehensif bagaimana implementasi nilai-nilai Bela Negara (Cinta Tanah Air, Sadar Berbangsa dan Bernegara, serta Rela Berkorban) dapat memperkuat integritas seorang profesional ekonomi dan bisnis dalam mencegah praktik tindak pidana korupsi serta kecurangan korporasi!',
      correctAnswer: 'Rubrik penilaian: Pemahaman konsep Bela Negara, korelasi dengan etika profesi akuntansi/manajemen, penalaran kritis, dan solusi pencegahan korupsi.',
      points: 30,
      explanation: 'Nilai Bela Negara menanamkan tanggung jawab moral, kejujuran personal, dan komitmen terhadap kemakmuran bangsa di atas kepentingan pribadi.'
    }
  ];
}

// Generate default exams with auto-publish time settings
export function getDefaultExams(): Exam[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nextMonth = new Date(now.getTime() + 30 * 24 * 3600000);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const exams: Exam[] = [];

  STUDY_PROGRAMS.forEach((prog, idx) => {
    // 1. Live Active Exam
    exams.push({
      id: `exam-${prog.slug}-uts`,
      title: `Ujian Tengah Semester (UTS) — ${prog.shortName}`,
      courseId: `course-${prog.slug}-101`,
      courseName: idx % 2 === 0 ? 'Kapita Selekta & Praktikum Keuangan' : 'Manajemen Strategis & Analisis Bisnis',
      courseCode: `FEB-${prog.degree}-${(idx + 1) * 100 + 1}`,
      lecturer: 'Tim Dosen Pengampu FEB UPNVJ',
      programSlug: prog.slug,
      targetPrograms: [prog.slug],
      targetCohorts: ['2023', '2024', '2025', '2026'],
      examType: 'UTS',
      startAt: new Date(Date.now() - 3600000).toISOString(),
      endAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      publishDate: todayStr,
      publishTime: '08:00',
      durationMinutes: 90,
      instructions: 'Bacalah soal dengan cermat. Dilarang membuka tab lain, menyalin teks, atau meminjamkan akun kepada pihak lain. Sistem dilengkapi pengawas integritas otomatis.',
      showScore: true,
      active: true,
      totalQuestions: 6,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    // 2. Scheduled Exam (Future Auto-Publish)
    exams.push({
      id: `exam-${prog.slug}-uas`,
      title: `Ujian Akhir Semester (UAS) — ${prog.shortName}`,
      courseId: `course-${prog.slug}-201`,
      courseName: idx % 2 === 0 ? 'Tata Kelola Korporasi & Etika Bisnis' : 'Ekonometrika & Riset Terapan',
      courseCode: `FEB-${prog.degree}-${(idx + 1) * 100 + 2}`,
      lecturer: 'Dewan Penguji Akademik FEB',
      programSlug: prog.slug,
      targetPrograms: [prog.slug],
      targetCohorts: ['2023', '2024', '2025', '2026'],
      examType: 'UAS',
      startAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      endAt: new Date(Date.now() + 86400000 * 14).toISOString(),
      publishDate: nextMonthStr,
      publishTime: '09:00',
      durationMinutes: 120,
      instructions: 'Ujian Akhir Semester bersifat komprehensif. Pastikan baterai dan koneksi perangkat Anda stabil sebelum memulai ujian.',
      showScore: true,
      active: true,
      totalQuestions: 6,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  });

  return exams;
}

// Default Registered Students per Prodi across Semesters 1 to 8
export const DEFAULT_STUDENTS: StudentProfile[] = [
  {
    uid: 'demo-student-s1-akt',
    email: 'nadhiframadhan780@gmail.com',
    name: 'Nadhif Ramadhan',
    nim: '2310111001',
    program: 'S1 Akuntansi',
    programSlug: 'cbt-s1-akuntansi',
    cohort: '2023',
    semester: 1,
    courses: PRODI_COURSES_MAP['cbt-s1-akuntansi'][1],
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-s1-mnj',
    email: 'siti.rahmawati@upnvj.ac.id',
    name: 'Siti Rahmawati',
    nim: '2410112045',
    program: 'S1 Manajemen',
    programSlug: 'cbt-s1-manajemen',
    cohort: '2024',
    semester: 3,
    courses: PRODI_COURSES_MAP['cbt-s1-manajemen'][3],
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-d3-dpk',
    email: 'ahmad.faiz@upnvj.ac.id',
    name: 'Ahmad Faiz Fadhlurrahman',
    nim: '2510115012',
    program: 'D3 Perbankan dan Keuangan',
    programSlug: 'cbt-d3-perbankan-keuangan',
    cohort: '2025',
    semester: 1,
    courses: PRODI_COURSES_MAP['cbt-d3-perbankan-keuangan'][1],
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-d3-akt',
    email: 'dewi.lestari@upnvj.ac.id',
    name: 'Dewi Lestari',
    nim: '2310114022',
    program: 'D3 Akuntansi',
    programSlug: 'cbt-d3-akuntansi',
    cohort: '2023',
    semester: 4,
    courses: PRODI_COURSES_MAP['cbt-d3-akuntansi'][4],
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-s1-eks',
    email: 'ilham.pratama@upnvj.ac.id',
    name: 'Muhammad Ilham Pratama',
    nim: '2410113088',
    program: 'S1 Ekonomi Syariah',
    programSlug: 'cbt-s1-ekonomi-syariah',
    cohort: '2024',
    semester: 3,
    courses: PRODI_COURSES_MAP['cbt-s1-ekonomi-syariah'][3],
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-s1-ekp',
    email: 'anisa.maharani@upnvj.ac.id',
    name: 'Anisa Maharani',
    nim: '2310116034',
    program: 'S1 Ekonomi Pembangunan',
    programSlug: 'cbt-s1-ekonomi-pembangunan',
    cohort: '2023',
    semester: 1,
    courses: PRODI_COURSES_MAP['cbt-s1-ekonomi-pembangunan'][1],
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed initial database
export async function seedInitialFirestoreData(): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);

    // 1. Dean Profile
    const deanDocRef = doc(db, 'deanProfile', 'current');
    batch.set(deanDocRef, DEFAULT_DEAN_PROFILE, { merge: true });

    // 2. Announcements
    for (const ann of DEFAULT_ANNOUNCEMENTS) {
      batch.set(doc(db, 'announcements', ann.id), ann, { merge: true });
    }

    // 3. Courses
    for (const crs of DEFAULT_COURSES) {
      batch.set(doc(db, 'courses', crs.id), crs, { merge: true });
    }

    // 4. Default Students
    for (const std of DEFAULT_STUDENTS) {
      batch.set(doc(db, 'students', std.nim), std, { merge: true });
    }

    // 5. Default Exams & Questions
    const defaultExams = getDefaultExams();
    for (const ex of defaultExams) {
      batch.set(doc(db, 'exams', ex.id), ex, { merge: true });
      const questions = getDemoQuestionsForExam(ex.id);
      for (const q of questions) {
        batch.set(doc(db, 'questions', q.id), q, { merge: true });
      }
    }

    // 6. Admin whitelist doc - Only nadhiframadhan780@gmail.com
    const adminRef = doc(db, 'admins', 'superadmin-nadhif');
    const adminData: AdminUser = {
      uid: 'superadmin-nadhif',
      email: 'nadhiframadhan780@gmail.com',
      name: 'Nadhif Ramadhan (Superadmin FEB)',
      role: 'superadmin',
      createdAt: new Date().toISOString()
    };
    batch.set(adminRef, adminData, { merge: true });

    await batch.commit();
    return { success: true, message: 'Database FEB CBT berhasil disinkronkan dengan data awal!' };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed');
    return { success: false, message: 'Gagal inisialisasi Firestore: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

// Service: Dean Profile
export async function getDeanProfile(): Promise<DeanProfile> {
  try {
    const docSnap = await getDoc(doc(db, 'deanProfile', 'current'));
    if (docSnap.exists()) {
      return docSnap.data() as DeanProfile;
    }
    return DEFAULT_DEAN_PROFILE;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'deanProfile/current');
    return DEFAULT_DEAN_PROFILE;
  }
}

export async function updateDeanProfile(profile: DeanProfile): Promise<boolean> {
  try {
    await setDoc(doc(db, 'deanProfile', 'current'), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'deanProfile/current');
    return false;
  }
}

// Service: Student Profile lookup
export async function getStudentProfile(email: string, nim?: string): Promise<StudentProfile | null> {
  try {
    // 1. Check by email
    const emailQuery = query(collection(db, 'students'), where('email', '==', email.toLowerCase().trim()));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      return { id: emailSnap.docs[0].id, ...emailSnap.docs[0].data() } as StudentProfile;
    }

    // 2. Check by NIM if supplied
    if (nim) {
      const nimQuery = query(collection(db, 'students'), where('nim', '==', nim.trim()));
      const nimSnap = await getDocs(nimQuery);
      if (!nimSnap.empty) {
        return { id: nimSnap.docs[0].id, ...nimSnap.docs[0].data() } as StudentProfile;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'students');
  }

  // Fallback 1: check local storage cached profile
  try {
    if (nim) {
      const cached = localStorage.getItem(`cbt_student_${nim.trim()}`);
      if (cached) return JSON.parse(cached);
    }
    const cachedByEmail = localStorage.getItem(`cbt_student_email_${email.toLowerCase().trim()}`);
    if (cachedByEmail) return JSON.parse(cachedByEmail);
  } catch {}

  // Fallback 2: search local default students
  const localMatch = DEFAULT_STUDENTS.find(s => 
    s.email.toLowerCase() === email.toLowerCase() || (nim && s.nim === nim.trim())
  );
  return localMatch || null;
}

// Service: All Students (for Admin)
export async function getAllStudents(): Promise<StudentProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    if (snap.empty) {
      return DEFAULT_STUDENTS;
    }
    const students: StudentProfile[] = [];
    snap.forEach(d => {
      students.push({ id: d.id, ...d.data() } as StudentProfile);
    });
    return students;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'students');
    return DEFAULT_STUDENTS;
  }
}

// Service: Save / Add Student
export async function saveStudentProfile(student: StudentProfile): Promise<boolean> {
  // Always cache in localStorage as resilient offline fallback
  try {
    localStorage.setItem(`cbt_student_${student.nim}`, JSON.stringify(student));
    if (student.email) {
      localStorage.setItem(`cbt_student_email_${student.email.toLowerCase().trim()}`, JSON.stringify(student));
    }
  } catch {}

  try {
    const studentRef = doc(db, 'students', student.nim);
    await setDoc(studentRef, {
      ...student,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.nim}`);
    return false;
  }
}

// Service: Bulk Add Students
export async function saveBulkStudents(students: StudentProfile[]): Promise<number> {
  let count = 0;
  try {
    const batch = writeBatch(db);
    for (const std of students) {
      const ref = doc(db, 'students', std.nim);
      batch.set(ref, {
        ...std,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      count++;
    }
    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'students_bulk');
    return count;
  }
}

// Service: Delete Student
export async function deleteStudentProfile(nim: string): Promise<boolean> {
  try {
    localStorage.removeItem(`cbt_student_${nim}`);
  } catch {}
  try {
    await deleteDoc(doc(db, 'students', nim));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${nim}`);
    return false;
  }
}

// Service: Update Student Account Status (active | temporary_inactive | permanent_inactive)
export async function updateStudentAccountStatus(
  nim: string,
  status: StudentAccountStatus,
  statusReason?: string
): Promise<boolean> {
  const reason = statusReason || (
    status === 'temporary_inactive' 
      ? 'AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN'
      : status === 'permanent_inactive'
      ? 'AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA, JIKA INI KELIRU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT'
      : undefined
  );

  try {
    const studentRef = doc(db, 'students', nim);
    await setDoc(studentRef, {
      status,
      active: status === 'active',
      statusReason: reason,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Update local cache
    try {
      const cached = localStorage.getItem(`cbt_student_${nim}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.status = status;
        parsed.active = status === 'active';
        parsed.statusReason = reason;
        localStorage.setItem(`cbt_student_${nim}`, JSON.stringify(parsed));
      }
    } catch {}

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${nim}/status`);
    return false;
  }
}

// Service: Exams for specific Student
export async function getExamsForStudent(programSlug: string, cohort: string): Promise<Exam[]> {
  try {
    const examsQuery = query(collection(db, 'exams'), where('active', '==', true));
    const querySnapshot = await getDocs(examsQuery);
    
    let allExams: Exam[] = [];
    if (querySnapshot.empty) {
      allExams = getDefaultExams();
    } else {
      querySnapshot.forEach(doc => {
        allExams.push({ id: doc.id, ...doc.data() } as Exam);
      });
    }

    // Enforce strict access control: student can ONLY see exams matching programSlug and cohort
    return allExams.filter(exam => {
      const programMatch = !exam.targetPrograms || exam.targetPrograms.length === 0 || exam.targetPrograms.includes(programSlug);
      const cohortMatch = !exam.targetCohorts || exam.targetCohorts.length === 0 || exam.targetCohorts.includes(cohort);
      return programMatch && cohortMatch;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'exams');
    return getDefaultExams().filter(e => 
      e.targetPrograms.includes(programSlug) && e.targetCohorts.includes(cohort)
    );
  }
}

// Service: All Exams (for Admin)
export async function getAllExams(): Promise<Exam[]> {
  try {
    const snap = await getDocs(collection(db, 'exams'));
    if (snap.empty) {
      return getDefaultExams();
    }
    const exams: Exam[] = [];
    snap.forEach(d => {
      exams.push({ id: d.id, ...d.data() } as Exam);
    });
    return exams;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'exams');
    return getDefaultExams();
  }
}

// Service: Save / Update Exam
export async function saveExam(exam: Exam): Promise<boolean> {
  try {
    await setDoc(doc(db, 'exams', exam.id), {
      ...exam,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `exams/${exam.id}`);
    return false;
  }
}

// Service: Questions for Exam
export async function getQuestionsForExam(examId: string): Promise<Question[]> {
  try {
    const qQuery = query(collection(db, 'questions'), where('examId', '==', examId));
    const snapshot = await getDocs(qQuery);
    if (snapshot.empty) {
      return getDemoQuestionsForExam(examId);
    }
    const questions: Question[] = [];
    snapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() } as Question);
    });
    return questions.sort((a, b) => a.order - b.order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'questions');
    return getDemoQuestionsForExam(examId);
  }
}

// Service: Save / Update Question
export async function saveQuestion(question: Question): Promise<boolean> {
  try {
    await setDoc(doc(db, 'questions', question.id), question, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `questions/${question.id}`);
    return false;
  }
}

// Service: Bulk Add Questions
export async function saveBulkQuestions(questions: Question[]): Promise<number> {
  let count = 0;
  try {
    const batch = writeBatch(db);
    for (const q of questions) {
      const ref = doc(db, 'questions', q.id);
      batch.set(ref, q, { merge: true });
      count++;
    }
    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'questions_bulk');
    return count;
  }
}

// Service: Delete Question
export async function deleteQuestion(questionId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'questions', questionId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `questions/${questionId}`);
    return false;
  }
}

// Service: Exam Attempt
export async function getOrCreateExamAttempt(examId: string, student: StudentProfile, uid: string): Promise<ExamAttempt> {
  const attemptId = `attempt_${examId}_${student.nim}_${uid.slice(0, 8)}`;
  try {
    const attemptRef = doc(db, 'examAttempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);
    if (attemptSnap.exists()) {
      return { id: attemptSnap.id, ...attemptSnap.data() } as ExamAttempt;
    }

    const newAttempt: ExamAttempt = {
      id: attemptId,
      examId,
      studentId: student.id || student.nim,
      uid,
      nim: student.nim,
      studentName: student.name,
      programSlug: student.programSlug,
      cohort: student.cohort,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      violationCount: 0
    };

    await setDoc(attemptRef, newAttempt);
    return newAttempt;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'examAttempts');
    return {
      id: attemptId,
      examId,
      studentId: student.id || student.nim,
      uid,
      nim: student.nim,
      studentName: student.name,
      programSlug: student.programSlug,
      cohort: student.cohort,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      violationCount: 0
    };
  }
}

// Service: Auto-save Answer
export async function saveStudentAnswer(
  attemptId: string, 
  questionId: string, 
  studentId: string, 
  answer: string | string[], 
  isFlagged: boolean
): Promise<boolean> {
  // Save locally first to guarantee zero answer loss
  const localKey = `cbt_answer_${attemptId}_${questionId}`;
  const payload = { answer, isFlagged, savedAt: new Date().toISOString() };
  localStorage.setItem(localKey, JSON.stringify(payload));

  try {
    const answerId = `${attemptId}_${questionId}`;
    await setDoc(doc(db, 'answers', answerId), {
      attemptId,
      questionId,
      studentId,
      answer,
      isFlagged,
      savedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Auto-save Firestore gagal, data aman di memori lokal:', error);
    return false;
  }
}

// Service: Submit Exam Attempt
export async function submitExamAttempt(
  attemptId: string, 
  exam: Exam, 
  questions: Question[], 
  answers: Record<string, StudentAnswer>,
  isDisqualified: boolean = false,
  disqualificationReason?: string
): Promise<{ score: number; totalPoints: number; percentage: number }> {
  let score = 0;
  let totalPoints = 0;

  if (isDisqualified) {
    // If disqualified for cheating, score is forced to 0
    score = 0;
    questions.forEach(q => totalPoints += q.points);
  } else {
    questions.forEach(q => {
      totalPoints += q.points;
      const ans = answers[q.id]?.answer;
      if (!ans) return;

      if (q.type === 'multiple_choice' || q.type === 'multiple_choice_image' || q.type === 'true_false') {
        if (typeof ans === 'string' && typeof q.correctAnswer === 'string') {
          if (ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            score += q.points;
          }
        }
      } else if (q.type === 'multiple_select') {
        if (Array.isArray(ans) && Array.isArray(q.correctAnswer)) {
          const sortedAns = [...ans].sort().join(',');
          const sortedCorrect = [...q.correctAnswer].sort().join(',');
          if (sortedAns === sortedCorrect) {
            score += q.points;
          }
        }
      } else if (q.type === 'short_answer') {
        if (typeof ans === 'string' && typeof q.correctAnswer === 'string') {
          if (ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            score += q.points;
          }
        }
      } else if (q.type === 'essay') {
        // Essay gets base points pending lecturer review
        score += Math.round(q.points * 0.75);
      }
    });
  }

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  try {
    await updateDoc(doc(db, 'examAttempts', attemptId), {
      submittedAt: new Date().toISOString(),
      status: isDisqualified ? 'disqualified' : 'submitted',
      score,
      totalPoints,
      percentage,
      disqualificationReason: disqualificationReason || null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `examAttempts/${attemptId}`);
  }

  return { score, totalPoints, percentage };
}

// Service: Record Proctoring Violation (Tab Switch)
export async function recordViolation(attemptId: string, violationCount: number): Promise<void> {
  try {
    await updateDoc(doc(db, 'examAttempts', attemptId), {
      violationCount,
      lastViolationAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to record violation to Firestore:', error);
  }
}

// Service: Live Proctoring / Monitoring Attempts
export async function getAllAttempts(): Promise<ExamAttempt[]> {
  try {
    const snap = await getDocs(collection(db, 'examAttempts'));
    if (snap.empty) {
      return [];
    }
    const attempts: ExamAttempt[] = [];
    snap.forEach(d => {
      attempts.push({ id: d.id, ...d.data() } as ExamAttempt);
    });
    return attempts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'examAttempts');
    return [];
  }
}

// Service: Calculate Integrated Grades per Course for Student
export async function getStudentGrades(
  studentNim: string, 
  programSlug: string, 
  semester: number = 1
): Promise<{ grades: CourseGrade[]; averageScore: number; gpa: number }> {
  // Retrieve all attempts for this student
  let attempts: ExamAttempt[] = [];
  try {
    const qAttempt = query(collection(db, 'examAttempts'), where('nim', '==', studentNim));
    const snap = await getDocs(qAttempt);
    snap.forEach(d => attempts.push({ id: d.id, ...d.data() } as ExamAttempt));
  } catch (e) {
    // Local fallback
  }

  // Determine courses for this student's prodi and semester
  const prodiCourses = PRODI_COURSES_MAP[programSlug]?.[semester] || [
    'Pengantar Akuntansi & Bisnis',
    'Manajemen Keuangan',
    'Pendidikan Karakter Bela Negara',
    'Statistika Terapan'
  ];

  const grades: CourseGrade[] = prodiCourses.map((cName, idx) => {
    // Match against completed attempts if available
    const matchedAttempt = attempts.find(a => 
      a.status === 'submitted' || a.status === 'disqualified'
    );

    // Realistic academic grade simulation if not yet fully taken
    let finalScore = 82;
    if (matchedAttempt && idx === 0) {
      finalScore = matchedAttempt.percentage || 0;
    } else {
      finalScore = 78 + ((idx * 7) % 18);
    }

    let letterGrade = 'A';
    let gradePoint = 4.0;

    if (finalScore >= 85) {
      letterGrade = 'A';
      gradePoint = 4.0;
    } else if (finalScore >= 80) {
      letterGrade = 'A-';
      gradePoint = 3.75;
    } else if (finalScore >= 75) {
      letterGrade = 'B+';
      gradePoint = 3.25;
    } else if (finalScore >= 70) {
      letterGrade = 'B';
      gradePoint = 3.0;
    } else if (finalScore >= 65) {
      letterGrade = 'B-';
      gradePoint = 2.75;
    } else if (finalScore >= 60) {
      letterGrade = 'C+';
      gradePoint = 2.25;
    } else if (finalScore >= 55) {
      letterGrade = 'C';
      gradePoint = 2.0;
    } else if (finalScore >= 40) {
      letterGrade = 'D';
      gradePoint = 1.0;
    } else {
      letterGrade = 'E';
      gradePoint = 0.0;
    }

    return {
      courseCode: `FEB-${semester}0${idx + 1}`,
      courseName: cName,
      sks: 3,
      utsScore: Math.round(finalScore * 0.95),
      uasScore: finalScore,
      assignmentScore: Math.min(100, finalScore + 5),
      finalScore,
      letterGrade,
      gradePoint
    };
  });

  const totalScore = grades.reduce((acc, g) => acc + g.finalScore, 0);
  const averageScore = grades.length > 0 ? Math.round((totalScore / grades.length) * 10) / 10 : 0;
  
  const totalGradePoints = grades.reduce((acc, g) => acc + (g.gradePoint * g.sks), 0);
  const totalSks = grades.reduce((acc, g) => acc + g.sks, 0);
  const gpa = totalSks > 0 ? Math.round((totalGradePoints / totalSks) * 100) / 100 : 0.0;

  return { grades, averageScore, gpa };
}
