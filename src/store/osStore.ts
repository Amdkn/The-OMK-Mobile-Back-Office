import { create } from 'zustand';
import { 
  AppId, Paradigm, ThemeId, ContrastLevel, WallpaperId, 
  OSNotification, AppEvent, RecentActivityItem, AppLifecycleState, SmartFolder 
} from '../types';
import { arrayMove } from '@dnd-kit/sortable';

export type Workspace = 'Sandbox' | 'Development' | 'Production';
export type DeviceViewMode = 'auto' | 'portrait' | 'landscape' | 'tablet';

const INITIAL_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    appId: 'clients',
    title: 'Apex Quantum Corp',
    subtitle: 'Contrat Entreprise renouvelé ($42k MRR)',
    timestamp: Date.now() - 1000 * 60 * 12,
    type: 'edit',
    badge: 'Santé 98%'
  },
  {
    id: 'act-2',
    appId: 'finance',
    title: 'Clôture Stripe & Rapprochement',
    subtitle: 'Règlement #INV-2026-94 validé ($42,000)',
    timestamp: Date.now() - 1000 * 60 * 35,
    type: 'action',
    badge: '+14.2% MoM'
  },
  {
    id: 'act-3',
    appId: 'notes',
    title: 'Cadrage IA & Gouvernance',
    subtitle: 'Note sauvegardée dans IndexedDB',
    timestamp: Date.now() - 1000 * 60 * 48,
    type: 'edit',
    badge: 'Capture'
  },
  {
    id: 'act-4',
    appId: 'operations',
    title: 'Sprint S34 - Audit SOC2 Type II',
    subtitle: '18 tâches finalisées, 2 bloquants levés',
    timestamp: Date.now() - 1000 * 60 * 75,
    type: 'action',
    badge: '92% complété'
  },
  {
    id: 'act-5',
    appId: 'hr',
    title: 'Agenda Direction & Board Sync',
    subtitle: 'Réunion Apex Corp préparée pour 14h00',
    timestamp: Date.now() - 1000 * 60 * 130,
    type: 'view',
    badge: 'C-Level'
  }
];

const DEFAULT_GRID_APPS: AppId[] = [
  'notes', 'baas-hub', 'jaas-job', 'paas-pro', 'dashboard', 'finance', 
  'operations', 'sales', 'clients', 'growth', 'product', 
  'ontology', 'cognition', 'hr', 'terminal', 'settings'
];

const DEFAULT_SMART_FOLDERS: SmartFolder[] = [
  {
    id: 'folder-core-fintech',
    name: 'Fintech & Deals',
    appIds: ['baas-hub', 'sales'],
    color: 'emerald',
    createdAt: Date.now() - 100000
  }
];

const INITIAL_NOTIFICATIONS: OSNotification[] = [
  {
    id: 'notif-1',
    title: 'Objectif MRR Dépassé (+14.2%)',
    description: 'Nouveau record mensuel atteint à $124,500 MRR. Clôture automatisée Stripe réussie.',
    module: 'finance',
    category: 'finance',
    severity: 'success',
    timestamp: 'Il y a 4 min',
    isRead: false,
    actionLabel: 'Voir Finance'
  },
  {
    id: 'notif-2',
    title: 'Lead Entreprise Qualifié : Apex Corp',
    description: 'Score ICP 98/100 ($140k ACV estimé). Rendez-vous de cadrage planifié demain à 14h00.',
    module: 'sales',
    category: 'sales',
    severity: 'info',
    timestamp: 'Il y a 18 min',
    isRead: false,
    actionLabel: 'Ouvrir Sales OS'
  },
  {
    id: 'notif-3',
    title: 'Cluster PaaS Auto-Scale Déclenché',
    description: 'Passage automatique à 8 pods suite à un pic de charge API. Latence p99 stabilisée à 28ms.',
    module: 'paas-pro',
    category: 'operations',
    severity: 'info',
    timestamp: 'Il y a 42 min',
    isRead: false,
    actionLabel: 'Inspecter PaaS'
  },
  {
    id: 'notif-4',
    title: 'Session Zero-Trust Authentifiée',
    description: 'Accès sécurisé validé pour le nœud Frankfurt-02 via clé matérielle FIDO2.',
    module: 'security',
    category: 'security',
    severity: 'success',
    timestamp: 'Il y a 1 h',
    isRead: true,
    actionLabel: 'Audit Sécurité'
  },
  {
    id: 'notif-5',
    title: 'Briefing Cognitif Quotidien Prêt',
    description: 'Synthèse des 3 priorités stratégiques et des métriques clés générée par Coach AI.',
    module: 'coach-ai',
    category: 'coach',
    severity: 'info',
    timestamp: 'Il y a 2 h',
    isRead: true,
    actionLabel: 'Consulter Briefing'
  },
  {
    id: 'notif-6',
    title: 'Cycle de Performance Trimestriel Q3',
    description: '18 entretiens 360° en attente de validation finale par les managers.',
    module: 'hr',
    category: 'hr',
    severity: 'warning',
    timestamp: 'Il y a 3 h',
    isRead: true,
    actionLabel: 'Gérer RH'
  }
];

