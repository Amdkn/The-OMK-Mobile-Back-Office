import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  GitFork, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Share2, 
  ChevronRight, 
  X, 
  Bot, 
  Sparkles, 
  RefreshCw,
  FolderTree,
  Database,
  Code2,
  FileCode,
  ArrowUpRight,
  Copy,
  Check,
  Play,
  Terminal,
  Search,
  Sliders,
  Cpu,
  ShieldCheck,
  Zap,
  Boxes,
  Compass
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

// TYPES & INTERFACES
export interface SchemaField {
  name: string;
  type: 'UUID' | 'string' | 'number' | 'boolean' | 'jsonb' | 'timestamp' | 'relation';
  required: boolean;
  isPrimary?: boolean;
  isIndex?: boolean;
  validationRule: string;
  defaultValue?: string;
  description: string;
}

export interface EntityModel {
  id: string;
  name: string;
  domain: string;
  table: string;
  status: 'active' | 'draft' | 'deprecated';
  version: string;
  fieldCount: number;
  relationCount: number;
  description: string;
  fields: SchemaField[];
  jsonLd: Record<string, any>;
  sqlMigration: string;
  cypherSchema: string;
}

export interface GraphEdge {
  id: string;
  predicate: string;
  targetNode: string;
  targetDomain: string;
  weight: number;
  latencyMs: number;
  type: 'inbound' | 'outbound' | 'bidirectional';
}

export interface GraphNodeItem {
  id: string;
  name: string;
  label: string;
  category: 'Entity' | 'Cluster' | 'Engine' | 'Security' | 'Infra';
  status: 'synced' | 'indexing' | 'warning';
  edgeCount: number;
  semanticWeight: number;
  betweennessCentrality: number;
  maxHops: number;
  description: string;
  edges: GraphEdge[];
  cypherQuery: string;
  sparqlQuery: string;
  rdfTriples: string[];
}

export interface SemanticConflict {
  id: string;
  title: string;
  entities: string[];
  desc: string;
  severity: 'high' | 'medium' | 'low';
  resolution: string;
  patchCode: string;
  impactScore: string;
}

export interface TaxonomyClass {
  id: string;
  name: string;
  subClasses: number;
  properties: number;
  status: 'synced' | 'validating';
  description: string;
  inheritanceTree: string[];
  assignedModules: string[];
}

export interface SyncConnector {
  id: string;
  name: string;
  engine: string;
  status: 'synced' | 'standby' | 'error';
  latency: string;
  mutationRate: string;
  cdcMode: string;
  lastHeartbeat: string;
  endpoint: string;
}

