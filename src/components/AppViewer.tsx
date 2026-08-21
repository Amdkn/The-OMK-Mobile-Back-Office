import React, { useState, useRef, useEffect } from 'react';
import { AppId } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Code, Database, Server, ChevronDown, Check, Layers } from 'lucide-react';
import { useOSStore, Workspace } from '../store/osStore';
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
  const [showWorkspace, setShowWorkspace] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-0 z-20 flex flex-col bg-slate-950/80 backdrop-blur-xl text-slate-100 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] theme-transition"
    >
      {/* Top OS Header Bar */}
      <div className="h-14 mt-10 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl z-30 theme-transition">
        <button 
          onClick={onClose}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium active:opacity-70 transition-colors w-[80px]"
        >
          <ChevronLeft size={22} />
          <span className="text-sm">Retour</span>
        </button>
        
        <div className="flex items-center justify-center gap-1.5 px-2 flex-1 text-center truncate">
          <span className="font-semibold text-sm tracking-tight text-slate-100 truncate">
            {getAppName()}
          </span>
        </div>

        {/* WORKSPACE DROPDOWN */}
        <div className="relative flex justify-end w-[80px]" ref={dropdownRef}>
          <button 
            onClick={() => setShowWorkspace(!showWorkspace)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 rounded-full transition-all text-xs"
          >
            <currentWorkspace.icon size={13} className={currentWorkspace.color} />
            <ChevronDown size={13} className="opacity-60" />
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
      
      {/* App Main Viewport (translucent & scrollable) */}
      <div className="flex-1 overflow-hidden relative bg-transparent theme-transition">
        {renderApp()}
      </div>
    </motion.div>
  );
}
