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
  Layers,
  Share2,
  Calendar,
  Building2
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

const CONTRACTS = [
  { id: '1', title: 'Master Services Agreement (MSA)', party: 'Nexus Global Inc.', expires: '15 Déc 2027', status: 'Actif', value: '$120,000 / an', type: 'Enterprise', jurisdiction: 'Tribunal de Commerce de Paris', dpa: 'Conforme RGPD Art. 28' },
  { id: '2', title: 'Data Processing Agreement (DPA)', party: 'Specter Tech', expires: '01 Août 2027', status: 'Actif', value: 'Conformité RGPD', type: 'Privacy', jurisdiction: 'UE (Irlande)', dpa: 'SCC Commission Européenne' },
  { id: '3', title: 'Accord de Confidentialité (NDA)', party: 'FinData S.A.', expires: '30 Juin 2028', status: 'Actif', value: 'Bilatéral', type: 'Legal', jurisdiction: 'Droit Français', dpa: 'Secret des affaires' },
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedContract(c);
                      }}
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
                  onAction={() => showToast('Synthèse des clauses juridiques générée')}
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
                title="Gouvernance & Conformité Réglementaire"
                subtitle="Cartographie des risques et registres légaux"
                icon={Scale}
                badge="100% Conforme"
                kpis={[
                  { label: 'Score Conformité', value: '98/100', sub: 'Audit Q3', trend: 'up' },
                  { label: 'DPO Référent', value: 'Actif', sub: 'Veille permanente' },
                  { label: 'Prochain Audit', value: 'Oct 2026', sub: 'Revue semestrielle' }
                ]}
              >
                <div className="space-y-3">
                  {GOVERNANCE.map(g => (
                    <DetailCard
                      key={g.id}
                      title={g.title}
                      badge={g.status}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Scale}
                      subtitle={`Réviseur : ${g.reviewer}`}
                    />
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
                title="Protection des Données & RGPD"
                subtitle="Sécurisation des flux de données à caractère personnel"
                icon={ShieldCheck}
                badge="Certifié RGPD"
                kpis={[
                  { label: 'Demandes DSR', value: '0 en attente', sub: 'Délai moyen 24h' },
                  { label: 'Consentements', value: '100% Opt-in', sub: 'Trace cryptographique' },
                  { label: 'Localisation Données', value: 'UE (Paris)', sub: 'Souveraineté 100%' }
                ]}
              >
                <DetailCard title="Gestion des Droits des Personnes (DSR)" icon={ShieldCheck}>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    Système d'anonymisation et de suppression automatisé des données utilisateurs conforme aux articles 17 (Droit à l'oubli) et 20 (Portabilité) du RGPD.
                  </p>
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

      <DetailDrawer
        isOpen={!!selectedContract}
        onClose={() => setSelectedContract(null)}
        title={selectedContract?.title || ''}
        subtitle={`Partie : ${selectedContract?.party} • Type ${selectedContract?.type}`}
        badge={selectedContract?.status || 'Actif'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedContract?.party.charAt(0)}
        breadcrumbs={[
          { label: 'Legal OS', onClick: () => setSelectedContract(null) },
          { label: 'Contrats', onClick: () => setSelectedContract(null) },
          { label: selectedContract?.title || 'Contrat' }
        ]}
        actions={[
          {
            id: 'pdf',
            label: 'Télécharger PDF',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('light');
              showToast(`Contrat ${selectedContract?.title}.pdf téléchargé`);
            }
          },
          {
            id: 'docusign',
            label: 'DocuSign',
            icon: Share2,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Lien DocuSign renvoyé à ${selectedContract?.party}`);
            }
          }
        ]}
        kpis={[
          { label: 'Valeur Annuelle', value: selectedContract?.value || '$0', sub: 'Engagement ferme' },
          { label: 'Échéance', value: selectedContract?.expires || 'N/A', sub: 'Reconduction tacite' },
          { label: 'Juridiction', value: selectedContract?.jurisdiction || 'Droit Français', sub: 'Compétence exclusive' },
          { label: 'Conformité DPA', value: selectedContract?.dpa || 'RGPD Conforme', sub: 'Chiffrement AES-256' }
        ]}
        aiInsight={{
          title: 'Audit IA Contrat',
          content: `Le document ${selectedContract?.title} avec ${selectedContract?.party} a été audité avec succès. Les clauses de limitation de responsabilité et de propriété intellectuelle sont conformes aux standards entreprise.`,
          actionLabel: 'Générer avenant annuel',
          onAction: () => showToast('Avenant généré')
        }}
        tabs={[
          {
            id: 'clauses',
            label: 'Clauses Clés',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clause de Résiliation :</span>
                    <span className="text-slate-200">Préavis 60 jours avant échéance</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plafonnement Responsabilité :</span>
                    <span className="text-slate-200">100% des sommes perçues (12 mois)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidentialité & NDA :</span>
                    <span className="text-emerald-400">Durée 5 ans post-terme</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
