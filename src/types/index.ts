export type SectionTab =
  | 'dashboard'
  | 'today'
  | 'ideas'
  | 'calendar'
  | 'bulk'
  | 'integrations'
  | 'projects'
  | 'templates'
  | 'brand'
  | 'assets'
  | 'content-library'
  | 'analytics'
  | 'settings';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  events: ('on_ready' | 'on_publish' | 'daily_streak')[];
  secretHeader?: string;
  preset?: 'zapier' | 'make' | 'discord' | 'slack' | 'custom';
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  webhookName: string;
  status: number;
  statusText: string;
  latencyMs: number;
  recordTitle: string;
  success: boolean;
}

export type ContentStatus = 'Idea' | 'Draft' | 'Ready' | 'Published' | 'Archived';

export interface BrandSystem {
  id: string;
  name: string;
  tagline?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    gradients: string[];
    custom: { name: string; hex: string }[];
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    displayFont: string;
    scaleRatio: number;
  };
  styles: ('Modern' | 'Minimal' | 'Editorial' | 'Dark' | 'Futuristic' | 'Typography-focused')[];
  rules: {
    maxFonts: number;
    borderRadius: number;
    spacingUnit: number;
  };
}

export interface CanvasElement {
  id: string;
  name: string;
  type: 'text' | 'image' | 'shape' | 'background';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  src?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  variableBinding?: string;
}

export type ContentFormat =
  | 'TikTok-9:16'
  | 'Instagram-Post'
  | 'Instagram-Story'
  | 'Instagram-Reel'
  | 'YouTube-Thumbnail'
  | 'YouTube-Short'
  | 'Square'
  | 'Landscape'
  | 'Custom';

export interface Template {
  id: string;
  name: string;
  format: ContentFormat;
  width: number;
  height: number;
  elements: CanvasElement[];
  variables: string[];
  thumbnail?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVariation {
  id: 'original' | 'var_a' | 'var_b' | 'var_c';
  name: 'Original' | 'Variation A' | 'Variation B' | 'Variation C';
  label: string;
  accentColor?: string;
  bgFill?: string;
  headingFont?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  emblemAssetUrl?: string;
  bgTextureUrl?: string;
}

export interface Idea {
  id: string;
  title: string;
  category: string;
  theme: string;
  topic?: string;
  seriesId?: string;
  format?: ContentFormat;
  status: 'New' | 'Saved' | 'Used' | 'Archived';
  notes?: string;
  createdAt: string;
}

export interface ContentSeries {
  id: string;
  name: string;
  description: string;
  category: string;
  style: string;
  brandId: string;
  templateId: string;
  totalCount: number;
  publishedCount: number;
  rules: string[];
  createdAt: string;
}

export interface ContentRecord {
  id: string;
  title: string;
  subtitle?: string;
  cta?: string;
  date: string;
  category: string;
  theme: string;
  style: string;
  templateId: string;
  brandId: string;
  seriesId?: string;
  format: ContentFormat;
  status: ContentStatus;
  caption: string;
  hashtags: string[];
  variations: ContentVariation[];
  activeVariationId: 'original' | 'var_a' | 'var_b' | 'var_c';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'font' | 'icon' | 'logo';
  url: string;
  size: number;
  dimensions?: { width: number; height: number };
  tags: string[];
  createdAt: string;
}

export interface Project {
  version: '2.0.0';
  id: string;
  name: string;
  description: string;
  brand: BrandSystem;
  templates: Template[];
  records: ContentRecord[];
  ideas: Idea[];
  series: ContentSeries[];
  assets: Asset[];
  activeTemplateId?: string;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
}
