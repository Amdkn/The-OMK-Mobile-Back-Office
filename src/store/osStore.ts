import { create } from 'zustand';
import { AppId, Paradigm, ThemeId, ContrastLevel, WallpaperId } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

export type Workspace = 'Sandbox' | 'Development' | 'Production';

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
  contrast: ContrastLevel;
  wallpaper: WallpaperId;
  brightness: number;
  gridAppOrder: AppId[];
  workspace: Workspace;
  
  unlock: () => void;
  lock: () => void;
  setParadigm: (p: Paradigm) => void;
  openApp: (id: AppId) => void;
  closeApp: () => void;
  setTheme: (t: ThemeId) => void;
  setContrast: (c: ContrastLevel) => void;
  setWallpaper: (w: WallpaperId) => void;
  setBrightness: (b: number) => void;
  reorderGridApps: (oldIndex: number, newIndex: number) => void;
  setWorkspace: (w: Workspace) => void;
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

const getInitialWorkspace = (): Workspace => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_workspace');
    if (saved === 'Sandbox' || saved === 'Development' || saved === 'Production') {
      return saved;
    }
  }
  return 'Sandbox';
};

const getInitialTheme = (): ThemeId => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_theme');
    if (saved === 'dark-oled' || saved === 'warm-paper' || saved === 'cyberpunk' || saved === 'glassmorphism') {
      return saved;
    }
  }
  return 'warm-paper';
};

const getInitialContrast = (): ContrastLevel => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_contrast');
    if (saved === 'low' || saved === 'medium' || saved === 'high') {
      return saved;
    }
  }
  return 'medium';
};

const getInitialWallpaper = (): WallpaperId => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_wallpaper');
    if (saved) {
      return saved as WallpaperId;
    }
  }
  return 'warm-studio';
};

const getInitialBrightness = (): number => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_brightness');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 40 && parsed <= 100) return parsed;
    }
  }
  return 100;
};

export const useOSStore = create<OSStoreState>((set) => ({
  isLocked: getInitialLockState(),
  paradigm: 'ios',
  activeApp: null,
  theme: getInitialTheme(),
  contrast: getInitialContrast(),
  wallpaper: getInitialWallpaper(),
  brightness: getInitialBrightness(),
  gridAppOrder: getInitialGridAppOrder(),
  workspace: getInitialWorkspace(),
  
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
  setTheme: (theme) => {
    localStorage.setItem('os_theme', theme);
    set({ theme });
  },
  setContrast: (contrast) => {
    localStorage.setItem('os_contrast', contrast);
    set({ contrast });
  },
  setWallpaper: (wallpaper) => {
    localStorage.setItem('os_wallpaper', wallpaper);
    set({ wallpaper });
  },
  setBrightness: (brightness) => {
    localStorage.setItem('os_brightness', brightness.toString());
    set({ brightness });
  },
  reorderGridApps: (oldIndex, newIndex) => set((state) => {
    const newOrder = arrayMove(state.gridAppOrder, oldIndex, newIndex);
    localStorage.setItem('os_grid_order', JSON.stringify(newOrder));
    return { gridAppOrder: newOrder };
  }),
  setWorkspace: (w) => {
    localStorage.setItem('os_workspace', w);
    set({ workspace: w });
  }
}));

