import React, { useState, useRef } from 'react';
import {
  LayoutTemplate,
  Plus,
  Layers,
  Sliders,
  Type,
  Square,
  Circle,
  Download,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ExternalLink,
  MousePointer,
  Share2
} from 'lucide-react';
import { Template, CanvasElement, Project } from '../../types';

interface TemplatesViewProps {
  project: Project;
  onUpdateTemplate?: (template: Template) => void;
  onSelectTemplate?: (template: Template) => void;
}

const SWISS_PALETTE = [
  { name: 'Pitch Dark', hex: '#0F172A' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Swiss Crimson', hex: '#E11D48' },
  { name: 'Slate Light', hex: '#F8FAFC' },
  { name: 'Steel Gray', hex: '#64748B' },
  { name: 'Signal Amber', hex: '#F59E0B' },
  { name: 'Teal Focus', hex: '#0D9488' },
  { name: 'Indigo Deep', hex: '#4F46E5' }
];

const FONT_FAMILIES = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern Display)' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Brutalist Monospace)' },
  { id: 'Inter', label: 'Inter (Clean Technical)' },
  { id: 'sans-serif', label: 'System Clean Bold' }
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  project,
  onUpdateTemplate
}) => {
  // Single source of truth: selectedTemplateId selects from project.templates
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    project.templates[0]?.id || 'tmpl_01'
  );

  const selectedTemplate =
    project.templates.find((t) => t.id === selectedTemplateId) ||
    project.templates[0];

  const [activeElementId, setActiveElementId] = useState<string | null>(
    selectedTemplate?.elements[0]?.id || null
  );

  // Dragging state (local transient state only during pointer interaction)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  // Canva Export Modal state
  const [showCanvaModal, setShowCanvaModal] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const activeElement = selectedTemplate?.elements.find((el) => el.id === activeElementId);

  // Safe element update (dispatched to parent cleanly outside of render/setState callbacks)
  const handleUpdateElement = (updatedFields: Partial<CanvasElement>) => {
    if (!activeElementId || !selectedTemplate) return;

    const nextElements = selectedTemplate.elements.map((el) =>
      el.id === activeElementId ? { ...el, ...updatedFields } : el
    );
    const nextTemplate: Template = { ...selectedTemplate, elements: nextElements };

    if (onUpdateTemplate) {
      onUpdateTemplate(nextTemplate);
    }
  };

  // Drag & Drop Handlers
  const handlePointerDown = (e: React.PointerEvent, element: CanvasElement) => {
    e.stopPropagation();
    setActiveElementId(element.id);

    if (element.locked) return;

    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElementStartPos({ x: element.x, y: element.y });
    setDragPos({ id: element.id, x: element.x, y: element.y });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !activeElement || activeElement.locked || !selectedTemplate) return;

    const container = canvasContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const scaleFactor = selectedTemplate.width / containerRect.width;

    const dx = (e.clientX - dragStartPos.x) * scaleFactor;
    const dy = (e.clientY - dragStartPos.y) * scaleFactor;

    const newX = Math.round(
      Math.max(0, Math.min(selectedTemplate.width - (activeElement.width || 100), elementStartPos.x + dx))
    );
    const newY = Math.round(
      Math.max(0, Math.min(selectedTemplate.height - (activeElement.height || 40), elementStartPos.y + dy))
    );

    // Only update local drag position during movement for maximum performance
    setDragPos({ id: activeElement.id, x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      // Commit final coordinates to template store on release
      if (dragPos && activeElement && (dragPos.x !== activeElement.x || dragPos.y !== activeElement.y)) {
        handleUpdateElement({ x: dragPos.x, y: dragPos.y });
      }
      setDragPos(null);
    }
  };

  // Add new Text Element (Canva Style)
  const handleAddTextElement = (preset: 'heading' | 'subtitle' | 'body') => {
    if (!selectedTemplate) return;
    const id = `text_${Date.now()}`;
    let newEl: CanvasElement;

    if (preset === 'heading') {
      newEl = {
        id,
        name: 'Main Headline',
        type: 'text',
        x: Math.round(selectedTemplate.width * 0.08),
        y: Math.round(selectedTemplate.height * 0.35),
        width: Math.round(selectedTemplate.width * 0.84),
        height: 120,
        rotation: 0,
        opacity: 1,
        zIndex: selectedTemplate.elements.length + 1,
        locked: false,
        visible: true,
        content: 'EDITORIAL DISCIPLINE',
        fontSize: 64,
        fontWeight: '900',
        fontFamily: 'Plus Jakarta Sans',
        color: '#FFFFFF',
        textAlign: 'left'
      };
    } else if (preset === 'subtitle') {
      newEl = {
        id,
        name: 'Subtitle Series',
        type: 'text',
        x: Math.round(selectedTemplate.width * 0.08),
        y: Math.round(selectedTemplate.height * 0.22),
        width: Math.round(selectedTemplate.width * 0.84),
        height: 50,
        rotation: 0,
        opacity: 1,
        zIndex: selectedTemplate.elements.length + 1,
        locked: false,
        visible: true,
        content: 'ISSUE // ARCHITECTURE 01',
        fontSize: 22,
        fontWeight: '800',
        fontFamily: 'Space Grotesk',
        color: '#E11D48',
        textAlign: 'left'
      };
    } else {
      newEl = {
        id,
        name: 'Body Statement',
        type: 'text',
        x: Math.round(selectedTemplate.width * 0.08),
        y: Math.round(selectedTemplate.height * 0.55),
        width: Math.round(selectedTemplate.width * 0.84),
        height: 80,
        rotation: 0,
        opacity: 1,
        zIndex: selectedTemplate.elements.length + 1,
        locked: false,
        visible: true,
        content: 'A deliberate typographic grid establishes clarity and visual authority.',
        fontSize: 28,
        fontWeight: '500',
        fontFamily: 'Plus Jakarta Sans',
        color: '#94A3B8',
        textAlign: 'left'
      };
    }

    const nextTemplate: Template = {
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newEl]
    };
    setActiveElementId(id);
    if (onUpdateTemplate) onUpdateTemplate(nextTemplate);
  };

  // Add Swiss Geometric Element (Canva Style)
  const handleAddShape = (shapeType: 'bar' | 'frame' | 'circle') => {
    if (!selectedTemplate) return;
    const id = `shape_${Date.now()}`;
    let newShape: CanvasElement;

    if (shapeType === 'bar') {
      newShape = {
        id,
        name: 'Swiss Accent Line',
        type: 'shape',
        x: Math.round(selectedTemplate.width * 0.08),
        y: 80,
        width: 140,
        height: 8,
        rotation: 0,
        opacity: 1,
        zIndex: selectedTemplate.elements.length + 1,
        locked: false,
        visible: true,
        fill: '#E11D48',
        borderRadius: 0
      };
    } else if (shapeType === 'frame') {
      newShape = {
        id,
        name: 'Border Bounding Box',
        type: 'shape',
        x: Math.round(selectedTemplate.width * 0.08),
        y: Math.round(selectedTemplate.height * 0.82),
        width: Math.round(selectedTemplate.width * 0.84),
        height: 80,
        rotation: 0,
        opacity: 1,
        zIndex: selectedTemplate.elements.length + 1,
        locked: false,
        visible: true,
        fill: 'transparent',
        stroke: '#334155',
        strokeWidth: 2,
        borderRadius: 4
      };
    } else {
      newShape = {
        id,
        name: 'Geometric Dot',
        type: 'shape',
        x: Math.round(selectedTemplate.width * 0.85),
        y: Math.round(selectedTemplate.height * 0.85),
        width: 36,
        height: 36,
        rotation: 0,
        opacity: 1,
        zIndex: selectedTemplate.elements.length + 1,
        locked: false,
        visible: true,
        fill: '#E11D48',
        borderRadius: 18
      };
    }

    const nextTemplate: Template = {
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newShape]
    };
    setActiveElementId(id);
    if (onUpdateTemplate) onUpdateTemplate(nextTemplate);
  };

  // Duplicate Element
  const handleDuplicateElement = () => {
    if (!activeElement || !selectedTemplate) return;
    const newId = `${activeElement.type}_${Date.now()}`;
    const duplicated: CanvasElement = {
      ...activeElement,
      id: newId,
      name: `${activeElement.name} (Copy)`,
      x: Math.min(selectedTemplate.width - 50, activeElement.x + 30),
      y: Math.min(selectedTemplate.height - 50, activeElement.y + 30),
      zIndex: selectedTemplate.elements.length + 1
    };

    const nextTemplate: Template = {
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, duplicated]
    };
    setActiveElementId(newId);
    if (onUpdateTemplate) onUpdateTemplate(nextTemplate);
  };

  // Delete Element
  const handleDeleteElement = () => {
    if (!activeElementId || !selectedTemplate) return;
    const filtered = selectedTemplate.elements.filter((el) => el.id !== activeElementId);
    const nextTemplate: Template = {
      ...selectedTemplate,
      elements: filtered
    };
    setActiveElementId(null);
    if (onUpdateTemplate) onUpdateTemplate(nextTemplate);
  };

  // Change Background Color
  const handleChangeBgColor = (color: string) => {
    if (!selectedTemplate) return;
    const bgElement = selectedTemplate.elements.find((el) => el.type === 'background');
    let nextElements: CanvasElement[];
    if (bgElement) {
      nextElements = selectedTemplate.elements.map((el) =>
        el.type === 'background' ? { ...el, fill: color } : el
      );
    } else {
      nextElements = [
        {
          id: 'bg_base',
          name: 'Background Canvas',
          type: 'background',
          x: 0,
          y: 0,
          width: selectedTemplate.width,
          height: selectedTemplate.height,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: true,
          visible: true,
          fill: color
        },
        ...selectedTemplate.elements
      ];
    }
    const nextTemplate: Template = {
      ...selectedTemplate,
      elements: nextElements
    };
    if (onUpdateTemplate) onUpdateTemplate(nextTemplate);
  };

  // Export current template as SVG
  const handleDownloadSvg = () => {
    if (!selectedTemplate) return;
    const bg = selectedTemplate.elements.find((el) => el.type === 'background')?.fill || '#0F172A';
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${selectedTemplate.width} ${selectedTemplate.height}" width="${selectedTemplate.width}" height="${selectedTemplate.height}">
  <rect width="${selectedTemplate.width}" height="${selectedTemplate.height}" fill="${bg}" />
  ${selectedTemplate.elements
    .filter((el) => el.type !== 'background' && el.visible)
    .map((el) => {
      if (el.type === 'text') {
        return `<text x="${el.x}" y="${el.y + (el.fontSize || 24)}" font-family="${el.fontFamily || 'sans-serif'}" font-size="${el.fontSize || 24}" font-weight="${el.fontWeight || '700'}" fill="${el.color || '#FFFFFF'}">${el.content || ''}</text>`;
      }
      if (el.type === 'shape') {
        if (el.borderRadius && el.borderRadius > 10) {
          return `<circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="${el.width / 2}" fill="${el.fill || '#E11D48'}" />`;
        }
        return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || 'transparent'}" stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}" rx="${el.borderRadius || 0}" />`;
      }
      return '';
    })
    .join('\n  ')}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTemplate.name.replace(/\s+/g, '_').toLowerCase()}.svg`;
    link.click();
  };

  if (!selectedTemplate) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        لم يتم العثور على قوالب متوفرة.
      </div>
    );
  }

  const currentBg = selectedTemplate.elements.find((e) => e.type === 'background')?.fill || '#0F172A';

  return (
    <div id="templates-view" className="p-6 max-w-7xl mx-auto space-y-6 select-none text-slate-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-rose-500" />
            <span>محرر الكانفاس التفاعلي وكانفا • Canva-Style Visual Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تحرير مرئي مباشر بالسحب والإفلات (Direct Drag & Drop)، وتعديل الطبقات، وتكامل كامل مع بيئة كانفا (Canva Bridge).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Open in Canva Bridge Button */}
          <button
            onClick={() => setShowCanvaModal(true)}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>تكامل كانفا (Open in Canva)</span>
          </button>

          {/* Export SVG Button */}
          <button
            onClick={handleDownloadSvg}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير SVG</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Canva-Style Tool Palette (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Template Switcher */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block pb-1 border-b border-slate-800">
              اختر قالب التصميم
            </span>
            <div className="space-y-1 max-h-[140px] overflow-y-auto">
              {project.templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    setActiveElementId(tmpl.elements[0]?.id || null);
                  }}
                  className={`p-2 rounded text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedTemplate.id === tmpl.id
                      ? 'bg-rose-950/60 border border-rose-600/60 text-rose-200 font-bold'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <span className="truncate">{tmpl.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                    {tmpl.format}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Elements Toolbox (Canva Style) */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>إضافة عناصر للكانفاس (Add Elements)</span>
            </span>

            {/* Typography Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-medium">نصوص جاهزة:</span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => handleAddTextElement('heading')}
                  className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs font-bold text-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>عنوان رئيسي بارز (Headline)</span>
                  <Type className="w-3.5 h-3.5 text-rose-400" />
                </button>
                <button
                  onClick={() => handleAddTextElement('subtitle')}
                  className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-semibold text-rose-300 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>عنوان فرعي سويسري (Subtitle)</span>
                  <Type className="w-3 h-3 text-rose-400" />
                </button>
                <button
                  onClick={() => handleAddTextElement('body')}
                  className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[10px] text-slate-300 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>نص توضيحي (Body Text)</span>
                  <Type className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Swiss Shape Presets */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">أشكال وعناصر هندسية:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleAddShape('bar')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[10px] flex flex-col items-center gap-1 cursor-pointer transition-colors"
                >
                  <div className="w-6 h-1.5 bg-rose-500 rounded-sm" />
                  <span className="text-[9px] text-slate-300">شريط أحمر</span>
                </button>
                <button
                  onClick={() => handleAddShape('frame')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[10px] flex flex-col items-center gap-1 cursor-pointer transition-colors"
                >
                  <Square className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] text-slate-300">إطار محايد</span>
                </button>
                <button
                  onClick={() => handleAddShape('circle')}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[10px] flex flex-col items-center gap-1 cursor-pointer transition-colors"
                >
                  <Circle className="w-4 h-4 text-rose-400" />
                  <span className="text-[9px] text-slate-300">نقطة ارتكاز</span>
                </button>
              </div>
            </div>

            {/* Canvas Background Color */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">لون خلفية الكانفاس:</span>
              <div className="flex flex-wrap gap-1.5">
                {SWISS_PALETTE.map((pal) => (
                  <button
                    key={pal.hex}
                    onClick={() => handleChangeBgColor(pal.hex)}
                    title={pal.name}
                    className={`w-6 h-6 rounded-md border transition-all cursor-pointer ${
                      currentBg === pal.hex
                        ? 'ring-2 ring-rose-500 ring-offset-1 ring-offset-slate-900 border-white'
                        : 'border-slate-700 hover:scale-110'
                    }`}
                    style={{ backgroundColor: pal.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Live Drag & Drop Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
          {/* Canvas Top Context Bar (Canva Style) */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
            {activeElement ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-rose-400 truncate max-w-[120px]">
                  {activeElement.name}
                </span>

                {activeElement.type === 'text' && (
                  <>
                    {/* Font Size controls */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => handleUpdateElement({ fontSize: Math.max(12, (activeElement.fontSize || 24) - 2) })}
                        className="px-1 text-slate-400 hover:text-white font-mono cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-1.5 font-mono text-[10px] text-slate-200">
                        {activeElement.fontSize || 24}px
                      </span>
                      <button
                        onClick={() => handleUpdateElement({ fontSize: Math.min(120, (activeElement.fontSize || 24) + 2) })}
                        className="px-1 text-slate-400 hover:text-white font-mono cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Text Align */}
                    <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded p-0.5">
                      <button
                        onClick={() => handleUpdateElement({ textAlign: 'left' })}
                        className={`p-1 rounded cursor-pointer ${activeElement.textAlign === 'left' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <AlignLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateElement({ textAlign: 'center' })}
                        className={`p-1 rounded cursor-pointer ${activeElement.textAlign === 'center' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <AlignCenter className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateElement({ textAlign: 'right' })}
                        className={`p-1 rounded cursor-pointer ${activeElement.textAlign === 'right' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <AlignRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}

                {/* Duplicate & Delete */}
                <div className="flex items-center gap-1 border-r border-slate-800 pr-2">
                  <button
                    onClick={handleDuplicateElement}
                    title="تكرار العنصر"
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteElement}
                    title="حذف العنصر"
                    className="p-1 rounded bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">
                انقر على أي عنصر داخل الكانفاس لتفعيله وسحبه أو تعديله مباشرة.
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[10px] font-mono text-slate-400">
                {selectedTemplate.width} × {selectedTemplate.height}
              </span>
            </div>
          </div>

          {/* Interactive Drag & Drop Canvas Viewport */}
          <div
            ref={canvasContainerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full flex items-center justify-center p-4 bg-slate-950/90 rounded-lg border border-slate-800/80 min-h-[420px] overflow-hidden select-none"
          >
            <div
              id="interactive-canva-canvas"
              className="relative shadow-2xl transition-shadow rounded-sm overflow-hidden border border-slate-800/50"
              style={{
                width: selectedTemplate.format === 'TikTok-9:16' ? '240px' : '360px',
                aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
                backgroundColor: currentBg
              }}
            >
              {/* Subtle Grid Lines Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, #64748B 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Render Elements */}
              {selectedTemplate.elements
                .filter((el) => el.type !== 'background' && el.visible)
                .map((el) => {
                  const isSelected = activeElementId === el.id;
                  const currentX = dragPos && dragPos.id === el.id ? dragPos.x : el.x;
                  const currentY = dragPos && dragPos.id === el.id ? dragPos.y : el.y;

                  const leftPercent = (currentX / selectedTemplate.width) * 100;
                  const topPercent = (currentY / selectedTemplate.height) * 100;
                  const widthPercent = el.width ? (el.width / selectedTemplate.width) * 100 : 100;

                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handlePointerDown(e, el)}
                      className={`absolute select-none transition-shadow ${
                        el.locked ? 'cursor-not-allowed' : 'cursor-move'
                      } ${
                        isSelected
                          ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-transparent'
                          : 'hover:ring-1 hover:ring-slate-400/50'
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: `${widthPercent}%`,
                        zIndex: el.zIndex || 1
                      }}
                    >
                      {/* Selection Bounding Box Handles when active */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-rose-500 rounded-full pointer-events-none" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full pointer-events-none" />
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-rose-500 rounded-full pointer-events-none" />
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-rose-500 rounded-full pointer-events-none" />
                        </>
                      )}

                      {/* Element Body Render */}
                      {el.type === 'text' && (
                        <div
                          style={{
                            color: el.color || '#FFFFFF',
                            fontSize: el.fontSize ? `${(el.fontSize / selectedTemplate.width) * 360}px` : '12px',
                            fontWeight: el.fontWeight || 'normal',
                            fontFamily: el.fontFamily || 'Inter',
                            textAlign: el.textAlign || 'left',
                            lineHeight: 1.15
                          }}
                        >
                          {el.content}
                        </div>
                      )}

                      {el.type === 'shape' && (
                        <div
                          style={{
                            width: '100%',
                            height: `${(el.height / selectedTemplate.height) * (selectedTemplate.format === 'TikTok-9:16' ? 240 * (16 / 9) : 360)}px`,
                            backgroundColor: el.fill || 'transparent',
                            border: el.stroke ? `${el.strokeWidth || 1}px solid ${el.stroke}` : 'none',
                            borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <MousePointer className="w-3.5 h-3.5" />
              <span>اسحب أي عنصر بالماوس لتغيير موضعه مباشرة • Drag & Drop Enabled</span>
            </span>
            <span className="font-mono text-[10px]">Auto-Calculated Coordinates</span>
          </div>
        </div>

        {/* Right Column: Element Property Inspector (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Layer Hierarchy Panel */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>الطبقات والعناصر ({selectedTemplate.elements.length})</span>
              </h4>
            </div>

            <div className="space-y-1 max-h-[140px] overflow-y-auto">
              {selectedTemplate.elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setActiveElementId(el.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer ${
                    activeElementId === el.id
                      ? 'bg-rose-950/60 text-rose-300 font-medium border border-rose-800/60'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {el.type === 'text' ? (
                      <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{el.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateElement({ visible: !el.visible });
                      }}
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateElement({ locked: !el.locked });
                      }}
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      {el.locked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Element Inspector */}
          {activeElement ? (
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-400" />
                  <span>خصائص العنصر (Inspector)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{activeElement.type}</span>
              </div>

              {/* Text Element Properties */}
              {activeElement.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">المحتوى النصي:</label>
                    <textarea
                      value={activeElement.content || ''}
                      onChange={(e) => handleUpdateElement({ content: e.target.value })}
                      rows={2}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">عائلة الخط (Font Family):</label>
                    <select
                      value={activeElement.fontFamily || 'Plus Jakarta Sans'}
                      onChange={(e) => handleUpdateElement({ fontFamily: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">لون النص:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeElement.color || '#FFFFFF'}
                        onChange={(e) => handleUpdateElement({ color: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={activeElement.color || '#FFFFFF'}
                        onChange={(e) => handleUpdateElement({ color: e.target.value })}
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shape Properties */}
              {activeElement.type === 'shape' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">لون التعبئة (Fill):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeElement.fill || '#E11D48'}
                        onChange={(e) => handleUpdateElement({ fill: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={activeElement.fill || '#E11D48'}
                        onChange={(e) => handleUpdateElement({ fill: e.target.value })}
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinates Preview */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div className="p-1.5 bg-slate-950 rounded">
                  X: <span className="text-slate-200">{activeElement.x}px</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded">
                  Y: <span className="text-slate-200">{activeElement.y}px</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 text-center">
              اختر عنصراً من الكانفاس لتعديل تفاصيله.
            </div>
          )}
        </div>
      </div>

      {/* CANVA INTEGRATION MODAL */}
      {showCanvaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                  C
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  تكامل كانفا • Canva Bridge & Integration
                </h3>
              </div>
              <button
                onClick={() => setShowCanvaModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يمكنك تصدير هذا القالب والتصميم مباشرة إلى منصة <strong>Canva</strong>. تم تجهيز أبعاد التصميم ({selectedTemplate.width}×{selectedTemplate.height}) والطبقات المتجهية بصيغة متوافقة 100%.
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">القالب المستهدف:</span>
                <span className="text-rose-400 font-bold">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">الأبعاد القياسية:</span>
                <span className="text-slate-200">{selectedTemplate.width} × {selectedTemplate.height} ({selectedTemplate.format})</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-200 block">خطوات الفتح والتعديل في كانفا:</span>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>قم بتنزيل ملف الـ SVG المتجهي الخاص بالتصميم.</li>
                <li>انقر على زر "فتح Canva" أدناه للانتقال المباشر إلى استوديو كانفا.</li>
                <li>اسحب ملف الـ SVG داخل نافذة كانفا ليتحول تلقائياً إلى طبقات قابلة للتعديل والتحريك هناك!</li>
              </ol>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handleDownloadSvg}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تحميل SVG لكانفا</span>
              </button>

              <a
                href="https://www.canva.com/create/banners/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>الانتقال والفتح في Canva</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
