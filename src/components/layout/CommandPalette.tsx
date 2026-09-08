import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  CalendarClock,
  FileSpreadsheet,
  Share2,
  Lightbulb,
  Calendar,
  FolderKanban,
  LayoutTemplate,
  Palette,
  Image as ImageIcon,
  Library,
  BarChart3,
  Settings,
  ArrowRight,
  Plus,
  Download,
  TerminalSquare
} from 'lucide-react';
import { SectionTab } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: SectionTab) => void;
  onExportJson?: () => void;
  onQuickAction?: (action: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: string;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onExportJson,
  onQuickAction
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    { id: 'nav-dashboard', label: 'الذهاب إلى لوحة القيادة', icon: LayoutDashboard, section: 'Navigation', action: () => onNavigate('dashboard') },
    { id: 'nav-today', label: 'فتح محتوى اليوم', icon: CalendarClock, section: 'Navigation', action: () => onNavigate('today') },
    { id: 'nav-bulk', label: 'الإنتاج الدفعي (Bulk)', icon: FileSpreadsheet, section: 'Navigation', action: () => onNavigate('bulk') },
    { id: 'nav-integrations', label: 'إعدادات التكاملات', icon: Share2, section: 'Navigation', action: () => onNavigate('integrations') },
    { id: 'nav-ideas', label: 'بنك الأفكار والإلهام', icon: Lightbulb, section: 'Navigation', action: () => onNavigate('ideas') },
    { id: 'nav-calendar', label: 'التقويم وجدولة النشر', icon: Calendar, section: 'Navigation', action: () => onNavigate('calendar') },
    { id: 'nav-projects', label: 'المشاريع المحلية', icon: FolderKanban, section: 'Navigation', action: () => onNavigate('projects') },
    { id: 'nav-templates', label: 'إدارة القوالب (Templates)', icon: LayoutTemplate, section: 'Navigation', action: () => onNavigate('templates') },
    { id: 'nav-brand', label: 'النظام البصري (Brand System)', icon: Palette, section: 'Navigation', action: () => onNavigate('brand') },
    { id: 'nav-assets', label: 'مستودع الأصول (Media Vault)', icon: ImageIcon, section: 'Navigation', action: () => onNavigate('assets') },
    { id: 'nav-library', label: 'مكتبة المحتوى والأرشيف', icon: Library, section: 'Navigation', action: () => onNavigate('content-library') },
    { id: 'nav-analytics', label: 'التحليلات والأداء', icon: BarChart3, section: 'Navigation', action: () => onNavigate('analytics') },
    { id: 'nav-settings', label: 'إعدادات النظام', icon: Settings, section: 'Navigation', action: () => onNavigate('settings') },
    
    { 
      id: 'action-new-idea', 
      label: 'تسجيل فكرة جديدة', 
      icon: Plus, 
      section: 'Actions', 
      action: () => {
        onNavigate('ideas');
        // Let the ideas view handle it, or we could pass a specific quick action
      }
    },
    { 
      id: 'action-export', 
      label: 'تصدير نسخة احتياطية (JSON)', 
      icon: Download, 
      section: 'Actions', 
      action: () => {
        if(onExportJson) onExportJson();
      }
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.section.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Palette Box */}
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <TerminalSquare className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
            placeholder="اكتب أمراً أو ابحث عن قسم... (مثال: أفكار, تصدير)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded">ESC</kbd>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              لا توجد نتائج مطابقة لـ "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    selectedIndex === idx
                      ? 'bg-rose-600/15 text-rose-300'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center gap-3">
                    <cmd.icon className={`w-4 h-4 ${selectedIndex === idx ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span className="font-medium">{cmd.label}</span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${selectedIndex === idx ? 'text-rose-500/70' : 'text-slate-600'}`}>
                    {cmd.section}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><kbd className="px-1 bg-slate-800 rounded">↑</kbd><kbd className="px-1 bg-slate-800 rounded">↓</kbd> للتنقل</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-slate-800 rounded">↵</kbd> للاختيار</span>
          </div>
          <span className="text-[9px] font-mono text-rose-500/70 font-bold px-1.5 py-0.5 rounded border border-rose-500/20 bg-rose-500/10">
            PHASE 9
          </span>
        </div>
      </div>
    </div>
  );
};
