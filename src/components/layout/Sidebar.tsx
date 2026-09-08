import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Lightbulb,
  Calendar,
  FolderKanban,
  LayoutTemplate,
  Palette,
  Image as ImageIcon,
  Library,
  BarChart3,
  Settings,
  HardDrive,
  FileSpreadsheet,
  Share2
} from 'lucide-react';
import { SectionTab } from '../../types';

interface SidebarProps {
  activeTab: SectionTab;
  onTabChange: (tab: SectionTab) => void;
  streakDays: number;
}

interface NavItem {
  id: SectionTab;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  badge?: string;
  phase1?: boolean;
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة القيادة', icon: LayoutDashboard, phase1: true },
  { id: 'today', label: "Today's Content", labelAr: 'محتوى اليوم', icon: CalendarClock, badge: 'Active', phase1: true },
  { id: 'bulk', label: 'Bulk Production', labelAr: 'التوليد والإنتاج الدفعي', icon: FileSpreadsheet, badge: 'Phase 3', phase1: true },
  { id: 'integrations', label: 'Integrations & Hub', labelAr: 'التكاملات ومركز التصدير', icon: Share2, badge: 'Phase 4', phase1: true },
  { id: 'ideas', label: 'Ideas Engine', labelAr: 'الأفكار والإلهام', icon: Lightbulb, badge: 'New', phase1: true },
  { id: 'calendar', label: 'Calendar', labelAr: 'التقويم والجدول', icon: Calendar, phase1: true },
  { id: 'projects', label: 'Projects', labelAr: 'المشاريع', icon: FolderKanban, phase1: true },
  { id: 'templates', label: 'Templates', labelAr: 'القوالب', icon: LayoutTemplate, phase1: true },
  { id: 'brand', label: 'Brand System', labelAr: 'الهوية البصرية', icon: Palette, phase1: true },
  { id: 'assets', label: 'Assets', labelAr: 'الأصول والملفات', icon: ImageIcon, badge: 'Phase 8', phase1: true },
  { id: 'content-library', label: 'Content Library', labelAr: 'مكتبة المحتوى', icon: Library, badge: 'Live', phase1: true },
  { id: 'analytics', label: 'Analytics & Learning', labelAr: 'التحليلات وحلقة التعلّم', icon: BarChart3, badge: 'Live', phase1: true },
  { id: 'settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings, phase1: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, streakDays }) => {
  return (
    <aside
      id="sidebar-container"
      className="w-64 bg-slate-950 text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 select-none h-screen"
    >
      {/* Brand Identity Header */}
      <div id="sidebar-header" className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-sm tracking-tight text-sm">
          CF
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm tracking-tight">ContentForge</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">v2.0</span>
          </div>
          <span className="text-xs text-slate-400 truncate">Creative Production Engine</span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav id="sidebar-nav" className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 custom-scrollbar">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-rose-600/15 text-rose-300 font-semibold border-l-2 border-rose-500 rounded-l-none'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                    {item.badge}
                  </span>
                )}
                {!item.phase1 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    Phase 2
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Local-First Status Indicator Footer */}
      <div id="sidebar-footer" className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Local-First Engine</span>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
            Offline Ready
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 rounded px-2.5 py-1.5 border border-slate-800/60">
          <span>Active Streak</span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            🔥 {streakDays} Days
          </span>
        </div>
      </div>
    </aside>
  );
};
