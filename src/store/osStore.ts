import { create } from 'zustand';
import { AppId, Paradigm, ThemeId } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

const DEFAULT_GRID_APPS: AppId[] = [
  'baas-hub', 'jaas-job', 'paas-pro', 'dashboard', 'finance', 
  'operations', 'sales', 'clients', 'growth', 'product', 
  'ontology', 'cognition', 'hr', 'terminal', 'settings'
];

interface OSStoreState {
  isLocked: boolean;
  paradigm: Paradigm;
  activeApp: AppId | null;
  theme: ThemeId;
  gridAppOrder: AppId[];
  
  unlock: () => void;
  lock: () => void;
  setParadigm: (p: Paradigm) => void;
  openApp: (id: AppId) => void;
  closeApp: () => void;
  setTheme: (t: ThemeId) => void;
  reorderGridApps: (oldIndex: number, newIndex: number) => void;
}

const getInitialLockState = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('os_unlocked') !== 'true';
  }
  return true;
};

const getInitialGridAppOrder = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_grid_order');
    if (saved) {
      try {
        return JSON.parse(saved) as AppId[];
      } catch (e) {}
    }
  }
  return DEFAULT_GRID_APPS;
};

export const useOSStore = create<OSStoreState>((set) => ({
  isLocked: getInitialLockState(),
  paradigm: 'ios',
  activeApp: null,
  theme: 'dark-oled', // Default theme
  gridAppOrder: getInitialGridAppOrder(),
  
  unlock: () => {
    sessionStorage.setItem('os_unlocked', 'true');
    set({ isLocked: false });
  },
  lock: () => {
    sessionStorage.removeItem('os_unlocked');
    set({ isLocked: true, activeApp: null });
  },
  setParadigm: (paradigm) => set({ paradigm }),
  openApp: (id) => set({ activeApp: id }),
  closeApp: () => set({ activeApp: null }),
  setTheme: (theme) => set({ theme }),
  reorderGridApps: (oldIndex, newIndex) => set((state) => {
    const newOrder = arrayMove(state.gridAppOrder, oldIndex, newIndex);
    localStorage.setItem('os_grid_order', JSON.stringify(newOrder));
    return { gridAppOrder: newOrder };
  }),
}));
