import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Question, StudentProfile } from '../types';

/**
 * Download sample CSV / Excel template for Questions
 */
export function downloadQuestionTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  const sampleQuestions = [
    {
      Order: 1,
      Type: 'multiple_choice',
      Question: 'Menurut Kerangka Konseptual Pelaporan Keuangan (KKPK), manakah yang merupakan karakteristik kualitatif fundamental?',
      OptionA: 'Relevansi dan Representasi Tepat',
      OptionB: 'Keterbandingan dan Ketepatwaktuan',
      OptionC: 'Keterpahaman dan Keandalan',
      OptionD: 'Materialitas dan Konsistensi',
      OptionE: 'Prudensi dan Netralitas',
      CorrectAnswer: 'A',
      Points: 10,
      ImageUrl: ''
    },
    {
      Order: 2,
      Type: 'true_false',
      Question: 'Biaya historis selalu menyajikan nilai wajar aset terkini pada neraca akhir tahun.',
      OptionA: 'Benar',
      OptionB: 'Salah',
      OptionC: '',
      OptionD: '',
      OptionE: '',
      CorrectAnswer: 'Salah',
      Points: 10,
      ImageUrl: ''
    },
    {
      Order: 3,
      Type: 'short_answer',
      Question: 'Sebutkan standar pelaporan keuangan internasional yang diadopsi oleh Ikatan Akuntan Indonesia (singkatan)!',
      OptionA: '',
      OptionB: '',
      OptionC: '',
      OptionD: '',
      OptionE: '',
      CorrectAnswer: 'IFRS',
      Points: 10,
      ImageUrl: ''
    },
    {
      Order: 4,
      Type: 'essay',
      Question: 'Jelaskan perbedaan mendasar antara Fraud Audit dan Financial Statement Audit beserta contoh kasusnya!',
      OptionA: '',
      OptionB: '',
      OptionC: '',
      OptionD: '',
      OptionE: '',
      CorrectAnswer: 'Rubrik penilaian: metodologi, teknik investigasi, bukti hukum',
      Points: 20,
      ImageUrl: ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleQuestions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Soal_Ujian');

  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveBlobAs(blob, 'Template_Soal_CBT_FEB_UPNVJ.csv');
  } else {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveBlobAs(blob, 'Template_Soal_CBT_FEB_UPNVJ.xlsx');
  }
}

/**
 * Download sample CSV / Excel template for Students
 */
export function downloadStudentTemplate(programSlug: string, programName: string, format: 'xlsx' | 'csv' = 'xlsx') {
  const sampleStudents = [
    {
      NIM: '2310111001',
      Nama_Lengkap: 'Ahmad Fauzan',
      Email: 'ahmad.fauzan@upnvj.ac.id',
      Angkatan: '2026',
      Prodi_Slug: programSlug,
      Semester: 1,
      Daftar_Mata_Kuliah: 'Pengantar Akuntansi I, Matematika Bisnis, Pendidikan Bela Negara'
    },
    {
      NIM: '2310111002',
      Nama_Lengkap: 'Siti Rahmawati',
      Email: 'siti.rahmawati@upnvj.ac.id',
      Angkatan: '2025',
      Prodi_Slug: programSlug,
      Semester: 3,
      Daftar_Mata_Kuliah: 'Akuntansi Keuangan Menengah I, Perpajakan I, Sistem Informasi Akuntansi'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleStudents);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Mahasiswa');

  const fileName = `Template_Mahasiswa_${programSlug.replace('cbt-', '')}`;

  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveBlobAs(blob, `${fileName}.csv`);
  } else {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveBlobAs(blob, `${fileName}.xlsx`);
  }
}

function saveBlobAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded Questions file (CSV, XLS/XLSX, ZIP)
 */
export async function parseQuestionsFile(file: File, examId: string): Promise<Question[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'zip') {
    const zip = await JSZip.loadAsync(file);
    // Find first spreadsheet or csv in zip
    let targetFile: JSZip.JSZipObject | null = null;
    let imageMap: Record<string, string> = {};

    for (const filename of Object.keys(zip.files)) {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
        targetFile = zip.files[filename];
      }
      // If zip contains image assets
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
        const imgBlob = await zip.files[filename].async('blob');
        imageMap[filename] = URL.createObjectURL(imgBlob);
      }
    }

    if (!targetFile) {
      throw new Error('Arsip ZIP tidak memuat berkas spreadsheet (.xlsx, .xls, .csv) berisikan soal!');
    }

    const buffer = await targetFile.async('arraybuffer');
    return parseQuestionsFromBuffer(buffer, examId, imageMap);
  } else if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
    const buffer = await file.arrayBuffer();
    return parseQuestionsFromBuffer(buffer, examId);
  } else {
    throw new Error('Format berkas tidak didukung. Harap unggah berkas CSV, XLS, XLSX, atau ZIP!');
  }
}

