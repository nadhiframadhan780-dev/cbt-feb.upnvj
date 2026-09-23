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
  DeanProfile, 
  Course, 
  Exam, 
  Question, 
  ExamAttempt, 
  StudentAnswer, 
  Announcement,
  AdminUser
} from '../types';
import { STUDY_PROGRAMS } from '../constants/programs';

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
    active: true
  },
  {
    id: 'course-akt304',
    name: 'Audit Forensik & Investigasi Keuangan',
    code: 'AKT304',
    programSlug: 'cbt-s1-akuntansi',
    lecturer: 'Bambang Sudibyo, S.E., M.Akt.',
    active: true
  },
  {
    id: 'course-mnj201',
    name: 'Manajemen Keuangan Korporasi',
    code: 'MNJ201',
    programSlug: 'cbt-s1-manajemen',
    lecturer: 'Dra. Nurhayati, M.M.',
    active: true
  },
  {
    id: 'course-dpk102',
    name: 'Operasional Lembaga Perbankan & Syariah',
    code: 'DPK102',
    programSlug: 'cbt-d3-perbankan-keuangan',
    lecturer: 'Hendra Gunawan, S.E., M.B.A.',
    active: true
  },
  {
    id: 'course-d3akt201',
    name: 'Praktikum Perpajakan Terapan',
    code: 'PAK201',
    programSlug: 'cbt-d3-akuntansi',
    lecturer: 'Fitri Handayani, S.E., M.Ak.',
    active: true
  },
  {
    id: 'course-eks204',
    name: 'Fiqh Muamalah & Lembaga Keuangan Syariah',
    code: 'EKS204',
    programSlug: 'cbt-s1-ekonomi-syariah',
    lecturer: 'Dr. Ahmad Fauzi, M.E.Sy.',
    active: true
  },
  {
    id: 'course-ekp302',
    name: 'Ekonometrika & Perencanaan Pembangunan',
    code: 'EKP302',
    programSlug: 'cbt-s1-ekonomi-pembangunan',
    lecturer: 'Prof. Dr. Ir. Gunawan, M.Sc.',
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
      question: 'Dalam persamaan dasar akuntansi, hubungan yang benar antara aset, liabilitas, dan ekuitas adalah...',
      options: [
        { id: 'A', text: 'Aset = Liabilitas + Ekuitas' },
        { id: 'B', text: 'Aset = Liabilitas - Ekuitas' },
        { id: 'C', text: 'Liabilitas = Aset + Ekuitas' },
        { id: 'D', text: 'Ekuitas = Aset + Liabilitas' },
        { id: 'E', text: 'Aset + Liabilitas = Ekuitas' }
      ],
      correctAnswer: 'A',
      points: 20
    },
    {
      id: `${examId}-q2`,
      examId,
      order: 2,
      type: 'multiple_choice_image',
      question: 'Perhatikan diagram alur siklus akuntansi dan tata kelola keuangan berikut. Tahapan yang tepat setelah penyusunan Neraca Saldo Sebelum Penyesuaian adalah...',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      options: [
        { id: 'A', text: 'Membuat Jurnal Penutup secara langsung' },
        { id: 'B', text: 'Penyusunan Ayat Jurnal Penyesuaian (Adjusting Entries)' },
        { id: 'C', text: 'Penerbitan Laporan Tahunan Pemegang Saham' },
        { id: 'D', text: 'Pembalikan Jurnal Khusus Kas Masuk' },
        { id: 'E', text: 'Penyusunan Anggaran Modal Periode Berikutnya' }
      ],
      correctAnswer: 'B',
      points: 20
    },
    {
      id: `${examId}-q3`,
      examId,
      order: 3,
      type: 'true_false',
      question: 'Berdasarkan standar akuntansi IFRS dan SAK ETAP, aset tetap berwujud harus selalu disusutkan menggunakan metode garis lurus tanpa pengecualian.',
      options: [
        { id: 'A', text: 'Benar' },
        { id: 'B', text: 'Salah' }
      ],
      correctAnswer: 'Salah',
      points: 15
    },
    {
      id: `${examId}-q4`,
      examId,
      order: 4,
      type: 'multiple_select',
      question: 'Manakah dari pos-pos berikut yang diklasifikasikan sebagai Aset Lancar (Current Assets) dalam laporan posisi keuangan? (Pilih semua yang benar)',
      options: [
        { id: 'A', text: 'Kas dan Setara Kas' },
        { id: 'B', text: 'Piutang Usaha' },
        { id: 'C', text: 'Bangunan dan Tanah Pabrik' },
        { id: 'D', text: 'Persediaan Barang Dagang' },
        { id: 'E', text: 'Peralatan Kantor Jangka Panjang' }
      ],
      correctAnswer: ['A', 'B', 'D'],
      points: 20
    },
    {
      id: `${examId}-q5`,
      examId,
      order: 5,
      type: 'short_answer',
      question: 'Sebutkan istilah dalam akuntansi untuk prinsip yang mengharuskan pencatatan pendapatan dan beban diakui pada periode terjadinya transaksi, bukan saat kas diterima atau dikeluarkan.',
      options: [],
      correctAnswer: 'akrual',
      points: 10
    },
    {
      id: `${examId}-q6`,
      examId,
      order: 6,
      type: 'essay',
      question: 'Jelaskan perbedaan mendasar antara Akuntansi Keuangan (Financial Accounting) dan Akuntansi Manajemen (Managerial Accounting) ditinjau dari pengguna utama informasi, standar pelaporan, dan rentang waktu orientasi!',
      options: [],
      correctAnswer: 'Jawaban akan dinilai dosen berdasarkan kriteria: Pengguna Internal vs Eksternal, Kepatuhan SAK/IFRS, dan Prospektif vs Historis.',
      points: 15
    }
  ];
}

