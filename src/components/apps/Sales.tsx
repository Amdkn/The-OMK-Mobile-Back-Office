import { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

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

const FORECAST_DATA = [
  { quarter: 'Q1', objectif: 200, realise: 215 },
  { quarter: 'Q2', objectif: 240, realise: 260 },
  { quarter: 'Q3', objectif: 280, realise: 240 },
  { quarter: 'Q4 (Est.)', objectif: 320, realise: 350 },
];

const ACCOUNTS = [
  { id: 'a1', name: 'Nexus Global Inc.', sector: 'Enterprise FinTech', arr: '$120k ARR', health: '98%', status: 'Tier 1' },
  { id: 'a2', name: 'Specter Tech Solutions', sector: 'Legal Tech', arr: '$45k ARR', health: '92%', status: 'Tier 2' },
  { id: 'a3', name: 'FinData S.A.', sector: 'Banque & Assurance', arr: '$95k ARR', health: '99%', status: 'Tier 1' },
];

const ACTIVITIES = [
  { id: 'act1', type: 'call', title: 'Appel de cadrage Sarah Jenkins', time: 'Aujourd\'hui, 11:00', duration: '32m', icon: PhoneCall },
  { id: 'act2', type: 'mail', title: 'Envoi contrat MSA Mike Ross', time: 'Hier, 18:20', icon: Mail },
  { id: 'act3', type: 'meeting', title: 'Comité de direction FinData', time: 'Il y a 2j', icon: Calendar },
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
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalPipeline = deals.reduce((acc, d) => acc + d.value, 0);
  const weightedPipeline = Math.round(deals.reduce((acc, d) => acc + (d.value * (d.prob / 100)), 0));

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={SALES_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

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
                  { label: 'Deals Actifs', value: `${deals.length}`, sub: '2 en négociation' },
                  { label: 'Cycle Moyen', value: '28 jours', sub: '-6j vs Q2', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {deals.map(deal => (
                    <DetailCard
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
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
                  onAction={() => showToast('Lien de signature électronique DocuSign envoyé')}
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
                title="Prévisions de Ventes Trimestrielles"
                subtitle="Atteinte des objectifs commerciaux ($k)"
                badge="Taux Réalisation: 108%"
                icon={TrendingUp}
                kpis={[
                  { label: 'Objectif Q3', value: '$280k', sub: 'Cible fixée' },
                  { label: 'Réalisé à date', value: '$240k', sub: '86% atteint', trend: 'up' },
                  { label: 'Projection Q4', value: '$350k', sub: 'Prévision IA', trend: 'up' }
                ]}
              >
                <DetailCard title="Comparatif Objectif vs Réalisé (k$)" icon={TrendingUp}>
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={FORECAST_DATA}>
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
                badge="3 Comptes Stratégiques"
                kpis={[
                  { label: 'ARR Total', value: '$260k', sub: 'Base installée', trend: 'up' },
                  { label: 'Net Revenue Retention', value: '118%', sub: 'Expansion continue', trend: 'up' },
                  { label: 'Santé Moyenne', value: '96%', sub: 'Risque faible' }
                ]}
              >
                <div className="space-y-3">
                  {ACCOUNTS.map(acc => (
                    <DetailCard
                      key={acc.id}
                      title={acc.name}
                      badge={acc.arr}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Building2}
                      subtitle={acc.sector}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Santé du Compte : <strong className="text-emerald-400">{acc.health}</strong></span>
                        <span className="text-slate-300 font-semibold">{acc.status}</span>
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
                badge="3 Récents"
                kpis={[
                  { label: 'Appels Hebdo', value: '24', sub: '+12% vs sem. N-1', trend: 'up' },
                  { label: 'Temps en Rendez-vous', value: '18h', sub: 'Sur 5 jours' },
                  { label: 'Demos Réalisées', value: '8', sub: '100% qualifiées' }
                ]}
              >
                <div className="space-y-3">
                  {ACTIVITIES.map(act => (
                    <DetailCard
                      key={act.id}
                      title={act.title}
                      badge={act.time}
                      badgeColor="bg-slate-950 text-slate-400 border-slate-800 font-mono"
                      icon={act.icon}
                    >
                      <div className="text-xs text-slate-300 pt-1">
                        Type d'interaction : {act.type.toUpperCase()}
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
            label: 'Envoyer Contrat',
            icon: Send,
            variant: 'primary',
            onClick: () => showToast(`Liasse contractuelle expédiée à ${selectedDeal?.contact}`)
          },
          {
            id: 'call',
            label: 'Lancer Appel',
            icon: PhoneCall,
            onClick: () => showToast(`Appel téléphonique initié vers ${selectedDeal?.contact}`)
          },
          {
            id: 'pdf',
            label: 'Devis PDF',
            icon: FileText,
            onClick: () => showToast(`Devis commercial généré pour ${selectedDeal?.company}`)
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
          onAction: () => showToast('Clause SLA Or ajoutée au devis')
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
