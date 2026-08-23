import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  Activity, 
  Phone, 
  Mail, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Zap, 
  Building2, 
  ArrowRight,
  Server,
  FileCheck2,
  Check
} from 'lucide-react';
import { haptics } from '../../../services/haptics';
import { AppEventBus } from '../../../services/eventBus';

interface HealthIncidentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: string;
  onToast: (msg: string) => void;
  onOpenClient?: (clientName: string) => void;
}

export default function HealthIncidentDetailModal({
  isOpen,
  onClose,
  workspace,
  onToast,
  onOpenClient
}: HealthIncidentDetailModalProps) {
  const [actionsList, setActionsList] = useState([
    { id: 'a1', title: 'Audit d\'impact latence sur les clusters Francfort v2', done: true },
    { id: 'a2', title: 'Planification d\'un point de crise avec Charlie Davis (CTO)', done: false },
    { id: 'a3', title: 'Émission d\'un crédit de compensation SLA de $1,200', done: false },
    { id: 'a4', title: 'Activation du routage de secours via Paris (Equinix PA4)', done: false }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleToggleAction = (id: string) => {
    haptics.trigger('selection');
    setActionsList(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
    onToast('Action du plan de remédiation mise à jour');
  };

  const handleCallClient = () => {
    haptics.trigger('medium');
    onToast('Appel d\'urgence initié avec Charlie Davis (+49 69 123 4567)');
  };

  const handleApplyCompensation = () => {
    haptics.trigger('success');
    onToast('Avoir SLA de $1,200 crédité sur le compte Global Tech');
    AppEventBus.emit('SLA_CREDIT_APPLIED', 'clients', { client: 'Global Tech Industries', amount: 1200 });
  };

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 pt-16 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-red-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        >
          {/* Header with Breadcrumb & Close */}
          <div className="px-4 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <nav aria-label="Fil d'Ariane Incident" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-x-auto scrollbar-hide">
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-red-400 font-medium truncate transition-colors"
              >
                Santé & Risques
              </button>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-red-400 font-bold truncate">Incident Global Tech Industries</span>
            </nav>
            <button
              onClick={() => {
                haptics.trigger('light');
                onClose();
              }}
              title="Fermer la fiche incident"
              aria-label="Fermer"
              className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm border border-slate-700/50 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900/90 border border-red-500/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      Risque Churn Élevé (78%)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Building2 size={16} className="text-red-400" />
                    <span>Global Tech Industries</span>
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Contrat Enterprise ($9,200 MRR) • Cluster Francfort
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black font-mono text-red-400">42/100</div>
                  <div className="text-[10px] text-slate-400">Score Santé Critique</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Baisse d'activité de -40% enregistrée sur les 14 derniers jours suite aux micro-coupures de latence réseau sur la passerelle API Francfort.
              </p>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={handleCallClient}
                  className="py-2 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <Phone size={13} />
                  <span>Appeler Charlie Davis (CTO)</span>
                </button>
                <button
                  onClick={handleApplyCompensation}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <FileCheck2 size={13} className="text-emerald-400" />
                  <span>Créditer Avoir SLA ($1,200)</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Server size={11} className="text-amber-400" />
                  Diagnostic Technique
                </div>
                <div className="font-semibold text-slate-200 text-xs mt-1">Goulot d'étranglement Pods</div>
                <div className="text-[10px] text-slate-400 mt-0.5">CPU Throttling sur 3 nœuds workers</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <TrendingDown size={11} className="text-red-400" />
                  Impact Financier
                </div>
                <div className="font-semibold text-slate-200 text-xs mt-1">$110,400 ARR menacé</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Renouvellement le 15 Nov 2026</div>
              </div>
            </div>

            {/* Remediation Plan Checklist */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Plan de Remédiation & Rétablissement Anti-Churn
              </div>

              <div className="space-y-1.5">
                {actionsList.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => handleToggleAction(act.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      act.done 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        act.done 
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                          : 'border border-slate-600'
                      }`}>
                        {act.done && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span className={`text-xs ${act.done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {act.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
