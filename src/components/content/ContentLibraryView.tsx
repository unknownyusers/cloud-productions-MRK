import React, { useState, useMemo } from 'react';
import {
  Library,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  CheckCircle2,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Share2,
  FileText,
  Video,
  Layers,
  Check,
  ArrowRight,
  Clock
} from 'lucide-react';
import { ContentRecord, Project, ContentStatus, ContentFormat } from '../../types';

interface ContentLibraryViewProps {
  project: Project;
  onUpdateRecord?: (record: ContentRecord) => void;
  onCreateRecord?: (record: ContentRecord) => void;
  onDeleteRecord?: (id: string) => void;
  onNavigateTab?: (tab: any) => void;
  onSelectRecordForToday?: (record: ContentRecord) => void;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = ({
  project,
  onUpdateRecord,
  onCreateRecord,
  onDeleteRecord,
  onNavigateTab,
  onSelectRecordForToday
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');

  // Modal States
  const [editingRecord, setEditingRecord] = useState<ContentRecord | null>(null);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [repurposingRecord, setRepurposingRecord] = useState<ContentRecord | null>(null);
  const [repurposeFormat, setRepurposeFormat] = useState<'twitter_thread' | 'tiktok_script' | 'carousel_slides'>('twitter_thread');
  const [isRepurposingLoading, setIsRepurposingLoading] = useState(false);
  const [repurposedResult, setRepurposedResult] = useState<any | null>(null);
  const [copiedRepurpose, setCopiedRepurpose] = useState(false);

  // New Record Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Design Theory');
  const [newFormat, setNewFormat] = useState<ContentFormat>('Instagram-Post');
  const [newStatus, setNewStatus] = useState<ContentStatus>('Draft');
  const [newCaption, setNewCaption] = useState('');

  const records = project.records || [];

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.hashtags && rec.hashtags.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
      const matchesFormat = formatFilter === 'ALL' || rec.format === formatFilter;

      return matchesSearch && matchesStatus && matchesFormat;
    });
  }, [records, searchTerm, statusFilter, formatFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRec: ContentRecord = {
      id: `rec_${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || '01 / SWISS SYSTEM',
      cta: 'Explore More at ContentForge',
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      theme: 'Editorial Modern',
      style: 'Editorial',
      templateId: project.templates[0]?.id || 'tmpl_01',
      brandId: project.brand.id,
      format: newFormat,
      status: newStatus,
      caption: newCaption || `${newTitle}\n\n#SwissDesign #ContentForge #Typography`,
      hashtags: ['#GraphicDesign', '#Typography', '#DesignSystems', '#ContentForge'],
      activeVariationId: 'original',
      variations: [
        {
          id: 'original',
          name: 'Original',
          label: 'Default Brand Palette',
          accentColor: project.brand.colors.accent || '#E11D48',
          bgFill: project.brand.colors.primary || '#0F172A',
          title: newTitle.toUpperCase(),
          subtitle: newSubtitle.toUpperCase() || '01 / SWISS SYSTEM',
          cta: 'EXPLORE ARCHIVE'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateRecord?.(newRec);
    setIsNewRecordModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewCaption('');
  };

  const handleDuplicate = (rec: ContentRecord) => {
    const duplicated: ContentRecord = {
      ...rec,
      id: `rec_${Date.now()}`,
      title: `${rec.title} (نسخة بديلة)`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onCreateRecord?.(duplicated);
  };

  const handleStatusChange = (rec: ContentRecord, newStatus: ContentStatus) => {
    onUpdateRecord?.({
      ...rec,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRunRepurpose = async (targetFmt: 'twitter_thread' | 'tiktok_script' | 'carousel_slides') => {
    if (!repurposingRecord) return;
    setIsRepurposingLoading(true);
    setRepurposeFormat(targetFmt);

    try {
      const response = await fetch('/api/content/ai/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: repurposingRecord.title,
          subtitle: repurposingRecord.subtitle || '',
          caption: repurposingRecord.caption || '',
          targetFormat: targetFmt,
          language: 'ar'
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setRepurposedResult(data.data);
      }
    } catch (e) {
      console.error('Failed to repurpose content:', e);
    } finally {
      setIsRepurposingLoading(false);
    }
  };

  return (
    <div id="content-library-view" className="p-6 max-w-7xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase">
              Phase 8 • Archive & Repurposing Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Library className="w-5 h-5 text-rose-500" />
            <span>مكتبة وسجلات المحتوى الشاملة • Content Archive</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة كاملة للمنشورات، تتبع دورة الحياة (Draft → Ready → Published)، وإعادة تدوير المحتوى إلى منصات X وتيك توك بضغطة زر.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewRecordModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سجل محتوى جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'الكل', count: records.length },
              { id: 'Ready', label: 'جاهز للنشر', count: records.filter((r) => r.status === 'Ready').length },
              { id: 'Published', label: 'تم النشر', count: records.filter((r) => r.status === 'Published').length },
              { id: 'Draft', label: 'مسودات', count: records.filter((r) => r.status === 'Draft').length },
              { id: 'Idea', label: 'أفكار', count: records.filter((r) => r.status === 'Idea').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box & Format Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="بحث بالعنوان أو التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
            >
              <option value="ALL">جميع الأشكال (Formats)</option>
              <option value="Instagram-Post">Instagram-Post (1:1)</option>
              <option value="TikTok-9:16">TikTok (9:16)</option>
              <option value="Landscape">Landscape</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="p-3.5 font-semibold">عنوان المحتوى / Title</th>
                <th className="p-3.5 font-semibold">التاريخ</th>
                <th className="p-3.5 font-semibold">التصنيف</th>
                <th className="p-3.5 font-semibold">الصيغة</th>
                <th className="p-3.5 font-semibold">الحالة</th>
                <th className="p-3.5 font-semibold text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-3.5 font-medium text-slate-200">
                    <div className="font-semibold text-slate-100 max-w-md truncate">{rec.title}</div>
                    {rec.subtitle && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rec.subtitle}</div>}
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{rec.date}</td>
                  <td className="p-3.5 text-slate-300 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      {rec.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{rec.format}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(rec, e.target.value as ContentStatus)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                        rec.status === 'Ready'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : rec.status === 'Published'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          : rec.status === 'Draft'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <option value="Idea">Idea</option>
                      <option value="Draft">Draft</option>
                      <option value="Ready">Ready</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Open in Today's Canvas */}
                      <button
                        onClick={() => {
                          onSelectRecordForToday?.(rec);
                          onNavigateTab?.('today');
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="فتح في محرك اليوم لتعديل المتغيرات وتصدير PNG"
                      >
                        <ExternalLink className="w-3 h-3 text-rose-400" />
                        <span>معاينة في الكانفاس</span>
                      </button>

                      {/* AI Repurpose Studio */}
                      <button
                        onClick={() => {
                          setRepurposingRecord(rec);
                          setRepurposedResult(null);
                          handleRunRepurpose('twitter_thread');
                        }}
                        className="p-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 rounded cursor-pointer transition-colors"
                        title="إعادة تدوير المحتوى ذكياً إلى X أو تيك توك"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicate(rec)}
                        className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded cursor-pointer transition-colors"
                        title="تكرار السجل"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف "${rec.title}"؟`)) {
                            onDeleteRecord?.(rec.id);
                          }
                        }}
                        className="p-1.5 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 rounded cursor-pointer transition-colors"
                        title="حذف السجل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AI Content Repurposing Modal                                          */}
      {/* ========================================================================= */}
      {repurposingRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    استوديو إعادة تدوير المحتوى الذكي • Multi-Format Repurposing
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-md">
                    المصدر: {repurposingRecord.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRepurposingRecord(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Format Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'twitter_thread', label: 'ثريد X / Twitter', icon: Share2 },
                { id: 'tiktok_script', label: 'سكريبت تيك توك 45 ثانية', icon: Video },
                { id: 'carousel_slides', label: 'كاروسيل إنستغرام (5 شرائح)', icon: Layers }
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => handleRunRepurpose(fmt.id as any)}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    repurposeFormat === fmt.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <fmt.icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{fmt.label}</span>
                </button>
              ))}
            </div>

            {/* Repurposed Result Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              {isRepurposingLoading ? (
                <div className="py-8 text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">جاري إعادة صياغة المحتوى وفق متطلبات الخوارزميات...</p>
                </div>
              ) : repurposedResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">{repurposedResult.headline}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(repurposedResult.content);
                        setCopiedRepurpose(true);
                        setTimeout(() => setCopiedRepurpose(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRepurpose ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRepurpose ? 'تم النسخ!' : 'نسخ النص'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {repurposedResult.content}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  اختر المنصة أعلاه لبدء التوليد الذكي.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRepurposingRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Create New Record Modal                                               */}
      {/* ========================================================================= */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                <span>إضافة سجل محتوى جديد</span>
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">عنوان المنشور / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قواعد التباين في التايبوجرافي السويسري"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">العنوان الفرعي / Subtitle</label>
                <input
                  type="text"
                  placeholder="مثال: 01 / SWISS SYSTEM"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">الشكل / Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as ContentFormat)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="Instagram-Post">Instagram-Post (1:1)</option>
                    <option value="TikTok-9:16">TikTok (9:16)</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">الحالة / Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ContentStatus)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Ready">Ready</option>
                    <option value="Idea">Idea</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">التصنيف / Category</label>
                <input
                  type="text"
                  placeholder="Design Theory, Layout, Typography"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  إضافة السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