// SAMPLE DATA
const ENTITY_MODELS: EntityModel[] = [
  {
    id: 'ent-client',
    name: 'Client',
    domain: 'CRM & Accounts',
    table: 'public.clients',
    status: 'active',
    version: 'v2.4',
    fieldCount: 14,
    relationCount: 4,
    description: 'Entité pivot représentant un compte entreprise abonné avec métriques MRR et contacts.',
    fields: [
      { name: 'id', type: 'UUID', required: true, isPrimary: true, validationRule: 'uuid.v4()', description: 'Identifiant unique immuable' },
      { name: 'name', type: 'string', required: true, validationRule: 'min(2).max(120)', description: 'Raison sociale entreprise' },
      { name: 'mrr', type: 'number', required: true, validationRule: 'gte(0).lte(1000000)', defaultValue: '0.00', description: 'Revenu récurrent mensuel en USD' },
      { name: 'health_score', type: 'number', required: true, validationRule: 'int().min(0).max(100)', defaultValue: '100', description: 'Indicateur de rétention prédictif' },
      { name: 'tier', type: 'string', required: true, validationRule: 'enum("Enterprise", "Scale", "Growth")', defaultValue: '"Enterprise"', description: 'Niveau de contrat et SLA associé' },
      { name: 'contacts', type: 'jsonb', required: false, validationRule: 'array(ContactSchema)', description: 'Registre des interlocuteurs autorisés' },
      { name: 'created_at', type: 'timestamp', required: true, isIndex: true, validationRule: 'datetime()', defaultValue: 'now()', description: 'Horodatage création UTC' }
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'urn:omk:ontology:entity:client',
      'name': 'ClientEnterprise',
      'legalName': 'xsd:string',
      'identifier': 'xsd:string',
      'accountablePerson': 'https://schema.org/Person',
      'offers': {
        '@type': 'Offer',
        'priceSpecification': { '@type': 'UnitPriceSpecification', 'priceCurrency': 'USD' }
      }
    },
    sqlMigration: `-- Migration: v2.4_add_client_entity.sql
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  mrr NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (mrr >= 0),
  health_score SMALLINT NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  tier VARCHAR(32) NOT NULL DEFAULT 'Enterprise',
  contacts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clients_mrr ON public.clients (mrr DESC);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients (created_at);`,
    cypherSchema: `// Cypher Schema Definition
CREATE CONSTRAINT client_id_unique IF NOT EXISTS
FOR (c:Client) REQUIRE c.id IS UNIQUE;

MATCH (c:Client)
SET c.domain = 'CRM & Accounts',
    c.sync_status = 'active',
    c.indexed_at = timestamp();`
  },
  {
    id: 'ent-billing',
    name: 'BillingAccount',
    domain: 'Finance & Ledger',
    table: 'billing.accounts',
    status: 'active',
    version: 'v1.9',
    fieldCount: 12,
    relationCount: 3,
    description: 'Structure financière gérant les plafonds de facturation, TVA et comptes de règlement.',
    fields: [
      { name: 'id', type: 'UUID', required: true, isPrimary: true, validationRule: 'uuid.v4()', description: 'Identifiant compte de facturation' },
      { name: 'client_id', type: 'UUID', required: true, isIndex: true, validationRule: 'foreignKey(clients.id)', description: 'Clé étrangère vers le compte client' },
      { name: 'currency', type: 'string', required: true, validationRule: 'enum("USD", "EUR", "GBP")', defaultValue: '"USD"', description: 'Devise de référence comptable' },
      { name: 'tax_rate', type: 'number', required: true, validationRule: 'gte(0.0).lte(30.0)', defaultValue: '20.0', description: 'Taux de taxe applicable par défaut' },
      { name: 'balance', type: 'number', required: true, validationRule: 'number()', defaultValue: '0.00', description: 'Solde courant en devises' }
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FinancialAccount',
      '@id': 'urn:omk:ontology:entity:billing_account',
      'currency': 'USD',
      'provider': 'https://schema.org/FinancialService'
    },
    sqlMigration: `-- Migration: v1.9_create_billing_accounts.sql
CREATE TABLE IF NOT EXISTS billing.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_client_id ON billing.accounts (client_id);`,
    cypherSchema: `CREATE (b:BillingAccount { currency: 'USD', status: 'verified' })-[:BELONGS_TO]->(c:Client);`
  },
  {
    id: 'ent-contract',
    name: 'Contract',
    domain: 'Legal & SLA',
    table: 'legal.contracts',
    status: 'active',
    version: 'v3.1',
    fieldCount: 18,
    relationCount: 5,
    description: 'Accord contractuel formel définissant les engagements de service et conditions DPA.',
    fields: [
      { name: 'id', type: 'UUID', required: true, isPrimary: true, validationRule: 'uuid.v4()', description: 'ID contrat' },
      { name: 'client_id', type: 'UUID', required: true, isIndex: true, validationRule: 'foreignKey(clients.id)', description: 'Lien client' },
      { name: 'sla_guarantee', type: 'string', required: true, validationRule: 'regex(/^99\\.[0-9]{2}%$)', defaultValue: '"99.99%"', description: 'Engagement de disponibilité' },
      { name: 'arr_value', type: 'number', required: true, validationRule: 'gte(1000)', description: 'Valeur récurrente annuelle' },
      { name: 'valid_until', type: 'timestamp', required: true, validationRule: 'datetime().future()', description: 'Date expiration contrat' }
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'DigitalDocument',
      '@id': 'urn:omk:ontology:entity:contract',
      'hasDigitalDocumentPermission': 'AdminOnly'
    },
    sqlMigration: `-- Migration: v3.1_create_contracts.sql
CREATE TABLE IF NOT EXISTS legal.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  sla_guarantee VARCHAR(16) NOT NULL DEFAULT '99.99%',
  arr_value NUMERIC(14,2) NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL
);`,
    cypherSchema: `CREATE (c:Contract)-[:BOUND_BY_SLA { rate: '99.99%' }]->(s:SLAEntity);`
  },
  {
    id: 'ent-agentmemory',
    name: 'AgentMemory',
    domain: 'Cognition & AI',
    table: 'ai.agent_memories',
    status: 'active',
    version: 'v4.0',
    fieldCount: 8,
    relationCount: 2,
    description: 'Vecteur d\'état et mémoire contextuelle persistée pour l\'essaim d\'agents autonomes.',
    fields: [
      { name: 'id', type: 'UUID', required: true, isPrimary: true, validationRule: 'uuid.v4()', description: 'ID de mémoire' },
      { name: 'agent_id', type: 'string', required: true, isIndex: true, validationRule: 'string()', description: 'Identifiant agent swarm' },
      { name: 'context_hash', type: 'string', required: true, validationRule: 'hex().length(64)', description: 'Hachage SHA-256 du prompt' },
      { name: 'embedding_vector', type: 'jsonb', required: true, validationRule: 'vector(1536)', description: 'Plongement sémantique 1536d' },
      { name: 'ttl_seconds', type: 'number', required: true, validationRule: 'int().gte(60)', defaultValue: '86400', description: 'Durée de vie en cache' }
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'DataFeed',
      '@id': 'urn:omk:ontology:entity:agent_memory',
      'dataFeedElement': 'VectorEmbedding'
    },
    sqlMigration: `-- Migration: v4.0_pgvector_memories.sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS ai.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(64) NOT NULL,
  context_hash CHAR(64) NOT NULL,
  embedding vector(1536) NOT NULL,
  ttl_seconds INT NOT NULL DEFAULT 86400
);
CREATE INDEX IF NOT EXISTS idx_agent_memories_hnsw ON ai.agent_memories USING hnsw (embedding vector_cosine_ops);`,
    cypherSchema: `CREATE (m:AgentMemory { dim: 1536 })-[:ATTACHED_TO]->(a:AgentNode);`
  }
];

