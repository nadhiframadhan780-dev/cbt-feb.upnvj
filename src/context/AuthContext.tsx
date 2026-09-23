import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { StudentProfile, AdminUser } from '../types';
import { getStudentProfile, DEFAULT_STUDENTS } from '../services/firestoreService';
import { STUDY_PROGRAMS, PRODI_COURSES_MAP } from '../constants/programs';

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
  logout: () => Promise<void>;
  validateStudentData: (nama: string, nim: string, cohort: string) => Promise<boolean>;
  setDemoStudent: (student: StudentProfile) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Whitelisted student domains: @upnvj.ac.id, plus Google accounts
export const ALLOWED_DOMAINS = ['upnvj.ac.id', 'gmail.com'];
export const AUTHORIZED_ADMIN_EMAIL = 'nadhiframadhan780@gmail.com';

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
          setStudent(profile);
          if (profile.programSlug) {
            setSelectedProgramSlug(profile.programSlug);
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
      const domain = email.split('@')[1];

      const isDomainAllowed = 
        ALLOWED_DOMAINS.includes(domain) ||
        email === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

      if (!isDomainAllowed) {
        await fbSignOut(auth);
        setUser(null);
        setStudent(null);
        setError(
          'Akses Ditolak: Akun Google yang digunakan (' + email + ') bukan domain resmi yang diperbolehkan. Gunakan email @upnvj.ac.id atau akun Google yang terdaftar.'
        );
        setLoading(false);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Proses login Google dibatalkan.');
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
      return { success: false, message: 'Gagal autentikasi Google: ' + (err.message || 'Coba lagi.') };
    }
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

  // Validate student inputs against Firestore database
  const validateStudentData = async (nama: string, nim: string, cohort: string): Promise<boolean> => {
    if (!selectedProgramSlug) {
      setError('Silakan pilih Program Studi terlebih dahulu.');
      return false;
    }

    if (!nama.trim() || !nim.trim() || !cohort.trim()) {
      setError('Seluruh kolom (Nama Lengkap, NIM, dan Angkatan) wajib diisi.');
      return false;
    }

    setLoading(true);
    setError(null);

    const email = user?.email || `${nim.trim()}@mahasiswa.upnvj.ac.id`;
    
    // Check in Firestore
    let existing = await getStudentProfile(email, nim);
    
    // Also check default local registry as reliable fallback
    if (!existing) {
      const matched = DEFAULT_STUDENTS.find(s => s.nim.trim() === nim.trim());
      if (matched) {
        existing = matched;
      }
    }

    const matchedProdi = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);
    const targetProgramName = matchedProdi ? matchedProdi.name : 'S1 Akuntansi';

    if (existing) {
      // Check program alignment
      if (existing.programSlug && existing.programSlug !== selectedProgramSlug) {
        setError(
          `Data ditemukan, namun Anda terdaftar pada program studi "${existing.program}". Harap pilih portal CBT yang sesuai.`
        );
        setLoading(false);
        return false;
      }

      const activeProfile: StudentProfile = {
        ...existing,
        name: nama.trim(),
        nim: nim.trim(),
        cohort: cohort.trim(),
        program: targetProgramName,
        programSlug: selectedProgramSlug,
        semester: existing.semester || 1,
        courses: existing.courses || PRODI_COURSES_MAP[selectedProgramSlug]?.[1] || []
      };

      setStudent(activeProfile);
      setLoading(false);
      return true;
    }

    // If new student registering on the fly
    const newProfile: StudentProfile = {
      uid: user?.uid || `gen_std_${nim.trim()}`,
      email,
      name: nama.trim(),
      nim: nim.trim(),
      program: targetProgramName,
      programSlug: selectedProgramSlug,
      cohort: cohort.trim(),
      semester: 1,
      courses: PRODI_COURSES_MAP[selectedProgramSlug]?.[1] || [],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStudent(newProfile);
    setLoading(false);
    return true;
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
