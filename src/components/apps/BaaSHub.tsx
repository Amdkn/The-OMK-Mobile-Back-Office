import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  FileText, 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  Bot, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Layers, 
  ArrowUpRight,
  FileCheck2,
  Copy,
  Send,
  Building2
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface CorporateDoc {
  id: string;
  title: string;
  date: string;
  size: string;
  type: string;
  status: 'verified' | 'pending';
  authority: string;
  description: string;
  filingNumber: string;
}

const DOCS: CorporateDoc[] = [
  { 
    id: '1', 
    title: 'Articles of Organization', 
    date: '12 Jan 2026', 
    size: '2.4 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'Wyoming Secretary of State',
    description: 'Acte constitutif officiel de la société OMK Global Ventures LLC.',
    filingNumber: 'WY-2026-0019283'
  },
  { 
    id: '2', 
    title: 'EIN Confirmation Letter (CP 575)', 
    date: '15 Jan 2026', 
    size: '1.1 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'Internal Revenue Service (IRS)',
    description: 'Attribution du numéro d\'identification fiscale fédéral américain.',
    filingNumber: 'EIN: 99-8472910'
  },
  { 
    id: '3', 
    title: 'Operating Agreement (LLC)', 
    date: '18 Jan 2026', 
    size: '3.8 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'OMK Corporate Governance',
    description: 'Statuts régissant la gouvernance, la répartition des parts et la signature.',
    filingNumber: 'OA-v2.1-LEGAL'
  },
  { 
    id: '4', 
    title: 'Certificate of Good Standing', 
    date: '01 Août 2026', 
    size: '1.5 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'State of Wyoming',
    description: 'Certificat d\'existence et de conformité légale à jour délivré par l\'État.',
    filingNumber: 'CGS-2026-88392'
  },
];

const BANKING_INTEGRATIONS = [
  { id: 'bi1', name: 'Mercury Bank USA', routing: '021000021', account: '•••• 8829', status: 'Opérationnel', balance: '$124,500', currency: 'USD' },
  { id: 'bi2', name: 'Stripe Payments US', accountId: 'acct_1Mkp992', status: 'Vérifié', balance: '$18,400', currency: 'USD' },
  { id: 'bi3', name: 'Wise Multi-Devises', accountId: 'usr_849201', status: 'Opérationnel', balance: '$8,200', currency: 'EUR / USD' },
];

const COMPLIANCE_ITEMS = [
  { id: 'cp1', title: 'Rapport Annuel Wyoming 2026', deadline: '01 Jan 2027', status: 'ready', desc: 'Frais d\'état $60 payables via l\'agent enregistré.' },
  { id: 'cp2', title: 'Franchise Tax Fédérale (Form 1120 / 5472)', deadline: '15 Avr 2027', status: 'ready', desc: 'Préparé automatiquement par le module fiscal OMK.' },
  { id: 'cp3', title: 'Registered Agent Renewal', deadline: '12 Jan 2027', status: 'active', desc: 'Adresse légale à Cheyenne, WY active.' },
];

const BAAS_TABS = [
  { id: 'company', label: 'Société', icon: Building },
  { id: 'docs', label: 'Docs', icon: FileText, badge: 4 },
  { id: 'banking', label: 'Banques', icon: Landmark },
  { id: 'compliance', label: 'Conformité', icon: ShieldCheck, badge: 'OK' }
];