const GRAPH_NODES: GraphNodeItem[] = [
  {
    id: 'node-clientcore',
    name: 'Node: ClientCore',
    label: 'ClientCore',
    category: 'Entity',
    status: 'synced',
    edgeCount: 48,
    semanticWeight: 0.96,
    betweennessCentrality: 0.84,
    maxHops: 4,
    description: 'Nœud primaire du graphe sémantique reliant les comptes entreprises aux contrats, SLA et finances.',
    edges: [
      { id: 'e1', predicate: 'OWNS_ACCOUNT', targetNode: 'Node: FinancialLedger', targetDomain: 'Finance & Ledger', weight: 0.98, latencyMs: 1.2, type: 'outbound' },
      { id: 'e2', predicate: 'BOUND_BY_SLA', targetNode: 'Node: LegalCompliance', targetDomain: 'Legal & SLA', weight: 0.95, latencyMs: 1.8, type: 'outbound' },
      { id: 'e3', predicate: 'MONITORED_BY', targetNode: 'Node: AgentCognition', targetDomain: 'Cognition & AI', weight: 0.92, latencyMs: 2.1, type: 'inbound' },
      { id: 'e4', predicate: 'HOSTED_ON', targetNode: 'Node: InfraKubernetes', targetDomain: 'Infra Cluster', weight: 0.89, latencyMs: 3.4, type: 'outbound' }
    ],
    cypherQuery: `MATCH (c:ClientCore { label: 'ClientCore' })-[r:OWNS_ACCOUNT|BOUND_BY_SLA]->(target)
RETURN c, r, target
ORDER BY r.weight DESC
LIMIT 25;`,
    sparqlQuery: `PREFIX omk: <http://omk.io/ontology#>
SELECT ?client ?relation ?target
WHERE {
  ?client rdf:type omk:ClientCore ;
          ?relation ?target .
} LIMIT 50`,
    rdfTriples: [
      '<urn:omk:node:clientcore> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://omk.io/ontology#ClientCore> .',
      '<urn:omk:node:clientcore> <http://omk.io/ontology#ownsAccount> <urn:omk:node:financialledger> .',
      '<urn:omk:node:clientcore> <http://omk.io/ontology#semanticWeight> "0.96"^^<http://www.w3.org/2001/XMLSchema#float> .'
    ]
  },
  {
    id: 'node-financialledger',
    name: 'Node: FinancialLedger',
    label: 'FinancialLedger',
    category: 'Cluster',
    status: 'synced',
    edgeCount: 34,
    semanticWeight: 0.92,
    betweennessCentrality: 0.76,
    maxHops: 3,
    description: 'Cluster transactionnel agrégé des flux multi-devises, balances et rapprochements bancaires.',
    edges: [
      { id: 'e5', predicate: 'AUDITED_BY', targetNode: 'Node: SecurityHSM', targetDomain: 'Security & Enclave', weight: 0.97, latencyMs: 0.8, type: 'inbound' },
      { id: 'e6', predicate: 'FEDERATES_WITH', targetNode: 'Node: ClientCore', targetDomain: 'CRM & Accounts', weight: 0.98, latencyMs: 1.2, type: 'bidirectional' }
    ],
    cypherQuery: `MATCH (f:FinancialLedger)-[r:AUDITED_BY]->(h:SecurityHSM) RETURN f, r, h;`,
    sparqlQuery: `SELECT ?tx ?amount WHERE { ?tx omk:ledgerAmount ?amount }`,
    rdfTriples: [
      '<urn:omk:node:financialledger> <http://omk.io/ontology#auditedBy> <urn:omk:node:securityhsm> .'
    ]
  },
  {
    id: 'node-agentcognition',
    name: 'Node: AgentCognition',
    label: 'AgentCognition',
    category: 'Engine',
    status: 'synced',
    edgeCount: 62,
    semanticWeight: 0.98,
    betweennessCentrality: 0.91,
    maxHops: 5,
    description: 'Moteur central d\'inférence sémantique orchestrant la mémoire vectorielle et les requêtes MCP.',
    edges: [
      { id: 'e7', predicate: 'REASONS_OVER', targetNode: 'Node: ClientCore', targetDomain: 'CRM & Accounts', weight: 0.94, latencyMs: 2.4, type: 'outbound' },
      { id: 'e8', predicate: 'EMBEDS_INTO', targetNode: 'Node: InfraKubernetes', targetDomain: 'Infra Cluster', weight: 0.96, latencyMs: 1.5, type: 'outbound' }
    ],
    cypherQuery: `MATCH (a:AgentCognition)-[r:REASONS_OVER]->(all) RETURN a, r, all;`,
    sparqlQuery: `SELECT ?agent ?memory WHERE { ?agent omk:hasMemory ?memory }`,
    rdfTriples: [
      '<urn:omk:node:agentcognition> <http://omk.io/ontology#reasonsOver> <urn:omk:node:clientcore> .'
    ]
  },
  {
    id: 'node-securityhsm',
    name: 'Node: SecurityHSM',
    label: 'SecurityHSM',
    category: 'Security',
    status: 'synced',
    edgeCount: 28,
    semanticWeight: 0.95,
    betweennessCentrality: 0.68,
    maxHops: 2,
    description: 'Enclave cryptographique matérielle validant les signatures de transactions et certificats mTLS.',
    edges: [
      { id: 'e9', predicate: 'SIGNS_FOR', targetNode: 'Node: FinancialLedger', targetDomain: 'Finance & Ledger', weight: 0.99, latencyMs: 0.6, type: 'outbound' }
    ],
    cypherQuery: `MATCH (s:SecurityHSM)-[r:SIGNS_FOR]->(f) RETURN s, r, f;`,
    sparqlQuery: `SELECT ?key ?status WHERE { ?key omk:hsmStatus ?status }`,
    rdfTriples: [
      '<urn:omk:node:securityhsm> <http://omk.io/ontology#signsFor> <urn:omk:node:financialledger> .'
    ]
  }
];

const INITIAL_CONFLICTS: SemanticConflict[] = [
  {
    id: '1',
    title: 'Propriété redondante "tax_rate"',
    entities: ['Invoice', 'BillingAccount'],
    desc: 'L\'entité Invoice hérite déjà de "tax_rate" via BillingAccount. Déduplication recommandée pour alléger GraphQL.',
    severity: 'medium',
    resolution: 'Supprimer Invoice.tax_rate et mapper dynamiquement sur BillingAccount.tax_rate.',
    patchCode: `// Automated Ontology Patch
ALTER SCHEMA OntologyModel 
REMOVE Invoice.tax_rate;
ADD COMPUTED PROPERTY Invoice.tax_rate => BillingAccount.tax_rate;`,
    impactScore: '-14% latence requêtes imbriquées'
  },
  {
    id: '2',
    title: 'Cycle d\'héritage circulaire détecté',
    entities: ['UserRole', 'PermissionGroup', 'UserRole'],
    desc: 'Référence cyclique empêchant la résolution des droits d\'accès en temps constant O(1).',
    severity: 'high',
    resolution: 'Scinder PermissionGroup en sous-graphes immuables avec clé de hachage unique.',
    patchCode: `// Resolution Cypher Migration
MATCH (u:UserRole)-[r:CIRCULAR_REF]->(p:PermissionGroup)
DELETE r
CREATE (u)-[:HAS_PERM_HASH { algo: 'sha256' }]->(p);`,
    impactScore: 'Résolution des droits garantie en O(1)'
  }
];

