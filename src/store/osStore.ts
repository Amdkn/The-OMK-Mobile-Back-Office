import { create } from 'zustand';
import { AppId, Paradigm, ThemeId, ContrastLevel, WallpaperId, OSNotification } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

export type Workspace = 'Sandbox' | 'Development' | 'Production';

const DEFAULT_GRID_APPS: AppId[] = [
  'baas-hub', 'jaas-job', 'paas-pro', 'dashboard', 'finance', 
  'operations', 'sales', 'clients', 'growth', 'product', 
  'ontology', 'cognition', 'hr', 'terminal', 'settings'
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
  workspace: Workspace;
  
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
  setWorkspace: (w: Workspace) => void;
  
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

export const useOSStore = create<OSStoreState>((set, get) => ({
  isLocked: getInitialLockState(),
  paradigm: 'ios',
  activeApp: null,
  theme: getInitialTheme(),
  contrast: getInitialContrast(),
  wallpaper: getInitialWallpaper(),
  brightness: getInitialBrightness(),
  gridAppOrder: getInitialGridAppOrder(),
  workspace: getInitialWorkspace(),
  
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
  openApp: (id) => set({ activeApp: id, isNotificationCenterOpen: false }),
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
  },
  
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


