export type ExamType = 'UTS' | 'UAS';

export type QuestionType = 
  | 'multiple_choice'
  | 'multiple_choice_image'
  | 'true_false'
  | 'multiple_select'
  | 'essay'
  | 'short_answer';

export type ExamAttemptStatus = 'in_progress' | 'submitted' | 'expired' | 'disqualified';

export interface StudyProgram {
  id: string;
  name: string;
  shortName: string;
  degree: 'D3' | 'S1';
  slug: string;
  pageUrl: string;
  logoUrl: string;
  description: string;
  active: boolean;
}

export interface StudentProfile {
  id?: string;
  uid: string;
  email: string;
  name: string;
  nim: string;
  program: string;
  programSlug: string;
  cohort: string;
  semester: number; // Semester 1 - 8
  courses: string[]; // Daftar mata kuliah yang diambil di semester tsb
  photoUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeanProfile {
  name: string;
  title: string;
  position: string;
  photoUrl: string;
  greeting: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  programSlug: string;
  lecturer: string;
  semester?: number; // 1-8
  sks?: number;
  active: boolean;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  lecturer: string;
  programSlug: string;
  targetPrograms: string[]; // ['cbt-s1-akuntansi']
  targetCohorts: string[]; // ['2023', '2024', '2025', '2026']
  examType: ExamType;
  startAt: string; // ISO 8601 string or timestamp
  endAt: string;
  publishDate?: string; // YYYY-MM-DD
  publishTime?: string; // HH:mm
  durationMinutes: number;
  instructions: string;
  showScore: boolean;
  active: boolean;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface Question {
  id: string;
  examId: string;
  order: number;
  type: QuestionType;
  question: string;
  imageUrl?: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[]; // 'A', ['A', 'C'], 'True', or essay rubric keywords
  points: number;
  explanation?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  uid: string;
  nim: string;
  studentName: string;
  programSlug: string;
  cohort: string;
  startedAt: string;
  submittedAt?: string;
  status: ExamAttemptStatus;
  score?: number;
  totalPoints?: number;
  percentage?: number;
  violationCount?: number; // Cheating attempt / tab leave count
  disqualificationReason?: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[]; // 'A' or ['A', 'C'] or text
  isFlagged: boolean; // Ragu-ragu
  savedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'normal' | 'high';
  active: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface CourseGrade {
  courseCode: string;
  courseName: string;
  sks: number;
  utsScore?: number;
  uasScore?: number;
  assignmentScore?: number;
  finalScore: number;
  letterGrade: string;
  gradePoint: number;
}

export interface StyledNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}
