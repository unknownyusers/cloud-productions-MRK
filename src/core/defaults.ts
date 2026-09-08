import { Project } from '../types';
import { CURATED_SWISS_ASSETS } from '../data/curatedAssets';

export const initialProject: Project = {
  version: '2.0.0',
  id: 'proj_default_01',
  name: 'Modern Visuals Studio',
  description: 'Personal creative production engine for daily graphic design & typography.',
  streakDays: 14,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  brand: {
    id: 'brand_01',
    name: 'Atelier Minimal',
    tagline: 'Precision Typography & Modern Editorial Architecture',
    colors: {
      primary: '#0F172A',
      secondary: '#475569',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#020617',
      accent: '#E11D48',
      gradients: ['linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'],
      custom: [
        { name: 'Warm Charcoal', hex: '#1E2229' },
        { name: 'Paper White', hex: '#FDFBF7' },
        { name: 'Swiss Vermilion', hex: '#E53E3E' }
      ]
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      displayFont: 'Syne',
      scaleRatio: 1.25
    },
    styles: ['Modern', 'Editorial', 'Typography-focused', 'Minimal'],
    rules: {
      maxFonts: 2,
      borderRadius: 8,
      spacingUnit: 8
    }
  },
  templates: [
    {
      id: 'tmpl_01',
      name: 'Editorial Typography Quote',
      format: 'Instagram-Post',
      width: 1080,
      height: 1080,
      category: 'Typography',
      variables: ['{{TITLE}}', '{{SUBTITLE}}', '{{DATE}}'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        {
          id: 'bg_1',
          name: 'Canvas Background',
          type: 'background',
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: true,
          visible: true,
          fill: '#0F172A'
        },
        {
          id: 'txt_sub',
          name: 'Eyebrow Tag',
          type: 'text',
          x: 80,
          y: 120,
          width: 600,
          height: 40,
          rotation: 0,
          opacity: 0.9,
          zIndex: 1,
          locked: false,
          visible: true,
          content: '01 / MODERN SYSTEM',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: '600',
          color: '#E11D48',
          variableBinding: '{{SUBTITLE}}'
        },
        {
          id: 'txt_title',
          name: 'Main Typography Statement',
          type: 'text',
          x: 80,
          y: 200,
          width: 920,
          height: 480,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          locked: false,
          visible: true,
          content: 'TYPOGRAPHY IS THE ARCHITECTURE OF THOUGHT.',
          fontSize: 72,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '800',
          color: '#F8FAFC',
          variableBinding: '{{TITLE}}'
        }
      ]
    },
    {
      id: 'tmpl_02',
      name: 'Minimal Poster Reel 9:16',
      format: 'TikTok-9:16',
      width: 1080,
      height: 1920,
      category: 'Motion & Vertical',
      variables: ['{{TITLE}}', '{{CTA}}'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        {
          id: 'bg_2',
          name: 'Vertical Background',
          type: 'background',
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: true,
          visible: true,
          fill: '#18181B'
        }
      ]
    }
  ],
  records: [
    {
      id: 'rec_example_01',
      title: 'مرحباً بك في ContentForge',
      subtitle: '01 / SYSTEM INTRODUCTION',
      cta: 'ابدأ الإنتاج الآن',
      date: new Date().toISOString().split('T')[0],
      category: 'Onboarding',
      theme: 'Modern Architecture',
      style: 'Editorial',
      templateId: 'tmpl_01',
      brandId: 'brand_01',
      seriesId: 'series_example_01',
      format: 'Instagram-Post',
      status: 'Ready',
      caption: 'هذا مجرد منشور توضيحي. النظام الآن فارغ وجاهز لإنشاء محتواك الإبداعي الخاص. اضغط على أزرار التعديل لتخصيص هذا القالب أو إنشاء محتوى جديد كلياً.\n\n#ContentForge #LocalFirst',
      hashtags: ['#GraphicDesign', '#ContentForge'],
      notes: 'يمكنك حذف هذا السجل وبدء الإنتاج مباشرة.',
      activeVariationId: 'original',
      variations: [
        {
          id: 'original',
          name: 'Original',
          label: 'Default Brand Palette',
          accentColor: '#E11D48',
          bgFill: '#0F172A',
          headingFont: 'Plus Jakarta Sans',
          title: 'WELCOME TO YOUR LOCAL-FIRST CREATIVE ENGINE.',
          subtitle: '01 / SYSTEM ACTIVE',
          cta: 'START PRODUCING'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  series: [
    {
      id: 'series_example_01',
      name: 'سلسلة التجارب الأولى',
      description: 'سلسلة تجريبية لشرح فكرة السلاسل. يمكنك إضافة قواعد ثابتة للمحتوى هنا لتوجيه الذكاء الاصطناعي.',
      category: 'Onboarding',
      style: 'Editorial & Swiss Modern',
      brandId: 'brand_01',
      templateId: 'tmpl_01',
      totalCount: 30,
      publishedCount: 1,
      rules: [
        'أقصى عدد للخطوط المستخدمة: خطان فقط',
        'الحفاظ على نسبة التباين العالي'
      ],
      createdAt: new Date().toISOString()
    }
  ],
  ideas: [
    {
      id: 'idea_example_01',
      title: 'شرح فكرة التصميم السويسري والشبكات',
      category: 'Design Theory',
      theme: 'Mathematical Layouts',
      topic: 'استخدام الشبكات الرياضية لترتيب العناصر',
      seriesId: 'series_example_01',
      format: 'Instagram-Post',
      status: 'New',
      notes: 'مثال توضيحي لبطاقة الأفكار.',
      createdAt: new Date().toISOString()
    }
  ],
  assets: CURATED_SWISS_ASSETS
};
