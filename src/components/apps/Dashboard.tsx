import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  Bot, 
  Activity, 
  TrendingUp, 
  Zap, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  Cpu,
  BellRing,
  RotateCw,
  ShieldCheck,
  Download,
  Terminal,
  Radio,
  Users,
  DollarSign,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

const REVENUE_DATA = [
  { day: 'Lun', mrr: 84000, users: 1200, growth: 4.2 },
  { day: 'Mar', mrr: 84500, users: 1232, growth: 4.8 },
  { day: 'Mer', mrr: 85200, users: 1241, growth: 5.1 },
  { day: 'Jeu', mrr: 85100, users: 1255, growth: 4.9 },
  { day: 'Ven', mrr: 86900, users: 1280, growth: 6.3 },
];

const COHORT_DATA = [
  { id: 'c-m3', cohort: 'M-3 (Mai 2026)', retention: 94, newUsers: 340, ltv: '$4,200', cac: '$320', churnRisk: '0.8%' },
  { id: 'c-m2', cohort: 'M-2 (Juin 2026)', retention: 91, newUsers: 420, ltv: '$4,500', cac: '$290', churnRisk: '1.2%' },
  { id: 'c-m1', cohort: 'M-1 (Juil 2026)', retention: 89, newUsers: 510, ltv: '$4,800', cac: '$310', churnRisk: '1.5%' },
  { id: 'c-act', cohort: 'Actuel (Août 2026)', retention: 96, newUsers: 640, ltv: '$5,200', cac: '$280', churnRisk: '0.4%' },
];

const SYSTEM_NODES = [
  { id: 'mcp-core', name: 'MCP Core Engine', latency: '12ms', status: 'optimal', uptime: '99.99%', load: '24%', region: 'US-East (Virginia)', version: 'v4.2.1', memory: '14.2 GB / 64 GB' },
  { id: 'harness', name: 'Data Harness Pipeline', latency: '45ms', status: 'optimal', uptime: '99.95%', load: '48%', region: 'EU-West (Frankfurt)', version: 'v2.8.0', memory: '28.4 GB / 64 GB' },
  { id: 'vector-db', name: 'Vector DB (Chroma/Pinecone)', latency: '68ms', status: 'optimal', uptime: '99.90%', load: '52%', region: 'EU-West (Paris)', version: 'v0.9.4', memory: '32.1 GB / 64 GB' },
  { id: 'ws-cli', name: 'CLI WebSocket Gateway', latency: '180ms', status: 'warning', uptime: '98.40%', load: '88%', region: 'AP-South (Tokyo)', version: 'v1.4.2', memory: '56.8 GB / 64 GB' },
];

const INCIDENTS_DATA = [
  { 
    id: 'inc-1', 
    title: 'Latence accrue WebSocket Gateway', 
    time: 'Il y a 12m', 
    status: 'investigating' as const, 
    sev: 'P2 - Sévérité Moyenne', 
    desc: 'Pic de connexions concurrentes sur le portail dev suite à un afflux de requêtes CLI.',
    service: 'CLI WebSocket Gateway (Tokyo)',
    impact: '14 utilisateurs impactés (latence > 150ms)',
    rca: 'Augmentation soudaine du pool de sockets sans réallocation HPA automatique.'
  },
  { 
    id: 'inc-2', 
    title: 'Synchronisation Stripe Webhooks', 
    time: 'Il y a 2h', 
    status: 'resolved' as const, 
    sev: 'P3 - Mineure', 
    desc: 'Rapprochement bancaire exécuté avec 0 perte de données.',
    service: 'Stripe Billing Webhook Handler',
    impact: 'Zéro transaction perdue, reprise automatique Redis',
    rca: 'Timeout ponctuel de 3.2s résolu après retry exponentiel.'
  },
];

