import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { 
  MapPin, 
  PhoneCall, 
  Star, 
  TrendingUp, 
  Megaphone, 
  Bot, 
  ChevronRight, 
  X, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  PhoneForwarded,
  UserCheck,
  Award
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const CALLS = [
  { id: 1, name: 'Client Potentiel (Cabinet Alpha)', number: '+33 6 12 34 56 78', time: '14:30', duration: '5m 23s', status: 'completed', score: '94%', intent: 'Demande d\'intégration OMK OS' },
  { id: 2, name: 'Lead Local Inbound', number: '+33 1 42 68 90 00', time: '11:15', duration: '0s', status: 'missed', score: '78%', intent: 'Rappel automatique programmé' },
  { id: 3, name: 'Partenaire Stratégique', number: '+33 6 88 99 00 11', time: 'Hier', duration: '12m 45s', status: 'completed', score: '99%', intent: 'Contrat d\'apporteur d\'affaires' },
];

const CAMPAIGNS = [
  { id: 'c1', name: 'Google Ads Search Local', leads: 42, cpl: '€14.20', spend: '€596.40', status: 'active' },
  { id: 'c2', name: 'LinkedIn B2B Retargeting', leads: 18, cpl: '€38.50', spend: '€693.00', status: 'active' },
  { id: 'c3', name: 'Google Maps Boost', leads: 64, cpl: '€8.40', spend: '€537.60', status: 'active' },
];

const AUTO_BOT_LOGS = [
  { id: 'ab1', from: '+33 6 12 34 56 78', summary: 'Le prospect a demandé les tarifs de licence. Le bot a envoyé la documentation par SMS et créé un rdv pour demain 10h.', time: 'Il y a 20m' },
  { id: 'ab2', from: '+33 1 42 68 90 00', summary: 'Appel manqué traité : message vocal transcrit avec succès. Lead qualifié "Tier 1".', time: 'Il y a 3h' },
];

const LEADS_TABS = [
  { id: 'google_business', label: 'Google Pro', icon: MapPin },
  { id: 'calls', label: 'Appels', icon: PhoneCall, badge: 3 },
  { id: 'campaigns', label: 'Campagnes', icon: Megaphone, badge: 3 },
  { id: 'auto_bot', label: 'Bot Vocal', icon: Bot, badge: 'IA' }
];

export default function Leads() {
  const [activeTab, setActiveTab] = useState('google_business');
  const [selectedCall, setSelectedCall] = useState<typeof CALLS[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={LEADS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: GOOGLE BUSINESS */}
          {activeTab === 'google_business' && (
            <motion.div
              key="google_business"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Fiche Google My Business & Avis"
                subtitle="Visibilité locale, positionnement Maps et réputation"
                badge="Note 4.9 ★"
                icon={MapPin}
                kpis={[
                  { label: 'Vues de la Fiche', value: '4.8k', sub: '+32% ce mois', trend: 'up' },
                  { label: 'Demandes d\'Itinéraire', value: '142', sub: '+18% vs M-1', trend: 'up' },
                  { label: 'Appels Générés', value: '68', sub: 'Taux conv 48%' }
                ]}
              >
                <DetailCard title="Score de Réputation & Avis Clients" icon={Star}>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-slate-100">4.9</div>
                      <div className="flex items-center text-amber-400">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">(128 avis vérifiés)</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      100% des avis traités automatiquement avec des réponses personnalisées IA.
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Recommandation Locale Coach AI"
                  content="Publier une nouvelle actualité Google Post sur les fonctionnalités de l'OS ce vendredi augmentera les interactions de 24% pendant le week-end."
                  actionLabel="Programmer un Google Post"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: CALLS */}
          {activeTab === 'calls' && (
            <motion.div
              key="calls"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Journal des Appels & Leads Vocaux"
                subtitle="Enregistrements, retranscriptions et qualification d'intention"
                icon={PhoneCall}
                badge="3 Appels Récents"
              >
                <div className="space-y-3">
                  {CALLS.map(call => (
                    <DetailCard
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      isInteractive
                      title={call.name}
                      badge={`Score ${call.score}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={PhoneCall}
                      subtitle={`${call.number} • ${call.time} (${call.duration})`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Intention : <strong className="text-slate-200">{call.intent}</strong></span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{call.status === 'completed' ? 'Traité' : 'À rappeler'}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Campagnes d'Acquisition Locale"
                subtitle="Coût par lead (CPL) et performance des annonces locales"
                icon={Megaphone}
                badge="3 Campagnes"
              >
                <div className="space-y-3">
                  {CAMPAIGNS.map(camp => (
                    <DetailCard
                      key={camp.id}
                      title={camp.name}
                      badge={`CPL ${camp.cpl}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Megaphone}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Leads générés : <strong className="text-slate-200">{camp.leads}</strong></span>
                        <span className="font-mono text-slate-300">Dépenses : {camp.spend}</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: AUTO_BOT */}
          {activeTab === 'auto_bot' && (
            <motion.div
              key="auto_bot"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Bot Téléphonique Autonome"
                subtitle="Accueil vocal interactif 24/7 et prise de rendez-vous IA"
                icon={Bot}
                badge="Actif 24/7"
              >
                <div className="space-y-3">
                  {AUTO_BOT_LOGS.map(log => (
                    <DetailCard
                      key={log.id}
                      title={`Interaction : ${log.from}`}
                      badge={log.time}
                      badgeColor="bg-slate-950 text-slate-400 border-slate-800 font-mono"
                      icon={Bot}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{log.summary}</p>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Call Detail */}
      <AnimatePresence>
        {selectedCall && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Détail de l'Appel</span>
              <button onClick={() => setSelectedCall(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedCall.name}</h3>
                <div className="text-xs text-slate-400">{selectedCall.number} • {selectedCall.time}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Intention Détectée</span>
                  <span className="text-emerald-400 font-semibold">{selectedCall.intent}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Score de Qualification</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedCall.score}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Durée de l'Échange</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedCall.duration}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
