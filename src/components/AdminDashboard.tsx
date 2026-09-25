import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  StudentProfile, 
  StudentAccountStatus,
  Course, 
  Exam, 
  DeanProfile,
  ExamAttempt,
  Question,
  QuestionOption
} from '../types';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_COURSES, 
  getDefaultExams, 
  DEFAULT_DEAN_PROFILE,
  seedInitialFirestoreData,
  getDeanProfile,
  updateDeanProfile,
  getAllStudents,
  saveStudentProfile,
  saveBulkStudents,
  deleteStudentProfile,
  updateStudentAccountStatus,
  getAllExams,
  saveExam,
  getQuestionsForExam,
  saveQuestion,
  deleteQuestion,
  saveBulkQuestions,
  getAllAttempts
} from '../services/firestoreService';
import { STUDY_PROGRAMS, COHORTS, SEMESTERS, PRODI_COURSES_MAP } from '../constants/programs';
import { 
  downloadQuestionTemplate, 
  downloadStudentTemplate, 
  parseQuestionsFile, 
  parseStudentsFile 
} from '../utils/fileImportExport';
import { formatIndonesianDate, formatIndonesianTime } from '../utils/formatters';
import { 
  Users, 
  Calendar, 
  Award, 
  Download, 
  Plus, 
  Trash2, 
  Edit3,
  Pencil,
  CheckCircle, 
  XCircle, 
  Search, 
  Database, 
  ArrowLeft,
  Sparkles,
  Save,
  BarChart3,
  FileSpreadsheet,
  UploadCloud,
  FileArchive,
  Clock,
  Lock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Eye,
  BookOpen,
  UserCheck,
  UserX,
  AlertOctagon,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { adminUser, isAdmin, logout } = useAuth();
  const { showToast, showModalAlert } = useNotification();

  // Active Main Tabs: 'monitoring' | 'students' | 'exams' | 'dean'
  const [activeTab, setActiveTab] = useState<'monitoring' | 'students' | 'exams' | 'dean'>('monitoring');

  // State
  const [students, setStudents] = useState<StudentProfile[]>(DEFAULT_STUDENTS);
  const [exams, setExams] = useState<Exam[]>(getDefaultExams());
  const [dean, setDean] = useState<DeanProfile>(DEFAULT_DEAN_PROFILE);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  // Proctoring / Monitoring filters
  const [monitorProdi, setMonitorProdi] = useState('all');
  const [monitorExamId, setMonitorExamId] = useState('all');
  const [monitorSearch, setMonitorSearch] = useState('');

  // Structured Students Tab (Requirement 4: Per Prodi)
  const [selectedProdiSlug, setSelectedProdiSlug] = useState<string>('cbt-s1-akuntansi');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCohortFilter, setStudentCohortFilter] = useState('all');
  const [studentSemesterFilter, setStudentSemesterFilter] = useState('all');

  // Modal: Add Single Student
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nim: '',
    name: '',
    email: '',
    cohort: '2023',
    semester: 1,
    status: 'active' as StudentAccountStatus,
    courses: [] as string[]
  });
  const [customCourseInput, setCustomCourseInput] = useState('');

  // Modal: Edit Student (Requirement: Edit Data & Status Akun)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [editCustomCourseInput, setEditCustomCourseInput] = useState('');

  // Bulk Upload Student
  const studentFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingStudents, setUploadingStudents] = useState(false);

  // Question Management (Requirement 3)
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Modal: Add Question
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // Modal: Edit Question (Requirement: Edit Soal yang Sudah Ada)
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQ, setNewQ] = useState<Partial<Question>>({
    type: 'multiple_choice',
    question: '',
    imageUrl: '',
    points: 10,
    correctAnswer: 'A',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
      { id: 'E', text: '' }
    ]
  });
  const questionFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingQuestions, setUploadingQuestions] = useState(false);

  // Exam Schedule Setting State
  const activeExam = exams.find(e => e.id === selectedExamId);
  const [schedPublishDate, setSchedPublishDate] = useState<string>(activeExam?.publishDate || '');
  const [schedPublishTime, setSchedPublishTime] = useState<string>(activeExam?.publishTime || '08:00');
  const [schedDuration, setSchedDuration] = useState<number>(activeExam?.durationMinutes || 90);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Update schedule inputs when selected exam changes
  useEffect(() => {
    if (activeExam) {
      setSchedPublishDate(activeExam.publishDate || '');
      setSchedPublishTime(activeExam.publishTime || '08:00');
      setSchedDuration(activeExam.durationMinutes || 90);
      loadQuestions(activeExam.id);
    }
  }, [selectedExamId, activeExam]);

  // Update default courses when semester changes in Add Student Modal
  useEffect(() => {
    if (selectedProdiSlug && newStudent.semester) {
      const defaultList = PRODI_COURSES_MAP[selectedProdiSlug]?.[newStudent.semester] || [];
      setNewStudent(prev => ({ ...prev, courses: defaultList }));
    }
  }, [selectedProdiSlug, newStudent.semester]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [stdData, exData, dData, attData] = await Promise.all([
        getAllStudents(),
        getAllExams(),
        getDeanProfile(),
        getAllAttempts()
      ]);
      setStudents(stdData);
      setExams(exData);
      setDean(dData);
      setAttempts(attData);

      if (exData.length > 0 && !selectedExamId) {
        setSelectedExamId(exData[0].id);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (examId: string) => {
    setLoadingQuestions(true);
    try {
      const qList = await getQuestionsForExam(examId);
      setExamQuestions(qList);
    } catch (e) {
      console.error('Error loading questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // STRICT ACCESS CHECK (Requirement 2)
  if (!isAdmin || adminUser?.email.toLowerCase().trim() !== 'nadhiframadhan780@gmail.com') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Akses Dibatasi — Administrator Only
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Halaman ini membutuhkan hak otorisasi akun Google resmi <b className="text-slate-800 font-mono">nadhiframadhan780@gmail.com</b>. Akun Anda saat ini tidak memiliki izin akses.
          </p>
          <button
            onClick={onBackToHome}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Current selected prodi name
  const currentProdi = STUDY_PROGRAMS.find(p => p.slug === selectedProdiSlug) || STUDY_PROGRAMS[0];

  // Filtered Students for the selected prodi
  const filteredStudents = students.filter(s => {
    if (s.programSlug !== selectedProdiSlug) return false;
    if (studentCohortFilter !== 'all' && s.cohort !== studentCohortFilter) return false;
    if (studentSemesterFilter !== 'all' && s.semester !== Number(studentSemesterFilter)) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle Save Student
  const handleSaveStudent = async () => {
    if (!newStudent.nim.trim() || !newStudent.name.trim()) {
      showToast('error', 'Validasi Gagal', 'NIM dan Nama Lengkap wajib diisi.');
      return;
    }

    const email = newStudent.email.trim() || `${newStudent.nim.trim()}@mahasiswa.upnvj.ac.id`;
    const studentProfile: StudentProfile = {
      uid: `uid_${newStudent.nim.trim()}`,
      nim: newStudent.nim.trim(),
      name: newStudent.name.trim(),
      email,
      program: currentProdi.name,
      programSlug: selectedProdiSlug,
      cohort: newStudent.cohort,
      semester: newStudent.semester,
      courses: newStudent.courses,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const ok = await saveStudentProfile(studentProfile);
    if (ok) {
      setStudents(prev => [studentProfile, ...prev.filter(s => s.nim !== studentProfile.nim)]);
      setShowAddStudentModal(false);
      showToast('success', 'Data Tersimpan', `Mahasiswa ${studentProfile.name} (${studentProfile.nim}) berhasil ditambahkan ke ${currentProdi.shortName}!`);
      setNewStudent({
        nim: '',
        name: '',
        email: '',
        cohort: '2026',
        semester: 1,
        status: 'active',
        courses: PRODI_COURSES_MAP[selectedProdiSlug]?.[1] || []
      });
    } else {
      showToast('error', 'Gagal', 'Terjadi kendala saat menyimpan ke database Firestore.');
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async (nim: string, name: string) => {
    const ok = await deleteStudentProfile(nim);
    if (ok) {
      setStudents(prev => prev.filter(s => s.nim !== nim));
      showToast('success', 'Terhapus', `Data mahasiswa ${name} (${nim}) telah dihapus dari sistem.`);
    }
  };

  // Handle Update Student Status (Aktifkan, Nonaktifkan Sementara, Nonaktif Permanen)
  const handleUpdateStudentAccountStatus = async (
    nim: string,
    status: StudentAccountStatus,
    studentName?: string
  ) => {
    let reason: string | undefined;
    if (status === 'temporary_inactive') {
      reason = 'AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN';
    } else if (status === 'permanent_inactive') {
      reason = 'AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA, JIKA INI KELIRU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT';
    }

    const ok = await updateStudentAccountStatus(nim, status, reason);
    if (ok) {
      setStudents(prev => prev.map(s => {
        if (s.nim === nim) {
          return {
            ...s,
            status,
            active: status === 'active',
            statusReason: reason
          };
        }
        return s;
      }));

      const nameLabel = studentName ? `Mahasiswa ${studentName}` : `NIM ${nim}`;
      if (status === 'active') {
        showToast('success', 'Akun Diaktifkan', `${nameLabel} berhasil diaktifkan kembali.`);
      } else if (status === 'temporary_inactive') {
        showToast('warning', 'Nonaktif Sementara', `${nameLabel} dinonaktifkan sementara waktu (Tidak hadir hari ujian).`);
      } else {
        showToast('error', 'Nonaktif Permanen', `${nameLabel} dinonaktifkan permanen.`);
      }
    } else {
      showToast('error', 'Gagal', 'Terjadi kendala saat memperbarui status akun di Firestore.');
    }
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (student: StudentProfile) => {
    setEditingStudent({ 
      ...student,
      status: student.status || (student.active ? 'active' : 'temporary_inactive'),
      courses: student.courses ? [...student.courses] : []
    });
    setShowEditStudentModal(true);
  };

  // Save Edited Student
  const handleSaveEditedStudent = async () => {
    if (!editingStudent) return;
    if (!editingStudent.name.trim() || !editingStudent.nim.trim()) {
      showToast('error', 'Validasi Gagal', 'Nama Lengkap dan NIM wajib diisi.');
      return;
    }

    let statusReason = editingStudent.statusReason;
    if (editingStudent.status === 'temporary_inactive') {
      statusReason = 'AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN';
    } else if (editingStudent.status === 'permanent_inactive') {
      statusReason = 'AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA, JIKA INI KELIRU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT';
    } else {
      statusReason = undefined;
    }

    const updatedProfile: StudentProfile = {
      ...editingStudent,
      name: editingStudent.name.trim(),
      nim: editingStudent.nim.trim(),
      email: editingStudent.email?.trim() || `${editingStudent.nim.trim()}@mahasiswa.upnvj.ac.id`,
      active: editingStudent.status === 'active',
      statusReason,
      updatedAt: new Date().toISOString()
    };

    const ok = await saveStudentProfile(updatedProfile);
    if (ok) {
      setStudents(prev => prev.map(s => s.nim === updatedProfile.nim ? updatedProfile : s));
      setShowEditStudentModal(false);
      setEditingStudent(null);
      showToast('success', 'Data Mahasiswa Diperbarui', `Perubahan data ${updatedProfile.name} (${updatedProfile.nim}) berhasil disimpan.`);
    } else {
      showToast('error', 'Gagal', 'Tidak dapat memperbarui data mahasiswa di Firestore.');
    }
  };

  // Handle Bulk Upload Students (CSV, XLS/XLSX, ZIP)
  const handleUploadStudentsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStudents(true);
    try {
      const parsed = await parseStudentsFile(file, selectedProdiSlug, currentProdi.name);
      const count = await saveBulkStudents(parsed);
      
      // Update local state
      setStudents(prev => {
        const existingMap = new Map(prev.map(s => [s.nim, s]));
        parsed.forEach(p => existingMap.set(p.nim, p));
        return Array.from(existingMap.values());
      });

      showToast('success', 'Impor Berhasil!', `Sebanyak ${count} data mahasiswa berhasil diimpor ke ${currentProdi.shortName}.`);
    } catch (err: any) {
      showModalAlert('error', 'Gagal Mengunggah Berkas', err.message || 'Format berkas tidak sesuai.', 'Format Salah');
    } finally {
      setUploadingStudents(false);
      if (studentFileInputRef.current) {
        studentFileInputRef.current.value = '';
      }
    }
  };

  // Handle Save Exam Schedule (Publish Date & Time)
  const handleSaveExamSchedule = async () => {
    if (!activeExam) return;

    const updated: Exam = {
      ...activeExam,
      publishDate: schedPublishDate,
      publishTime: schedPublishTime,
      durationMinutes: Number(schedDuration),
      startAt: `${schedPublishDate}T${schedPublishTime}:00`,
      updatedAt: new Date().toISOString()
    };

    const ok = await saveExam(updated);
    if (ok) {
      setExams(prev => prev.map(e => e.id === updated.id ? updated : e));
      showToast('success', 'Jadwal Diperbarui', `Jadwal publish otomatis untuk ${activeExam.title} berhasil disimpan.`);
    }
  };

  // Handle Add Single Question (Requirement 3)
  const handleSaveQuestion = async () => {
    if (!selectedExamId || !newQ.question?.trim()) {
      showToast('error', 'Validasi Gagal', 'Naskah pertanyaan soal wajib diisi.');
      return;
    }

    const order = examQuestions.length + 1;
    const questionObj: Question = {
      id: `q_${selectedExamId}_${order}_${Date.now().toString(36)}`,
      examId: selectedExamId,
      order,
      type: newQ.type || 'multiple_choice',
      question: newQ.question.trim(),
      imageUrl: newQ.imageUrl?.trim() || undefined,
      options: (newQ.type === 'multiple_choice' || newQ.type === 'multiple_choice_image') ? newQ.options : undefined,
      correctAnswer: newQ.correctAnswer || 'A',
      points: Number(newQ.points) || 10
    };

    const ok = await saveQuestion(questionObj);
    if (ok) {
      setExamQuestions(prev => [...prev, questionObj]);
      setShowAddQuestionModal(false);
      showToast('success', 'Soal Ditambahkan', `Soal nomor ${order} berhasil ditambahkan.`);
      setNewQ({
        type: 'multiple_choice',
        question: '',
        imageUrl: '',
        points: 10,
        correctAnswer: 'A',
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
          { id: 'E', text: '' }
        ]
      });
    }
  };

  // Handle Bulk Upload Questions (CSV, XLS/XLSX, ZIP)
  const handleUploadQuestionsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExamId) return;

    setUploadingQuestions(true);
    try {
      const parsed = await parseQuestionsFile(file, selectedExamId);
      const count = await saveBulkQuestions(parsed);
      setExamQuestions(parsed);
      showToast('success', 'Unggah Soal Sukses!', `Sebanyak ${count} butir soal berhasil diimpor ke sistem.`);
    } catch (err: any) {
      showModalAlert('error', 'Gagal Mengimpor Soal', err.message || 'Periksa kembali struktur kolom pada berkas.', 'Error Import');
    } finally {
      setUploadingQuestions(false);
      if (questionFileInputRef.current) {
        questionFileInputRef.current.value = '';
      }
    }
  };

  // Handle Image Upload for Single Question
  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewQ(prev => ({ ...prev, imageUrl: reader.result as string }));
      showToast('info', 'Gambar Terpilih', 'Pratinjau gambar berhasil dimuat.');
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion({
      ...q,
      options: q.options ? q.options.map(o => ({ ...o })) : [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' }
      ]
    });
    setShowEditQuestionModal(true);
  };

  // Save Edited Question
  const handleSaveEditedQuestion = async () => {
    if (!editingQuestion || !editingQuestion.question?.trim()) {
      showToast('error', 'Validasi Gagal', 'Naskah pertanyaan soal tidak boleh kosong.');
      return;
    }

    const updatedQuestion: Question = {
      ...editingQuestion,
      question: editingQuestion.question.trim(),
      points: Number(editingQuestion.points) || 10,
      imageUrl: editingQuestion.imageUrl?.trim() || undefined
    };

    const ok = await saveQuestion(updatedQuestion);
    if (ok) {
      setExamQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
      setShowEditQuestionModal(false);
      setEditingQuestion(null);
      showToast('success', 'Soal Diperbarui', `Butir soal nomor ${updatedQuestion.order} berhasil diperbarui.`);
    } else {
      showToast('error', 'Gagal', 'Terjadi kendala saat menyimpan butir soal ke Firestore.');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    const ok = await deleteQuestion(questionId);
    if (ok) {
      setExamQuestions(prev => prev.filter(q => q.id !== questionId));
      showToast('success', 'Soal Dihapus', 'Butir soal telah dihapus dari bank ujian.');
    } else {
      showToast('error', 'Gagal', 'Gagal menghapus butir soal dari Firestore.');
    }
  };

  // Handle Image Upload for Editing Question
  const handleEditQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingQuestion) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingQuestion(prev => prev ? ({ ...prev, imageUrl: reader.result as string }) : null);
      showToast('info', 'Gambar Terpilih', 'Pratinjau gambar soal berhasil dimuat.');
    };
    reader.readAsDataURL(file);
  };

  // Proctoring Table Data Calculation (Requirement 8)
  const proctoringStudents = students.filter(s => {
    if (monitorProdi !== 'all' && s.programSlug !== monitorProdi) return false;
    if (monitorSearch.trim()) {
      const q = monitorSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
    }
    return true;
  });

  const getStudentAttempt = (nim: string) => {
    return attempts.find(a => a.nim === nim);
  };

  // Monitoring Counts
  const totalMonitored = proctoringStudents.length;
  const inProgressCount = proctoringStudents.filter(s => getStudentAttempt(s.nim)?.status === 'in_progress').length;
  const submittedCount = proctoringStudents.filter(s => getStudentAttempt(s.nim)?.status === 'submitted').length;
  const disqualifiedCount = proctoringStudents.filter(s => getStudentAttempt(s.nim)?.status === 'disqualified').length;
  const notStartedCount = totalMonitored - (inProgressCount + submittedCount + disqualifiedCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Top Header & Identity */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-700">Administrator Panel FEB</span>
          </div>
        </div>

        {/* Admin Logged In Identity */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-extrabold text-slate-900">{adminUser?.name}</p>
            <p className="text-[10px] font-mono text-teal-700">{adminUser?.email}</p>
          </div>
          <button
            onClick={async () => {
              await logout();
              onBackToHome();
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Keluar Admin
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'monitoring'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <span>Pemantauan Ujian Real-Time</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Manajemen Mahasiswa per Prodi</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Bank Soal & Jadwal Publish</span>
        </button>

        <button
          onClick={() => setActiveTab('dean')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dean'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Sambutan Dekan & Database</span>
        </button>
      </div>

      {/* ================= TAB 1: PEMANTAUAN UJIAN REAL-TIME (Requirement 8) ================= */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          
          {/* KPI Monitoring Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Peserta</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalMonitored}</p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] uppercase font-bold text-emerald-800">Sedang Mengerjakan</span>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-1">{inProgressCount}</p>
            </div>

            <div className="p-5 rounded-3xl bg-teal-50 border border-teal-200 text-teal-950 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-teal-800">Selesai Terkumpul</span>
              <p className="text-2xl font-black text-teal-900 mt-1">{submittedCount}</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Belum Memulai</span>
              <p className="text-2xl font-black text-slate-700 mt-1">{notStartedCount}</p>
            </div>

            <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-800">Didiskualifikasi</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{disqualifiedCount}</p>
            </div>
          </div>

          {/* Filter Bar & Refresh Button */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Program Studi:</label>
                <select
                  value={monitorProdi}
                  onChange={(e) => setMonitorProdi(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value="all">Semua Program Studi (FEB)</option>
                  {STUDY_PROGRAMS.map(p => (
                    <option key={p.slug} value={p.slug}>{p.shortName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cari Mahasiswa:</label>
                <input
                  type="text"
                  placeholder="Ketik nama atau NIM..."
                  value={monitorSearch}
                  onChange={(e) => setMonitorSearch(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs w-56"
                />
              </div>
            </div>

            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Monitoring</span>
            </button>
          </div>

          {/* Real-Time Proctoring Monitoring Table */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs overflow-hidden">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4">
              Status Pengerjaan Mahasiswa (Pengawas Akademik Digital)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">NIM</th>
                    <th className="px-4 py-3.5">Nama Mahasiswa</th>
                    <th className="px-4 py-3.5">Program Studi</th>
                    <th className="px-4 py-3.5">Status Pengerjaan</th>
                    <th className="px-4 py-3.5">Waktu Mulai</th>
                    <th className="px-4 py-3.5">Nilai / Skor</th>
                    <th className="px-4 py-3.5 text-center">Peringatan Kecurangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {proctoringStudents.map((std) => {
                    const att = getStudentAttempt(std.nim);
                    let statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Belum Memulai
                      </span>
                    );

                    if (att?.status === 'in_progress') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                          Sedang Mengerjakan
                        </span>
                      );
                    } else if (att?.status === 'submitted') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3 text-teal-600" />
                          Selesai Terkumpul
                        </span>
                      );
                    } else if (att?.status === 'disqualified') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Didiskualifikasi (Kecurangan)
                        </span>
                      );
                    }

                    return (
                      <tr key={std.nim} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{std.nim}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{std.name}</td>
                        <td className="px-4 py-3.5 text-slate-600">{std.program}</td>
                        <td className="px-4 py-3.5">{statusBadge}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-500">
                          {att?.startedAt ? formatIndonesianTime(att.startedAt) : '-'}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                          {att?.score !== undefined ? `${att.score} (${att.percentage}%)` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {att?.violationCount && att.violationCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                              {att.violationCount}x Keluar Tab
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: MANAJEMEN MAHASISWA PER PRODI (Requirement 4) ================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          
          {/* Structured Prodi Tabs (Requirement 4) */}
          <div className="flex items-center gap-2 pb-2 overflow-x-auto border-b border-slate-200">
            {STUDY_PROGRAMS.map(prog => (
              <button
                key={prog.slug}
                onClick={() => setSelectedProdiSlug(prog.slug)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedProdiSlug === prog.slug
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {prog.name}
              </button>
            ))}
          </div>

          {/* Action Toolbar for current Prodi */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px] uppercase tracking-wider">
                  Pangkalan Data Terstruktur
                </span>
                <span className="text-xs text-slate-500 font-medium">Total Terdaftar: {filteredStudents.length} Mahasiswa</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Data Mahasiswa {currentProdi.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Template download */}
              <button
                onClick={() => downloadStudentTemplate(selectedProdiSlug, currentProdi.name, 'xlsx')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Template (Excel/CSV)</span>
              </button>

              {/* Bulk upload file input */}
              <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{uploadingStudents ? 'Mengunggah...' : 'Upload CSV / XLS / ZIP'}</span>
                <input
                  ref={studentFileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.zip"
                  onChange={handleUploadStudentsFile}
                  disabled={uploadingStudents}
                  className="hidden"
                />
              </label>

              {/* Add single student */}
              <button
                onClick={() => {
                  setNewStudent({
                    nim: '',
                    name: '',
                    email: '',
                    cohort: '2026',
                    semester: 1,
                    status: 'active',
                    courses: PRODI_COURSES_MAP[selectedProdiSlug]?.[1] || []
                  });
                  setShowAddStudentModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-700/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mahasiswa Manual</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <input
                type="text"
                placeholder="Cari NIM atau Nama..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs w-60"
              />

              <select
                value={studentCohortFilter}
                onChange={(e) => setStudentCohortFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">Semua Angkatan</option>
                {COHORTS.map(c => (
                  <option key={c} value={c}>Angkatan {c}</option>
                ))}
              </select>

              <select
                value={studentSemesterFilter}
                onChange={(e) => setStudentSemesterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">Semua Semester</option>
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs overflow-hidden">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3.5 w-10 text-center">No</th>
                    <th className="px-3.5 py-3.5">NIM</th>
                    <th className="px-3.5 py-3.5">Nama Lengkap</th>
                    <th className="px-3 py-3.5">Angkatan</th>
                    <th className="px-3 py-3.5">Semester</th>
                    <th className="px-3.5 py-3.5">Status Akun</th>
                    <th className="px-3.5 py-3.5">Mata Kuliah Terdaftar</th>
                    <th className="px-4 py-3.5 text-center">Kelola Status & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((std, idx) => (
                    <tr key={std.nim} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3.5 py-3.5 font-mono font-bold text-slate-900">{std.nim}</td>
                      <td className="px-3.5 py-3.5">
                        <p className="font-bold text-slate-900">{std.name}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{std.email}</span>
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-slate-700">{std.cohort}</td>
                      <td className="px-3 py-3.5 font-bold text-teal-800">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                          Semester {std.semester || 1}
                        </span>
                      </td>
                      <td className="px-3.5 py-3.5">
                        {std.status === 'temporary_inactive' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Nonaktif Sementara
                          </span>
                        ) : std.status === 'permanent_inactive' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-extrabold text-[10px] border border-rose-300">
                            <AlertOctagon className="w-3 h-3 text-rose-600" />
                            Nonaktif Permanen
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-300">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Akun Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3.5 max-w-xs">
                        <p className="text-[11px] text-slate-600 truncate">
                          {(std.courses || PRODI_COURSES_MAP[selectedProdiSlug]?.[std.semester || 1] || []).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Quick Status Dropdown Selector */}
                          <select
                            value={std.status || (std.active ? 'active' : 'temporary_inactive')}
                            onChange={(e) => handleUpdateStudentAccountStatus(std.nim, e.target.value as StudentAccountStatus, std.name)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                              std.status === 'temporary_inactive'
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : std.status === 'permanent_inactive'
                                ? 'bg-rose-50 border-rose-300 text-rose-900'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            }`}
                            title="Atur Status Akun Mahasiswa"
                          >
                            <option value="active">✓ Aktifkan Akun</option>
                            <option value="temporary_inactive">⏸ Nonaktifkan Sementara</option>
                            <option value="permanent_inactive">✕ Akun Nonaktif Permanen</option>
                          </select>

                          {/* Edit Student Button */}
                          <button
                            onClick={() => handleOpenEditStudent(std)}
                            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 hover:text-teal-900 transition-colors cursor-pointer border border-teal-200"
                            title="Edit Data & Status Mahasiswa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Student Button */}
                          <button
                            onClick={() => handleDeleteStudent(std.nim, std.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors cursor-pointer border border-rose-200"
                            title="Hapus Mahasiswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Belum ada data mahasiswa untuk filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 3: BANK SOAL & JADWAL PUBLISH (Requirement 3) ================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          
          {/* Exam Selector & Auto-Publish Scheduler Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                  Pengaturan Publish Otomatis
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Jadwal Ujian & Publikasi Soal
                </h2>
              </div>

              {/* Select Exam to Manage */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">Pilih Ujian:</span>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 text-xs"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scheduler Form (Requirement 3: Atur Tanggal hingga Jam Publish Otomatis) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">Tanggal Publish Otomatis:</label>
                <input
                  type="date"
                  value={schedPublishDate}
                  onChange={(e) => setSchedPublishDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1.5">Jam Publish Otomatis (WIB):</label>
                <input
                  type="time"
                  value={schedPublishTime}
                  onChange={(e) => setSchedPublishTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1.5">Durasi Pengerjaan (Menit):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                  />
                  <button
                    onClick={handleSaveExamSchedule}
                    className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors shadow-sm"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </div>
            </div>

            {/* Active Status Display */}
            {activeExam && (
              <div className="mt-4 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>Jadwal Terjadwal: <b>{schedPublishDate || 'Hari ini'}</b> pukul <b>{schedPublishTime} WIB</b> ({schedDuration} Menit).</span>
                </div>
                <span className="font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-teal-200 text-[10px]">
                  Siap Terpublikasi Otomatis
                </span>
              </div>
            )}

          </div>

          {/* Question Management Action Header */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Daftar Soal ({examQuestions.length} Butir Soal)
              </h3>
              <p className="text-xs text-slate-500">Mendukung pilihan ganda bergambar, benar/salah, isian singkat, dan esai.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Template Download */}
              <button
                onClick={() => downloadQuestionTemplate('xlsx')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Template Soal</span>
              </button>

              {/* Bulk Upload Questions (CSV, XLS, ZIP) */}
              <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{uploadingQuestions ? 'Mengunggah...' : 'Upload Soal (CSV/XLS/ZIP)'}</span>
                <input
                  ref={questionFileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.zip"
                  onChange={handleUploadQuestionsFile}
                  disabled={uploadingQuestions}
                  className="hidden"
                />
              </label>

              {/* Add Single Question */}
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-700/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Soal Baru</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {loadingQuestions ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                Memuat butir soal...
              </div>
            ) : examQuestions.map((q, idx) => (
              <div key={q.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-700 uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-100">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 text-[11px]">Bobot: {q.points} Poin</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono ml-2">
                      Kunci: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer shadow-xs"
                      title="Edit butir soal ini"
                    >
                      <Pencil className="w-3.5 h-3.5 text-teal-700" />
                      <span>Edit Soal</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer shadow-xs"
                      title="Hapus butir soal"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {q.question}
                </p>

                {/* Optional Image */}
                {q.imageUrl && (
                  <div className="my-3 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={q.imageUrl} alt="Lampiran" className="max-h-48 object-contain" />
                  </div>
                )}

                {/* Options Preview */}
                {q.options && q.options.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {q.options.map(opt => (
                      <div key={opt.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                        <span className="font-bold text-teal-800 w-5">{opt.id}.</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= TAB 4: DEAN PROFILE & DATABASE SYNC ================= */}
      {activeTab === 'dean' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Profil & Sambutan Resmi Dekan FEB
            </h3>
            <p className="text-xs text-slate-500 mb-6">Informasi yang tampil pada halaman depan portal CBT.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={dean.name}
                  onChange={(e) => setDean({ ...dean, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Jabatan Akademik:</label>
                <input
                  type="text"
                  value={dean.title}
                  onChange={(e) => setDean({ ...dean, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="mb-4 text-xs">
              <label className="block text-slate-600 font-bold mb-1">Teks Sambutan Dekan:</label>
              <textarea
                rows={4}
                value={dean.greeting}
                onChange={(e) => setDean({ ...dean, greeting: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed"
              />
            </div>

            <button
              onClick={async () => {
                const ok = await updateDeanProfile(dean);
                if (ok) showToast('success', 'Tersimpan', 'Profil Dekan berhasil diperbarui.');
              }}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              Simpan Perubahan Sambutan
            </button>
          </div>

          {/* Reset / Reseed Database */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 border border-amber-300 text-xs">
            <h4 className="text-base font-bold text-amber-950 mb-1">Sinkronisasi & Inisialisasi Database Awal</h4>
            <p className="text-amber-900 leading-relaxed mb-4">
              Sinkronkan pangkalan data Firestore dengan data kurikulum dan bank soal awal Fakultas Ekonomi dan Bisnis UPNVJ.
            </p>
            <button
              onClick={async () => {
                const res = await seedInitialFirestoreData();
                if (res.success) {
                  showToast('success', 'Sinkronisasi Berhasil', res.message);
                  loadAllData();
                } else {
                  showToast('info', 'Status Database', res.message);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer"
            >
              Sinkronkan Database Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDENT (Requirement 4) ================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Tambah Data Mahasiswa Baru ({currentProdi.shortName})
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Lengkapi data mahasiswa beserta mata kuliah terdaftar pada semester yang dipilih.
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor Induk Mahasiswa (NIM): *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2310111001"
                    value={newStudent.nim}
                    onChange={(e) => setNewStudent({ ...newStudent, nim: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Mahasiswa: *</label>
                  <input
                    type="text"
                    placeholder="Nama lengkap sesuai KTM"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tahun Angkatan:</label>
                  <select
                    value={newStudent.cohort}
                    onChange={(e) => setNewStudent({ ...newStudent, cohort: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {COHORTS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pilih Semester (1 - 8):</label>
                  <select
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-teal-800 text-xs"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Resmi (Opsional):</label>
                  <input
                    type="email"
                    placeholder="auto: nim@mahasiswa..."
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Course Selection for that Semester */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-bold mb-2">
                  Daftar Mata Kuliah Diambil (Semester {newStudent.semester}):
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {newStudent.courses.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => setNewStudent({
                          ...newStudent,
                          courses: newStudent.courses.filter((_, idx) => idx !== i)
                        })}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Custom Course */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tambah nama mata kuliah lain..."
                    value={customCourseInput}
                    onChange={(e) => setCustomCourseInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCourseInput.trim()) {
                        setNewStudent({
                          ...newStudent,
                          courses: [...newStudent.courses, customCourseInput.trim()]
                        });
                        setCustomCourseInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs"
                  >
                    Tambah MK
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveStudent}
                className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20"
              >
                Simpan Mahasiswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD QUESTION (Requirement 3) ================= */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Buat Butir Soal Baru
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Mendukung berbagai jenis soal dan penambahan media gambar.
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipe Soal:</label>
                  <select
                    value={newQ.type}
                    onChange={(e) => setNewQ({ ...newQ, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="multiple_choice">Pilihan Ganda (A - E)</option>
                    <option value="multiple_choice_image">Pilihan Ganda Bergambar</option>
                    <option value="true_false">Benar / Salah (True/False)</option>
                    <option value="short_answer">Jawaban Singkat</option>
                    <option value="essay">Uraian / Esai Komprehensif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bobot Poin Soal:</label>
                  <input
                    type="number"
                    value={newQ.points}
                    onChange={(e) => setNewQ({ ...newQ, points: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Teks Pertanyaan Soal: *</label>
                <textarea
                  rows={4}
                  placeholder="Ketikkan naskah soal secara lengkap..."
                  value={newQ.question}
                  onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed"
                />
              </div>

              {/* Image attachment (Requirement 3) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-slate-700 font-bold">
                  Lampiran Gambar Soal (Opsional):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQuestionImageUpload}
                    className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                  <span className="text-slate-400">atau</span>
                  <input
                    type="text"
                    placeholder="Tempel URL Gambar..."
                    value={newQ.imageUrl}
                    onChange={(e) => setNewQ({ ...newQ, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
                {newQ.imageUrl && (
                  <div className="mt-2 max-w-xs rounded-xl overflow-hidden border border-slate-200">
                    <img src={newQ.imageUrl} alt="Preview" className="max-h-36 object-contain" />
                  </div>
                )}
              </div>

              {/* Options Form for Multiple Choice */}
              {(newQ.type === 'multiple_choice' || newQ.type === 'multiple_choice_image') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-slate-700 font-bold">Pilihan Jawaban (A - E):</label>
                  {newQ.options?.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-6 font-bold text-teal-800 text-center">{opt.id}</span>
                      <input
                        type="text"
                        placeholder={`Teks pilihan ${opt.id}...`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...(newQ.options || [])];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setNewQ({ ...newQ, options: updated });
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  ))}

                  <div className="mt-2 flex items-center gap-3 pt-2">
                    <span className="font-bold text-slate-700">Kunci Jawaban Benar:</span>
                    <select
                      value={newQ.correctAnswer as string}
                      onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-emerald-800 bg-white text-xs"
                    >
                      {['A', 'B', 'C', 'D', 'E'].map(o => (
                        <option key={o} value={o}>Pilihan {o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* True/False selection */}
              {newQ.type === 'true_false' && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="font-bold text-slate-700">Kunci Jawaban Benar:</span>
                  <select
                    value={newQ.correctAnswer as string}
                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-emerald-800 bg-white text-xs"
                  >
                    <option value="Benar">Benar</option>
                    <option value="Salah">Salah</option>
                  </select>
                </div>
              )}

              {/* Short Answer / Essay Rubric */}
              {(newQ.type === 'short_answer' || newQ.type === 'essay') && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kunci Jawaban / Kata Kunci Penilaian:</label>
                  <input
                    type="text"
                    placeholder="Contoh: IFRS / Transparansi / Rasio Lancar"
                    value={newQ.correctAnswer as string}
                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              )}

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20"
              >
                Simpan Soal ke Bank Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STUDENT (Requirement: Edit Data Mahasiswa & Status Akun) ================= */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px] uppercase tracking-wider">
                  Edit Data & Status Mahasiswa
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {editingStudent.name} ({editingStudent.nim})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah data pribadi, prodi, semester, dan kendalikan status aktif/nonaktif akun mahasiswa.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowEditStudentModal(false);
                  setEditingStudent(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor Induk Mahasiswa (NIM): *</label>
                  <input
                    type="text"
                    value={editingStudent.nim}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nim: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Mahasiswa: *</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tahun Angkatan:</label>
                  <select
                    value={editingStudent.cohort}
                    onChange={(e) => setEditingStudent({ ...editingStudent, cohort: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  >
                    {COHORTS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Program Studi:</label>
                  <select
                    value={editingStudent.programSlug}
                    onChange={(e) => {
                      const matched = STUDY_PROGRAMS.find(p => p.slug === e.target.value);
                      setEditingStudent({ 
                        ...editingStudent, 
                        programSlug: e.target.value,
                        program: matched ? matched.name : editingStudent.program
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  >
                    {STUDY_PROGRAMS.map(p => (
                      <option key={p.slug} value={p.slug}>{p.shortName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Semester (1 - 8):</label>
                  <select
                    value={editingStudent.semester || 1}
                    onChange={(e) => setEditingStudent({ ...editingStudent, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-teal-800 text-xs"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Mahasiswa (Google UPNVJ):</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              {/* Requirement: ATUR AKTIFKAN AKUN, NONAKTIFKAN SEMENTARA AKUN, DAN AKUN NONAKTIF PERMANEN */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-800 font-black mb-2 text-xs uppercase tracking-wide">
                  Pengaturan Status Akun Mahasiswa (Terintegrasi ke Login CBT):
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Status 1: Active */}
                  <div
                    onClick={() => setEditingStudent({ 
                      ...editingStudent, 
                      status: 'active',
                      statusReason: undefined
                    })}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      editingStudent.status === 'active' || (!editingStudent.status && editingStudent.active)
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountStatus"
                      checked={editingStudent.status === 'active' || (!editingStudent.status && editingStudent.active)}
                      onChange={() => {}}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-emerald-950 text-xs">1. Aktifkan Akun (Normal)</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Status Utama</span>
                      </div>
                      <p className="text-[11px] text-emerald-900 mt-0.5">
                        Mahasiswa memiliki hak penuh untuk login Google dan masuk ke ruang ujian CBT sesuai jadwal studinya.
                      </p>
                    </div>
                  </div>

                  {/* Status 2: Temporary Inactive */}
                  <div
                    onClick={() => setEditingStudent({ 
                      ...editingStudent, 
                      status: 'temporary_inactive',
                      statusReason: 'AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN'
                    })}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      editingStudent.status === 'temporary_inactive'
                        ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountStatus"
                      checked={editingStudent.status === 'temporary_inactive'}
                      onChange={() => {}}
                      className="mt-1 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-amber-950 text-xs">2. Nonaktifkan Sementara Akun</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">Tangguhkan</span>
                      </div>
                      <p className="text-[11px] text-amber-900 mt-0.5 font-semibold">
                        Pesan di web mahasiswa: <span className="italic font-bold">"AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN"</span>
                      </p>
                    </div>
                  </div>

                  {/* Status 3: Permanent Inactive */}
                  <div
                    onClick={() => setEditingStudent({ 
                      ...editingStudent, 
                      status: 'permanent_inactive',
                      statusReason: 'AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA, JIKA INI KELIRU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT'
                    })}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      editingStudent.status === 'permanent_inactive'
                        ? 'bg-rose-50/80 border-rose-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountStatus"
                      checked={editingStudent.status === 'permanent_inactive'}
                      onChange={() => {}}
                      className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-rose-950 text-xs">3. Akun Nonaktif Permanen</span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-bold">Diblokir</span>
                      </div>
                      <p className="text-[11px] text-rose-900 mt-0.5 font-semibold">
                        Pesan di web mahasiswa: <span className="italic font-bold">"AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL &quot;VETERAN&quot; JAKARTA, JIKAA INII KELIRUU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT"</span> (Dilengkapi tombol Hubungi Helpdesk).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Selection */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-bold mb-2">
                  Daftar Mata Kuliah Terdaftar:
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editingStudent.courses || []).map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => setEditingStudent({
                          ...editingStudent,
                          courses: (editingStudent.courses || []).filter((_, idx) => idx !== i)
                        })}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                        title="Hapus mata kuliah ini"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Custom Course */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tambah nama mata kuliah..."
                    value={editCustomCourseInput}
                    onChange={(e) => setEditCustomCourseInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editCustomCourseInput.trim()) {
                        setEditingStudent({
                          ...editingStudent,
                          courses: [...(editingStudent.courses || []), editCustomCourseInput.trim()]
                        });
                        setEditCustomCourseInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Tambah MK
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditStudentModal(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditedStudent}
                className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 cursor-pointer transition-all"
              >
                Simpan Perubahan Mahasiswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT QUESTION (Requirement: Edit Soal yang Sudah Ada) ================= */}
      {showEditQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px] uppercase tracking-wider">
                  Edit Butir Soal
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Perbaiki Soal Nomor {editingQuestion.order}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah naskah soal, bobot poin, opsi jawaban, gambar, atau kunci jawaban.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowEditQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipe Soal:</label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="multiple_choice">Pilihan Ganda (A - E)</option>
                    <option value="multiple_choice_image">Pilihan Ganda Bergambar</option>
                    <option value="true_false">Benar / Salah (True/False)</option>
                    <option value="short_answer">Jawaban Singkat</option>
                    <option value="essay">Uraian / Esai Komprehensif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bobot Poin Soal:</label>
                  <input
                    type="number"
                    value={editingQuestion.points}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, points: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Teks Pertanyaan Soal: *</label>
                <textarea
                  rows={4}
                  placeholder="Ketikkan naskah soal secara lengkap..."
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed"
                />
              </div>

              {/* Image attachment */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-slate-700 font-bold">
                  Lampiran Gambar Soal (Opsional):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditQuestionImageUpload}
                    className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                  <span className="text-slate-400">atau</span>
                  <input
                    type="text"
                    placeholder="Tempel URL Gambar..."
                    value={editingQuestion.imageUrl || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
                {editingQuestion.imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                      <img src={editingQuestion.imageUrl} alt="Preview" className="max-h-36 object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, imageUrl: undefined })}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold underline cursor-pointer"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                )}
              </div>

              {/* Options Form for Multiple Choice */}
              {(editingQuestion.type === 'multiple_choice' || editingQuestion.type === 'multiple_choice_image') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-slate-700 font-bold">Pilihan Jawaban (A - E):</label>
                  {editingQuestion.options?.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-6 font-bold text-teal-800 text-center">{opt.id}</span>
                      <input
                        type="text"
                        placeholder={`Teks pilihan ${opt.id}...`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...(editingQuestion.options || [])];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: updated });
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  ))}

                  <div className="mt-2 flex items-center gap-3 pt-2">
                    <span className="font-bold text-slate-700">Kunci Jawaban Benar:</span>
                    <select
                      value={editingQuestion.correctAnswer as string}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-emerald-800 bg-white text-xs"
                    >
                      {['A', 'B', 'C', 'D', 'E'].map(o => (
                        <option key={o} value={o}>Pilihan {o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* True/False selection */}
              {editingQuestion.type === 'true_false' && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="font-bold text-slate-700">Kunci Jawaban Benar:</span>
                  <select
                    value={editingQuestion.correctAnswer as string}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-emerald-800 bg-white text-xs"
                  >
                    <option value="Benar">Benar</option>
                    <option value="Salah">Salah</option>
                  </select>
                </div>
              )}

              {/* Short Answer / Essay Rubric */}
              {(editingQuestion.type === 'short_answer' || editingQuestion.type === 'essay') && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kunci Jawaban / Kata Kunci Penilaian:</label>
                  <input
                    type="text"
                    placeholder="Contoh: IFRS / Transparansi / Rasio Lancar"
                    value={editingQuestion.correctAnswer as string}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Penjelasan / Pembahasan Soal (Opsional):</label>
                <input
                  type="text"
                  placeholder="Penjelasan ringkas kunci jawaban..."
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditedQuestion}
                className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 cursor-pointer transition-all"
              >
                Simpan Perubahan Soal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