const SIMULATED_ALERTS: Array<Omit<OSNotification, 'id' | 'timestamp' | 'isRead'>> = [
  {
    title: 'Virement Entrant Confirmé ($42,000)',
    description: 'Règlement reçu du client Entreprise Quantum Logic (Facture #INV-2026-94).',
    module: 'finance',
    category: 'finance',
    severity: 'success',
    actionLabel: 'Voir Trésorerie'
  },
  {
    title: 'Alerte Quota API : Seuil 85%',
    description: 'Le microservice d’indexation vectorielle approche du palier critique.',
    module: 'operations',
    category: 'operations',
    severity: 'warning',
    actionLabel: 'Ajuster Quota'
  },
  {
    title: 'Nouveau Contrat BaaS Signé',
    description: 'Validation de l’accord-cadre fintech validée par signature cryptographique eIDAS.',
    module: 'baas-hub',
    category: 'finance',
    severity: 'success',
    actionLabel: 'Voir Contrat'
  },
  {
    title: 'Tentative de Connexion Suspecte Bloquée',
    description: 'IP 185.220.101.44 rejetée automatiquement par le pare-feu adaptatif WAF.',
    module: 'security',
    category: 'security',
    severity: 'urgent',
    actionLabel: 'Voir Journal Sécurité'
  },
  {
    title: 'Nouveau Talent C-Level Recommandé',
    description: 'JaaS Job a identifié un profil VP Engineering correspondant à 96% à la fiche de poste.',
    module: 'jaas-job',
    category: 'hr',
    severity: 'info',
    actionLabel: 'Voir Candidature'
  }
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
  smartFolders: SmartFolder[];
  pinnedWidgetIds: string[];
  widgetOrder: string[];
  workspace: Workspace;
  deviceViewMode: DeviceViewMode;
  
  // Smart Folders Actions
  createSmartFolder: (name: string, appIds: AppId[]) => string;
  deleteSmartFolder: (folderId: string) => void;
  dissolveSmartFolder: (folderId: string) => void;
  renameSmartFolder: (folderId: string, newName: string) => void;
  addAppToFolder: (folderId: string, appId: AppId) => void;
  removeAppFromFolder: (folderId: string, appId: AppId) => void;
  
  // Power Management & Battery Throttling
  isLowPowerMode: boolean;
  
  // Recent Activity Feed
  recentActivities: RecentActivityItem[];
  
  // App Lifecycle States
  appLifecycleStates: Record<string, AppLifecycleState>;
  
  // AppEventBus - Cross-module Communication
  events: AppEvent[];
  lastEventByType: Record<string, AppEvent>;
  isDevOverlayOpen: boolean;
  
  // Status Bar & Hardware Indicators
  batteryLevel: number;
  isCharging: boolean;
  networkType: '5G' | 'LTE' | 'Wi-Fi';
  signalStrength: number;
  
  // Notification Center
  notifications: OSNotification[];
  isNotificationCenterOpen: boolean;

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
  togglePinWidget: (widgetId: string) => void;
  reorderWidgets: (oldIndex: number, newIndex: number) => void;
  setWorkspace: (w: Workspace) => void;
  setDeviceViewMode: (mode: DeviceViewMode) => void;
  
  // Power Management Actions
  toggleLowPowerMode: () => void;
  setLowPowerMode: (enabled: boolean) => void;
  
  // Recent Activities Actions
  addRecentActivity: (activity: Omit<RecentActivityItem, 'id' | 'timestamp'>) => void;
  clearRecentActivities: () => void;
  
  // App Lifecycle Actions
  setAppLifecycleState: (appId: string, state: AppLifecycleState) => void;
  
  // AppEventBus Actions
  emitEvent: (type: string, sender: AppId | 'system' | 'tasks' | 'calendar' | 'clients' | 'finance', payload?: any) => void;
  clearEvents: () => void;
  toggleDevOverlay: () => void;
  setDevOverlayOpen: (open: boolean) => void;
  
  // Hardware & Status Actions
  setBatteryLevel: (level: number) => void;
  toggleCharging: () => void;
  setSignalStrength: (strength: number) => void;
  
  // Notification Actions
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  toggleNotificationCenter: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<OSNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  simulateIncomingAlert: () => void;
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

const DEFAULT_PINNED_WIDGETS = ['widget-coach-ai', 'widget-finance', 'widget-clients', 'widget-tasks'];

const getInitialPinnedWidgets = (): string[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_pinned_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return DEFAULT_PINNED_WIDGETS;
};

const getInitialWidgetOrder = (): string[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_widget_order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return [
    'widget-alerts',
    'widget-coach-ai',
    'widget-finance',
    'widget-clients',
    'widget-tasks',
    'widget-calendar',
    'widget-leads',
    'widget-paas',
    'widget-security'
  ];
};

const getInitialSmartFolders = (): SmartFolder[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_smart_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return DEFAULT_SMART_FOLDERS;
};

const getInitialLowPowerMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('os_low_power_mode') === 'true';
  }
  return false;
};

