import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { StudentProfile, StudentAccountStatus, AdminUser } from '../types';
import { getStudentProfile, saveStudentProfile, DEFAULT_STUDENTS } from '../services/firestoreService';
import { STUDY_PROGRAMS, PRODI_COURSES_MAP, COHORTS } from '../constants/programs';

export interface StudentValidationResult {
  success: boolean;
  errorField?: 'nama' | 'nim' | 'angkatan' | 'prodi' | 'general';
  accountStatus?: StudentAccountStatus;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  student: StudentProfile | null;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  selectedProgramSlug: string | null;
  setSelectedProgramSlug: (slug: string | null) => void;
  loginWithGoogle: () => Promise<boolean>;
  loginAdminWithGoogle: () => Promise<{ success: boolean; message: string }>;
  loginAdminWithPasscode: (email: string, passcode: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  validateStudentData: (nama: string, nim: string, cohort: string) => Promise<StudentValidationResult>;
  setDemoStudent: (student: StudentProfile) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Whitelisted student domains: @upnvj.ac.id, @mahasiswa.upnvj.ac.id, plus Google accounts
export const ALLOWED_DOMAINS = ['upnvj.ac.id', 'mahasiswa.upnvj.ac.id', 'gmail.com'];
export const AUTHORIZED_ADMIN_EMAIL = 'nadhiframadhan780@gmail.com';

export const isDomainAllowed = (email: string): boolean => {
  const clean = email.toLowerCase().trim();
  const domain = clean.split('@')[1] || '';
  return (
    domain === 'upnvj.ac.id' ||
    domain.endsWith('.upnvj.ac.id') ||
    domain === 'gmail.com' ||
    ALLOWED_DOMAINS.includes(domain) ||
    clean === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgramSlug, setSelectedProgramSlug] = useState<string | null>(() => {
    return localStorage.getItem('cbt_selected_program') || null;
  });

  // Save selected program to localStorage
  useEffect(() => {
    if (selectedProgramSlug) {
      localStorage.setItem('cbt_selected_program', selectedProgramSlug);
    } else {
      localStorage.removeItem('cbt_selected_program');
    }
  }, [selectedProgramSlug]);

  // Check saved admin session on initial mount
  useEffect(() => {
    try {
      const savedAdminSession = sessionStorage.getItem('cbt_admin_session');
      if (savedAdminSession) {
        const parsed = JSON.parse(savedAdminSession);
        if (parsed?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setAdminUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin session:', e);
    }
  }, []);

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(null);

      if (currentUser) {
        const email = (currentUser.email || '').toLowerCase().trim();

        // STRICT ADMIN AUTHENTICATION: Only nadhiframadhan780@gmail.com
        if (email === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setAdminUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || 'Nadhif Ramadhan (Admin CBT FEB)',
            role: 'superadmin',
            createdAt: new Date().toISOString()
          });
        } else {
          setIsAdmin(false);
          setAdminUser(null);
        }

        setUser(currentUser);

        // Try looking up student profile in Firestore
        const profile = await getStudentProfile(email);
        if (profile) {
          if (profile.status === 'temporary_inactive') {
            setError('AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN');
            setStudent({ ...profile, active: false, status: 'temporary_inactive' });
            if (profile.programSlug) {
              setSelectedProgramSlug(profile.programSlug);
            }
          } else if (profile.status === 'permanent_inactive') {
            setError('AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA, JIKA INI KELIRU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT');
            setStudent({ ...profile, active: false, status: 'permanent_inactive' });
            if (profile.programSlug) {
              setSelectedProgramSlug(profile.programSlug);
            }
          } else {
            setStudent(profile);
            if (profile.programSlug) {
              setSelectedProgramSlug(profile.programSlug);
            }
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setAdminUser(null);
        setStudent(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard student Google Sign-In
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const email = (result.user.email || '').toLowerCase().trim();

      if (!isDomainAllowed(email)) {
        await fbSignOut(auth);
        setUser(null);
        setStudent(null);
        setError(
          `Akses Ditolak: Akun Google (${email}) bukan domain resmi yang diperbolehkan. Harap gunakan email @upnvj.ac.id atau akun Google yang terdaftar.`
        );
        setLoading(false);
        return false;
      }

      setUser(result.user);

      // Check if profile exists in Firestore
      const profile = await getStudentProfile(email);
      if (profile) {
        setStudent(profile);
        if (profile.programSlug) {
          setSelectedProgramSlug(profile.programSlug);
        }
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Proses login Google dibatalkan.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(
          `Domain (${window.location.hostname}) belum didaftarkan di Authorized Domains Firebase proyek cbt-feb-upnvj. Silakan tambahkan '${window.location.hostname}' di Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else if (err.code === 'auth/network-request-failed') {
        setError('Koneksi internet bermasalah saat menghubungi server autentikasi.');
      } else {
        setError('Kendala autentikasi Google: ' + (err.message || 'Silakan coba lagi.'));
      }
      setLoading(false);
      return false;
    }
  };

  // EXCLUSIVE ADMIN GOOGLE SIGN-IN (Only nadhiframadhan780@gmail.com)
  const loginAdminWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const email = (result.user.email || '').toLowerCase().trim();

      if (email !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        // Immediate Rejection & Force Sign-Out
        await fbSignOut(auth);
        setUser(null);
        setIsAdmin(false);
        setAdminUser(null);
        setLoading(false);
        return {
          success: false,
          message: `AKSES DITOLAK! Akun Google Anda (${email}) tidak memiliki hak akses Administrator. Hanya akun resmi ${AUTHORIZED_ADMIN_EMAIL} yang berhak mengakses Admin Panel CBT FEB UPNVJ.`
        };
      }

      // Success
      setIsAdmin(true);
      setAdminUser({
        uid: result.user.uid,
        email: result.user.email || AUTHORIZED_ADMIN_EMAIL,
        name: result.user.displayName || 'Nadhif Ramadhan (Administrator)',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      });
      setUser(result.user);
      setLoading(false);
      return {
        success: true,
        message: 'Otorisasi Berhasil! Selamat datang Administrator Utama FEB UPNVJ.'
      };
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Proses login Google dibatalkan oleh pengguna.' };
      }
      if (err.code === 'auth/unauthorized-domain') {
        return { 
          success: false, 
          message: `Domain (${window.location.hostname}) belum diizinkan di Authorized Domains Firebase proyek cbt-feb-upnvj! Tambahkan '${window.location.hostname}' di Firebase Console -> Authentication -> Settings -> Authorized domains. Atau gunakan 'Kode Master' di tab sebelah untuk langsung masuk.` 
        };
      }
      return { success: false, message: 'Gagal autentikasi Google: ' + (err.message || 'Coba lagi.') };
    }
  };

  // BACKUP / DIRECT ADMIN PASSCODE AUTHENTICATION (Bypasses third-party OAuth domain issues on Vercel)
  const loginAdminWithPasscode = async (emailInput: string, passcodeInput: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passcodeInput.trim().toLowerCase();

    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: `AKSES DITOLAK! Hanya email resmi administrator (${AUTHORIZED_ADMIN_EMAIL}) yang dapat mengakses panel ini.`
      };
    }

    const validPasscodes = ['febupnvj2026', 'nadhif2026', 'cbtfeb2026', 'adminfeb2026'];
    if (!validPasscodes.includes(cleanPass)) {
      return {
        success: false,
        message: 'Kode Keamanan Master salah! Silakan periksa kembali kata sandi master Anda.'
      };
    }

    const session: AdminUser = {
      uid: 'master-admin-nadhif',
      email: AUTHORIZED_ADMIN_EMAIL,
      name: 'Nadhif Ramadhan (Administrator Utama)',
      role: 'superadmin',
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem('cbt_admin_session', JSON.stringify(session));
    setIsAdmin(true);
    setAdminUser(session);

    return {
      success: true,
      message: 'Otorisasi Berhasil! Selamat datang Administrator Utama FEB UPNVJ.'
    };
  };

  // Completely clean logout - Prevents lingering / stuck session (Requirement 10)
  const logout = async () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('cbt_demo_student');
      localStorage.removeItem('cbt_selected_program');
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Error during sign out:', e);
    } finally {
      setUser(null);
      setStudent(null);
      setIsAdmin(false);
      setAdminUser(null);
      setSelectedProgramSlug(null);
    }
  };

  // Validate student inputs against Firestore database with specific error field reporting
  const validateStudentData = async (
    nama: string,
    nim: string,
    cohort: string
  ): Promise<StudentValidationResult> => {
    if (!selectedProgramSlug) {
      const msg = 'Silakan pilih Program Studi ujian terlebih dahulu.';
      setError(msg);
      return { success: false, errorField: 'prodi', message: msg };
    }

    const cleanNama = nama.trim();
    const cleanNim = nim.trim();
    const cleanCohort = cohort.trim();

    // 1. Validasi Bagian Nama Lengkap
    if (!cleanNama) {
      const msg = 'Bagian Nama Lengkap masih kosong! Harap masukkan nama lengkap Anda.';
      setError(msg);
      return { success: false, errorField: 'nama', message: msg };
    }
    if (cleanNama.length < 3) {
      const msg = 'Bagian Nama Lengkap terlalu pendek! Nama harus memiliki minimal 3 karakter.';
      setError(msg);
      return { success: false, errorField: 'nama', message: msg };
    }
    if (!/^[a-zA-Z\s.,'-]+$/.test(cleanNama)) {
      const msg = 'Bagian Nama Lengkap tidak valid! Hanya boleh berisi huruf dan tanda baca resmi.';
      setError(msg);
      return { success: false, errorField: 'nama', message: msg };
    }

    // 2. Validasi Bagian NIM
    if (!cleanNim) {
      const msg = 'Bagian NIM masih kosong! Harap masukkan Nomor Induk Mahasiswa Anda.';
      setError(msg);
      return { success: false, errorField: 'nim', message: msg };
    }
    if (!/^[0-9]+$/.test(cleanNim)) {
      const msg = 'Bagian NIM tidak valid! NIM harus berupa angka tanpa spasi atau huruf.';
      setError(msg);
      return { success: false, errorField: 'nim', message: msg };
    }
    if (cleanNim.length !== 10) {
      const msg = `Bagian NIM salah! Format NIM UPNVJ terdiri dari 10 digit angka (Anda memasukkan ${cleanNim.length} digit). Contoh yang benar: 2310111001.`;
      setError(msg);
      return { success: false, errorField: 'nim', message: msg };
    }

    setLoading(true);
    setError(null);

    const email = user?.email || `${cleanNim}@mahasiswa.upnvj.ac.id`;
    
    // Check in Firestore
    let existing = await getStudentProfile(email, cleanNim);
    
    // Also check default local registry as reliable fallback
    if (!existing) {
      const matched = DEFAULT_STUDENTS.find(s => s.nim.trim() === cleanNim);
      if (matched) {
        existing = matched;
      }
    }

    // 3. Validasi Bagian Angkatan
    if (!cleanCohort) {
      const msg = 'Bagian Angkatan belum dipilih! Harap tentukan tahun angkatan Anda.';
      setError(msg);
      setLoading(false);
      return { success: false, errorField: 'angkatan', message: msg };
    }
    const nimYearPrefix = cleanNim.substring(0, 2);
    const expectedCohort = `20${nimYearPrefix}`;
    if (COHORTS.includes(expectedCohort) && expectedCohort !== cleanCohort) {
      if (!existing || existing.cohort !== cleanCohort) {
        const msg = `Bagian Angkatan tidak sesuai! 2 digit awal NIM Anda '${nimYearPrefix}' mengindikasikan Angkatan ${expectedCohort}, namun Anda memilih Angkatan ${cleanCohort}. Harap periksa kembali.`;
        setError(msg);
        setLoading(false);
        return { success: false, errorField: 'angkatan', message: msg };
      }
    }

    const matchedProdi = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);
    const targetProgramName = matchedProdi ? matchedProdi.name : 'S1 Akuntansi';

    // 4. Validasi Kesesuaian Program Studi & Status Akun
    if (existing) {
      if (existing.status === 'temporary_inactive') {
        const msg = 'AKUN ANDA NONAKTIF SEMENTARA WAKTU DIKARENAKAN TIDAK HADIR DALAM HARI UJIAN';
        setError(msg);
        setLoading(false);
        return {
          success: false,
          errorField: 'general',
          accountStatus: 'temporary_inactive',
          message: msg
        };
      }

      if (existing.status === 'permanent_inactive') {
        const msg = 'AKUN ANDA NONAKTIF PERMANEN DIKARENAKAN ANDA TIDAK HADIR DALAM WAKTU 1 BULAN DAN SUDAH KELUAR DARI UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA, JIKA INI KELIRU ATAU MERASA KESALAHAN DATA SILAHKAN HUBUNGI LEBIH LANJUT';
        setError(msg);
        setLoading(false);
        return {
          success: false,
          errorField: 'general',
          accountStatus: 'permanent_inactive',
          message: msg
        };
      }

      if (existing.programSlug && existing.programSlug !== selectedProgramSlug) {
        const msg = `Bagian Program Studi salah! NIM ${cleanNim} terdaftar di prodi "${existing.program}", sedangkan Anda memilih portal "${targetProgramName}". Harap pilih portal program studi yang tepat.`;
        setError(msg);
        setLoading(false);
        return { success: false, errorField: 'prodi', message: msg };
      }

      const activeProfile: StudentProfile = {
        ...existing,
        name: cleanNama,
        nim: cleanNim,
        cohort: cleanCohort,
        program: targetProgramName,
        programSlug: selectedProgramSlug,
        semester: existing.semester || 1,
        courses: existing.courses || PRODI_COURSES_MAP[selectedProgramSlug]?.[1] || [],
        status: existing.status || 'active',
        active: existing.status ? existing.status === 'active' : true
      };

      setStudent(activeProfile);
      saveStudentProfile(activeProfile).catch(e => console.warn('Could not sync student to firestore:', e));
      setLoading(false);
      return { success: true };
    }

    // If new student registering on the fly
    const newProfile: StudentProfile = {
      uid: user?.uid || `gen_std_${cleanNim}`,
      email,
      name: cleanNama,
      nim: cleanNim,
      program: targetProgramName,
      programSlug: selectedProgramSlug,
      cohort: cleanCohort,
      semester: 1,
      courses: PRODI_COURSES_MAP[selectedProgramSlug]?.[1] || [],
      active: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStudent(newProfile);
    saveStudentProfile(newProfile).catch(e => console.warn('Could not sync student to firestore:', e));
    setLoading(false);
    return { success: true };
  };

  const setDemoStudent = (demoStudent: StudentProfile) => {
    setStudent(demoStudent);
    if (demoStudent.programSlug) {
      setSelectedProgramSlug(demoStudent.programSlug);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        isAdmin,
        adminUser,
        loading,
        error,
        selectedProgramSlug,
        setSelectedProgramSlug,
        loginWithGoogle,
        loginAdminWithGoogle,
        loginAdminWithPasscode,
        logout,
        validateStudentData,
        setDemoStudent,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
