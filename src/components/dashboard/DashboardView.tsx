import React from 'react';
import {
  Flame,
  ArrowRight,
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  Clock,
  FileEdit,
  TrendingUp,
  Layout,
  Tag,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Share2
} from 'lucide-react';
import { Project, SectionTab, ContentRecord } from '../../types';

interface DashboardViewProps {
  project: Project;
  onNavigate: (tab: SectionTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ project, onNavigate }) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecord: ContentRecord | undefined =
    project.records.find((r) => r.date === todayDate) || project.records[0];

  const suggestedTemplate = project.templates.find(
    (t) => t.id === todayRecord?.templateId
  ) || project.templates[0];

  const upcomingRecords = project.records.filter((r) => r.id !== todayRecord?.id);

  return (
    <div id="dashboard-view" className="p-6 max-w-7xl mx-auto space-y-6 select-none text-slate-200">
      {/* Action Banner: "ماذا يجب أن أفعل الآن؟" */}
      <div
        id="dashboard-action-now-banner"
        className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-rose-900/40 rounded-xl p-5 shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                الأولوية الآن • Immediate Priority
              </span>
              <span className="text-xs text-slate-400">
                Daily Creative Cycle
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>ماذا يجب أن أفعل الآن؟</span>
              <span className="text-slate-400 text-sm font-normal">| What should I produce today?</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              قم بإنشاء محتوى اليوم: <strong className="text-rose-300 font-semibold">{todayRecord?.title}</strong> باستخدام قالب{' '}
              <strong className="text-slate-100 underline decoration-rose-500/60">{suggestedTemplate?.name}</strong> وتطبيقه على هوية{' '}
              <strong className="text-slate-100">{project.brand.name}</strong> ثم تصديره ونشره.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('integrations')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>تكاملات وتصدير (Hub)</span>
            </button>
            <button
              onClick={() => onNavigate('bulk')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span>توليد دفعي (Bulk)</span>
            </button>
            <button
              id="btn-goto-today-content"
              onClick={() => onNavigate('today')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>تنفيذ محتوى اليوم</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary 3-Column Bento Grid: Today's Focus, Series & Stats, Brand & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1 & 2: Today's Content Card (Detailed) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-slate-100">محتوى اليوم • Today&apos;s Content Record</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">الحالة:</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  todayRecord?.status === 'Ready'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50'
                    : todayRecord?.status === 'Draft'
                    ? 'bg-amber-950/70 text-amber-300 border-amber-800/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {todayRecord?.status || 'Draft'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  العنوان المقترح / Statement
                </label>
                <div className="text-sm font-semibold text-slate-100 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/70">
                  {todayRecord?.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/50 p-2 rounded-md border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">التصنيف / Category</span>
                  <span className="text-xs font-medium text-slate-200">{todayRecord?.category}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-md border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">الأسلوب / Style</span>
                  <span className="text-xs font-medium text-slate-200">{todayRecord?.style}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/50 p-2 rounded-md border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">الصيغة / Format</span>
                  <span className="text-xs font-medium text-slate-200">{todayRecord?.format}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-md border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">القالب / Template</span>
                  <span className="text-xs font-medium text-slate-200 truncate block">
                    {suggestedTemplate?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Mini Preview Container */}
            <div className="flex flex-col justify-between bg-slate-950/80 rounded-lg p-3 border border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between mb-2">
                <span>معاينة القالب المقترح (Preview)</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {suggestedTemplate?.width}x{suggestedTemplate?.height}
                </span>
              </div>

              <div className="w-full aspect-square max-w-[200px] mx-auto bg-slate-900 rounded-md border border-slate-800 flex flex-col justify-between p-3 relative overflow-hidden shadow-inner">
                <div className="w-full h-1.5 bg-rose-600 rounded-full" />
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                    01 / SYSTEM
                  </div>
                  <div className="text-[11px] font-bold text-slate-100 leading-tight">
                    TYPOGRAPHY ARCHITECTURE
                  </div>
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-800 pt-1.5">
                  <span>ATELIER MINIMAL</span>
                  <span>DAILY #14</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onNavigate('templates')}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs rounded font-medium text-center transition-colors"
                >
                  تعديل في القالب
                </button>
                <button
                  onClick={() => onNavigate('today')}
                  className="flex-1 py-1.5 px-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs rounded font-medium text-center transition-colors"
                >
                  فتح المحرر الكامل
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Active Brand & Production Streak */}
        <div className="space-y-5">
          {/* Daily Streak Block */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">الاستمرارية اليومية • Streak</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                {project.streakDays}
              </span>
              <span className="text-xs text-slate-400">أيام متتالية من الإنتاج</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              الاستمرارية اليومية تبني الهوية، تعزز المهارة، وتخلق الأثر التراكمي لجمهورك.
            </p>
          </div>

          {/* Active Brand Visual Summary */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-semibold text-slate-200">نظام الهوية • Brand System</h4>
              </div>
              <button
                onClick={() => onNavigate('brand')}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
              >
                تعديل القواعد
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">اسم الهوية:</span>
                <span className="font-semibold text-slate-100">{project.brand.name}</span>
              </div>

              {/* Color Palette Display */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">لوحة الألوان الأساسية:</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-slate-700"
                    style={{ backgroundColor: project.brand.colors.primary }}
                    title={`Primary: ${project.brand.colors.primary}`}
                  />
                  <div
                    className="w-6 h-6 rounded border border-slate-700"
                    style={{ backgroundColor: project.brand.colors.secondary }}
                    title={`Secondary: ${project.brand.colors.secondary}`}
                  />
                  <div
                    className="w-6 h-6 rounded border border-slate-700"
                    style={{ backgroundColor: project.brand.colors.accent }}
                    title={`Accent: ${project.brand.colors.accent}`}
                  />
                  <div
                    className="w-6 h-6 rounded border border-slate-700"
                    style={{ backgroundColor: project.brand.colors.background }}
                    title={`Background: ${project.brand.colors.background}`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>خط العناوين:</span>
                  <span className="text-slate-200 font-medium">{project.brand.typography.headingFont}</span>
                </div>
                <div className="flex justify-between">
                  <span>الأساليب المعتمدة:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[150px]">
                    {project.brand.styles.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Current Series & Upcoming Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current Active Series */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">السلسلة الحالية • Current Series</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-mono">
              14 / 30 Posts
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-100">30 Days of Modern Typography</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              سلسلة تستهدف نشر ملصق وتجربة تايبوجرافي يومياً مع تحليل فلسفة الخطوط وموازين الشبكة السويسرية.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>نسبة الإنجاز</span>
              <span>46% مكتمل</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[46%]" />
            </div>
          </div>
        </div>

        {/* Upcoming Content Schedule */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-100">المحتويات القادمة والتقويم • Upcoming & Calendar</h3>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => onNavigate('calendar')}
                className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
              >
                فتح التقويم
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => onNavigate('ideas')}
                className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                بنك الأفكار
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {upcomingRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 hover:border-slate-700/80 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200 truncate">{record.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{record.date}</span>
                    <span>•</span>
                    <span>{record.category}</span>
                    <span>•</span>
                    <span>{record.format}</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
