import React, { useState } from 'react';
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
  Workflow,
  ArrowUpRight,
  Play,
  Copy,
  Check,
  Search,
  Sliders,
  DollarSign,
  Gauge,
  FileCode,
  ShieldCheck,
  RotateCcw,
  Boxes,
  Compass
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

// TYPES & INTERFACES
export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'standby' | 'rate-limited';
  isDefault: boolean;
  contextWindow: number;
  latencyTtft: string;
  costInPer1k: number;
  costOutPer1k: number;
  cacheCostPer1k: number;
  description: string;
  benchmarks: {
    mmluPro: string;
    humanEval: string;
    math500: string;
  };
  supportedModalities: string[];
}

export interface VectorCollection {
  id: string;
  name: string;
  engine: string;
  vectorCount: number;
  dimensions: number;
  similarityMetric: 'Cosine' | 'Dot Product' | 'Euclidean';
  similarityThreshold: number;
  indexingStrategy: string;
  chunkSize: number;
  chunkOverlap: number;
  splittingStrategy: string;
  recallRate: string;
  description: string;
  sampleChunks: {
    id: string;
    content: string;
    score: number;
    metadata: Record<string, string>;
  }[];
}

export interface McpLogItem {
  id: string;
  tool: string;
  latency: string;
  status: string;
  tokens: string;
  query: string;
  outputPreview: Record<string, any>;
  serverName: string;
  timestamp: string;
}

export interface SwarmAgentItem {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'busy';
  load: string;
  currentTask: string;
  assignedTools: string[];
  memoryUsage: string;
  tokensToday: string;
}

// SAMPLE DATA
const LLM_MODELS: LLMModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google Cloud Vertex AI',
    status: 'active',
    isDefault: true,
    contextWindow: 1000000,
    latencyTtft: '140ms',
    costInPer1k: 0.000075,
    costOutPer1k: 0.000300,
    cacheCostPer1k: 0.000018,
    description: 'Modèle haute vélocité ultra-réactif avec streaming de tokens natif et cache de contexte étendu.',
    benchmarks: {
      mmluPro: '84.8%',
      humanEval: '82.4%',
      math500: '79.2%'
    },
    supportedModalities: ['Texte', 'Code', 'Vision', 'Audio']
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google Cloud Vertex AI',
    status: 'active',
    isDefault: false,
    contextWindow: 2000000,
    latencyTtft: '420ms',
    costInPer1k: 0.001250,
    costOutPer1k: 0.005000,
    cacheCostPer1k: 0.000310,
    description: 'Modèle de raisonnement complexe à 2M de tokens pour l\'analyse contractuelle et l\'ontologie.',
    benchmarks: {
      mmluPro: '91.2%',
      humanEval: '89.6%',
      math500: '88.4%'
    },
    supportedModalities: ['Texte', 'Code', 'Vision', 'Audio', 'Vidéo']
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic AWS Bedrock',
    status: 'active',
    isDefault: false,
    contextWindow: 200000,
    latencyTtft: '310ms',
    costInPer1k: 0.003000,
    costOutPer1k: 0.015000,
    cacheCostPer1k: 0.000750,
    description: 'Excellence en synthèse de code, architecture logicielle et orchestration d\'agents autonomes.',
    benchmarks: {
      mmluPro: '90.4%',
      humanEval: '92.0%',
      math500: '87.1%'
    },
    supportedModalities: ['Texte', 'Code', 'Vision']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omnichannel',
    provider: 'OpenAI Azure Enterprise',
    status: 'active',
    isDefault: false,
    contextWindow: 128000,
    latencyTtft: '290ms',
    costInPer1k: 0.002500,
    costOutPer1k: 0.010000,
    cacheCostPer1k: 0.000625,
    description: 'Moteur polyvalent haute précision avec support d\'appels de fonctions outillées stricts.',
    benchmarks: {
      mmluPro: '88.7%',
      humanEval: '88.2%',
      math500: '84.6%'
    },
    supportedModalities: ['Texte', 'Vision', 'Audio']
  }
];

