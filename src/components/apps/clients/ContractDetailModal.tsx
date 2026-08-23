import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileCheck, 
  FileText, 
  Download, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Share2, 
  Sparkles,
  ExternalLink,
  CreditCard,
  Lock,
  RotateCw
} from 'lucide-react';
import { Client, ClientStorageService } from '../../../services/clientStorage';
import { haptics } from '../../../services/haptics';
import { AppEventBus } from '../../../services/eventBus';

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  workspace: string;
  onToast: (msg: string) => void;
}

export default function ContractDetailModal({
  isOpen,
  onClose,
  client,
  workspace,
  onToast
}: ContractDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'clauses' | 'billing' | 'signatures'>('clauses');
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !client) return null;

  const contractRef = `CTR-2026-${client.name.substring(0, 4).toUpperCase()}-99`;
  const annualValue = client.mrr * 12;

  const handleDownloadPDF = () => {
    haptics.trigger('light');
    onToast(`Contrat ${contractRef}.pdf généré et téléchargé`);
  };

  const handleSendDocuSign = () => {
    haptics.trigger('medium');
    onToast(`Lien d'avenant DocuSign transmis aux décisionnaires de ${client.name}`);
  };

  const handleRenewContract = () => {
    haptics.trigger('success');
    setIsRenewing(true);
    setTimeout(() => {
      setIsRenewing(false);
      onToast(`Reconduction tacite confirmée jusqu'en Décembre 2028 pour ${client.name}`);
    }, 600);
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
          className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        >
          {/* Header with Breadcrumb & Close Button */}
          <div className="px-4 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <nav aria-label="Fil d'Ariane Contrat" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-x-auto scrollbar-hide">
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-emerald-400 font-medium truncate transition-colors"
              >
                {client.name}
              </button>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-emerald-400 shrink-0 transition-colors"
              >
                Contrats
              </button>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-emerald-400 font-bold truncate font-mono">{contractRef}</span>
            </nav>
            <button
              onClick={() => {
                haptics.trigger('light');
                onClose();
              }}
              title="Fermer la fiche contrat"
              aria-label="Fermer"
              className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm border border-slate-700/50 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 border border-emerald-500/30 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Contrat Cadre Actif
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Réf: {contractRef}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    <Building2 size={16} className="text-emerald-400" />
                    <span>{client.name}</span>
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Plan {client.tier} • Engagement 24 mois fermes
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black font-mono text-emerald-400">
                    ${annualValue.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/an</span>
                  </div>
                  <div className="text-[10px] text-slate-400">ARR Contractuel</div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={handleDownloadPDF}
                  className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <Download size={13} className="text-emerald-400" />
                  <span>PDF Signé</span>
                </button>
                <button
                  onClick={handleSendDocuSign}
                  className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <Share2 size={13} className="text-sky-400" />
                  <span>DocuSign</span>
                </button>
                <button
                  onClick={handleRenewContract}
                  disabled={isRenewing}
                  className="py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <RotateCw size={13} className={isRenewing ? 'animate-spin' : ''} />
                  <span>Reconduire</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs switch */}
            <div className="flex gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-800">
              {[
                { id: 'clauses', label: 'Clauses & SLA' },
                { id: 'billing', label: 'Échéancier Facturation' },
                { id: 'signatures', label: 'Certificat & Signatures' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    haptics.trigger('selection');
                    setActiveTab(t.id as any);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                    activeTab === t.id
                      ? 'bg-slate-900 text-emerald-400 font-bold border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sub-tab 1: Clauses & SLA */}
            {activeTab === 'clauses' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Niveau d'Engagement SLA</div>
                    <div className="font-bold text-slate-100 mt-0.5 text-xs">{client.sla}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Pénalité 5% en cas de breach</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Date d'Échéance Actuelle</div>
                    <div className="font-bold text-slate-100 mt-0.5 text-xs">{client.renewalDate}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Préavis de 60 jours</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Clauses Juridiques Principales</div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Article 4 - Conformité RGPD & Souveraineté :</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Données hébergées exclusivement en Union Européenne. Chiffrement AES-256 au repos et TLS 1.3 en transit.</p>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2">
                      <Lock size={14} className="text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Article 7 - Propriété Intellectuelle :</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Tous les modèles entraînés sur les données du client restent la propriété exclusive de {client.name}.</p>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2">
                      <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Article 12 - Temps de Rétablissement Garanti (GTR) :</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Prise en charge P1 en moins de 15 minutes, résolution garantie sous 2 heures ouvrées.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Billing Schedule */}
            {activeTab === 'billing' && (
              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Mode de Prélèvement</span>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <CreditCard size={11} /> SEPA Automatique
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-100">Prélèvement Mensuel Fixe</div>
                      <div className="text-[10px] text-slate-400">Échéance le 01 de chaque mois</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      ${client.mrr.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-0.5">Historique des Factures (3 Derniers Mois)</div>
                  {[
                    { id: 'FAC-2026-08', date: '01 Août 2026', amount: `$${client.mrr.toLocaleString()}`, status: 'Payée', ref: 'SEPA-TX-9901' },
                    { id: 'FAC-2026-07', date: '01 Juil 2026', amount: `$${client.mrr.toLocaleString()}`, status: 'Payée', ref: 'SEPA-TX-8821' },
                    { id: 'FAC-2026-06', date: '01 Juin 2026', amount: `$${client.mrr.toLocaleString()}`, status: 'Payée', ref: 'SEPA-TX-7712' }
                  ].map(inv => (
                    <div key={inv.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-slate-400" />
                        <div>
                          <div className="font-mono font-bold text-slate-200 text-xs">{inv.id}</div>
                          <div className="text-[10px] text-slate-500">{inv.date} • {inv.ref}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-100 text-xs">{inv.amount}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {inv.status}
                        </span>
                        <button
                          onClick={() => {
                            haptics.trigger('light');
                            onToast(`Téléchargement facture ${inv.id}`);
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Signatures & Certification */}
            {activeTab === 'signatures' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Signataires Officiels</div>
                  
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {client.contacts?.[0]?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-xs">{client.contacts?.[0]?.name || 'Directeur Général'}</div>
                          <div className="text-[10px] text-slate-400">{client.name} • {client.contacts?.[0]?.role || 'CEO'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Signé eIDAS
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                          O
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-xs">Direction Juridique OMK</div>
                          <div className="text-[10px] text-slate-400">OMK Mobile OS Platform</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Signé eIDAS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                  <div className="text-slate-500 font-sans font-semibold text-[10px] uppercase">Empreinte Cryptographique</div>
                  <div className="text-emerald-400/90 truncate">SHA-256: 4f8a9e7b2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f</div>
                  <div className="text-slate-500">Horodatage sécurisé certifié RFC 3161</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
