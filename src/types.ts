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

export type SearchResultCategory = 'apps' | 'settings' | 'actions';

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