const DASHBOARD_TABS = [
  { id: 'summary', label: 'Vue Globale', icon: LayoutDashboard },
  { id: 'metrics', label: 'Métriques', icon: BarChart3 },
  { id: 'systems', label: 'Systèmes', icon: Cpu, badge: 4 },
  { id: 'alerts', label: 'Alertes', icon: BellRing, badge: 1, badgeColor: 'bg-amber-500 text-slate-950' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedNode, setSelectedNode] = useState<typeof SYSTEM_NODES[0] | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<typeof INCIDENTS_DATA[0] | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<typeof COHORT_DATA[0] | null>(null);
  const [isRevenueDetailOpen, setIsRevenueDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={DASHBOARD_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Cockpit de Pilotage Global"
                subtitle="Synthèse exécutif des opérations et finances"
                badge="Santé 98%"
                icon={LayoutDashboard}
                kpis={[
                  { label: 'MRR Consolidé', value: '$86.9k', sub: '+6.3% cette semaine', trend: 'up' },
                  { label: 'Utilisateurs Actifs', value: '1,280', sub: '+14% vs M-1', trend: 'up' },
                  { label: 'NPS Global', value: '78', sub: 'Excellence client' }
                ]}
              >
                {/* Revenue Evolution */}
                <DetailCard 
                  title="Trajectoire du Revenu Récurrent (MRR)" 
                  icon={TrendingUp}
                  isInteractive
                  onClick={() => {
                    haptics.trigger('selection');
                    setIsRevenueDetailOpen(true);
                  }}
                  actions={
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      Inspecter flux <ArrowUpRight size={12} />
                    </span>
                  }
                >
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={REVENUE_DATA}>
                        <XAxis dataKey="day" stroke="currentColor" opacity={0.4} fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px', fontSize: '11px' }}
                        />
                        <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} name="MRR ($)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-800/60 mt-2">
                    <span className="text-slate-400">Croissance Hebdo : <strong className="text-emerald-400 font-mono">+6.3%</strong></span>
                    <span className="text-slate-400 font-mono text-[11px]">Objectif Q3 : $100k</span>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Synthèse Stratégique Coach AI"
                  content="La croissance hebdomadaire de +6.3% est tirée par l'acquisition de 2 nouveaux comptes Enterprise. Le taux de churn sur la cohorte Q2 est de 0%."
                  actionLabel="Générer le rapport pour les investisseurs"
                  onAction={() => showToast('Rapport investisseurs Q3 généré et exporté')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: METRICS */}
          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Analyse des Cohortes & Rétention"
                subtitle="Comportement et fidélisation des utilisateurs"
                icon={BarChart3}
                badge="Rétention 96%"
                kpis={[
                  { label: 'Rétention Moyenne', value: '92.5%', sub: 'Au-dessus du benchmark SaaS', trend: 'up' },
                  { label: 'LTV Moyen', value: '$4,675', sub: '+12% vs 2025', trend: 'up' },
                  { label: 'CAC Récupéré', value: '1.8 mois', sub: 'Payback ultra-rapide' }
                ]}
              >
                <DetailCard title="Rétention par Cohorte (%)" icon={BarChart3}>
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={COHORT_DATA}>
                        <XAxis dataKey="cohort" stroke="currentColor" opacity={0.4} fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px', fontSize: '11px' }}
                        />
                        <Bar dataKey="retention" fill="#10b981" name="Rétention (%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </DetailCard>

                <div className="space-y-3 pt-2">
                  {COHORT_DATA.map(c => (
                    <DetailCard
                      key={c.id}
                      title={c.cohort}
                      badge={`${c.retention}% Rétention`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Users}
                      subtitle={`${c.newUsers} Nouveaux Utilisateurs • LTV: ${c.ltv}`}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCohort(c);
                      }}
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Risque Churn : <strong className="text-slate-200">{c.churnRisk}</strong></span>
                        <span className="text-emerald-400 text-[11px] font-medium">Inspecter la cohorte →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: SYSTEMS */}
          {activeTab === 'systems' && (
            <motion.div
              key="systems"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Santé des Nœuds d'Exécution"
                subtitle="Disponibilité et latence de l'architecture microservices"
                icon={Cpu}
                badge="4 Nœuds"
                kpis={[
                  { label: 'Disponibilité Globale', value: '99.98%', sub: 'SLA Entreprise' },
                  { label: 'Latence Moyenne', value: '18ms', sub: 'Optimale', trend: 'up' },
                  { label: 'Capacité Pods', value: '28%', sub: 'Charge sous contrôle' }
                ]}
              >
                <div className="space-y-3">
                  {SYSTEM_NODES.map(node => (
                    <DetailCard
                      key={node.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedNode(node);
                      }}
                      isInteractive
                      title={node.name}
                      badge={node.status === 'optimal' ? 'Optimal' : 'Attention'}
                      badgeColor={node.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={Cpu}
                      subtitle={`Disponibilité : ${node.uptime} • Charge : ${node.load}`}
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Temps de réponse : <strong className={`font-mono ${node.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>{node.latency}</strong></span>
                        <span className="text-emerald-400 text-[11px] font-medium">Inspecter télémétrie →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: ALERTS */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Alertes & Événements Système"
                subtitle="Incidents surveillés en temps réel par les sentinelles"
                icon={BellRing}
                badge={`${INCIDENTS_DATA.length} Incidents`}
                badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
                kpis={[
                  { label: 'Incidents Actifs', value: '1', sub: 'P2 - En diagnostic' },
                  { label: 'MTTR Moyen', value: '8.4 min', sub: 'Objectif < 15 min', trend: 'up' },
                  { label: 'Impact Financier', value: '$0.00', sub: 'Zéro pénalité SLA' }
                ]}
              >
                <div className="space-y-3">
                  {INCIDENTS_DATA.map(inc => (
                    <DetailCard
                      key={inc.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedIncident(inc);
                      }}
                      isInteractive
                      title={inc.title}
                      badge={inc.sev}
                      badgeColor={inc.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                      icon={AlertTriangle}
                      subtitle={`${inc.service} • ${inc.time}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{inc.desc}</p>
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Statut: <strong className={inc.status === 'investigating' ? 'text-amber-400' : 'text-emerald-400'}>{inc.status === 'investigating' ? 'En cours d\'investigation' : 'Résolu'}</strong></span>
                        <span className="text-emerald-400 text-[11px] font-medium">Détails incident & RCA →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DRAWER DÉTAIL DU NŒUD SYSTÈME */}
      <DetailDrawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={selectedNode?.name || ''}
        subtitle={`${selectedNode?.region} • Version ${selectedNode?.version}`}
        badge={selectedNode?.status === 'optimal' ? 'Opérationnel' : 'Sous Pression'}
        badgeColor={selectedNode?.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        avatarText={selectedNode?.name.charAt(0)}
        breadcrumbs={[
          { label: 'Dashboard OS', onClick: () => setSelectedNode(null) },
          { label: 'Systèmes', onClick: () => setSelectedNode(null) },
          { label: selectedNode?.name || 'Nœud' }
        ]}
        actions={[
          {
            id: 'reboot',
            label: 'Redémarrer Pod',
            icon: RefreshCw,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Pod ${selectedNode?.name} redémarré avec succès`);
            }
          },
          {
            id: 'cache',
            label: 'Purger Cache',
            icon: RotateCw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Cache L2/Redis purgé pour ${selectedNode?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Latence Réseau', value: selectedNode?.latency || '0ms', sub: 'Round-trip time' },
          { label: 'Disponibilité SLA', value: selectedNode?.uptime || '99.9%', sub: 'Mesure 30 jours' },
          { label: 'Charge CPU', value: selectedNode?.load || '0%', sub: '4 Cores alloués' },
          { label: 'Mémoire RAM', value: selectedNode?.memory.split('/')[0] || '14 GB', sub: `Max ${selectedNode?.memory.split('/')[1] || '64 GB'}` }
        ]}
        aiInsight={{
          title: 'Diagnostic Sentinelle AI',
          content: selectedNode?.status === 'optimal'
            ? `Le cluster ${selectedNode?.name} fonctionne avec une stabilité nominale. Le taux d'erreur 5xx est de 0.00%.`
            : `Le nœud ${selectedNode?.name} subit une saturation transitoire. Nous recommandons d'activer l'autoscaling horizontal.`,
          actionLabel: 'Déclencher répartition de charge',
          onAction: () => showToast('Équilibrage de charge déclenché')
        }}
        tabs={[
          {
            id: 'telemetry',
            label: 'Télémétrie',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocole Réseau :</span>
                    <span className="font-mono text-slate-200">HTTP/2 + gRPC mTLS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DNS & Ingress :</span>
                    <span className="font-mono text-emerald-400">Cloudflare Enterprise Edge</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dernier Heartbeat :</span>
                    <span className="font-mono text-slate-200">Il y a 3 secondes</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DRAWER DÉTAIL INCIDENT / ALERTE */}
      <DetailDrawer
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title || ''}
        subtitle={`${selectedIncident?.service} • ${selectedIncident?.time}`}
        badge={selectedIncident?.sev || 'Incident'}
        badgeColor={selectedIncident?.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        avatarText="!"
        breadcrumbs={[
          { label: 'Dashboard OS', onClick: () => setSelectedIncident(null) },
          { label: 'Alertes', onClick: () => setSelectedIncident(null) },
          { label: selectedIncident?.title || 'Incident' }
        ]}
        actions={[
          {
            id: 'resolve',
            label: 'Clôturer Incident',
            icon: CheckCircle2,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Incident "${selectedIncident?.title}" marqué comme résolu`);
              setSelectedIncident(null);
            }
          },
          {
            id: 'escalate',
            label: 'Escalader SRE',
            icon: BellRing,
            onClick: () => {
              haptics.trigger('medium');
              showToast('Alerte PagerDuty transmise à l\'ingénieur d\'astreinte');
            }
          }
        ]}
        kpis={[
          { label: 'Sévérité', value: selectedIncident?.sev.split(' ')[0] || 'P2', sub: 'Priorité SLA' },
          { label: 'Statut', value: selectedIncident?.status === 'investigating' ? 'En cours' : 'Résolu', sub: 'Investigation SRE' },
          { label: 'Impact Client', value: '14 users', sub: 'Tokyo cluster' },
          { label: 'Pénalité SLA', value: '$0.00', sub: 'Dans les limites' }
        ]}
        aiInsight={{
          title: 'Analyse Cause Racine (RCA)',
          content: selectedIncident?.rca || 'Analyse en cours par l\'agent sentinelle.',
          actionLabel: 'Appliquer correctif automatique',
          onAction: () => showToast('Correctif de mise à l\'échelle automatique appliqué')
        }}
        tabs={[
          {
            id: 'impact',
            label: 'Impact & Détails',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Description de l'anomalie</span>
                  <p className="text-slate-400 leading-relaxed">{selectedIncident?.desc}</p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Périmètre Impacté :</span>
                    <span className="text-slate-200">{selectedIncident?.impact}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DRAWER DÉTAIL COHORTE */}
      <DetailDrawer
        isOpen={!!selectedCohort}
        onClose={() => setSelectedCohort(null)}
        title={`Cohorte ${selectedCohort?.cohort}`}
        subtitle={`${selectedCohort?.newUsers} Utilisateurs Actifs • Acquisition Q2-Q3`}
        badge={`${selectedCohort?.retention}% Rétention`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedCohort?.cohort.charAt(0)}
        breadcrumbs={[
          { label: 'Dashboard OS', onClick: () => setSelectedCohort(null) },
          { label: 'Métriques', onClick: () => setSelectedCohort(null) },
          { label: selectedCohort?.cohort || 'Cohorte' }
        ]}
        actions={[
          {
            id: 'campaign',
            label: 'Campagne Réactivation',
            icon: Flame,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Campagne d'expansion envoyée à la cohorte ${selectedCohort?.cohort}`);
            }
          },
          {
            id: 'export',
            label: 'Exporter CSV',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Données de la cohotre ${selectedCohort?.cohort}.csv exportées`);
            }
          }
        ]}
        kpis={[
          { label: 'Taux Rétention', value: `${selectedCohort?.retention}%`, sub: 'Benchmark > 85%' },
          { label: 'LTV Moyen', value: selectedCohort?.ltv || '$0', sub: 'Valeur vie client' },
          { label: 'Coût Acquisition (CAC)', value: selectedCohort?.cac || '$0', sub: 'Payback < 2 mois' },
          { label: 'Risque de Churn', value: selectedCohort?.churnRisk || '0%', sub: 'Signaux faibles' }
        ]}
        aiInsight={{
          title: 'Stratégie de Rétention AI',
          content: `La cohorte ${selectedCohort?.cohort} affiche une rétention de ${selectedCohort?.retention}%, surperformant le benchmark SaaS de +12%. Recommandation : proposer un plan annuel avec engagement 24 mois.`,
          actionLabel: 'Générer offre d\'upgrade annuel',
          onAction: () => showToast('Offre d\'upgrade annuel envoyée')
        }}
        tabs={[
          {
            id: 'details',
            label: 'Comportement',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fréquence d'utilisation :</span>
                    <span className="text-slate-200">5.2 sessions / semaine</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Adoption fonctionnalités :</span>
                    <span className="text-emerald-400">88% des modules activés</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DRAWER DÉTAIL TRAJECTOIRE REVENUS MRR */}
      <DetailDrawer
        isOpen={isRevenueDetailOpen}
        onClose={() => setIsRevenueDetailOpen(false)}
        title="Détail Trajectoire & Flux MRR"
        subtitle="Consolidation des revenus récurrents ($86,900/mois)"
        badge="Croissance +6.3%"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="$"
        breadcrumbs={[
          { label: 'Dashboard OS', onClick: () => setIsRevenueDetailOpen(false) },
          { label: 'Vue Globale', onClick: () => setIsRevenueDetailOpen(false) },
          { label: 'Trajectoire MRR' }
        ]}
        actions={[
          {
            id: 'forecast',
            label: 'Simuler Forecast Q4',
            icon: TrendingUp,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast('Simulation de trajectoire Q4 ($120k MRR) calculée');
            }
          },
          {
            id: 'export_mrr',
            label: 'Exporter Grand Livre',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast('Journal des ventes Stripe exporté');
            }
          }
        ]}
        kpis={[
          { label: 'MRR Actuel', value: '$86,900', sub: '+$5.1k ce mois', trend: 'up' },
          { label: 'ARR Projeté', value: '$1,042,800', sub: 'Cap des $1M atteint', trend: 'up' },
          { label: 'Net Revenue Retention', value: '118%', sub: 'Expansion positive' },
          { label: 'ARPU Moyen', value: '$2,480', sub: 'Par compte entreprise' }
        ]}
        aiInsight={{
          title: 'Analyse Économique AI',
          content: 'Avec un NRR de 118% et une croissance hebdomadaire continue, le seuil de $100,000 MRR sera franchi début Octobre 2026.',
          actionLabel: 'Voir le plan de recrutement commercial',
          onAction: () => showToast('Plan de recrutement sales affiché')
        }}
        tabs={[
          {
            id: 'composition',
            label: 'Composition Revenus',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plans Enterprise :</span>
                    <span className="font-mono text-emerald-400 font-bold">$64,000 (73.6%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plans Scale :</span>
                    <span className="font-mono text-slate-200">$18,400 (21.2%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Add-ons Cognition / AI :</span>
                    <span className="font-mono text-sky-400">$4,500 (5.2%)</span>
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

