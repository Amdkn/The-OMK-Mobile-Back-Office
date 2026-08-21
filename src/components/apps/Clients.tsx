import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  ExternalLink, 
  ShieldAlert, 
  Calendar, 
  FileText, 
  Share2, 
  Archive, 
  Clock, 
  Activity, 
  Check, 
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers,
  FileCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  dueDate: string;
}

interface Client {
  id: string;
  name: string;
  mrr: number;
  status: 'active' | 'at-risk' | 'lead' | 'onboarding';
  healthScore: number;
  lastContact: string;
  industry: string;
  tier: 'Enterprise' | 'Growth' | 'Scale';
  sla: string;
  renewalDate: string;
  revenueHistory: { month: string; revenue: number }[];
  contacts: Contact[];
  projects: Project[];
  aiInsight: {
    title: string;
    content: string;
    actionLabel: string;
  };
  notes: string;
}

const CLIENTS_TABS = [
  { id: 'portefeuille', label: 'Portefeuille', icon: Users, badge: 4 },
  { id: 'pipeline', label: 'Pipeline & Onboarding', icon: TrendingUp, badge: '3 Actifs' },
  { id: 'sante', label: 'Santé & Risques', icon: Activity, badge: '1 Alerte', badgeColor: 'bg-amber-500 text-slate-950' },
  { id: 'support', label: 'SLA & Support', icon: ShieldAlert, badge: 3 },
  { id: 'contrats', label: 'Contrats', icon: FileCheck, badge: '$38k/m' }
];

