import React, { useState } from 'react';
import { Palette, Check, RefreshCw, Sliders, Type, ShieldCheck } from 'lucide-react';
import { BrandSystem } from '../../types';

interface BrandViewProps {
  brand: BrandSystem;
  onUpdateBrand: (updated: BrandSystem) => void;
}

export const BrandView: React.FC<BrandViewProps> = ({ brand, onUpdateBrand }) => {
  const [formData, setFormData] = useState<BrandSystem>(brand);
  const [isSaved, setIsSaved] = useState(false);

  const handleColorChange = (key: keyof BrandSystem['colors'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onUpdateBrand(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div id="brand-view" className="p-6 max-w-6xl mx-auto space-y-6 select-none text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-500" />
            <span>نظام الهوية البصرية • Brand System</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            المرجع الإلزامي للألوان، الخطوط، والأساليب البصرية المستخدمة في كافة القوالب والتصميمات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              تم حفظ الهوية محلياً
            </span>
          )}
          <button
            id="btn-save-brand"
            onClick={handleSave}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            حفظ إعدادات الهوية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors Palette Section */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>لوحة الألوان الأساسية (Color Palette)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Hex Codes</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'primary', label: 'Primary Color (اللون الأساسي)', desc: 'يستخدم للعناصر السيادية والخلفيات الداكنة' },
              { key: 'secondary', label: 'Secondary Color (اللون الثانوي)', desc: 'للنصوص الفرعية والحدود الثانوية' },
              { key: 'accent', label: 'Accent Color (لون التمييز والـ CTA)', desc: 'يجذب انتباه العين لأهم رسالة' },
              { key: 'background', label: 'Background Color (لون الخلفية)', desc: 'الخلفية العامة للتصاميم الفاتحة' },
              { key: 'text', label: 'Text Color (لون النصوص الرئيسي)', desc: 'يحقق أعلى نسبة تباين وقراءة' },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/60"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">{label}</div>
                  <div className="text-[10px] text-slate-400">{desc}</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={(formData.colors as Record<string, any>)[key] || '#000000'}
                    onChange={(e) => handleColorChange(key as keyof BrandSystem['colors'], e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                  />
                  <span className="text-xs font-mono text-slate-300 w-16 text-center bg-slate-900 px-1.5 py-1 rounded border border-slate-800">
                    {(formData.colors as Record<string, any>)[key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Rules Section */}
        <div className="space-y-6">
          {/* Typography */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-400" />
              <span>الخطوط والطباعة (Typography Scale)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-medium">
                  خط العناوين الرئيسية (Heading Font)
                </label>
                <input
                  type="text"
                  value={formData.typography.headingFont}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, headingFont: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-medium">
                  خط المتن والنصوص (Body Font)
                </label>
                <input
                  type="text"
                  value={formData.typography.bodyFont}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, bodyFont: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-medium">
                    الحد الأقصى للخطوط (Max Fonts)
                  </label>
                  <input
                    type="number"
                    value={formData.rules.maxFonts}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rules: { ...prev.rules, maxFonts: Number(e.target.value) }
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-medium">
                    انحناء الحواف (Border Radius px)
                  </label>
                  <input
                    type="number"
                    value={formData.rules.borderRadius}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rules: { ...prev.rules, borderRadius: Number(e.target.value) }
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand Styles Tags */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>الأنماط المعتمدة (Brand Styles)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              الأساليب الجمالية التي تعرّف هوية صانع المحتوى وتمنع تشتت النمط البصري:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Modern', 'Minimal', 'Editorial', 'Typography-focused', 'Dark', 'Futuristic'].map((style) => (
                <span
                  key={style}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                    formData.styles.includes(style as any)
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
