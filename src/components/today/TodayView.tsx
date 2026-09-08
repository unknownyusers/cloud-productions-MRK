import React, { useState, useRef } from 'react';
import {
  CalendarClock,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileCheck,
  Hash,
  Sliders,
  Type,
  Maximize2
} from 'lucide-react';
import { Project, ContentRecord, ContentVariation } from '../../types';

interface TodayViewProps {
  project: Project;
  onUpdateRecord?: (record: ContentRecord) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ project, onUpdateRecord }) => {
  const [recordIndex, setRecordIndex] = useState(0);
  const todayRecord: ContentRecord = project.records[recordIndex] || project.records[0];

  const defaultVariations: ContentVariation[] = [
    {
      id: 'original',
      name: 'Original',
      label: 'Default Brand Palette (Charcoal & Vermilion)',
      accentColor: '#E11D48',
      bgFill: '#0F172A',
      headingFont: 'Plus Jakarta Sans',
      title: todayRecord?.title || 'TYPOGRAPHY IS THE ARCHITECTURE OF THOUGHT.',
      subtitle: todayRecord?.subtitle || '01 / MODERN SYSTEM',
      cta: todayRecord?.cta || 'SWISS DESIGN MANIFESTO'
    },
    {
      id: 'var_a',
      name: 'Variation A',
      label: 'Editorial Warm High-Contrast (Paper White & Noir)',
      accentColor: '#020617',
      bgFill: '#F8FAFC',
      headingFont: 'Syne',
      title: 'ASYMMETRIC GRIDS CREATE INTENTIONAL TENSION.',
      subtitle: '02 / EDITORIAL FOCUS',
      cta: 'READ THE FULL BREAKDOWN'
    },
    {
      id: 'var_b',
      name: 'Variation B',
      label: 'Electric Amber Experimental (Dark Luxury)',
      accentColor: '#F59E0B',
      bgFill: '#18181B',
      headingFont: 'Space Grotesk',
      title: 'NEGATIVE SPACE IS AN ACTIVE DESIGN ELEMENT.',
      subtitle: '03 / EXPERIMENTAL MODE',
      cta: 'SAVE FOR YOUR NEXT PROJECT'
    },
    {
      id: 'var_c',
      name: 'Variation C',
      label: 'Brutalist Monospaced (Cobalt Tension)',
      accentColor: '#38BDF8',
      bgFill: '#090D16',
      headingFont: 'Inter',
      title: 'SIMPLICITY IS CLARITY ELEVATED TO AN ART FORM.',
      subtitle: '04 / BRUTALIST POSTER',
      cta: 'JOIN THE 30-DAY CHALLENGE'
    }
  ];

  const variations = todayRecord?.variations && todayRecord.variations.length > 0
    ? todayRecord.variations
    : defaultVariations;

  const [activeVarId, setActiveVarId] = useState<string>(
    todayRecord?.activeVariationId || 'original'
  );

  const activeVariation =
    variations.find((v) => v.id === activeVarId) || variations[0];

  // Dynamic Template Variables
  const [varTitle, setVarTitle] = useState(
    activeVariation.title || todayRecord?.title || 'TYPOGRAPHY IS THE ARCHITECTURE OF THOUGHT.'
  );
  const [varSubtitle, setVarSubtitle] = useState(
    activeVariation.subtitle || todayRecord?.subtitle || '01 / MODERN SYSTEM'
  );
  const [varCta, setVarCta] = useState(
    activeVariation.cta || todayRecord?.cta || 'SWISS DESIGN MANIFESTO'
  );
  const [varDate, setVarDate] = useState(todayRecord?.date || new Date().toISOString().split('T')[0]);

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ContentRecord['status']>(
    todayRecord?.status || 'Draft'
  );
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Hidden canvas reference for high-resolution PNG generation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSelectVariation = (variation: ContentVariation) => {
    setActiveVarId(variation.id);
    if (variation.title) setVarTitle(variation.title);
    if (variation.subtitle) setVarSubtitle(variation.subtitle);
    if (variation.cta) setVarCta(variation.cta);
  };

  const handleCopyCaption = () => {
    if (todayRecord?.caption) {
      navigator.clipboard.writeText(
        `${todayRecord.caption}\n\n${todayRecord.hashtags.join(' ')}`
      );
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  // High-Resolution PNG Exporter
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const bgColor = activeVariation.bgFill || '#0F172A';
    const isLightBg = bgColor === '#F8FAFC';
    const accentColor = activeVariation.accentColor || '#E11D48';
    const textColor = isLightBg ? '#0F172A' : '#F8FAFC';
    const subtextColor = isLightBg ? '#475569' : '#94A3B8';
    const borderColor = isLightBg ? '#CBD5E1' : '#334155';

    // 1. Draw Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Subtle Precision Grid
    ctx.strokeStyle = isLightBg ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Top Accent Bar & Brand Coordinates
    ctx.fillStyle = accentColor;
    ctx.fillRect(80, 80, 160, 8);

    ctx.fillStyle = subtextColor;
    ctx.font = '700 18px "Space Grotesk", monospace';
    ctx.fillText(`${project.brand.name.toUpperCase()} // LAT 47.3769° N`, 80, 130);

    // Subtitle / Series Marker
    ctx.fillStyle = accentColor;
    ctx.font = '800 24px "Space Grotesk", sans-serif';
    ctx.fillText(varSubtitle.toUpperCase(), 80, 240);

    // 4. Main Headline (Word wrap)
    ctx.fillStyle = textColor;
    ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'top';

    const words = varTitle.toUpperCase().split(' ');
    let line = '';
    let y = 300;
    const maxWidth = width - 160;
    const lineHeight = 80;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 80, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 80, y);

    // 5. Call To Action (Bottom Container)
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(80, height - 200, width - 160, 90);

    ctx.fillStyle = textColor;
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(varCta.toUpperCase(), 120, height - 155);

    // Arrow icon representation
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(width - 130, height - 155, 18, 0, Math.PI * 2);
    ctx.fill();

    // 6. Bottom Metadata Line
    ctx.fillStyle = subtextColor;
    ctx.font = '500 16px "Space Grotesk", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`DATE: ${varDate}`, 80, height - 70);
    ctx.fillText(`VARIATION: ${activeVariation.name.toUpperCase()}`, width - 360, height - 70);

    // 7. Trigger Browser Download
    const fileName = `${varDate}_contentforge_${todayRecord.id}_${activeVarId}.png`;
    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = fileName;
    link.href = imageURL;
    link.click();

    setCurrentStatus('Ready');
    setExportNotice(`تم تصدير ملف الصورة الفعلي: ${fileName}`);
    setTimeout(() => setExportNotice(null), 4000);

    if (onUpdateRecord) {
      onUpdateRecord({
        ...todayRecord,
        title: varTitle,
        subtitle: varSubtitle,
        cta: varCta,
        status: 'Ready',
        activeVariationId: activeVarId as any
      });
    }
  };

  const isLightPreview = activeVariation.bgFill === '#F8FAFC';

  return (
    <div id="today-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Hidden Canvas for High-Resolution Export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-rose-500" />
            <span>محتوى اليوم • Daily Content Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محرك إنتاج محتوى اليوم: المتغيرات، الفاريانتس (Variations)، والتصدير الفعلي كصورة PNG.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {project.records.length > 1 && (
            <select
              value={recordIndex}
              onChange={(e) => setRecordIndex(Number(e.target.value))}
              className="text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              {project.records.map((rec, i) => (
                <option key={rec.id} value={i}>
                  منشور {i + 1}: {rec.title.slice(0, 28)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportPNG}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير PNG الفعلي (Export PNG)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-mono">{exportNotice}</span>
        </div>
      )}

      {/* Variations Switcher (Phase 2 Requirement) */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-slate-200">
              توليد النسخ البديلة للمنشور • Content Variations Engine
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            4 Variations Ready
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {variations.map((v) => {
            const isSelected = activeVarId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => handleSelectVariation(v)}
                className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-rose-500 ring-1 ring-rose-500/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-100">{v.name}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-700"
                    style={{ backgroundColor: v.accentColor || '#E11D48' }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                  {v.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Variables Editor & Copy */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                <span>متغيرات القالب التفاعلية (Template Variables)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">الحالة:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as any)}
                  className="text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Idea">Idea (فكرة)</option>
                  <option value="Draft">Draft (مسودة)</option>
                  <option value="Ready">Ready (جاهز)</option>
                  <option value="Published">Published (منشور)</option>
                  <option value="Archived">Archived (مؤرشف)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                  {`{{TITLE}}`} • العنوان / العبارة الأساسية
                </label>
                <textarea
                  value={varTitle}
                  onChange={(e) => setVarTitle(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-100 font-bold text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                    {`{{SUBTITLE}}`} • العنوان الفرعي
                  </label>
                  <input
                    type="text"
                    value={varSubtitle}
                    onChange={(e) => setVarSubtitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                    {`{{CTA}}`} • الدعوة لاتخاذ إجراء
                  </label>
                  <input
                    type="text"
                    value={varCta}
                    onChange={(e) => setVarCta(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>نص المنشور والمقدمة (Caption & Copy)</span>
                  </label>
                  <button
                    onClick={handleCopyCaption}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCaption ? 'تم النسخ!' : 'نسخ النص'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={todayRecord.caption}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 leading-relaxed text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  <span>الوسوم المعتمدة (Hashtags)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {todayRecord.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Realtime Live Visual Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200">المعاينة الحية الفورية (Live Canvas)</span>
              <span className="text-[10px] font-mono text-slate-400">1080 x 1080 px</span>
            </div>

            {/* Poster Canvas Preview */}
            <div
              className={`w-full aspect-square rounded-lg border flex flex-col justify-between p-6 shadow-2xl relative overflow-hidden transition-all ${
                isLightPreview
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
              style={{ backgroundColor: activeVariation.bgFill }}
            >
              {/* Optional Background Texture Overlay */}
              {activeVariation.bgTextureUrl && (
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen bg-center bg-cover"
                  style={{ backgroundImage: `url("${activeVariation.bgTextureUrl}")` }}
                />
              )}

              {/* Top Bar */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    className="w-24 h-1.5 rounded-full"
                    style={{ backgroundColor: activeVariation.accentColor || '#E11D48' }}
                  />
                  {activeVariation.emblemAssetUrl && (
                    <img
                      src={activeVariation.emblemAssetUrl}
                      alt="Emblem"
                      className="w-7 h-7 object-contain drop-shadow-sm"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest uppercase"
                    style={{ color: activeVariation.accentColor || '#E11D48' }}
                  >
                    {varSubtitle}
                  </span>
                  <span
                    className={`text-[9px] font-mono ${
                      isLightPreview ? 'text-slate-500' : 'text-slate-500'
                    }`}
                  >
                    SWISS-PRECISION
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="my-auto py-4">
                <h3
                  className={`text-base md:text-lg font-black leading-tight tracking-tight uppercase ${
                    isLightPreview ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  {varTitle}
                </h3>
              </div>

              {/* Bottom CTA Box */}
              <div className="space-y-3">
                <div
                  className={`p-2.5 rounded border flex items-center justify-between text-[11px] font-bold ${
                    isLightPreview
                      ? 'bg-slate-200/60 border-slate-300 text-slate-800'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200'
                  }`}
                >
                  <span>{varCta}</span>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: activeVariation.accentColor || '#E11D48' }}
                  >
                    →
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between text-[10px] border-t pt-2.5 ${
                    isLightPreview
                      ? 'text-slate-500 border-slate-200'
                      : 'text-slate-500 border-slate-800'
                  }`}
                >
                  <span className="font-semibold">{project.brand.name}</span>
                  <span className="font-mono">{varDate}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              يتم حفظ التغييرات واستخراج ملف عالي الدقة بدون أي وسيط سحابي.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
