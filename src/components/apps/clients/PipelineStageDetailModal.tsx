import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  Plus, 
  ArrowRight, 
  Building2, 
  FileCode, 
  Cpu, 
  Sparkles 
} from 'lucide-react';
import { haptics } from '../../../services/haptics';
import { AppEventBus } from '../../../services/eventBus';

export interface PipelineStage {
  stage: string;
  count: number;
  value: string;
  color: string;
  desc: string;
  deliverables?: { id: string; title: string; completed: boolean }[];
  accounts?: { name: string; tier: string; mrr: number; contact: string }[];
}

interface PipelineStageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: PipelineStage | null;
  workspace: string;
  onToast: (msg: string) => void;
}

export default function PipelineStageDetailModal({
  isOpen,
  onClose,
  stage,
  workspace,
  onToast
}: PipelineStageDetailModalProps) {
  const [deliverables, setDeliverables] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  useEffect(() => {
    if (stage) {
      setDeliverables(stage.deliverables || [
        { id: 'd1', title: 'Audit d\'architecture réseau & dimensionnement des conteneurs', completed: true },
        { id: 'd2', title: 'Génération des clés de chiffrement mTLS et certificats SSL', completed: true },
        { id: 'd3', title: 'Intégration du connecteur d\'ontologie & tests de charge', completed: false },
        { id: 'd4', title: 'Validation de recette de sécurité SOC2 Type II', completed: false },
      ]);
    }
  }, [stage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !stage) return null;

  const handleToggleDeliverable = (id: string) => {
    haptics.trigger('selection');
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, completed: !d.completed } : d));
    onToast('Livrable technique mis à jour');
  };

  const handleAdvanceStage = () => {
    haptics.trigger('success');
    onToast(`Validation de l'étape "${stage.stage}" transmise à l'orchestrateur`);
    AppEventBus.emit('PIPELINE_STAGE_ADVANCED', 'clients', { stage: stage.stage });
  };

  const completedCount = deliverables.filter(d => d.completed).length;
  const progressPercent = Math.round((completedCount / deliverables.length) * 100);

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
          className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        >
          {/* Header with Breadcrumb & Close */}
          <div className="px-4 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <nav aria-label="Fil d'Ariane Pipeline" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-x-auto scrollbar-hide">
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-emerald-400 font-medium truncate transition-colors"
              >
                Pipeline
              </button>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-emerald-400 font-bold truncate">{stage.stage}</span>
            </nav>
            <button
              onClick={() => {
                haptics.trigger('light');
                onClose();
              }}
              title="Fermer la fiche étape"
              aria-label="Fermer"
              className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm border border-slate-700/50 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900/90 border border-sky-500/30 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      Étape d'Intégration
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {stage.count} Compte(s) en cours
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{stage.stage}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{stage.desc}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black font-mono text-sky-400">{stage.value}</div>
                  <div className="text-[10px] text-slate-400">ARR Pondéré</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Validation des pré-requis techniques ({completedCount}/{deliverables.length})</span>
                  <span className="font-mono font-bold text-sky-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Checklist of Technical Requirements */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Livrables & Contrôles d'Étape ({completedCount}/{deliverables.length})
              </div>

              <div className="space-y-1.5">
                {deliverables.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleDeliverable(item.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      item.completed 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        item.completed 
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                          : 'border border-slate-600'
                      }`}>
                        {item.completed && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Accounts List */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Comptes Attachés à cette Étape
              </div>

              <div className="space-y-1.5">
                {[
                  { name: 'Apex Quantum Corp', tier: 'Enterprise Tier', mrr: 12500, contact: 'Alice Smith (CEO)' },
                  { name: 'Nexus Dynamics', tier: 'Scale Tier', mrr: 8500, contact: 'Marc V. (CTO)' }
                ].map((acc, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building2 size={14} className="text-sky-400" />
                      <div>
                        <div className="font-bold text-slate-200 text-xs">{acc.name}</div>
                        <div className="text-[10px] text-slate-500">{acc.tier} • {acc.contact}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      ${acc.mrr.toLocaleString()}/m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Action */}
            <div className="pt-2">
              <button
                onClick={handleAdvanceStage}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Valider l'étape & Passer à la phase suivante</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