const VECTOR_COLLECTIONS: VectorCollection[] = [
  {
    id: 'vec-kb',
    name: 'enterprise-kb-v3',
    engine: 'Pinecone Serverless + text-embedding-004',
    vectorCount: 4820,
    dimensions: 1536,
    similarityMetric: 'Cosine',
    similarityThreshold: 0.88,
    indexingStrategy: 'HNSW (M=16, efConstruction=200)',
    chunkSize: 512,
    chunkOverlap: 64,
    splittingStrategy: 'Recursive Character Splitter [Markdown/AST]',
    recallRate: '98.6%',
    description: 'Base de connaissances des contrats clients, engagements SLA, clauses de conformité et DPA.',
    sampleChunks: [
      {
        id: 'chk-101',
        content: 'Article 8.3 : Engagement de disponibilité SLA à 99.99% sur cluster Francfort avec pénalités de crédit à hauteur de 10% par heure d\'indisponibilité non planifiée.',
        score: 0.96,
        metadata: { client: 'Global Tech', doc: 'Contract_Enterprise_2026.pdf', section: 'SLA' }
      },
      {
        id: 'chk-102',
        content: 'Article 12.1 : Chiffrement des données de santé au repos via AES-256-GCM et clés matérielles sous enclave HSM FIPS 140-2 Level 3.',
        score: 0.91,
        metadata: { client: 'Nexus Dynamics', doc: 'Security_Addendum.pdf', section: 'Security' }
      }
    ]
  },
  {
    id: 'vec-ontology',
    name: 'system-ontology-embeddings',
    engine: 'PostgreSQL pgvector (HNSW index)',
    vectorCount: 2150,
    dimensions: 768,
    similarityMetric: 'Dot Product',
    similarityThreshold: 0.84,
    indexingStrategy: 'HNSW vector_cosine_ops',
    chunkSize: 256,
    chunkOverlap: 32,
    splittingStrategy: 'Token-Aware AST Chunking',
    recallRate: '99.1%',
    description: 'Index vectoriel des définitions de schémas, entités et dépendances relationnelles du graphe.',
    sampleChunks: [
      {
        id: 'chk-201',
        content: 'Entity: BillingAccount - Fields: [id, client_id, currency, balance, tax_rate]. Inbound relations: ClientCore. Outbound: LedgerTransactions.',
        score: 0.94,
        metadata: { domain: 'Finance', table: 'billing.accounts' }
      }
    ]
  },
  {
    id: 'vec-crm',
    name: 'crm-support-threads',
    engine: 'ChromaDB Local Cluster',
    vectorCount: 1450,
    dimensions: 1536,
    similarityMetric: 'Cosine',
    similarityThreshold: 0.85,
    indexingStrategy: 'IVFFlat (nlist=100)',
    chunkSize: 384,
    chunkOverlap: 48,
    splittingStrategy: 'Dialogue Turn Splitter',
    recallRate: '96.4%',
    description: 'Historique des interactions clients, résolutions de tickets et diagnostics SRE mémorisés.',
    sampleChunks: [
      {
        id: 'chk-301',
        content: 'Résolution incident WebSocket Tokyo : Redimensionnement automatique HPA déployé avec pallier min=3 conteneurs.',
        score: 0.89,
        metadata: { ticketId: 't1', service: 'WebSocket Gateway' }
      }
    ]
  }
];

const MCP_LOGS: McpLogItem[] = [
  { 
    id: '1', 
    tool: 'search_knowledge_graph', 
    latency: '42ms', 
    status: '200 OK', 
    tokens: '142 in / 68 out', 
    query: 'Lookup financial trends 2026 for tier Enterprise',
    serverName: 'mcp-ontology-server:8080',
    timestamp: 'Il y a 3 min',
    outputPreview: {
      matchCount: 3,
      nodesFound: ['ClientCore', 'FinancialLedger', 'ContractSLA'],
      confidence: 0.984
    }
  },
  { 
    id: '2', 
    tool: 'exec_financial_model', 
    latency: '128ms', 
    status: '200 OK', 
    tokens: '520 in / 1.2k out', 
    query: 'Calculate runway variance with 18.4% MRR growth',
    serverName: 'mcp-finance-server:8082',
    timestamp: 'Il y a 14 min',
    outputPreview: {
      projectedRunwayMonths: 34.2,
      burnRateMonthly: '$42,500',
      ebitdaMargin: '+38.4%'
    }
  },
  { 
    id: '3', 
    tool: 'generate_contract_dpa', 
    latency: '840ms', 
    status: '200 OK', 
    tokens: '2.4k in / 4.8k out', 
    query: 'Draft DPA for European client with GDPR and ISO27001 clauses',
    serverName: 'mcp-legal-server:8085',
    timestamp: 'Il y a 45 min',
    outputPreview: {
      dpaId: 'DPA-2026-EU-992',
      complianceValid: true,
      signaturesRequired: ['Legal_Sentinel', 'Client_CEO']
    }
  },
];

