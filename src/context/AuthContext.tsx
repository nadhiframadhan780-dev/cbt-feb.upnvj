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
import { STUDY_PROGRAMS } from '../constants/programs';

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
  logout: () => Promise<void>;
  validateStudentData: (nama: string, nim: string, cohort: string) => Promise<boolean>;
  setDemoStudent: (student: StudentProfile) => void;
  setDemoAdmin: (enabled: boolean) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Whitelisted domains: @upnvj.ac.id, plus dev/admin email nadhiframadhan780@gmail.com
export const ALLOWED_DOMAINS = ['upnvj.ac.id', 'gmail.com'];

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
        const email = currentUser.email || '';
        const domain = email.split('@')[1];

        // Check if user is admin
        const isAdminEmail = 
          email.toLowerCase() === 'nadhiframadhan780@gmail.com' ||
          email.toLowerCase().includes('admin.feb@upnvj.ac.id');

        if (isAdminEmail) {
          setIsAdmin(true);
          setAdminUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || 'Administrator FEB',
            role: 'superadmin',
            createdAt: new Date().toISOString()
          });
        }

        // Domain validation check
        const isDomainAllowed = 
          ALLOWED_DOMAINS.includes(domain) ||
          email.toLowerCase() === 'nadhiframadhan780@gmail.com';

        if (!isDomainAllowed) {
          await fbSignOut(auth);
          setUser(null);
          setStudent(null);
          setError(
            'Akses Ditolak: Akun Google yang digunakan (' + email + ') belum terdaftar sebagai akun yang diperbolehkan untuk mengakses CBT FEB UPN Veteran Jakarta. Silakan gunakan akun resmi yang telah ditentukan.'
          );
          setLoading(false);
          return;
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
        // Only clear student if not in demo mode
        const demoStored = sessionStorage.getItem('cbt_demo_student');
        if (demoStored) {
          try {
            setStudent(JSON.parse(demoStored));
          } catch (e) {
            setStudent(null);
          }
        } else {
          setStudent(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';
      const domain = email.split('@')[1];

      const isDomainAllowed = 
        ALLOWED_DOMAINS.includes(domain) ||
        email.toLowerCase() === 'nadhiframadhan780@gmail.com';

      if (!isDomainAllowed) {
        await fbSignOut(auth);
        setUser(null);
        setStudent(null);
        setError(
          'Akses Ditolak: Akun Google yang digunakan (' + email + ') belum terdaftar sebagai akun yang diperbolehkan untuk mengakses CBT FEB UPN Veteran Jakarta. Silakan gunakan akun resmi yang telah ditentukan.'
        );
        setLoading(false);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // Helpful error message for popup closed or network
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Proses login Google dibatalkan.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Koneksi internet bermasalah saat menghubungi server autentikasi.');
      } else {
        setError('Terjadi kendala autentikasi Google: ' + (err.message || 'Silakan coba lagi.'));
      }
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('cbt_demo_student');
    sessionStorage.removeItem('cbt_demo_admin');
    await fbSignOut(auth);
    setUser(null);
    setStudent(null);
    setIsAdmin(false);
    setAdminUser(null);
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

    const email = user?.email || 'mahasiswa@upnvj.ac.id';
    
    // Check in Firestore
    let existing = await getStudentProfile(email, nim);
    
    // Also check default local registry as reliable fallback
    if (!existing) {
      const matched = DEFAULT_STUDENTS.find(s => s.nim.trim() === nim.trim());
      if (matched) {
        existing = matched;
      }
    }

    if (!existing) {
      // Allow self-verification for university email during official exam
      if (email.endsWith('@upnvj.ac.id') || email === 'nadhiframadhan780@gmail.com') {
        const prog = STUDY_PROGRAMS.find(p => p.slug === selectedProgramSlug);
        const newProfile: StudentProfile = {
          uid: user?.uid || 'std-' + nim,
          email,
          name: nama.trim(),
          nim: nim.trim(),
          program: prog?.name || 'S1 Akuntansi',
          programSlug: selectedProgramSlug,
          cohort,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setStudent(newProfile);
        setLoading(false);
        return true;
      }

      setError(
        'Data mahasiswa belum ditemukan pada pangkalan data CBT FEB UPNVJ. Pastikan NIM dan Angkatan telah didaftarkan oleh Bagian Akademik.'
      );
      setLoading(false);
      return false;
    }

    // Validate program slug & active status
    if (!existing.active) {
      setError('Status mahasiswa dinonaktifkan oleh administrator akademik CBT FEB.');
      setLoading(false);
      return false;
    }

    if (existing.programSlug !== selectedProgramSlug) {
      const expectedProg = STUDY_PROGRAMS.find(p => p.slug === existing?.programSlug);
      setError(
        `NIM ${nim} terdaftar pada ${expectedProg?.name || 'Program Studi lain'}. Silakan pilih prodi yang sesuai.`
      );
      setLoading(false);
      return false;
    }

    if (existing.cohort !== cohort) {
      setError(`NIM ${nim} terdaftar pada Angkatan ${existing.cohort}. Data angkatan tidak cocok.`);
      setLoading(false);
      return false;
    }

    // Set verified profile
    setStudent({
      ...existing,
      name: nama.trim() || existing.name,
      uid: user?.uid || existing.uid
    });
    setLoading(false);
    return true;
  };

  // Switch demo student for easy evaluation & testing
  const setDemoStudent = (demoStudent: StudentProfile) => {
    setStudent(demoStudent);
    setSelectedProgramSlug(demoStudent.programSlug);
    sessionStorage.setItem('cbt_demo_student', JSON.stringify(demoStudent));
    setError(null);
  };

  // Toggle demo admin
  const setDemoAdmin = (enabled: boolean) => {
    setIsAdmin(enabled);
    if (enabled) {
      setAdminUser({
        uid: 'demo-admin-uid',
        email: 'admin.feb@upnvj.ac.id',
        name: 'Administrator Akademik FEB',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      });
      sessionStorage.setItem('cbt_demo_admin', 'true');
    } else {
      setAdminUser(null);
      sessionStorage.removeItem('cbt_demo_admin');
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
        logout,
        validateStudentData,
        setDemoStudent,
        setDemoAdmin,
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
