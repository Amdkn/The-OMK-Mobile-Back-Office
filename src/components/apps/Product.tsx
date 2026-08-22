import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Kanban, 
  Layers, 
  MessageSquare, 
  Tag, 
  ChevronRight, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Compass,
  Flame,
  Check,
  FileCode,
  ThumbsUp,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface RoadmapItem {
  id: string;
  title: string;
  status: 'En cours' | 'Next' | 'Prévu' | 'Livré';
  priority: 'High' | 'Medium' | 'Low';
  quarter: string;
  desc: string;
  spec: string;
  epic: string;
  tasks: { name: string; done: boolean }[];
}

const INITIAL_ROADMAP: RoadmapItem[] = [
  { 
    id: '1', 
    title: 'Connecteur MCP Google Workspace', 
    status: 'En cours', 
    priority: 'High', 
    quarter: 'Q3 2026', 
    desc: 'Permet la synchronisation bidirectionnelle Google Calendar & Docs dans Coach AI.',
    spec: 'Développement du serveur MCP en TypeScript avec OAuth2 token refresh et streaming SSE.',
    epic: 'Intégrations Écosystème',
    tasks: [
      { name: 'Spécification du protocole Model Context Protocol', done: true },
      { name: 'Implémentation des endpoints Calendar & Gmail', done: true },
      { name: 'Tests de charge et validation des scopes de sécurité', done: false }
    ]
  },
  { 
    id: '2', 
    title: 'Moteur de Facturation Stripe Sync v2', 
    status: 'Next', 
    priority: 'Medium', 
    quarter: 'Q3 2026', 
    desc: 'Rapprochement comptable instantané et génération automatique des FEC.',
    spec: 'Capture des événements webhook invoice.payment_succeeded et génération automatique du journal des ventes.',
    epic: 'Finance & Compliance',
    tasks: [
      { name: 'Webhooks idempotents Redis', done: true },
      { name: 'Moteur de conversion FEC conforme DGFiP', done: false }
    ]
  },
  { 
    id: '3', 
    title: 'Agent Sentinel Autonome', 
    status: 'Prévu', 
    priority: 'High', 
    quarter: 'Q4 2026', 
    desc: 'Détection prédictive de dérive de schéma ontologique et alertes de trésorerie.',
    spec: 'Surveillance asynchrone des modèles d\'IA avec rollback automatique si le drift > 5%.',
    epic: 'IA & Autonomie',
    tasks: [
      { name: 'Architecture multi-agents asynchrone', done: false },
      { name: 'Moteur de règles d\'alerte webhook/SMS', done: false }
    ]
  },
];

const SPRINTS = [
  { id: 'sp1', name: 'Sprint 24 - Core Stability & Wallpapers', velocity: '42 pts', daysLeft: '4 jours', progress: 85, focus: 'Finition des thèmes et des composants de profondeur' },
  { id: 'sp2', name: 'Sprint 23 - UX Multi-Pages & Depth', velocity: '38 pts', daysLeft: 'Terminé', progress: 100, focus: 'Standardisation des interfaces et du composant AppTopNav' },
];

const FEEDBACKS = [
  { id: 'f1', user: 'Sarah Jenkins (Nexus)', text: 'L\'exportation comptable automatique nous a fait gagner 4h/semaine.', votes: 24, cat: 'Finance' },
  { id: 'f2', user: 'Mike Ross (Specter)', text: 'Possibilité d\'éditer les variables CSS directement depuis le terminal serait top.', votes: 18, cat: 'Dev' },
  { id: 'f3', user: 'Elena Martinez (FinData)', text: 'Le slider de luminosité et la palette OLED sont d\'un confort remarquable la nuit.', votes: 31, cat: 'UX' }
];

const PRODUCT_TABS = [
  { id: 'roadmap', label: 'Roadmap', icon: Compass },
  { id: 'sprints', label: 'Sprints', icon: Flame, badge: 'Actif' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, badge: 3 },
  { id: 'releases', label: 'Releases', icon: Tag, badge: 'v4' }
];

