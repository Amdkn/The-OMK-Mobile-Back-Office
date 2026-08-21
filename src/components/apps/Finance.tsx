import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { 
  Landmark, 
  Wallet, 
  Receipt, 
  Server, 
  Bot, 
  FileText, 
  ChevronRight, 
  PieChart as PieChartIcon, 
  FileCheck2, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingDown,
  Percent,
  Download,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface Expense {
  id: string | number;
  title: string;
  amount: string;
  rawAmount: number;
  date: string;
  icon: typeof Server;
  category: string;
  status: 'completed' | 'pending' | 'flagged';
  vendor: string;
  receipt: string;
  vat: string;
  paymentMethod: string;
  notes: string;
}

const CASHFLOW_DATA = [
  { name: 'Jan', rev: 14000, exp: 8400 },
  { name: 'Fév', rev: 16000, exp: 9100 },
  { name: 'Mar', rev: 18500, exp: 9800 },
  { name: 'Avr', rev: 21000, exp: 10400 },
  { name: 'Mai', rev: 24500, exp: 11200 },
  { name: 'Juin', rev: 27800, exp: 12400 },
];

const INITIAL_EXPENSES: Expense[] = [
  { 
    id: 1, 
    title: 'AWS Cloud Services', 
    amount: '-$1,240.00', 
    rawAmount: 1240, 
    date: 'Aujourd\'hui, 09:15', 
    icon: Server, 
    category: 'Infrastructure', 
    status: 'completed', 
    vendor: 'Amazon Web Services Inc.', 
    receipt: 'rec_aws_9821.pdf',
    vat: '$248.00 (TVA 20%)',
    paymentMethod: 'Carte Visa Entreprise •• 4092',
    notes: 'Facturation hébergement Kubernetes, cluster Francfort et instances RDS Postgres.'
  },
  { 
    id: 2, 
    title: 'Stripe Gateway Fees', 
    amount: '-$342.50', 
    rawAmount: 342.50, 
    date: 'Hier, 23:59', 
    icon: Receipt, 
    category: 'Payment Gateway', 
    status: 'completed', 
    vendor: 'Stripe Inc.', 
    receipt: 'rec_stripe_1102.pdf',
    vat: '$0.00 (Autoliquidation)',
    paymentMethod: 'Prélèvement sur solde',
    notes: 'Frais de transaction Stripe sur volume d\'encaissement mensuel ($38,200).'
  },
  { 
    id: 3, 
    title: 'WeWork Private Office', 
    amount: '-$4,500.00', 
    rawAmount: 4500, 
    date: '12 Août 2026', 
    icon: Wallet, 
    category: 'Immobilier & Bureaux', 
    status: 'pending', 
    vendor: 'WeWork France SAS', 
    receipt: 'rec_wework_099.pdf',
    vat: '$900.00 (TVA 20%)',
    paymentMethod: 'Virement SEPA Programmé',
    notes: 'Loyer mensuel bureaux Paris 8e incluant accès salles de réunion et fibre dédiée.'
  },
  { 
    id: 4, 
    title: 'Anthropic & OpenAI API', 
    amount: '-$890.00', 
    rawAmount: 890, 
    date: '10 Août 2026', 
    icon: Server, 
    category: 'IA & Modèles', 
    status: 'completed', 
    vendor: 'OpenAI LLC', 
    receipt: 'rec_openai_443.pdf',
    vat: '$178.00 (TVA 20%)',
    paymentMethod: 'Carte Visa Entreprise •• 4092',
    notes: 'Consommation tokens modèles GPT-4o et Claude 3.5 Sonnet pour le module Coach AI.'
  },
];

const BUDGETS = [
  { id: 'b1', name: 'R&D & Infrastructure', allocated: 25000, spent: 18400, color: 'bg-emerald-500' },
  { id: 'b2', name: 'Marketing & Acquisition', allocated: 15000, spent: 11200, color: 'bg-blue-500' },
  { id: 'b3', name: 'Salaires & Freelances', allocated: 45000, spent: 44100, color: 'bg-purple-500' },
  { id: 'b4', name: 'Frais Juridiques & Admin', allocated: 8000, spent: 3400, color: 'bg-amber-500' },
];

const FINANCE_TABS = [
  { id: 'treasury', label: 'Trésorerie', icon: Landmark },
  { id: 'expenses', label: 'Dépenses', icon: Receipt, badge: 4 },
  { id: 'budgets', label: 'Budgets', icon: PieChartIcon },
  { id: 'tax', label: 'Fiscalité', icon: FileCheck2, badge: 'À jour' }
];

export default function Finance() {
  const [activeTab, setActiveTab] = useState('treasury');
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [selectedTx, setSelectedTx] = useState<Expense | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={FINANCE_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: TREASURY */}
          {activeTab === 'treasury' && (
            <motion.div
              key="treasury"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Trésorerie Globale & Cashflow"
                subtitle="Consolidation bancaire temps réel (US & EU)"
                badge="Net: +$15,400/m"
                icon={Landmark}
                kpis={[
                  { label: 'Liquidités Totales', value: '$184,200', sub: '+18.4% YTD', trend: 'up' },
                  { label: 'Runway Estimé', value: '18.4 mois', sub: 'Burn Net $9.8k' },
                  { label: 'Marge Nette', value: '55.4%', sub: 'Haute profitabilité', trend: 'up' }
                ]}
              >
                {/* Cashflow Chart Card */}
                <DetailCard title="Évolution Revenus vs Dépenses" icon={Landmark}>
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CASHFLOW_DATA}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="currentColor" opacity={0.4} fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenus ($)" />
                        <Area type="monotone" dataKey="exp" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorExp)" name="Dépenses ($)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Analyse Financière Coach AI"
                  content="Le seuil de rentabilité a été dépassé de 32% au mois de Mai. Recommandation : placer 30% des liquidités excédentaires sur un compte rémunéré Treasury Bills US (4.8% APY)."
                  actionLabel="Explorer les placements de trésorerie"
                  onAction={() => showToast('Simulation de placement de trésorerie calculée')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: EXPENSES */}
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Registre des Dépenses & Factures"
                subtitle="Justificatifs et ventilation par catégorie de coûts"
                icon={Receipt}
                badge={`${expenses.length} Transactions`}
                kpis={[
                  { label: 'Dépenses du mois', value: '$6,972.50', sub: '92% justifiées', trend: 'up' },
                  { label: 'TVA Récupérable', value: '$1,326.00', sub: 'À déduire' },
                  { label: 'Factures en attente', value: '1', sub: 'WeWork ($4,500)' }
                ]}
              >
                <div className="space-y-3">
                  {expenses.map(exp => (
                    <DetailCard
                      key={exp.id}
                      onClick={() => setSelectedTx(exp)}
                      isInteractive
                      title={exp.title}
                      badge={exp.amount}
                      badgeColor="bg-slate-950 text-slate-200 border-slate-800 font-mono font-semibold"
                      icon={exp.icon}
                      subtitle={`Fournisseur : ${exp.vendor} • ${exp.date}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Catégorie : {exp.category}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{exp.status === 'completed' ? 'Payé' : 'En attente'}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: BUDGETS */}
          {activeTab === 'budgets' && (
            <motion.div
              key="budgets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Plafonds Budgétaires & Consommation"
                subtitle="Allocations trimestrielles par centre de coût"
                icon={PieChartIcon}
                badge="Q3 2026"
                kpis={[
                  { label: 'Budget Alloué', value: '$93,000', sub: 'Plafond Q3' },
                  { label: 'Consommé à date', value: '$77,100', sub: '82.9% du budget', trend: 'up' },
                  { label: 'Solde Restant', value: '$15,900', sub: 'Sous contrôle' }
                ]}
              >
                <div className="space-y-3">
                  {BUDGETS.map(b => {
                    const pct = Math.round((b.spent / b.allocated) * 100);
                    return (
                      <DetailCard
                        key={b.id}
                        title={b.name}
                        badge={`${pct}% utilisé`}
                        badgeColor={pct > 90 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-300 border-slate-800'}
                        icon={PieChartIcon}
                      >
                        <div className="space-y-2 pt-1">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Consommé : ${b.spent.toLocaleString()}</span>
                            <span className="text-slate-400 font-mono">Plafond : ${b.allocated.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className={`h-full rounded-full ${b.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: TAX */}
          {activeTab === 'tax' && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Déclarations Fiscales & FEC"
                subtitle="Dossiers pré-remplis pour la clôture annuelle"
                icon={FileCheck2}
                badge="Wyoming & Fédéral"
                kpis={[
                  { label: 'TVA Déductible', value: '$4,120', sub: 'Trimestre en cours' },
                  { label: 'Impôt sur Sociétés', value: '$18,450', sub: 'Provisionné 100%' },
                  { label: 'Statut FEC', value: 'Conforme', sub: 'Certifié expert-comptable' }
                ]}
              >
                <DetailCard title="Liasses Fiscales & Formulaires IRS" icon={FileCheck2}>
                  <div className="space-y-3 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> Fichiers d'Écritures Comptables (FEC) générés et audités sans anomalie.
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Formulaires IRS 5472 et 1120 prêts pour le dépôt d'Avril 2027. Tous les flux inter-compagnies sont documentés avec conventions de prix de transfert.
                    </p>
                    <button 
                      onClick={() => showToast('Téléchargement de l\'archive FEC + Formulaires IRS initié')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Télécharger le Dossier Fiscal Complet
                    </button>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER TRANSACTION INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={selectedTx?.title || ''}
        subtitle={`${selectedTx?.category} • ${selectedTx?.date}`}
        badge={selectedTx?.status === 'completed' ? 'Validé & Rapproché' : 'En Attente'}
        badgeColor={selectedTx?.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        avatarText={selectedTx?.title.charAt(0)}
        actions={[
          {
            id: 'download',
            label: 'Télécharger Reçu',
            icon: Download,
            variant: 'primary',
            onClick: () => showToast(`Facture ${selectedTx?.receipt} téléchargée`)
          },
          {
            id: 'receipt',
            label: 'Exporter FEC',
            icon: FileText,
            onClick: () => showToast(`Écriture comptable pour ${selectedTx?.vendor} exportée`)
          }
        ]}
        kpis={[
          { label: 'Montant Débité', value: selectedTx?.amount || '', sub: 'TTC' },
          { label: 'TVA Déductible', value: selectedTx?.vat.split(' ')[0] || '$0.00', sub: 'Taux légal' },
          { label: 'Mode Règlement', value: selectedTx?.paymentMethod.split(' ')[0] || 'Virement', sub: selectedTx?.paymentMethod.split(' ').slice(1).join(' ') },
          { label: 'Justificatif', value: selectedTx?.receipt || 'N/A', sub: 'Certifié conforme' }
        ]}
        aiInsight={{
          title: 'Vérification Fiscale Coach AI',
          content: `Facture de ${selectedTx?.vendor} vérifiée. Les mentions obligatoires et la conformité au plan comptable général sont validées à 100%.`,
          actionLabel: 'Affecter au compte de charges 628',
          onAction: () => showToast('Compte de charge 628 affecté')
        }}
        tabs={[
          {
            id: 'details',
            label: 'Détails de l\'écriture',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-200">Notes & Objet de la dépense</span>
                  <p className="text-slate-400 leading-relaxed">{selectedTx?.notes}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fournisseur Légal:</span>
                    <span className="text-slate-200 font-medium">{selectedTx?.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taux de TVA:</span>
                    <span className="text-slate-200 font-mono">{selectedTx?.vat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rapprochement Bancaire:</span>
                    <span className="text-emerald-400 font-medium">Automatique (Stripe / Bank API)</span>
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
