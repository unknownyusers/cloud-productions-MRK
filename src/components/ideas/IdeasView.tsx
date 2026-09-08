import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Archive,
  Tag,
  Shuffle
} from 'lucide-react';
import { Idea, Project, ContentFormat } from '../../types';

interface IdeasViewProps {
  project: Project;
  onAddIdea: (idea: Idea) => void;
  onUseIdeaAsToday: (idea: Idea) => void;
  onUpdateIdeaStatus: (id: string, status: Idea['status']) => void;
}

const inspirationBank: Omit<Idea, 'id' | 'createdAt' | 'status'>[] = [
  {
    title: 'The Tension of Heavy Display Fonts on Thin Hairlines',
    category: 'Typography',
    theme: 'Contrast Extremes',
    topic: 'Font weight collision as a visual hook',
    format: 'Instagram-Post',
    notes: 'Pair 900 Ultra-Black font with 100 Hairline monospaced subtext.'
  },
  {
    title: 'Grid Breaking: When 10% Off-Center Beats Mathematical Symmetry',
    category: 'Layout Theory',
    theme: 'Controlled Asymmetry',
    topic: 'Optical balance vs mathematical balance',
    format: 'Instagram-Post',
    notes: 'Slight displacement forces the eye to focus longer.'
  },
  {
    title: 'Warm Analog Tones vs Cold Cyber Blues: A Palette Study',
    category: 'Color Theory',
    theme: 'Atmospheric Palettes',
    topic: 'Emotional resonance of temperature in feed design',
    format: 'Instagram-Post',
    notes: 'Warm paper texture background with cold electric blue accent.'
  },
  {
    title: 'Poster in 3 Seconds: Designing for High-Speed Mobile Feeds',
    category: 'Content Strategy',
    theme: 'Visual Velocity',
    topic: 'Immediate focal point anchor',
    format: 'TikTok-9:16',
    notes: 'Headline occupies 60% of the initial canvas area.'
  },
  {
    title: 'Micro-Typography: Small Labels that Deliver Big Premium Feeling',
    category: 'Typography',
    theme: 'Luxury Editorial',
    topic: 'Tracked uppercase badges and technical coordinate labels',
    format: 'Instagram-Post',
    notes: 'Letter-spacing 0.25em, font size 9px, pure monochrome.'
  }
];

export const IdeasView: React.FC<IdeasViewProps> = ({
  project,
  onAddIdea,
  onUseIdeaAsToday,
  onUpdateIdeaStatus
}) => {
  const [ideas, setIdeas] = useState<Idea[]>(project.ideas);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Idea Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Typography');
  const [newTheme, setNewTheme] = useState('Modern Editorial');
  const [newFormat, setNewFormat] = useState<ContentFormat>('Instagram-Post');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIdea: Idea = {
      id: `idea_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      theme: newTheme,
      format: newFormat,
      status: 'Saved',
      notes: newNotes,
      createdAt: new Date().toISOString()
    };

    onAddIdea(newIdea);
    setIdeas((prev) => [newIdea, ...prev]);
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleDrawInspiration = () => {
    const existingTitles = new Set(ideas.map((i) => i.title.toLowerCase()));
    const available = inspirationBank.filter(
      (insp) => !existingTitles.has(insp.title.toLowerCase())
    );

    const pool = available.length > 0 ? available : inspirationBank;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    const generated: Idea = {
      id: `idea_${Date.now()}`,
      ...randomPick,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    onAddIdea(generated);
    setIdeas((prev) => [generated, ...prev]);
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.theme.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="ideas-engine-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>محرك الأفكار والإلهام • Ideas Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            توليد وتصنيف الأفكار الإبداعية لمنع التكرار غير المقصود وتحويل أي فكرة مباشرة لمحتوى اليوم.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDrawInspiration}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="توليد فكرة ملهمة غير مكررة من بنك الأفكار الإبداعية"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>إلهام عشوائي (Random Inspiration)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة فكرة يدوية</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="بحث في الأفكار، التصنيفات، أو الثيمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="ALL">الكل (All Ideas)</option>
            <option value="New">جديد (New)</option>
            <option value="Saved">محفوظ (Saved)</option>
            <option value="Used">تم استخدامه (Used)</option>
            <option value="Archived">مؤرشف (Archived)</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 space-y-3 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-300">
                    {idea.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {idea.theme}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    idea.status === 'New'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800/40'
                      : idea.status === 'Saved'
                      ? 'bg-sky-950/70 text-sky-300 border-sky-800/40'
                      : idea.status === 'Used'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {idea.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {idea.title}
              </h3>

              {idea.notes && (
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  {idea.notes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
              <span className="text-[10px] font-mono text-slate-500">
                {idea.format || 'Instagram-Post'}
              </span>

              <div className="flex items-center gap-1.5">
                {idea.status !== 'Used' && (
                  <button
                    onClick={() => {
                      onUseIdeaAsToday(idea);
                      onUpdateIdeaStatus(idea.id, 'Used');
                      setIdeas((prev) =>
                        prev.map((i) => (i.id === idea.id ? { ...i, status: 'Used' } : i))
                      );
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>تحويل لمحتوى اليوم</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {idea.status === 'New' && (
                  <button
                    onClick={() => {
                      onUpdateIdeaStatus(idea.id, 'Saved');
                      setIdeas((prev) =>
                        prev.map((i) => (i.id === idea.id ? { ...i, status: 'Saved' } : i))
                      );
                    }}
                    className="p-1 text-slate-400 hover:text-sky-300 rounded"
                    title="حفظ الفكرة"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>إضافة فكرة محتوى جديدة</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">عنوان الفكرة / الرسالة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أهمية التباين العالي في ملصقات التايبوجرافي"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">التصنيف (Category)</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
                  >
                    <option value="Typography">Typography</option>
                    <option value="Design Theory">Design Theory</option>
                    <option value="Layout Theory">Layout Theory</option>
                    <option value="Color Theory">Color Theory</option>
                    <option value="Content Strategy">Content Strategy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">الصيغة المقترحة</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
                  >
                    <option value="Instagram-Post">Instagram-Post (1080x1080)</option>
                    <option value="TikTok-9:16">TikTok-9:16 (1080x1920)</option>
                    <option value="YouTube-Thumbnail">YouTube Thumbnail</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">الثيم / الأسلوب (Theme)</label>
                <input
                  type="text"
                  placeholder="مثال: Swiss Precision أو Minimal Noir"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">ملاحظات توجيهية (Notes)</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات لتطبيقها أثناء التصميم..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold"
                >
                  حفظ الفكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
