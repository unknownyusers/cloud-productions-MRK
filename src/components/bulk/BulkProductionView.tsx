import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  Plus,
  Trash2,
  FileText,
  FileCode,
  Archive,
  RefreshCw,
  ArrowRight,
  Database
} from 'lucide-react';
import JSZip from 'jszip';
import { Project, ContentRecord, ContentVariation, Template } from '../../types';

interface BulkProductionViewProps {
  project: Project;
  onCommitBulkRecords: (records: ContentRecord[]) => void;
  onNavigateToRecord?: (record: ContentRecord) => void;
}

interface DataRow {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  cta: string;
  category: string;
  theme: string;
  notes?: string;
}

const defaultDemoDatasets: { name: string; description: string; rows: DataRow[] }[] = [
  {
    name: '30 Days Typography Series (سلسلة الثلاثين يوماً)',
    description: 'مجموعة متناسقة من مقولات ومفاهيم التصميم السويسري والتايبوجرافي.',
    rows: [
      {
        id: 'row_01',
        title: 'TYPOGRAPHY IS THE ARCHITECTURE OF THOUGHT',
        subtitle: 'DAY 01 / SWISS SYSTEM',
        date: '2026-09-08',
        cta: 'EXPLORE MODERN RULES',
        category: 'Typography',
        theme: 'Swiss Precision'
      },
      {
        id: 'row_02',
        title: 'ASYMMETRIC GRIDS CREATE INTENTIONAL TENSION',
        subtitle: 'DAY 02 / GRID SYSTEM',
        date: '2026-09-09',
        cta: 'READ FULL ESSAY',
        category: 'Layout Theory',
        theme: 'Asymmetric Balance'
      },
      {
        id: 'row_03',
        title: 'NEGATIVE SPACE IS AN ACTIVE DESIGN ELEMENT',
        subtitle: 'DAY 03 / WHITESPACE',
        date: '2026-09-10',
        cta: 'SAVE FOR INSPIRATION',
        category: 'Design Theory',
        theme: 'Minimalism'
      },
      {
        id: 'row_04',
        title: 'CONTRAST IS THE FOUNDATION OF VISUAL VELOCITY',
        subtitle: 'DAY 04 / CONTRAST',
        date: '2026-09-11',
        cta: 'SWIPE FOR DETAILS',
        category: 'Visual Design',
        theme: 'High Contrast'
      },
      {
        id: 'row_05',
        title: 'OPTICAL KERNING TRUMPS MATHEMATICAL SPACING',
        subtitle: 'DAY 05 / MICRO-TYPE',
        date: '2026-09-12',
        cta: 'JOIN 30-DAY CHALLENGE',
        category: 'Typography',
        theme: 'Micro-Typography'
      },
      {
        id: 'row_06',
        title: 'LIMIT FONTS TO TWO FOR CLARITY AND RIGOR',
        subtitle: 'DAY 06 / FONT PAIRING',
        date: '2026-09-13',
        cta: 'SEE BEST PAIRINGS',
        category: 'Typography',
        theme: 'Editorial Pairings'
      }
    ]
  },
  {
    name: '10 Poster Principles (عشرة مبادئ لملصقات حديثة)',
    description: 'قواعد تصميم الملصقات الرقمية الترويجية وسريعة الانتشار.',
    rows: [
      {
        id: 'row_p1',
        title: 'ONE PRIMARY FOCAL POINT ANCHORS THE COMPOSITION',
        subtitle: 'PRINCIPLE 01 / HIERARCHY',
        date: '2026-09-14',
        cta: 'CHECK THE ANCHOR',
        category: 'Composition',
        theme: 'Visual Anchor'
      },
      {
        id: 'row_p2',
        title: 'RESTRICT ACCENT COLORS TO UNDER 10% OF SURFACE',
        subtitle: 'PRINCIPLE 02 / COLOR RULES',
        date: '2026-09-15',
        cta: 'VIEW PALETTE EXAMPLES',
        category: 'Color Theory',
        theme: 'Monochrome + Accent'
      },
      {
        id: 'row_p3',
        title: 'BODY COPY REQUIRES 1.5X OPTICAL LEADING',
        subtitle: 'PRINCIPLE 03 / READABILITY',
        date: '2026-09-16',
        cta: 'DOWNLOAD SPEC SHEET',
        category: 'Editorial',
        theme: 'Legibility'
      },
      {
        id: 'row_p4',
        title: 'GEOMETRIC ALIGNMENT BUILDS SUBCONSCIOUS TRUST',
        subtitle: 'PRINCIPLE 04 / MATHEMATICS',
        date: '2026-09-17',
        cta: 'JOIN MASTERCLASS',
        category: 'Layout Theory',
        theme: 'Geometric Rigor'
      }
    ]
  }
];

