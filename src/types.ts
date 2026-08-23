import { ElementType } from 'react';

export type AppId =
  | 'coach-ai'
  | 'baas-hub'
  | 'jaas-job'
  | 'paas-pro'
  | 'wallet'
  | 'leads'
  | 'terminal'
  | 'settings'
  | 'dashboard'
  | 'finance'
  | 'legal'
  | 'operations'
  | 'sales'
  | 'clients'
  | 'growth'
  | 'product'
  | 'ontology'
  | 'cognition'
  | 'hr'
  | 'security'
  | 'notes'
  | 'lock';

export interface SmartFolder {
  id: string;
  name: string;
  appIds: AppId[];
  color?: string;
  createdAt?: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'Stratégie' | 'Finance' | 'Ops' | 'Clients' | 'Idées' | 'Général';
  tags: string[];
  isPinned?: boolean;
  color?: string;
  workspace: string;
  createdAt: number;
  updatedAt: number;
}

export type ThemeId = 
  | 'dark-oled'
  | 'warm-paper'
  | 'cyberpunk'
  | 'glassmorphism'
  | 'neumorphism'
  | 'brutalism'
  | 'aurora-ui'
  | 'editorial'
  | 'liquid-glass'
  | 'claymorphism'
  | 'trust-and-authority'
  | 'vibrant-block'
  | 'matrix-hacker'
  | 'space-nebula'
  | 'midnight-tokyo'
  | 'minimal-nordic';

export type ThemeCategory = 'all' | 'dark' | 'light' | 'tactile' | 'vibrant';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  category: 'dark' | 'light' | 'tactile' | 'vibrant';
  palette: [string, string, string, string]; // 4 accent/surface colors
  isDark: boolean;
  badge?: string;
  description: string;
}

export const UI_UX_PRO_MAX_THEMES: ThemeDefinition[] = [
  {
    id: 'warm-paper',
    name: 'WARM PAPER',
    subtitle: 'the editor desk',
    category: 'light',
    palette: ['#f97316', '#ea580c', '#e8e3d8', '#f4f1ea'],
    isDark: false,
    badge: 'Light',
    description: 'Parchment texture, warm tones, editorial ink typography'
  },
  {
    id: 'glassmorphism',
    name: 'GLASSMORPHISM',
    subtitle: 'frosted confidence',
    category: 'tactile',
    palette: ['#38bdf8', '#0284c7', '#1e293b', '#090d16'],
    isDark: true,
    badge: 'Glass',
    description: 'Translucent frosted glass, specular borders, depth layering'
  },
  {
    id: 'neumorphism',
    name: 'NEUMORPHISM',
    subtitle: 'tactile and calm',
    category: 'tactile',
    palette: ['#00a896', '#028090', '#d1d9e6', '#e0e5ec'],
    isDark: false,
    badge: 'Soft 3D',
    description: 'Soft embossed/debossed dual shadows, tactile convex buttons'
  },
  {
    id: 'brutalism',
    name: 'BRUTALISM',
    subtitle: 'no bullshit',
    category: 'vibrant',
    palette: ['#ffe600', '#ff3b30', '#000000', '#fffdf0'],
    isDark: false,
    badge: 'Neo-Brutal',
    description: 'Stark high contrast, thick black borders, hard drop shadows'
  },
  {
    id: 'dark-oled',
    name: 'DARK OLED',
    subtitle: 'terminal-grade',
    category: 'dark',
    palette: ['#10b981', '#34d399', '#1e2638', '#05070c'],
    isDark: true,
    badge: 'OLED',
    description: 'Deep pitch black, zinc contrast borders, emerald accents'
  },
  {
    id: 'aurora-ui',
    name: 'AURORA UI',
    subtitle: 'warm north star',
    category: 'vibrant',
    palette: ['#00f2fe', '#4facfe', '#ff007f', '#0a091e'],
    isDark: true,
    badge: 'Cosmic',
    description: 'Flowing mesh gradients, ethereal glow, vibrant teal & magenta'
  },
  {
    id: 'cyberpunk',
    name: 'CYBERPUNK',
    subtitle: 'neon and code',
    category: 'vibrant',
    palette: ['#facc15', '#00ffff', '#272732', '#060608'],
    isDark: true,
    badge: 'Neon',
    description: 'High-tech night, radioactive yellow & cyan lasers'
  },
  {
    id: 'editorial',
    name: 'EDITORIAL',
    subtitle: 'long-form calm',
    category: 'light',
    palette: ['#1b4332', '#2d6a4f', '#ede8df', '#f8f6f0'],
    isDark: false,
    badge: 'Editorial',
    description: 'Refined serif elegance, forest green, warm linen background'
  },
  {
    id: 'liquid-glass',
    name: 'LIQUID GLASS',
    subtitle: 'apple-vision-pro',
    category: 'tactile',
    palette: ['#38bdf8', '#818cf8', '#1e1b4b', '#030712'],
    isDark: true,
    badge: 'Vision Pro',
    description: 'Dynamic refractive lensing, translucent spatial layers'
  },
  {
    id: 'claymorphism',
    name: 'CLAYMORPHISM',
    subtitle: 'squashy warmth',
    category: 'tactile',
    palette: ['#8b5cf6', '#ec4899', '#e0d8ed', '#f3f0f7'],
    isDark: false,
    badge: 'Clay 3D',
    description: 'Chunky bubbly pastels, double soft shadows, pill shapes'
  },
  {
    id: 'trust-and-authority',
    name: 'TRUST & AUTHORITY',
    subtitle: 'old money sober',
    category: 'dark',
    palette: ['#d4af37', '#e0a96d', '#1c2541', '#0b132b'],
    isDark: true,
    badge: 'Executive',
    description: 'Deep navy, Swiss typography balance, brushed gold accents'
  },
  {
    id: 'vibrant-block',
    name: 'VIBRANT BLOCK',
    subtitle: 'growth-hacker loud',
    category: 'vibrant',
    palette: ['#a3e635', '#38bdf8', '#fb7185', '#0f172a'],
    isDark: true,
    badge: 'Growth',
    description: 'Bold geometric block layouts, high color energy, lime & coral'
  },
  {
    id: 'matrix-hacker',
    name: 'MATRIX HACKER',
    subtitle: 'green phosphor rain',
    category: 'dark',
    palette: ['#00ff66', '#10b981', '#0a210f', '#020702'],
    isDark: true,
    badge: 'Phosphor',
    description: 'Pure cyberpunk terminal, green phosphor glow, scanlines'
  },
  {
    id: 'space-nebula',
    name: 'SPACE NEBULA',
    subtitle: 'deep space horizon',
    category: 'dark',
    palette: ['#d946ef', '#38bdf8', '#1b143f', '#070417'],
    isDark: true,
    badge: 'Nebula',
    description: 'Cosmic dark violet, magenta interstellar clouds, starlight cyan'
  },
  {
    id: 'midnight-tokyo',
    name: 'MIDNIGHT TOKYO',
    subtitle: 'rainy neon purple',
    category: 'dark',
    palette: ['#a855f7', '#06b6d4', '#1f1338', '#0b0914'],
    isDark: true,
    badge: 'Tokyo',
    description: 'Shinjuku rainy neon vibes, electric violet & cyan accents'
  },
  {
    id: 'minimal-nordic',
    name: 'MINIMAL NORDIC',
    subtitle: 'pure clean mono',
    category: 'light',
    palette: ['#0ea5e9', '#0f172a', '#f1f5f9', '#ffffff'],
    isDark: false,
    badge: 'Nordic',
    description: 'Snow white minimal, crisp hairline borders, alpine sky blue'
  }
];

