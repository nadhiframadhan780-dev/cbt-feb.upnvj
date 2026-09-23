import React, { useEffect, useState } from 'react';
import { DeanProfile } from '../types';
import { getDeanProfile, DEFAULT_DEAN_PROFILE } from '../services/firestoreService';
import { Quote, Award, Shield, CheckCircle2 } from 'lucide-react';

export const SambutanDekan: React.FC = () => {
  const [profile, setProfile] = useState<DeanProfile>(DEFAULT_DEAN_PROFILE);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDeanProfile();
        setProfile(data);
      } catch (err) {
        console.error('Error loading dean profile:', err);
      }
    }
    load();
  }, []);

  return (
    <section id="sambutan-dekan" className="py-20 relative overflow-hidden bg-white border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-teal-700" />
            Pimpinan Fakultas
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sambutan Dekan FEB UPN Veteran Jakarta
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Komitmen Fakultas Ekonomi dan Bisnis dalam mewujudkan evaluasi pembelajaran digital berintegritas dan berkarakter Bela Negara.
          </p>
        </div>

        {/* Content Card with Clean Bright Aesthetic */}
        <div className="relative rounded-3xl bg-slate-50/80 border border-slate-200 p-8 sm:p-12 shadow-sm overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Dean Photo & Title Card */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 via-teal-500 to-emerald-600 rounded-3xl blur-sm opacity-50 group-hover:opacity-80 transition duration-500" />
                <div className="relative w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden bg-white shadow-md border-2 border-white">
                  <img
                    src={profile.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600'}
                    alt={profile.name}
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end justify-center p-4">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Integritas & Akuntabilitas
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {profile.name}
                </h3>
                <p className="text-sm font-semibold text-teal-700 mt-0.5">
                  {profile.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {profile.position}
                </p>
              </div>
            </div>

            {/* Greeting & Academic Statement */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-700">
                <Quote className="w-8 h-8" />
              </div>

              <blockquote className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal italic bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                "{profile.greeting}"
              </blockquote>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
                  Standar Mutu IACS & LAMEMBA
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
                  Transparansi & Evaluasi Real-Time
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
                  Karakter Mahasiswa Bela Negara
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
