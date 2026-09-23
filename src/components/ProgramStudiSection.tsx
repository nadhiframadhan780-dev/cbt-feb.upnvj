import React from 'react';
import { STUDY_PROGRAMS } from '../constants/programs';
import { useAuth } from '../context/AuthContext';
import { StudyProgram } from '../types';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface ProgramStudiSectionProps {
  onSelectProgram: (program: StudyProgram) => void;
}

export const ProgramStudiSection: React.FC<ProgramStudiSectionProps> = ({ onSelectProgram }) => {
  const { selectedProgramSlug } = useAuth();

  return (
    <section id="pilih-prodi" className="py-20 relative bg-slate-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Langkah Awal Ujian
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilih Program Studi
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Pilih program studi Anda untuk melanjutkan ke autentikasi akun Google resmi dan mengakses ruang ujian CBT FEB UPNVJ.
          </p>
        </div>

        {/* 6 Programs Grid: 3x2 Desktop, 2x3 Tablet, 1x6 Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {STUDY_PROGRAMS.map((program) => {
            const isSelected = selectedProgramSlug === program.slug;

            return (
              <div
                key={program.id}
                onClick={() => onSelectProgram(program)}
                className={`group relative rounded-3xl p-6 sm:p-8 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-teal-50 to-emerald-50 border-2 border-teal-600 shadow-xl shadow-teal-700/10 -translate-y-1'
                    : 'bg-white border border-slate-200 hover:border-teal-500 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {/* Selected Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-700 text-white text-[11px] font-bold shadow-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Terpilih</span>
                  </div>
                )}

                <div>
                  {/* Circular/Squircle Program Logo */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-xs">
                      <img
                        src={program.logoUrl}
                        alt={`Logo ${program.name}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1">
                      <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 mb-1 border border-slate-200">
                        Jenjang {program.degree}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                        {program.name}
                      </h3>
                    </div>
                  </div>

                  {/* Program Brief Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {program.description}
                  </p>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    {program.pageUrl}
                  </span>

                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-md shadow-teal-700/30'
                        : 'bg-slate-100 text-slate-800 group-hover:bg-teal-700 group-hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Lanjut ke CBT' : 'Pilih Prodi'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
