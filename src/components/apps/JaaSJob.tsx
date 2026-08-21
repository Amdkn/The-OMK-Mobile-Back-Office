import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  ChevronRight, 
  X, 
  Bot, 
  Calendar, 
  CheckCircle2, 
  Star, 
  Mail, 
  Send,
  BarChart3,
  Check
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const CAMPAIGNS = [
  { id: '1', role: 'Staff Engineer (Rust / TS)', active: 14, qualified: 4, responseRate: '42%', status: 'En cours', deadline: '30 Août' },
  { id: '2', role: 'Lead Growth & Acquisition', active: 28, qualified: 6, responseRate: '38%', status: 'En cours', deadline: '15 Sept' },
  { id: '3', role: 'Solutions Architect Enterprise', active: 8, qualified: 2, responseRate: '50%', status: 'Clôturé', deadline: 'Terminé' },
];

const CANDIDATES = [
  { id: 'c1', name: 'Alexandre Meyer', role: 'Staff Engineer', score: '98%', match: 'Rust • Distributed Systems • MCP', exp: '8 ans', status: 'Entretien Final', email: 'alex.meyer@dev.co' },
  { id: 'c2', name: 'Sophie Laurent', role: 'Lead Growth', score: '94%', match: 'B2B SaaS • Paid Ads • SEO Local', exp: '6 ans', status: 'Test Technique', email: 'sophie.l@growth.io' },
  { id: 'c3', name: 'Julien Vasseur', role: 'Staff Engineer', score: '91%', match: 'TypeScript • Kernel • Cloud Run', exp: '5 ans', status: 'Premier Contact', email: 'j.vasseur@tech.fr' },
];

const INTERVIEWS = [
  { id: 'int1', candidate: 'Alexandre Meyer', date: 'Demain, 14:00', type: 'Entretien Architecture avec CTO', status: 'confirmé' },
  { id: 'int2', candidate: 'Sophie Laurent', date: 'Jeudi, 10:30', type: 'Restitution Étude de Cas Growth', status: 'confirmé' },
];

const JAAS_TABS = [
  { id: 'campaigns', label: 'Campagnes', icon: Briefcase },
  { id: 'candidates', label: 'Candidats', icon: Users, badge: 3 },
  { id: 'interviews', label: 'Entretiens', icon: Calendar, badge: 2 },
  { id: 'analytics', label: 'Funnel', icon: BarChart3 }
];

export default function JaaSJob() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCandidate, setSelectedCandidate] = useState<typeof CANDIDATES[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={JAAS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Campagnes de Recrutement"
                subtitle="Chasse de têtes automatisée & IA Sourcing"
                badge="3 Rôles Actifs"
                icon={Briefcase}
                kpis={[
                  { label: 'Candidats Sourcés', value: '50', sub: '+18 cette semaine', trend: 'up' },
                  { label: 'Taux de Réponse', value: '43.3%', sub: 'Au-dessus du benchmark' },
                  { label: 'Shortlist Validée', value: '12', sub: 'Prêts pour final' }
                ]}
              >
                <div className="space-y-3">
                  {CAMPAIGNS.map(camp => (
                    <DetailCard
                      key={camp.id}
                      title={camp.role}
                      badge={camp.status}
                      badgeColor={camp.status === 'En cours' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}
                      icon={Briefcase}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 mt-2">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Sourcés</div>
                          <div className="text-sm font-semibold text-slate-200 mt-0.5">{camp.active}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Qualifiés</div>
                          <div className="text-sm font-semibold text-emerald-400 mt-0.5">{camp.qualified}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Conversion</div>
                          <div className="text-sm font-semibold text-slate-200 mt-0.5">{camp.responseRate}</div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Analyse Sourcing Coach AI"
                  content="Le profil Alexandre Meyer correspond à 98% au besoin Staff Engineer. La recommandation est de formuler une offre sous 48h pour devancer les offres concurrentes."
                  actionLabel="Préparer la proposition d'embauche"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: CANDIDATES */}
          {activeTab === 'candidates' && (
            <motion.div
              key="candidates"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Vivier de Talents Qualifiés"
                subtitle="Sélection affinée par score de matching IA"
                badge="Score > 90%"
                icon={Users}
              >
                <div className="space-y-3">
                  {CANDIDATES.map(cand => (
                    <DetailCard
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      isInteractive
                      title={cand.name}
                      badge={`Score ${cand.score}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Users}
                      subtitle={`${cand.role} • ${cand.exp}`}
                    >
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-mono">{cand.match}</span>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <span>{cand.status}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <motion.div
              key="interviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Planning des Entretiens"
                subtitle="Sessions d'évaluation technique et culturelle"
                icon={Calendar}
                badge="2 programmés"
              >
                <div className="space-y-3">
                  {INTERVIEWS.map(item => (
                    <DetailCard
                      key={item.id}
                      title={item.candidate}
                      badge={item.date}
                      badgeColor="bg-slate-950/80 text-emerald-400 border-slate-800 font-mono"
                      icon={Calendar}
                    >
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-300">{item.type}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {item.status}
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Performance du Funnel JaaS"
                subtitle="Métriques d'attraction et de conversion"
                icon={BarChart3}
                badge="Cycle Moyen: 18j"
              >
                <DetailCard title="Entonnoir de Recrutement" icon={BarChart3}>
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>1. Sourcing Initial</span>
                        <span className="font-semibold text-slate-100">120 profils</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full w-full" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>2. Réponse Positive & Screening</span>
                        <span className="font-semibold text-slate-100">50 profils (42%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full w-[42%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>3. Test Technique & Défi</span>
                        <span className="font-semibold text-slate-100">12 profils (10%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full w-[10%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>4. Offre Finale d'Embauche</span>
                        <span className="font-semibold text-slate-100">3 candidats (2.5%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-400 h-full rounded-full w-[2.5%]" />
                      </div>
                    </div>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Candidate Detail */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Fiche Candidat</span>
              <button onClick={() => setSelectedCandidate(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{selectedCandidate.name}</h3>
                  <div className="text-xs text-slate-400">{selectedCandidate.role} • {selectedCandidate.exp}</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                  Match {selectedCandidate.score}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Compétences Clés</div>
                <div className="text-xs text-slate-200 font-mono">{selectedCandidate.match}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Coordonnées</div>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" /> {selectedCandidate.email}
                </div>
              </div>

              <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-xs font-semibold text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors">
                <Send size={14} /> Envoyer Proposition de Contrat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
