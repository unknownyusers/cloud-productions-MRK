import React, { useState, useRef, useMemo } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Tag,
  Download,
  Copy,
  Check,
  Trash2,
  Palette,
  ExternalLink,
  Sparkles,
  Layers,
  Eye,
  Sliders,
  Share2,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileText,
  Plus
} from 'lucide-react';
import { Asset, Project, ContentRecord, ContentVariation } from '../../types';

interface AssetsViewProps {
  project: Project;
  onAddAsset?: (asset: Asset) => void;
  onDeleteAsset?: (id: string) => void;
  onApplyAssetToRecord?: (asset: Asset, mode: 'emblem' | 'background') => void;
  onNavigateTab?: (tab: any) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  project,
  onAddAsset,
  onDeleteAsset,
  onApplyAssetToRecord,
  onNavigateTab
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal / Detail States
  const [inspectedAsset, setInspectedAsset] = useState<Asset | null>(null);
  const [tintColor, setTintColor] = useState<string>(project.brand.colors.accent || '#E11D48');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [applySuccessNotice, setApplySuccessNotice] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<Asset['type']>('logo');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedDimensions, setUploadedDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [uploadedSize, setUploadedSize] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Canva Export Bridge Modal State
  const [isCanvaBridgeOpen, setIsCanvaBridgeOpen] = useState(false);
  const [canvaExportSuccess, setCanvaExportSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const assets = project.assets || [];

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory =
        activeCategory === 'ALL'
          ? true
          : activeCategory === 'uploads'
          ? !asset.id.startsWith('asset_')
          : asset.type === activeCategory;

      const matchesSearch =
        searchTerm.trim() === '' ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag = !selectedTag || asset.tags.includes(selectedTag);

      return matchesCategory && matchesSearch && matchesTag;
    });
  }, [assets, activeCategory, searchTerm, selectedTag]);

  // All Unique Tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).slice(0, 10);
  }, [assets]);

  // Storage calculation
  const totalStorageKb = useMemo(() => {
    return Math.round(assets.reduce((sum, a) => sum + (a.size || 0), 0) / 1024);
  }, [assets]);

  // Handle Local File Reading
  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedPreview(dataUrl);
      setUploadedSize(file.size);
      if (!uploadName) {
        setUploadName(file.name.replace(/\.[^/.]+$/, ''));
      }

      // Detect dimensions
      const img = new Image();
      img.onload = () => {
        setUploadedDimensions({ width: img.naturalWidth || 500, height: img.naturalHeight || 500 });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveUpload = () => {
    if (!uploadedPreview || !uploadName) return;

    const newAsset: Asset = {
      id: `user_asset_${Date.now()}`,
      name: uploadName,
      type: uploadType,
      url: uploadedPreview,
      size: uploadedSize,
      dimensions: uploadedDimensions,
      tags: uploadTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      createdAt: new Date().toISOString()
    };

    onAddAsset?.(newAsset);
    setIsUploadModalOpen(false);
    setUploadedPreview(null);
    setUploadName('');
    setUploadTags('');
  };

  // Color Tinting for SVG Data URIs
  const getTintedSvgUrl = (url: string, color: string) => {
    if (!url.startsWith('data:image/svg+xml')) return url;
    try {
      // Decode the SVG string
      const svgPrefix = 'data:image/svg+xml;utf8,';
      if (url.startsWith(svgPrefix)) {
        let svgStr = decodeURIComponent(url.replace(svgPrefix, ''));
        // Replace prominent accent fills or strokes with the selected tint
        svgStr = svgStr
          .replace(/fill="%23E11D48"/gi, `fill="${encodeURIComponent(color)}"`)
          .replace(/fill="#E11D48"/gi, `fill="${color}"`)
          .replace(/stroke="%23E11D48"/gi, `stroke="${encodeURIComponent(color)}"`)
          .replace(/stroke="#E11D48"/gi, `stroke="${color}"`);
        return `${svgPrefix}${encodeURIComponent(svgStr)}`;
      }
    } catch {
      // Return original on error
    }
    return url;
  };

  const handleApplyToPoster = (asset: Asset, mode: 'emblem' | 'background') => {
    const finalUrl = getTintedSvgUrl(asset.url, tintColor);
    const assetToApply = { ...asset, url: finalUrl };

    if (onApplyAssetToRecord) {
      onApplyAssetToRecord(assetToApply, mode);
    }

    setApplySuccessNotice(
      mode === 'emblem'
        ? `تم تطبيق "${asset.name}" كشعار في بوستر محتوى اليوم!`
        : `تم تطبيق "${asset.name}" كخلفية في بوستر محتوى اليوم!`
    );

    setTimeout(() => {
      setApplySuccessNotice(null);
    }, 4000);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadAsset = (asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = `${asset.name.toLowerCase().replace(/\s+/g, '_')}.${
      asset.url.startsWith('data:image/svg') ? 'svg' : 'png'
    }`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export Design Package for Canva / Figma
  const handleExportCanvaPackage = () => {
    const activeRecord = project.records[0];
    const canvaManifest = {
      project: project.name,
      exportedAt: new Date().toISOString(),
      format: 'Canva Design System Bundle',
      brandTokens: {
        palette: project.brand.colors,
        typography: project.brand.typography,
        rules: project.brand.rules
      },
      currentPostCopy: {
        title: activeRecord?.title || '',
        subtitle: activeRecord?.subtitle || '',
        cta: activeRecord?.cta || '',
        hashtags: activeRecord?.hashtags || [],
        caption: activeRecord?.caption || ''
      },
      vectorAssets: assets.map((a) => ({
        name: a.name,
        type: a.type,
        dimensions: a.dimensions,
        tags: a.tags,
        svgOrDataUri: a.url
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(canvaManifest, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `contentforge_canva_bundle_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();

    setCanvaExportSuccess(true);
    setTimeout(() => setCanvaExportSuccess(false), 4000);
  };

  return (
    <div id="assets-view" className="p-6 max-w-7xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase">
              Phase 8 • Media Vault
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Local-First Vector & Image Intelligence
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rose-500" />
            <span>استوديو الأصول والملفات البصرية • Media Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            مستودع الأصول السويسرية، الشارات الهندسية، والشعارات التحريرية مع الربط المباشر مع كانفا (Canva Bridge) والتطبيق الفوري على بوسترات المحتوى اليومي.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Canva Bridge Button */}
          <button
            id="open-canva-bridge-btn"
            onClick={() => setIsCanvaBridgeOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>بوابة تكامل كانفا (Canva Bridge)</span>
          </button>

          {/* Upload Asset Button */}
          <button
            id="open-upload-modal-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>رفع أصل جديد</span>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {applySuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{applySuccessNotice}</span>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('today')}
              className="text-[11px] underline text-emerald-200 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>انتقل لمعاينة البوستر</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">إجمالي الأصول المخزنة</div>
            <div className="text-base font-bold text-slate-100 font-mono">{assets.length} أصل</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">أصول سويسرية معتمدة</div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {assets.filter((a) => a.id.startsWith('asset_')).length} شعار وختم
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">المرفوعات المحلية</div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {assets.filter((a) => !a.id.startsWith('asset_')).length} ملف خاص
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">استهلاك الذاكرة المحلية</div>
            <div className="text-base font-bold text-slate-100 font-mono">{totalStorageKb} KB (خفيف)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'الكل (All)', count: assets.length },
              { id: 'logo', label: 'شعارات سويسرية', count: assets.filter((a) => a.type === 'logo').length },
              { id: 'icon', label: 'أختام وشارات', count: assets.filter((a) => a.type === 'icon').length },
              { id: 'image', label: 'خلفيات وشبكات', count: assets.filter((a) => a.type === 'image').length },
              {
                id: 'uploads',
                label: 'أصولي المرفوعة',
                count: assets.filter((a) => !a.id.startsWith('asset_')).length
              }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الوسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Tag Cloud */}
        {allTags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>الوسوم السريعة:</span>
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 cursor-pointer"
              >
                إلغاء التصفية ({selectedTag}) ×
              </button>
            )}
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  selectedTag === t
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => {
          const isSvg = asset.url.startsWith('data:image/svg');
          const isUserUploaded = !asset.id.startsWith('asset_');

          return (
            <div
              key={asset.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              {/* Asset Preview Box */}
              <div
                onClick={() => {
                  setInspectedAsset(asset);
                }}
                className="relative aspect-square w-full bg-slate-950 flex items-center justify-center p-6 cursor-pointer overflow-hidden border-b border-slate-800/60"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #0d131f 25%, transparent 25%), linear-gradient(-45deg, #0d131f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0d131f 75%), linear-gradient(-45deg, transparent 75%, #0d131f 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                }}
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                    {isSvg ? 'SVG' : 'RASTER'}
                  </span>
                  {isUserUploaded && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-800">
                      مرفوع
                    </span>
                  )}
                </div>

                {/* Hover Inspect Icon */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900/95 text-slate-200 text-xs font-semibold flex items-center gap-1 shadow-lg border border-slate-700">
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>معاينة وتعديل</span>
                  </span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 truncate" title={asset.name}>
                    {asset.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>
                      {asset.dimensions ? `${asset.dimensions.width}x${asset.dimensions.height}px` : 'Vector'}
                    </span>
                    <span>{Math.max(1, Math.round(asset.size / 1024))} KB</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleApplyToPoster(asset, 'emblem')}
                    className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="تطبيق هذا الأصل كشعار أو خاتم في بوستر اليوم"
                  >
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>تطبيق كشعار</span>
                  </button>

                  <button
                    onClick={() => {
                      setInspectedAsset(asset);
                    }}
                    className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3 h-3 text-slate-400" />
                    <span>خيارات</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-12 text-center space-y-3">
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">لم يتم العثور على أصول مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            جرب تعديل كلمات البحث، أو إزالة الوسوم المحددة، أو قم برفع أصول جديدة من جهازك.
          </p>
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setSearchTerm('');
              setSelectedTag(null);
            }}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded text-xs font-semibold cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. Canva Design System Bridge Modal                                      */}
      {/* ========================================================================= */}
      {isCanvaBridgeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                  C
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    بوابة تكامل كانفا • Canva & External Design Bridge
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تصدير ومزامنة أصول وهوية ContentForge مع كانفا (Canva) وفوتوشوب وفيجما.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCanvaBridgeOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notification */}
            {canvaExportSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم تصدير حزمة التصميم بنجاح (Canva / Figma Design Tokens Ready)!</span>
              </div>
            )}

            {/* Canva Direct Deep Links */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>فتح قوالب جاهزة في كانفا بالمقاييس المعتمدة:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href="https://www.canva.com/create/instagram-posts/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400">
                    Instagram Post (1:1)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">1080 × 1080 px</span>
                </a>

                <a
                  href="https://www.canva.com/create/tiktok-videos/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400">
                    TikTok / Reels (9:16)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">1080 × 1920 px</span>
                </a>

                <a
                  href="https://www.canva.com/create/presentations/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400">
                    Landscape Presentation
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">1920 × 1080 px</span>
                </a>
              </div>
            </div>

            {/* Design Tokens & Copy Exporter */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    تصدير حزمة الهوية والأصول لكانفا (Canva JSON Bundle)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    تتضمن أكواد ألوان الهوية، نصوص اليوم، ومصفوفة الشعارات السويسرية بصيغة JSON مهيأة لـ Canva Connect.
                  </p>
                </div>
                <button
                  onClick={handleExportCanvaPackage}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الحزمة (Export)</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[10px] text-slate-400 overflow-x-auto space-y-1">
                <div>// Sample Canva Connect Payload</div>
                <div>{`{ "brand": "${project.brand.name}", "primaryColor": "${project.brand.colors.primary}", "accentColor": "${project.brand.colors.accent}" }`}</div>
              </div>
            </div>

            {/* Architecture Note */}
            <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200">ملاحظة معمارية حول مكتبات Canva (Canva SDKs):</span>
              <p>
                تعتمد كانفا على منصة <strong>Canva Connect API</strong> و <strong>Canva Button</strong> لاستيراد وتصدير التصاميم دون الحاجة لحزم طرف ثالث ثقيلة. يمكنك استيراد الحزمة المصدرة أعلاه في أي تطبيق أو ربطها عبر Webhooks من شاشة التكاملات (Phase 4).
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCanvaBridgeOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Upload Asset Modal                                                    */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-rose-500" />
                <span>رفع أصل جديد إلى المخزن المحلي</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragOver
                  ? 'border-rose-500 bg-rose-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {uploadedPreview ? (
                <div className="space-y-2">
                  <div className="w-24 h-24 mx-auto p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={uploadedPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold">تم اختيار الملف بنجاح</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {uploadedDimensions.width}x{uploadedDimensions.height}px •{' '}
                    {Math.round(uploadedSize / 1024)} KB
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    انقر هنا لاختيار ملف من جهازك أو اسحبه وأفلته هنا
                  </div>
                  <div className="text-[10px] text-slate-500">
                    يدعم ملفات SVG, PNG, JPG, WebP. يتم الحفظ محلياً 100% في المتصفح.
                  </div>
                </>
              )}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">اسم الأصل / Title</label>
                <input
                  type="text"
                  placeholder="مثال: شعار المتجر الأبيض"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">نوع الأصل</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="logo">شعار (Logo)</option>
                    <option value="icon">ختم أو شارة (Icon/Stamp)</option>
                    <option value="image">خلفية أو تاكستشر (Image)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">وسوم (مفصولة بفواصل)</label>
                  <input
                    type="text"
                    placeholder="شعار, رسمي, أبيض"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={!uploadedPreview || !uploadName}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                حفظ الأصل في المستودع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Asset Detail, Color Tinting & Poster Insertion Modal                   */}
      {/* ========================================================================= */}
      {inspectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-500" />
                  <span>تفاصيل وتلوين الأصل • Asset Studio</span>
                </h3>
                <p className="text-[11px] text-slate-400">{inspectedAsset.name}</p>
              </div>

              <button
                onClick={() => setInspectedAsset(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Box & Live Tint Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-8 overflow-hidden relative"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #0f172a 25%, transparent 25%), linear-gradient(-45deg, #0f172a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0f172a 75%), linear-gradient(-45deg, transparent 75%, #0f172a 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <img
                  src={getTintedSvgUrl(inspectedAsset.url, tintColor)}
                  alt={inspectedAsset.name}
                  className="max-h-full max-w-full object-contain drop-shadow-xl"
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* SVG Color Tinting */}
                {inspectedAsset.url.startsWith('data:image/svg') && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-rose-400" />
                        <span>تلوين الشعار السويسري (SVG Tint)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[
                        project.brand.colors.accent || '#E11D48',
                        project.brand.colors.primary || '#0F172A',
                        '#38BDF8',
                        '#10B981',
                        '#F59E0B',
                        '#FFFFFF',
                        '#000000'
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => setTintColor(c)}
                          className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                            tintColor === c ? 'scale-125 border-white ring-2 ring-rose-500/50' : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata details */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>الصيغة:</span>
                    <span className="font-mono text-slate-200">
                      {inspectedAsset.url.startsWith('data:image/svg') ? 'Vector SVG' : 'Raster Bitmap'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>المقاس:</span>
                    <span className="font-mono text-slate-200">
                      {inspectedAsset.dimensions
                        ? `${inspectedAsset.dimensions.width} x ${inspectedAsset.dimensions.height} px`
                        : 'Scalable Vector'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>الحجم:</span>
                    <span className="font-mono text-slate-200">
                      {Math.max(1, Math.round(inspectedAsset.size / 1024))} KB
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>الوسوم:</span>
                    <span className="text-slate-300">
                      {inspectedAsset.tags.map((t) => `#${t}`).join(' ')}
                    </span>
                  </div>
                </div>

                {/* Application to poster buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleApplyToPoster(inspectedAsset, 'emblem')}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تطبيق كشعار/ختم في بوستر اليوم</span>
                  </button>

                  <button
                    onClick={() => handleApplyToPoster(inspectedAsset, 'background')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>تطبيق كخلفية أو تاكستشر في البوستر</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(inspectedAsset.url)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'تم نسخ الرابط!' : 'نسخ Data URI'}</span>
                </button>

                <button
                  onClick={() => handleDownloadAsset(inspectedAsset)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الملف</span>
                </button>
              </div>

              {!inspectedAsset.id.startsWith('asset_') && (
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف "${inspectedAsset.name}"؟`)) {
                      onDeleteAsset?.(inspectedAsset.id);
                      setInspectedAsset(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-md font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الأصل</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