const TAXONOMY_CLASSES: TaxonomyClass[] = [
  {
    id: 't1',
    name: 'CoreEntity',
    subClasses: 14,
    properties: 84,
    status: 'synced',
    description: 'Classe racine parente de toutes les structures métier identifiables par UUID.',
    inheritanceTree: ['Owl:Thing', 'Omk:BaseResource', 'Omk:CoreEntity', 'Omk:AuditedEntity'],
    assignedModules: ['Clients', 'Finance', 'Contracts', 'Operations']
  },
  {
    id: 't2',
    name: 'FinancialTransaction',
    subClasses: 6,
    properties: 38,
    status: 'synced',
    description: 'Type de données immuable pour le registre des entrées/sorties monétaires.',
    inheritanceTree: ['Owl:Thing', 'Omk:CoreEntity', 'Omk:FinancialTransaction'],
    assignedModules: ['Wallet', 'Ledger', 'StripeBridge']
  },
  {
    id: 't3',
    name: 'AgentStateMemory',
    subClasses: 9,
    properties: 52,
    status: 'synced',
    description: 'Représentation vectorielle des états cognitifs et contextes d\'exécution.',
    inheritanceTree: ['Owl:Thing', 'Omk:CognitionModel', 'Omk:AgentStateMemory'],
    assignedModules: ['Cognition', 'Swarm', 'PineconeMCP']
  }
];

const SYNC_CONNECTORS: SyncConnector[] = [
  {
    id: 'sc-postgres',
    name: 'PostgreSQL Cloud SQL',
    engine: 'PostgreSQL 16 + pgvector',
    status: 'synced',
    latency: '18ms',
    mutationRate: '240 ops/s',
    cdcMode: 'WAL Logical Replication (Debezium)',
    lastHeartbeat: 'Il y a 2 sec',
    endpoint: 'postgres-cluster-prod.internal:5432/omk_core'
  },
  {
    id: 'sc-neo4j',
    name: 'Neo4j Knowledge Engine',
    engine: 'Neo4j Enterprise v5.18',
    status: 'synced',
    latency: '24ms',
    mutationRate: '120 ops/s',
    cdcMode: 'Native Cypher Fabric Cluster',
    lastHeartbeat: 'Il y a 5 sec',
    endpoint: 'bolt+s://neo4j-graph.internal:7687'
  },
  {
    id: 'sc-pinecone',
    name: 'Pinecone Vector Store',
    engine: 'Pinecone Serverless HNSW',
    status: 'synced',
    latency: '45ms',
    mutationRate: '65 ops/s',
    cdcMode: 'gRPC Vector Stream',
    lastHeartbeat: 'Il y a 1 sec',
    endpoint: 'https://omk-vectors-index.svc.pinecone.io'
  }
];

const ONTOLOGY_TABS = [
  { id: 'schemas', label: 'Schémas & Entités', icon: Network, badge: 4 },
  { id: 'graph', label: 'Graphe Sémantique', icon: GitFork, badge: 4 },
  { id: 'conflicts', label: 'Conflits', icon: AlertTriangle, badge: 2, badgeColor: 'bg-amber-500 text-slate-950' },
  { id: 'taxonomy', label: 'Taxonomie', icon: FolderTree, badge: 3 },
  { id: 'sync', label: 'Sync MCP', icon: Database }
];

