import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { 
  TrendingUp, 
  ChevronRight, 
  Building2, 
  Layers, 
  Calendar, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Target, 
  Sparkles,
  DollarSign,
  FileText,
  Send,
  UserCheck,
  Plus,
  X,
  Check,
  Sliders,
  Award,
  ArrowRight,
  Trash2,
  FileCheck
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

interface Deal {
  id: string;
  name: string;
  value: number;
  prob: number;
  stage: string;
  contact: string;
  company: string;
  lastTouch: string;
  email: string;
  nextStep: string;
  notes: string;
  timeline: { date: string; title: string; type: string }[];
}

interface ForecastQuarter {
  quarter: string;
  objectif: number;
  realise: number;
}

interface KeyAccount {
  id: string;
  name: string;
  sector: string;
  arr: string;
  health: string;
  status: string;
  contact: string;
}

interface SalesActivity {
  id: string;
  type: string;
  title: string;
  time: string;
  duration?: string;
  icon: typeof PhoneCall;
  contact: string;
  notes: string;
}

const INITIAL_DEALS: Deal[] = [
  { 
    id: '1', 
    name: 'Corp Enterprise License', 
    value: 120000, 
    prob: 85, 
    stage: 'Négociation', 
    contact: 'Sarah Jenkins', 
    company: 'Nexus Global', 
    lastTouch: 'Hier, 16:30', 
    email: 's.jenkins@nexus.co', 
    nextStep: 'Validation juridique finale',
    notes: 'Contrat pluriannuel 36 mois incluant support 24/7 et SLA 99.99%.',
    timeline: [
      { date: '10 Août', title: 'Démo technique architecture validée', type: 'demo' },
      { date: '15 Août', title: 'Transmission grille tarifaire Enterprise', type: 'pricing' },
      { date: '20 Août', title: 'Revue clauses DPA et RGPD', type: 'legal' }
    ]
  },
  { 
    id: '2', 
    name: 'SaaS Integration Pro v2', 
    value: 45000, 
    prob: 60, 
    stage: 'Proposition', 
    contact: 'Mike Ross', 
    company: 'Specter Tech', 
    lastTouch: 'Il y a 3j', 
    email: 'm.ross@specter.io', 
    nextStep: 'Démo technique sécurité',
    notes: 'Besoin d\'intégrer 150 connecteurs d\'ontologie. Client très intéressé par le mode Sandbox.',
    timeline: [
      { date: '12 Août', title: 'Premier call de cadrage', type: 'call' },
      { date: '18 Août', title: 'Envoi documentation OpenAPI', type: 'docs' }
    ]
  },
  { 
    id: '3', 
    name: 'Data Pipeline Enterprise API', 
    value: 15000, 
    prob: 95, 
    stage: 'Clôture', 
    contact: 'Elena Martinez', 
    company: 'FinData S.A.', 
    lastTouch: 'Aujourd\'hui', 
    email: 'elena@findata.eu', 
    nextStep: 'Signature électronique DocuSign',
    notes: 'Bon de commande signé reçu par email. Dépôt DocuSign en attente de contre-signature.',
    timeline: [
      { date: '05 Août', title: 'Cadrage sécurité bancaire', type: 'security' },
      { date: '19 Août', title: 'Validation direction financière', type: 'approval' }
    ]
  },
  { 
    id: '4', 
    name: 'Cloud Migration Cohorte', 
    value: 85000, 
    prob: 40, 
    stage: 'Qualification', 
    contact: 'Thomas Dubois', 
    company: 'AeroSpace Alpha', 
    lastTouch: 'Il y a 5j', 
    email: 't.dubois@aerospace.fr', 
    nextStep: 'Rendez-vous cadrage',
    notes: 'Migration de 40 clusters vers PaaS Pro. Cycle de décision estimé à 45 jours.',
    timeline: [
      { date: '14 Août', title: 'Prise de contact Inbound', type: 'inbound' }
    ]
  },
];

const INITIAL_FORECAST: ForecastQuarter[] = [
  { quarter: 'Q1', objectif: 200, realise: 215 },
  { quarter: 'Q2', objectif: 240, realise: 260 },
  { quarter: 'Q3', objectif: 280, realise: 240 },
  { quarter: 'Q4 (Est.)', objectif: 320, realise: 350 },
];

const INITIAL_ACCOUNTS: KeyAccount[] = [
  { id: 'a1', name: 'Nexus Global Inc.', sector: 'Enterprise FinTech', arr: '$120k ARR', health: '98%', status: 'Tier 1', contact: 'Sarah Jenkins (VP Engineering)' },
  { id: 'a2', name: 'Specter Tech Solutions', sector: 'Legal Tech', arr: '$45k ARR', health: '92%', status: 'Tier 2', contact: 'Mike Ross (Partner)' },
  { id: 'a3', name: 'FinData S.A.', sector: 'Banque & Assurance', arr: '$95k ARR', health: '99%', status: 'Tier 1', contact: 'Elena Martinez (Chief Data Officer)' },
];

const INITIAL_ACTIVITIES: SalesActivity[] = [
  { id: 'act1', type: 'call', title: 'Appel de cadrage Sarah Jenkins', time: 'Aujourd\'hui, 11:00', duration: '32m', icon: PhoneCall, contact: 'Sarah Jenkins', notes: 'Discussion approfondie sur les connecteurs d\'ontologie et le support 24/7.' },
  { id: 'act2', type: 'mail', title: 'Envoi contrat MSA Mike Ross', time: 'Hier, 18:20', icon: Mail, contact: 'Mike Ross', notes: 'Transmission des conditions générales et du contrat Master Services Agreement.' },
  { id: 'act3', type: 'meeting', title: 'Comité de direction FinData', time: 'Il y a 2j', duration: '45m', icon: Calendar, contact: 'Elena Martinez', notes: 'Présentation de l\'architecture sécurisée aux membres du board.' },
];

const SALES_TABS = [
  { id: 'pipeline', label: 'Pipeline', icon: Target, badge: 4 },
  { id: 'forecast', label: 'Prévisions', icon: TrendingUp },
  { id: 'accounts', label: 'Comptes', icon: Building2, badge: 3 },
  { id: 'activities', label: 'Activités', icon: Calendar }
];

export default function Sales() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [forecast, setForecast] = useState<ForecastQuarter[]>(INITIAL_FORECAST);
  const [accounts, setAccounts] = useState<KeyAccount[]>(INITIAL_ACCOUNTS);
  const [activities, setActivities] = useState<SalesActivity[]>(INITIAL_ACTIVITIES);

  // Selected drawers
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<KeyAccount | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<SalesActivity | null>(null);
  const [selectedForecastQuarter, setSelectedForecastQuarter] = useState<ForecastQuarter | null>(null);

  // Modals
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isAdjustQuotaModalOpen, setIsAdjustQuotaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form: New Deal
  const [dealForm, setDealForm] = useState({
    name: '',
    company: '',
    contact: '',
    email: '',
    value: 50000,
    stage: 'Qualification',
    prob: 50,
    nextStep: 'Premier cadrage technique',
    notes: ''
  });

  // Form: Adjust Quota
  const [quotaForm, setQuotaForm] = useState({
    quarter: 'Q3',
    newObjective: 280,
    reason: 'Réajustement saisonnier Q3'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNewDealModalOpen(false);
        setIsAdjustQuotaModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Submit New Deal Form
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.name.trim() || !dealForm.company.trim()) return;

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      name: dealForm.name.trim(),
      value: Number(dealForm.value),
      prob: Number(dealForm.prob),
      stage: dealForm.stage,
      contact: dealForm.contact.trim() || 'Contact Principal',
      company: dealForm.company.trim(),
      lastTouch: 'À l\'instant',
      email: dealForm.email.trim() || 'contact@client.com',
      nextStep: dealForm.nextStep.trim() || 'Démo de cadrage',
      notes: dealForm.notes.trim() || 'Nouvelle opportunité enregistrée via Sales OS.',
      timeline: [
        { date: 'Aujourd\'hui', title: 'Création de l\'opportunité commerciale', type: 'inbound' }
      ]
    };

    setDeals(prev => [newDeal, ...prev]);
    haptics.trigger('success');
    setIsNewDealModalOpen(false);
    showToast(`Opportunité "${newDeal.name}" ($${newDeal.value.toLocaleString()}) ajoutée au pipeline`);

    setDealForm({
      name: '',
      company: '',
      contact: '',
      email: '',
      value: 50000,
      stage: 'Qualification',
      prob: 50,
      nextStep: 'Premier cadrage technique',
      notes: ''
    });
  };

  // Submit Adjust Quota Form
  const handleAdjustQuotaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForecast(prev => prev.map(f => {
      if (f.quarter === quotaForm.quarter) {
        return { ...f, objectif: Number(quotaForm.newObjective) };
      }
      return f;
    }));

    if (selectedForecastQuarter && selectedForecastQuarter.quarter === quotaForm.quarter) {
      setSelectedForecastQuarter({ ...selectedForecastQuarter, objectif: Number(quotaForm.newObjective) });
    }

    haptics.trigger('success');
    setIsAdjustQuotaModalOpen(false);
    showToast(`Objectif de prévision pour ${quotaForm.quarter} fixé à $${Number(quotaForm.newObjective)}k`);
  };

  // Advance deal to closure
  const handleAdvanceDealToClose = (dealId: string) => {
    haptics.trigger('success');
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const updated = { ...d, stage: 'Clôture', prob: 100, nextStep: 'Contrat signé & Encaissé' };
        if (selectedDeal?.id === dealId) setSelectedDeal(updated);
        return updated;
      }
      return d;
    }));
    showToast('Opportunité validée et clôturée avec succès !');
  };

  // Delete Deal
  const handleDeleteDeal = (dealId: string, name: string) => {
    haptics.trigger('warning');
    if (confirm(`Confirmer la suppression du deal ${name} ?`)) {
      setDeals(prev => prev.filter(d => d.id !== dealId));
      setSelectedDeal(null);
      haptics.trigger('medium');
      showToast(`Deal "${name}" supprimé`);
    }
  };

  const totalPipeline = deals.reduce((acc, d) => acc + d.value, 0);
  const weightedPipeline = Math.round(deals.reduce((acc, d) => acc + (d.value * (d.prob / 100)), 0));

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={SALES_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Contextual Sub-Bar */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Sales" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('pipeline');
              setSelectedDeal(null);
              setSelectedAccount(null);
              setSelectedActivity(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sales OS</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {SALES_TABS.find(t => t.id === activeTab)?.label || 'Pipeline'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            ARR ${(totalPipeline / 1000).toFixed(0)}k
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsAdjustQuotaModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Target size={11} />
            <span className="hidden xs:inline">Quotas</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsNewDealModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>+ Deal</span>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PIPELINE */}
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Pipeline Commercial Enterprise"
                subtitle="Opportunités actives et pondération prédictive"
                badge={`$${(totalPipeline / 1000).toFixed(0)}k Total`}
                icon={Target}
                kpis={[
                  { label: 'Pipeline Pondéré', value: `$${(weightedPipeline / 1000).toFixed(0)}k`, sub: 'Pondéré par proba', trend: 'up' },
                  { label: 'Deals Actifs', value: `${deals.length}`, sub: `${deals.filter(d => d.stage === 'Négociation').length} en négociation` },
                  { label: 'Cycle Moyen', value: '28 jours', sub: '-6j vs Q2', trend: 'up' }
                ]}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-400">Opportunités en cours ({deals.length})</span>
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsNewDealModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Créer un Deal</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {deals.map(deal => (
                    <DetailCard
                      key={deal.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedDeal(deal);
                      }}
                      isInteractive
                      title={deal.name}
                      badge={`$${(deal.value / 1000).toFixed(0)}k`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Building2}
                      subtitle={`${deal.company} • ${deal.contact}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Étape : <strong className="text-slate-200">{deal.stage}</strong> ({deal.prob}%)</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{deal.nextStep}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Stratégie de Clôture Coach AI"
                  content="Le deal FinData S.A. ($15k) a une probabilité de clôture de 95%. La signature est imminente sous réserve de confirmation du DPA."
                  actionLabel="Générer le lien DocuSign"
                  onAction={() => {
                    haptics.trigger('success');
                    showToast('Lien de signature électronique DocuSign envoyé');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: FORECAST */}
          {activeTab === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Prévisions Commerciales & Quotas"
                subtitle="Projection trimestrielle du chiffre d'affaires signé"
                icon={TrendingUp}
                badge="Q3 2026"
                kpis={[
                  { label: 'Objectif Q3', value: `$${forecast[2]?.objectif || 280}k`, sub: 'Plafond cible' },
                  { label: 'Signé à date', value: `$${forecast[2]?.realise || 240}k`, sub: `${Math.round(((forecast[2]?.realise || 240) / (forecast[2]?.objectif || 280)) * 100)}% de l'objectif`, trend: 'up' },
                  { label: 'Pipeline Restant', value: '$180k', sub: 'Couverture 1.8x' }
                ]}
              >
                <DetailCard 
                  title="Objectif vs Réalisé par Trimestre ($k)" 
                  icon={TrendingUp}
                  isInteractive
                  onClick={() => {
                    haptics.trigger('selection');
                    setSelectedForecastQuarter(forecast[2]);
                  }}
                  actions={
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      Inspecter prévision Q3 →
                    </span>
                  }
                >
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={forecast}>
                        <XAxis dataKey="quarter" stroke="currentColor" opacity={0.4} fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px', fontSize: '11px' }}
                        />
                        <Bar dataKey="objectif" fill="#64748b" name="Objectif ($k)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="realise" fill="#10b981" name="Réalisé ($k)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Comptes Clés & Grands Comptes"
                subtitle="Portefeuille de clients sous contrat récurrent (ARR)"
                icon={Building2}
                badge={`${accounts.length} Comptes`}
                kpis={[
                  { label: 'ARR Total', value: '$260k', sub: 'Base installée', trend: 'up' },
                  { label: 'Net Revenue Retention', value: '118%', sub: 'Expansion continue', trend: 'up' },
                  { label: 'Santé Moyenne', value: '96%', sub: 'Risque faible' }
                ]}
              >
                <div className="space-y-3">
                  {accounts.map(acc => (
                    <DetailCard
                      key={acc.id}
                      title={acc.name}
                      badge={acc.arr}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Building2}
                      subtitle={acc.sector}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedAccount(acc);
                      }}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Santé du Compte : <strong className="text-emerald-400">{acc.health}</strong></span>
                        <span className="text-emerald-400 text-[11px] font-medium">Inspecter compte & expansion →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: ACTIVITIES */}
          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Journal des Échanges & Rendez-vous"
                subtitle="Historique des appels, emails et réunions commerciales"
                icon={Calendar}
                badge={`${activities.length} Récents`}
                kpis={[
                  { label: 'Appels Hebdo', value: '24', sub: '+12% vs sem. N-1', trend: 'up' },
                  { label: 'Temps en Rendez-vous', value: '18h', sub: 'Sur 5 jours' },
                  { label: 'Demos Réalisées', value: '8', sub: '100% qualifiées' }
                ]}
              >
                <div className="space-y-3">
                  {activities.map(act => (
                    <DetailCard
                      key={act.id}
                      title={act.title}
                      badge={act.time}
                      badgeColor="bg-slate-950 text-slate-400 border-slate-800 font-mono"
                      icon={act.icon}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedActivity(act);
                      }}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-300">Type : {act.type.toUpperCase()} {act.duration ? `• ${act.duration}` : ''}</span>
                        <span className="text-emerald-400 text-[11px] font-medium">Consulter le compte-rendu →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CRÉER UNE NOUVELLE OPPORTUNITÉ / DEAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewDealModalOpen && (
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
                    <Target size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Nouvelle Opportunité / Deal</h3>
                    <p className="text-[10px] text-slate-400">Enregistrement dans le pipeline commercial</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNewDealModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Titre de l'Opportunité *</label>
                  <input
                    type="text"
                    required
                    value={dealForm.name}
                    onChange={e => setDealForm({ ...dealForm, name: e.target.value })}
                    placeholder="Ex: Enterprise License PaaS Pro"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Client / Entreprise *</label>
                    <input
                      type="text"
                      required
                      value={dealForm.company}
                      onChange={e => setDealForm({ ...dealForm, company: e.target.value })}
                      placeholder="Ex: FinData S.A."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Valeur ($) *</label>
                    <input
                      type="number"
                      step="1000"
                      required
                      value={dealForm.value}
                      onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Contact Décideur</label>
                    <input
                      type="text"
                      value={dealForm.contact}
                      onChange={e => setDealForm({ ...dealForm, contact: e.target.value })}
                      placeholder="Ex: Sarah Jenkins"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Email Contact</label>
                    <input
                      type="email"
                      value={dealForm.email}
                      onChange={e => setDealForm({ ...dealForm, email: e.target.value })}
                      placeholder="s.jenkins@client.com"
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Étape</label>
                    <select
                      value={dealForm.stage}
                      onChange={e => {
                        const stage = e.target.value;
                        const prob = stage === 'Qualification' ? 30 : stage === 'Proposition' ? 60 : stage === 'Négociation' ? 85 : 95;
                        setDealForm({ ...dealForm, stage, prob });
                      }}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Qualification">Qualification (30%)</option>
                      <option value="Proposition">Proposition (60%)</option>
                      <option value="Négociation">Négociation (85%)</option>
                      <option value="Clôture">Clôture (95%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Probabilité (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={dealForm.prob}
                      onChange={e => setDealForm({ ...dealForm, prob: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Prochaine Étape Requise</label>
                  <input
                    type="text"
                    value={dealForm.nextStep}
                    onChange={e => setDealForm({ ...dealForm, nextStep: e.target.value })}
                    placeholder="Ex: Validation juridique & Signature DPA"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Notes Stratégiques</label>
                  <textarea
                    rows={2}
                    value={dealForm.notes}
                    onChange={e => setDealForm({ ...dealForm, notes: e.target.value })}
                    placeholder="Contexte concurrentiel, volume d'utilisateurs, stack technique..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewDealModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Créer le Deal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: AJUSTER QUOTA TRIMESTRIEL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAdjustQuotaModalOpen && (
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
                    <h3 className="font-bold text-sm text-slate-100">Ajuster Quota Commercial</h3>
                    <p className="text-[10px] text-slate-400">Objectifs de closing par trimestre</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdjustQuotaModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAdjustQuotaSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Trimestre Cible</label>
                  <select
                    value={quotaForm.quarter}
                    onChange={e => {
                      const q = forecast.find(f => f.quarter === e.target.value);
                      setQuotaForm({
                        ...quotaForm,
                        quarter: e.target.value,
                        newObjective: q ? q.objectif : quotaForm.newObjective
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  >
                    {forecast.map(f => (
                      <option key={f.quarter} value={f.quarter}>
                        {f.quarter} (Objectif: ${f.objectif}k • Réalisé: ${f.realise}k)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Nouvel Objectif ($k) *</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={quotaForm.newObjective}
                    onChange={e => setQuotaForm({ ...quotaForm, newObjective: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Motif du Réajustement</label>
                  <textarea
                    rows={2}
                    value={quotaForm.reason}
                    onChange={e => setQuotaForm({ ...quotaForm, reason: e.target.value })}
                    placeholder="Ex: Alignement avec la trajectoire prévisionnelle de rentrée..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustQuotaModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Appliquer Quota</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER DEAL INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        title={selectedDeal?.name || ''}
        subtitle={`${selectedDeal?.company} • Contact : ${selectedDeal?.contact}`}
        badge={selectedDeal?.stage}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedDeal?.company.charAt(0)}
        breadcrumbs={[
          { label: 'Sales OS', onClick: () => setSelectedDeal(null) },
          { label: 'Pipeline', onClick: () => setSelectedDeal(null) },
          { label: selectedDeal?.company || 'Deal' }
        ]}
        actions={[
          {
            id: 'sign',
            label: selectedDeal?.stage === 'Clôture' ? 'Contrat Signé' : 'Valider & Clôturer',
            icon: selectedDeal?.stage === 'Clôture' ? FileCheck : Send,
            variant: 'primary',
            onClick: () => {
              if (selectedDeal) handleAdvanceDealToClose(selectedDeal.id);
            }
          },
          {
            id: 'call',
            label: 'Lancer Appel',
            icon: PhoneCall,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Appel téléphonique initié vers ${selectedDeal?.contact}`);
            }
          },
          {
            id: 'delete_deal',
            label: 'Supprimer',
            icon: Trash2,
            variant: 'danger',
            onClick: () => {
              if (selectedDeal) handleDeleteDeal(selectedDeal.id, selectedDeal.name);
            }
          }
        ]}
        kpis={[
          { label: 'Valeur Deal', value: `$${selectedDeal?.value.toLocaleString()}`, sub: 'ARR Annuel' },
          { label: 'Probabilité', value: `${selectedDeal?.prob}%`, sub: 'Pondéré IA' },
          { label: 'Dernier Contact', value: selectedDeal?.lastTouch || '', sub: 'Activité récente' },
          { label: 'Étape Pipeline', value: selectedDeal?.stage || '', sub: selectedDeal?.nextStep }
        ]}
        aiInsight={{
          title: 'Conseil Négociation Coach AI',
          content: `Le décideur chez ${selectedDeal?.company} est sensible aux garanties de temps de rétablissement (MTTR < 15min). Mettez en avant le SLA Or 99.99%.`,
          actionLabel: 'Insérer clause SLA dans la proposition',
          onAction: () => {
            haptics.trigger('success');
            showToast('Clause SLA Or 99.99% ajoutée au devis');
          }
        }}
        tabs={[
          {
            id: 'notes',
            label: 'Détails & Stratégie',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-200">Notes Commerciales</span>
                  <p className="text-slate-400 leading-relaxed">{selectedDeal?.notes}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-200">Prochaine Étape Requise</span>
                  <p className="text-emerald-400 font-medium">{selectedDeal?.nextStep}</p>
                </div>
              </div>
            )
          },
          {
            id: 'timeline',
            label: `Historique (${selectedDeal?.timeline.length || 0})`,
            content: (
              <div className="space-y-2.5">
                {selectedDeal?.timeline.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.date}</div>
                    </div>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />

      {/* SLIDE-OVER ACCOUNT INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.name || ''}
        subtitle={`${selectedAccount?.sector} • Statut ${selectedAccount?.status}`}
        badge={selectedAccount?.arr}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedAccount?.name.charAt(0)}
        breadcrumbs={[
          { label: 'Sales OS', onClick: () => setSelectedAccount(null) },
          { label: 'Comptes', onClick: () => setSelectedAccount(null) },
          { label: selectedAccount?.name || 'Compte' }
        ]}
        actions={[
          {
            id: 'upsell',
            label: 'Offre Expansion +$30k',
            icon: TrendingUp,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Proposition d'expansion envoyée à ${selectedAccount?.name}`);
            }
          },
          {
            id: 'call_acc',
            label: 'Planifier QBR',
            icon: Calendar,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Revue trimestrielle QBR planifiée avec ${selectedAccount?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'ARR Actuel', value: selectedAccount?.arr || '$0', sub: 'Contrat pluriannuel' },
          { label: 'Score Santé', value: selectedAccount?.health || '100%', sub: 'NPS +82', trend: 'up' },
          { label: 'Potentiel Expansion', value: '+$35k', sub: 'Module PaaS Pro' },
          { label: 'Catégorie Compte', value: selectedAccount?.status || 'Tier 1', sub: 'SLA Prioritaire' }
        ]}
        aiInsight={{
          title: 'Opportunité d\'Expansion IA',
          content: `Le compte ${selectedAccount?.name} consomme 92% de son quota d'appels API. Une mise à niveau vers le plan Scale ajoutera +$35k ARR.`,
          actionLabel: 'Générer avenant d\'extension de capacité',
          onAction: () => {
            haptics.trigger('success');
            showToast('Avenant d\'extension généré');
          }
        }}
        tabs={[
          {
            id: 'overview',
            label: 'Gouvernance Compte',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interlocuteur Principal :</span>
                    <span className="text-slate-200">{selectedAccount?.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cycle de Renouvellement :</span>
                    <span className="text-slate-200">15 Décembre 2027</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* SLIDE-OVER ACTIVITY INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.title || ''}
        subtitle={`${selectedActivity?.time} • Type : ${selectedActivity?.type.toUpperCase()}`}
        badge="Enregistré"
        badgeColor="bg-slate-950 text-slate-300 border-slate-800"
        avatarText="A"
        breadcrumbs={[
          { label: 'Sales OS', onClick: () => setSelectedActivity(null) },
          { label: 'Activités', onClick: () => setSelectedActivity(null) },
          { label: 'Compte-rendu' }
        ]}
        actions={[
          {
            id: 'followup',
            label: 'Créer Tâche Suivi',
            icon: CheckCircle2,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast('Tâche de relance ajoutée au calendrier commercial');
            }
          }
        ]}
        kpis={[
          { label: 'Type Interaction', value: selectedActivity?.type.toUpperCase() || 'CALL', sub: selectedActivity?.duration || 'Standard' },
          { label: 'Horodatage', value: selectedActivity?.time || '', sub: 'Synchronisé CRM' },
          { label: 'Sentiment IA', value: 'Très Positif', sub: 'Score 9.4/10', trend: 'up' },
          { label: 'Statut Relance', value: 'Planifiée', sub: 'Dans 48h' }
        ]}
        aiInsight={{
          title: 'Synthèse Réunion Coach AI',
          content: 'L\'interlocuteur a validé l\'ensemble des points d\'architecture. Les prochaines étapes concernent la signature contractuelle.',
          actionLabel: 'Exporter le compte-rendu par email',
          onAction: () => {
            haptics.trigger('success');
            showToast('Compte-rendu envoyé par email');
          }
        }}
        tabs={[
          {
            id: 'notes_act',
            label: 'Points Clés',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <span className="font-semibold text-slate-200">Notes & Résumé</span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedActivity?.notes}
                  </p>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* SLIDE-OVER FORECAST QUARTER INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedForecastQuarter}
        onClose={() => setSelectedForecastQuarter(null)}
        title={`Prévisions ${selectedForecastQuarter?.quarter}`}
        subtitle={`Objectif : $${selectedForecastQuarter?.objectif}k • Réalisé : $${selectedForecastQuarter?.realise}k`}
        badge={`${Math.round(((selectedForecastQuarter?.realise || 0) / (selectedForecastQuarter?.objectif || 1)) * 100)}% de l'objectif`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="Q"
        breadcrumbs={[
          { label: 'Sales OS', onClick: () => setSelectedForecastQuarter(null) },
          { label: 'Prévisions', onClick: () => setSelectedForecastQuarter(null) },
          { label: selectedForecastQuarter?.quarter || 'Trimestre' }
        ]}
        actions={[
          {
            id: 'adjust_quota',
            label: 'Ajuster Quota',
            icon: Target,
            variant: 'primary',
            onClick: () => {
              if (selectedForecastQuarter) {
                setQuotaForm({
                  quarter: selectedForecastQuarter.quarter,
                  newObjective: selectedForecastQuarter.objectif,
                  reason: 'Réévaluation trimestrielle'
                });
                setIsAdjustQuotaModalOpen(true);
              }
            }
          }
        ]}
        kpis={[
          { label: 'Objectif Cible', value: `$${selectedForecastQuarter?.objectif}k`, sub: 'Quota assigné' },
          { label: 'Chiffre Réalisé', value: `$${selectedForecastQuarter?.realise}k`, sub: 'Signé ferme', trend: 'up' },
          { label: 'Écart Prévision', value: `+$${(selectedForecastQuarter?.realise || 0) - (selectedForecastQuarter?.objectif || 0)}k`, sub: 'Surperformance' },
          { label: 'Couverture Pipe', value: '2.4x', sub: 'Solide' }
        ]}
        tabs={[
          {
            id: 'fc_breakdown',
            label: 'Ventilation Deals',
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between">
                  <span className="text-slate-300">Nexus Global (Enterprise)</span>
                  <span className="font-mono text-emerald-400 font-bold">$120k</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between">
                  <span className="text-slate-300">Specter Tech (Integration)</span>
                  <span className="font-mono text-emerald-400 font-bold">$45k</span>
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