export const DARK_THEME_IDS: ThemeId[] = [
  'dark-oled',
  'cyberpunk',
  'matrix-hacker',
  'space-nebula',
  'midnight-tokyo',
  'aurora-ui',
  'liquid-glass',
  'trust-and-authority',
  'vibrant-block',
  'glassmorphism'
];

export type ContrastLevel = 'low' | 'medium' | 'high';
export type WallpaperId = 'minimal-mesh' | 'matrix-grid' | 'warm-studio' | 'aurora-frost' | 'deep-space' | 'cyber-neon';

export type AppCategoryTag = 'all' | 'work' | 'creative' | 'tools';

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: ElementType;
  color: string;
  inDock?: boolean;
  category?: 'work' | 'creative' | 'tools';
}

export type OSState = 'locked' | 'unlocked';
export type Paradigm = 'ios' | 'android';

export type NotificationCategory = 'finance' | 'sales' | 'operations' | 'security' | 'hr' | 'system' | 'coach';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent';

export interface OSNotification {
  id: string;
  title: string;
  description: string;
  module: AppId;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
}

export type SearchResultCategory = 'apps' | 'settings' | 'actions' | 'clients' | 'files';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: SearchResultCategory;
  icon: ElementType;
  color?: string;
  badge?: string;
  action: () => void;
  keywords?: string[];
  _titleLower?: string;
  _subLower?: string;
}

export type WidgetSize = 'small' | 'medium' | 'large';

export interface AppWidget {
  id: string;
  appId: AppId;
  title: string;
  category?: string;
  size?: WidgetSize;
  value: string | number;
  subValue?: string;
  icon?: ElementType;
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  badge?: string;
  updatedAt?: string;
  actionLabel?: string;
  isPinned?: boolean;
  order?: number;
  data?: Record<string, any>;
  onClick?: () => void;
}

export interface AppEvent<T = any> {
  id: string;
  type: string;
  sender: AppId | 'system' | 'tasks' | 'calendar' | 'clients' | 'finance';
  payload?: T;
  timestamp: number;
}

export type AppLifecycleState = 'inactive' | 'active' | 'paused' | 'background';

export interface RecentActivityItem {
  id: string;
  appId: AppId;
  title: string;
  subtitle: string;
  timestamp: number;
  type: 'action' | 'edit' | 'view' | 'command' | 'sync';
  badge?: string;
  metadata?: Record<string, any>;
}

export interface PowerState {
  isLowPowerMode: boolean;
  batteryLevel: number;
  isCharging: boolean;
  syncIntervalMs: number;
  throttleFactor: number;
}

export type DeviceOrientation = 'portrait' | 'landscape';
export type DeviceFormFactor = 'phone' | 'tablet' | 'desktop';

export interface CoachAgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
}

export interface CoachAgent {
  id: string;
  name: string;
  avatarName: string;
  avatarType: 'clippy' | 'links' | 'rover' | 'merlin' | 'genie' | 'peedy' | 'genius' | 'rocky';
  role: string;
  squad: string;
  color: string;
  iconEmoji: string;
  isActive: boolean;
  position: { x: number; y: number };
  isChatOpen: boolean;
  status: 'idle' | 'thinking' | 'speaking';
  bio: string;
  personality: string;
  suggestedPrompt: string;
  messages: CoachAgentMessage[];
}