function parseQuestionsFromBuffer(
  buffer: ArrayBuffer, 
  examId: string, 
  imageMap?: Record<string, string>
): Question[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  if (!rows || rows.length === 0) {
    throw new Error('Lembar data soal kosong.');
  }

  const parsedQuestions: Question[] = [];

  rows.forEach((row, idx) => {
    // Normalise property names case-insensitively
    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
            return row[rowKey];
          }
        }
      }
      return undefined;
    };

    const questionText = getVal('question', 'soal', 'pertanyaan');
    if (!questionText) return;

    const order = Number(getVal('order', 'nomor', 'no')) || idx + 1;
    const rawType = (getVal('type', 'tipe', 'jenis') || 'multiple_choice').toString().toLowerCase().trim();
    
    let type: Question['type'] = 'multiple_choice';
    if (rawType.includes('true') || rawType.includes('benar') || rawType === 'tf') {
      type = 'true_false';
    } else if (rawType.includes('essay') || rawType.includes('esai') || rawType.includes('uraian')) {
      type = 'essay';
    } else if (rawType.includes('short') || rawType.includes('singkat')) {
      type = 'short_answer';
    } else if (rawType.includes('select') || rawType.includes('jamak')) {
      type = 'multiple_select';
    } else if (rawType.includes('image') || rawType.includes('gambar')) {
      type = 'multiple_choice_image';
    }

    const optA = getVal('optiona', 'pilihana', 'opsia', 'a');
    const optB = getVal('optionb', 'pilihanb', 'opsib', 'b');
    const optC = getVal('optionc', 'pilihanc', 'opsic', 'c');
    const optD = getVal('optiond', 'pilihand', 'opsid', 'd');
    const optE = getVal('optione', 'pilihane', 'opsie', 'e');

    const options = [];
    if (optA !== undefined) options.push({ id: 'A', text: String(optA) });
    if (optB !== undefined) options.push({ id: 'B', text: String(optB) });
    if (optC !== undefined) options.push({ id: 'C', text: String(optC) });
    if (optD !== undefined) options.push({ id: 'D', text: String(optD) });
    if (optE !== undefined) options.push({ id: 'E', text: String(optE) });

    const rawImg = getVal('imageurl', 'gambar', 'image', 'foto');
    let imageUrl = rawImg ? String(rawImg).trim() : undefined;
    if (imageUrl && imageMap && imageMap[imageUrl]) {
      imageUrl = imageMap[imageUrl];
    }

    const correctAnswer = getVal('correctanswer', 'kunci', 'kuncijawaban', 'jawaban') || 'A';
    const points = Number(getVal('points', 'bobot', 'nilai', 'poin')) || 10;

    parsedQuestions.push({
      id: `q_${examId}_${order}_${Date.now().toString(36)}`,
      examId,
      order,
      type,
      question: String(questionText),
      imageUrl,
      options: options.length > 0 ? options : undefined,
      correctAnswer: String(correctAnswer),
      points
    });
  });

  return parsedQuestions.sort((a, b) => a.order - b.order);
}

/**
 * Parse uploaded Students file (CSV, XLS/XLSX, ZIP)
 */
export async function parseStudentsFile(
  file: File, 
  targetProgramSlug: string,
  targetProgramName: string
): Promise<StudentProfile[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  let buffer: ArrayBuffer;

  if (extension === 'zip') {
    const zip = await JSZip.loadAsync(file);
    let targetSpreadsheet: JSZip.JSZipObject | null = null;
    for (const filename of Object.keys(zip.files)) {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
        targetSpreadsheet = zip.files[filename];
        break;
      }
    }
    if (!targetSpreadsheet) {
      throw new Error('Arsip ZIP tidak memuat lembar spreadsheet data mahasiswa (.xlsx, .xls, .csv)');
    }
    buffer = await targetSpreadsheet.async('arraybuffer');
  } else if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
    buffer = await file.arrayBuffer();
  } else {
    throw new Error('Format berkas tidak didukung. Harap unggah CSV, XLS, XLSX, atau ZIP!');
  }

  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  if (!rows || rows.length === 0) {
    throw new Error('Lembar data mahasiswa kosong.');
  }

  const parsedStudents: StudentProfile[] = [];

  rows.forEach((row, idx) => {
    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
            return row[rowKey];
          }
        }
      }
      return undefined;
    };

    const nim = getVal('nim', 'nomorinduk', 'nomor_induk');
    const name = getVal('nama_lengkap', 'nama', 'namamahasiswa', 'fullname');
    if (!nim || !name) return;

    const email = getVal('email', 'surel') || `${String(nim).trim()}@mahasiswa.upnvj.ac.id`;
    const cohort = String(getVal('angkatan', 'cohort', 'tahun') || '2026').trim();
    const semester = Number(getVal('semester', 'sem', 'tingkat')) || 1;
    
    // Parse courses string into list
    const rawCourses = getVal('daftar_mata_kuliah', 'matakuliah', 'courses', 'mk');
    let coursesList: string[] = [];
    if (rawCourses) {
      coursesList = String(rawCourses)
        .split(/[,;\n]+/)
        .map(c => c.trim())
        .filter(Boolean);
    }

    parsedStudents.push({
      id: String(nim).trim(),
      uid: `uid_std_${String(nim).trim()}`,
      email: String(email).trim().toLowerCase(),
      name: String(name).trim(),
      nim: String(nim).trim(),
      program: targetProgramName,
      programSlug: targetProgramSlug,
      cohort,
      semester: Math.min(8, Math.max(1, semester)),
      courses: coursesList,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return parsedStudents;
}