// Generate realistic default exams
export function getDefaultExams(): Exam[] {
  const now = new Date();
  
  // LIVE exam (today, started 30 mins ago, ends in 90 mins)
  const liveStart = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const liveEnd = new Date(now.getTime() + 90 * 60 * 1000).toISOString();

  // UPCOMING exam (tomorrow)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upStart = new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString();
  const upEnd = new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString();

  // FINISHED exam (yesterday)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const finStart = new Date(yesterday.setHours(8, 0, 0, 0)).toISOString();
  const finEnd = new Date(yesterday.setHours(10, 0, 0, 0)).toISOString();

  const exams: Exam[] = [];

  STUDY_PROGRAMS.forEach((prog, index) => {
    // 1. Live Exam for this prodi
    exams.push({
      id: `exam-${prog.id}-uts`,
      title: `UTS ${prog.shortName}: Teori & Aplikasi Terapan`,
      courseId: `course-${prog.id}-1`,
      courseName: index === 0 ? 'Operasional Perbankan Modern' :
                  index === 1 ? 'Praktikum Perpajakan Terapan' :
                  index === 2 ? 'Manajemen Keuangan & Bisnis' :
                  index === 3 ? 'Pengantar Akuntansi I' :
                  index === 4 ? 'Fiqh Muamalah & Perbankan Syariah' :
                  'Ekonometrika Terapan & Kebijakan',
      courseCode: index === 0 ? 'DPK102' :
                  index === 1 ? 'PAK201' :
                  index === 2 ? 'MNJ201' :
                  index === 3 ? 'AKT101' :
                  index === 4 ? 'EKS204' :
                  'EKP302',
      lecturer: 'Tim Dosen Pengampu FEB UPNVJ',
      programSlug: prog.slug,
      targetPrograms: [prog.slug],
      targetCohorts: ['2023', '2024', '2025', '2026'],
      examType: 'UTS',
      startAt: liveStart,
      endAt: liveEnd,
      durationMinutes: 90,
      instructions: '1. Ujian bersifat tutup buku (closed book).\n2. Dilarang membuka tab lain atau menggunakan alat bantu kecerdasan buatan.\n3. Periksa kembali seluruh jawaban sebelum menekan Kumpulkan Ujian.\n4. Sistem melakukan auto-save secara berkala.',
      showScore: true,
      active: true,
      totalQuestions: 6,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    // 2. Upcoming Exam for this prodi
    exams.push({
      id: `exam-${prog.id}-uas`,
      title: `UAS ${prog.shortName}: Tata Kelola & Analisis Strategis`,
      courseId: `course-${prog.id}-2`,
      courseName: `Kapita Selekta ${prog.shortName}`,
      courseCode: `FEB30${index + 1}`,
      lecturer: 'Koordinator Kurikulum FEB',
      programSlug: prog.slug,
      targetPrograms: [prog.slug],
      targetCohorts: ['2023', '2024', '2025', '2026'],
      examType: 'UAS',
      startAt: upStart,
      endAt: upEnd,
      durationMinutes: 120,
      instructions: 'Pastikan perangkat baterai terisi penuh dan gunakan koneksi internet yang stabil.',
      showScore: false,
      active: true,
      totalQuestions: 6,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    // 3. Finished Exam for this prodi
    exams.push({
      id: `exam-${prog.id}-tryout`,
      title: `Simulasi Gladi Bersih CBT FEB`,
      courseId: `course-${prog.id}-0`,
      courseName: 'Literasi Digital & Etika Bela Negara',
      courseCode: 'UPN001',
      lecturer: 'UPT Komputer & FEB UPNVJ',
      programSlug: prog.slug,
      targetPrograms: [prog.slug],
      targetCohorts: ['2023', '2024', '2025', '2026'],
      examType: 'UTS',
      startAt: finStart,
      endAt: finEnd,
      durationMinutes: 60,
      instructions: 'Simulasi format soal dan adaptasi antarmuka CBT.',
      showScore: true,
      active: true,
      totalQuestions: 6,
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString()
    });
  });

  return exams;
}

// Sample initial students registered in the system
export const DEFAULT_STUDENTS: StudentProfile[] = [
  {
    uid: 'demo-student-s1-akt',
    email: 'nadhiframadhan780@gmail.com',
    name: 'Nadhif Ramadhan',
    nim: '2310111001',
    program: 'S1 Akuntansi',
    programSlug: 'cbt-s1-akuntansi',
    cohort: '2026',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-s1-mnj',
    email: 'mahasiswa.manajemen@upnvj.ac.id',
    name: 'Siti Rahmawati',
    nim: '2410112045',
    program: 'S1 Manajemen',
    programSlug: 'cbt-s1-manajemen',
    cohort: '2025',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-d3-dpk',
    email: 'mahasiswa.perbankan@upnvj.ac.id',
    name: 'Ahmad Faiz Fadhlurrahman',
    nim: '2510115012',
    program: 'D3 Perbankan dan Keuangan',
    programSlug: 'cbt-d3-perbankan-keuangan',
    cohort: '2026',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-d3-akt',
    email: 'mahasiswa.d3akuntansi@upnvj.ac.id',
    name: 'Dewi Lestari',
    nim: '2310114022',
    program: 'D3 Akuntansi',
    programSlug: 'cbt-d3-akuntansi',
    cohort: '2024',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-s1-eks',
    email: 'mahasiswa.syariah@upnvj.ac.id',
    name: 'Muhammad Ilham Pratama',
    nim: '2410113088',
    program: 'S1 Ekonomi Syariah',
    programSlug: 'cbt-s1-ekonomi-syariah',
    cohort: '2025',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'demo-student-s1-ekp',
    email: 'mahasiswa.pembangunan@upnvj.ac.id',
    name: 'Anisa Maharani',
    nim: '2310116034',
    program: 'S1 Ekonomi Pembangunan',
    programSlug: 'cbt-s1-ekonomi-pembangunan',
    cohort: '2026',
    active: true,
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

    // 6. Admin whitelist doc
    const adminRef = doc(db, 'admins', 'bootstrap-admin');
    const adminData: AdminUser = {
      uid: 'bootstrap-admin',
      email: 'nadhiframadhan780@gmail.com',
      name: 'Administrator Utama CBT FEB',
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

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'students');
    return null;
  }
}

// Service: Exams for specific Student
export async function getExamsForStudent(programSlug: string, cohort: string): Promise<Exam[]> {
  try {
    const examsQuery = query(collection(db, 'exams'), where('active', '==', true));
    const querySnapshot = await getDocs(examsQuery);
    
    if (querySnapshot.empty) {
      return getDefaultExams().filter(e => 
        (e.targetPrograms.length === 0 || e.targetPrograms.includes(programSlug)) &&
        (e.targetCohorts.length === 0 || e.targetCohorts.includes(cohort))
      );
    }

    const allExams: Exam[] = [];
    querySnapshot.forEach(doc => {
      allExams.push({ id: doc.id, ...doc.data() } as Exam);
    });

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
      status: 'in_progress'
    };

    await setDoc(attemptRef, newAttempt);
    return newAttempt;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'examAttempts');
    // Fallback in-memory attempt
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
      status: 'in_progress'
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
  answers: Record<string, StudentAnswer>
): Promise<{ score: number; totalPoints: number; percentage: number }> {
  let score = 0;
  let totalPoints = 0;

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
      score += Math.round(q.points * 0.7);
    }
  });

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  try {
    await updateDoc(doc(db, 'examAttempts', attemptId), {
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      score,
      totalPoints,
      percentage
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `examAttempts/${attemptId}`);
  }

  return { score, totalPoints, percentage };
}
