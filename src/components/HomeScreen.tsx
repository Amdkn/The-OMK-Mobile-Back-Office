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
import { AppWidgetRegistry } from '../services/widgetRegistry';
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
    setWorkspace,
    pinnedWidgetIds,
    widgetOrder
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

  // Filtered & mapped ordered applications based on Category Tag
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
        return true;
      });
  }, [gridAppOrder, appIdsInFolders, selectedCategory]);

  // Filtered smart folders based on Category
  const visibleSmartFolders = useMemo(() => {
    return smartFolders.filter(folder => {
      // If category filter is active
      if (selectedCategory !== 'all') {
        return folder.appIds.some(id => {
          const app = APPS.find(a => a.id === id);
          return app?.category === selectedCategory;
        });
      }
      return true;
    });
  }, [smartFolders, selectedCategory]);

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

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  // Widgets from registry
  const allWidgets = useMemo(() => {
    return AppWidgetRegistry.getWidgets(workspace, unreadCount);
  }, [workspace, unreadCount]);

  const pinnedWidgets = useMemo(() => {
    const list = [...allWidgets];
    list.sort((a, b) => {
      const idxA = widgetOrder.indexOf(a.id);
      const idxB = widgetOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    return list.filter(w => pinnedWidgetIds.includes(w.id));
  }, [allWidgets, widgetOrder, pinnedWidgetIds]);

  const WIDGETS_PER_PAGE = layout.widgetCols >= 4 ? 4 : layout.widgetCols === 3 ? 3 : 2;
  const totalWidgetPages = Math.ceil(pinnedWidgets.length / WIDGETS_PER_PAGE);

  // Dynamic pagination capacities based on orientation & grid columns
  const APPS_CAPACITY_WITH_WIDGETS = layout.isLandscape || layout.isTablet ? layout.gridCols * 2 : 8;
  const APPS_CAPACITY_WITHOUT_WIDGETS = layout.isLandscape || layout.isTablet ? layout.gridCols * 3 : 16;

  interface PageData {
    pageIndex: number;
    hasWidgets: boolean;
    folders: SmartFolder[];
    apps: AppDefinition[];
  }

  const pagesData: PageData[] = useMemo(() => {
    const pages: PageData[] = [];
    const remainingFolders = [...visibleSmartFolders];
    const remainingApps = [...orderedGridApps];

    let p = 0;
    while (
      p === 0 || 
      (selectedCategory === 'all' && p < totalWidgetPages) || 
      remainingFolders.length > 0 || 
      remainingApps.length > 0
    ) {
      const startW = p * WIDGETS_PER_PAGE;
      const pageWidgets = selectedCategory === 'all' ? pinnedWidgets.slice(startW, startW + WIDGETS_PER_PAGE) : [];
      const hasWidgets = pageWidgets.length > 0 || (p === 0 && selectedCategory === 'all');
      const pageCapacity = hasWidgets ? APPS_CAPACITY_WITH_WIDGETS : APPS_CAPACITY_WITHOUT_WIDGETS;

      const pageFolders = remainingFolders.splice(0, pageCapacity);
      const remainingSlots = Math.max(0, pageCapacity - pageFolders.length);
      const pageApps = remainingApps.splice(0, remainingSlots);

      pages.push({
        pageIndex: p,
        hasWidgets,
        folders: pageFolders,
        apps: pageApps
      });

      p++;
      if (p > 20) break; // safety boundary
    }

    return pages.length > 0 ? pages : [{ pageIndex: 0, hasWidgets: selectedCategory === 'all', folders: [], apps: [] }];
  }, [
    visibleSmartFolders, 
    orderedGridApps, 
    pinnedWidgets, 
    totalWidgetPages, 
    WIDGETS_PER_PAGE, 
    APPS_CAPACITY_WITH_WIDGETS, 
    APPS_CAPACITY_WITHOUT_WIDGETS, 
    selectedCategory
  ]);

  // Ensure currentPage doesn't exceed available pages
  useEffect(() => {
    if (currentPage >= pagesData.length) {
      setCurrentPage(Math.max(0, pagesData.length - 1));
    }
  }, [pagesData.length, currentPage]);

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
        className="flex-1 min-h-0 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
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
            {pagesData.map((page) => (
              <div 
                key={page.pageIndex} 
                className={`w-full h-full flex-shrink-0 snap-center flex flex-col overflow-y-auto scrollbar-hide ${
                  layout.isLandscape ? 'px-4' : 'px-5 sm:px-6'
                } ${page.pageIndex > 0 ? 'pt-1' : ''}`}
              >
                {/* Dynamic AppWidgets System for this page */}
                {selectedCategory === 'all' && (
                  <DynamicWidgetsGrid 
                    onOpenApp={onOpenApp} 
                    widgetCols={layout.widgetCols}
                    pageIndex={page.pageIndex}
                    className="mb-2 shrink-0"
                  />
                )}

                {/* Responsive Aligned Application Grid */}
                <div className={`grid ${gridColsClass} gap-x-3 gap-y-3.5 content-start pb-6 pt-1`}>
                  {/* Smart Folders first on this page */}
                  {page.folders.map(folder => (
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

                  {/* Applications on this page */}
                  {page.apps.map(app => (
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

      {/* Dynamic Page Indicator Dots */}
      {pagesData.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-1 z-20 shrink-0">
          {pagesData.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentPage === idx 
                  ? 'w-5 bg-emerald-400 dark:bg-emerald-400' 
                  : 'w-1.5 bg-slate-600/50 hover:bg-slate-500/80'
              }`}
            />
          ))}
        </div>
      )}

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
