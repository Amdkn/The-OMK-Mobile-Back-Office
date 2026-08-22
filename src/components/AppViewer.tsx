import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppId } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  ChevronLeft, Code, Database, Server, ChevronDown, Check, 
  Layers, BarChart3, Layout, Sparkles, WifiOff, Zap, BatteryLow 
} from 'lucide-react';
import { useOSStore, Workspace } from '../store/osStore';
import { haptics } from '../services/haptics';
import { useDeviceLayout } from '../hooks/useDeviceLayout';
import { useAppEventListener } from '../hooks/useAppEventBus';
import { useAppLifecycle } from '../hooks/useAppLifecycle';
import { usePowerManager } from '../hooks/usePowerManager';
import { OfflineStorageService } from '../services/offlineStorage';
import { ActivityService } from '../services/activityService';
import LoadingSkeleton from './layout/LoadingSkeleton';
import BusinessModuleDashboard from './layout/BusinessModuleDashboard';
import CoachAI from './apps/CoachAI';
import BaaSHub from './apps/BaaSHub';
import JaaSJob from './apps/JaaSJob';
import PaaSPro from './apps/PaaSPro';
import Wallet from './apps/Wallet';
import Leads from './apps/Leads';
import Terminal from './apps/Terminal';
import Settings from './apps/Settings';
import Clients from './apps/Clients';
import Product from './apps/Product';
import Dashboard from './apps/Dashboard';
import Finance from './apps/Finance';
import Legal from './apps/Legal';
import Operations from './apps/Operations';
import Sales from './apps/Sales';
import Growth from './apps/Growth';
import Ontology from './apps/Ontology';
import Cognition from './apps/Cognition';
import HR from './apps/HR';
import Security from './apps/Security';
import Notes from './apps/Notes';

interface AppViewerProps {
  key?: React.Key;
  appId: AppId;
  onClose: () => void;
}

