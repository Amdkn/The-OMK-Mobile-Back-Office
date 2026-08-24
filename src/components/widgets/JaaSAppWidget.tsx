import React, { useState } from 'react';
import { AppWidget, AppId } from '../../types';
import { haptics } from '../../services/haptics';
import { 
  Users, 
  Send, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { useAppEventListener } from '../../hooks/useAppEventBus';
import { AppEventBus } from '../../services/eventBus';

import { useOSStore } from '../../store/osStore';

interface JaaSAppWidgetProps {
  widget?: AppWidget;
  onClick: (appId: AppId) => void;
  className?: string;
  isCompact?: boolean;
}

export default function JaaSAppWidget({
  widget,
  onClick,
  className = '',
  isCompact = false
}: JaaSAppWidgetProps) {
  const { theme } = useOSStore();
  const [waitingCount, setWaitingCount] = useState<number>(3);
  const [totalDispatched, setTotalDispatched] = useState<number>(14);
  const [referralsCount, setReferralsCount] = useState<number>(4);
  const targetReferrals = 6;
  const referralEarnings = referralsCount * 50;
  const progressPercent = Math.min(100, Math.round((referralsCount / targetReferrals) * 100));

  // Écoute en temps réel des événements JaaS
  useAppEventListener('*', (event) => {
    if (event.type === 'candidat:dispatched' || event.type === 'OMK_CANDIDAT_DISPATCHED') {
      setWaitingCount(prev => Math.max(0, prev - 1));
      setTotalDispatched(prev => prev + 1);
    } else if (event.type === 'referral:credited' || event.type === 'OMK_AFFILIATE_REFERRAL_CREDITED') {
      setReferralsCount(prev => Math.min(targetReferrals + 2, prev + 1));
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('appLaunch');
    onClick('jaas-job');
  };

  const handleQuickDispatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('selection');
    AppEventBus.emitCandidatDispatched(
      { nomComplet: 'Karim Benali', posteCible: 'Cariste CACES 1-3-5' },
      'LogiPrime IDF'
    );
  };

  const isLightTheme = theme === 'warm-paper' || theme === 'editorial' || theme === 'minimal-nordic';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`group relative flex flex-col justify-between rounded-3xl p-3 border backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] ${
        isLightTheme
          ? 'bg-stone-100/90 border-stone-300/80 text-stone-900 hover:border-emerald-600/50 shadow-stone-300/40'
          : 'bg-gradient-to-br from-emerald-950/40 via-slate-900/85 to-slate-950/95 border-emerald-500/30 hover:border-emerald-500/60 text-slate-100'
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5.5 h-5.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Users size={12} />
          </div>
          <span className="text-[9.5px] font-black tracking-wider uppercase text-emerald-700 dark:text-emerald-400 truncate">
            JaaS JOB
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold flex items-center gap-0.5">
            <Clock size={8} />
            48h
          </span>
          <ArrowUpRight size={12} className="text-slate-400 group-hover:text-emerald-500 transition-all" />
        </div>
      </div>

      {/* Middle: Key Metrics */}
      <div className="my-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-black tracking-tight leading-none">
            {waitingCount} <span className="text-[10px] font-semibold opacity-80">Profils</span>
          </div>
          <span className="text-[8.5px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
            {totalDispatched} dispatches
          </span>
        </div>

        <div className="text-[9px] font-medium truncate text-amber-600 dark:text-amber-400">
          En attente de dispatch 1-Click
        </div>

        {/* Progression Objectif 6 Filleuls ($300 Remboursés) */}
        <div className={`p-1.5 rounded-xl border space-y-1 ${
          isLightTheme ? 'bg-white/80 border-stone-200' : 'bg-slate-950/70 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-[8.5px]">
            <span className="truncate opacity-90">
              Affiliation : <strong>{referralsCount}/{targetReferrals}</strong>
            </span>
            <span className="font-bold font-mono text-amber-600 dark:text-amber-400 shrink-0">
              ${referralEarnings} ({progressPercent}%)
            </span>
          </div>
          
          <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className={`flex items-center justify-between gap-1 pt-1 border-t text-[9px] ${
        isLightTheme ? 'border-stone-200' : 'border-slate-800/80'
      }`}>
        <span className="opacity-70 text-[8px] truncate">
          {referralsCount >= 6 ? '✨ 100% amorti' : `${6 - referralsCount} restants`}
        </span>
        <button
          onClick={handleQuickDispatch}
          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1 transition-all shrink-0 text-[8.5px]"
        >
          <Send size={8} />
          <span>Dispatch</span>
        </button>
      </div>
    </div>
  );
}
