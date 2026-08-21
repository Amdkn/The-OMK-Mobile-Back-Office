import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  RotateCcw,
  Zap,
  Layers,
  Database
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const NODES = [
  { id: 'node-us-east', name: 'us-east-cluster-01', status: 'healthy', cpu: '34%', mem: '58%', region: 'N. Virginia', pods: 42 },
  { id: 'node-eu-west', name: 'eu-west-cluster-02', status: 'healthy', cpu: '22%', mem: '44%', region: 'Frankfurt', pods: 28 },
  { id: 'node-ap-south', name: 'ap-south-edge-01', status: 'warning', cpu: '88%', mem: '91%', region: 'Singapore', pods: 16 },
];

const DEPLOYS = [
  { id: 'd1', commit: 'e89f2a1', branch: 'main', author: 'Alexandre M.', time: 'Il y a 14 min', status: 'deployed', service: 'api-gateway:v4.2.1' },
  { id: 'd2', commit: 'c44b910', branch: 'feat/mcp-harness', author: 'Sophie L.', time: 'Il y a 2h', status: 'deployed', service: 'mcp-harness:v1.9.0' },
  { id: 'd3', commit: 'a12d098', branch: 'main', author: 'Alexandre M.', time: 'Hier', status: 'deployed', service: 'auth-service:v3.4.0' },
];

const LOGS = [
  '[2026-08-21 14:28:10] INFO  [gateway] Ingress request route=/api/v1/auth status=200 duration=14ms',
  '[2026-08-21 14:28:12] INFO  [mcp-core] Sync handshake completed with node-eu-west',
  '[2026-08-21 14:28:15] WARN  [ap-south] Memory pressure warning threshold > 90%',
  '[2026-08-21 14:28:20] INFO  [db-proxy] Connection pool active: 24/50 idle: 26',
];

const PAAS_TABS = [
  { id: 'cluster', label: 'Cluster', icon: Cpu },
  { id: 'nodes', label: 'Nœuds', icon: Server, badge: 3 },
  { id: 'deploys', label: 'Déploiements', icon: RotateCcw },
  { id: 'logs', label: 'Logs', icon: Terminal }
];

export default function PaaSPro() {
  const [activeTab, setActiveTab] = useState('cluster');
  const [selectedNode, setSelectedNode] = useState<typeof NODES[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={PAAS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: CLUSTER */}
          {activeTab === 'cluster' && (
            <motion.div
              key="cluster"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Infrastructure Cloud & Microservices"
                subtitle="Réseau distribué et passerelles API MCP"
                badge="3 Régions"
                icon={Cpu}
                kpis={[
                  { label: 'Uptime Global', value: '99.98%', sub: 'SLA Respecté' },
                  { label: 'Total Pods', value: '86', sub: 'Autoscaling On' },
                  { label: 'Latence Moyenne', value: '18ms', sub: '-4ms vs hier', trend: 'up' }
                ]}
              >
                <DetailCard title="Statut du Maillage MCP" icon={Zap}>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-200">Global Service Mesh</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Opérationnel
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                      <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Débit Réseau</div>
                        <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">4.2 Gbps</div>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Requêtes / sec</div>
                        <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">14,200 RPS</div>
                      </div>
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Optimisation Infrastructure"
                  content="Le nœud ap-south-edge-01 approche des 90% de mémoire utilisée. Recommandation : déclencher le scale horizontal de 2 pods additionnels."
                  actionLabel="Appliquer le redimensionnement"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: NODES */}
          {activeTab === 'nodes' && (
            <motion.div
              key="nodes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Clusters & Serveurs Dédiés"
                subtitle="Surveillance de la charge CPU et mémoire"
                icon={Server}
                badge="3 Nœuds"
              >
                <div className="space-y-3">
                  {NODES.map(node => (
                    <DetailCard
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      isInteractive
                      title={node.name}
                      badge={node.region}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Server}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">CPU</div>
                          <div className={`text-xs font-mono font-semibold mt-0.5 ${node.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {node.cpu}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Mémoire</div>
                          <div className={`text-xs font-mono font-semibold mt-0.5 ${node.status === 'warning' ? 'text-red-400' : 'text-slate-200'}`}>
                            {node.mem}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Pods</div>
                          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{node.pods} pods</div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: DEPLOYS */}
          {activeTab === 'deploys' && (
            <motion.div
              key="deploys"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Historique des Déploiements CI/CD"
                subtitle="Pipelines GitHub Actions & Cloud Run automatiques"
                icon={RotateCcw}
                badge="100% Succès"
              >
                <div className="space-y-3">
                  {DEPLOYS.map(d => (
                    <DetailCard
                      key={d.id}
                      title={d.service}
                      badge={d.status}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={RotateCcw}
                    >
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="text-slate-300">
                          <span className="font-mono text-emerald-400">{d.commit}</span> • {d.branch} ({d.author})
                        </div>
                        <span className="text-[10px] text-slate-500">{d.time}</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: LOGS */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Flux de Télémétrie en Direct"
                subtitle="Logs système temps réel filtrés par sévérité"
                icon={Terminal}
                badge="Streaming"
              >
                <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-3 font-mono text-[11px] space-y-2 text-slate-300">
                  {LOGS.map((log, idx) => (
                    <div key={idx} className="leading-relaxed border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                      {log}
                    </div>
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
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{selectedNode.name}</h3>
                  <div className="text-xs text-slate-400">Région : {selectedNode.region}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${selectedNode.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Utilisation CPU</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedNode.cpu}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Utilisation Mémoire RAM</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedNode.mem}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Instances Pods Actives</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedNode.pods}</span>
                </div>
              </div>

              <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-xs font-semibold text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors">
                <RefreshCw size={14} /> Redémarrer / Purger Cache Nœud
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
