import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Project, ContentRecord } from '../../types';

interface CalendarViewProps {
  project: Project;
  onSelectRecord: (record: ContentRecord) => void;
  onScheduleNew: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  project,
  onSelectRecord,
  onScheduleNew
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January • يناير',
    'February • فبراير',
    'March • مارس',
    'April • أبريل',
    'May • مايو',
    'June • يونيو',
    'July • يوليو',
    'August • أغسطس',
    'September • سبتمبر',
    'October • أكتوبر',
    'November • نوفمبر',
    'December • ديسمبر'
  ];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Map records by date (YYYY-MM-DD)
  const recordsByDate: { [key: string]: ContentRecord[] } = {};
  project.records.forEach((rec) => {
    if (!recordsByDate[rec.date]) {
      recordsByDate[rec.date] = [];
    }
    recordsByDate[rec.date].push(rec);
  });

  return (
    <div id="calendar-engine-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-500" />
            <span>جدول وجدول النشر • Content Calendar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            خطة نشر واضحة: ماذا ستنتج، ومتى، ومع أي سلسلة إبداعية للحفاظ على الاستمرارية اليومية.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 min-w-36 text-center text-slate-200">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Series Progress Trackers */}
      {project.series && project.series.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {project.series.map((s) => {
            const pct = Math.round((s.publishedCount / s.totalCount) * 100);
            return (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{s.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-rose-400">
                      {s.style}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{s.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {s.publishedCount} / {s.totalCount}
                  </span>
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 text-[11px] font-semibold text-slate-400 text-center py-2.5 bg-slate-950/50">
          <div>Sun (الأحد)</div>
          <div>Mon (الإثنين)</div>
          <div>Tue (الثلاثاء)</div>
          <div>Wed (الأربعاء)</div>
          <div>Thu (الخميس)</div>
          <div>Fri (الجمعة)</div>
          <div>Sat (السبت)</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-900/40">
          {/* Empty cells for preceding days */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-24 p-2 border-b border-r border-slate-800/40 bg-slate-950/20"
            />
          ))}

          {/* Actual days */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayRecords = recordsByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={`min-h-28 p-2 border-b border-r border-slate-800/60 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-rose-950/15 ring-1 ring-rose-600/30' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      isToday
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayRecords.length === 0 && (
                    <button
                      onClick={() => onScheduleNew(dateStr)}
                      className="opacity-0 hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 rounded transition-opacity"
                      title="جدولة منشور لهذا اليوم"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Day content records */}
                <div className="space-y-1.5 flex-1">
                  {dayRecords.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => onSelectRecord(record)}
                      className="w-full text-left p-1.5 rounded bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer block group"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                            record.status === 'Ready'
                              ? 'bg-emerald-950 text-emerald-400'
                              : record.status === 'Draft'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {record.status}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {record.format === 'Instagram-Post' ? '1:1' : '9:16'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-200 group-hover:text-rose-300 line-clamp-2 leading-tight">
                        {record.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
