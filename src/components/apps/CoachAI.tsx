import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Lightbulb, 
  MessageSquare, 
  BrainCircuit, 
  FileText,
  ChevronRight,
  X,
  Layers,
  Award
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  { id: 's1', title: 'Optimisation Trésorerie Runway', desc: 'Passer les souscriptions SaaS en paiement annuel pour économiser $3,400/an.', impact: '+$3.4k/an', cat: 'Finance' },
  { id: 's2', title: 'Relance Leads Tier 1 Google Maps', desc: '4 prospects locaux ont demandé un devis d\'intégration sans réponse depuis 48h.', impact: 'Potentiel +$18k', cat: 'Sales' },
  { id: 's3', title: 'Patch Conflit Ontologique', desc: 'Appliquer la déduplication sur BillingAccount pour réduire les temps de requête SQL.', impact: 'Latence -40ms', cat: 'Tech' },
];

const MEMORIES = [
  { id: 'm1', key: 'Préférence Juridique', value: 'Toujours inclure une clause de juridiction Wyoming (BaaS LLC).', date: 'Ajouté le 10 Août' },
  { id: 'm2', key: 'Objectif Q4 2026', value: 'Atteindre $100,000 de MRR avec 35% de marge nette.', date: 'Ajouté le 01 Août' },
  { id: 'm3', key: 'Architecture Cible', value: 'Priorité aux serveurs MCP locaux avec fallback Gemini 2.5 Flash.', date: 'Ajouté le 15 Juillet' },
];

const REPORTS = [
  { id: 'r1', title: 'Briefing Hebdomadaire S34', date: '21 Août 2026', readTime: '3 min', summary: 'Hausse de 12% du MRR, 2 recrutements en phase finale, conformité fiscale validée.' },
  { id: 'r2', title: 'Audit de Sécurité & Clés API', date: '14 Août 2026', readTime: '2 min', summary: '0 fuite détectée, rotation automatique des tokens effectuée avec succès.' },
];

const COACH_TABS = [
  { id: 'chat', label: 'Dialogue', icon: MessageSquare },
  { id: 'suggestions', label: 'Conseils', icon: Lightbulb, badge: 3 },
  { id: 'memory', label: 'Mémoire', icon: BrainCircuit },
  { id: 'reports', label: 'Rapports', icon: FileText, badge: 2 }
];

export default function CoachAI() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'coach',
      text: 'Bonjour ! Je suis votre Coach OS IA. Vos métriques de trésorerie sont optimales (Runway 18 mois) et 3 deals majeurs approchent de la clôture. Comment puis-je vous assister ?',
      timestamp: '09:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedReport, setSelectedReport] = useState<typeof REPORTS[0] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const coachReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: `J'ai analysé votre demande. Les données de vos modules Finance, Ventes et BaaS Hub confirment que votre plan est parfaitement cohérent avec les objectifs de rentabilité du Q4.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachReply]);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={COACH_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: CHAT */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full flex flex-col p-4"
            >
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm theme-transition ${
                        m.sender === 'user'
                          ? 'bg-emerald-500 text-slate-950 font-medium'
                          : 'bg-slate-900/85 backdrop-blur-xl border border-slate-800 text-slate-200'
                      }`}
                    >
                      {m.sender === 'coach' && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] mb-1">
                          <Bot size={12} /> Coach OS IA
                        </div>
                      )}
                      <div>{m.text}</div>
                      <div className={`text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-emerald-950/60' : 'text-slate-500'}`}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2 bg-slate-950/70 backdrop-blur-xl p-2 rounded-2xl border border-slate-800/60"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez une question stratégique au Coach..."
                  className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-xs px-2"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-emerald-500 disabled:opacity-40 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold transition-all shadow-md"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 2: SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Conseils Stratégiques Prédictifs"
                subtitle="Recommandations d'optimisation générées en continu"
                badge="3 Opportunités"
                icon={Lightbulb}
                kpis={[
                  { label: 'Impact Estimé', value: '+$21.4k', sub: 'Sur le trimestre', trend: 'up' },
                  { label: 'Gain de Temps', value: '14h/sem', sub: 'Automatisations' },
                  { label: 'Score Alignement', value: '98%', sub: 'Vision Business' }
                ]}
              >
                <div className="space-y-3">
                  {SUGGESTIONS.map(s => (
                    <DetailCard
                      key={s.id}
                      title={s.title}
                      badge={s.impact}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={Lightbulb}
                      subtitle={`Domaine : ${s.cat}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{s.desc}</p>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: MEMORY */}
          {activeTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Mémoire à Long Terme du Coach"
                subtitle="Faits et préférences mémorisés pour personnaliser l'assistance"
                icon={BrainCircuit}
                badge="3 Faits Enregistrés"
              >
                <div className="space-y-3">
                  {MEMORIES.map(m => (
                    <DetailCard
                      key={m.id}
                      title={m.key}
                      badge={m.date}
                      badgeColor="bg-slate-950 text-slate-400 border-slate-800"
                      icon={BrainCircuit}
                    >
                      <p className="text-xs text-slate-200 pt-1 font-medium">{m.value}</p>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Rapports d'Activité & Synthèses"
                subtitle="Résumés exécutifs générés automatiquement par l'IA"
                icon={FileText}
                badge="2 Nouveaux"
              >
                <div className="space-y-3">
                  {REPORTS.map(r => (
                    <DetailCard
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      isInteractive
                      title={r.title}
                      badge={r.readTime}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={FileText}
                      subtitle={r.date}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{r.summary}</p>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Report Detail */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Synthèse Stratégique</span>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedReport.title}</h3>
                <div className="text-xs text-slate-400">{selectedReport.date} • Lecture : {selectedReport.readTime}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Contenu Analytique</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedReport.summary}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
