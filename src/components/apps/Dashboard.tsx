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
  BellRing
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const REVENUE_DATA = [
  { day: 'Lun', mrr: 84000, users: 1200, growth: 4.2 },
  { day: 'Mar', mrr: 84500, users: 1232, growth: 4.8 },
  { day: 'Mer', mrr: 85200, users: 1241, growth: 5.1 },
  { day: 'Jeu', mrr: 85100, users: 1255, growth: 4.9 },
  { day: 'Ven', mrr: 86900, users: 1280, growth: 6.3 },
];

const COHORT_DATA = [
  { cohort: 'M-3', retention: 94, newUsers: 340 },
  { cohort: 'M-2', retention: 91, newUsers: 420 },
  { cohort: 'M-1', retention: 89, newUsers: 510 },
  { cohort: 'Actuel', retention: 96, newUsers: 640 },
];

const SYSTEM_NODES = [
  { id: 'mcp-core', name: 'MCP Core Engine', latency: '12ms', status: 'optimal', uptime: '99.99%', load: '24%' },
  { id: 'harness', name: 'Data Harness Pipeline', latency: '45ms', status: 'optimal', uptime: '99.95%', load: '48%' },
  { id: 'vector-db', name: 'Vector DB (Chroma/Pinecone)', latency: '68ms', status: 'optimal', uptime: '99.90%', load: '52%' },
  { id: 'ws-cli', name: 'CLI WebSocket Gateway', latency: '180ms', status: 'warning', uptime: '98.40%', load: '88%' },
];

const INCIDENTS_DATA = [
  { id: 'inc-1', title: 'Latence accrue WebSocket Gateway', time: 'Il y a 12m', status: 'investigating', sev: 'P2', desc: 'Pic de connexions concurrentes sur le portail dev.' },
  { id: 'inc-2', title: 'Synchronisation Stripe Webhooks', time: 'Il y a 2h', status: 'resolved', sev: 'P3', desc: 'Rapprochement bancaire exécuté avec 0 perte.' },
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
                <DetailCard title="Trajectoire du Revenu Récurrent (MRR)" icon={TrendingUp}>
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
                </DetailCard>

                <AIInsightCard
                  title="Synthèse Stratégique Coach AI"
                  content="La croissance hebdomadaire de +6.3% est tirée par l'acquisition de 2 nouveaux comptes Enterprise. Le taux de churn sur la cohorte Q2 est de 0%."
                  actionLabel="Générer le rapport pour les investisseurs"
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
              >
                <div className="space-y-3">
                  {SYSTEM_NODES.map(node => (
                    <DetailCard
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      isInteractive
                      title={node.name}
                      badge={node.status === 'optimal' ? 'Optimal' : 'Attention'}
                      badgeColor={node.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={Cpu}
                      subtitle={`Disponibilité : ${node.uptime} • Charge : ${node.load}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Temps de réponse :</span>
                        <span className={`font-mono font-semibold ${node.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {node.latency}
                        </span>
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
                badge="1 Alerte Active"
                badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
              >
                <div className="space-y-3">
                  {INCIDENTS_DATA.map(inc => (
                    <DetailCard
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      isInteractive
                      title={inc.title}
                      badge={inc.sev}
                      badgeColor={inc.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                      icon={AlertTriangle}
                      subtitle={inc.time}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{inc.desc}</p>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Node Detail */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Détail du Nœud</span>
              <button onClick={() => setSelectedNode(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedNode.name}</h3>
                <div className="text-xs text-slate-400">Statut : {selectedNode.status.toUpperCase()}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Latence Réseau</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedNode.latency}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Disponibilité SLA</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedNode.uptime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Charge CPU / Mémoire</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedNode.load}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
