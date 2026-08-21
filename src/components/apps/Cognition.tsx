import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Terminal, 
  Database, 
  Bot, 
  Zap, 
  ChevronRight, 
  X, 
  Clock, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Cpu,
  Sparkles,
  Workflow
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const MCP_LOGS = [
  { id: '1', tool: 'search_knowledge_graph', latency: '42ms', status: '200 OK', tokens: '142 in / 68 out', query: 'Lookup financial trends 2026' },
  { id: '2', tool: 'exec_financial_model', latency: '128ms', status: '200 OK', tokens: '520 in / 1.2k out', query: 'Calculate runway variance' },
  { id: '3', tool: 'generate_contract_dpa', latency: '840ms', status: '200 OK', tokens: '2.4k in / 4.8k out', query: 'Draft DPA for European client' },
];

const SWARM_AGENTS = [
  { id: 'sa1', name: 'Legal Sentinel', role: 'Audit contractuel & conformité', status: 'idle', load: '12%' },
  { id: 'sa2', name: 'Sales Closer AI', role: 'Génération de propositions', status: 'active', load: '78%' },
  { id: 'sa3', name: 'Ops Health Sentinel', role: 'Surveillance métriques MCP', status: 'active', load: '45%' },
];

const COGNITION_TABS = [
  { id: 'llm', label: 'Modèles', icon: BrainCircuit },
  { id: 'mcp_queries', label: 'Appels MCP', icon: Zap, badge: 3 },
  { id: 'vectors', label: 'Mémoire', icon: Database },
  { id: 'swarm', label: 'Agents', icon: Bot, badge: 3 }
];

export default function Cognition() {
  const [activeTab, setActiveTab] = useState('llm');
  const [selectedLog, setSelectedLog] = useState<typeof MCP_LOGS[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={COGNITION_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: LLM */}
          {activeTab === 'llm' && (
            <motion.div
              key="llm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Moteur d'Inférence & Modèles IA"
                subtitle="Routage dynamique Gemini 2.5 Flash / Pro"
                badge="Gemini 2.5 Active"
                icon={BrainCircuit}
                kpis={[
                  { label: 'Latence TTFT', value: '180ms', sub: 'Streaming Ultra-Rapide', trend: 'up' },
                  { label: 'Appels / Jour', value: '4,850', sub: '100% Succès' },
                  { label: 'Cache Hits', value: '84.2%', sub: 'Économie de tokens', trend: 'up' }
                ]}
              >
                <DetailCard title="Configuration du Moteur Cognitif" icon={BrainCircuit}>
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Modèle Principal</span>
                      <span className="font-mono text-emerald-400 font-semibold">gemini-2.5-flash</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Fenêtre de Contexte</span>
                      <span className="font-mono text-slate-200 font-semibold">1,000,000 tokens</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Protocole d'Outillage</span>
                      <span className="font-mono text-emerald-400 font-semibold">MCP Server Native</span>
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Analyse Performance Inférence"
                  content="Le taux de réutilisation du cache de contexte context_caching atteint 84.2%, réduisant la consommation de quota de 4x sur les requêtes récurrentes."
                  actionLabel="Ajuster les hyperparamètres"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: MCP_QUERIES */}
          {activeTab === 'mcp_queries' && (
            <motion.div
              key="mcp_queries"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Historique des Appels d'Outils MCP"
                subtitle="Exécutions des fonctions natives de l'OS par l'IA"
                icon={Zap}
                badge="Temps Réel"
              >
                <div className="space-y-3">
                  {MCP_LOGS.map(log => (
                    <DetailCard
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      isInteractive
                      title={log.tool}
                      badge={log.latency}
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono"
                      icon={Zap}
                      subtitle={log.query}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-mono">{log.tokens}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{log.status}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: VECTORS */}
          {activeTab === 'vectors' && (
            <motion.div
              key="vectors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Mémoire Vectorielle & Indexation HNSW"
                subtitle="Embeddings sémantiques pour la recherche RAG instantanée"
                icon={Database}
                badge="8,420 Vecteurs"
              >
                <DetailCard title="Statistiques de la Base Vectorielle" icon={Database}>
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> Indexation temps réel via text-embedding-004.
                    </p>
                    <p>Similarité cosinus moyenne des requêtes utilisateur : 0.94.</p>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SWARM */}
          {activeTab === 'swarm' && (
            <motion.div
              key="swarm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Essaim d'Agents Spécialisés (Swarm)"
                subtitle="Orchestration collaborative d'agents autonomes"
                icon={Bot}
                badge="3 Agents Actifs"
              >
                <div className="space-y-3">
                  {SWARM_AGENTS.map(ag => (
                    <DetailCard
                      key={ag.id}
                      title={ag.name}
                      badge={ag.status === 'active' ? 'En action' : 'En veille'}
                      badgeColor={ag.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
                      icon={Bot}
                      subtitle={ag.role}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Charge de travail</span>
                        <span className="font-mono text-emerald-400 font-semibold">{ag.load}</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Log Detail */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Détail Appel MCP</span>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedLog.tool}</h3>
                <div className="text-xs text-slate-400">Latence d'exécution : {selectedLog.latency}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Requête d'Entrée</div>
                <div className="text-xs text-slate-200 font-mono">{selectedLog.query}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Consommation Tokens</div>
                <div className="text-xs text-emerald-400 font-mono">{selectedLog.tokens}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
