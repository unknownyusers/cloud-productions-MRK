import { Asset } from '../types';

export const CURATED_SWISS_ASSETS: Asset[] = [
  {
    id: 'asset_swiss_cross',
    name: 'Swiss Cross Emblem (شعار الصليب السويسري الكلاسيكي)',
    type: 'logo',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23E11D48"/><rect x="42" y="20" width="16" height="60" fill="%23FFFFFF"/><rect x="20" y="42" width="60" height="16" fill="%23FFFFFF"/></svg>',
    size: 512,
    dimensions: { width: 100, height: 100 },
    tags: ['swiss', 'cross', 'emblem', 'classic', 'red'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_bauhaus_circle',
    name: 'Bauhaus Concentric Geometry (دوائر باوهاوس الهندسية)',
    type: 'icon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="%230F172A"/><circle cx="60" cy="60" r="48" fill="none" stroke="%23E11D48" stroke-width="3"/><circle cx="60" cy="60" r="34" fill="none" stroke="%2338BDF8" stroke-width="2.5"/><circle cx="60" cy="60" r="20" fill="%23F8FAFC"/><line x1="12" y1="60" x2="108" y2="60" stroke="%2364748B" stroke-width="1.5" stroke-dasharray="3,3"/><line x1="60" y1="12" x2="60" y2="108" stroke="%2364748B" stroke-width="1.5" stroke-dasharray="3,3"/></svg>',
    size: 890,
    dimensions: { width: 120, height: 120 },
    tags: ['bauhaus', 'geometry', 'circle', 'swiss', 'badge'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_editorial_seal',
    name: 'ContentForge Verified Editorial Seal (ختم الأرشيف التحريري)',
    type: 'logo',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"><rect width="140" height="140" fill="none"/><circle cx="70" cy="70" r="62" fill="none" stroke="%23F8FAFC" stroke-width="2"/><circle cx="70" cy="70" r="54" fill="%23E11D48"/><text x="70" y="55" font-family="sans-serif" font-size="10" font-weight="900" fill="%23FFFFFF" text-anchor="middle" letter-spacing="2">CONTENTFORGE</text><text x="70" y="74" font-family="sans-serif" font-size="15" font-weight="900" fill="%23FFFFFF" text-anchor="middle">OFFICIAL</text><text x="70" y="90" font-family="sans-serif" font-size="8" font-weight="700" fill="%23CBD5E1" text-anchor="middle" letter-spacing="1">ARCHIVE // 2026</text><polygon points="70,100 66,108 74,108" fill="%23FFFFFF"/></svg>',
    size: 1024,
    dimensions: { width: 140, height: 140 },
    tags: ['seal', 'stamp', 'editorial', 'badge', 'official'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_grid_pattern',
    name: 'Swiss Modular Grid Pattern (شبكة مصفوفة سويسرية دقيقة)',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23020617"/><defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="%231E293B" stroke-width="1"/><circle cx="0" cy="0" r="1.5" fill="%23E11D48"/></pattern></defs><rect width="300" height="300" fill="url(%23grid)"/><text x="280" y="280" font-family="monospace" font-size="10" fill="%2364748B" text-anchor="end">GRID: 30x30pt // SWISS RATIO</text></svg>',
    size: 1420,
    dimensions: { width: 300, height: 300 },
    tags: ['grid', 'texture', 'background', 'swiss', 'pattern'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_edition_stamp',
    name: 'Edition 01 / Limited Release Stamp (ختم الإصدار المحدود)',
    type: 'icon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50"><rect width="160" height="50" fill="%230F172A" rx="4" stroke="%23334155" stroke-width="1.5"/><rect x="6" y="6" width="38" height="38" fill="%23E11D48" rx="2"/><text x="25" y="30" font-family="monospace" font-size="16" font-weight="900" fill="%23FFFFFF" text-anchor="middle">01</text><text x="54" y="22" font-family="sans-serif" font-size="10" font-weight="800" fill="%23F8FAFC" letter-spacing="1">LIMITED ISSUE</text><text x="54" y="36" font-family="monospace" font-size="8" fill="%2394A3B8">SWISS SER. 2026-B</text></svg>',
    size: 780,
    dimensions: { width: 160, height: 50 },
    tags: ['stamp', 'badge', 'limited', 'edition', 'vector'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_typography_monogram',
    name: 'CF Monogram Mark (حروف الهوية CF مونوغرام)',
    type: 'logo',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23020617"/><path d="M25 25 H65 V40 H40 V60 H65 V75 H25 Z" fill="%23F8FAFC"/><path d="M55 45 H85 V85 H55 Z" fill="%23E11D48"/><text x="70" y="72" font-family="sans-serif" font-size="24" font-weight="900" fill="%23FFFFFF" text-anchor="middle">F</text></svg>',
    size: 640,
    dimensions: { width: 100, height: 100 },
    tags: ['monogram', 'logo', 'cf', 'brand', 'mark'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_paper_grain',
    name: 'Architectural Charcoal Backdrop (خلفية الحبيبات الفحمية الإنشائية)',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230B0F17"/><circle cx="200" cy="200" r="180" fill="%23131B2B" opacity="0.6"/><circle cx="350" cy="50" r="120" fill="%23E11D48" opacity="0.12"/><line x1="0" y1="0" x2="400" y2="400" stroke="%231E293B" stroke-width="0.75" stroke-dasharray="6,6"/><line x1="400" y1="0" x2="0" y2="400" stroke="%231E293B" stroke-width="0.75" stroke-dasharray="6,6"/><text x="20" y="380" font-family="monospace" font-size="9" fill="%23475569">POSTER CANVAS // 1:1 RATIO</text></svg>',
    size: 1800,
    dimensions: { width: 400, height: 400 },
    tags: ['texture', 'background', 'charcoal', 'architecture', 'dark'],
    createdAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'asset_diagonal_caution',
    name: 'Caution High-Contrast Stripe (شريط التنبيه الطباعي المائل)',
    type: 'icon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40"><defs><pattern id="stripes" width="20" height="20" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="10" height="20" fill="%23FBBF24"/><rect x="10" width="10" height="20" fill="%23000000"/></pattern></defs><rect width="200" height="40" fill="url(%23stripes)"/><rect x="25" y="8" width="150" height="24" fill="%23000000" rx="3"/><text x="100" y="24" font-family="monospace" font-size="10" font-weight="900" fill="%23FBBF24" text-anchor="middle">SWISS DESIGN SYSTEM</text></svg>',
    size: 920,
    dimensions: { width: 200, height: 40 },
    tags: ['stripe', 'caution', 'contrast', 'brutalist', 'accent'],
    createdAt: '2026-09-08T00:00:00.000Z'
  }
];