export default function Product() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(INITIAL_ROADMAP);
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleTask = (taskIndex: number) => {
    if (!selectedItem) return;
    const updatedTasks = [...selectedItem.tasks];
    updatedTasks[taskIndex].done = !updatedTasks[taskIndex].done;
    const updatedItem = { ...selectedItem, tasks: updatedTasks };
    setSelectedItem(updatedItem);
    setRoadmap(prev => prev.map(r => r.id === updatedItem.id ? updatedItem : r));
    showToast(`Tâche "${updatedTasks[taskIndex].name}" mise à jour`);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={PRODUCT_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ROADMAP */}
          {activeTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Feuille de Route Produit"
                subtitle="Orientations stratégiques et jalons trimestriels"
                badge="Q3-Q4 2026"
                icon={Compass}
                kpis={[
                  { label: 'Vélocité Équipe', value: '42 pts', sub: '+15% vs M-1', trend: 'up' },
                  { label: 'Features Livrées', value: '18', sub: 'Ce trimestre' },
                  { label: 'Satisfaction CSAT', value: '4.9/5', sub: 'Top Tier', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {roadmap.map(item => (
                    <DetailCard
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      isInteractive
                      title={item.title}
                      badge={item.quarter}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Compass}
                      subtitle={`Priorité : ${item.priority} • Statut : ${item.status}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{item.desc}</p>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Alignement Vision Produit"
                  content="L'intégration du connecteur MCP Google Workspace permettra d'accélérer l'onboarding des clients Enterprise de 60%."
                  actionLabel="Générer les user stories pour le Sprint 25"
                  onAction={() => showToast('User stories générées et assignées')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: SPRINTS */}
          {activeTab === 'sprints' && (
            <motion.div
              key="sprints"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Sprints Actifs & Suivi Scrum"
                subtitle="Itérations de développement de deux semaines"
                icon={Flame}
                badge="Sprint 24 en cours"
                kpis={[
                  { label: 'Vélocité Actuelle', value: '42 pts', sub: 'Objectif 40 pts', trend: 'up' },
                  { label: 'Jours Restants', value: '4 jours', sub: 'Fin le 25 Août' },
                  { label: 'Taux Complétion', value: '85%', sub: 'Avance sur planning', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {SPRINTS.map(sp => (
                    <DetailCard
                      key={sp.id}
                      title={sp.name}
                      badge={`${sp.progress}%`}
                      badgeColor={sp.progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
                      icon={Flame}
                      subtitle={sp.focus}
                    >
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Vélocité : {sp.velocity}</span>
                          <span className="text-slate-400">{sp.daysLeft}</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sp.progress}%` }} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: FEEDBACK */}
          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Retours Clients & Boîte à Idées"
                subtitle="Suggestions remontées par les utilisateurs et votées"
                icon={MessageSquare}
                badge="73 Votes Enregistrés"
                kpis={[
                  { label: 'Idées Soumises', value: '28', sub: 'Ce mois' },
                  { label: 'Taux Implémentation', value: '45%', sub: 'Roadmap alimentée', trend: 'up' },
                  { label: 'NPS Produit', value: '+74', sub: 'Excellent' }
                ]}
              >
                <div className="space-y-3">
                  {FEEDBACKS.map(fb => (
                    <DetailCard
                      key={fb.id}
                      title={fb.user}
                      badge={`${fb.votes} votes`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={MessageSquare}
                      subtitle={`Catégorie : ${fb.cat}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <p className="text-slate-300 leading-relaxed italic">"{fb.text}"</p>
                        <button 
                          onClick={() => showToast(`Vote enregistré pour ${fb.user}`)}
                          className="ml-3 p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-emerald-400 flex items-center gap-1 shrink-0"
                        >
                          <ThumbsUp size={12} />
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: RELEASES */}
          {activeTab === 'releases' && (
            <motion.div
              key="releases"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Journal des Versions & Releases"
                subtitle="Changelog officiel de la plateforme OMK OS"
                icon={Tag}
                badge="Version 4.2 Pro"
                kpis={[
                  { label: 'Version Actuelle', value: 'v4.2.0', sub: 'Stable' },
                  { label: 'Fréquence Déploiement', value: 'Hebdo', sub: 'Zero-downtime' },
                  { label: 'Bugs Détectés', value: '0', sub: '100% tests validés' }
                ]}
              >
                <DetailCard title="Release v4.2.0 - Depth & Multipage Architecture" icon={Tag}>
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <p className="font-semibold text-emerald-400">Nouveautés majeures :</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>Intégration du composant AppTopNav sur toutes les applications système.</li>
                      <li>Inspecteur latéral DetailDrawer avec onglets dynamiques et actions rapides.</li>
                      <li>Optimisation du contraste WCAG AAA et calibrage dynamique de l'écran.</li>
                      <li>Nouveaux fonds d'écran dynamiques avec flou de matière translucide.</li>
                    </ul>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER ROADMAP ITEM INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        subtitle={`Epic : ${selectedItem?.epic} • Jalon : ${selectedItem?.quarter}`}
        badge={selectedItem?.status}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={Compass}
        breadcrumbs={[
          { label: 'Product OS', onClick: () => setSelectedItem(null) },
          { label: 'Roadmap', onClick: () => setSelectedItem(null) },
          { label: selectedItem?.title || 'Feature' }
        ]}
        actions={[
          {
            id: 'spec',
            label: 'Générer Spécification',
            icon: FileCode,
            variant: 'primary',
            onClick: () => showToast(`Spécification technique OpenAPI générée pour ${selectedItem?.title}`)
          },
          {
            id: 'branch',
            label: 'Créer Branche Git',
            icon: GitBranch,
            onClick: () => showToast(`Branche feature/${selectedItem?.id}-mcp créée`)
          }
        ]}
        kpis={[
          { label: 'Priorité', value: selectedItem?.priority.toUpperCase() || '', sub: 'Impact business' },
          { label: 'Jalon Cible', value: selectedItem?.quarter || '', sub: 'Livraison estimée' },
          { label: 'Avancement', value: `${selectedItem ? Math.round((selectedItem.tasks.filter(t => t.done).length / (selectedItem.tasks.length || 1)) * 100) : 0}%`, sub: 'Tâches clôturées' },
          { label: 'Statut', value: selectedItem?.status || '', sub: 'Sprint backlog' }
        ]}
        aiInsight={{
          title: 'Analyse de Complexité Coach AI',
          content: `Cette fonctionnalité implique 3 microservices. Estimation de charge : 8 story points avec risque technique faible.`,
          actionLabel: 'Assigner automatiquement aux développeurs',
          onAction: () => showToast('Tâche assignée aux développeurs')
        }}
        tabs={[
          {
            id: 'tasks',
            label: `Tâches & Critères (${selectedItem?.tasks.length || 0})`,
            content: (
              <div className="space-y-2">
                {selectedItem?.tasks.map((task, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleTask(idx)}
                    className="w-full p-3 bg-slate-900/80 hover:bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-left transition-colors"
                  >
                    <span className={task.done ? 'line-through text-slate-500' : 'text-slate-200'}>{task.name}</span>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      task.done ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {task.done && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                ))}
              </div>
            )
          },
          {
            id: 'spec',
            label: 'Spécification Technique',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200">Architecture & Notes</span>
                <p className="text-slate-400 leading-relaxed font-mono text-[11px]">{selectedItem?.spec}</p>
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
