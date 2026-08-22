import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppId, AppDefinition, SmartFolder, AppCategoryTag } from '../types';
import { useOSStore } from '../store/osStore';
import { haptics } from '../services/haptics';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useAppEventListener } from '../hooks/useAppEventBus';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  TouchSensor,
  MouseSensor,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableAppIcon, AppIconView } from './SortableAppIcon';
import SmartFolderIcon from './SmartFolderIcon';
import SmartFolderModal from './SmartFolderModal';
import GlobalSearch from './GlobalSearch';
import DynamicWidgetsGrid from './widgets/DynamicWidgetsGrid';
import ConfirmationModal from './ConfirmationModal';
import { 
  Bot, Scale, Users, Server, WalletCards, PhoneCall, TerminalSquare, 
  LockKeyhole, Settings, LayoutDashboard, Landmark, HardHat, PieChart,
  Users2, LineChart, Cpu, Network, Lightbulb, UserCog, StickyNote, FolderPlus,
  ArrowUpDown, SlidersHorizontal, Check, RotateCcw, Tag, X, Plus, Search,
  ChevronDown, Layers, Briefcase, Palette, Wrench, Bell, Sun, Moon,
  Sliders, BatteryCharging, Shield, Sparkles, ExternalLink, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const APPS: AppDefinition[] = [
  { id: 'notes', name: 'Notes', icon: StickyNote, color: 'bg-emerald-950 text-emerald-400 border-emerald-900', category: 'work' },
  { id: 'coach-ai', name: 'Coach AI', icon: Bot, color: 'bg-emerald-950 text-emerald-400 border-emerald-900', inDock: true, category: 'creative' },
  { id: 'baas-hub', name: 'BaaS Hub', icon: Scale, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'jaas-job', name: 'JaaS JOB', icon: Users, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'paas-pro', name: 'PaaS PRO', icon: Server, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'tools' },
  { id: 'wallet', name: 'Wallet', icon: WalletCards, color: 'bg-slate-900 text-slate-300 border-slate-800', inDock: true, category: 'tools' },
  { id: 'leads', name: 'Leads', icon: PhoneCall, color: 'bg-slate-900 text-slate-300 border-slate-800', inDock: true, category: 'work' },
  { id: 'terminal', name: 'Terminal', icon: TerminalSquare, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'tools' },
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'tools' },
  { id: 'finance', name: 'Finance', icon: Landmark, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'operations', name: 'Operations', icon: HardHat, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'sales', name: 'Sales OS', icon: PieChart, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'clients', name: 'Clients', icon: Users2, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'growth', name: 'Growth', icon: LineChart, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'product', name: 'Product', icon: Cpu, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'creative' },
  { id: 'ontology', name: 'Ontology', icon: Network, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'creative' },
  { id: 'cognition', name: 'Cognition', icon: Lightbulb, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'creative' },
  { id: 'hr', name: 'People / HR', icon: UserCog, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'work' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-slate-900 text-slate-300 border-slate-800', category: 'tools' },
  { id: 'lock', name: 'Lock', icon: LockKeyhole, color: 'bg-red-950/30 text-red-400 border-red-900/50', inDock: true, category: 'tools' },
];

const CATEGORY_TABS: Array<{ id: AppCategoryTag; label: string; icon: React.ElementType }> = [
  { id: 'all', label: 'Tous', icon: Layers },
  { id: 'work', label: 'Travail', icon: Briefcase },
  { id: 'creative', label: 'Créatif', icon: Palette },
  { id: 'tools', label: 'Outils', icon: Wrench },
];

interface SystemSettingAction {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  color: string;
  keywords: string[];
  action: () => void;
}

export default function HomeScreen({ onOpenApp }: { onOpenApp: (id: AppId) => void }) {
  const { 
    lock, 
    gridAppOrder, 
    reorderGridApps, 
    sortGridApps, 
    smartFolders, 
    createSmartFolder, 
    dissolveSmartFolder,
    addAppToFolder,
    notifications,
    openNotificationCenter,
    theme,
    setTheme,
    contrast,
    setContrast,
    wallpaper,
    setWallpaper,
    isLowPowerMode,
    toggleLowPowerMode,
    workspace,
    setWorkspace
  } = useOSStore();

  const layout = useResponsiveLayout();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeDragId, setActiveDragId] = useState<AppId | null>(null);
  const [currentOverId, setCurrentOverId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedAppIdsForNewFolder, setSelectedAppIdsForNewFolder] = useState<AppId[]>([]);

  // Search Bar Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Category Tag Filter State
  const [selectedCategory, setSelectedCategory] = useState<AppCategoryTag>('all');

  // Destructive Action Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    onConfirm: () => {}
  });

  // Swipe-down gesture state
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const isPulling = useRef(false);

  // Track event bus updates reactively
  useAppEventListener('*', () => {
    // Dynamic refresh trigger when events arrive
  });

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Unread Notification Counts per App
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  const appBadgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of unreadNotifications) {
      counts[n.module] = (counts[n.module] || 0) + 1;
    }
    return counts;
  }, [unreadNotifications]);

  const getFolderBadgeCount = (folder: SmartFolder) => {
    return folder.appIds.reduce((sum, appId) => sum + (appBadgeCounts[appId] || 0), 0);
  };

  // Dynamically resolve the active folder object so edits/removals immediately update
  const activeFolderModal = useMemo(() => {
    return activeFolderId ? smartFolders.find(f => f.id === activeFolderId) || null : null;
  }, [activeFolderId, smartFolders]);

  // Configure touch sensor with 250ms long-press delay for mobile tactile feel
  const sensors = useSensors(
    useSensor(MouseSensor, { 
      activationConstraint: { 
        distance: 8 
      } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 250, 
        tolerance: 6 
      } 
    }),
    useSensor(KeyboardSensor)
  );
  
  // Dock apps
  const dockApps = APPS.filter(a => a.inDock);

  // App IDs that are placed inside folders (don't duplicate in root grid)
  const appIdsInFolders = useMemo(() => {
    return new Set(smartFolders.flatMap(f => f.appIds));
  }, [smartFolders]);

  // System Settings searchable catalog
  const systemSettings: SystemSettingAction[] = useMemo(() => [
    {
      id: 'setting-theme-cyber',
      name: 'Thème Cyberpunk',
      category: 'Apparence',
      description: 'Activer le mode sombre cyberpunk à fort contraste',
      icon: Moon,
      color: 'bg-indigo-950 text-indigo-400 border-indigo-900',
      keywords: ['theme', 'sombre', 'dark', 'cyber', 'cyberpunk', 'couleur', 'mode'],
      action: () => {
        haptics.trigger('success');
        setTheme('cyberpunk');
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-theme-warm',
      name: 'Thème Warm Paper',
      category: 'Apparence',
      description: 'Palette studio naturelle et chaleureuse',
      icon: Sun,
      color: 'bg-amber-950 text-amber-400 border-amber-900',
      keywords: ['theme', 'clair', 'warm', 'paper', 'studio', 'papier', 'couleur'],
      action: () => {
        haptics.trigger('success');
        setTheme('warm-paper');
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-contrast-high',
      name: 'Contraste Élevé (High)',
      category: 'Accessibilité',
      description: 'Bordures et contrastes renforcés pour une lisibilité maximale',
      icon: Sliders,
      color: 'bg-cyan-950 text-cyan-400 border-cyan-900',
      keywords: ['contraste', 'accessibilite', 'lisibilite', 'noir', 'high'],
      action: () => {
        haptics.trigger('success');
        setContrast('high');
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-power-saver',
      name: isLowPowerMode ? 'Désactiver Économie d\'Énergie' : 'Mode Économie d\'Énergie',
      category: 'Batterie & Matériel',
      description: isLowPowerMode ? 'Rétablir les animations à 60fps' : 'Réduire les animations et préserver la batterie',
      icon: BatteryCharging,
      color: isLowPowerMode ? 'bg-amber-950 text-amber-400 border-amber-900' : 'bg-slate-900 text-slate-300 border-slate-800',
      keywords: ['batterie', 'energie', 'power', 'economie', 'autonomie', 'fps'],
      action: () => {
        haptics.trigger('medium');
        toggleLowPowerMode();
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-notif-center',
      name: 'Centre de Notifications',
      category: 'Système',
      description: 'Ouvrir le panneau d\'alertes et d\'activités',
      icon: Bell,
      color: 'bg-rose-950 text-rose-400 border-rose-900',
      keywords: ['notifications', 'alertes', 'messages', 'centre', 'notif'],
      action: () => {
        haptics.trigger('medium');
        openNotificationCenter();
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-lock-system',
      name: 'Verrouiller le Système (PIN)',
      category: 'Sécurité',
      description: 'Sécuriser l\'OS et verrouiller la session active',
      icon: Shield,
      color: 'bg-red-950 text-red-400 border-red-900',
      keywords: ['lock', 'verrouiller', 'pin', 'securite', 'session', 'fermer'],
      action: () => {
        haptics.trigger('heavy');
        lock();
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-workspace-prod',
      name: 'Espace : Production',
      category: 'Environnement',
      description: 'Basculer vers l\'environnement de Production',
      icon: Layers,
      color: 'bg-emerald-950 text-emerald-400 border-emerald-900',
      keywords: ['workspace', 'espace', 'production', 'environnement', 'travail'],
      action: () => {
        haptics.trigger('success');
        setWorkspace('Production');
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    },
    {
      id: 'setting-open-all-settings',
      name: 'Tous les Paramètres Système',
      category: 'Système',
      description: 'Ouvrir l\'application complète des réglages OS',
      icon: Settings,
      color: 'bg-slate-900 text-slate-300 border-slate-800',
      keywords: ['parametres', 'settings', 'configuration', 'options', 'reglages'],
      action: () => {
        haptics.trigger('appLaunch');
        onOpenApp('settings');
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    }
  ], [isLowPowerMode, lock, openNotificationCenter, onOpenApp, setContrast, setTheme, setWorkspace, toggleLowPowerMode]);

  // Filtered system settings based on query
  const matchingSystemSettings = useMemo(() => {
    if (!searchFilter.trim()) return [];
    const q = searchFilter.toLowerCase().trim();
    return systemSettings.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [searchFilter, systemSettings]);

  // Filtered & mapped ordered applications based on Category Tag & Search Bar Filter
  const orderedGridApps = useMemo(() => {
    return gridAppOrder
      .filter(id => !appIdsInFolders.has(id))
      .map(id => APPS.find(a => a.id === id))
      .filter((a): a is AppDefinition => a !== undefined)
      .filter(app => {
        // Category filter
        if (selectedCategory !== 'all' && app.category !== selectedCategory) {
          return false;
        }
        // Search bar filter
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase().trim();
          return app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q);
        }
        return true;
      });
  }, [gridAppOrder, appIdsInFolders, selectedCategory, searchFilter]);

  // Filtered smart folders based on Category & Search
  const visibleSmartFolders = useMemo(() => {
    return smartFolders.filter(folder => {
      // If search filter is active
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const matchesName = folder.name.toLowerCase().includes(q);
        const matchesApps = folder.appIds.some(id => {
          const app = APPS.find(a => a.id === id);
          return app?.name.toLowerCase().includes(q);
        });
        return matchesName || matchesApps;
      }
      // If category filter is active
      if (selectedCategory !== 'all') {
        return folder.appIds.some(id => {
          const app = APPS.find(a => a.id === id);
          return app?.category === selectedCategory;
        });
      }
      return true;
    });
  }, [smartFolders, selectedCategory, searchFilter]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts = { all: APPS.length, work: 0, creative: 0, tools: 0 };
    APPS.forEach(app => {
      if (app.category && counts[app.category] !== undefined) {
        counts[app.category]++;
      }
    });
    return counts;
  }, []);

  const activeAppDef = useMemo(() => {
    return activeDragId ? APPS.find(a => a.id === activeDragId) : null;
  }, [activeDragId]);

  // Dynamic pagination capacities based on orientation & grid columns
  const PAGE_1_CAPACITY = layout.isLandscape || layout.isTablet ? layout.gridCols * 2 : 8;
  const PAGE_N_CAPACITY = layout.isLandscape || layout.isTablet ? layout.gridCols * 3 : 16;
  
  const page1Apps = orderedGridApps.slice(0, PAGE_1_CAPACITY);
  const remainingApps = orderedGridApps.slice(PAGE_1_CAPACITY);
  const extraPages = [];
  for (let i = 0; i < remainingApps.length; i += PAGE_N_CAPACITY) {
    extraPages.push(remainingApps.slice(i, i + PAGE_N_CAPACITY));
  }
  const totalPages = 1 + extraPages.length;

  const handleAppClick = (id: AppId) => {
    if (isEditMode) return;
    if (id === 'lock') {
      haptics.trigger('heavy');
      lock();
    } else {
      haptics.trigger('appLaunch');
      onOpenApp(id);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const page = Math.round(scrollLeft / width);
    if (page !== currentPage) {
      haptics.trigger('selection');
      setCurrentPage(page);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    haptics.trigger('dragStart');
    setActiveDragId(event.active.id as AppId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    setCurrentOverId(overId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setCurrentOverId(null);
    
    if (over && active.id !== over.id) {
      const activeId = active.id as AppId;
      const overId = over.id as string;

      // Check strict hit area: the center of active element must fall strictly within target rect
      const activeRect = active.rect.current.translated;
      const overRect = over.rect;
      let isStrictHit = false;

      if (activeRect && overRect) {
        const activeCenterX = activeRect.left + activeRect.width / 2;
        const activeCenterY = activeRect.top + activeRect.height / 2;
        
        // Strict inner hit box margin: at least 6px inside the target tile boundaries
        isStrictHit = (
          activeCenterX >= overRect.left + 6 &&
          activeCenterX <= overRect.left + overRect.width - 6 &&
          activeCenterY >= overRect.top + 6 &&
          activeCenterY <= overRect.top + overRect.height - 6
        );
      }

      // 1. Check if dropped onto an existing smart folder
      const targetFolder = smartFolders.find(f => f.id === overId);
      if (targetFolder) {
        haptics.trigger('success');
        addAppToFolder(targetFolder.id, activeId);
        setActiveDragId(null);
        return;
      }

      // 2. Check if in Edit Mode and dropped STRICTLY inside another app's hit area -> Trigger Group Creation
      if (isEditMode && isStrictHit) {
        const targetApp = APPS.find(a => a.id === overId);
        if (targetApp && !appIdsInFolders.has(targetApp.id)) {
          haptics.trigger('success');
          createSmartFolder(`${activeId.toUpperCase()} & ${targetApp.id.toUpperCase()}`, [targetApp.id, activeId]);
          setActiveDragId(null);
          return;
        }
      }

      // 3. Otherwise standard natural reordering
      const oldIndex = gridAppOrder.indexOf(activeId);
      const newIndex = gridAppOrder.indexOf(overId as AppId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        haptics.trigger('dragDrop');
        reorderGridApps(oldIndex, newIndex);
      }
    } else {
      haptics.trigger('light');
    }
    setActiveDragId(null);
  };

  const handleDragCancel = () => {
    haptics.trigger('light');
    setActiveDragId(null);
    setCurrentOverId(null);
  };

  const handleSort = (mode: 'name' | 'category' | 'default') => {
    haptics.trigger('success');
    sortGridApps(mode);
    setShowSortMenu(false);
  };

  const handlePromptDissolveFolder = (folder: SmartFolder) => {
    haptics.trigger('light');
    setConfirmModal({
      isOpen: true,
      title: 'Dissocier ce groupe ?',
      message: `Toutes les applications de "${folder.name}" seront replacées sur votre écran d'accueil sans perte de données.`,
      confirmLabel: 'Dissocier',
      onConfirm: () => {
        haptics.trigger('warning');
        dissolveSmartFolder(folder.id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCreateFolderFromSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || selectedAppIdsForNewFolder.length === 0) return;
    haptics.trigger('success');
    createSmartFolder(newFolderName.trim(), selectedAppIdsForNewFolder);
    setNewFolderName('');
    setSelectedAppIdsForNewFolder([]);
    setShowCreateFolderModal(false);
  };

  const toggleSelectAppForFolder = (appId: AppId) => {
    haptics.trigger('selection');
    setSelectedAppIdsForNewFolder(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  // Swipe-Down Gesture Handlers on HomeScreen Background
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeDragId) return;
    touchStartY.current = e.touches[0].clientY;
    isPulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || touchStartY.current === null || activeDragId) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY * 0.4, 70));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPulling.current || touchStartY.current === null) return;
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 55 && !activeDragId) {
      haptics.trigger('medium');
      openNotificationCenter();
    }
    touchStartY.current = null;
    isPulling.current = false;
    setPullDistance(0);
  };

  // Search input key handlers
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingSystemSettings.length > 0 && (!orderedGridApps.length || e.shiftKey)) {
        matchingSystemSettings[0].action();
      } else if (orderedGridApps.length > 0) {
        handleAppClick(orderedGridApps[0].id);
        setSearchFilter('');
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setSearchFilter('');
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const gridColsClass = 
    layout.gridCols >= 6 
      ? 'grid-cols-6' 
      : layout.gridCols === 5 
      ? 'grid-cols-5' 
      : 'grid-cols-4';

  return (
    <div 
      className={`flex flex-col h-full w-full relative z-10 ${
        layout.isLandscape ? 'pt-10 pb-2' : 'pt-11 pb-3'
      } overflow-hidden theme-transition select-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Down Notification Center Pull Indicator */}
      <AnimatePresence>
        {pullDistance > 10 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: pullDistance * 0.5 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-1.5 text-xs text-slate-200">
              <Bell size={13} className="text-rose-400 animate-bounce" />
              <span className="font-semibold text-[11px]">Glisser pour Centre de Notifications</span>
              <ChevronDown size={13} className="text-slate-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal / Spotlight (Cmd+K) */}
      <GlobalSearch onOpenApp={onOpenApp} />

      {/* Persistent Global Slide-Down Search Bar at top of HomeScreen */}
      <div ref={searchContainerRef} className="px-5 sm:px-6 pt-1 pb-1.5 z-30 shrink-0 relative">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={15} className="text-emerald-400" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            value={searchFilter}
            onFocus={() => setIsSearchFocused(true)}
            onChange={e => {
              setSearchFilter(e.target.value);
              setIsSearchFocused(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Rechercher une application, réglage ou commande..."
            className="w-full pl-9 pr-20 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 text-xs font-semibold shadow-xl backdrop-blur-xl transition-all focus:outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchFilter ? (
              <button
                onClick={() => {
                  haptics.trigger('light');
                  setSearchFilter('');
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                title="Effacer la recherche"
              >
                <X size={13} />
              </button>
            ) : null}

            <span className="px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[9px] font-mono text-slate-400 hidden sm:inline-block">
              ↵ lancer
            </span>
          </div>
        </div>

        {/* Slide-Down Search Results & System Settings Drawer */}
        <AnimatePresence>
          {isSearchFocused && searchFilter.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="absolute left-5 right-5 sm:left-6 sm:right-6 top-full mt-1.5 max-h-[380px] overflow-y-auto rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-3 z-50 backdrop-blur-2xl scrollbar-hide flex flex-col gap-3"
            >
              {/* Category 1: Applications */}
              {orderedGridApps.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Layers size={11} className="text-emerald-400" />
                      Applications ({orderedGridApps.length})
                    </span>
                    <span className="text-emerald-400 lowercase">↵ pour lancer</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {orderedGridApps.slice(0, 6).map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          handleAppClick(app.id);
                          setSearchFilter('');
                          setIsSearchFocused(false);
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-emerald-950/40 border border-slate-800/80 hover:border-emerald-500/50 flex items-center justify-between transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-xl ${app.color} flex items-center justify-center shrink-0 shadow-sm`}>
                            <app.icon size={15} />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                              {app.name}
                            </div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-tight">
                              {app.category || 'App'}
                            </div>
                          </div>
                        </div>
                        <ExternalLink size={13} className="text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1.5 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: System Settings & Actions */}
              {matchingSystemSettings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Sliders size={11} className="text-cyan-400" />
                      Paramètres & Réglages Système ({matchingSystemSettings.length})
                    </span>
                    <span className="text-cyan-400">Clic pour appliquer</span>
                  </div>

                  <div className="space-y-1.5">
                    {matchingSystemSettings.map(setting => {
                      const SettingIcon = setting.icon;
                      return (
                        <button
                          key={setting.id}
                          onClick={setting.action}
                          className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-xl ${setting.color} flex items-center justify-center shrink-0 shadow-sm`}>
                              <SettingIcon size={15} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                                <span>{setting.name}</span>
                                <span className="text-[9px] font-normal px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                  {setting.category}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {setting.description}
                              </div>
                            </div>
                          </div>
                          <Zap size={13} className="text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state when nothing matches */}
              {orderedGridApps.length === 0 && matchingSystemSettings.length === 0 && (
                <div className="py-6 text-center text-slate-400">
                  <Search size={22} className="mx-auto text-slate-600 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-300">Aucun résultat trouvé pour "{searchFilter}"</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Essayez un nom d'application, thème, batterie ou paramètre</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid Management & Quick Organization Controls Toolbar */}
      <div className="px-5 sm:px-6 py-0.5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Sort Apps Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                haptics.trigger('selection');
                setShowSortMenu(!showSortMenu);
              }}
              title="Organiser les applications"
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                showSortMenu 
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 ring-2 ring-emerald-500/30' 
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/80 text-slate-300 shadow-sm'
              }`}
            >
              <ArrowUpDown size={12} />
              <span>Trier</span>
            </button>

            {/* Sort Menu Flyout */}
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  className="absolute left-0 top-full mt-1.5 w-48 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1.5 z-50 backdrop-blur-xl"
                >
                  <button
                    onClick={() => handleSort('name')}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>Alphabétique (A-Z)</span>
                  </button>
                  <button
                    onClick={() => handleSort('category')}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>Par Catégorie</span>
                    <Tag size={12} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => handleSort('default')}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-400 hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>Ordre par défaut</span>
                    <RotateCcw size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New Group Quick Button */}
          <button
            onClick={() => {
              haptics.trigger('selection');
              setShowCreateFolderModal(true);
            }}
            title="Créer un nouveau dossier / groupe"
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-slate-300 shadow-sm transition-all"
          >
            <FolderPlus size={12} className="text-emerald-400" />
            <span>Nouveau Groupe</span>
          </button>
        </div>

        {/* Edit Groups Mode Toggle */}
        <button
          onClick={() => {
            haptics.trigger('selection');
            setIsEditMode(!isEditMode);
          }}
          title={isEditMode ? "Quitter le mode édition" : "Éditer les groupes et réorganiser (ou appui long sur une icône)"}
          className={`px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
            isEditMode
              ? 'bg-amber-500/25 border-amber-500/70 text-amber-300 ring-2 ring-amber-500/40 animate-pulse'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/80 text-slate-300 shadow-sm'
          }`}
        >
          <SlidersHorizontal size={12} />
          <span>{isEditMode ? 'Terminé' : 'Gérer'}</span>
        </button>
      </div>

      {/* Edit Mode Instructions Banner */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 sm:px-6 py-1 overflow-hidden"
          >
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-between text-[10px] text-amber-200">
              <span>Mode Édition actif : glissez directement sur une icône pour grouper, ou touchez la croix pour dissocier.</span>
              <button 
                onClick={() => setIsEditMode(false)}
                className="font-bold underline ml-2 text-amber-400"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Pagination & App Grid Area */}
      <div 
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext 
            items={gridAppOrder}
            strategy={rectSortingStrategy}
          >
            {/* Page 1: Dynamic OMK AppWidgets Dashboard + Smart Folders + First Page Apps */}
            <div className={`w-full h-full flex-shrink-0 snap-center flex flex-col ${
              layout.isLandscape ? 'px-4' : 'px-5 sm:px-6'
            }`}>
              {/* Dynamic AppWidgets System */}
              {!searchFilter.trim() && selectedCategory === 'all' && (
                <DynamicWidgetsGrid 
                  onOpenApp={onOpenApp} 
                  widgetCols={layout.widgetCols}
                  className="mb-2"
                />
              )}

              {/* Responsive Aligned Application Grid */}
              <div className={`grid ${gridColsClass} gap-x-3 gap-y-3.5 content-start flex-1 overflow-y-auto scrollbar-hide pt-1`}>
                {/* Smart Folders first in Grid */}
                {visibleSmartFolders.map(folder => (
                  <SmartFolderIcon
                    key={folder.id}
                    folder={folder}
                    isEditMode={isEditMode}
                    isDropTarget={currentOverId === folder.id}
                    badgeCount={getFolderBadgeCount(folder)}
                    onDissolve={() => handlePromptDissolveFolder(folder)}
                    onClick={() => {
                      haptics.trigger('selection');
                      setActiveFolderId(folder.id);
                    }}
                  />
                ))}

                {/* Applications with Long-Press Edit Trigger */}
                {page1Apps.map(app => (
                  <SortableAppIcon 
                    key={app.id} 
                    app={app} 
                    isEditMode={isEditMode}
                    isGroupTarget={isEditMode && currentOverId === app.id && activeDragId !== app.id}
                    badgeCount={appBadgeCounts[app.id] || 0}
                    onClick={() => handleAppClick(app.id)}
                    onLongPress={() => {
                      haptics.trigger('heavy');
                      setIsEditMode(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Page 2+ Additional App Pages */}
            {extraPages.map((pageApps, idx) => (
              <div key={idx} className={`w-full h-full flex-shrink-0 snap-center flex flex-col ${
                layout.isLandscape ? 'px-4 pt-1' : 'px-5 sm:px-6 pt-1'
              }`}>
                <div className={`grid ${gridColsClass} gap-x-3 gap-y-3.5 content-start flex-1 overflow-y-auto scrollbar-hide`}>
                  {pageApps.map(app => (
                    <SortableAppIcon 
                      key={app.id} 
                      app={app} 
                      isEditMode={isEditMode}
                      isGroupTarget={isEditMode && currentOverId === app.id && activeDragId !== app.id}
                      badgeCount={appBadgeCounts[app.id] || 0}
                      onClick={() => handleAppClick(app.id)}
                      onLongPress={() => {
                        haptics.trigger('heavy');
                        setIsEditMode(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </SortableContext>

          {/* Smooth Drag Overlay with High Visibility */}
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeAppDef ? (
              <AppIconView 
                app={activeAppDef} 
                isOverlay 
                isEditMode={isEditMode}
                badgeCount={appBadgeCounts[activeAppDef.id] || 0}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Smart Folder Modal View */}
      {activeFolderModal && (
        <SmartFolderModal
          folder={activeFolderModal}
          onClose={() => setActiveFolderId(null)}
          onOpenApp={onOpenApp}
        />
      )}

      {/* Create New Folder / Group Modal */}
      <AnimatePresence>
        {showCreateFolderModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-xl animate-fade-in"
            onClick={() => setShowCreateFolderModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-sm rounded-[2.5rem] bg-slate-900/95 border border-slate-700/80 shadow-2xl p-5 flex flex-col relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FolderPlus size={18} className="text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-100">Créer un Groupe</h3>
                </div>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateFolderFromSelection} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nom du dossier :</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="Ex: Stratégie & Finance"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Sélectionner les applications :</label>
                  <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-hide">
                    {APPS.filter(a => a.id !== 'lock' && !appIdsInFolders.has(a.id)).map(app => {
                      const isSelected = selectedAppIdsForNewFolder.includes(app.id);
                      return (
                        <button
                          type="button"
                          key={app.id}
                          onClick={() => toggleSelectAppForFolder(app.id)}
                          className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-colors ${
                            isSelected 
                              ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg ${app.color} flex items-center justify-center`}>
                              <app.icon size={13} />
                            </div>
                            <span className="text-xs font-semibold">{app.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolderModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim() || selectedAppIdsForNewFolder.length === 0}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Check size={14} />
                    <span>Créer ({selectedAppIdsForNewFolder.length})</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-0.5 mb-1 shrink-0 h-2.5 items-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage ? 'bg-slate-200 w-4' : 'bg-slate-700 w-1.5'
              }`} 
            />
          ))}
        </div>
      )}

      {/* Category Filter Tabs at Bottom of HomeScreen */}
      <div className={`shrink-0 ${layout.isLandscape ? 'px-4 py-1' : 'px-5 sm:px-6 py-1'}`}>
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-1 flex items-center justify-between shadow-lg">
          {CATEGORY_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            const count = categoryCounts[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.trigger('selection');
                  setSelectedCategory(tab.id);
                }}
                className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
                  isSelected 
                    ? 'text-emerald-300 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <TabIcon size={12} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                <span className="relative z-10">{tab.label}</span>
                <span className={`relative z-10 text-[9px] px-1 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Persistent Dock with High-Contrast Frosted Container & Notification Badges */}
      <div className={`shrink-0 ${layout.isLandscape ? 'px-4 pt-0.5' : 'px-5 sm:px-6 pt-0.5'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-[2.2rem] p-2.5 sm:p-3 flex justify-around shadow-xl theme-transition">
          {dockApps.map(app => {
            const badgeCount = appBadgeCounts[app.id] || 0;
            return (
              <button 
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex flex-col items-center group relative focus:outline-none"
                title={app.name}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border ${app.color} shadow-md group-hover:scale-105 active:scale-95 transition-all relative`}>
                  <app.icon size={21} strokeWidth={1.5} />
                  {badgeCount > 0 && (
                    <span 
                      className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] shadow-[0_0_10px_rgba(244,63,94,0.7)] flex items-center justify-center border-2 border-slate-950 z-20 animate-pulse tracking-tighter"
                      title={`${badgeCount} alerte${badgeCount > 1 ? 's' : ''}`}
                    >
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Destructive Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