const SWARM_AGENTS: SwarmAgentItem[] = [
  { 
    id: 'sa1', 
    name: 'Legal Sentinel', 
    role: 'Audit contractuel & conformité RGPD/SOC2', 
    status: 'idle', 
    load: '12%',
    currentTask: 'En attente d\'analyse de nouvel avenant',
    assignedTools: ['generate_contract_dpa', 'search_knowledge_graph', 'verify_signatures'],
    memoryUsage: '38 MB / 512 MB',
    tokensToday: '18.4k tokens'
  },
  { 
    id: 'sa2', 
    name: 'Sales Closer AI', 
    role: 'Génération de propositions et tarification dynamique', 
    status: 'active', 
    load: '78%',
    currentTask: 'Négociation de proposition pour Nexus Dynamics',
    assignedTools: ['exec_financial_model', 'lookup_client_mrr', 'send_proposal_email'],
    memoryUsage: '142 MB / 512 MB',
    tokensToday: '64.2k tokens'
  },
  { 
    id: 'sa3', 
    name: 'Ops Health Sentinel', 
    role: 'Surveillance métriques MCP & nœuds d\'exécution', 
    status: 'active', 
    load: '45%',
    currentTask: 'Sonde de latence active sur cluster Tokyo',
    assignedTools: ['check_node_health', 'restart_pod', 'reindex_vectors'],
    memoryUsage: '84 MB / 512 MB',
    tokensToday: '32.8k tokens'
  },
];

const COGNITION_TABS = [
  { id: 'llm', label: 'Modèles LLM', icon: BrainCircuit, badge: 4 },
  { id: 'vectors', label: 'Embeddings & RAG', icon: Database, badge: '8.4k' },
  { id: 'mcp_queries', label: 'Appels MCP', icon: Zap, badge: 3 },
  { id: 'swarm', label: 'Essaim Swarm', icon: Bot, badge: 3 }
];

