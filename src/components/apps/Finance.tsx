import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
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
  TrendingUp,
  Percent,
  Download,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Building,
  Sparkles,
  ExternalLink,
  Plus,
  X,
  Sliders,
  UploadCloud,
  FileCheck,
  Check,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

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

interface BudgetItem {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  category: string;
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
    id: 'exp-1', 
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
    id: 'exp-2', 
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
    id: 'exp-3', 
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
    id: 'exp-4', 
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

const INITIAL_BUDGETS: BudgetItem[] = [
  { id: 'b1', name: 'R&D & Infrastructure', allocated: 25000, spent: 18400, color: 'bg-emerald-500', category: 'Infrastructure' },
  { id: 'b2', name: 'Marketing & Acquisition', allocated: 15000, spent: 11200, color: 'bg-blue-500', category: 'Marketing' },
  { id: 'b3', name: 'Salaires & Freelances', allocated: 45000, spent: 44100, color: 'bg-purple-500', category: 'RH & Prestations' },
  { id: 'b4', name: 'Frais Juridiques & Admin', allocated: 8000, spent: 3400, color: 'bg-amber-500', category: 'Juridique' },
];

const FINANCE_TABS = [
  { id: 'treasury', label: 'Trésorerie', icon: Landmark },
  { id: 'expenses', label: 'Dépenses', icon: Receipt, badge: 4 },
  { id: 'budgets', label: 'Budgets', icon: PieChartIcon },
  { id: 'tax', label: 'Fiscalité', icon: FileCheck2, badge: 'OK' }
];

export default function Finance() {
  const [activeTab, setActiveTab] = useState('treasury');
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS);
  const [selectedTx, setSelectedTx] = useState<Expense | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  const [isTaxDocOpen, setIsTaxDocOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Modal States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAdjustBudgetOpen, setIsAdjustBudgetOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

  // Form State: Add Expense
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Infrastructure',
    vendor: '',
    vat: '20% (TVA Standard)',
    paymentMethod: 'Carte Visa Entreprise •• 4092',
    receiptName: 'rec_piece_jointe.pdf',
    notes: ''
  });

  // Form State: Adjust Budget
  const [budgetForm, setBudgetForm] = useState({
    budgetId: 'b1',
    newCeiling: 25000,
    reason: '',
    reallocationSource: 'Trésorerie Excédentaire'
  });

  // Form State: Treasury Placement
  const [placementForm, setPlacementForm] = useState({
    amount: 50000,
    instrument: 'US Treasury Bills (4.8% APY)',
    duration: '6 Mois'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard Escape Handler for custom modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddExpenseOpen(false);
        setIsAdjustBudgetOpen(false);
        setIsPlacementModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Submit Add Expense Form
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount) return;

    const raw = parseFloat(expenseForm.amount.replace(/[^0-9.-]+/g, '')) || 0;
    const vatCalculated = expenseForm.vat.includes('20%')
      ? `$${(raw * 0.2).toFixed(2)} (TVA 20%)`
      : expenseForm.vat.includes('8.5%')
      ? `$${(raw * 0.085).toFixed(2)} (Sales Tax 8.5%)`
      : '$0.00 (Exonéré / Autoliquidation)';

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      title: expenseForm.title.trim(),
      amount: `-$${raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: raw,
      date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      icon: expenseForm.category.includes('Infra') || expenseForm.category.includes('IA') ? Server : expenseForm.category.includes('Immobilier') ? Wallet : Receipt,
      category: expenseForm.category,
      status: 'completed',
      vendor: expenseForm.vendor.trim() || 'Fournisseur Agréé',
      receipt: expenseForm.receiptName || `rec_${Date.now().toString().slice(-4)}.pdf`,
      vat: vatCalculated,
      paymentMethod: expenseForm.paymentMethod,
      notes: expenseForm.notes.trim() || 'Dépense enregistrée et imputée via Finance OS.'
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Also update budget spent if matching category exists
    setBudgets(prev => prev.map(b => {
      if (b.category.toLowerCase().includes(expenseForm.category.toLowerCase()) || b.name.toLowerCase().includes(expenseForm.category.toLowerCase())) {
        return { ...b, spent: b.spent + raw };
      }
      return b;
    }));

    haptics.trigger('success');
    setIsAddExpenseOpen(false);
    showToast(`Dépense "${newExpense.title}" (${newExpense.amount}) enregistrée et rapprochée`);

    // Reset form
    setExpenseForm({
      title: '',
      amount: '',
      category: 'Infrastructure',
      vendor: '',
      vat: '20% (TVA Standard)',
      paymentMethod: 'Carte Visa Entreprise •• 4092',
      receiptName: 'rec_piece_jointe.pdf',
      notes: ''
    });
  };

  // Submit Adjust Budget Form
  const handleAdjustBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBudget = budgets.find(b => b.id === budgetForm.budgetId);
    if (!targetBudget) return;

    setBudgets(prev => prev.map(b => {
      if (b.id === budgetForm.budgetId) {
        return { ...b, allocated: Number(budgetForm.newCeiling) };
      }
      return b;
    }));

    if (selectedBudget && selectedBudget.id === budgetForm.budgetId) {
      setSelectedBudget({ ...selectedBudget, allocated: Number(budgetForm.newCeiling) });
    }

    haptics.trigger('success');
    setIsAdjustBudgetOpen(false);
    showToast(`Plafond du budget "${targetBudget.name}" ajusté à $${Number(budgetForm.newCeiling).toLocaleString()}`);
  };

  // Execute Treasury Placement
  const handleExecutePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.trigger('success');
    setIsPlacementModalOpen(false);
    showToast(`Ordre de placement de $${placementForm.amount.toLocaleString()} sur ${placementForm.instrument} validé (${placementForm.duration})`);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string | number, title: string) => {
    haptics.trigger('warning');
    if (confirm(`Confirmer la suppression de la dépense ${title} ?`)) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setSelectedTx(null);
      haptics.trigger('medium');
      showToast(`Dépense "${title}" supprimée`);
    }
  };

  // Open Adjust budget pre-filled
  const handleOpenAdjustBudgetFor = (b: BudgetItem) => {
    haptics.trigger('selection');
    setBudgetForm({
      budgetId: b.id,
      newCeiling: b.allocated + 5000,
      reason: 'Réévaluation prévisionnelle Q3',
      reallocationSource: 'Trésorerie Excédentaire'
    });
    setIsAdjustBudgetOpen(true);
  };

  const totalExpensesMonth = expenses.reduce((acc, e) => acc + e.rawAmount, 0);
  const totalBudgetAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={FINANCE_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Contextual Action Sub-Bar */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Finance" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('treasury');
              setSelectedTx(null);
              setSelectedBudget(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Finance OS</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {FINANCE_TABS.find(t => t.id === activeTab)?.label || 'Trésorerie'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            LLC Wyoming • GAAP Compliant
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsAdjustBudgetOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Sliders size={11} />
            <span className="hidden xs:inline">Plafonds</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsAddExpenseOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>+ Dépense</span>
          </button>
        </div>
      </div>

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
                  onAction={() => {
                    haptics.trigger('selection');
                    setIsPlacementModalOpen(true);
                  }}
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
                  { label: 'Dépenses Totales', value: `$${totalExpensesMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: '92% justifiées', trend: 'up' },
                  { label: 'TVA Récupérable', value: '$1,326.00', sub: 'À déduire' },
                  { label: 'Factures en attente', value: `${expenses.filter(e => e.status === 'pending').length}`, sub: 'WeWork ($4,500)' }
                ]}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-400">Écritures comptables & justificatifs</span>
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsAddExpenseOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Ajouter une Dépense</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {expenses.map(exp => (
                    <DetailCard
                      key={exp.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedTx(exp);
                      }}
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
                  { label: 'Budget Alloué', value: `$${totalBudgetAllocated.toLocaleString()}`, sub: 'Plafond Q3' },
                  { label: 'Consommé à date', value: `$${totalBudgetSpent.toLocaleString()}`, sub: `${Math.round((totalBudgetSpent / totalBudgetAllocated) * 100)}% du budget`, trend: 'up' },
                  { label: 'Solde Restant', value: `$${(totalBudgetAllocated - totalBudgetSpent).toLocaleString()}`, sub: 'Sous contrôle' }
                ]}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-400">Centres de coûts et allocations</span>
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsAdjustBudgetOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Sliders size={13} />
                    <span>Ajuster un Plafond</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {budgets.map(b => {
                    const pct = Math.min(100, Math.round((b.spent / b.allocated) * 100));
                    return (
                      <DetailCard
                        key={b.id}
                        title={b.name}
                        badge={`${pct}% utilisé`}
                        badgeColor={pct > 90 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-300 border-slate-800'}
                        icon={PieChartIcon}
                        isInteractive
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedBudget(b);
                        }}
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
                        <div className="flex justify-end pt-1">
                          <span className="text-[10px] text-emerald-400 font-medium">Inspecter ventilation & ajuster →</span>
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
                <DetailCard 
                  title="Liasses Fiscales & Formulaires IRS" 
                  icon={FileCheck2}
                  isInteractive
                  onClick={() => {
                    haptics.trigger('selection');
                    setIsTaxDocOpen(true);
                  }}
                  actions={
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      Inspecter liasse fiscale →
                    </span>
                  }
                >
                  <div className="space-y-3 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> Fichiers d'Écritures Comptables (FEC) générés et audités sans anomalie.
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Formulaires IRS 5472 et 1120 prêts pour le dépôt d'Avril 2027. Tous les flux inter-compagnies sont documentés avec conventions de prix de transfert.
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.trigger('light');
                        showToast('Téléchargement de l\'archive FEC + Formulaires IRS initié');
                      }}
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

      {/* ========================================================================= */}
      {/* 1. MODAL: AJOUTER UNE DÉPENSE / FACTURE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Ajouter une Dépense / Facture</h3>
                    <p className="text-[10px] text-slate-400">Saisie d'écriture comptable et pièce justificative</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddExpenseOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Libellé / Objet de la Dépense *</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.title}
                    onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    placeholder="Ex: Datadog APM Monitoring"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Montant TTC ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="1240.00"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Catégorie</label>
                    <select
                      value={expenseForm.category}
                      onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="IA & Modèles">IA & Modèles</option>
                      <option value="Payment Gateway">Payment Gateway</option>
                      <option value="Immobilier & Bureaux">Immobilier & Bureaux</option>
                      <option value="Marketing">Marketing & Acquisition</option>
                      <option value="Juridique">Juridique & Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Fournisseur Légal</label>
                    <input
                      type="text"
                      value={expenseForm.vendor}
                      onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                      placeholder="Ex: Datadog Inc."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Taux TVA / Tax</label>
                    <select
                      value={expenseForm.vat}
                      onChange={e => setExpenseForm({ ...expenseForm, vat: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="20% (TVA Standard)">TVA 20%</option>
                      <option value="8.5% (TVA US)">Sales Tax 8.5%</option>
                      <option value="0% (Autoliquidation)">Autoliquidation (0%)</option>
                      <option value="Exonéré">Exonéré</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Mode de Règlement</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Carte Visa Entreprise •• 4092">Carte Visa Entreprise •• 4092</option>
                    <option value="Virement SEPA Programmé">Virement SEPA Programmé</option>
                    <option value="Prélèvement sur solde">Prélèvement sur solde</option>
                    <option value="Stripe Balance">Stripe Balance</option>
                  </select>
                </div>

                {/* Simulated File Upload Area */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Justificatif de Dépense (PDF / Reçu)</label>
                  <div className="p-3 bg-slate-950/70 border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck size={16} className="text-emerald-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-300 truncate">{expenseForm.receiptName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        haptics.trigger('light');
                        setExpenseForm({ ...expenseForm, receiptName: `facture_${Date.now().toString().slice(-4)}.pdf` });
                        showToast('Nouveau fichier PDF sélectionné');
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-200 shrink-0"
                    >
                      Changer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Notes & Affectation Analytique</label>
                  <textarea
                    rows={2}
                    value={expenseForm.notes}
                    onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    placeholder="Imputation compte 628, projet, centre de coût..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. MODAL: AJUSTER PLAFOND BUDGÉTAIRE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAdjustBudgetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Ajuster Plafond Budgétaire</h3>
                    <p className="text-[10px] text-slate-400">Réallocation des centres de coûts pour Q3</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdjustBudgetOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAdjustBudgetSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Centre de Coût / Budget Cible</label>
                  <select
                    value={budgetForm.budgetId}
                    onChange={e => {
                      const found = budgets.find(b => b.id === e.target.value);
                      setBudgetForm({
                        ...budgetForm,
                        budgetId: e.target.value,
                        newCeiling: found ? found.allocated : budgetForm.newCeiling
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  >
                    {budgets.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Actuel: ${b.allocated.toLocaleString()} • Consommé: ${b.spent.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Nouveau Plafond Trimestriel ($) *</label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={budgetForm.newCeiling}
                    onChange={e => setBudgetForm({ ...budgetForm, newCeiling: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Source de Réallocation des Fonds</label>
                  <select
                    value={budgetForm.reallocationSource}
                    onChange={e => setBudgetForm({ ...budgetForm, reallocationSource: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="Trésorerie Excédentaire">Trésorerie Excédentaire (Compte Courant)</option>
                    <option value="Réserve d'Urgence Q3">Réserve d'Urgence Trimestrielle</option>
                    <option value="Pôle Marketing">Prélèvement sur Pôle Marketing</option>
                    <option value="Pôle Juridique">Prélèvement sur Pôle Juridique & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Motif & Justification Opérationnelle</label>
                  <textarea
                    rows={2}
                    value={budgetForm.reason}
                    onChange={e => setBudgetForm({ ...budgetForm, reason: e.target.value })}
                    placeholder="Ex: Montée en charge sur clusters IA et recrutement freelance..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustBudgetOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Appliquer Plafond</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. MODAL: PLACEMENT DE TRÉSORERIE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPlacementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Placement de Trésorerie</h3>
                    <p className="text-[10px] text-slate-400">Rémunération des liquidités excédentaires</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPlacementModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleExecutePlacement} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Montant à Allouer ($)</label>
                  <input
                    type="number"
                    step="5000"
                    value={placementForm.amount}
                    onChange={e => setPlacementForm({ ...placementForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Instrument Financier & Rendement</label>
                  <select
                    value={placementForm.instrument}
                    onChange={e => setPlacementForm({ ...placementForm, instrument: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="US Treasury Bills (4.8% APY)">US Treasury Bills (4.8% APY - Sans Risque)</option>
                    <option value="Compte à Terme Entreprise (3.85% APY)">Compte à Terme Entreprise (3.85% APY)</option>
                    <option value="Money Market Fund Institutional (5.1% APY)">Money Market Fund Institutional (5.1% APY)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Durée de Blocage & Liquidité</label>
                  <select
                    value={placementForm.duration}
                    onChange={e => setPlacementForm({ ...placementForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="3 Mois">3 Mois (Liquidité rapide)</option>
                    <option value="6 Mois">6 Mois (Rendement optimal)</option>
                    <option value="12 Mois">12 Mois (Verrouillage annuel)</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 leading-relaxed">
                  Gain estimé sur la période : <strong>+${Math.round((placementForm.amount * 0.048 * (placementForm.duration === '3 Mois' ? 0.25 : placementForm.duration === '6 Mois' ? 0.5 : 1)))}</strong> net. Liquidités disponibles sous 24h ouvrées.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPlacementModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Confirmer l'Ordre</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER TRANSACTION INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={selectedTx?.title || ''}
        subtitle={`${selectedTx?.category} • ${selectedTx?.date}`}
        badge={selectedTx?.status === 'completed' ? 'Validé & Rapproché' : 'En Attente'}
        badgeColor={selectedTx?.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        avatarText={selectedTx?.title.charAt(0)}
        breadcrumbs={[
          { label: 'Finance OS', onClick: () => setSelectedTx(null) },
          { label: 'Dépenses', onClick: () => setSelectedTx(null) },
          { label: selectedTx?.title || 'Transaction' }
        ]}
        actions={[
          {
            id: 'download',
            label: 'Télécharger Reçu',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('light');
              showToast(`Facture ${selectedTx?.receipt} téléchargée`);
            }
          },
          {
            id: 'receipt',
            label: 'Exporter FEC',
            icon: FileText,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Écriture comptable pour ${selectedTx?.vendor} exportée`);
            }
          },
          {
            id: 'delete_tx',
            label: 'Supprimer',
            icon: Trash2,
            variant: 'danger',
            onClick: () => {
              if (selectedTx) handleDeleteExpense(selectedTx.id, selectedTx.title);
            }
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
          onAction: () => {
            haptics.trigger('success');
            showToast('Compte de charge 628 affecté');
          }
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

      {/* SLIDE-OVER BUDGET INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedBudget}
        onClose={() => setSelectedBudget(null)}
        title={selectedBudget?.name || ''}
        subtitle={`Budget Alloué : $${selectedBudget?.allocated.toLocaleString()} • Consommé : $${selectedBudget?.spent.toLocaleString()}`}
        badge={`${Math.round(((selectedBudget?.spent || 0) / (selectedBudget?.allocated || 1)) * 100)}% Consommé`}
        badgeColor="bg-slate-950 text-slate-300 border-slate-800"
        avatarText={selectedBudget?.name.charAt(0)}
        breadcrumbs={[
          { label: 'Finance OS', onClick: () => setSelectedBudget(null) },
          { label: 'Budgets', onClick: () => setSelectedBudget(null) },
          { label: selectedBudget?.name || 'Budget' }
        ]}
        actions={[
          {
            id: 'adjust_budget',
            label: 'Ajuster Plafond',
            icon: DollarSign,
            variant: 'primary',
            onClick: () => {
              if (selectedBudget) handleOpenAdjustBudgetFor(selectedBudget);
            }
          }
        ]}
        kpis={[
          { label: 'Allocation Trimestre', value: `$${selectedBudget?.allocated.toLocaleString()}`, sub: 'Plafond Q3' },
          { label: 'Dépenses à Date', value: `$${selectedBudget?.spent.toLocaleString()}`, sub: `${Math.round(((selectedBudget?.spent || 0) / (selectedBudget?.allocated || 1)) * 100)}% consommé` },
          { label: 'Solde Disponible', value: `$${((selectedBudget?.allocated || 0) - (selectedBudget?.spent || 0)).toLocaleString()}`, sub: 'Sous contrôle', trend: 'up' },
          { label: 'Centre de Coût', value: 'CC-400', sub: 'Pôle Opérationnel' }
        ]}
        aiInsight={{
          title: 'Optimisation Budgétaire AI',
          content: `Le rythme de dépenses sur ${selectedBudget?.name} respecte la trajectoire prévisionnelle. Aucune anomalie de dépassement détectée.`,
          actionLabel: 'Générer rapport analytique',
          onAction: () => {
            haptics.trigger('success');
            showToast('Rapport analytique généré');
          }
        }}
        tabs={[
          {
            id: 'ventilation',
            label: 'Ventilation Dépenses',
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between">
                  <span className="text-slate-300">Serveurs & Pods Cloud</span>
                  <span className="font-mono text-emerald-400 font-bold">$12,400</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between">
                  <span className="text-slate-300">Licences SaaS & Outils Dev</span>
                  <span className="font-mono text-slate-200 font-bold">$6,000</span>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* SLIDE-OVER TAX & FEC INSPECTOR */}
      <DetailDrawer
        isOpen={isTaxDocOpen}
        onClose={() => setIsTaxDocOpen(false)}
        title="Dossier Fiscal & Liasse FEC 2026"
        subtitle="Société LLC Wyoming & Établissement France"
        badge="Audité & Conforme"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="FEC"
        breadcrumbs={[
          { label: 'Finance OS', onClick: () => setIsTaxDocOpen(false) },
          { label: 'Fiscalité', onClick: () => setIsTaxDocOpen(false) },
          { label: 'Liasse Fiscale' }
        ]}
        actions={[
          {
            id: 'dl_fec',
            label: 'Télécharger Archive FEC',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('light');
              showToast('Archive FEC_2026_Q3.zip téléchargée');
            }
          }
        ]}
        kpis={[
          { label: 'TVA Déductible', value: '$4,120', sub: 'Q3 2026' },
          { label: 'Provision IS', value: '$18,450', sub: '100% sécurisé' },
          { label: 'Formulaires IRS', value: '1120 + 5472', sub: 'Validés CPA US' },
          { label: 'Conformité FEC', value: '100%', sub: 'Zéro anomalie', trend: 'up' }
        ]}
        tabs={[
          {
            id: 'tax_details',
            label: 'Détails des Formulaires',
            content: (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-semibold text-emerald-400">Formulaire IRS 5472 (Foreign-Owned US DE)</span>
                  <p className="text-slate-400">Déclaration des transactions inter-entreprises dûment renseignée avec pièces justificatives.</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-semibold text-emerald-400">Fichier des Écritures Comptables (FEC)</span>
                  <p className="text-slate-400">Format normalisé article L. 47 A-I du LPF prêt pour transmission expert-comptable.</p>
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
