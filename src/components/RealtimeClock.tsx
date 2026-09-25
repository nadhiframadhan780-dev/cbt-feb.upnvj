import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface RealtimeClockProps {
  variant?: 'compact' | 'full' | 'badge';
  className?: string;
  showIcon?: boolean;
}

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const MONTHS_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

export const RealtimeClock: React.FC<RealtimeClockProps> = ({
  variant = 'compact',
  className = '',
  showIcon = true
}) => {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = DAYS_ID[time.getDay()];
  const dateNum = time.getDate();
  const monthName = MONTHS_ID[time.getMonth()];
  const monthShort = MONTHS_SHORT_ID[time.getMonth()];
  const year = time.getFullYear();

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds} WIB`;

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs shadow-xs border border-slate-800 ${className}`}>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-sans font-medium text-[11px] text-slate-300">
          {dayName}, {dateNum} {monthShort} {year}
        </span>
        <span className="text-slate-500">•</span>
        <span className="font-bold text-emerald-400 tracking-wider">
          {timeString}
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs ${className}`}>
        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
              Waktu Server Terintegrasi
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900">
            <span className="font-sans text-slate-700">{dayName}, {dateNum} {monthName} {year}</span>
            <span className="text-slate-300">|</span>
            <span className="text-teal-800 font-bold">{timeString}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: 'compact' for navbar / header
  return (
    <div className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-700 text-xs select-none ${className}`}>
      <span className="flex h-1.5 w-1.5 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
      </span>
      {showIcon && <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
      <span className="text-[11px] font-medium text-slate-600 hidden lg:inline">
        {dayName}, {dateNum} {monthShort} {year}
      </span>
      <span className="text-slate-300 hidden lg:inline">•</span>
      <span className="font-mono font-bold text-[11px] text-teal-900">
        {timeString}
      </span>
    </div>
  );
};
