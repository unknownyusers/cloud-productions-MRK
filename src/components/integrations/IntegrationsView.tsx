import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Smartphone,
  Monitor,
  Maximize2,
  Send,
  Webhook,
  Sparkles,
  Copy,
  Check,
  Download,
  FileCode,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  ChevronDown,
  Globe,
  Radio,
  FileText,
  Printer
} from 'lucide-react';
import JSZip from 'jszip';
import { Project, ContentRecord, WebhookConfig, WebhookLog } from '../../types';

interface IntegrationsViewProps {
  project: Project;
  onUpdateRecord: (record: ContentRecord) => void;
  onNavigateTab?: (tab: string) => void;
}

interface SocialFormatDef {
  id: string;
  name: string;
  platform: 'Instagram' | 'LinkedIn' | 'TikTok / Stories' | 'Twitter / X' | 'Pinterest';
  aspectRatio: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
  safeMarginTop: number;
  safeMarginBottom: number;
  description: string;
}

const socialFormats: SocialFormatDef[] = [
  {
    id: 'ig_square',
    name: 'Instagram Square Post',
    platform: 'Instagram',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    icon: Monitor,
    safeMarginTop: 60,
    safeMarginBottom: 60,
    description: 'المنشور المربع القياسي عالي الدقة (Feed Post).'
  },
  {
    id: 'ig_story',
    name: 'Story & TikTok Vertical',
    platform: 'TikTok / Stories',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    icon: Smartphone,
    safeMarginTop: 180,
    safeMarginBottom: 220,
    description: 'قصص إنستغرام، تيك توك، ريلز ويوتيوب شورتس.'
  },
  {
    id: 'li_landscape',
    name: 'LinkedIn / X Landscape',
    platform: 'LinkedIn',
    aspectRatio: '16:9',
    width: 1200,
    height: 675,
    icon: Monitor,
    safeMarginTop: 50,
    safeMarginBottom: 50,
    description: 'الأبعاد القياسية للمنشورات الأفقية على لينكدإن وتويتر.'
  },
  {
    id: 'li_portrait',
    name: 'LinkedIn Carousel / Portrait',
    platform: 'LinkedIn',
    aspectRatio: '4:5',
    width: 1080,
    height: 1350,
    icon: Smartphone,
    safeMarginTop: 70,
    safeMarginBottom: 70,
    description: 'النسبة المثالية لشرائح مستندات لينكدإن وكاروسيل إنستغرام.'
  },
  {
    id: 'pin_tall',
    name: 'Pinterest Vertical Pin',
    platform: 'Pinterest',
    aspectRatio: '2:3',
    width: 1000,
    height: 1500,
    icon: Smartphone,
    safeMarginTop: 80,
    safeMarginBottom: 80,
    description: 'منشورات بنترست العمودية عالية الانتشار وجذب النقرات.'
  }
];