export const BulkProductionView: React.FC<BulkProductionViewProps> = ({
  project,
  onCommitBulkRecords,
  onNavigateToRecord
}) => {
  // Active sub-step in Bulk Production
  const [activeStep, setActiveStep] = useState<'data' | 'mapping' | 'preview' | 'export'>('data');

  // Working data rows
  const [rows, setRows] = useState<DataRow[]>(defaultDemoDatasets[0].rows);

  // Raw input modal states (CSV / JSON)
  const [showRawModal, setShowRawModal] = useState(false);
  const [rawFormat, setRawFormat] = useState<'csv' | 'json'>('csv');
  const [rawText, setRawText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Mapping Configuration
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    project.templates[0]?.id || 'tmpl_01'
  );
  const [targetVariation, setTargetVariation] = useState<
    'original' | 'var_a' | 'var_b' | 'var_c' | 'all'
  >('original');
  const [namingPattern, setNamingPattern] = useState<string>('{date}_{id}_{slug}');

  // Progress & Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTotal, setExportTotal] = useState(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [exportCompletedNotice, setExportCompletedNotice] = useState<string | null>(null);

  // Selected row for live preview
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  // Hidden canvas for generation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load predefined demo set
  const handleLoadDemo = (datasetIndex: number) => {
    setRows(defaultDemoDatasets[datasetIndex].rows);
    setSelectedPreviewIndex(0);
  };

  // Add a new manual row
  const handleAddRow = () => {
    const nextNum = rows.length + 1;
    const newRow: DataRow = {
      id: `row_${String(nextNum).padStart(2, '0')}`,
      title: `NEW HEADLINE NUMBER ${nextNum}`,
      subtitle: `DAY ${String(nextNum).padStart(2, '0')} / SUBTITLE`,
      date: new Date(Date.now() + 86400000 * (nextNum - 1)).toISOString().split('T')[0],
      cta: 'LEARN MORE TODAY',
      category: 'Design Theory',
      theme: 'Modern Series'
    };
    setRows([...rows, newRow]);
  };

  const handleUpdateRow = (id: string, field: keyof DataRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (selectedPreviewIndex >= rows.length - 1) {
      setSelectedPreviewIndex(Math.max(0, rows.length - 2));
    }
  };

  // Parse CSV or JSON raw input
  const handleImportRaw = () => {
    setParseError(null);
    if (!rawText.trim()) return;

    try {
      if (rawFormat === 'json') {
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed)) {
          throw new Error('يجب أن يكون ملف JSON مصفوفة من السجلات (Array of objects).');
        }
        const mappedRows: DataRow[] = parsed.map((item, idx) => ({
          id: item.id || `row_${idx + 1}`,
          title: String(item.title || item.Title || `Headline ${idx + 1}`),
          subtitle: String(item.subtitle || item.Subtitle || `SUBTITLE ${idx + 1}`),
          date: String(item.date || item.Date || new Date().toISOString().split('T')[0]),
          cta: String(item.cta || item.CTA || 'EXPLORE MORE'),
          category: String(item.category || item.Category || 'Design'),
          theme: String(item.theme || item.Theme || 'Standard')
        }));
        setRows(mappedRows);
        setShowRawModal(false);
        setRawText('');
      } else {
        // Parse CSV
        const lines = rawText.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('ملف CSV يجب أن يحتوي على سطر العناوين وسطر بيانات واحد على الأقل.');
        }
        const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

        const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('heading'));
        const subtitleIdx = headers.findIndex((h) => h.includes('sub') || h.includes('topic'));
        const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('day'));
        const ctaIdx = headers.findIndex((h) => h.includes('cta') || h.includes('action'));
        const categoryIdx = headers.findIndex((h) => h.includes('cat') || h.includes('series'));

        const parsedRows: DataRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
          parsedRows.push({
            id: `row_${i}`,
            title: titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : cols[0] || `Headline ${i}`,
            subtitle: subtitleIdx !== -1 && cols[subtitleIdx] ? cols[subtitleIdx] : `SUBTITLE ${i}`,
            date: dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0],
            cta: ctaIdx !== -1 && cols[ctaIdx] ? cols[ctaIdx] : 'DISCOVER MORE',
            category: categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx] : 'Editorial',
            theme: 'Imported Series'
          });
        }
        setRows(parsedRows);
        setShowRawModal(false);
        setRawText('');
      }
    } catch (err: any) {
      setParseError(err?.message || 'فشل استيراد وتحليل البيانات.');
    }
  };

  // Render a specific DataRow on the HTML5 Canvas and return data URL
  const renderRowToCanvas = (
    row: DataRow,
    variationType: 'original' | 'var_a' | 'var_b' | 'var_c'
  ): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Determine colors based on variation
    let bgColor = '#0F172A';
    let accentColor = '#E11D48';
    let isLight = false;

    if (variationType === 'var_a') {
      bgColor = '#F8FAFC';
      accentColor = '#020617';
      isLight = true;
    } else if (variationType === 'var_b') {
      bgColor = '#18181B';
      accentColor = '#F59E0B';
    } else if (variationType === 'var_c') {
      bgColor = '#090D16';
      accentColor = '#38BDF8';
    }

    const textColor = isLight ? '#0F172A' : '#F8FAFC';
    const subtextColor = isLight ? '#475569' : '#94A3B8';
    const borderColor = isLight ? '#CBD5E1' : '#334155';

    // 1. Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Precision Grid
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
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

    // 3. Top Accent Bar & System Coordinates
    ctx.fillStyle = accentColor;
    ctx.fillRect(80, 80, 160, 8);

    ctx.fillStyle = subtextColor;
    ctx.font = '700 18px "Space Grotesk", monospace';
    ctx.fillText(`${project.brand.name.toUpperCase()} // BULK ENGINE`, 80, 130);

    // Subtitle / Series Marker
    ctx.fillStyle = accentColor;
    ctx.font = '800 24px "Space Grotesk", sans-serif';
    ctx.fillText(row.subtitle.toUpperCase(), 80, 240);

    // 4. Main Headline with text wrap
    ctx.fillStyle = textColor;
    ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'top';

    const words = row.title.toUpperCase().split(' ');
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

    // 5. Call To Action Container
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(80, height - 200, width - 160, 90);

    ctx.fillStyle = textColor;
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.cta.toUpperCase(), 120, height - 155);

    // Arrow indicator
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(width - 130, height - 155, 18, 0, Math.PI * 2);
    ctx.fill();

    // 6. Bottom Metadata Line
    ctx.fillStyle = subtextColor;
    ctx.font = '500 16px "Space Grotesk", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`DATE: ${row.date}`, 80, height - 70);
    ctx.fillText(`VAR: ${variationType.toUpperCase()}`, width - 260, height - 70);

    return canvas.toDataURL('image/png');
  };

  // Convert DataRow into ContentRecord format for storing in project
  const convertRowToRecord = (row: DataRow): ContentRecord => {
    const variations: ContentVariation[] = [
      {
        id: 'original',
        name: 'Original',
        label: 'Default Brand Palette (Charcoal & Vermilion)',
        accentColor: '#E11D48',
        bgFill: '#0F172A',
        headingFont: 'Plus Jakarta Sans',
        title: row.title,
        subtitle: row.subtitle,
        cta: row.cta
      },
      {
        id: 'var_a',
        name: 'Variation A',
        label: 'Editorial Warm High-Contrast (Paper White & Noir)',
        accentColor: '#020617',
        bgFill: '#F8FAFC',
        headingFont: 'Syne',
        title: row.title,
        subtitle: row.subtitle,
        cta: row.cta
      },
      {
        id: 'var_b',
        name: 'Variation B',
        label: 'Electric Amber Experimental (Dark Luxury)',
        accentColor: '#F59E0B',
        bgFill: '#18181B',
        headingFont: 'Space Grotesk',
        title: row.title,
        subtitle: row.subtitle,
        cta: row.cta
      },
      {
        id: 'var_c',
        name: 'Variation C',
        label: 'Brutalist Monospaced (Cobalt Tension)',
        accentColor: '#38BDF8',
        bgFill: '#090D16',
        headingFont: 'Inter',
        title: row.title,
        subtitle: row.subtitle,
        cta: row.cta
      }
    ];

    return {
      id: `bulk_${row.id}_${Date.now().toString().slice(-4)}`,
      title: row.title,
      subtitle: row.subtitle,
      cta: row.cta,
      date: row.date,
      category: row.category,
      theme: row.theme,
      style: 'Editorial',
      templateId: selectedTemplateId,
      brandId: project.brand.id,
      format: 'Instagram-Post',
      status: 'Ready',
      caption: `${row.title}\n\n${row.subtitle}\n\n#ContentForge #BatchProduction #GraphicDesign`,
      hashtags: ['#ContentForge', '#BatchProduction', '#DesignSystem'],
      activeVariationId: targetVariation === 'all' ? 'original' : targetVariation,
      variations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Batch Export as a Single ZIP File using JSZip
  const handleBatchExportZip = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const variationList: ('original' | 'var_a' | 'var_b' | 'var_c')[] =
      targetVariation === 'all' ? ['original', 'var_a', 'var_b', 'var_c'] : [targetVariation];

    const totalGenerations = rows.length * variationList.length;
    setExportTotal(totalGenerations);

    const zip = new JSZip();
    const folder = zip.folder('contentforge_bulk_export');

    let completed = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (const varId of variationList) {
        setExportStatusText(`توليد التصميم ${completed + 1} من ${totalGenerations}: [${row.id}] ${varId}...`);

        const dataUrl = renderRowToCanvas(row, varId);
        // Extract base64 part
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

        // Slugify title
        const slug = row.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 24);

        const fileName = `${row.date}_${row.id}_${varId}_${slug}.png`;
        folder?.file(fileName, base64Data, { base64: true });

        completed++;
        setExportProgress(completed);

        // Small timeout to allow UI rendering progress
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }

    setExportStatusText('جاري ضغط وتحزيم الملفات داخل أرشيف ZIP...');
    const content = await zip.generateAsync({ type: 'blob' });

    // Download ZIP
    const zipName = `contentforge_batch_${new Date().toISOString().split('T')[0]}_${rows.length}items.zip`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = zipName;
    link.click();

    setIsExporting(false);
    setExportCompletedNotice(
      `تم بنجاح تصدير وتحميل الحزمة بالكامل (${totalGenerations} صورة عالية الدقة) في ملف: ${zipName}`
    );
    setTimeout(() => setExportCompletedNotice(null), 6000);
  };

  // Add all generated rows into Content Library / Calendar
  const handleAddToProject = () => {
    const records = rows.map(convertRowToRecord);
    onCommitBulkRecords(records);
    setExportCompletedNotice(`تم إضافة ${records.length} منشوراً تلقائياً إلى مكتبة المحتوى والتقويم!`);
    setTimeout(() => setExportCompletedNotice(null), 5000);
  };

  const activeRowForPreview = rows[selectedPreviewIndex] || rows[0];

  return (
    <div id="bulk-production-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Hidden canvas for off-screen batch rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <span>التوليد والإنتاج الدفعي • Bulk Production</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Phase 3: استيراد البيانات المنظمة (CSV, JSON, جداول يدوية)، وربط المتغيرات، وتوليد وتصدير العشرات من التصميمات دفعة واحدة.
          </p>
        </div>

        {/* Step Tabs Navigation */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveStep('data')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeStep === 'data'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. البيانات (Data)
          </button>
          <button
            onClick={() => setActiveStep('mapping')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeStep === 'mapping'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. الربط والقالب (Mapping)
          </button>
          <button
            onClick={() => setActiveStep('preview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeStep === 'preview'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. المعاينة الحية (Batch Preview)
          </button>
          <button
            onClick={() => setActiveStep('export')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeStep === 'export'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. التصدير الدفعي (Batch Export)
          </button>
        </div>
      </div>

      {exportCompletedNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportCompletedNotice}</span>
        </div>
      )}

      {/* STEP 1: DATA SOURCE & SPREADSHEET */}
      {activeStep === 'data' && (
        <div className="space-y-4">
          {/* Quick actions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">سلاسل جاهزة (Presets):</span>
              <button
                onClick={() => handleLoadDemo(0)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
              >
                سلسلة التايبوجرافي (6 سجلات)
              </button>
              <button
                onClick={() => handleLoadDemo(1)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
              >
                مبادئ الملصقات (4 سجلات)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRawFormat('csv');
                  setShowRawModal(true);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>استيراد CSV / Text</span>
              </button>

              <button
                onClick={() => {
                  setRawFormat('json');
                  setShowRawModal(true);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>استيراد JSON</span>
              </button>

              <button
                onClick={handleAddRow}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سطر جديد</span>
              </button>
            </div>
          </div>

          {/* Interactive Spreadsheet Table */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-500" />
                <span>جدول البيانات التفاعلي • Total Records ({rows.length})</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                انقر على أي خلية للتعديل الفوري
              </span>
            </div>

            <div className="overflow-x-auto max-h-[440px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-mono sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 w-16 text-center"># ID</th>
                    <th className="p-2.5 w-72">TITLE (العنوان الرئيسي)</th>
                    <th className="p-2.5 w-48">SUBTITLE (العنوان الفرعي)</th>
                    <th className="p-2.5 w-32">DATE (التاريخ)</th>
                    <th className="p-2.5 w-44">CTA (الدعوة لإجراء)</th>
                    <th className="p-2.5 w-32">CATEGORY</th>
                    <th className="p-2.5 w-12 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="p-2 text-center text-slate-500">{row.id}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => handleUpdateRow(row.id, 'title', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-950/60 focus:bg-slate-950 px-2 py-1 rounded border border-transparent focus:border-rose-500/50 text-slate-100 font-semibold focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.subtitle}
                          onChange={(e) => handleUpdateRow(row.id, 'subtitle', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-950/60 focus:bg-slate-950 px-2 py-1 rounded border border-transparent focus:border-rose-500/50 text-slate-300 focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => handleUpdateRow(row.id, 'date', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-950/60 focus:bg-slate-950 px-1 py-1 rounded border border-transparent focus:border-rose-500/50 text-slate-300 focus:outline-none text-[10px]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.cta}
                          onChange={(e) => handleUpdateRow(row.id, 'cta', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-950/60 focus:bg-slate-950 px-2 py-1 rounded border border-transparent focus:border-rose-500/50 text-slate-300 focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.category}
                          onChange={(e) => handleUpdateRow(row.id, 'category', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-950/60 focus:bg-slate-950 px-2 py-1 rounded border border-transparent focus:border-rose-500/50 text-slate-400 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                          title="حذف هذا السطر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                جاهز للمتابعة إلى الخطوة التالية (ربط المتغيرات وتحديد القالب).
              </span>
              <button
                onClick={() => setActiveStep('mapping')}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>متابعة: ربط القالب والمتغيرات</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: VARIABLE MAPPING & CONFIGURATION */}
      {activeStep === 'mapping' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-rose-500" />
              <span>ربط أعمدة الجدول بمتغيرات القالب</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono font-medium">
                  متغير العنوان الرئيسي: {`{{TITLE}}`}
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-200 font-mono">عمود: TITLE</span>
                  <span className="text-[10px] text-emerald-400 font-mono">مرتبط بنجاح (Mapped)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono font-medium">
                  متغير العنوان الفرعي: {`{{SUBTITLE}}`}
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-200 font-mono">عمود: SUBTITLE</span>
                  <span className="text-[10px] text-emerald-400 font-mono">مرتبط بنجاح (Mapped)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono font-medium">
                  متغير الدعوة لإجراء: {`{{CTA}}`}
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-200 font-mono">عمود: CTA</span>
                  <span className="text-[10px] text-emerald-400 font-mono">مرتبط بنجاح (Mapped)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono font-medium">
                  متغير التاريخ والجدولة: {`{{DATE}}`}
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-200 font-mono">عمود: DATE</span>
                  <span className="text-[10px] text-emerald-400 font-mono">مرتبط بنجاح (Mapped)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>إعدادات القالب والنسخ البديلة (Target Config)</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">القالب المستهدف للتوليد</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
                >
                  {project.templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.format} - {tmpl.width}x{tmpl.height})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">الأسلوب البصري المستهدف (Variation Target)</label>
                <select
                  value={targetVariation}
                  onChange={(e) => setTargetVariation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
                >
                  <option value="original">النسخة الأساسية الأصلية (Original - Charcoal & Rose)</option>
                  <option value="var_a">Variation A (Editorial High-Contrast Paper White)</option>
                  <option value="var_b">Variation B (Electric Amber Dark Luxury)</option>
                  <option value="var_c">Variation C (Brutalist Monospaced Cobalt)</option>
                  <option value="all">توليد كافة النسخ الأربعة لكل سطر (All 4 Variations)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">قاعدة تسمية الملفات الناتجة (Naming Rule)</label>
                <input
                  type="text"
                  value={namingPattern}
                  onChange={(e) => setNamingPattern(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono text-xs focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  مثال: {'{date}_{id}_{slug}.png'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveStep('preview')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>معاينة الدفعة (Go to Batch Preview)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: LIVE BATCH PREVIEW */}
      {activeStep === 'preview' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left list of items */}
            <div className="md:w-1/2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">
                  سجلات الدفعة ({rows.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  انقر على أي عنصر لمعاينته حياً
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {rows.map((row, idx) => (
                  <button
                    key={row.id}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer block ${
                      selectedPreviewIndex === idx
                        ? 'bg-slate-800 border-rose-500 ring-1 ring-rose-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-rose-400 font-bold">
                        #{row.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {row.date}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {row.title}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {row.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Live Render Preview */}
            <div className="md:w-1/2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-rose-400" />
                    <span>المعاينة البصرية المباشرة • Live Canvas</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeRowForPreview.id}
                  </span>
                </div>

                {/* Live Card Preview Box */}
                <div className="w-full aspect-square rounded-lg border border-slate-800 bg-slate-950 text-slate-100 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="w-20 h-1.5 rounded-full bg-rose-600" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase">
                        {activeRowForPreview.subtitle}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        BULK-SYSTEM
                      </span>
                    </div>
                  </div>

                  <div className="my-auto py-3">
                    <h3 className="text-base font-black leading-tight tracking-tight uppercase text-slate-100">
                      {activeRowForPreview.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded border border-slate-800 bg-slate-900/80 flex items-center justify-between text-[10px] font-bold text-slate-200">
                      <span>{activeRowForPreview.cta}</span>
                      <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[9px] text-white">
                        →
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/70">
                      <span>{project.brand.name}</span>
                      <span className="font-mono">{activeRowForPreview.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  تم التحقق من تطابق كافة المتغيرات.
                </span>
                <button
                  onClick={() => setActiveStep('export')}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>جاهز للتوليد والتصدير</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: BATCH GENERATION & EXPORT */}
      {activeStep === 'export' && (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Archive className="w-5 h-5 text-rose-500" />
              <span>محرك التصدير والتوليد الدفعي • Batch Export Engine</span>
            </h3>
            <p className="text-xs text-slate-400">
              توليد ملفات الصور بدقة 1080×1080 بيكسل مباشرة بدون خوادم وسيطة، وتنزيلها كحزمة مضغوطة (.ZIP) أو دمجها في جدول النشر والتقويم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500">إجمالي السجلات</span>
              <p className="text-2xl font-bold font-mono text-slate-100">{rows.length}</p>
              <span className="text-[11px] text-slate-400">سجل في جدول البيانات</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500">الأسلوب البصري المحدد</span>
              <p className="text-lg font-bold text-rose-400 uppercase">
                {targetVariation === 'all' ? 'All (4 Variations)' : targetVariation}
              </p>
              <span className="text-[11px] text-slate-400">
                {targetVariation === 'all' ? `${rows.length * 4} صورة` : `${rows.length} صورة`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500">صيغة التصدير</span>
              <p className="text-lg font-bold text-sky-400">PNG 1080×1080</p>
              <span className="text-[11px] text-slate-400">مضغوطة داخل أرشيف ZIP</span>
            </div>
          </div>

          {/* Progress Bar if exporting */}
          {isExporting && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-rose-500/40 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{exportStatusText}</span>
                </span>
                <span className="text-slate-200 font-bold">
                  {exportProgress} / {exportTotal} ({Math.round((exportProgress / exportTotal) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${Math.round((exportProgress / exportTotal) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleBatchExportZip}
              disabled={isExporting}
              className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>توليد وتنزيل الحزمة كاملة كملف ZIP (Download All as ZIP)</span>
            </button>

            <button
              onClick={handleAddToProject}
              disabled={isExporting}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>إدراج السجلات في مكتبة المحتوى والتقويم (Add to Calendar)</span>
            </button>
          </div>
        </div>
      )}

      {/* Raw Data Input Modal (CSV / JSON) */}
      {showRawModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {rawFormat === 'csv' ? (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                ) : (
                  <FileCode className="w-4 h-4 text-sky-400" />
                )}
                <span>
                  {rawFormat === 'csv' ? 'استيراد بيانات من CSV / TSV' : 'استيراد بيانات من كود JSON'}
                </span>
              </h3>
              <button
                onClick={() => setShowRawModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                إلغاء
              </button>
            </div>

            {parseError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <p className="text-slate-400">
                {rawFormat === 'csv'
                  ? 'الصق أسطر CSV مفصولة بفواصل أو فواصل منقوطة، مع سطر العناوين الأول:'
                  : 'الصق مصفوفة JSON تحتوي على كائنات بها حقول title و subtitle و date و cta:'}
              </p>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  rawFormat === 'csv'
                    ? 'title,subtitle,date,cta\nTypography Rules,Day 01,2026-09-08,Learn More\nGrid Systems,Day 02,2026-09-09,Explore'
                    : '[\n  {\n    "title": "Typography Rules",\n    "subtitle": "Day 01",\n    "date": "2026-09-08",\n    "cta": "Learn More"\n  }\n]'
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => setShowRawModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                إغلاق
              </button>
              <button
                onClick={handleImportRaw}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold"
              >
                تحليل واستيراد البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
