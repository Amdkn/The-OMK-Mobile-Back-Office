import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  Search, 
  GitCompare, 
  ChevronRight, 
  X, 
  Bot, 
  Sparkles, 
  ArrowUpRight, 
  DollarSign, 
  Users,
  PieChart,
  Layers
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const CAMPAIGNS = [
  { id: '1', name: 'Google Search - Agency Automation', budget: '€1,200', roas: '4.2x', spend: '€840', conversions: 38, cpa: '€22.10', status: 'Actif' },
  { id: '2', name: 'LinkedIn Ads - Enterprise Decision Makers', budget: '€2,500', roas: '3.1x', spend: '€1,850', conversions: 24, cpa: '€77.08', status: 'Actif' },
  { id: '3', name: 'Meta Retargeting - Landing Page Visitors', budget: '€600', roas: '5.8x', spend: '€420', conversions: 52, cpa: '€8.07', status: 'Actif' },
];

const AB_TESTS = [
  { id: 'ab1', name: 'Hero CTA: "Démarrer Sandbox" vs "Réserver Démo"', sample: '4,200 visites', winner: 'Var B (+28% conv)', status: 'Terminé' },
  { id: 'ab2', name: 'Page Pricing: Annuel affiché par défaut', sample: '1,850 visites', winner: 'En cours (+14%)', status: 'Actif' },
];

const KEYWORDS = [
  { id: 'kw1', word: 'Solution BaaS LLC USA', rank: '#1', volume: '1.2k/mois', change: '+2' },
  { id: 'kw2', word: 'MCP AI Operating System', rank: '#2', volume: '3.4k/mois', change: '+5' },
  { id: 'kw3', word: 'Automatisation agence locale', rank: '#1', volume: '850/mois', change: '=' },
];

const GROWTH_TABS = [
  { id: 'acquisition', label: 'Acquisition', icon: TrendingUp },
  { id: 'campaigns', label: 'Campagnes', icon: Target, badge: 3 },
  { id: 'ab_tests', label: 'A/B Tests', icon: GitCompare },
  { id: 'seo', label: 'SEO & Rangs', icon: Search, badge: '#1' }
];

export default function Growth() {
  const [activeTab, setActiveTab] = useState('acquisition');
  const [selectedCampaign, setSelectedCampaign] = useState<typeof CAMPAIGNS[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={GROWTH_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: ACQUISITION */}
          {activeTab === 'acquisition' && (
            <motion.div
              key="acquisition"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Moteur de Croissance & Acquisition"
                subtitle="Performance omnicanale et métriques de conversion"
                badge="ROAS Moyen 4.1x"
                icon={TrendingUp}
                kpis={[
                  { label: 'Visiteurs Uniques', value: '38.4k', sub: '+28% ce mois', trend: 'up' },
                  { label: 'CAC Moyen', value: '€28.40', sub: '-14% vs Q2', trend: 'up' },
                  { label: 'Leads Inbound', value: '114', sub: 'Taux conv 3.8%' }
                ]}
              >
                <DetailCard title="Mix d'Acquisition Multicanal" icon={TrendingUp}>
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>SEO Organique & Direct</span>
                        <span className="font-semibold text-slate-100">48% (18,430 visites)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full w-[48%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Campagnes Payantes (Google / LinkedIn)</span>
                        <span className="font-semibold text-slate-100">34% (13,050 visites)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-400 h-full rounded-full w-[34%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Recommandations & Affiliation</span>
                        <span className="font-semibold text-slate-100">18% (6,920 visites)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-teal-400 h-full rounded-full w-[18%]" />
                      </div>
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Recommandation Growth Coach AI"
                  content="La campagne Meta Retargeting affiche un ROAS exceptionnel de 5.8x. Augmenter le budget quotidien de €20/jour générera 18 conversions supplémentaires par semaine."
                  actionLabel="Ajuster les budgets d'acquisition"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Campagnes Publicitaires Actives"
                subtitle="Suivi des dépenses, ROAS et coût par acquisition"
                icon={Target}
                badge="3 Actives"
              >
                <div className="space-y-3">
                  {CAMPAIGNS.map(c => (
                    <DetailCard
                      key={c.id}
                      onClick={() => setSelectedCampaign(c)}
                      isInteractive
                      title={c.name}
                      badge={`ROAS ${c.roas}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Target}
                      subtitle={`Dépenses : ${c.spend} / ${c.budget} • CPA : ${c.cpa}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-medium">Conversions : <strong className="text-slate-200">{c.conversions}</strong></span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{c.status}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: AB_TESTS */}
          {activeTab === 'ab_tests' && (
            <motion.div
              key="ab_tests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Expérimentations & A/B Tests"
                subtitle="Optimisation continue des taux de conversion (CRO)"
                icon={GitCompare}
                badge="2 Tests"
              >
                <div className="space-y-3">
                  {AB_TESTS.map(test => (
                    <DetailCard
                      key={test.id}
                      title={test.name}
                      badge={test.status}
                      badgeColor={test.status === 'Terminé' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-300 border-slate-800'}
                      icon={GitCompare}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Échantillon : {test.sample}</span>
                        <span className="text-emerald-400 font-semibold">{test.winner}</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Positionnement SEO & Mots-Clés"
                subtitle="Surveillance des positions sur les requêtes cibles"
                icon={Search}
                badge="3 Mots-clés en Top 3"
              >
                <div className="space-y-3">
                  {KEYWORDS.map(kw => (
                    <DetailCard
                      key={kw.id}
                      title={kw.word}
                      badge={kw.rank}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                      icon={Search}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Volume mensuel : {kw.volume}</span>
                        <span className="text-emerald-400 font-semibold">{kw.change} ce mois</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Campaign Detail */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Détail de la Campagne</span>
              <button onClick={() => setSelectedCampaign(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedCampaign.name}</h3>
                <div className="text-xs text-slate-400">Budget alloué : {selectedCampaign.budget}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Dépenses Réelles</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedCampaign.spend}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Conversions Enregistrées</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedCampaign.conversions} leads</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Coût d'Acquisition (CPA)</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedCampaign.cpa}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
