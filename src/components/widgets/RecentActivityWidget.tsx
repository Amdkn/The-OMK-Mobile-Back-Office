import React, { useState, useEffect } from 'react';
import { AppId, RecentActivityItem } from '../../types';
import { useOSStore } from '../../store/osStore';
import { ActivityService } from '../../services/activityService';
import { haptics } from '../../services/haptics';
import { 
  Clock, ArrowUpRight, DollarSign, Users, CheckSquare, 
  Server, Shield, Bot, Terminal, Calendar, Activity, ChevronRight,
  Sparkles, RefreshCw, ChevronDown, ChevronUp, StickyNote, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecentActivityWidgetProps {
  onOpenApp: (id: AppId) => void;
  className?: string;
  maxItems?: number;
}

interface GeminiSummaryResponse {
  summary: string;
  highlights: string[];
  source?: string;
}

const APP_ICONS: Record<string, React.ElementType> = {
  finance: DollarSign,
  clients: Users,
  operations: CheckSquare,
  'paas-pro': Server,
  security: Shield,
  'coach-ai': Bot,
  terminal: Terminal,
  hr: Calendar,
  notes: StickyNote
};

const APP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  finance: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  clients: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  operations: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'paas-pro': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  security: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  'coach-ai': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  terminal: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/20' },
  hr: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  notes: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' }
};

export default function RecentActivityWidget({
  onOpenApp,
  className = '',
  maxItems = 5
}: RecentActivityWidgetProps) {
  const { recentActivities, workspace, isLowPowerMode, emitEvent } = useOSStore();
  const displayedActivities = recentActivities.slice(0, maxItems);

  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<GeminiSummaryResponse | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`omk_morning_summary_${workspace}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return {
      summary: "Synthèse Matinale OMK : Clôture financière consolidée (+14.2% MoM) avec encaissement record de $42k validé pour Apex Corp. Le sprint S34 est achevé à 92% (0 vulnérabilité SOC2), et 3 priorités stratégiques sont alignées pour la journée.",
      highlights: [
        "MRR franchi à $124.5k avec respect des engagements SOC2 Type II.",
        "Signature et renouvellement du contrat entreprise Apex Quantum Corp ($42k MRR).",
        "Cluster PaaS Pro stabilisé à 8 pods avec latence p99 < 28ms."
      ]
    };
  });

  const fetchMorningSummary = async () => {
    setIsLoadingSummary(true);
    haptics.trigger('light');
    try {
      const res = await fetch('/api/gemini/activity-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: recentActivities,
          workspace,
          metrics: {
            mrr: 124500,
            growthMoM: '+14.2%',
            activeClusterPods: 8,
            soc2Readiness: '98%'
          }
        })
      });

      if (!res.ok) throw new Error('API summary call failed');
      const data: GeminiSummaryResponse = await res.json();
      setSummaryData(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`omk_morning_summary_${workspace}`, JSON.stringify(data));
      }
      haptics.trigger('success');
    } catch (error) {
      console.warn('Fallback to local morning summary generator:', error);
      // Fallback robust executive summary
      const fallback: GeminiSummaryResponse = {
        summary: `Synthèse Matinale (${workspace}) : Avancées significatives enregistrées sur les modules Clients, Finance et Notes. 0 incident de sécurité et flux d'opérations fluide.`,
        highlights: [
          'Apex Quantum Corp : contrat renouvelé ($42k MRR).',
          'Rapprochement Stripe validé avec succès.',
          'Audit SOC2 Type II en phase finale (92% de complétion).'
        ]
      };
      setSummaryData(fallback);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleItemClick = (activity: RecentActivityItem) => {
    haptics.trigger('selection');
    emitEvent('RECENT_ACTIVITY_SELECTED', 'system', { activity });
    onOpenApp(activity.appId);
  };

  return (
    <div className={`p-3.5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg flex flex-col gap-3 ${className}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity size={13} />
          </div>
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
            Activité & Synthèse IA
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchMorningSummary}
            disabled={isLoadingSummary}
            className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[10px] font-medium text-emerald-400 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
            title="Générer avec Gemini"
          >
            <RefreshCw size={10} className={isLoadingSummary ? 'animate-spin' : ''} />
            <span>Synthèse Gemini</span>
          </button>
        </div>
      </div>

      {/* Gemini Morning Summary Card */}
      {summaryData && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950/60 to-slate-950/80 border border-emerald-500/20 p-2.5 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 cursor-pointer" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-400 shrink-0 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Synthèse Matinale Exécutive
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-200">
              {isSummaryExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isSummaryExpanded && (
              <motion.div
                initial={isLowPowerMode ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={isLowPowerMode ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 pt-0.5 text-slate-300"
              >
                <p className="text-[11px] leading-relaxed text-slate-200 font-normal">
                  {summaryData.summary}
                </p>
                {summaryData.highlights && summaryData.highlights.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-emerald-500/10">
                    {summaryData.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                        <span className="text-emerald-400 font-bold leading-none mt-0.5">•</span>
                        <span className="flex-1 leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-medium">
          <span>Flux récent</span>
          <span className="font-mono">{displayedActivities.length} items</span>
        </div>

        {displayedActivities.length === 0 ? (
          <div className="py-3 text-center text-slate-500 text-xs">
            Aucune activité enregistrée
          </div>
        ) : (
          displayedActivities.map((act, index) => {
            const Icon = APP_ICONS[act.appId] || Activity;
            const colors = APP_COLORS[act.appId] || {
              bg: 'bg-slate-800/60',
              text: 'text-slate-300',
              border: 'border-slate-700'
            };

            return (
              <motion.button
                key={act.id || index}
                onClick={() => handleItemClick(act)}
                whileTap={isLowPowerMode ? undefined : { scale: 0.98 }}
                className="w-full p-2 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/80 transition-all flex items-center justify-between gap-2.5 text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0 ${colors.text}`}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {act.title}
                      </span>
                      {act.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 border border-slate-700/60 text-slate-300 font-mono shrink-0">
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {act.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-right">
                  <span className="text-[9px] text-slate-500 font-mono">
                    {ActivityService.formatRelativeTime(act.timestamp)}
                  </span>
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
