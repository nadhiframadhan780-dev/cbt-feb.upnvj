import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  StudentProfile, 
  Course, 
  Exam, 
  Question, 
  DeanProfile,
  ExamAttempt 
} from '../types';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_COURSES, 
  getDefaultExams, 
  DEFAULT_DEAN_PROFILE,
  seedInitialFirestoreData,
  getDeanProfile,
  updateDeanProfile
} from '../services/firestoreService';
import { STUDY_PROGRAMS, COHORTS, UPNVJ_LOGO } from '../constants/programs';
import { formatIndonesianDate, formatIndonesianTime } from '../utils/formatters';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  HelpCircle, 
  Award, 
  Settings, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Search, 
  Database, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles,
  Save,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { adminUser, isAdmin, setDemoAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exams' | 'questions' | 'results' | 'dean' | 'settings'>('overview');

  // Local state for admin management
  const [students, setStudents] = useState<StudentProfile[]>(DEFAULT_STUDENTS);
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [exams, setExams] = useState<Exam[]>(getDefaultExams());
  const [dean, setDean] = useState<DeanProfile>(DEFAULT_DEAN_PROFILE);
  const [results, setResults] = useState<ExamAttempt[]>([]);
  
  // Feedback toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingSeed, setLoadingSeed] = useState(false);

  // Student search & filters
  const [studentSearch, setStudentSearch] = useState('');
  const [filterProdi, setFilterProdi] = useState('all');
  const [filterCohort, setFilterCohort] = useState('all');

  // New Student modal form
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<StudentProfile>>({
    name: '',
    nim: '',
    email: '',
    programSlug: 'cbt-s1-akuntansi',
    cohort: '2026',
    active: true
  });

  // Load Dean profile on mount
  useEffect(() => {
    async function load() {
      const p = await getDeanProfile();
      setDean(p);

      // Generate realistic demo exam submissions for results table
      const sampleResults: ExamAttempt[] = [
        {
          id: 'att-101',
          examId: 'exam-s1-akuntansi-uts',
          studentId: '2310111001',
          uid: 'uid-nadhif',
          nim: '2310111001',
          studentName: 'Nadhif Ramadhan',
          programSlug: 'cbt-s1-akuntansi',
          cohort: '2026',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          submittedAt: new Date(Date.now() - 900000).toISOString(),
          status: 'submitted',
          score: 85,
          totalPoints: 100,
          percentage: 85
        },
        {
          id: 'att-102',
          examId: 'exam-s1-manajemen-uts',
          studentId: '2410112045',
          uid: 'uid-siti',
          nim: '2410112045',
          studentName: 'Siti Rahmawati',
          programSlug: 'cbt-s1-manajemen',
          cohort: '2025',
          startedAt: new Date(Date.now() - 4000000).toISOString(),
          submittedAt: new Date(Date.now() - 1200000).toISOString(),
          status: 'submitted',
          score: 90,
          totalPoints: 100,
          percentage: 90
        },
        {
          id: 'att-103',
          examId: 'exam-d3-perbankan-keuangan-uts',
          studentId: '2510115012',
          uid: 'uid-ahmad',
          nim: '2510115012',
          studentName: 'Ahmad Faiz Fadhlurrahman',
          programSlug: 'cbt-d3-perbankan-keuangan',
          cohort: '2026',
          startedAt: new Date(Date.now() - 2000000).toISOString(),
          submittedAt: undefined,
          status: 'in_progress',
          score: undefined,
          totalPoints: 100
        }
      ];
      setResults(sampleResults);
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Seed / Sync database
  const handleSeedDatabase = async () => {
    setLoadingSeed(true);
    const res = await seedInitialFirestoreData();
    setLoadingSeed(false);
    showToast(res.message);
  };

  // Save Dean Profile to Firestore
  const handleSaveDean = async () => {
    const ok = await updateDeanProfile(dean);
    if (ok) {
      showToast('Profil dan sambutan Dekan FEB berhasil diperbarui di Firestore!');
    } else {
      showToast('Gagal memperbarui profil Dekan di server.');
    }
  };

  // Add student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.nim || !newStudent.email || !newStudent.programSlug) {
      showToast('Semua data mahasiswa wajib diisi!');
      return;
    }

    const prog = STUDY_PROGRAMS.find(p => p.slug === newStudent.programSlug);
    const fullProfile: StudentProfile = {
      uid: 'std-' + newStudent.nim,
      email: newStudent.email.toLowerCase().trim(),
      name: newStudent.name.trim(),
      nim: newStudent.nim.trim(),
      program: prog?.name || 'S1 Akuntansi',
      programSlug: newStudent.programSlug,
      cohort: newStudent.cohort || '2026',
      active: newStudent.active ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStudents(prev => [fullProfile, ...prev]);
    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      nim: '',
      email: '',
      programSlug: 'cbt-s1-akuntansi',
      cohort: '2026',
      active: true
    });
    showToast(`Mahasiswa ${fullProfile.name} (${fullProfile.nim}) berhasil ditambahkan!`);
  };

  // Toggle student active
  const toggleStudentActive = (nim: string) => {
    setStudents(prev => prev.map(s => s.nim === nim ? { ...s, active: !s.active } : s));
    showToast('Status aktif mahasiswa berhasil diperbarui.');
  };

  // Delete student
  const deleteStudent = (nim: string) => {
    if (window.confirm(`Hapus data mahasiswa dengan NIM ${nim}?`)) {
      setStudents(prev => prev.filter(s => s.nim !== nim));
      showToast(`Mahasiswa NIM ${nim} telah dihapus.`);
    }
  };

  // Export results to CSV
  const exportResultsToCSV = () => {
    const headers = ['Nama Mahasiswa', 'NIM', 'Program Studi', 'Angkatan', 'Ujian ID', 'Status', 'Nilai', 'Mulai', 'Selesai'];
    const rows = results.map(r => [
      `"${r.studentName}"`,
      `"${r.nim}"`,
      `"${r.programSlug}"`,
      `"${r.cohort}"`,
      `"${r.examId}"`,
      `"${r.status}"`,
      r.score ?? '-',
      `"${r.startedAt}"`,
      `"${r.submittedAt || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_CBT_FEB_UPNVJ_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan CSV Hasil CBT berhasil diunduh!');
  };

  // Filtered students list
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.nim.includes(studentSearch);
    const matchProdi = filterProdi === 'all' || s.programSlug === filterProdi;
    const matchCohort = filterCohort === 'all' || s.cohort === filterCohort;
    return matchSearch && matchProdi && matchCohort;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Admin Portal CBT FEB UPNVJ
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                Superadmin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengelolaan Mahasiswa, Jadwal Ujian, Butir Soal, dan Laporan Hasil Akademik
            </p>
          </div>
        </div>

        {/* Action: 1-Click Database Sync */}
        <div className="flex items-center gap-3">
          <button
            disabled={loadingSeed}
            onClick={handleSeedDatabase}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-teal-600" />
            <span>{loadingSeed ? 'Menyinkronkan...' : 'Sinkronkan / Inisialisasi Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Ringkasan</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mahasiswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Ujian ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Hasil Ujian ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dean')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'dean'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Sambutan Dekan</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Mahasiswa Terdaftar</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">{students.length}</p>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 block">6 Program Studi Aktif</span>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Program Studi</span>
              <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-2">6</p>
              <span className="text-[11px] text-slate-500 mt-1 block">2 D3 & 4 S1</span>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sesi Ujian Aktif (LIVE)</span>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-2">6</p>
              <span className="text-[11px] text-amber-600 mt-1 block">Tersedia di seluruh prodi</span>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penyerahan Lembar Jawaban</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-2">{results.length}</p>
              <span className="text-[11px] text-emerald-600 mt-1 block">Tersimpan di Cloud Firestore</span>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Pusat Kontrol Akses Berbasis Prodi & Angkatan
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Sistem secara ketat menerapkan ABAC (Attribute-Based Access Control) di mana mahasiswa D3 Akuntansi hanya dapat mengakses soal D3 Akuntansi, dan S1 Akuntansi hanya melihat soal miliknya.
              </p>
              <button
                onClick={() => setActiveTab('students')}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Kelola Mahasiswa
              </button>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Ekspor Laporan Nilai UTS & UAS
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Unduh seluruh data nilai, waktu pengerjaan, dan status submit mahasiswa dalam format berkas CSV siap olah untuk SIMAK UPNVJ.
              </p>
              <button
                onClick={exportResultsToCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Laporan Nilai CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MAHASISWA MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari Nama atau NIM..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">Semua Program Studi</option>
                {STUDY_PROGRAMS.map(p => (
                  <option key={p.slug} value={p.slug}>{p.shortName}</option>
                ))}
              </select>

              <select
                value={filterCohort}
                onChange={(e) => setFilterCohort(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              >
                <option value="all">Semua Angkatan</option>
                {COHORTS.map(c => (
                  <option key={c} value={c}>Angkatan {c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mahasiswa</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">NIM</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Email Kampus</th>
                    <th className="px-6 py-4">Program Studi</th>
                    <th className="px-6 py-4">Angkatan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredStudents.map((st) => (
                    <tr key={st.nim} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold">{st.nim}</td>
                      <td className="px-6 py-4 font-semibold">{st.name}</td>
                      <td className="px-6 py-4 text-slate-500">{st.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold">
                          {st.program}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{st.cohort}</td>
                      <td className="px-6 py-4">
                        {st.active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => toggleStudentActive(st.nim)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-[11px]"
                        >
                          {st.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => deleteStudent(st.nim)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Hapus Mahasiswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JADWAL UJIAN */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Ujian UTS & UAS FEB UPNVJ
            </h3>
            <span className="text-xs text-slate-500">
              Total {exams.length} Ujian Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-bold font-mono">
                    {ex.examType} • {ex.courseCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Durasi: {ex.durationMinutes}m
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-500">
                  Mata Kuliah: {ex.courseName} • Dosen: {ex.lecturer}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
                  <div>
                    <span>Mulai:</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{formatIndonesianTime(ex.startAt)}</p>
                  </div>
                  <div>
                    <span>Selesai:</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{formatIndonesianTime(ex.endAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HASIL UJIAN & CSV EXPORT */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rekapitulasi Hasil Ujian Mahasiswa
              </h3>
              <p className="text-xs text-slate-500">
                Data sinkronisasi jawaban dan nilai evaluasi otomatis
              </p>
            </div>

            <button
              onClick={exportResultsToCSV}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export ke Format CSV</span>
            </button>
          </div>

          <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">NIM</th>
                    <th className="px-6 py-4">Nama Mahasiswa</th>
                    <th className="px-6 py-4">Prodi / Angkatan</th>
                    <th className="px-6 py-4">Ujian</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Nilai</th>
                    <th className="px-6 py-4">Waktu Submit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {results.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono font-bold">{res.nim}</td>
                      <td className="px-6 py-4 font-semibold">{res.studentName}</td>
                      <td className="px-6 py-4">{res.programSlug} ({res.cohort})</td>
                      <td className="px-6 py-4 font-mono text-[11px]">{res.examId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          res.status === 'submitted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {res.score ?? '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {res.submittedAt ? formatIndonesianTime(res.submittedAt) : 'Sedang Mengerjakan'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SAMBUTAN DEKAN EDITOR */}
      {activeTab === 'dean' && (
        <div className="max-w-2xl rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Sambutan Dekan FEB di Firestore
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Perubahan pada form ini langsung terintegrasi dan tampil di beranda depan portal CBT FEB.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Dekan & Gelar
            </label>
            <input
              type="text"
              value={dean.name}
              onChange={(e) => setDean({ ...dean, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gelar / Jabatan Ringkas
            </label>
            <input
              type="text"
              value={dean.title}
              onChange={(e) => setDean({ ...dean, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              URL Foto Resmi Dekan
            </label>
            <input
              type="text"
              value={dean.photoUrl}
              onChange={(e) => setDean({ ...dean, photoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pesan Sambutan & Pernyataan Akademik
            </label>
            <textarea
              rows={5}
              value={dean.greeting}
              onChange={(e) => setDean({ ...dean, greeting: e.target.value })}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleSaveDean}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan ke Firestore</span>
          </button>
        </div>
      )}

      {/* Modal: Tambah Mahasiswa */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Pendaftaran Mahasiswa CBT FEB
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KRS"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">NIM (Nomor Induk Mahasiswa)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2310111005"
                  value={newStudent.nim}
                  onChange={(e) => setNewStudent({ ...newStudent, nim: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Email Mahasiswa</label>
                <input
                  type="email"
                  required
                  placeholder="nama@upnvj.ac.id"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Program Studi</label>
                <select
                  value={newStudent.programSlug}
                  onChange={(e) => setNewStudent({ ...newStudent, programSlug: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  {STUDY_PROGRAMS.map(p => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Angkatan</label>
                <select
                  value={newStudent.cohort}
                  onChange={(e) => setNewStudent({ ...newStudent, cohort: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                >
                  {COHORTS.map(c => (
                    <option key={c} value={c}>Angkatan {c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Simpan Mahasiswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
