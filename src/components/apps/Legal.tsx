import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Bot, 
  Download, 
  CheckCircle2, 
  Lock, 
  FileCheck,
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const CONTRACTS = [
  { id: '1', title: 'Master Services Agreement (MSA)', party: 'Nexus Global Inc.', expires: '15 Déc 2027', status: 'Actif', value: '$120,000 / an', type: 'Enterprise' },
  { id: '2', title: 'Data Processing Agreement (DPA)', party: 'Specter Tech', expires: '01 Août 2027', status: 'Actif', value: 'Conformité RGPD', type: 'Privacy' },
  { id: '3', title: 'Accord de Confidentialité (NDA)', party: 'FinData S.A.', expires: '30 Juin 2028', status: 'Actif', value: 'Bilatéral', type: 'Legal' },
];

const AUDIT_FLAGS = [
  { id: 'af1', title: 'Clause de Responsabilité Illimitée', doc: 'Draft Contrat AeroSpace', risk: 'Élevé', recommendation: 'Plafonner la responsabilité à 12 mois d\'honoraires réels.' },
  { id: 'af2', title: 'Sous-traitance de Données US', doc: 'DPA Partenaire Cloud', risk: 'Faible', recommendation: 'Clauses contractuelles types (SCC) de la Commission Européenne vérifiées.' },
];

const GOVERNANCE = [
  { id: 'g1', title: 'Registre des Traitements (Article 30 RGPD)', status: 'À jour (Q3)', reviewer: 'DPO Externe' },
  { id: 'g2', title: 'Politique de Confidentialité & Cookies', status: 'Validée', reviewer: 'Legal AI Reviewer' },
];

const LEGAL_TABS = [
  { id: 'contracts', label: 'Contrats', icon: FileText, badge: 3 },
  { id: 'governance', label: 'Gouvernance', icon: Scale },
  { id: 'privacy', label: 'RGPD', icon: ShieldCheck, badge: 'OK' },
  { id: 'audit', label: 'Audit IA', icon: AlertTriangle, badge: 1, badgeColor: 'bg-amber-500 text-slate-950' }
];

export default function Legal() {
  const [activeTab, setActiveTab] = useState('contracts');
  const [selectedContract, setSelectedContract] = useState<typeof CONTRACTS[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={LEGAL_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: CONTRACTS */}
          {activeTab === 'contracts' && (
            <motion.div
              key="contracts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Registre des Contrats & Accords"
                subtitle="Clauses contractuelles et engagements commerciaux"
                badge="3 Actifs"
                icon={FileText}
                kpis={[
                  { label: 'Valeur Contractuelle', value: '$120k', sub: 'MSA Annuel' },
                  { label: 'Couverture Risque', value: '100%', sub: 'Audité par IA' },
                  { label: 'Renouvellement', value: 'Déc 2027', sub: 'Nexus Global' }
                ]}
              >
                <div className="space-y-3">
                  {CONTRACTS.map(c => (
                    <DetailCard
                      key={c.id}
                      onClick={() => setSelectedContract(c)}
                      isInteractive
                      title={c.title}
                      badge={c.value}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={FileText}
                      subtitle={`Partie : ${c.party} • Échéance : ${c.expires}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Type : {c.type}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{c.status}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Revue Juridique IA"
                  content="Les clauses du Master Services Agreement (MSA) avec Nexus Global contiennent une clause d'indexation Syntec automatique pour 2027."
                  actionLabel="Voir la synthèse des clauses"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: GOVERNANCE */}
          {activeTab === 'governance' && (
            <motion.div
              key="governance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Gouvernance Juridique & Compliance"
                subtitle="Documents de gouvernance et conformité d'entreprise"
                icon={Scale}
                badge="Conforme"
              >
                <div className="space-y-3">
                  {GOVERNANCE.map(g => (
                    <DetailCard
                      key={g.id}
                      title={g.title}
                      badge={g.status}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Scale}
                    >
                      <div className="text-xs text-slate-400 pt-1">
                        Validé par : <strong className="text-slate-200">{g.reviewer}</strong>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: PRIVACY */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Conformité Données Personnelles & RGPD"
                subtitle="DPO virtuel et conformité des transferts transfrontaliers"
                icon={ShieldCheck}
                badge="100% GDPR Compliant"
              >
                <DetailCard title="Protection des Données & DPA" icon={ShieldCheck}>
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> Hébergement souverain des données avec chiffrement de bout en bout.
                    </p>
                    <p>Clauses contractuelles types de la Commission Européenne intégrées à tous les contrats clients.</p>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: AUDIT */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Points d'Audit & Risques Détectés"
                subtitle="Analyse prédictive des clauses à risque par l'IA"
                icon={AlertTriangle}
                badge="1 Risque Détecté"
                badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
              >
                <div className="space-y-3">
                  {AUDIT_FLAGS.map(flag => (
                    <DetailCard
                      key={flag.id}
                      title={flag.title}
                      badge={`Risque ${flag.risk}`}
                      badgeColor={flag.risk === 'Élevé' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
                      icon={AlertTriangle}
                      subtitle={`Document : ${flag.doc}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        <strong>Recommandation IA :</strong> {flag.recommendation}
                      </p>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Contract Detail */}
      <AnimatePresence>
        {selectedContract && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Détail du Contrat</span>
              <button onClick={() => setSelectedContract(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedContract.title}</h3>
                <div className="text-xs text-slate-400">Cocontractant : {selectedContract.party}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Conditions Financières & Durée</div>
                <div className="text-xs text-slate-200 font-medium">Valeur : {selectedContract.value}</div>
                <div className="text-xs text-slate-400">Date d'expiration : {selectedContract.expires}</div>
              </div>

              <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-xs font-semibold text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors">
                <Download size={14} /> Télécharger la Copie Signée (PDF)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
