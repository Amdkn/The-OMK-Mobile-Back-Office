import { create } from 'zustand';
import { 
  AppId, Paradigm, ThemeId, ContrastLevel, WallpaperId, 
  OSNotification, AppEvent, RecentActivityItem, AppLifecycleState, SmartFolder,
  UI_UX_PRO_MAX_THEMES, DARK_THEME_IDS, CoachAgent
} from '../types';
import { arrayMove } from '@dnd-kit/sortable';
import { haptics } from '../services/haptics';

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
  'notes', 'jaas-job', 'job-app', 'dashboard', 'finance', 
  'operations', 'sales', 'clients', 'growth', 'product', 
  'ontology', 'cognition', 'hr', 'terminal', 'settings',
  'baas-hub', 'paas-pro'
];

const DEFAULT_SMART_FOLDERS: SmartFolder[] = [];

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

export const INITIAL_COACH_AGENTS: CoachAgent[] = [
  {
    id: 'agent-clippy',
    name: 'Cerritos-HoloDeck',
    avatarName: 'Clippy',
    avatarType: 'clippy',
    role: 'Assistant Général & Navigation',
    squad: 'HoloDeck Core',
    color: 'emerald',
    iconEmoji: '📎',
    isActive: true,
    position: { x: 20, y: 150 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Agent intelligent de bureau multi-tâches, expert en productivité et orientation dans l\'écosystème OMK.',
    personality: 'Serviable, ultra-rapide, proactif et empathique.',
    suggestedPrompt: "Comment puis-je t'aider à organiser ta journée ou naviguer dans les applications ?",
    messages: [
      { id: 'm1', sender: 'agent', text: 'Bonjour ! Je suis Clippy (Cerritos-HoloDeck). Tu peux me déplacer n\'importe où sur ton écran ! Comment puis-je t\'aider ?', timestamp: Date.now() - 60000 }
    ]
  },
  {
    id: 'agent-links',
    name: 'Squad-Orville',
    avatarName: 'Links',
    avatarType: 'links',
    role: 'Assistant DevOps & Cloud',
    squad: 'Orville Infra',
    color: 'sky',
    iconEmoji: '🐱',
    isActive: false,
    position: { x: 250, y: 220 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Surveille la santé des microservices BaaS, l\'intégrité des pipelines CI/CD et la latence.',
    personality: 'Analytique, précis, toujours vigilant sur la télémétrie.',
    suggestedPrompt: 'Vérifier la latence Supabase et l\'état des 14 microservices.',
    messages: [
      { id: 'm2', sender: 'agent', text: 'Télémétrie au vert : 14/14 microservices opérationnels. Prêt pour un audit d\'infrastructure.', timestamp: Date.now() - 45000 }
    ]
  },
  {
    id: 'agent-rover',
    name: 'Squad-Discovery',
    avatarName: 'Rover',
    avatarType: 'rover',
    role: 'Assistant Données & BI',
    squad: 'Discovery Data',
    color: 'amber',
    iconEmoji: '🐶',
    isActive: false,
    position: { x: 30, y: 320 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Chien de chasse des métriques de croissance, analyseur de churn et détecteur d\'opportunités MRR.',
    personality: 'Énergique, orienté chiffres et conversion.',
    suggestedPrompt: 'Analyser les prévisions MRR du trimestre et la vélocité commerciale.',
    messages: [
      { id: 'm3', sender: 'agent', text: 'Waf ! Le MRR a augmenté de +14.2% ce mois-ci. Tape ta question pour creuser les data.', timestamp: Date.now() - 30000 }
    ]
  },
  {
    id: 'agent-merlin',
    name: 'Squad-SNW',
    avatarName: 'Merlin',
    avatarType: 'merlin',
    role: 'Architecte Code & Systèmes',
    squad: 'Strange New Worlds',
    color: 'purple',
    iconEmoji: '🧙‍♂️',
    isActive: false,
    position: { x: 250, y: 380 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Grand maître de l\'ingénierie logicielle, des schémas SQL RLS et des abstractions propres.',
    personality: 'Sage, méthodique, intransigeant sur la propreté du code.',
    suggestedPrompt: 'Inspecter les règles de sécurité RLS et l\'optimisation TypeScript.',
    messages: [
      { id: 'm4', sender: 'agent', text: 'Par les arcanes du clean code ! Le typage strict est garanti sur l\'ensemble de l\'OS.', timestamp: Date.now() - 20000 }
    ]
  },
  {
    id: 'agent-genie',
    name: 'Squad-Enterprise',
    avatarName: 'Genie',
    avatarType: 'genie',
    role: 'Opérations & Automatisation',
    squad: 'Enterprise Core',
    color: 'blue',
    iconEmoji: '🧞‍♂️',
    isActive: false,
    position: { x: 30, y: 460 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Exécute tes vœux opérationnels : workflows n8n, génération de devis et synchronisation ERP.',
    personality: 'Magique, serviable et orienté exécution instantanée.',
    suggestedPrompt: 'Exécuter le batch de relance factures impayées.',
    messages: [
      { id: 'm5', sender: 'agent', text: 'Vos ordres sont mes commandes. Quel workflow souhaitez-vous déclencher ?', timestamp: Date.now() - 10000 }
    ]
  },
  {
    id: 'agent-peedy',
    name: 'Squad-Protostar',
    avatarName: 'Peedy',
    avatarType: 'peedy',
    role: 'Coach RH & Talent',
    squad: 'Protostar Human',
    color: 'lime',
    iconEmoji: '🦜',
    isActive: false,
    position: { x: 250, y: 500 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Perroquet expert en dynamique humaine, préparation des 1-on-1 et bien-être d\'équipe.',
    personality: 'Chaleureux, communicatif et bienveillant.',
    suggestedPrompt: 'Préparer l\'ordre du jour du prochain 1-on-1 avec Marc Dupont.',
    messages: [
      { id: 'm6', sender: 'agent', text: 'Cui-cui ! Prêt à synthétiser les feedbacks et valoriser l\'excellence de l\'équipe.', timestamp: Date.now() - 5000 }
    ]
  },
  {
    id: 'agent-genius',
    name: 'Squad-GreenLantern-People',
    avatarName: 'Genius',
    avatarType: 'genius',
    role: 'Stratège Croissance & Marketing',
    squad: 'Green Lantern Growth',
    color: 'teal',
    iconEmoji: '🧠',
    isActive: false,
    position: { x: 120, y: 220 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Cerveau analytique dédié au funnel d\'acquisition, aux campagnes payantes et au SEO.',
    personality: 'Visionnaire, axé sur les résultats et le ROI.',
    suggestedPrompt: 'Optimiser le budget publicitaire Google Ads et le taux de conversion.',
    messages: [
      { id: 'm7', sender: 'agent', text: 'Stratégie de croissance prête pour le prochain trimestre. Demandons un audit de campagne.', timestamp: Date.now() }
    ]
  },
  {
    id: 'agent-rocky',
    name: 'Jerry-SYSTEMIZE-Squad',
    avatarName: 'Rocky',
    avatarType: 'rocky',
    role: 'Sécurité & Conformité SOC2',
    squad: 'Systemize Defense',
    color: 'rose',
    iconEmoji: '🥊',
    isActive: false,
    position: { x: 150, y: 360 },
    isChatOpen: false,
    status: 'idle',
    bio: 'Boxeur de la sécurité informatique, veille à la conformité RGPD, aux logs d\'audit et aux tokens.',
    personality: 'Robuste, protecteur, intransigeant face aux menaces.',
    suggestedPrompt: 'Lancer un scan de sécurité et vérifier les sessions actives.',
    messages: [
      { id: 'm8', sender: 'agent', text: 'Garde levée ! Périmètre réseau sécurisé et politiques RLS verrouillées.', timestamp: Date.now() }
    ]
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
  networkMode: 'wifi' | '5g';
  setNetworkMode: (mode: 'wifi' | '5g') => void;
  toggleNetworkMode: () => void;
  
  // Theme Switcher Popover Window
  isThemeMenuOpen: boolean;
  openThemeMenu: () => void;
  closeThemeMenu: () => void;
  toggleThemeMenu: () => void;
  setThemeMenuOpen: (open: boolean) => void;
  cycleRandomDarkTheme: () => ThemeId;

  // Coach OS Agents System (inspired by Ryos & OMK Desktop Web OS)
  agents: CoachAgent[];
  isAgentsMenuOpen: boolean;
  openAgentsMenu: () => void;
  closeAgentsMenu: () => void;
  toggleAgentsMenu: () => void;
  toggleAgentActive: (agentId: string) => void;
  setAgentActive: (agentId: string, active: boolean) => void;
  toggleAgentChat: (agentId: string) => void;
  closeAllAgentChats: () => void;
  setAgentPosition: (agentId: string, pos: { x: number; y: number }) => void;
  resetAllAgentPositions: () => void;
  turnOffAllAgents: () => void;
  activateAllAgents: () => void;
  sendAgentMessage: (agentId: string, text: string) => void;
  
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
  sortGridApps: (mode: 'name' | 'category' | 'default') => void;
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

const getInitialGridAppOrder = (): AppId[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_grid_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppId[];
        // Filter valid app IDs
        const valid = parsed.filter(id => DEFAULT_GRID_APPS.includes(id));
        // Append any missing apps from DEFAULT_GRID_APPS (such as 'job-app')
        const missing = DEFAULT_GRID_APPS.filter(id => !valid.includes(id));
        
        let merged = [...valid];
        if (missing.includes('job-app')) {
          const jaasIdx = merged.indexOf('jaas-job');
          if (jaasIdx !== -1) {
            merged.splice(jaasIdx + 1, 0, 'job-app');
          } else {
            merged.unshift('job-app');
          }
        }
        for (const m of missing) {
          if (!merged.includes(m)) {
            merged.push(m);
          }
        }
        if (merged.length > 0) return merged;
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
    const saved = localStorage.getItem('os_theme') as ThemeId | null;
    if (saved && UI_UX_PRO_MAX_THEMES.some(t => t.id === saved)) {
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

const DEFAULT_PINNED_WIDGETS = ['widget-coach-ai', 'widget-jaas', 'widget-finance', 'widget-clients', 'widget-tasks'];

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
    'widget-jaas',
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
  networkMode: 'wifi',
  setNetworkMode: (mode) => set({ networkMode: mode }),
  toggleNetworkMode: () => set((state) => ({ networkMode: state.networkMode === 'wifi' ? '5g' : 'wifi' })),
  
  // Theme Switcher Popover Window
  isThemeMenuOpen: false,
  openThemeMenu: () => set({ isThemeMenuOpen: true, isNotificationCenterOpen: false }),
  closeThemeMenu: () => set({ isThemeMenuOpen: false }),
  toggleThemeMenu: () => set((state) => ({ isThemeMenuOpen: !state.isThemeMenuOpen, isNotificationCenterOpen: false })),
  setThemeMenuOpen: (open) => set({ isThemeMenuOpen: open }),
  cycleRandomDarkTheme: () => {
    const currentTheme = get().theme;
    const available = DARK_THEME_IDS.filter(t => t !== currentTheme);
    const chosen = available[Math.floor(Math.random() * available.length)] || 'dark-oled';
    
    localStorage.setItem('os_theme', chosen);
    set({ theme: chosen });
    
    // Also toggle or ensure Low Power mode with haptics
    const isNowLowPower = !get().isLowPowerMode;
    get().setLowPowerMode(isNowLowPower);
    haptics.trigger('selection');
    
    const themeDef = UI_UX_PRO_MAX_THEMES.find(t => t.id === chosen);
    get().addNotification({
      module: 'settings',
      title: isNowLowPower ? '⚡ Mode Éco & Thème Sombre' : '🔋 Mode Standard',
      description: `Thème [${themeDef?.name || chosen}] appliqué pour optimiser la batterie.`,
      severity: 'info',
      category: 'system'
    });
    
    return chosen;
  },
  
  // Notifications
  notifications: INITIAL_NOTIFICATIONS,
  isNotificationCenterOpen: false,
  
  unlock: () => {
    sessionStorage.setItem('os_unlocked', 'true');
    set({ isLocked: false });
  },
  lock: () => {
    sessionStorage.removeItem('os_unlocked');
    set({ isLocked: true, activeApp: null, isNotificationCenterOpen: false, isThemeMenuOpen: false });
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
        isThemeMenuOpen: false,
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
  sortGridApps: (mode) => set((state) => {
    const appNames: Record<string, string> = {
      'notes': 'Notes',
      'coach-ai': 'Coach AI',
      'baas-hub': 'BaaS Hub',
      'jaas-job': 'JaaS JOB',
      'job-app': 'Job App',
      'paas-pro': 'PaaS PRO',
      'wallet': 'Wallet',
      'leads': 'Leads',
      'terminal': 'Terminal',
      'dashboard': 'Dashboard',
      'finance': 'Finance',
      'operations': 'Operations',
      'sales': 'Sales OS',
      'clients': 'Clients',
      'growth': 'Growth',
      'product': 'Product',
      'ontology': 'Ontology',
      'cognition': 'Cognition',
      'hr': 'People / HR',
      'settings': 'Settings',
      'lock': 'Lock'
    };

    const appCategories: Record<string, string> = {
      'notes': '1_Productivite',
      'coach-ai': '2_IA_Strategie',
      'cognition': '2_IA_Strategie',
      'ontology': '2_IA_Strategie',
      'baas-hub': '3_Finance_Business',
      'finance': '3_Finance_Business',
      'wallet': '3_Finance_Business',
      'sales': '4_Ventes_Croissance',
      'leads': '4_Ventes_Croissance',
      'clients': '4_Ventes_Croissance',
      'growth': '4_Ventes_Croissance',
      'paas-pro': '5_Dev_Infra',
      'product': '5_Dev_Infra',
      'terminal': '5_Dev_Infra',
      'jaas-job': '6_Operations_RH',
      'job-app': '6_Operations_RH',
      'operations': '6_Operations_RH',
      'hr': '6_Operations_RH',
      'dashboard': '7_Systeme_Outils',
      'settings': '7_Systeme_Outils',
      'lock': '7_Systeme_Outils'
    };

    let sorted: AppId[];
    if (mode === 'default') {
      sorted = [...DEFAULT_GRID_APPS];
    } else if (mode === 'name') {
      sorted = [...state.gridAppOrder].sort((a, b) => {
        const nameA = appNames[a] || a;
        const nameB = appNames[b] || b;
        return nameA.localeCompare(nameB);
      });
    } else {
      // category
      sorted = [...state.gridAppOrder].sort((a, b) => {
        const catA = appCategories[a] || '9_Other';
        const catB = appCategories[b] || '9_Other';
        if (catA === catB) {
          const nameA = appNames[a] || a;
          const nameB = appNames[b] || b;
          return nameA.localeCompare(nameB);
        }
        return catA.localeCompare(catB);
      });
    }

    localStorage.setItem('os_grid_order', JSON.stringify(sorted));
    get().emitEvent('GRID_REORDERED', 'system', { mode, order: sorted });
    return { gridAppOrder: sorted };
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
    // 1. Ensure the removed app is in gridAppOrder so it re-appears on the desktop grid
    let updatedGrid = state.gridAppOrder.includes(appId) ? [...state.gridAppOrder] : [...state.gridAppOrder, appId];

    // 2. Remove app from the folder and safely handle single-item folder dissolution
    const updatedFolders: SmartFolder[] = [];
    state.smartFolders.forEach(f => {
      if (f.id === folderId) {
        const remaining = f.appIds.filter(id => id !== appId);
        if (remaining.length === 1) {
          // If only 1 app remains, dissolve the folder and ensure the remaining app is also on the grid
          const remainingAppId = remaining[0];
          if (!updatedGrid.includes(remainingAppId)) {
            updatedGrid.push(remainingAppId);
          }
        } else if (remaining.length > 1) {
          updatedFolders.push({ ...f, appIds: remaining });
        }
      } else {
        updatedFolders.push(f);
      }
    });

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
  },

  // Coach OS Agents System (inspired by Ryos & OMK Desktop Web OS)
  agents: INITIAL_COACH_AGENTS,
  isAgentsMenuOpen: false,
  openAgentsMenu: () => {
    haptics.trigger('light');
    set({ isAgentsMenuOpen: true, isThemeMenuOpen: false, isNotificationCenterOpen: false });
  },
  closeAgentsMenu: () => set({ isAgentsMenuOpen: false }),
  toggleAgentsMenu: () => {
    haptics.trigger('light');
    set((state) => ({ 
      isAgentsMenuOpen: !state.isAgentsMenuOpen,
      isThemeMenuOpen: false,
      isNotificationCenterOpen: false
    }));
  },
  toggleAgentActive: (agentId: string) => {
    haptics.trigger('selection');
    const defaultPos = INITIAL_COACH_AGENTS.find(a => a.id === agentId)?.position || { x: 30, y: 150 };
    set((state) => ({
      agents: state.agents.map((ag) => {
        if (ag.id !== agentId) return ag;
        const willBeActive = !ag.isActive;
        return { 
          ...ag, 
          isActive: willBeActive,
          // When activating, ALWAYS reset position back inside screen frame!
          position: willBeActive ? defaultPos : ag.position
        };
      })
    }));
  },
  setAgentActive: (agentId: string, active: boolean) => {
    haptics.trigger('selection');
    const defaultPos = INITIAL_COACH_AGENTS.find(a => a.id === agentId)?.position || { x: 30, y: 150 };
    set((state) => ({
      agents: state.agents.map((ag) => {
        if (ag.id !== agentId) return ag;
        return { 
          ...ag, 
          isActive: active,
          // When activating, ALWAYS reset position back inside screen frame!
          position: active ? defaultPos : ag.position
        };
      })
    }));
  },
  toggleAgentChat: (agentId: string) => {
    haptics.trigger('selection');
    set((state) => ({
      agents: state.agents.map((ag) =>
        ag.id === agentId ? { ...ag, isChatOpen: !ag.isChatOpen } : ag
      )
    }));
  },
  closeAllAgentChats: () => {
    set((state) => ({
      agents: state.agents.map((ag) => ({ ...ag, isChatOpen: false }))
    }));
  },
  setAgentPosition: (agentId: string, pos: { x: number; y: number }) => {
    set((state) => ({
      agents: state.agents.map((ag) =>
        ag.id === agentId ? { ...ag, position: pos } : ag
      )
    }));
  },
  resetAllAgentPositions: () => {
    haptics.trigger('success');
    set((state) => ({
      agents: state.agents.map((ag) => {
        const defaultPos = INITIAL_COACH_AGENTS.find(a => a.id === ag.id)?.position || { x: 30, y: 150 };
        return { ...ag, position: defaultPos };
      })
    }));
  },
  turnOffAllAgents: () => {
    haptics.trigger('warning');
    set((state) => ({
      agents: state.agents.map((ag) => ({ ...ag, isActive: false, isChatOpen: false }))
    }));
  },
  activateAllAgents: () => {
    haptics.trigger('success');
    set((state) => ({
      agents: state.agents.map((ag) => {
        const defaultPos = INITIAL_COACH_AGENTS.find(a => a.id === ag.id)?.position || { x: 30, y: 150 };
        return { ...ag, isActive: true, position: defaultPos };
      })
    }));
  },
  sendAgentMessage: (agentId: string, text: string) => {
    if (!text.trim()) return;
    const userMsg = {
      id: `msg-${Date.now()}-u`,
      sender: 'user' as const,
      text: text.trim(),
      timestamp: Date.now()
    };
    
    set((state) => ({
      agents: state.agents.map((ag) => {
        if (ag.id !== agentId) return ag;
        return {
          ...ag,
          status: 'thinking',
          messages: [...ag.messages, userMsg]
        };
      })
    }));

    // Generate smart context-aware agent response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'agent-clippy': [
          "J'ai vérifié vos applications ouvertes. Tout est synchronisé avec les bases locales IndexedDB.",
          "Excellente idée ! J'ai enregistré cette tâche dans le journal du système.",
          "Besoin d'un raccourci ? Tapez ⌘K ou cliquez sur les widgets pour y accéder directement."
        ],
        'agent-links': [
          "Latence Supabase stable à 38ms. Tous les microservices REST et GraphQL répondent avec succès (200 OK).",
          "Pipeline CI/CD vérifié : 0 régression détectée sur l'ensemble des 18 modules applicatifs."
        ],
        'agent-rover': [
          "Analyse de conversion : Le taux de rétention client a bondi de +8.4% ce trimestre !",
          "L'objectif prévisionnel de $150k MRR sera atteint d'ici la fin du mois selon les tendances de facturation."
        ],
        'agent-merlin': [
          "Architecture vérifiée : Typage TypeScript strict et politiques RLS Supabase validées avec succès.",
          "Le design system UI/UX Pro Max applique désormais toutes les contraintes de contrastes et micro-interactions."
        ],
        'agent-genie': [
          "Workflow n8n de réconciliation financière exécuté avec succès. Aucune divergence détectée.",
          "J'ai synchronisé les nouvelles opportunités du pipeline Sales OS avec les contrats clients."
        ],
        'agent-peedy': [
          "Entretien 1-on-1 préparé avec succès. Les objectifs trimestriels et scores CSAT sont consolidés.",
          "Les demandes de congés et les plannings d'astreinte sont synchronisés au calendrier."
        ],
        'agent-genius': [
          "Score SEO en hausse de +12 points. Les mots-clés stratégiques se positionnent dans le Top 3.",
          "Campagne d'acquisition optimisée : Coût par acquisition (CAC) réduit de 18% ce mois-ci."
        ],
        'agent-rocky': [
          "Scan de sécurité complet : 0 vulnérabilité détectée. Pare-feu applicatif et chiffrement AES-256 actifs.",
          "Toutes les sessions de l'organisation respectent les exigences de conformité SOC2 Type II."
        ]
      };
      
      const pool = responses[agentId] || ["Ordre bien reçu et exécuté dans l'écosystème OMK !"];
      const replyText = pool[Math.floor(Math.random() * pool.length)];

      const agentReply = {
        id: `msg-${Date.now()}-a`,
        sender: 'agent' as const,
        text: replyText,
        timestamp: Date.now()
      };

      set((state) => ({
        agents: state.agents.map((ag) => {
          if (ag.id !== agentId) return ag;
          return {
            ...ag,
            status: 'idle',
            messages: [...ag.messages, agentReply]
          };
        })
      }));
    }, 600);
  }
}));


