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

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`group relative flex flex-col justify-between rounded-3xl p-3.5 border backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900/85 to-slate-950/95 text-slate-100 ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Users size={13} />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 truncate">
            JaaS JOB ($300)
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1">
            <Clock size={9} />
            SLA 48h
          </span>
          <ArrowUpRight size={13} className="text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      {/* Middle: Key Metrics */}
      <div className="my-2 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-lg font-black text-slate-100 leading-tight">
              {waitingCount} Profils
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              en attente de dispatch 1-Click
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {totalDispatched} dispatches
            </span>
            <div className="text-[9px] text-slate-400">94.2% placement</div>
          </div>
        </div>

        {/* Progression Objectif 6 Filleuls ($300 Remboursés) */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[9.5px]">
            <span className="text-slate-300 flex items-center gap-1">
              <DollarSign size={10} className="text-amber-400" />
              Affiliation : <strong>{referralsCount} / {targetReferrals} filleuls</strong>
            </span>
            <span className="text-amber-400 font-bold font-mono">
              ${referralEarnings} / $300 ({progressPercent}%)
            </span>
          </div>
          
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/80 text-[10px]">
        <span className="text-slate-400 truncate">
          {referralsCount >= 6 ? '✨ Abonnement 100% remboursé' : `${6 - referralsCount} pour amortir l'offre`}
        </span>
        <button
          onClick={handleQuickDispatch}
          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40 flex items-center gap-1 transition-all shrink-0"
        >
          <Send size={9} />
          <span>Dispatch 1-Click</span>
        </button>
      </div>
    </div>
  );
}