export default function AppViewer({ appId, onClose }: AppViewerProps) {
  const { workspace, setWorkspace } = useOSStore();
  const layout = useDeviceLayout();
  const power = usePowerManager();
  
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [viewMode, setViewMode] = useState<'app' | 'dashboard'>('app');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(OfflineStorageService.isOnline());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Swipe-to-go-back gesture handling
  const [isEdgeDragging, setIsEdgeDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartXRef = useRef<number>(0);
  const touchCurrentXRef = useRef<number>(0);
  const isLeftEdgeSwipeRef = useRef<boolean>(false);

  // Register AppLifecycle
  const { lifecycleState } = useAppLifecycle(appId, {
    onOpen: () => {
      // Log activity when app opens
      ActivityService.log(
        appId,
        getAppName(),
        `Session active dans l'environnement ${workspace}`,
        'view'
      );
    },
    onClose: () => {},
    onPause: () => {},
    onResume: () => {}
  });

  // Listen to network status for offline badge
  useEffect(() => {
    const unsub = OfflineStorageService.listenNetworkStatus(online => {
      setIsOnline(online);
    });
    return unsub;
  }, []);

  // Trigger brief themed pulse loading animation when opening an app or switching workspace
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [appId, workspace, viewMode]);

  // Listen to cross-app events (e.g. WORKSPACE_CHANGED) to sync UI without full page refresh
  useAppEventListener('WORKSPACE_CHANGED', () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 180);
  });

  const handleClose = useCallback(() => {
    haptics.trigger('backNav');
    onClose();
  }, [onClose]);

  // Edge-swipe touch listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchCurrentXRef.current = touch.clientX;

    // Only initiate swipe-to-back if touch starts in left edge zone (within 44px of left edge)
    if (touch.clientX <= 44) {
      isLeftEdgeSwipeRef.current = true;
      setIsEdgeDragging(true);
      setDragOffset(0);
    } else {
      isLeftEdgeSwipeRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isLeftEdgeSwipeRef.current) return;
    const touch = e.touches[0];
    touchCurrentXRef.current = touch.clientX;
    const deltaX = Math.max(0, touch.clientX - touchStartXRef.current);
    
    // Apply rubber-banding resistance
    const dampedDelta = deltaX > 160 ? 160 + (deltaX - 160) * 0.3 : deltaX;
    setDragOffset(dampedDelta);

    if (deltaX > 90) {
      // Haptic threshold pulse
      haptics.trigger('selection');
    }
  };

  const handleTouchEnd = () => {
    if (!isLeftEdgeSwipeRef.current) return;
    const deltaX = touchCurrentXRef.current - touchStartXRef.current;
    
    // Dismiss if dragged more than 85px to the right
    if (deltaX >= 85) {
      haptics.trigger('appClose');
      onClose();
    }
    
    isLeftEdgeSwipeRef.current = false;
    setIsEdgeDragging(false);
    setDragOffset(0);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowWorkspace(false);
      }
    };
    if (showWorkspace) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkspace]);

  const workspaces: { name: Workspace; icon: any; color: string; desc: string }[] = [
    { name: 'Sandbox', icon: Code, color: 'text-amber-500 dark:text-amber-400', desc: 'Isolé (Local)' },
    { name: 'Development', icon: Database, color: 'text-blue-500 dark:text-blue-400', desc: 'Connecté (Dev DB)' },
    { name: 'Production', icon: Server, color: 'text-emerald-500 dark:text-emerald-400', desc: 'Live (Prod DB)' },
  ];

  const currentWorkspace = workspaces.find(w => w.name === workspace) || workspaces[0];

  const getAppName = () => {
    switch (appId) {
      case 'coach-ai': return 'Coach AI';
      case 'baas-hub': return 'BaaS Hub';
      case 'jaas-job': return 'JaaS JOB';
      case 'paas-pro': return 'PaaS PRO';
      case 'wallet': return 'Wallet';
      case 'leads': return 'Leads';
      case 'terminal': return 'Terminal';
      case 'settings': return 'Réglages';
      case 'clients': return 'Clients OS';
      case 'product': return 'Product OS';
      case 'dashboard': return 'Dashboard OS';
      case 'finance': return 'Finance OS';
      case 'legal': return 'Legal OS';
      case 'operations': return 'Operations OS';
      case 'sales': return 'Sales OS';
      case 'growth': return 'Growth OS';
      case 'ontology': return 'Ontology OS';
      case 'cognition': return 'Cognition OS';
      case 'hr': return 'People & HR';
      case 'security': return 'Security OS';
      case 'notes': return 'Notes & Capture';
      default: return appId.charAt(0).toUpperCase() + appId.slice(1);
    }
  };

  const isBusinessModule = ![
    'terminal', 'settings'
  ].includes(appId);

  const renderApp = () => {
    if (isLoading) {
      return (
        <LoadingSkeleton 
          variant={viewMode === 'dashboard' ? 'dashboard' : 'app'} 
          className="h-full"
          message={`Synchronisation ${getAppName()} (${workspace})...`}
        />
      );
    }

    if (viewMode === 'dashboard') {
      return <BusinessModuleDashboard appId={appId} appName={getAppName()} />;
    }

    switch (appId) {
      case 'coach-ai': return <CoachAI />;
      case 'baas-hub': return <BaaSHub />;
      case 'jaas-job': return <JaaSJob />;
      case 'paas-pro': return <PaaSPro />;
      case 'wallet': return <Wallet />;
      case 'leads': return <Leads />;
      case 'terminal': return <Terminal />;
      case 'settings': return <Settings />;
      case 'clients': return <Clients />;
      case 'product': return <Product />;
      case 'dashboard': return <Dashboard />;
      case 'finance': return <Finance />;
      case 'legal': return <Legal />;
      case 'operations': return <Operations />;
      case 'sales': return <Sales />;
      case 'growth': return <Growth />;
      case 'ontology': return <Ontology />;
      case 'cognition': return <Cognition />;
      case 'hr': return <HR />;
      case 'security': return <Security />;
      case 'notes': return <Notes />;
      default: return (
        <div className="p-6 pt-24 text-center opacity-50 font-medium">
          L'application {appId} est en cours de développement.
        </div>
      );
    }
  };

  const swipeProgress = Math.min(1, dragOffset / 90);

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ 
        x: isEdgeDragging ? dragOffset : 0, 
        opacity: isEdgeDragging ? 1 - swipeProgress * 0.15 : 1 
      }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={isEdgeDragging ? { duration: 0 } : { type: 'spring', damping: 26, stiffness: 320 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="absolute inset-0 z-20 flex flex-col bg-slate-950/80 backdrop-blur-xl text-slate-100 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] theme-transition select-none"
    >
      {/* Visual Edge Gesture Overlay Cue */}
      <AnimatePresence>
        {isEdgeDragging && dragOffset > 10 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ left: Math.min(dragOffset * 0.5, 45) }}
            className={`absolute top-1/2 -translate-y-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-2xl backdrop-blur-xl pointer-events-none transition-colors ${
              dragOffset >= 85 
                ? 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400 scale-105' 
                : 'bg-slate-900/90 text-slate-200 border border-slate-700'
            }`}
          >
            <ChevronLeft size={16} className={dragOffset >= 85 ? 'animate-pulse' : ''} />
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              {dragOffset >= 85 ? 'Relâcher' : 'Retour'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top OS Header Bar */}
      <div className={`${layout.appViewerPadding.headerHeight} ${layout.appViewerPadding.headerMarginTop} ${layout.appViewerPadding.headerPadding} flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl z-30 theme-transition`}>
        <button 
          onClick={handleClose}
          className={`flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium active:opacity-70 transition-colors ${layout.appViewerPadding.backBtnWidth}`}
        >
          <ChevronLeft size={layout.isLandscape ? 18 : 22} />
          <span className="text-xs sm:text-sm">Retour</span>
        </button>
        
        <div className="flex items-center justify-center gap-1.5 px-1 flex-1 text-center truncate">
          <span className="font-semibold text-xs sm:text-sm tracking-tight text-slate-100 truncate">
            {getAppName()}
          </span>

          {/* Low Power indicator in header */}
          {power.isLowPowerMode && (
            <span 
              title="Mode Économie d'Énergie actif"
              className="px-1.5 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-mono flex items-center gap-0.5"
            >
              <Zap size={9} />
              <span>Eco</span>
            </span>
          )}

          {/* Offline indicator in header */}
          {!isOnline && (
            <span 
              title="Hors-ligne • Données IndexedDB"
              className="px-1.5 py-0.2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[9px] font-mono flex items-center gap-0.5"
            >
              <WifiOff size={9} />
              <span>Offline</span>
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 justify-end ${layout.appViewerPadding.actionsWidth}`}>
          {/* Dashboard Mode Switcher */}
          {isBusinessModule && (
            <button
              onClick={() => {
                haptics.trigger('selection');
                setViewMode(prev => prev === 'app' ? 'dashboard' : 'app');
              }}
              title={viewMode === 'app' ? 'Afficher le Dashboard KPI' : "Afficher l'Application"}
              className={`p-1.5 rounded-full border transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              {viewMode === 'dashboard' ? <Layout size={13} /> : <BarChart3 size={13} />}
            </button>
          )}

          {/* WORKSPACE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowWorkspace(!showWorkspace)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 rounded-full transition-all text-xs"
            >
              <currentWorkspace.icon size={13} className={currentWorkspace.color} />
              <ChevronDown size={12} className="opacity-60" />
            </button>

            <AnimatePresence>
              {showWorkspace && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl rounded-2xl p-2 z-50 origin-top-right theme-transition"
                >
                  {workspaces.map(ws => (
                    <button
                      key={ws.name}
                      onClick={() => {
                        haptics.trigger('selection');
                        setWorkspace(ws.name);
                        setShowWorkspace(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        workspace === ws.name ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center ${ws.color}`}>
                          <ws.icon size={14} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                          <div className={`text-sm font-medium ${workspace === ws.name ? 'text-slate-100' : 'text-slate-300'}`}>{ws.name}</div>
                          <div className="text-xs text-slate-500">{ws.desc}</div>
                        </div>
                      </div>
                      {workspace === ws.name && (
                        <Check size={16} className="text-emerald-500" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* App Main Viewport (translucent & scrollable) */}
      <div className="flex-1 overflow-hidden relative bg-transparent theme-transition">
        {renderApp()}
      </div>
    </motion.div>
  );
}