const getInitialActivities = (): RecentActivityItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_recent_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return INITIAL_ACTIVITIES;
};

export const useOSStore = create<OSStoreState>((set, get) => ({
  isLocked: getInitialLockState(),
  paradigm: 'ios',
  activeApp: null,
  theme: getInitialTheme(),
  contrast: getInitialContrast(),
  wallpaper: getInitialWallpaper(),
  brightness: getInitialBrightness(),
  gridAppOrder: getInitialGridAppOrder(),
  smartFolders: getInitialSmartFolders(),
  pinnedWidgetIds: getInitialPinnedWidgets(),
  widgetOrder: getInitialWidgetOrder(),
  workspace: getInitialWorkspace(),
  deviceViewMode: 'auto',
  
  // Power Management
  isLowPowerMode: getInitialLowPowerMode(),
  
  // Recent Activities
  recentActivities: getInitialActivities(),
  
  // App Lifecycle States
  appLifecycleStates: {},
  
  // AppEventBus
  events: [],
  lastEventByType: {},
  isDevOverlayOpen: false,
  
  // Status Bar defaults
  batteryLevel: 88,
  isCharging: false,
  networkType: '5G',
  signalStrength: 4,
  
  // Notifications
  notifications: INITIAL_NOTIFICATIONS,
  isNotificationCenterOpen: false,
  
  unlock: () => {
    sessionStorage.setItem('os_unlocked', 'true');
    set({ isLocked: false });
  },
  lock: () => {
    sessionStorage.removeItem('os_unlocked');
    set({ isLocked: true, activeApp: null, isNotificationCenterOpen: false });
  },
  setParadigm: (paradigm) => set({ paradigm }),
  openApp: (id) => {
    const prevApp = get().activeApp;
    set((state) => {
      const updatedStates = { ...state.appLifecycleStates };
      if (prevApp && prevApp !== id) {
        updatedStates[prevApp] = 'background';
      }
      updatedStates[id] = 'active';
      return { 
        activeApp: id, 
        isNotificationCenterOpen: false,
        appLifecycleStates: updatedStates
      };
    });
    get().emitEvent('APP_OPENED', id, { appId: id, prevApp });
  },
  closeApp: () => {
    const currentApp = get().activeApp;
    set((state) => {
      const updatedStates = { ...state.appLifecycleStates };
      if (currentApp) {
        updatedStates[currentApp] = 'inactive';
      }
      return { 
        activeApp: null,
        appLifecycleStates: updatedStates
      };
    });
    if (currentApp) {
      get().emitEvent('APP_CLOSED', currentApp, { appId: currentApp });
    }
  },
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
  togglePinWidget: (widgetId) => set((state) => {
    const exists = state.pinnedWidgetIds.includes(widgetId);
    const newPinned = exists 
      ? state.pinnedWidgetIds.filter(id => id !== widgetId)
      : [...state.pinnedWidgetIds, widgetId];
    localStorage.setItem('os_pinned_widgets', JSON.stringify(newPinned));
    return { pinnedWidgetIds: newPinned };
  }),
  reorderWidgets: (oldIndex, newIndex) => set((state) => {
    const newOrder = arrayMove(state.widgetOrder, oldIndex, newIndex);
    localStorage.setItem('os_widget_order', JSON.stringify(newOrder));
    return { widgetOrder: newOrder };
  }),
  createSmartFolder: (name, appIds) => {
    const folderId = `folder-${Date.now()}`;
    const newFolder: SmartFolder = {
      id: folderId,
      name: name.trim() || 'Dossier',
      appIds: [...new Set(appIds)],
      color: 'emerald',
      createdAt: Date.now()
    };
    set((state) => {
      const updated = [...state.smartFolders, newFolder];
      localStorage.setItem('os_smart_folders', JSON.stringify(updated));
      return { smartFolders: updated };
    });
    get().emitEvent('FOLDER_CREATED', 'system', { folder: newFolder });
    return folderId;
  },
  deleteSmartFolder: (folderId) => set((state) => {
    const updated = state.smartFolders.filter(f => f.id !== folderId);
    localStorage.setItem('os_smart_folders', JSON.stringify(updated));
    get().emitEvent('FOLDER_DELETED', 'system', { folderId });
    return { smartFolders: updated };
  }),
  renameSmartFolder: (folderId, newName) => set((state) => {
    const updated = state.smartFolders.map(f => 
      f.id === folderId ? { ...f, name: newName.trim() || 'Dossier' } : f
    );
    localStorage.setItem('os_smart_folders', JSON.stringify(updated));
    return { smartFolders: updated };
  }),
  addAppToFolder: (folderId, appId) => set((state) => {
    const updated = state.smartFolders.map(f => {
      if (f.id === folderId) {
        return { ...f, appIds: [...new Set([...f.appIds, appId])] };
      }
      return f;
    });
    localStorage.setItem('os_smart_folders', JSON.stringify(updated));
    get().emitEvent('APP_ADDED_TO_FOLDER', appId, { folderId, appId });
    return { smartFolders: updated };
  }),
  removeAppFromFolder: (folderId, appId) => set((state) => {
    // 1. Ensure the app is in gridAppOrder so it re-appears on the desktop grid
    const existsInGrid = state.gridAppOrder.includes(appId);
    const updatedGrid = existsInGrid ? state.gridAppOrder : [...state.gridAppOrder, appId];

    // 2. Remove app from the folder, delete folder if empty or only 1 item remaining (dissolve)
    const updatedFolders = state.smartFolders
      .map(f => {
        if (f.id === folderId) {
          return { ...f, appIds: f.appIds.filter(id => id !== appId) };
        }
        return f;
      })
      .filter(f => f.appIds.length > 0);

    localStorage.setItem('os_smart_folders', JSON.stringify(updatedFolders));
    localStorage.setItem('os_grid_order', JSON.stringify(updatedGrid));
    get().emitEvent('APP_REMOVED_FROM_FOLDER', appId, { folderId, appId });

    return { 
      smartFolders: updatedFolders,
      gridAppOrder: updatedGrid 
    };
  }),
  dissolveSmartFolder: (folderId: string) => set((state) => {
    const folder = state.smartFolders.find(f => f.id === folderId);
    if (!folder) return state;

    // Restore all apps from the folder back into the root grid order if missing
    let updatedGrid = [...state.gridAppOrder];
    folder.appIds.forEach(id => {
      if (!updatedGrid.includes(id)) {
        updatedGrid.push(id);
      }
    });

    const updatedFolders = state.smartFolders.filter(f => f.id !== folderId);
    localStorage.setItem('os_smart_folders', JSON.stringify(updatedFolders));
    localStorage.setItem('os_grid_order', JSON.stringify(updatedGrid));
    get().emitEvent('FOLDER_DISSOLVED', 'system', { folderId });

    return {
      smartFolders: updatedFolders,
      gridAppOrder: updatedGrid
    };
  }),
  toggleDevOverlay: () => set((state) => ({ isDevOverlayOpen: !state.isDevOverlayOpen })),
  setDevOverlayOpen: (open) => set({ isDevOverlayOpen: open }),
  setWorkspace: (w) => {
    localStorage.setItem('os_workspace', w);
    set({ workspace: w });
    get().emitEvent('WORKSPACE_CHANGED', 'system', { workspace: w });
  },
  setDeviceViewMode: (mode) => set({ deviceViewMode: mode }),
  
  // Power Management Actions
  toggleLowPowerMode: () => set((state) => {
    const nextVal = !state.isLowPowerMode;
    localStorage.setItem('os_low_power_mode', nextVal.toString());
    get().emitEvent('POWER_STATE_CHANGED', 'system', { isLowPowerMode: nextVal });
    return { isLowPowerMode: nextVal };
  }),
  setLowPowerMode: (enabled) => {
    localStorage.setItem('os_low_power_mode', enabled.toString());
    set({ isLowPowerMode: enabled });
    get().emitEvent('POWER_STATE_CHANGED', 'system', { isLowPowerMode: enabled });
  },
  
  // Recent Activities Actions
  addRecentActivity: (activity) => set((state) => {
    const newAct: RecentActivityItem = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now()
    };
    // Keep max 20, deduplicate consecutive identical items
    const filtered = state.recentActivities.filter(a => !(a.appId === newAct.appId && a.title === newAct.title));
    const nextActivities = [newAct, ...filtered].slice(0, 20);
    localStorage.setItem('os_recent_activities', JSON.stringify(nextActivities));
    return { recentActivities: nextActivities };
  }),
  clearRecentActivities: () => {
    localStorage.removeItem('os_recent_activities');
    set({ recentActivities: [] });
  },
  
  // App Lifecycle Actions
  setAppLifecycleState: (appId, lifecycleState) => set((state) => {
    const updated = { ...state.appLifecycleStates, [appId]: lifecycleState };
    return { appLifecycleStates: updated };
  }),
  
  // AppEventBus Action Implementation
  emitEvent: (type, sender, payload) => {
    const event: AppEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      sender,
      payload,
      timestamp: Date.now()
    };
    set((state) => ({
      events: [event, ...state.events.slice(0, 49)], // keep last 50 events
      lastEventByType: {
        ...state.lastEventByType,
        [type]: event
      }
    }));
  },
  clearEvents: () => set({ events: [], lastEventByType: {} }),
  
  // Status & Hardware
  setBatteryLevel: (batteryLevel) => set({ batteryLevel: Math.max(1, Math.min(100, batteryLevel)) }),
  toggleCharging: () => set((state) => ({ isCharging: !state.isCharging })),
  setSignalStrength: (signalStrength) => set({ signalStrength }),
  
  // Notifications
  openNotificationCenter: () => set({ isNotificationCenterOpen: true }),
  closeNotificationCenter: () => set({ isNotificationCenterOpen: false }),
  toggleNotificationCenter: () => set((state) => ({ isNotificationCenterOpen: !state.isNotificationCenterOpen })),
  
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
  
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  
  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearAllNotifications: () => set({ notifications: [] }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: "À l'instant",
        isRead: false
      },
      ...state.notifications
    ]
  })),
  
  simulateIncomingAlert: () => {
    const randomAlert = SIMULATED_ALERTS[Math.floor(Math.random() * SIMULATED_ALERTS.length)];
    get().addNotification(randomAlert);
  }
}));


