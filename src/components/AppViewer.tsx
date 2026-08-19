import { AppId } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import CoachAI from './apps/CoachAI';
import BaaSHub from './apps/BaaSHub';
import JaaSJob from './apps/JaaSJob';
import PaaSPro from './apps/PaaSPro';
import Wallet from './apps/Wallet';
import Leads from './apps/Leads';
import Terminal from './apps/Terminal';

import Settings from './apps/Settings';

interface AppViewerProps {
  appId: AppId;
  onClose: () => void;
}

export default function AppViewer({ appId, onClose }: AppViewerProps) {
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
      default: return <div className="p-6 pt-24 text-center text-slate-500 font-medium">L'application {appId} est en cours de développement.</div>;
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
      default: return appId.charAt(0).toUpperCase() + appId.slice(1);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-0 z-20 bg-slate-950 flex flex-col"
    >
      <div className="h-14 mt-10 px-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur z-30">
        <button 
          onClick={onClose}
          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-medium active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
          <span>Retour</span>
        </button>
        <div className="font-semibold text-slate-200 absolute left-1/2 -translate-x-1/2">
          {getAppName()}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-slate-950">
        {renderApp()}
      </div>
    </motion.div>
  );
}
