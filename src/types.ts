export type AppId =
  | 'coach-ai'
  | 'baas-hub'
  | 'jaas-job'
  | 'paas-pro'
  | 'wallet'
  | 'leads'
  | 'terminal'
  | 'lock';

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: React.ElementType;
  color: string;
  inDock?: boolean;
}

export type OSState = 'locked' | 'unlocked';
export type Paradigm = 'ios' | 'android';