export default function Ontology() {
  const [activeTab, setActiveTab] = useState('schemas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Drawer States
  const [selectedEntity, setSelectedEntity] = useState<EntityModel | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNodeItem | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<SemanticConflict | null>(null);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<TaxonomyClass | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<SyncConnector | null>(null);

  // Interactive states
  const [conflictsList, setConflictsList] = useState<SemanticConflict[]>(INITIAL_CONFLICTS);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = (code: string, label: string) => {
    haptics.trigger('selection');
    navigator.clipboard?.writeText(code);
    setCopiedKey(label);
    showToast(`${label} copié dans le presse-papier`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyConflictFix = (conflictId: string) => {
    setIsApplyingFix(true);
    haptics.trigger('medium');
    setTimeout(() => {
      setIsApplyingFix(false);
      setConflictsList(prev => prev.filter(c => c.id !== conflictId));
      setSelectedConflict(null);
      haptics.trigger('success');
      showToast('Correctif de schéma appliqué et propagé au cluster');
    }, 800);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={ONTOLOGY_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Breadcrumb Contextual Sub-bar */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Ontologie" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('schemas');
              setSelectedEntity(null);
              setSelectedNode(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ontologie OS</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {ONTOLOGY_TABS.find(t => t.id === activeTab)?.label || 'Schémas'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            W3C RDF / OWL
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              showToast('Schéma ontologique validé sans erreur');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <ShieldCheck size={12} />
            <span className="hidden xs:inline">Valider DTD</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SCHEMAS & ENTITY MODELS */}
          {activeTab === 'schemas' && (
            <motion.div
              key="schemas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Schémas & Modèles d'Entités Métier"
                subtitle="Définitions formelles typées, validation Zod, JSON-LD et DDL SQL"
                badge={`${ENTITY_MODELS.length} Modèles`}
                icon={Network}
                kpis={[
                  { label: 'Modèles Actifs', value: '4 Entités', sub: 'Domaines unifiés', trend: 'up' },
                  { label: 'Règles Zod', value: '42 Règles', sub: 'Validation stricte' },
                  { label: 'Conformité W3C', value: '100%', sub: 'JSON-LD Validé', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {ENTITY_MODELS.map((model) => (
                    <DetailCard
                      key={model.id}
                      title={model.name}
                      subtitle={`${model.domain} • Table: ${model.table}`}
                      icon={Network}
                      badge={model.version}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedEntity(model);
                      }}
                      actions={
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">
                            {model.fieldCount} champs
                          </span>
                          <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                            <ArrowUpRight size={13} />
                          </div>
                        </div>
                      }
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <p className="text-slate-300 leading-relaxed">{model.description}</p>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px]">
                          <span className="text-slate-400">
                            Relations : <strong className="text-slate-200">{model.relationCount} clés étrangères</strong>
                          </span>
                          <span className="text-emerald-400 font-medium">Inspecter champs & migrations →</span>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Recommandation Sémantique IA"
                  content="L'entité Client comporte 14 champs avec un taux de requêtage élevé sur 'mrr' et 'created_at'. L'ajout d'un index composite réduit le coût d'exécution de 68%."
                  actionLabel="Appliquer l'index composite"
                  onAction={() => {
                    haptics.trigger('success');
                    showToast('Index composite (mrr, created_at) déployé');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: KNOWLEDGE GRAPH & NODES */}
          {activeTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Graphe de Connaissances & Topologie"
                subtitle="Topologie des relations sémantiques, poids cosinus et requêtes Cypher"
                badge={`${GRAPH_NODES.length} Nœuds Clés`}
                icon={GitFork}
                kpis={[
                  { label: 'Densité Graphe', value: '0.84', sub: 'Connexité forte', trend: 'up' },
                  { label: 'Poids Moyen', value: '0.94', sub: 'Similarité Cosinus' },
                  { label: 'Latence Graphe', value: '< 2.5ms', sub: 'Mémoire RAM', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {GRAPH_NODES.map((node) => (
                    <DetailCard
                      key={node.id}
                      title={node.name}
                      subtitle={`Catégorie: ${node.category} • ${node.edgeCount} Arêtes actives`}
                      icon={GitFork}
                      badge={`Poids ${node.semanticWeight}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedNode(node);
                      }}
                      actions={
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <span>Examiner arêtes</span>
                          <ArrowUpRight size={13} />
                        </div>
                      }
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <p className="text-slate-300">{node.description}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                            <div className="text-[10px] text-slate-500 uppercase">Centralité Betweenness</div>
                            <div className="font-mono text-slate-200 font-bold">{node.betweennessCentrality}</div>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                            <div className="text-[10px] text-slate-500 uppercase">Profondeur Max</div>
                            <div className="font-mono text-emerald-400 font-bold">{node.maxHops} Sauts</div>
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Analyse Topologique IA"
                  content="Le nœud AgentCognition agit comme hub centralisateur. Nous conseillons de distribuer les arêtes de calcul lourd vers le sous-graphe SecurityHSM."
                  actionLabel="Exécuter re-partitionnement du graphe"
                  onAction={() => {
                    haptics.trigger('selection');
                    showToast('Partitionnement sémantique optimisé');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: CONFLICTS */}
          {activeTab === 'conflicts' && (
            <motion.div
              key="conflicts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Conflits Sémantiques & Dérives"
                subtitle="Anomalies de schéma et redondances détectées par l'analyseur formel"
                icon={AlertTriangle}
                badge={`${conflictsList.length} Conflit(s)`}
                badgeColor={conflictsList.length > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                kpis={[
                  { label: 'Anomalies Actives', value: `${conflictsList.length}`, sub: 'Priorité corrective' },
                  { label: 'Intégrité Globale', value: conflictsList.length === 0 ? '100%' : '98.2%', sub: 'Audit formel', trend: 'up' },
                  { label: 'Temps Détection', value: '12ms', sub: 'Moteur AST' }
                ]}
              >
                <div className="space-y-3">
                  {conflictsList.map((conf) => (
                    <DetailCard
                      key={conf.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedConflict(conf);
                      }}
                      isInteractive
                      title={conf.title}
                      badge={`Sévérité ${conf.severity.toUpperCase()}`}
                      badgeColor={conf.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={AlertTriangle}
                      subtitle={`Entités : ${conf.entities.join(' ↔ ')}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{conf.desc}</p>
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Impact : <strong className="text-emerald-400">{conf.impactScore}</strong></span>
                        <span className="text-amber-400 text-[11px] font-medium">Résoudre l'anomalie →</span>
                      </div>
                    </DetailCard>
                  ))}

                  {conflictsList.length === 0 && (
                    <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
                      <div className="text-sm font-semibold text-slate-100">Graphe Ontologique Aligné</div>
                      <div className="text-xs text-slate-400">Zéro conflit d'héritage ni redondance active.</div>
                    </div>
                  )}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: TAXONOMY */}
          {activeTab === 'taxonomy' && (
            <motion.div
              key="taxonomy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Taxonomie des Classes d'Entités"
                subtitle="Hiérarchie des types de données et arborescences d'héritage"
                icon={FolderTree}
                badge={`${TAXONOMY_CLASSES.length} Arborescences`}
                kpis={[
                  { label: 'Classes Mères', value: '3 Racines', sub: 'Owl:Thing' },
                  { label: 'Sous-Classes', value: '29 Types', sub: 'Spécialisations' },
                  { label: 'Attributs Typés', value: '174 Props', sub: 'Contraintes strictes' }
                ]}
              >
                <div className="space-y-3">
                  {TAXONOMY_CLASSES.map((cls) => (
                    <DetailCard
                      key={cls.id}
                      title={cls.name}
                      badge={`${cls.subClasses} sous-classes`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={FolderTree}
                      subtitle={cls.description}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedTaxonomy(cls);
                      }}
                    >
                      <div className="flex justify-between items-center text-xs pt-2">
                        <span className="text-slate-400">
                          Propriétés : <strong className="text-slate-200">{cls.properties} attributs</strong>
                        </span>
                        <span className="text-emerald-400 font-medium text-[11px]">
                          Inspecter hiérarchie & modules →
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 5: SYNC MCP */}
          {activeTab === 'sync' && (
            <motion.div
              key="sync"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Synchronisation MCP & Base de Données"
                subtitle="Passerelles bidirectionnelles SQL, Graphe et Vecteurs en temps réel"
                icon={Database}
                badge="3 Connecteurs En Ligne"
                kpis={[
                  { label: 'Latence Moyenne', value: '29ms', sub: 'Temps réel', trend: 'up' },
                  { label: 'Débit Mutations', value: '425 ops/s', sub: 'Streaming CDC' },
                  { label: 'Disponibilité', value: '99.99%', sub: 'Zéro désynchronisation' }
                ]}
              >
                <div className="space-y-3">
                  {SYNC_CONNECTORS.map((connector) => (
                    <DetailCard
                      key={connector.id}
                      title={connector.name}
                      subtitle={`${connector.engine} • Latence: ${connector.latency}`}
                      icon={Database}
                      badge={connector.status === 'synced' ? 'Synchronisé' : 'En attente'}
                      badgeColor={connector.status === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedConnector(connector);
                      }}
                      actions={
                        <span className="font-mono text-emerald-400 text-xs font-semibold">
                          {connector.mutationRate}
                        </span>
                      }
                    >
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Mode CDC :</span>
                          <span className="text-slate-200 font-mono">{connector.cdcMode}</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-500">Heartbeat: {connector.lastHeartbeat}</span>
                          <span className="text-emerald-400 font-medium">Inspecter télémétrie CDC →</span>
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
      {/* DRAWER 1: ENTITY MODEL DETAIL (SCHEMAS, FIELDS, VALIDATION, JSON-LD, DDL) */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title={selectedEntity?.name || ''}
        subtitle={`${selectedEntity?.domain} • Table SQL: ${selectedEntity?.table}`}
        badge={selectedEntity?.version || 'v1.0'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
        icon={Network}
        breadcrumbs={[
          { label: 'Ontologie OS', onClick: () => setSelectedEntity(null) },
          { label: 'Schémas & Modèles', onClick: () => setSelectedEntity(null) },
          { label: selectedEntity?.name || 'Entité' }
        ]}
        actions={[
          {
            id: 'export_jsonld',
            label: 'Exporter JSON-LD',
            icon: Copy,
            variant: 'primary',
            onClick: () => {
              if (selectedEntity) {
                handleCopyCode(JSON.stringify(selectedEntity.jsonLd, null, 2), 'Schéma JSON-LD');
              }
            }
          },
          {
            id: 'run_migration',
            label: 'Appliquer DDL SQL',
            icon: Database,
            onClick: () => {
              haptics.trigger('success');
              showToast(`Script DDL pour ${selectedEntity?.name} exécuté avec succès`);
            }
          },
          {
            id: 'validate_zod',
            label: 'Tester Validations Zod',
            icon: CheckCircle2,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`100% des règles de validation Zod validées sur ${selectedEntity?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Champs Typés', value: `${selectedEntity?.fieldCount || 0} Attributs`, sub: 'Schéma PostgreSQL' },
          { label: 'Contraintes Zod', value: 'Strict Validation', sub: 'Zéro typage implicite' },
          { label: 'Index Relationnels', value: `${selectedEntity?.relationCount || 0} Clés Ext.`, sub: 'Jointures O(1)' },
          { label: 'Conformité W3C', value: 'JSON-LD Valid', sub: 'schema.org 100%', trend: 'up' }
        ]}
        aiInsight={{
          title: 'Diagnostic Architectural IA',
          content: `L'entité ${selectedEntity?.name} présente une cohésion sémantique optimale. Le mapping ORM et le graphe vectoriel sont synchronisés sans dérive de schéma.`,
          actionLabel: 'Générer client TypeScript SDK',
          onAction: () => {
            haptics.trigger('selection');
            showToast(`Types TypeScript pour ${selectedEntity?.name} générés`);
          }
        }}
        tabs={[
          {
            id: 'fields',
            label: 'Champs & Validations',
            content: (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-1">
                  Définition des colonnes, règles de contraintes Zod et types PostgreSQL :
                </div>
                <div className="space-y-2">
                  {selectedEntity?.fields.map((field, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100 text-xs">{field.name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                            {field.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {field.isPrimary && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">PK</span>
                          )}
                          {field.isIndex && (
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">INDEX</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${field.required ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                            {field.required ? 'Requis' : 'Optionnel'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">{field.description}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>Règle : <strong className="text-slate-300">{field.validationRule}</strong></span>
                        {field.defaultValue && <span>Défaut : {field.defaultValue}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'jsonld',
            label: 'Export JSON-LD',
            content: (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Représentation sémantique W3C Schema.org :</span>
                  <button
                    onClick={() => selectedEntity && handleCopyCode(JSON.stringify(selectedEntity.jsonLd, null, 2), 'JSON-LD')}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    {copiedKey === 'JSON-LD' ? <Check size={12} /> : <Copy size={12} />}
                    <span>Copier JSON-LD</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                  {JSON.stringify(selectedEntity?.jsonLd, null, 2)}
                </pre>
              </div>
            )
          },
          {
            id: 'sql',
            label: 'Script Migration SQL',
            content: (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Script DDL PostgreSQL & contraintes d'index :</span>
                  <button
                    onClick={() => selectedEntity && handleCopyCode(selectedEntity.sqlMigration, 'DDL SQL')}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    {copiedKey === 'DDL SQL' ? <Check size={12} /> : <Copy size={12} />}
                    <span>Copier SQL</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                  {selectedEntity?.sqlMigration}
                </pre>
              </div>
            )
          },
          {
            id: 'cypher',
            label: 'Schéma Cypher',
            content: (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Définition du Nœud Cypher pour Graphe :</span>
                  <button
                    onClick={() => selectedEntity && handleCopyCode(selectedEntity.cypherSchema, 'Schéma Cypher')}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    {copiedKey === 'Schéma Cypher' ? <Check size={12} /> : <Copy size={12} />}
                    <span>Copier Cypher</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-sky-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                  {selectedEntity?.cypherSchema}
                </pre>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 2: KNOWLEDGE GRAPH NODE DETAIL (EDGES, WEIGHTS, QUERY INSPECTOR) */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={selectedNode?.name || ''}
        subtitle={`Catégorie: ${selectedNode?.category} • Poids sémantique: ${selectedNode?.semanticWeight}`}
        badge={selectedNode?.status === 'synced' ? 'Synchronisé' : 'Indexation'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
        icon={GitFork}
        breadcrumbs={[
          { label: 'Ontologie OS', onClick: () => setSelectedNode(null) },
          { label: 'Graphe Sémantique', onClick: () => setSelectedNode(null) },
          { label: selectedNode?.label || 'Nœud' }
        ]}
        actions={[
          {
            id: 'run_cypher',
            label: 'Exécuter Cypher',
            icon: Play,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Requête Cypher sur ${selectedNode?.label} exécutée en 1.8ms (25 nœuds trouvés)`);
            }
          },
          {
            id: 'reindex_vectors',
            label: 'Réindexer Vecteurs',
            icon: RefreshCw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Embeddings réindexés pour ${selectedNode?.label} (Cosine: 0.98)`);
            }
          },
          {
            id: 'calc_centrality',
            label: 'Calculer Centralité',
            icon: Compass,
            onClick: () => {
              haptics.trigger('selection');
              showToast(`Score PageRank & Betweenness calculé : ${selectedNode?.betweennessCentrality}`);
            }
          }
        ]}
        kpis={[
          { label: 'Arêtes Liées', value: `${selectedNode?.edgeCount || 0} Liens`, sub: 'Relations directes' },
          { label: 'Poids Sémantique', value: `${selectedNode?.semanticWeight || 0}`, sub: 'Similarité Cosinus', trend: 'up' },
          { label: 'Betweenness Score', value: `${selectedNode?.betweennessCentrality || 0}`, sub: 'Centralité Top 5%' },
          { label: 'Rayon de Sauts', value: `${selectedNode?.maxHops || 0} Hops`, sub: 'Parcours BFS/DFS' }
        ]}
        aiInsight={{
          title: 'Topologie & Centralité du Nœud',
          content: `Le nœud ${selectedNode?.name} est un pôle d'attraction majeur dans le graphe ontologique. Ses arêtes de communication sont traitées avec une priorité QoS 0.`,
          actionLabel: 'Visualiser le sous-graphe 3D',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Topologie 3D projetée en mémoire');
          }
        }}
        tabs={[
          {
            id: 'edges',
            label: 'Arêtes & Relations',
            content: (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-1">
                  Arêtes sortantes et entrantes reliant ce nœud aux entités du système :
                </div>
                <div className="space-y-2">
                  {selectedNode?.edges.map((edge) => (
                    <div key={edge.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-400">[:{edge.predicate}]</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-200">{edge.targetNode}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                          {edge.latencyMs} ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                        <span>Domaine cible : <strong className="text-slate-300">{edge.targetDomain}</strong></span>
                        <span className="font-mono text-emerald-400 font-semibold">Poids : {edge.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'query_inspector',
            label: 'Inspecteur Cypher & SPARQL',
            content: (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Requête Cypher optimisée :</span>
                    <button
                      onClick={() => selectedNode && handleCopyCode(selectedNode.cypherQuery, 'Requête Cypher')}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-400 text-xs flex items-center gap-1 font-medium"
                    >
                      <Copy size={11} />
                      <span>Copier</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    {selectedNode?.cypherQuery}
                  </pre>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Requête SPARQL W3C :</span>
                    <button
                      onClick={() => selectedNode && handleCopyCode(selectedNode.sparqlQuery, 'Requête SPARQL')}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-400 text-xs flex items-center gap-1 font-medium"
                    >
                      <Copy size={11} />
                      <span>Copier</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-sky-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    {selectedNode?.sparqlQuery}
                  </pre>
                </div>
              </div>
            )
          },
          {
            id: 'rdf',
            label: 'Triplets RDF',
            content: (
              <div className="space-y-3">
                <span className="text-xs text-slate-400">Triplets N-Triples / RDF normalisés :</span>
                <div className="space-y-1.5">
                  {selectedNode?.rdfTriples.map((trip, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 break-all leading-relaxed">
                      {trip}
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 3: CONFLICT RESOLUTION DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedConflict}
        onClose={() => setSelectedConflict(null)}
        title={selectedConflict?.title || ''}
        subtitle={`Entités impactées : ${selectedConflict?.entities.join(' ↔ ')}`}
        badge={selectedConflict ? `Sévérité ${selectedConflict.severity.toUpperCase()}` : 'Conflit'}
        badgeColor={selectedConflict?.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        icon={AlertTriangle}
        breadcrumbs={[
          { label: 'Ontologie OS', onClick: () => setSelectedConflict(null) },
          { label: 'Conflits', onClick: () => setSelectedConflict(null) },
          { label: selectedConflict?.title || 'Conflit' }
        ]}
        actions={[
          {
            id: 'apply_patch',
            label: isApplyingFix ? 'Application...' : 'Appliquer Correctif',
            icon: RefreshCw,
            variant: 'primary',
            onClick: () => {
              if (selectedConflict) handleApplyConflictFix(selectedConflict.id);
            }
          },
          {
            id: 'copy_patch',
            label: 'Copier Patch',
            icon: Copy,
            onClick: () => {
              if (selectedConflict) handleCopyCode(selectedConflict.patchCode, 'Code Correctif');
            }
          }
        ]}
        kpis={[
          { label: 'Niveau Sévérité', value: selectedConflict?.severity.toUpperCase() || 'MEDIUM', sub: 'Analyseur AST' },
          { label: 'Entités Liées', value: `${selectedConflict?.entities.length || 0} Entités`, sub: 'Graphe impacté' },
          { label: 'Gain Prévu', value: 'O(1) Accès', sub: 'Latence divisée' },
          { label: 'Statut Patch', value: 'Prêt', sub: 'Zéro downtime', trend: 'up' }
        ]}
        aiInsight={{
          title: 'Analyse Cause Racine (RCA)',
          content: selectedConflict?.desc || '',
          actionLabel: 'Simuler l\'impact sur le schéma',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Simulation validée : 0 régression détectée');
          }
        }}
        tabs={[
          {
            id: 'patch',
            label: 'Correctif Automatique',
            content: (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-emerald-400">Recommandation du Moteur Ontologique :</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedConflict?.resolution}</p>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Code de migration de schéma à exécuter :</div>
                  <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    {selectedConflict?.patchCode}
                  </pre>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 4: TAXONOMY CLASS DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedTaxonomy}
        onClose={() => setSelectedTaxonomy(null)}
        title={selectedTaxonomy?.name || ''}
        subtitle={`Arborescence de classe • ${selectedTaxonomy?.subClasses} sous-classes`}
        badge={selectedTaxonomy?.status === 'synced' ? 'Synchronisé' : 'Validation'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={FolderTree}
        breadcrumbs={[
          { label: 'Ontologie OS', onClick: () => setSelectedTaxonomy(null) },
          { label: 'Taxonomie', onClick: () => setSelectedTaxonomy(null) },
          { label: selectedTaxonomy?.name || 'Classe' }
        ]}
        actions={[
          {
            id: 'add_subclass',
            label: 'Ajouter Sous-classe',
            icon: FolderTree,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Sous-classe créée sous ${selectedTaxonomy?.name}`);
            }
          },
          {
            id: 'gen_dtd',
            label: 'Générer DTD',
            icon: FileCode,
            onClick: () => {
              haptics.trigger('selection');
              showToast(`DTD formel exporté pour ${selectedTaxonomy?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Sous-Classes', value: `${selectedTaxonomy?.subClasses || 0} Types`, sub: 'Héritage direct' },
          { label: 'Attributs Définis', value: `${selectedTaxonomy?.properties || 0} Champs`, sub: 'Contraintes typées' },
          { label: 'Modules Liés', value: `${selectedTaxonomy?.assignedModules.length || 0} Apps`, sub: 'OMK Mobile OS' },
          { label: 'Statut Type', value: 'W3C OWL', sub: 'Immuable', trend: 'up' }
        ]}
        tabs={[
          {
            id: 'inheritance',
            label: 'Arbre d\'Héritage',
            content: (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">Chaîne d'héritage polymorphique ascendante :</div>
                <div className="space-y-2">
                  {selectedTaxonomy?.inheritanceTree.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-200">{item}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Niveau {idx}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 5: SYNC CONNECTOR DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedConnector}
        onClose={() => setSelectedConnector(null)}
        title={selectedConnector?.name || ''}
        subtitle={`${selectedConnector?.engine} • Latence ${selectedConnector?.latency}`}
        badge={selectedConnector?.status === 'synced' ? 'Opérationnel' : 'Inactif'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={Database}
        breadcrumbs={[
          { label: 'Ontologie OS', onClick: () => setSelectedConnector(null) },
          { label: 'Sync MCP', onClick: () => setSelectedConnector(null) },
          { label: selectedConnector?.name || 'Connecteur' }
        ]}
        actions={[
          {
            id: 'force_sync',
            label: 'Forcer Re-synchronisation',
            icon: RefreshCw,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Re-synchronisation CDC forcée pour ${selectedConnector?.name}`);
            }
          },
          {
            id: 'ping_test',
            label: 'Tester Ping mTLS',
            icon: Zap,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Ping mTLS réussi sur ${selectedConnector?.name} (12ms)`);
            }
          }
        ]}
        kpis={[
          { label: 'Latence Réseau', value: selectedConnector?.latency || '0ms', sub: 'Round-trip time', trend: 'up' },
          { label: 'Débit Mutations', value: selectedConnector?.mutationRate || '0 ops/s', sub: 'CDC Streaming' },
          { label: 'Heartbeat', value: selectedConnector?.lastHeartbeat || 'Maintenant', sub: 'Sonde de santé' },
          { label: 'Disponibilité', value: '99.99%', sub: 'SLA Cluster' }
        ]}
        tabs={[
          {
            id: 'details',
            label: 'Paramètres CDC',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endpoint Cluster :</span>
                    <span className="font-mono text-slate-200 truncate max-w-[200px]">{selectedConnector?.endpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode Réplication :</span>
                    <span className="font-mono text-emerald-400">{selectedConnector?.cdcMode}</span>
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
