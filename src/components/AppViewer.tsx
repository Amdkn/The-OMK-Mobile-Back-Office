import React, { useState, useRef, useEffect } from 'react';
import { AppId } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Code, Database, Server, ChevronDown, Check, Layers, BarChart3, Layout, Sparkles } from 'lucide-react';
import { useOSStore, Workspace } from '../store/osStore';
import { haptics } from '../services/haptics';
import { useDeviceLayout } from '../hooks/useDeviceLayout';
import { useAppEventListener } from '../hooks/useAppEventBus';
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

interface AppViewerProps {
  key?: React.Key;
  appId: AppId;
  onClose: () => void;
}

export default function AppViewer({ appId, onClose }: AppViewerProps) {
  const { workspace, setWorkspace } = useOSStore();
  const layout = useDeviceLayout();
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [viewMode, setViewMode] = useState<'app' | 'dashboard'>('app');
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trigger brief themed pulse loading animation when opening an app or switching workspace
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [appId, workspace, viewMode]);

  // Listen to cross-app events (e.g. WORKSPACE_CHANGED) to sync UI without full page refresh
  useAppEventListener('WORKSPACE_CHANGED', () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 200);
  });

  const handleClose = () => {
    haptics.trigger('backNav');
    onClose();
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
      default: return (
        <div className="p-6 pt-24 text-center opacity-50 font-medium">
          L'application {appId} est en cours de développement.
        </div>
      );
    }
  };

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
      default: return appId.charAt(0).toUpperCase() + appId.slice(1);
    }
  };

  // Check if current app is a business module suited for Dashboard view
  const isBusinessModule = ![
    'terminal', 'settings'
  ].includes(appId);

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-0 z-20 flex flex-col bg-slate-950/80 backdrop-blur-xl text-slate-100 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] theme-transition"
    >
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