export default function BaaSHub() {
  const [activeTab, setActiveTab] = useState('company');
  const [selectedDoc, setSelectedDoc] = useState<CorporateDoc | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={BAAS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: COMPANY */}
          {activeTab === 'company' && (
            <motion.div
              key="company"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Structure Corporate US"
                subtitle="Société immatriculée au Wyoming (LLC)"
                badge="Active"
                icon={Building}
                kpis={[
                  { label: 'Trésorerie US', value: '$151,100', sub: '+12.4% vs M-1', trend: 'up' },
                  { label: 'Statut Légal', value: 'Conforme', sub: 'Audit Q3 Validé' },
                  { label: 'Juridiction', value: 'Wyoming', sub: 'Tax Friendly' }
                ]}
              >
                {/* Company Identity Card */}
                <DetailCard
                  title="Identité Légale"
                  badge="Wyoming Secretary of State"
                  icon={Building}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-100">OMK Global Ventures LLC</h4>
                        <div className="text-xs text-slate-400">Filing ID: 2026-0019283 • Class: Single-Member LLC</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={11} /> Good Standing
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800">
                      <div>
                        <span className="text-slate-500">Registered Agent:</span>
                        <div className="font-medium text-slate-200">Wyoming Agents LLC</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Adresse Siège:</span>
                        <div className="font-medium text-slate-200 truncate">1621 Central Ave, Cheyenne</div>
                      </div>
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Supervision Juridique BaaS"
                  content="L'entité américaine OMK Global Ventures LLC est à 100% en règle. Aucun renouvellement n'est exigé avant Janvier 2027."
                  actionLabel="Télécharger le certificat Good Standing"
                  onAction={() => showToast('Certificat Good Standing téléchargé')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: DOCS */}
          {activeTab === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Documents Juridiques & Liasses"
                subtitle="Actes certifiés déposés auprès des autorités"
                icon={FileText}
                badge={`${DOCS.length} Certifiés`}
                kpis={[
                  { label: 'EIN Confirmé', value: '99-8472910', sub: 'IRS Actif' },
                  { label: 'Archivage', value: 'Cloud Vault', sub: 'Chiffré AES-256' },
                  { label: 'Validité', value: 'Illimitée', sub: 'Certificats officiels' }
                ]}
              >
                <div className="space-y-3">
                  {DOCS.map(doc => (
                    <DetailCard
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      isInteractive
                      title={doc.title}
                      badge={doc.size}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-mono"
                      icon={FileText}
                      subtitle={`Autorité : ${doc.authority} • ${doc.date}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-mono">{doc.filingNumber}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>Inspecter</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: BANKING */}
          {activeTab === 'banking' && (
            <motion.div
              key="banking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Comptes Bancaires & Passerelles"
                subtitle="Intégrations bancaires US connectées"
                icon={Landmark}
                badge="3 Connectés"
                kpis={[
                  { label: 'Solde Total', value: '$151,100', sub: 'USD & EUR', trend: 'up' },
                  { label: 'Flux Moyen/Jour', value: '$3,420', sub: 'Encaissements Stripe' },
                  { label: 'Statut Passerelles', value: '100% OK', sub: 'API synchronisée' }
                ]}
              >
                <div className="space-y-3">
                  {BANKING_INTEGRATIONS.map(b => (
                    <DetailCard
                      key={b.id}
                      title={b.name}
                      badge={b.balance}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Landmark}
                      subtitle={`Statut : ${b.status} • Devise : ${b.currency}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-mono">Routing: {b.routing || b.accountId}</span>
                        <button 
                          onClick={() => showToast(`Synchronisation bancaire ${b.name} lancée`)}
                          className="text-emerald-400 font-semibold hover:underline"
                        >
                          Synchroniser →
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: COMPLIANCE */}
          {activeTab === 'compliance' && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Obligations de Conformité Fiscale"
                subtitle="Calendrier des déclarations et de l'agent enregistré"
                icon={ShieldCheck}
                badge="Conformité 100%"
                kpis={[
                  { label: 'Prochaine Échéance', value: 'Jan 2027', sub: 'Annual Report' },
                  { label: 'Agent Enregistré', value: 'Actif', sub: 'Cheyenne, WY' },
                  { label: 'Form 5472', value: 'Prêt', sub: 'Prêt pour télédéclaration' }
                ]}
              >
                <div className="space-y-3">
                  {COMPLIANCE_ITEMS.map(cp => (
                    <DetailCard
                      key={cp.id}
                      title={cp.title}
                      badge={cp.deadline}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={ShieldCheck}
                      subtitle={cp.desc}
                    />
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER CORPORATE DOC INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || ''}
        subtitle={`Autorité : ${selectedDoc?.authority} • ${selectedDoc?.date}`}
        badge={selectedDoc?.status === 'verified' ? 'Certifié Conforme' : 'En Attente'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={FileText}
        breadcrumbs={[
          { label: 'BaaS Hub', onClick: () => setSelectedDoc(null) },
          { label: 'Gouvernance', onClick: () => setSelectedDoc(null) },
          { label: selectedDoc?.title || 'Document' }
        ]}
        actions={[
          {
            id: 'download',
            label: 'Télécharger Acte PDF',
            icon: Download,
            variant: 'primary',
            onClick: () => showToast(`Document ${selectedDoc?.title} téléchargé`)
          },
          {
            id: 'copy',
            label: 'Copier N° Dépôt',
            icon: Copy,
            onClick: () => showToast(`Numéro de dépôt ${selectedDoc?.filingNumber} copié`)
          }
        ]}
        kpis={[
          { label: 'Numéro Dépôt', value: selectedDoc?.filingNumber.split(' ')[0] || '', sub: 'Registre public' },
          { label: 'Date Enregistrement', value: selectedDoc?.date || '', sub: 'Horodatage officiel' },
          { label: 'Taille Document', value: selectedDoc?.size || '', sub: 'Format PDF/A' },
          { label: 'Autorité Émettrice', value: selectedDoc?.authority.split(' ')[0] || '', sub: selectedDoc?.authority.split(' ').slice(1, 3).join(' ') }
        ]}
        aiInsight={{
          title: 'Validation Juridique Automatisée',
          content: `${selectedDoc?.description} Document archivé avec empreinte immuable sur le registre corporate OMK.`,
          actionLabel: 'Transmettre à l\'expert-comptable',
          onAction: () => showToast('Acte transmis à l\'expert-comptable')
        }}
        tabs={[
          {
            id: 'summary',
            label: 'Résumé de l\'Acte',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-200">Objet Juridique</span>
                  <p className="text-slate-400 leading-relaxed">{selectedDoc?.description}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entité concernée:</span>
                    <span className="text-slate-200 font-semibold">OMK Global Ventures LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">État d'immatriculation:</span>
                    <span className="text-emerald-400 font-medium">Wyoming, USA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Archivage Légal:</span>
                    <span className="text-slate-200 font-mono">Vault 10 ans</span>
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
