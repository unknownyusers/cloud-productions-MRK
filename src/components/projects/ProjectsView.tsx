import React from 'react';
import { FolderKanban, Plus, HardDrive, Calendar, FileText, Download } from 'lucide-react';
import { Project } from '../../types';

interface ProjectsViewProps {
  project: Project;
  onExportProjectJson: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ project, onExportProjectJson }) => {
  return (
    <div id="projects-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-rose-500" />
            <span>مساحة المشاريع المحلية • Projects Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة مساحات العمل المحلية، هيكلة ملفات المشروع، والنسخ الاحتياطي بصيغة JSON.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportProjectJson}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير ملف المشروع (JSON)</span>
          </button>
          <button className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>مشروع جديد</span>
          </button>
        </div>
      </div>

      {/* Active Project Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center font-bold text-rose-400 text-base">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">{project.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-mono">
                  المشروع النشط
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{project.description}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">v{project.version}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">القوالب (Templates)</span>
            <span className="text-base font-bold text-slate-100 font-mono">{project.templates.length}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">سجلات المحتوى (Records)</span>
            <span className="text-base font-bold text-slate-100 font-mono">{project.records.length}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">الهوية المعتمدة (Brand)</span>
            <span className="text-xs font-bold text-rose-300 truncate block mt-1">{project.brand.name}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">التخزين (Storage Mode)</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1">Local-First</span>
          </div>
        </div>
      </div>
    </div>
  );
};
