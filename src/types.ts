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
  | 'lock';

export type ThemeId = 'dark-oled' | 'warm-paper' | 'cyberpunk' | 'glassmorphism';

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: React.ElementType;
  color: string;
  inDock?: boolean;
}

export type OSState = 'locked' | 'unlocked';
export type Paradigm = 'ios' | 'android';

