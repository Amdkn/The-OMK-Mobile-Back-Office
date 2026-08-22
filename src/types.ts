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
  | 'lock';

export type ThemeId = 'dark-oled' | 'warm-paper' | 'cyberpunk' | 'glassmorphism';
export type ContrastLevel = 'low' | 'medium' | 'high';
export type WallpaperId = 'minimal-mesh' | 'matrix-grid' | 'warm-studio' | 'aurora-frost' | 'deep-space' | 'cyber-neon';

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: ElementType;
  color: string;
  inDock?: boolean;
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

export type DeviceOrientation = 'portrait' | 'landscape';
export type DeviceFormFactor = 'phone' | 'tablet' | 'desktop';


