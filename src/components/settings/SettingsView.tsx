import React, { useState } from 'react';
import { Settings, HardDrive, ShieldCheck, Download, RefreshCw, Check } from 'lucide-react';
import { Project } from '../../types';

interface SettingsViewProps {
  project: Project;
  onExportJson: () => void;
  onResetToDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  project,
  onExportJson,
  onResetToDefaults
}) => {
  const [backedUp, setBackedUp] = useState(false);

  const handleBackup = () => {
    onExportJson();
    setBackedUp(true);
    setTimeout(() => setBackedUp(false), 2500);
  };

  return (
    <div id="settings-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-500" />
          <span>إعدادات النظام والنسخ الاحتياطي • System Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          التحكم في التخزين المحلي، النسخ الاحتياطي، وحماية البيانات وفق مبدأ Local-First الصارم.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local-First & Storage Info */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>حالة التخزين المحلي (Local Persistence)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60 space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">نمط التشغيل</span>
                <span className="text-emerald-400 font-semibold">Local-First (100% Offline)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                جميع ملفات المشروع والقوالب والخطوط وسجلات المحتوى تُحفظ محلياً على جهازك دون أي ربط إلزامي بخوادم خارجية.
              </p>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400">إصدار الدستور المعتمد</span>
              <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                V2.0 Core
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400">حجم المشاريع والبيانات</span>
              <span className="font-mono text-slate-200 text-[11px]">JSON Encoded Local Storage</span>
            </div>
          </div>
        </div>

        {/* Backups & Project Export */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>النسخ الاحتياطي اليدوي (Manual Backup)</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            يمكنك تحميل ملف المشروع الكامل بصيغة JSON لنقله أو الاحتفاظ بنسخة احتياطية على أي وحدة تخزين.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleBackup}
              className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {backedUp ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
              <span>{backedUp ? 'تم تنزيل النسخة الاحتياطية!' : 'تحميل نسخة احتياطية الآن (JSON)'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من إعادة ضبط البيانات إلى القيم الافتراضية؟')) {
                  onResetToDefaults();
                }
              }}
              className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة تعيين البيانات الافتراضية (Reset Default State)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