const defaultWebhooks: WebhookConfig[] = [
  {
    id: 'wh_zapier',
    name: 'Zapier Social Auto-Publisher',
    url: 'https://hooks.zapier.com/hooks/catch/sample/contentforge/',
    enabled: true,
    events: ['on_ready', 'on_publish'],
    preset: 'zapier'
  },
  {
    id: 'wh_discord',
    name: 'Discord Design Alerts',
    url: 'https://discord.com/api/webhooks/sample/channel/cf_feed',
    enabled: true,
    events: ['on_ready'],
    preset: 'discord'
  },
  {
    id: 'wh_slack',
    name: 'Slack Team Editorial Review',
    url: 'https://hooks.slack.com/services/sample/team/review',
    enabled: false,
    events: ['on_publish'],
    preset: 'slack'
  }
];

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  project,
  onUpdateRecord
}) => {
  // Navigation within Phase 4
  const [activeTab, setActiveTab] = useState<'adaptor' | 'webhooks' | 'copilot' | 'database' | 'vector'>('adaptor');

  // Selected Content Record
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    project.records[0]?.id || ''
  );

  const selectedRecord = project.records.find((r) => r.id === selectedRecordId) || project.records[0];

  // Channel Adaptor state
  const [selectedFormatId, setSelectedFormatId] = useState<string>('ig_square');
  const activeFormat = socialFormats.find((f) => f.id === selectedFormatId) || socialFormats[0];

  // Hidden Canvas for export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(defaultWebhooks);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [lastDispatchResult, setLastDispatchResult] = useState<any | null>(null);

  // AI Copilot state
  const [copilotTone, setCopilotTone] = useState<'minimal' | 'engaging' | 'educational' | 'conversion'>('minimal');
  const [copilotLanguage, setCopilotLanguage] = useState<'ar' | 'en'>('ar');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    hook: string;
    caption: string;
    hashtags: string[];
    source?: string;
  } | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Vector & Copy Image states
  const [svgCopied, setSvgCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Render graphic onto canvas with custom dimension and safe zones
  const renderAdaptedGraphic = (format: SocialFormatDef): string => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedRecord) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = format.width;
    canvas.height = format.height;

    // Get variation colors
    const activeVar = selectedRecord.variations.find((v) => v.id === selectedRecord.activeVariationId) || selectedRecord.variations[0];
    const bgColor = activeVar?.bgFill || '#0F172A';
    const accentColor = activeVar?.accentColor || '#E11D48';
    const isLight = bgColor === '#F8FAFC' || bgColor === '#FFFFFF';
    const textColor = isLight ? '#0F172A' : '#F8FAFC';
    const subtextColor = isLight ? '#475569' : '#94A3B8';
    const borderColor = isLight ? '#CBD5E1' : '#334155';

    // 1. Fill Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, format.width, format.height);

    // 2. Subtle Precision Grid
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    const gridStep = Math.round(format.width / 18);
    for (let x = 0; x <= format.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, format.height);
      ctx.stroke();
    }
    for (let y = 0; y <= format.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(format.width, y);
      ctx.stroke();
    }

    // 3. Margin bounds
    const paddingX = Math.round(format.width * 0.08);
    const topY = format.safeMarginTop + 40;
    const availableHeight = format.height - format.safeMarginTop - format.safeMarginBottom;

    // 4. Brand & Channel Watermark Header
    ctx.fillStyle = accentColor;
    ctx.fillRect(paddingX, topY, 120, 6);

    ctx.fillStyle = subtextColor;
    ctx.font = '700 16px "Space Grotesk", monospace';
    ctx.fillText(`${project.brand.name.toUpperCase()} // ${format.platform.toUpperCase()}`, paddingX, topY + 45);

    // 5. Subtitle & Category
    ctx.fillStyle = accentColor;
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText((selectedRecord.subtitle || 'SERIES ISSUE').toUpperCase(), paddingX, topY + 110);

    // 6. Main Headline wrapped
    ctx.fillStyle = textColor;
    const baseFontSize = format.aspectRatio === '9:16' ? 58 : format.aspectRatio === '16:9' ? 52 : 62;
    ctx.font = `900 ${baseFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textBaseline = 'top';

    const words = (selectedRecord.title || '').toUpperCase().split(' ');
    let line = '';
    let currY = topY + 160;
    const maxWidth = format.width - (paddingX * 2);
    const lineHeight = baseFontSize * 1.25;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, paddingX, currY);
        line = words[i] + ' ';
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, paddingX, currY);

    // 7. CTA Container
    const ctaY = format.height - format.safeMarginBottom - 110;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(paddingX, ctaY, format.width - (paddingX * 2), 76);

    ctx.fillStyle = textColor;
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText((selectedRecord.cta || 'EXPLORE NOW').toUpperCase(), paddingX + 30, ctaY + 38);

    // Arrow indicator
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(format.width - paddingX - 38, ctaY + 38, 15, 0, Math.PI * 2);
    ctx.fill();

    // 8. Bottom Meta
    ctx.fillStyle = subtextColor;
    ctx.font = '500 14px "Space Grotesk", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`DATE: ${selectedRecord.date}`, paddingX, format.height - format.safeMarginBottom + 20);
    ctx.fillText(`FMT: ${format.aspectRatio}`, format.width - paddingX - 100, format.height - format.safeMarginBottom + 20);

    return canvas.toDataURL('image/png');
  };

  // Download Single Adapted Format
  const handleDownloadFormat = (format: SocialFormatDef) => {
    const dataUrl = renderAdaptedGraphic(format);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${selectedRecord.date}_${format.id}_${selectedRecord.id}.png`;
    link.click();
  };

  // Batch Export All 5 Formats into a single ZIP
  const handleBatchExportAllFormats = async () => {
    setIsExportingAll(true);
    const zip = new JSZip();
    const folder = zip.folder(`contentforge_${selectedRecord.id}_all_formats`);

    for (const fmt of socialFormats) {
      const dataUrl = renderAdaptedGraphic(fmt);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      folder?.file(`${selectedRecord.date}_${fmt.id}_${fmt.aspectRatio.replace(':', 'x')}.png`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `contentforge_${selectedRecord.id}_5_channel_formats.zip`;
    link.click();
    setIsExportingAll(false);
  };

  // Copy Image Blob Directly to Clipboard
  const handleCopyImageToClipboard = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      renderAdaptedGraphic(activeFormat);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Standard Clipboard API for Image blob
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setImageCopied(true);
          setTimeout(() => setImageCopied(false), 3000);
        } catch (err) {
          // Fallback if browser permission restricts write
          console.warn('Clipboard image write failed, downloading instead:', err);
          handleDownloadFormat(activeFormat);
        }
      }, 'image/png');
    } catch (e) {
      console.error(e);
    }
  };

  // Generate AI Caption using Server-side API route
  const handleGenerateAICaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const response = await fetch('/api/integrations/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedRecord.title,
          subtitle: selectedRecord.subtitle,
          category: selectedRecord.category,
          theme: selectedRecord.theme,
          tone: copilotTone,
          language: copilotLanguage
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setGeneratedResult({
          hook: data.data.hook,
          caption: data.data.caption,
          hashtags: data.data.hashtags || ['#GraphicDesign', '#SwissDesign', '#Typography'],
          source: data.source
        });
      }
    } catch (err) {
      console.error('Caption generation error:', err);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Apply Generated Caption & Hashtags to the Record
  const handleApplyCaptionToRecord = () => {
    if (!generatedResult || !selectedRecord) return;
    const updated: ContentRecord = {
      ...selectedRecord,
      caption: generatedResult.caption,
      hashtags: generatedResult.hashtags,
      updatedAt: new Date().toISOString()
    };
    onUpdateRecord(updated);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
  };

  // Test Dispatch Webhook via Server Route
  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhookId(webhook.id);
    setLastDispatchResult(null);

    const payload = {
      event: 'on_ready',
      timestamp: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        brand: project.brand.name
      },
      record: {
        id: selectedRecord.id,
        title: selectedRecord.title,
        subtitle: selectedRecord.subtitle,
        cta: selectedRecord.cta,
        date: selectedRecord.date,
        category: selectedRecord.category,
        format: selectedRecord.format,
        caption: selectedRecord.caption,
        hashtags: selectedRecord.hashtags
      }
    };

    try {
      const res = await fetch('/api/integrations/webhook/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhook.url,
          payload,
          headers: webhook.secretHeader ? { 'X-ContentForge-Secret': webhook.secretHeader } : {}
        })
      });

      const data = await res.json();
      setLastDispatchResult({
        webhookName: webhook.name,
        url: webhook.url,
        status: data.status,
        statusText: data.statusText,
        latencyMs: data.latencyMs,
        success: data.success,
        body: data.body
      });

      const newLog: WebhookLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        webhookName: webhook.name,
        status: data.status,
        statusText: data.statusText,
        latencyMs: data.latencyMs,
        recordTitle: selectedRecord.title,
        success: data.success
      };
      setWebhookLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    } catch (e: any) {
      setLastDispatchResult({
        webhookName: webhook.name,
        url: webhook.url,
        status: 0,
        statusText: e?.message || 'Dispatch error',
        latencyMs: 0,
        success: false
      });
    } finally {
      setTestingWebhookId(null);
    }
  };

  // Export Notion Database CSV
  const handleExportNotionCsv = () => {
    const headers = ['ID', 'Name', 'Subtitle', 'Date', 'Status', 'Category', 'Format', 'Caption', 'Hashtags'];
    const rows = project.records.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.subtitle.replace(/"/g, '""')}"`,
      r.date,
      r.status,
      r.category,
      r.format,
      `"${(r.caption || '').replace(/"/g, '""')}"`,
      `"${r.hashtags.join(' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contentforge_notion_calendar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export Buffer Bulk Schedule CSV
  const handleExportBufferCsv = () => {
    const headers = ['Date', 'Time', 'Text'];
    const rows = project.records.map((r) => [
      r.date,
      '14:00',
      `"${(r.title + '\n\n' + (r.caption || '') + '\n\n' + r.hashtags.join(' ')).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buffer_bulk_schedule_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Generate Clean SVG Vector Code
  const generateSvgCode = (): string => {
    if (!selectedRecord) return '';
    const activeVar = selectedRecord.variations.find((v) => v.id === selectedRecord.activeVariationId) || selectedRecord.variations[0];
    const bg = activeVar?.bgFill || '#0F172A';
    const accent = activeVar?.accentColor || '#E11D48';
    const isLight = bg === '#F8FAFC' || bg === '#FFFFFF';
    const fg = isLight ? '#0F172A' : '#F8FAFC';
    const sub = isLight ? '#475569' : '#94A3B8';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <rect width="1080" height="1080" fill="${bg}" />
  <rect x="80" y="80" width="140" height="8" fill="${accent}" />
  <text x="80" y="130" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700" fill="${sub}">${project.brand.name.toUpperCase()} // VECTOR ARCHITECTURE</text>
  <text x="80" y="240" font-family="'Space Grotesk', sans-serif" font-size="22" font-weight="800" fill="${accent}">${selectedRecord.subtitle.toUpperCase()}</text>
  <text x="80" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-size="64" font-weight="900" fill="${fg}">${selectedRecord.title.toUpperCase()}</text>
  <rect x="80" y="880" width="920" height="80" fill="none" stroke="${sub}" stroke-width="1" />
  <text x="120" y="930" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="${fg}">${selectedRecord.cta.toUpperCase()}</text>
  <text x="80" y="1010" font-family="'Space Grotesk', monospace" font-size="14" fill="${sub}">DATE: ${selectedRecord.date}</text>
  <text x="880" y="1010" font-family="'Space Grotesk', monospace" font-size="14" fill="${sub}">CONTENTFORGE</text>
</svg>`;
  };

  const currentSvg = generateSvgCode();

  // Handle SVG download
  const handleDownloadSvg = () => {
    const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedRecord.date}_${selectedRecord.id}_vector.svg`;
    link.click();
  };

  return (
    <div id="integrations-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Hidden canvas for multi-format raster rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top Header & Record Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <span>مركز التكاملات والتصدير المتعدد • Integrations & Export Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Phase 4: محول أبعاد المنصات الذكي، أتمتة الـ Webhooks، تزامن قواعد Notion و Buffer، ومساعد الصياغة والوسوم.
          </p>
        </div>

        {/* Selected Record Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-lg">
          <span className="text-xs text-slate-400 shrink-0 font-medium px-1">المنشور المستهدف:</span>
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-rose-500 max-w-xs"
          >
            {project.records.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.date} — {rec.title.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('adaptor')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'adaptor'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>محول المنصات والأبعاد (Channels Adaptor)</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'copilot'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>مساعد الصياغة والوسوم (AI Copilot)</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'webhooks'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>أتمتة النشر والويب هوك (Webhooks)</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'database'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>تزامن Notion & Buffer (Database Sync)</span>
        </button>

        <button
          onClick={() => setActiveTab('vector')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'vector'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>التصدير المتجهي والطباعي (Vector & Print)</span>
        </button>
      </div>

      {/* SUB-TAB 1: MULTI-CHANNEL FORMAT ADAPTOR */}
      {activeTab === 'adaptor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Options & Channel Selector */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-200 block pb-2 border-b border-slate-800">
                  اختر المنصة والنسبة البصرية
                </span>

                <div className="space-y-2">
                  {socialFormats.map((fmt) => {
                    const isSelected = selectedFormatId === fmt.id;
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormatId(fmt.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-rose-500 ring-1 ring-rose-500/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-100">{fmt.name}</p>
                            <p className="text-[10px] text-slate-400">{fmt.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold text-rose-400 block">{fmt.aspectRatio}</span>
                          <span className="text-[9px] font-mono text-slate-500">{fmt.width}×{fmt.height}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-200 block pb-2 border-b border-slate-800">
                  خيارات التصدير والحفظ
                </span>

                <button
                  onClick={() => handleDownloadFormat(activeFormat)}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل أبعاد {activeFormat.aspectRatio} (PNG عالي الدقة)</span>
                </button>

                <button
                  onClick={handleBatchExportAllFormats}
                  disabled={isExportingAll}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isExportingAll ? <RefreshCw className="w-4 h-4 animate-spin text-rose-400" /> : <Layers className="w-4 h-4 text-emerald-400" />}
                  <span>{isExportingAll ? 'جاري تحزيم الـ ZIP...' : 'تحميل جميع المنصات الـ 5 كملف ZIP'}</span>
                </button>

                <button
                  onClick={handleCopyImageToClipboard}
                  className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {imageCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                  <span>{imageCopied ? 'تم نسخ الصورة إلى الحافظة!' : 'نسخ الصورة إلى الحافظة (Direct Clipboard)'}</span>
                </button>
              </div>
            </div>

            {/* Right Stage: Live Responsive Canvas Simulation */}
            <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-rose-400" />
                  <span>معاينة حية للمقاس: {activeFormat.name} ({activeFormat.aspectRatio})</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {activeFormat.width}px × {activeFormat.height}px
                </span>
              </div>

              {/* Dynamic Responsive Frame */}
              <div
                className="rounded-xl border border-slate-700/80 shadow-2xl p-6 relative flex flex-col justify-between overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  width: activeFormat.aspectRatio === '9:16' ? '300px' : activeFormat.aspectRatio === '16:9' ? '540px' : activeFormat.aspectRatio === '2:3' ? '330px' : activeFormat.aspectRatio === '4:5' ? '360px' : '400px',
                  height: activeFormat.aspectRatio === '9:16' ? '533px' : activeFormat.aspectRatio === '16:9' ? '304px' : activeFormat.aspectRatio === '2:3' ? '495px' : activeFormat.aspectRatio === '4:5' ? '450px' : '400px'
                }}
              >
                {/* Safe Margins Guide Indicator */}
                <div className="absolute inset-x-0 top-0 h-4 border-b border-dashed border-rose-500/20 pointer-events-none flex items-center justify-end px-2 text-[8px] font-mono text-rose-400/40">
                  SAFE ZONE TOP
                </div>
                <div className="absolute inset-x-0 bottom-0 h-4 border-t border-dashed border-rose-500/20 pointer-events-none flex items-center justify-end px-2 text-[8px] font-mono text-rose-400/40">
                  SAFE ZONE BOTTOM
                </div>

                <div className="space-y-2">
                  <div className="w-16 h-1 rounded-full bg-rose-600" />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-rose-400 uppercase">
                      {selectedRecord.subtitle}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">
                      {activeFormat.platform}
                    </span>
                  </div>
                </div>

                <div className="my-auto py-2">
                  <h3 className="text-sm md:text-base font-black leading-tight tracking-tight uppercase line-clamp-3">
                    {selectedRecord.title}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="p-2 rounded border border-slate-800 bg-slate-900/80 flex items-center justify-between text-[9px] font-bold">
                    <span>{selectedRecord.cta}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center text-[8px] text-white">
                      →
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800/70">
                    <span>{project.brand.name}</span>
                    <span>{selectedRecord.date}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 text-center">
                يتم حساب الهوامش الآمنة تلقائياً لكل منصة لمنع اقتطاع النصوص بواسطة أزرار الإعجاب أو عناصر واجهة المستخدم الخاصة بالتطبيق.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI CAPTION & HASHTAG COPILOT */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>إعدادات مساعد الصياغة الذكي (AI Copilot)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">الأسلوب ونبرة الصوت (Editorial Archetype)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'minimal', label: 'موجز سويسري صارم' },
                    { id: 'educational', label: 'قواعد تعليمية محكمة' },
                    { id: 'engaging', label: 'قصة وسؤال تفاعلي' },
                    { id: 'conversion', label: 'دعوة مباشرة للحفظ والنشر' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCopilotTone(t.id as any)}
                      className={`p-2 rounded text-left border transition-all cursor-pointer ${
                        copilotTone === t.id
                          ? 'bg-rose-600/20 border-rose-500 text-rose-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">لغة المحتوى</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCopilotLanguage('ar')}
                    className={`flex-1 py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                      copilotLanguage === 'ar'
                        ? 'bg-slate-800 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    العربية المعاصرة (Modern Arabic)
                  </button>
                  <button
                    onClick={() => setCopilotLanguage('en')}
                    className={`flex-1 py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                      copilotLanguage === 'en'
                        ? 'bg-slate-800 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    English (Editorial Precision)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono">سجل التصميم المختار</span>
                <p className="text-xs font-bold text-slate-200 line-clamp-1">{selectedRecord.title}</p>
                <p className="text-[10px] text-slate-400 font-mono">{selectedRecord.subtitle}</p>
              </div>

              <button
                onClick={handleGenerateAICaption}
                disabled={isGeneratingCaption}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isGeneratingCaption ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGeneratingCaption ? 'جاري الصياغة...' : 'توليد الكابشن والوسوم الآن'}</span>
              </button>
            </div>
          </div>

          {/* Generated Result Display */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>النص المُولد (Caption & Hashtags Output)</span>
                </span>
                {generatedResult?.source && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Engine: {generatedResult.source}
                  </span>
                )}
              </div>

              {appliedNotice && (
                <div className="mb-3 p-2 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>تم بنجاح تحديث الكابشن والوسوم لسجل التصميم الحالي في قاعدة البيانات!</span>
                </div>
              )}

              {generatedResult ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 font-bold">
                    {generatedResult.hook}
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
                    {generatedResult.caption}
                  </div>

                  {/* Hashtag chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {generatedResult.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-rose-300 px-2 py-0.5 rounded transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs">اضغط على زر التوليد لصياغة كابشن مخصص ومتوافق مع الهوية البصرية ونبرة الصوت المطلوبة.</p>
                </div>
              )}
            </div>

            {generatedResult && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${generatedResult.caption}\n\n${generatedResult.hashtags.join(' ')}`
                    );
                    setCaptionCopied(true);
                    setTimeout(() => setCaptionCopied(false), 2000);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {captionCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{captionCopied ? 'تم النسخ!' : 'نسخ الكابشن والوسوم'}</span>
                </button>

                <button
                  onClick={handleApplyCaptionToRecord}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تطبيق على المنشور الحالي (Apply to Record)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WEBHOOK AUTOMATION & DISPATCH TESTER */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Configured Webhooks List */}
            <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-rose-500" />
                  <span>قنوات الـ Webhook الفعالة (Outgoing Webhooks)</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Dispatcher Ready
                </span>
              </div>

              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{wh.name}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {wh.preset || 'custom'}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 truncate max-w-sm">
                        {wh.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTestWebhook(wh)}
                        disabled={testingWebhookId === wh.id}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {testingWebhookId === wh.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        <span>اختبار الإرسال (Test Dispatch)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                يقوم الـ Webhook بإرسال كائن JSON متكامل يحوي العنوان، والعنوان الفرعي، والكابشن والوسوم، وتاريخ النشر لتشغيل أتمتة Zapier أو Make لنشرها فوراً على حسابات التواصل الاجتماعي.
              </p>
            </div>

            {/* Last Dispatch Result & Inspection */}
            <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>نتيجة وفحص الإرسال المباشر (Live Inspector)</span>
              </h3>

              {lastDispatchResult ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 font-mono">
                    <span className="text-slate-400">الحالة (HTTP Status):</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        lastDispatchResult.success
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {lastDispatchResult.status || 'Error'} {lastDispatchResult.statusText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 font-mono">
                    <span className="text-slate-400">زمن الاستجابة (Latency):</span>
                    <span className="text-slate-200">{lastDispatchResult.latencyMs} ms</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] font-mono">استجابة الخادم (Response Body):</span>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                      {lastDispatchResult.body || '(Empty Response / Simulated)'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  اضغط على "اختبار الإرسال" لفحص استجابة الـ Webhook وعرض زمن المعالجة.
                </div>
              )}

              {/* Logs Table */}
              {webhookLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">سجل العمليات الأخير (Dispatch History)</span>
                  <div className="space-y-1 text-[10px] font-mono max-h-36 overflow-y-auto">
                    {webhookLogs.map((log) => (
                      <div key={log.id} className="p-1.5 rounded bg-slate-950 flex items-center justify-between">
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span className="text-slate-200">{log.webhookName}</span>
                        <span className={log.success ? 'text-emerald-400' : 'text-rose-400'}>
                          {log.status} ({log.latencyMs}ms)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: NOTION, BUFFER & CMS DATABASE SYNC */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-rose-400 font-bold">
                N
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Notion Content Hub Sync</h3>
                <p className="text-[11px] text-slate-400">تصدير متوافق 100% مع قواعد بيانات Notion (CSV / JSON Schema)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              قم بتنزيل حزمة تقويم النشر مع الأعمدة المهيكلة: العنوان، التاريخ، حالة النشر (Ready/Published)، التصنيف، ونصوص الكابشن والوسوم.
            </p>

            <button
              onClick={handleExportNotionCsv}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تحميل جدول Notion (CSV المخصص)</span>
            </button>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 font-bold">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Buffer & Hootsuite Bulk Schedule</h3>
                <p className="text-[11px] text-slate-400">جدولة وتوزيع المحتوى دفعة واحدة لمنصات النشر الاجتماعي</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تنسيق ملف CSV متطابق مع مواصفات أداة الرفع المجمع (Bulk Uploader) في Buffer مع أوقات النشر الموصى بها.
            </p>

            <button
              onClick={handleExportBufferCsv}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>تحميل ملف الجدولة المجمعة (Buffer CSV)</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: VECTOR SVG & HIGH-DPI PRINT SPEC */}
      {activeTab === 'vector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SVG Code Inspector */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>كود الرسم المتجهي الصافي (Clean SVG Vector)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentSvg);
                    setSvgCopied(true);
                    setTimeout(() => setSvgCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {svgCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{svgCopied ? 'تم النسخ!' : 'نسخ كود SVG'}</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل .SVG</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
              {currentSvg}
            </pre>
            <p className="text-[11px] text-slate-400">
              كود SVG عالي النقاء قابل للصق مباشرة داخل Figma أو Adobe Illustrator كمتجهات قابلة للتعديل بحرية دون أي فقدان للجودة.
            </p>
          </div>

          {/* 300 DPI Print Spec Sheet */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Printer className="w-4 h-4 text-rose-500" />
              <span>مواصفات الطباعة الدقيقة (300 DPI Spec)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-slate-500 text-[10px]">الأبعاد الرسومية للطباعة</span>
                <p className="text-sm font-bold text-slate-100">3240 × 3240 Pixels</p>
                <span className="text-slate-400 text-[11px]">تعادل قياس 27.4 × 27.4 سم عند 300 DPI</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-slate-500 text-[10px]">هوامش القص الآمن (Bleed & Trim)</span>
                <p className="text-xs font-bold text-rose-400">+3.0 mm Bleed on all 4 borders</p>
                <span className="text-slate-400 text-[11px]">مع خطوط تنصيف سويسرية متقاطعة</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-slate-500 text-[10px]">فضاء الألوان المعياري</span>
                <p className="text-xs font-bold text-sky-400">sRGB IEC61966-2.1 (FOGRA39 Emulated)</p>
                <span className="text-slate-400 text-[11px]">Primary: {project.brand.colors.primary} | Accent: {project.brand.colors.accent}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