export default function Cognition() {
  const [activeTab, setActiveTab] = useState('llm');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Drawer States
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<VectorCollection | null>(null);
  const [selectedLog, setSelectedLog] = useState<McpLogItem | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgentItem | null>(null);

  // Prompt Test Runner States (inside model drawer)
  const [testSystemPrompt, setTestSystemPrompt] = useState('Vous êtes l\'IA de pilotage exécutif de l\'OS OMK Mobile.');
  const [testUserPrompt, setTestUserPrompt] = useState('Analyse la trajectoire MRR et propose une action de rétention.');
  const [testTemperature, setTestTemperature] = useState(0.7);
  const [isRunningInference, setIsRunningInference] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<string | null>(null);
  const [inferenceStats, setInferenceStats] = useState<{ ttft: string; tokens: string; cost: string } | null>(null);

  // Vector Search Sandbox States (inside collection drawer)
  const [searchQuery, setSearchQuery] = useState('Engagement SLA et disponibilité Francfort');
  const [similaritySlider, setSimilaritySlider] = useState(0.85);
  const [isSearchingVectors, setIsSearchingVectors] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof VECTOR_COLLECTIONS[0]['sampleChunks'] | null>(null);

  // Active default model
  const [defaultModelId, setDefaultModelId] = useState('gemini-2.5-flash');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunInference = (model: LLMModel) => {
    if (!testUserPrompt.trim()) return;
    setIsRunningInference(true);
    haptics.trigger('medium');
    setInferenceResult(null);
    setInferenceStats(null);

    setTimeout(() => {
      setIsRunningInference(false);
      haptics.trigger('success');
      setInferenceResult(
        `[${model.name} Inférence Complétée]\nSur la base des métriques consolidées, la trajectoire MRR est en hausse de +18.4%. Recommandation : activer le module de détection prédictive du churn sur les 2 comptes à risque identifiés.`
      );
      setInferenceStats({
        ttft: model.latencyTtft,
        tokens: '412 tokens générés (84 in / 328 out)',
        cost: `$${((84 * model.costInPer1k + 328 * model.costOutPer1k) / 1000).toFixed(6)}`
      });
      showToast(`Inférence réussie avec ${model.name} (${model.latencyTtft})`);
    }, 700);
  };

  const handleRunVectorSearch = (collection: VectorCollection) => {
    setIsSearchingVectors(true);
    haptics.trigger('medium');
    setTimeout(() => {
      setIsSearchingVectors(false);
      setSearchResults(collection.sampleChunks.filter(c => c.score >= similaritySlider));
      haptics.trigger('success');
      showToast(`Recherche vectorielle exécutée (2 fragments trouvés)`);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={COGNITION_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Sub-bar Breadcrumbs */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Cognition" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('llm');
              setSelectedModel(null);
              setSelectedCollection(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cognition IA</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {COGNITION_TABS.find(t => t.id === activeTab)?.label || 'Modèles'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            MCP Orchestrator
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              showToast('Cache de contexte 84.2% vérifié et optimisé');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles size={12} />
            <span className="hidden xs:inline">Cache 84% Hit</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LLM MODELS & PROVIDERS */}
          {activeTab === 'llm' && (
            <motion.div
              key="llm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Moteurs d'Inférence & Modèles LLM"
                subtitle="Routage dynamique multi-modèles (Gemini 2.5, Claude 3.5, GPT-4o)"
                badge={LLM_MODELS.find(m => m.id === defaultModelId)?.name || 'Gemini 2.5 Flash'}
                icon={BrainCircuit}
                kpis={[
                  { label: 'Latence TTFT', value: '140ms', sub: 'Streaming Ultra-Rapide', trend: 'up' },
                  { label: 'Appels / Jour', value: '4,850', sub: '100% Succès' },
                  { label: 'Cache Hits', value: '84.2%', sub: 'Économie de tokens', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {LLM_MODELS.map((model) => {
                    const isDef = model.id === defaultModelId;
                    return (
                      <DetailCard
                        key={model.id}
                        title={model.name}
                        subtitle={`${model.provider} • TTFT: ${model.latencyTtft}`}
                        icon={BrainCircuit}
                        badge={isDef ? 'Moteur par Défaut' : 'Disponible'}
                        badgeColor={isDef ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-300 border-slate-800'}
                        isInteractive
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedModel(model);
                        }}
                        actions={
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-emerald-400">
                              {(model.contextWindow / 1000).toLocaleString()}k ctx
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                              <ArrowUpRight size={13} />
                            </div>
                          </div>
                        }
                      >
                        <div className="space-y-2 pt-1 text-xs">
                          <p className="text-slate-300">{model.description}</p>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px]">
                            <span className="text-slate-400">
                              Coût In/Out : <strong className="text-slate-200 font-mono">${(model.costInPer1k * 1000).toFixed(2)} / ${(model.costOutPer1k * 1000).toFixed(2)}</strong> /1M
                            </span>
                            <span className="text-emerald-400 font-medium">Tester prompt & paramètres →</span>
                          </div>
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>

                <AIInsightCard
                  title="Optimisation Inférence & Coûts"
                  content="En utilisant Gemini 2.5 Flash avec context_caching activé, le coût moyen par requête est divisé par 5.2x sans compromis sur la qualité du raisonnement."
                  actionLabel="Optimiser les règles de routage"
                  onAction={() => {
                    haptics.trigger('selection');
                    showToast('Règles de routage optimisées');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: VECTORS & RAG */}
          {activeTab === 'vectors' && (
            <motion.div
              key="vectors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Mémoire Vectorielle & Collections RAG"
                subtitle="Indexation sémantique HNSW et recherche par similarité cosinus"
                badge="8,420 Vecteurs Totaux"
                icon={Database}
                kpis={[
                  { label: 'Total Vecteurs', value: '8,420', sub: '3 Collections', trend: 'up' },
                  { label: 'Rappel Moyen', value: '98.4%', sub: 'Précision Top-5' },
                  { label: 'Latence Recherche', value: '14ms', sub: 'Index HNSW en RAM', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {VECTOR_COLLECTIONS.map((col) => (
                    <DetailCard
                      key={col.id}
                      title={col.name}
                      subtitle={`${col.engine} • ${col.dimensions}d`}
                      icon={Database}
                      badge={`${col.vectorCount.toLocaleString()} vecteurs`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCollection(col);
                      }}
                      actions={
                        <span className="font-mono text-emerald-400 text-xs font-semibold">
                          Seuil {col.similarityThreshold}
                        </span>
                      }
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <p className="text-slate-300">{col.description}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase">Stratégie Chunking</div>
                            <div className="font-mono text-slate-200 font-semibold">{col.chunkSize} / {col.chunkOverlap} overlap</div>
                          </div>
                          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase">Taux de Rappel</div>
                            <div className="font-mono text-emerald-400 font-semibold">{col.recallRate}</div>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <span className="text-[11px] text-emerald-400 font-medium">Tester la recherche sémantique →</span>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Supervision Mémoire RAG"
                  content="L'index HNSW de 'enterprise-kb-v3' maintient un score de similarité moyen de 0.94 sur les requêtes contractuelles, garantissant des réponses sans hallucination."
                  actionLabel="Reconstruire les index HNSW"
                  onAction={() => {
                    haptics.trigger('success');
                    showToast('Reconstruction HNSW terminée en 320ms');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: MCP QUERIES */}
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
                subtitle="Traces d'exécution des fonctions système natives orchestrées par l'IA"
                icon={Zap}
                badge="Temps Réel"
                kpis={[
                  { label: 'Appels MCP', value: '14,280', sub: 'Ce mois', trend: 'up' },
                  { label: 'Taux Succès', value: '100.0%', sub: 'Zéro exception 500' },
                  { label: 'Latence Moyenne', value: '74ms', sub: 'Protocole mTLS', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {MCP_LOGS.map((log) => (
                    <DetailCard
                      key={log.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedLog(log);
                      }}
                      isInteractive
                      title={log.tool}
                      badge={log.latency}
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono"
                      icon={Zap}
                      subtitle={`${log.serverName} • ${log.timestamp}`}
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-slate-200 truncate">
                          &gt; {log.query}
                        </div>
                        <div className="flex justify-between items-center pt-1 text-xs">
                          <span className="text-slate-400 font-mono">{log.tokens}</span>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>{log.status}</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SWARM AGENTS */}
          {activeTab === 'swarm' && (
            <motion.div
              key="swarm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Essaim d'Agents Autonomes (Swarm)"
                subtitle="Orchestration collaborative d'agents spécialisés sur le graphe"
                icon={Bot}
                badge="3 Agents Actifs"
                kpis={[
                  { label: 'Agents En Ligne', value: '3 / 3', sub: 'Capacité nominale' },
                  { label: 'Tâches Traitées', value: '382', sub: 'Aujourd\'hui', trend: 'up' },
                  { label: 'Charge Moyenne', value: '45%', sub: 'Équilibrage actif' }
                ]}
              >
                <div className="space-y-3">
                  {SWARM_AGENTS.map((ag) => (
                    <DetailCard
                      key={ag.id}
                      title={ag.name}
                      badge={ag.status === 'active' ? 'En action' : 'En veille'}
                      badgeColor={ag.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
                      icon={Bot}
                      subtitle={ag.role}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedAgent(ag);
                      }}
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Tâche courante :</span>
                          <span className="font-medium text-slate-200 truncate max-w-[200px]">{ag.currentTask}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-xs">
                          <span className="text-slate-400">Charge CPU / Mémoire</span>
                          <span className="font-mono text-emerald-400 font-semibold">{ag.load} • {ag.memoryUsage}</span>
                        </div>
                        <div className="flex justify-end pt-1">
                          <span className="text-[11px] text-emerald-400 font-medium">Inspecter agent & outillage →</span>
                        </div>
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
      {/* DRAWER 1: LLM MODEL DETAIL & PROMPT TEST RUNNER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        title={selectedModel?.name || ''}
        subtitle={`${selectedModel?.provider} • Latence ${selectedModel?.latencyTtft}`}
        badge={selectedModel?.id === defaultModelId ? 'Par Défaut' : 'Disponible'}
        badgeColor={selectedModel?.id === defaultModelId ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-300 border-slate-700'}
        icon={BrainCircuit}
        breadcrumbs={[
          { label: 'Cognition IA', onClick: () => setSelectedModel(null) },
          { label: 'Modèles LLM', onClick: () => setSelectedModel(null) },
          { label: selectedModel?.name || 'Modèle' }
        ]}
        actions={[
          {
            id: 'set_default',
            label: selectedModel?.id === defaultModelId ? 'Modèle Actif' : 'Définir par Défaut',
            icon: CheckCircle2,
            variant: 'primary',
            onClick: () => {
              if (selectedModel) {
                setDefaultModelId(selectedModel.id);
                haptics.trigger('success');
                showToast(`${selectedModel.name} configuré comme modèle par défaut`);
              }
            }
          },
          {
            id: 'test_prompt',
            label: 'Tester Inférence',
            icon: Play,
            onClick: () => {
              if (selectedModel) handleRunInference(selectedModel);
            }
          },
          {
            id: 'clear_cache',
            label: 'Purger Cache',
            icon: RotateCcw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Cache de contexte purgé pour ${selectedModel?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Fenêtre Contexte', value: `${((selectedModel?.contextWindow || 0) / 1000).toLocaleString()}k Tokens`, sub: 'Contexte Maximal' },
          { label: 'Latence TTFT', value: selectedModel?.latencyTtft || '0ms', sub: 'Premier token', trend: 'up' },
          { label: 'Coût / 1k Tokens In', value: `$${(selectedModel?.costInPer1k || 0).toFixed(6)}`, sub: 'Tarif Entrée' },
          { label: 'Coût / 1k Tokens Out', value: `$${(selectedModel?.costOutPer1k || 0).toFixed(6)}`, sub: 'Tarif Sortie' }
        ]}
        aiInsight={{
          title: 'Analyse Efficacité Token',
          content: `Le modèle ${selectedModel?.name} supporte l'accélération context_caching. Les prompts de plus de 32k tokens bénéficient d'une réduction de coût de 75%.`,
          actionLabel: 'Calculer la rentabilité mensuelle',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Calcul de ROI IA généré : Économie de $420/mois');
          }
        }}
        tabs={[
          {
            id: 'tester',
            label: 'Testeur de Prompt & Inférence',
            content: (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Prompt Système :</label>
                  <textarea
                    rows={2}
                    value={testSystemPrompt}
                    onChange={(e) => setTestSystemPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Prompt Utilisateur :</label>
                  <textarea
                    rows={3}
                    value={testUserPrompt}
                    onChange={(e) => setTestUserPrompt(e.target.value)}
                    placeholder="Entrez votre invite de test..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>Température : <strong className="text-slate-200 font-mono">{testTemperature}</strong></span>
                    <span className="text-[10px]">Créativité 0.0 (déterministe) → 1.0 (créatif)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={testTemperature}
                    onChange={(e) => setTestTemperature(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => selectedModel && handleRunInference(selectedModel)}
                  disabled={isRunningInference}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {isRunningInference ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>{isRunningInference ? 'Génération de tokens en cours...' : `Exécuter le Test avec ${selectedModel?.name}`}</span>
                </button>

                {inferenceResult && (
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Réponse Inférence :</span>
                      <span className="text-[10px] text-slate-400 font-mono">{inferenceStats?.ttft}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
                      {inferenceResult}
                    </p>
                    {inferenceStats && (
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                        <span>{inferenceStats.tokens}</span>
                        <span className="text-emerald-400 font-semibold">{inferenceStats.cost}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          },
          {
            id: 'benchmarks',
            label: 'Benchmarks & Capacités',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Scores Benchmarks Standards :</div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500">MMLU-Pro</div>
                      <div className="font-mono text-emerald-400 font-bold text-sm">{selectedModel?.benchmarks.mmluPro}</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500">HumanEval</div>
                      <div className="font-mono text-sky-400 font-bold text-sm">{selectedModel?.benchmarks.humanEval}</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500">MATH-500</div>
                      <div className="font-mono text-purple-400 font-bold text-sm">{selectedModel?.benchmarks.math500}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Modalités Prises en Charge :</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedModel?.supportedModalities.map((mod, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 text-[11px] font-medium border border-slate-700">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 2: VECTOR COLLECTION DETAIL & SEMANTIC SEARCH SANDBOX */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
        title={selectedCollection?.name || ''}
        subtitle={`${selectedCollection?.engine} • ${selectedCollection?.dimensions} dimensions`}
        badge={`Seuil ${selectedCollection?.similarityThreshold}`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
        icon={Database}
        breadcrumbs={[
          { label: 'Cognition IA', onClick: () => setSelectedCollection(null) },
          { label: 'Embeddings & RAG', onClick: () => setSelectedCollection(null) },
          { label: selectedCollection?.name || 'Collection' }
        ]}
        actions={[
          {
            id: 'search_sim',
            label: 'Tester Recherche',
            icon: Search,
            variant: 'primary',
            onClick: () => {
              if (selectedCollection) handleRunVectorSearch(selectedCollection);
            }
          },
          {
            id: 'reindex',
            label: 'Réindexer HNSW',
            icon: RefreshCw,
            onClick: () => {
              haptics.trigger('success');
              showToast(`Index HNSW pour ${selectedCollection?.name} reconstruit avec succès`);
            }
          },
          {
            id: 'export_embeddings',
            label: 'Exporter Chunks',
            icon: Copy,
            onClick: () => {
              haptics.trigger('selection');
              showToast(`Métadonnées exportées (${selectedCollection?.vectorCount} vecteurs)`);
            }
          }
        ]}
        kpis={[
          { label: 'Dimensions Plongement', value: `${selectedCollection?.dimensions || 0}d`, sub: 'text-embedding-004' },
          { label: 'Seuil Similarité', value: `${selectedCollection?.similarityThreshold || 0}`, sub: 'Distance Cosinus', trend: 'up' },
          { label: 'Vecteurs Indexés', value: `${(selectedCollection?.vectorCount || 0).toLocaleString()}`, sub: 'Index HNSW' },
          { label: 'Taux de Rappel', value: selectedCollection?.recallRate || '98%', sub: 'Précision Top-5', trend: 'up' }
        ]}
        aiInsight={{
          title: 'Politique de Chunking & Embeddings',
          content: `La stratégie '${selectedCollection?.splittingStrategy}' permet d'éviter la troncature des clauses juridiques et des contraintes SQL.`,
          actionLabel: 'Ajuster la taille des chunks',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Paramètres de chunking mis à jour');
          }
        }}
        tabs={[
          {
            id: 'search_sandbox',
            label: 'Testeur de Recherche Sémantique',
            content: (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Requête Sémantique :</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: Clauses SLA et astreinte..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>Seuil de Similarité Cosinus : <strong className="text-emerald-400 font-mono">{similaritySlider}</strong></span>
                    <span className="text-[10px]">Min {similaritySlider * 100}% de correspondance</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="0.99"
                    step="0.01"
                    value={similaritySlider}
                    onChange={(e) => setSimilaritySlider(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => selectedCollection && handleRunVectorSearch(selectedCollection)}
                  disabled={isSearchingVectors}
                  className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  {isSearchingVectors ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                  <span>{isSearchingVectors ? 'Recherche en cours...' : 'Exécuter Recherche Sémantique'}</span>
                </button>

                <div className="space-y-2 pt-1">
                  <div className="text-xs font-semibold text-slate-400">Fragments Retrouvés (Top Chunks) :</div>
                  {(searchResults || selectedCollection?.sampleChunks || []).map((chk) => (
                    <div key={chk.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400 text-[11px]">{chk.id}</span>
                        <span className="font-mono text-emerald-400 font-bold text-xs">Score : {chk.score}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{chk.content}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                        {Object.entries(chk.metadata).map(([k, v]) => (
                          <span key={k} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'strategy',
            label: 'Stratégie & Chunking',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taille des Chunks :</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedCollection?.chunkSize} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chevauchement (Overlap) :</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedCollection?.chunkOverlap} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Métrique de Distance :</span>
                    <span className="font-mono text-slate-200">{selectedCollection?.similarityMetric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Index Graphique :</span>
                    <span className="font-mono text-sky-400">{selectedCollection?.indexingStrategy}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 3: MCP LOG DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog?.tool || ''}
        subtitle={`${selectedLog?.serverName} • ${selectedLog?.timestamp}`}
        badge={selectedLog?.status || '200 OK'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
        icon={Zap}
        breadcrumbs={[
          { label: 'Cognition IA', onClick: () => setSelectedLog(null) },
          { label: 'Appels MCP', onClick: () => setSelectedLog(null) },
          { label: selectedLog?.tool || 'Log' }
        ]}
        actions={[
          {
            id: 'replay_query',
            label: 'Rejouer Requête',
            icon: Play,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Requête ${selectedLog?.tool} réexécutée avec succès`);
            }
          },
          {
            id: 'copy_payload',
            label: 'Copier JSON',
            icon: Copy,
            onClick: () => {
              if (selectedLog) {
                haptics.trigger('selection');
                navigator.clipboard?.writeText(JSON.stringify(selectedLog.outputPreview, null, 2));
                showToast('Réponse JSON copiée dans le presse-papier');
              }
            }
          }
        ]}
        kpis={[
          { label: 'Latence Exécution', value: selectedLog?.latency || '0ms', sub: 'mTLS Protocol', trend: 'up' },
          { label: 'Consommation Tokens', value: selectedLog?.tokens.split('/')[0] || '140 in', sub: 'Inférence MCP' },
          { label: 'Statut HTTP', value: selectedLog?.status || '200 OK', sub: 'Zéro échec' },
          { label: 'Serveur Dédié', value: 'MCP Native', sub: selectedLog?.serverName.split(':')[0] || 'mcp' }
        ]}
        aiInsight={{
          title: 'Diagnostic d\'Appel MCP',
          content: `L'outil ${selectedLog?.tool} a été invoqué avec des arguments conformes au schéma JSON-RPC. Le temps de réponse de ${selectedLog?.latency} est sous le seuil critique de 200ms.`,
          actionLabel: 'Inspecter les définitions d\'outils MCP',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Schéma d\'outillage vérifié');
          }
        }}
        tabs={[
          {
            id: 'payload',
            label: 'Payload & Sortie JSON',
            content: (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Requête d'Entrée :</div>
                  <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200">
                    {selectedLog?.query}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Sortie JSON Structurée :</div>
                  <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog?.outputPreview, null, 2)}
                  </pre>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 4: SWARM AGENT DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name || ''}
        subtitle={selectedAgent?.role}
        badge={selectedAgent?.status === 'active' ? 'En Action' : 'En Veille'}
        badgeColor={selectedAgent?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}
        icon={Bot}
        breadcrumbs={[
          { label: 'Cognition IA', onClick: () => setSelectedAgent(null) },
          { label: 'Essaim Swarm', onClick: () => setSelectedAgent(null) },
          { label: selectedAgent?.name || 'Agent' }
        ]}
        actions={[
          {
            id: 'assign_task',
            label: 'Attribuer Tâche',
            icon: Play,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Nouvelle mission assignée à ${selectedAgent?.name}`);
            }
          },
          {
            id: 'reset_memory',
            label: 'Purger Mémoire',
            icon: RotateCcw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Mémoire de travail réinitialisée pour ${selectedAgent?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Charge Actuelle', value: selectedAgent?.load || '0%', sub: 'Capacité allouée' },
          { label: 'Mémoire Utilisée', value: selectedAgent?.memoryUsage.split('/')[0] || '38 MB', sub: `Max ${selectedAgent?.memoryUsage.split('/')[1] || '512 MB'}` },
          { label: 'Tokens Aujourd\'hui', value: selectedAgent?.tokensToday || '0', sub: 'Consommation journalière', trend: 'up' },
          { label: 'Outils Autorisés', value: `${selectedAgent?.assignedTools.length || 0} Fonctions`, sub: 'Permissions MCP' }
        ]}
        tabs={[
          {
            id: 'tools',
            label: 'Outils & Tâche Courante',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-slate-200">Mission en Cours :</div>
                  <p className="text-slate-300 leading-relaxed">{selectedAgent?.currentTask}</p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Outils MCP Attribués :</div>
                  <div className="space-y-1.5">
                    {selectedAgent?.assignedTools.map((t, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-950 font-mono text-emerald-400 text-xs flex items-center justify-between border border-slate-800/80">
                        <span>{t}()</span>
                        <span className="text-[10px] text-slate-500">Autorisé</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* Floating Animated Toast */}
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
