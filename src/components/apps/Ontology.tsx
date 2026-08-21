import { useState } from 'react';
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
  Database
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const CONFLICTS = [
  {
    id: '1',
    title: 'Propriété redondante "tax_rate"',
    entities: ['Invoice', 'BillingAccount'],
    desc: 'L\'entité Invoice hérite déjà de "tax_rate" via BillingAccount. Déduplication recommandée.',
    severity: 'medium',
    resolution: 'Supprimer Invoice.tax_rate et mapper dynamiquement sur BillingAccount.tax_rate.'
  },
  {
    id: '2',
    title: 'Cycle d\'héritage circulaire détecté',
    entities: ['UserRole', 'PermissionGroup', 'UserRole'],
    desc: 'Référence cyclique empêchant la résolution des droits en temps constant O(1).',
    severity: 'high',
    resolution: 'Scinder PermissionGroup en sous-graphes immuables avec clé de hachage unique.'
  },
];

const TAXONOMY_CLASSES = [
  { id: 't1', name: 'CoreEntity', subClasses: 14, properties: 84, status: 'synced' },
  { id: 't2', name: 'FinancialTransaction', subClasses: 6, properties: 38, status: 'synced' },
  { id: 't3', name: 'AgentStateMemory', subClasses: 9, properties: 52, status: 'synced' },
];

const ONTOLOGY_TABS = [
  { id: 'graph', label: 'Graphe', icon: Network },
  { id: 'conflicts', label: 'Conflits', icon: AlertTriangle, badge: 2, badgeColor: 'bg-amber-500 text-slate-950' },
  { id: 'taxonomy', label: 'Taxonomie', icon: FolderTree, badge: 3 },
  { id: 'sync', label: 'Sync MCP', icon: Database }
];

export default function Ontology() {
  const [activeTab, setActiveTab] = useState('graph');
  const [selectedConflict, setSelectedConflict] = useState<typeof CONFLICTS[0] | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [resolvedConflicts, setResolvedConflicts] = useState<string[]>([]);

  const handleApplyFix = (id: string) => {
    setIsApplyingFix(true);
    setTimeout(() => {
      setIsApplyingFix(false);
      setResolvedConflicts(prev => [...prev, id]);
      setSelectedConflict(null);
    }, 800);
  };

  const activeConflicts = CONFLICTS.filter(c => !resolvedConflicts.includes(c.id));

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={ONTOLOGY_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: GRAPH */}
          {activeTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Graphe de Connaissances & Schéma"
                subtitle="Modélisation sémantique des entités de l'OS"
                badge="128 Entités"
                icon={Network}
                kpis={[
                  { label: 'Classes Schéma', value: '42', sub: 'Relations O(1)' },
                  { label: 'Intégrité Graphe', value: '99.4%', sub: '2 avertissements', trend: 'up' },
                  { label: 'Noeuds Vectoriels', value: '8,420', sub: 'Index HNSW' }
                ]}
              >
                <DetailCard title="Structure du Graphe Sémantique" icon={Network}>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Entités Primaires (Client, Account, Contract)</span>
                      <span className="font-mono text-emerald-400 font-semibold">29 entités</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Propriétés & Dépendances Typées</span>
                      <span className="font-mono text-slate-200 font-semibold">312 attributs</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Contraintes d'Intégrité Référentielle</span>
                      <span className="font-mono text-emerald-400 font-semibold">100% Validé</span>
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Optimisation Topologie Ontologique"
                  content="L'analyse sémantique préconise la déduplication de la propriété 'tax_rate' pour alléger les requêtes récursives du schéma GraphQL."
                  actionLabel="Consulter les conflits"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: CONFLICTS */}
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
                subtitle="Anomalies de schéma détectées par le vérificateur formel"
                icon={AlertTriangle}
                badge={`${activeConflicts.length} Conflit(s)`}
                badgeColor={activeConflicts.length > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
              >
                <div className="space-y-3">
                  {activeConflicts.map(conf => (
                    <DetailCard
                      key={conf.id}
                      onClick={() => setSelectedConflict(conf)}
                      isInteractive
                      title={conf.title}
                      badge={`Sévérité ${conf.severity.toUpperCase()}`}
                      badgeColor={conf.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={AlertTriangle}
                      subtitle={`Entités : ${conf.entities.join(' ↔ ')}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{conf.desc}</p>
                    </DetailCard>
                  ))}

                  {activeConflicts.length === 0 && (
                    <div className="p-6 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                      <div className="text-sm font-semibold text-slate-200">Graphe Ontologique Parfaitement Aligné</div>
                      <div className="text-xs text-slate-400">Aucun conflit d'héritage ni redondance détecté.</div>
                    </div>
                  )}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: TAXONOMY */}
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
                subtitle="Hiérarchie des types de données du système"
                icon={FolderTree}
                badge="3 Arborescences"
              >
                <div className="space-y-3">
                  {TAXONOMY_CLASSES.map(cls => (
                    <DetailCard
                      key={cls.id}
                      title={cls.name}
                      badge={`${cls.subClasses} sous-classes`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={FolderTree}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Propriétés définies : <strong className="text-slate-200">{cls.properties}</strong></span>
                        <span className="text-emerald-400 font-semibold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {cls.status}
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SYNC */}
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
                subtitle="Passerelle bidirectionnelle avec les schémas SQL/NoSQL"
                icon={Database}
                badge="En Ligne"
              >
                <DetailCard title="Connecteur Ontologique MCP" icon={Database}>
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> Schéma synchronisé avec PostgreSQL & Cloud Run en continu.
                    </p>
                    <p>Latence de synchronisation des mutations : &lt; 50ms.</p>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Conflict Resolution */}
      <AnimatePresence>
        {selectedConflict && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Résolution du Conflit</span>
              <button onClick={() => setSelectedConflict(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedConflict.title}</h3>
                <div className="text-xs text-slate-400">Entités : {selectedConflict.entities.join(' ↔ ')}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-emerald-400">Correctif Automatique Suggéré</div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">{selectedConflict.resolution}</p>
              </div>

              <button 
                onClick={() => handleApplyFix(selectedConflict.id)}
                disabled={isApplyingFix}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-2xl text-xs font-semibold text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors"
              >
                {isApplyingFix ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isApplyingFix ? 'Application du Schéma...' : 'Appliquer la Déduplication'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