const INITIAL_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'Acme Corp', 
    mrr: 12500, 
    status: 'active', 
    healthScore: 94, 
    lastContact: 'Il y a 2h', 
    industry: 'Cloud & SaaS',
    tier: 'Enterprise',
    sla: '99.99% (SLA Or)',
    renewalDate: '15 Déc 2026',
    notes: 'Compte stratégique. Très satisfait du module BaaS Hub. Envisage un déploiement mondial.',
    revenueHistory: [
      { month: 'Jan', revenue: 9500 },
      { month: 'Fév', revenue: 10200 },
      { month: 'Mar', revenue: 11000 },
      { month: 'Avr', revenue: 12500 },
    ],
    contacts: [
      { id: 'c1', name: 'Alice Smith', role: 'Chief Executive Officer', email: 'alice@acme.co', phone: '+33 6 12 34 56 78' },
      { id: 'c2', name: 'Bob Jones', role: 'VP Engineering', email: 'bob@acme.co', phone: '+33 6 98 76 54 32' }
    ],
    projects: [
      { id: 'p1', name: 'Migration Infrastructure Cloud', status: 'in-progress', progress: 75, dueDate: '15 Jan 2027' },
      { id: 'p2', name: 'Audit de Sécurité SOC2', status: 'completed', progress: 100, dueDate: '01 Nov 2026' }
    ],
    aiInsight: {
      title: 'Opportunité d\'Expansion +$4k MRR',
      content: 'L\'utilisation de l\'API Cognition a augmenté de 140% ce trimestre. Recommandation d\'upsell vers le forfait Enterprise Uncapped.',
      actionLabel: 'Générer proposition commerciale'
    }
  },
  { 
    id: '2', 
    name: 'Global Tech Industries', 
    mrr: 8400, 
    status: 'at-risk', 
    healthScore: 42, 
    lastContact: 'Il y a 3j', 
    industry: 'FinTech & Banking',
    tier: 'Enterprise',
    sla: '99.95% (SLA Argent)',
    renewalDate: '28 Fév 2027',
    notes: 'Signale des latences sur le cluster Francfort. Risque de désengagement si non résolu d\'ici 10 jours.',
    revenueHistory: [
      { month: 'Jan', revenue: 12000 },
      { month: 'Fév', revenue: 11000 },
      { month: 'Mar', revenue: 9500 },
      { month: 'Avr', revenue: 8400 },
    ],
    contacts: [
      { id: 'c3', name: 'Charlie Davis', role: 'Head of Infrastructure', email: 'cdavis@globaltech.com', phone: '+1 555-0200' },
      { id: 'c4', name: 'Emma Watson', role: 'Procurement Lead', email: 'ewatson@globaltech.com', phone: '+1 555-0201' }
    ],
    projects: [
      { id: 'p3', name: 'Refonte Pipeline de Données', status: 'on-hold', progress: 35, dueDate: '31 Déc 2026' },
      { id: 'p4', name: 'Optimisation Latence Francfort', status: 'in-progress', progress: 60, dueDate: '10 Nov 2026' }
    ],
    aiInsight: {
      title: 'Alerte Churn Critique (48h)',
      content: 'Baisse de 40% de l\'activité sur le dashboard. 2 tickets de latence non résolus. Lancer un call exécutif de synchronisation.',
      actionLabel: 'Organiser réunion de crise'
    }
  },
  { 
    id: '3', 
    name: 'Nexus Dynamics AI', 
    mrr: 14200, 
    status: 'active', 
    healthScore: 98, 
    lastContact: 'Il y a 30m', 
    industry: 'Autonomous Systems',
    tier: 'Scale',
    sla: '99.99% (SLA Or)',
    renewalDate: '10 Août 2027',
    notes: 'Partenaire clé en IA. Consommation intensive des modèles de raisonnement distribué.',
    revenueHistory: [
      { month: 'Jan', revenue: 6000 },
      { month: 'Fév', revenue: 8500 },
      { month: 'Mar', revenue: 11200 },
      { month: 'Avr', revenue: 14200 },
    ],
    contacts: [
      { id: 'c5', name: 'Diana Prince', role: 'Co-Fondatrice & CTO', email: 'diana@nexus.ai', phone: '+1 555-0300' }
    ],
    projects: [
      { id: 'p5', name: 'Déploiement Ontologie Multi-Agents', status: 'in-progress', progress: 90, dueDate: '05 Déc 2026' }
    ],
    aiInsight: {
      title: 'Croissance Exceptionnelle (+136%)',
      content: 'Nexus Dynamics est en passe de devenir le 1er client en volume de requêtes. Prévoir un cluster dédié dans PaaS Pro.',
      actionLabel: 'Configurer noeud dédié'
    }
  },
  { 
    id: '4', 
    name: 'Vortex Logistics', 
    mrr: 3200, 
    status: 'onboarding', 
    healthScore: 88, 
    lastContact: 'Il y a 1j', 
    industry: 'Logistique & Fret',
    tier: 'Growth',
    sla: '99.90% (SLA Standard)',
    renewalDate: '15 Oct 2027',
    notes: 'Phase d\'onboarding en cours. Intégration API des flottes de transport.',
    revenueHistory: [
      { month: 'Jan', revenue: 0 },
      { month: 'Fév', revenue: 1200 },
      { month: 'Mar', revenue: 2400 },
      { month: 'Avr', revenue: 3200 },
    ],
    contacts: [
      { id: 'c6', name: 'Marc Dupont', role: 'Directeur des Opérations', email: 'm.dupont@vortex.eu', phone: '+33 6 44 22 11 00' }
    ],
    projects: [
      { id: 'p6', name: 'Intégration Télématique API', status: 'in-progress', progress: 50, dueDate: '20 Nov 2026' }
    ],
    aiInsight: {
      title: 'Onboarding à 75% du jalon 1',
      content: 'Les webhooks de tracking sont fonctionnels. Il reste la validation des certificats SSL pour mise en production.',
      actionLabel: 'Valider les certificats'
    }
  }
];

