import React from 'react';
import {
  FolderKanban,
  Palette,
  Sparkles,
  Download,
  PlusCircle,
  Clock
} from 'lucide-react';
import { Project, SectionTab } from '../../types';

interface HeaderProps {
  project: Project;
  activeTab: SectionTab;
  onQuickAction?: (action: string) => void;
}

const tabTitles: Record<SectionTab, { en: string; ar: string }> = {
  dashboard: { en: 'Production Dashboard', ar: 'لوحة القيادة والإنتاج اليومي' },
  today: { en: "Today's Content", ar: 'محتوى اليوم والتنفيذ' },
  ideas: { en: 'Idea Engine', ar: 'محرك توليد وتخزين الأفكار' },
  calendar: { en: 'Content Calendar', ar: 'تقويم النشر وجدول المواعيد' },
  bulk: { en: 'Bulk Production Engine', ar: 'محرك التوليد والإنتاج الدفعي' },
  integrations: { en: 'Integrations & Multi-Channel Export', ar: 'مركز التكاملات والنشر والتصدير المتعدد' },
  projects: { en: 'Projects Workspace', ar: 'إدارة وتخصيص المشاريع' },
  templates: { en: 'Design Templates', ar: 'قوالب التصميم والطبقات' },
  brand: { en: 'Brand System & Styles', ar: 'نظام الهوية البصرية والقواعد' },
  assets: { en: 'Asset Intelligence', ar: 'مكتبة الأصول والملفات المحلية' },
  'content-library': { en: 'Content Records Library', ar: 'أرشيف وسجلات المحتوى' },
  analytics: { en: 'Performance Intelligence', ar: 'تحليل الأداء والنتائج' },
  settings: { en: 'Engine Settings', ar: 'إعدادات النظام والنسخ الاحتياطي' },
};

export const Header: React.FC<HeaderProps> = ({ project, activeTab, onQuickAction }) => {
  const currentTabInfo = tabTitles[activeTab] || { en: 'ContentForge', ar: 'النظام' };

  return (
    <header
      id="main-app-header"
      className="h-14 bg-slate-900/90 border-b border-slate-800 backdrop-blur-xs px-5 flex items-center justify-between shrink-0 select-none z-10"
    >
      {/* Active Section & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
            {currentTabInfo.en}
          </h1>
          <span className="text-xs text-slate-400 font-normal">
            — {currentTabInfo.ar}
          </span>
        </div>
      </div>

      {/* Center/Right Project Context Controls */}
      <div className="flex items-center gap-3">
        {/* Project Selector Badge */}
        <div
          id="active-project-badge"
          className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md text-xs text-slate-200 transition-colors"
          title="Active Local Project"
        >
          <FolderKanban className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-medium max-w-[140px] truncate">{project.name}</span>
        </div>

        {/* Brand System Badge */}
        <div
          id="active-brand-badge"
          className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-xs text-slate-200"
          title={`Active Brand: ${project.brand.name}`}
        >
          <Palette className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400 text-[11px]">Brand:</span>
          <span className="font-medium">{project.brand.name}</span>
          <div
            className="w-2.5 h-2.5 rounded-full border border-slate-600 shadow-xs"
            style={{ backgroundColor: project.brand.colors.accent }}
          />
        </div>

        {/* Date/Time Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Global Command Hint */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-400 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <kbd className="font-mono text-[10px]">CMD+K</kbd>
        </div>

        {/* Quick Action Button */}
        <button
          id="btn-quick-new-content"
          onClick={() => onQuickAction && onQuickAction('new-content')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Daily Content</span>
        </button>
      </div>
    </header>
  );
};