export default function Clients() {
  const [activeTab, setActiveTab] = useState('portefeuille');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || c.tier.toLowerCase() === filterTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const totalMRR = clients.reduce((acc, c) => acc + c.mrr, 0);
  const avgHealth = Math.round(clients.reduce((acc, c) => acc + c.healthScore, 0) / clients.length);
  const activeCount = clients.filter(c => c.status === 'active').length;

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={CLIENTS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PORTEFEUILLE (CLIENTS LIST & MASTER-DETAIL) */}
          {activeTab === 'portefeuille' && (
            <motion.div
              key="portefeuille"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Portefeuille Clients Entreprise"
                subtitle="Gestion centralisée des comptes, MRR et engagement opérationnel"
                badge={`${clients.length} Comptes Suivis`}
                icon={Users}
                kpis={[
                  { label: 'MRR Global', value: `$${totalMRR.toLocaleString()}`, sub: '+18.4% ce mois', trend: 'up' },
                  { label: 'Score Santé Moyen', value: `${avgHealth}/100`, sub: 'Optimum > 85', trend: 'up' },
                  { label: 'Comptes Actifs', value: `${activeCount}/${clients.length}`, sub: 'Taux rétention 96%' }
                ]}
              >
                {/* Search & Filtering Bar */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Rechercher un compte, secteur ou contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shrink-0 text-xs">
                    {(['all', 'Enterprise', 'Scale', 'Growth'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setFilterTier(tier)}
                        className={`px-2.5 py-1 rounded-xl transition-colors text-[11px] ${
                          filterTier === tier 
                            ? 'bg-slate-800 text-emerald-400 font-medium' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tier === 'all' ? 'Tous' : tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clients Cards List with Deep Interaction */}
                <div className="space-y-3">
                  {filteredClients.map((client) => {
                    const isAtRisk = client.status === 'at-risk';
                    const isLead = client.status === 'lead';
                    const isOnboarding = client.status === 'onboarding';

                    const badgeColor = isAtRisk
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : isOnboarding
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : isLead
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                    const badgeText = isAtRisk
                      ? 'À Risque'
                      : isOnboarding
                      ? 'Onboarding'
                      : isLead
                      ? 'Prospect'
                      : 'Actif & Sain';

                    return (
                      <DetailCard
                        key={client.id}
                        title={client.name}
                        subtitle={`${client.industry} • ${client.tier}`}
                        icon={Building2}
                        badge={badgeText}
                        badgeColor={badgeColor}
                        isInteractive
                        onClick={() => setSelectedClient(client)}
                        actions={
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-100 text-xs">
                              ${client.mrr.toLocaleString()}<span className="text-[10px] text-slate-500 font-normal">/m</span>
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                              <ArrowUpRight size={13} />
                            </div>
                          </div>
                        }
                      >
                        {/* Nested Mini Data Rows */}
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Activity size={13} className={isAtRisk ? 'text-red-400' : 'text-emerald-400'} />
                              <span>Score Santé:</span>
                              <span className={`font-semibold ${isAtRisk ? 'text-red-400' : 'text-emerald-400'}`}>
                                {client.healthScore}/100
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Clock size={11} />
                              <span>Dernier contact: {client.lastContact}</span>
                            </div>
                          </div>

                          {/* Mini Progress bar of health */}
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full rounded-full ${
                                isAtRisk ? 'bg-red-500' : client.healthScore > 90 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${client.healthScore}%` }}
                            />
                          </div>

                          {/* Quick sub-tags */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-400">
                              {client.contacts.length} Contact{client.contacts.length > 1 ? 's' : ''} • {client.projects.length} Projet{client.projects.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-emerald-400/90 font-medium text-[10px]">
                              Cliquer pour inspecter →
                            </span>
                          </div>
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>

                <AIInsightCard
                  title="Supervision IA du Portefeuille"
                  content="Le compte Global Tech Industries nécessite une intervention sous 48h. À l'inverse, Acme Corp et Nexus Dynamics présentent un potentiel d'upsell immédiat de +$18,200 d'ARR."
                  actionLabel="Lancer la séquence de rétention automatique"
                  onAction={() => showToast('Séquence de rétention IA déployée avec succès')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: PIPELINE & ONBOARDING */}
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Pipeline d'Acquisition & Déploiement"
                subtitle="Suivi des étapes d'intégration technique et d'activation des contrats"
                icon={TrendingUp}
                badge="3 Déploiements Actifs"
                kpis={[
                  { label: 'Valeur Pipeline', value: '$64,000', sub: 'ARR Pondéré', trend: 'up' },
                  { label: 'Délai d\'Activation', value: '14 Jours', sub: 'Moyenne système' },
                  { label: 'Taux de Conversion', value: '78%', sub: '+6% vs mois N-1', trend: 'up' }
                ]}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { stage: '1. Cadrage & Architecture', count: 2, value: '$22k', color: 'border-sky-500/40 text-sky-400', desc: 'Définition des connecteurs d\'ontologie et dimensionnement des pods' },
                    { stage: '2. Intégration API & Webhooks', count: 1, value: '$18k', color: 'border-amber-500/40 text-amber-400', desc: 'Vérification des clés de chiffrement et configuration des endpoints' },
                    { stage: '3. Recette de Sécurité SOC2', count: 1, value: '$14k', color: 'border-purple-500/40 text-purple-400', desc: 'Audit des règles d\'isolation réseau et tests d\'intrusion' },
                    { stage: '4. Mise en Production', count: 1, value: '$10k', color: 'border-emerald-500/40 text-emerald-400', desc: 'Bascule du trafic en direct et monitoring des SLA 99.99%' },
                  ].map((step, idx) => (
                    <DetailCard
                      key={idx}
                      title={step.stage}
                      badge={`${step.count} Compte(s)`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Layers}
                      subtitle={step.desc}
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">ARR Estimé:</span>
                        <span className="font-mono font-bold text-slate-100">{step.value}</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: SANTÉ & RISQUES */}
          {activeTab === 'sante' && (
            <motion.div
              key="sante"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Matrice de Santé & Prévention du Churn"
                subtitle="Algorithmes prédictifs analysant la fréquence d'usage et les signaux faibles"
                icon={Activity}
                badge="1 Risque Détecté"
                kpis={[
                  { label: 'NPS Global', value: '+74', sub: 'Excellent (Benchmark 60)', trend: 'up' },
                  { label: 'Volatilité MRR', value: '1.2%', sub: 'Niveau minimal' },
                  { label: 'Expansion Potentielle', value: '+$34k', sub: 'D\'ici Q4 2026', trend: 'up' }
                ]}
              >
                <DetailCard
                  title="Analyse Détaillée des Risques"
                  subtitle="Comptes nécessitant une action prioritaire"
                  icon={AlertTriangle}
                  badge="Urgence Haute"
                  badgeColor="bg-red-500/10 text-red-400 border-red-500/30"
                >
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-red-300 text-xs">Global Tech Industries</span>
                        <span className="text-[10px] text-red-400 font-mono">Santé: 42/100</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Décroissance d'activité de -40% suite aux latences constatées sur le cluster Francfort. Un contact direct avec Charlie Davis est recommandé.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedClient(clients.find(c => c.id === '2') || null);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium text-center"
                        >
                          Ouvrir la fiche d'incident →
                        </button>
                        <button 
                          onClick={() => showToast('Ticket d\'urgence escaladé à l\'équipe Infrastructure')}
                          className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-800"
                        >
                          Escalader Ingénierie
                        </button>
                      </div>
                    </div>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SUPPORT & SLA */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Engagements de Service & Tickets SLA"
                subtitle="Respect des temps de réponse et résolution des requêtes critiques"
                icon={ShieldAlert}
                badge="SLA 99.98% Respecté"
                kpis={[
                  { label: 'Temps Moyen Réponse', value: '14 min', sub: 'Objectif < 30 min', trend: 'up' },
                  { label: 'Tickets Résolus', value: '98.4%', sub: 'Premier contact' },
                  { label: 'Disponibilité API', value: '99.99%', sub: 'SLA Entreprise' }
                ]}
              >
                <div className="space-y-3">
                  {[
                    { id: 't1', client: 'Global Tech', title: 'Latence API v2 Frankfurt cluster', priority: 'P1 - Critique', time: 'Il y a 45m', status: 'En cours de diagnostic' },
                    { id: 't2', client: 'Nexus Dynamics', title: 'Extension quota token cognition', priority: 'P3 - Normale', time: 'Il y a 2h', status: 'Résolu (Quota doublé)' },
                    { id: 't3', client: 'Vortex Logistics', title: 'Validation certificat SSL webhook', priority: 'P2 - Moyenne', time: 'Il y a 4h', status: 'En attente retour client' }
                  ].map((ticket) => (
                    <DetailCard
                      key={ticket.id}
                      title={ticket.title}
                      subtitle={`${ticket.client} • ${ticket.time}`}
                      icon={ShieldAlert}
                      badge={ticket.priority}
                      badgeColor={ticket.priority.includes('P1') ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Statut: <strong className="text-slate-200">{ticket.status}</strong></span>
                        <button 
                          onClick={() => showToast(`Ticket ${ticket.id} synchronisé avec le support 24/7`)}
                          className="text-emerald-400 hover:underline text-[11px] font-medium"
                        >
                          Détails du fil →
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 5: CONTRATS & FACTURATION */}
          {activeTab === 'contrats' && (
            <motion.div
              key="contrats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Contrats, Renouvellements & Facturation"
                subtitle="Engagements contractuels pluriannuels et cycles de facturation"
                icon={FileCheck}
                badge="$456k ARR Total"
                kpis={[
                  { label: 'ARR Contractuel', value: '$456,000', sub: 'Revenus récurrents', trend: 'up' },
                  { label: 'Prochain Renouvellement', value: '15 Déc 2026', sub: 'Acme Corp (100% probabilité)' },
                  { label: 'Factures Émises', value: '100%', sub: 'Zéro impayé' }
                ]}
              >
                <div className="space-y-3">
                  {clients.map((c) => (
                    <DetailCard
                      key={c.id}
                      title={c.name}
                      subtitle={`SLA: ${c.sla} • Renouvellement: ${c.renewalDate}`}
                      icon={FileText}
                      badge={`${c.tier} Plan`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      isInteractive
                      onClick={() => setSelectedClient(c)}
                      actions={
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          ${(c.mrr * 12).toLocaleString()}/an
                        </span>
                      }
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Cycle de facturation: <strong className="text-slate-200">Mensuel Automatisé</strong></span>
                        <span className="text-slate-500 text-[11px]">Inspecter les clauses →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* DEEP DRILLDOWN SLIDE-OVER INSPECTOR FOR ANY SELECTED CLIENT */}
      <DetailDrawer
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.name || ''}
        subtitle={`${selectedClient?.industry} • Tier ${selectedClient?.tier}`}
        badge={selectedClient?.status === 'at-risk' ? 'À Risque' : selectedClient?.status === 'onboarding' ? 'Onboarding' : 'Actif'}
        badgeColor={selectedClient?.status === 'at-risk' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        avatarText={selectedClient?.name.charAt(0)}
        actions={[
          {
            id: 'call',
            label: 'Lancer Visio',
            icon: Phone,
            variant: 'primary',
            onClick: () => showToast(`Appel visio sécurisé initié avec ${selectedClient?.name}`)
          },
          {
            id: 'email',
            label: 'Email Compte',
            icon: Mail,
            onClick: () => showToast(`Modèle d'email pré-rempli envoyé pour ${selectedClient?.name}`)
          },
          {
            id: 'export',
            label: 'Export PDF',
            icon: FileText,
            onClick: () => showToast(`Rapport exécutif PDF généré pour ${selectedClient?.name}`)
          }
        ]}
        kpis={[
          { label: 'Revenu MRR', value: `$${selectedClient?.mrr.toLocaleString()}`, sub: 'Mensuel garanti' },
          { label: 'Score Santé', value: `${selectedClient?.healthScore}/100`, sub: selectedClient?.healthScore! > 80 ? 'Optimal' : 'Sous surveillance' },
          { label: 'Niveau SLA', value: selectedClient?.sla.split(' ')[0] || '99.9%', sub: selectedClient?.sla.split(' ')[1] || 'SLA Standard' },
          { label: 'Échéance Renouvellement', value: selectedClient?.renewalDate || 'N/A', sub: 'Reconduction tacite' }
        ]}
        aiInsight={selectedClient?.aiInsight ? {
          title: selectedClient.aiInsight.title,
          content: selectedClient.aiInsight.content,
          actionLabel: selectedClient.aiInsight.actionLabel,
          onAction: () => showToast(`Action IA activée: ${selectedClient.aiInsight.actionLabel}`)
        } : undefined}
        tabs={[
          {
            id: 'analytics',
            label: 'MRR & Métriques',
            content: (
              <div className="space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-300">Évolution Historique MRR ($)</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">+24% Q1-Q2</span>
                  </div>
                  
                  <div className="h-44 w-full">
                    {selectedClient && selectedClient.revenueHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedClient.revenueHistory}>
                          <defs>
                            <linearGradient id="clientMrrGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                          <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 12, fontSize: 12 }} />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#clientMrrGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">Aucune donnée historique</div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-200">Notes Stratégiques du Compte</div>
                  <p className="text-slate-400 leading-relaxed">{selectedClient?.notes}</p>
                </div>
              </div>
            )
          },
          {
            id: 'contacts',
            label: `Contacts (${selectedClient?.contacts.length || 0})`,
            content: (
              <div className="space-y-2.5">
                {selectedClient?.contacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{contact.name}</div>
                      <div className="text-[11px] text-slate-400">{contact.role}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{contact.email}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => showToast(`Appel vers ${contact.phone}...`)}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-emerald-400 transition-colors"
                      >
                        <Phone size={13} />
                      </button>
                      <button 
                        onClick={() => showToast(`Email envoyé à ${contact.email}`)}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                      >
                        <Mail size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'projects',
            label: `Projets (${selectedClient?.projects.length || 0})`,
            content: (
              <div className="space-y-2.5">
                {selectedClient?.projects.map((proj) => (
                  <div key={proj.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 text-xs">{proj.name}</span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        proj.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : proj.status === 'on-hold'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Progression</span>
                        <span className="font-mono font-bold text-slate-200">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Échéance: {proj.dueDate}</span>
                      <button 
                        onClick={() => showToast(`Jalon pour ${proj.name} validé`)}
                        className="text-emerald-400 hover:underline"
                      >
                        Marquer jalon validé
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />

      {/* Floating Action Toast Notification */}
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
