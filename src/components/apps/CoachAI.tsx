import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Award,
  Download,
  Copy,
  Plus,
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  RefreshCw,
  Share2,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Bookmark,
  Target,
  DollarSign
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import DetailSection, { DetailCard, AIInsightCard, KPIItem } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  tokens?: number;
  domain?: string;
}

interface StrategicSuggestion {
  id: string;
  title: string;
  desc: string;
  impact: string;
  cat: 'Finance' | 'Sales' | 'Tech' | 'Ops';
  timeGain: string;
  effort: 'Faible (< 2h)' | 'Moyen (1 jour)' | 'Important';
  confidence: string;
  roi: string;
  actionPlan: string[];
  rationale: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  desc: string;
  category: 'Stratégie' | 'Finance' | 'Ventes' | 'Tech' | 'RH';
  tokensEst: number;
  responseSpeed: string;
  detailLevel: 'Élevé' | 'Exécutif' | 'Technique';
  successRate: string;
  promptText: string;
  variables: string[];
  sampleOutput: string;
}

interface MemoryItem {
  id: string;
  key: string;
  value: string;
  date: string;
  category: string;
  priority: 'Haute' | 'Normale' | 'Basse';
  usageCount: number;
  linkedModules: string[];
}

interface ExecutiveReport {
  id: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  score: string;
  keyMetricsCount: number;
  compliance: string;
  fullContent: string;
  actionItems: string[];
}

const STRATEGIC_SUGGESTIONS: StrategicSuggestion[] = [
  { 
    id: 's1', 
    title: 'Optimisation Trésorerie Runway', 
    desc: 'Passer les souscriptions SaaS en facturation annuelle pour économiser $3,400/an et prolonger le runway.', 
    impact: '+$3.4k/an', 
    cat: 'Finance',
    timeGain: '4h/sem',
    effort: 'Faible (< 2h)',
    confidence: '98.5%',
    roi: '12x',
    actionPlan: [
      '1. Lister les 8 outils SaaS à reconduction mensuelle dans le module Finance.',
      '2. Négocier les remises annuelles moyennes de 20% auprès de AWS, Vercel et GitHub.',
      '3. Ajuster les flux de décaissements prévisionnels dans Mercury.'
    ],
    rationale: 'L\'analyse du cash-flow Q3 montre une trésorerie disponible de 18 mois, permettant de capter 20% de décote cash sans risque de liquidité.'
  },
  { 
    id: 's2', 
    title: 'Relance Leads Tier 1 Google Maps', 
    desc: '4 prospects locaux à fort panier moyen ont demandé un devis d\'intégration sans réponse depuis 48h.', 
    impact: 'Potentiel +$18k', 
    cat: 'Sales',
    timeGain: '6h/sem',
    effort: 'Faible (< 2h)',
    confidence: '94.2%',
    roi: '25x',
    actionPlan: [
      '1. Filtrer les 4 comptes dans le module Leads & CRM.',
      '2. Générer les propositions personnalisées via le template d\'offre PaaS Pro.',
      '3. Programmer les appels de closing sous 24h avec le template de négociation.'
    ],
    rationale: 'Le taux de closing des leads ultra-locaux chute de 60% après 72h sans contact initial.'
  },
  { 
    id: 's3', 
    title: 'Patch Conflit Ontologique', 
    desc: 'Appliquer la déduplication sur BillingAccount pour réduire les temps de requête SQL et la latence.', 
    impact: 'Latence -40ms', 
    cat: 'Tech',
    timeGain: '14h/sem',
    effort: 'Moyen (1 jour)',
    confidence: '99.0%',
    roi: 'Système',
    actionPlan: [
      '1. Exécuter le script `omk-sync --all` dans le Terminal.',
      '2. Valider l\'absence de collision de clés primaires sur le cluster Frankfurt.',
      '3. Purger le cache Redis L2 via le Dashboard.'
    ],
    rationale: '3 nœuds affichent des lectures redondantes de schémas entraînant 40ms de gigue sur les dashboards.'
  },
  { 
    id: 's4', 
    title: 'Automatisation Relances Factures Impayées', 
    desc: 'Activer le workflow de dunning intelligent pour récupérer $8,200 d\'échéances échues.', 
    impact: '+$8.2k Cash', 
    cat: 'Finance',
    timeGain: '5h/sem',
    effort: 'Faible (< 2h)',
    confidence: '96.8%',
    roi: '15x',
    actionPlan: [
      '1. Connecter le webhook Stripe Dunning dans Terminal/Variables.',
      '2. Activer la séquence de relance e-mail + SMS automatisée.',
      '3. Revalider les mandats SEPA/CB auprès des clients concernés.'
    ],
    rationale: 'Réduction de 85% du délai moyen de paiement constaté sur les comptes Tier 2.'
  },
  { 
    id: 's5', 
    title: 'Accélération Pipeline Apex Quantum Corp', 
    desc: 'Finaliser l\'avenant juridique BaaS LLC pour sécuriser le closing de $42,000 MRR.', 
    impact: '+$42k MRR', 
    cat: 'Sales',
    timeGain: '8h/sem',
    effort: 'Moyen (1 jour)',
    confidence: '97.4%',
    roi: '30x',
    actionPlan: [
      '1. Valider la clause de juridiction Wyoming dans Legal OS.',
      '2. Transmettre le bon de commande signé au CTO d\'Apex Corp.',
      '3. Provisionner le cluster cloud dédié sur AWS Frankfurt.'
    ],
    rationale: 'Le compte Apex Corp représente un bond de 34% du MRR total du workspace.'
  }
];

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt1',
    title: 'Audit de Résilience Financière & Runway',
    desc: 'Analyse exhaustive de la structure de coûts, seuil de rentabilité et scénarios de trésorerie.',
    category: 'Finance',
    tokensEst: 320,
    responseSpeed: 'Rapide (~1.2s)',
    detailLevel: 'Exécutif',
    successRate: '99.5%',
    promptText: 'Agis en tant que Directeur Financier (CFO) chevronné. Analyse les métriques financières actuelles du workspace (MRR, charges mensuelles, trésorerie disponible) et produis : 1) Un calcul exact du Runway, 2) Trois leviers concrets pour réduire le burn rate de 15%, 3) Un scénario de stress-test à -20% de chiffre d\'affaires.',
    variables: ['MRR_Actuel', 'Burn_Rate_Mensuel', 'Tresorerie_Banque'],
    sampleOutput: '✔ Runway estimé : 18.4 mois\n✔ Levier 1 : Négociation annuelle cloud (-$3.4k/an)\n✔ Levier 2 : Optimisation des passerelles de paiement Stripe (-0.4% fees)\n✔ Résultat du stress-test : Runway maintenu à 14.8 mois sans levée requise.'
  },
  {
    id: 'pt2',
    title: 'Négociation Grand Compte & Closing B2B',
    desc: 'Structure d\'argumentaire commercial, traitement des objections tarifaires et clauses SLA.',
    category: 'Ventes',
    tokensEst: 450,
    responseSpeed: 'Standard (~1.8s)',
    detailLevel: 'Élevé',
    successRate: '98.8%',
    promptText: 'Agis en tant que Head of Sales Enterprise. Rédige un e-mail de closing pour un prospect Grand Compte qui hésite sur le tarif d\'intégration : 1) Rapprochement de la valeur ROI ($42k MRR pour 300% de gain de productivité), 2) Proposition d\'une garantie SLA 99.99% Or, 3) Appel à l\'action clair pour signature avant vendredi.',
    variables: ['Nom_Client', 'Montant_Devis', 'Delai_Signature'],
    sampleOutput: 'Objet : Proposition de partenariat technologique & Garantie SLA Or\n\nBonjour [Nom],\nSuite à nos échanges, nous avons consolidé notre engagement de niveau de service...'
  },
  {
    id: 'pt3',
    title: 'Briefing Exécutif pour le Board',
    desc: 'Synthèse d\'orientation stratégique à destination des investisseurs et du comité de direction.',
    category: 'Stratégie',
    tokensEst: 510,
    responseSpeed: 'Standard (~2.0s)',
    detailLevel: 'Exécutif',
    successRate: '99.8%',
    promptText: 'Agis en tant que Chief of Staff. Rédige une note de synthèse exécutive de 3 paragraphes résumant les performances du sprint S34 : 1) Croissance du MRR et closing majeurs, 2) État d\'avancement technique et gouvernance multi-agents, 3) Objectifs prioritaires pour le mois suivant.',
    variables: ['Sprint_ID', 'MRR_Total', 'Objectif_Mois_Suivant'],
    sampleOutput: 'Note Exécutive Sprint S34 :\n1. Croissance & MRR : Le MRR consolidé atteint $86.9k (+6.3% sur 7 jours)...\n2. Stabilité Plateforme : 0 incident critique, latence stabilisée sous 15ms...'
  },
  {
    id: 'pt4',
    title: 'Revue d\'Architecture & Scalabilité Cloud',
    desc: 'Diagnostic de charge, découplage des microservices et résilience des connecteurs MCP.',
    category: 'Tech',
    tokensEst: 380,
    responseSpeed: 'Rapide (~1.4s)',
    detailLevel: 'Technique',
    successRate: '99.0%',
    promptText: 'Agis en tant que Lead Architect Cloud. Évalue l\'architecture actuelle à haute concurrence : 1) Analyse des goulets d\'étranglement potentiels sur les serveurs MCP, 2) Stratégie de mise en cache multi-niveaux (L1 Mémoire / L2 Redis), 3) Plan de reprise d\'activité (PRA) avec bascule DNS.',
    variables: ['Cluster_Region', 'Nombre_Requetes_Sec', 'Moteur_DB'],
    sampleOutput: 'Diagnostic Architectural :\n• Recommandation Cache : Passer en TTL 120s sur les entités d\'ontologie statiques.\n• Haute Disponibilité : Activer la réplication asynchrone multi-région.'
  },
  {
    id: 'pt5',
    title: 'Plan de Performance & Objectifs Trimestriels (OKR)',
    desc: 'Définition d\'objectifs et résultats clés mesurables pour les équipes Tech, Produit et Ventes.',
    category: 'RH',
    tokensEst: 420,
    responseSpeed: 'Standard (~1.6s)',
    detailLevel: 'Élevé',
    successRate: '98.5%',
    promptText: 'Agis en tant que VP People & Operations. Définis 3 OKRs ambitieux mais atteignables pour le Q4 2026 : 1) Objectif Revenu & Rétention, 2) Objectif Vélocité Produit & Qualité, 3) Objectif Efficacité Opérationnelle et Automatisation.',
    variables: ['Trimestre_Cible', 'Effectif_Equipe', 'Cible_MRR'],
    sampleOutput: 'OKR Q4 2026 :\n• Objective 1 : Dépasser $100k MRR avec < 1% de churn mensuel.\n• Objective 2 : Maintenir 99.99% d\'uptime sur l\'ensemble des nœuds de production.'
  }
];

const INITIAL_MEMORIES: MemoryItem[] = [
  { id: 'm1', key: 'Préférence Juridique', value: 'Toujours inclure une clause de juridiction Wyoming (BaaS LLC) dans tous les contrats clients.', date: '10 Août 2026', category: 'Juridique', priority: 'Haute', usageCount: 24, linkedModules: ['Legal', 'Clients'] },
  { id: 'm2', key: 'Objectif Q4 2026', value: 'Atteindre $100,000 de MRR consolidé avec un taux de marge nette supérieur à 35%.', date: '01 Août 2026', category: 'Stratégie', priority: 'Haute', usageCount: 42, linkedModules: ['Finance', 'Dashboard'] },
  { id: 'm3', key: 'Architecture Cible', value: 'Priorité aux serveurs MCP locaux avec protocole gRPC mTLS et fallback Gemini 2.5 Flash.', date: '15 Juillet 2026', category: 'Tech', priority: 'Haute', usageCount: 31, linkedModules: ['Terminal', 'Operations'] },
  { id: 'm4', key: 'Politique Recrutement', value: 'Priorité aux profils full-stack TypeScript / Rust avec expérience Zero-Trust.', date: '28 Juillet 2026', category: 'RH', priority: 'Normale', usageCount: 12, linkedModules: ['HR', 'JaaSJob'] },
  { id: 'm5', key: 'Seuil Alerte Trésorerie', value: 'Notifier immédiatement si le Runway passe sous le seuil de sécurité de 12 mois.', date: '05 Août 2026', category: 'Finance', priority: 'Haute', usageCount: 19, linkedModules: ['Finance', 'Dashboard'] }
];

const INITIAL_REPORTS: ExecutiveReport[] = [
  { 
    id: 'r1', 
    title: 'Briefing Hebdomadaire S34 — Direction', 
    date: '21 Août 2026', 
    readTime: '3 min', 
    summary: 'Hausse de 12% du MRR consolidé ($86.9k), 2 recrutements en phase finale, conformité fiscale et trésorerie validées.',
    score: '98/100',
    keyMetricsCount: 6,
    compliance: '100% Conforme',
    fullContent: '1. Synthèse Exécutive :\nLe sprint S34 marque une accélération significative sur les deals Enterprise. La signature imminente d\'Apex Quantum Corp ($42k MRR) consolide les projections Q4.\n\n2. Finances & Trésorerie :\nLe Runway se maintient à 18 mois avec un ratio de marge brute de 82%. Le burn rate net mensuel a diminué de 8% suite aux optimisations cloud.\n\n3. Technique & Infrastructure :\nDisponibilité nominale à 99.99%. Latence moyenne réseau observée : 14ms.',
    actionItems: [
      'Valider la signature du contrat Apex Corp sous 48h',
      'Clôturer les deux offres d\'embauche Lead Developer',
      'Activer le monitoring HPA sur les serveurs MCP'
    ]
  },
  { 
    id: 'r2', 
    title: 'Audit de Sécurité & Clés API Zero-Trust', 
    date: '14 Août 2026', 
    readTime: '2 min', 
    summary: '0 fuite détectée, rotation automatique des 5 tokens système effectuée avec succès, conformité FIDO2 validée.',
    score: '100/100',
    keyMetricsCount: 5,
    compliance: 'A+ (SOC2 Ready)',
    fullContent: '1. Analyse des Clés et Secrets :\nToutes les clés d\'API externes (Gemini, Stripe, Mercury, Supabase) ont bénéficié de la rotation matérielle sans interruption de service.\n\n2. Sessions & Authentification :\nZero anomalie de connexion détectée. Les accès administrateurs sont tous soumis à l\'authentification Zero-Trust FIDO2.',
    actionItems: [
      'Programmer le prochain cycle de rotation des tokens dans 60 jours',
      'Maintenir la restriction IP stricte sur le cluster de base de données'
    ]
  },
  { 
    id: 'r3', 
    title: 'Bilan de Performance Commerciale Q3', 
    date: '08 Août 2026', 
    readTime: '4 min', 
    summary: 'Pipeline commercial à $184k de valeur pondérée, taux de conversion des démos à 38%, CAC stabilisé à $280.',
    score: '94/100',
    keyMetricsCount: 8,
    compliance: 'Conforme',
    fullContent: '1. Dynamique du Pipeline :\nLe taux de closing sur les offres PaaS Pro dépasse les prévisions initiales. Le cycle de vente moyen s\'établit à 14 jours.\n\n2. Efficacité Commerciale :\nLe coût d\'acquisition client (CAC) est de $280 pour une valeur à vie (LTV) estimée à $5,200 (Ratio LTV/CAC > 18x).',
    actionItems: [
      'Accroître l\'acquisition de leads qualifiés sur le secteur Cloud & IA',
      'Intégrer les démonstrations automatisées dans le tunnel de vente'
    ]
  }
];

const COACH_TABS = [
  { id: 'chat', label: 'Dialogue', icon: MessageSquare },
  { id: 'suggestions', label: 'Conseils', icon: Lightbulb, badge: STRATEGIC_SUGGESTIONS.length, badgeColor: 'bg-emerald-500 text-slate-950' },
  { id: 'templates', label: 'Prompts', icon: Sparkles, badge: PROMPT_TEMPLATES.length },
  { id: 'memory', label: 'Mémoire', icon: BrainCircuit, badge: INITIAL_MEMORIES.length },
  { id: 'reports', label: 'Rapports', icon: FileText, badge: INITIAL_REPORTS.length }
];

export default function CoachAI() {
  const { workspace } = useOSStore();
  const [activeTab, setActiveTab] = useState('chat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-coach',
      sender: 'coach',
      text: 'Bonjour ! Je suis votre Coach OS IA. Vos métriques de trésorerie sont optimales (Runway 18 mois) et 3 deals majeurs approchent de la clôture ($42k MRR avec Apex Corp). Comment puis-je vous guider dans vos décisions stratégiques ?',
      timestamp: '09:00',
      tokens: 42,
      domain: 'Direction'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Drawer states
  const [selectedSuggestion, setSelectedSuggestion] = useState<StrategicSuggestion | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<ExecutiveReport | null>(null);

  // Modifiable memory list
  const [memoriesList, setMemoriesList] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend !== undefined ? textToSend : input).trim();
    if (!raw) return;

    haptics.trigger('light');
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: raw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = `J'ai analysé votre demande sous l'angle de vos objectifs stratégiques Q4 ($100k MRR). Les données consolidées de vos modules Finance, Ventes et BaaS Hub confirment que votre plan est pertinent.`;
      
      const lower = raw.toLowerCase();
      if (lower.includes('trésorerie') || lower.includes('finance') || lower.includes('runway')) {
        replyText = `📊 **Analyse Trésorerie & Runway :**\n• Runway actuel : 18.4 mois\n• Recommandation : Valider la mensualisation annuelle (-$3,400/an)\n• Statut Cash : Excédentaire et prêt pour l'accélération commerciale.`;
      } else if (lower.includes('lead') || lower.includes('client') || lower.includes('deal') || lower.includes('apex')) {
        replyText = `💼 **Point Pipeline & Clients :**\n• Compte Apex Corp : Contrat de $42,000 MRR en phase finale de signature\n• 4 leads locaux Tier 1 identifiés pour closing sous 48h\n• Probabilité globale de closing ce mois-ci : 94.2%.`;
      } else if (lower.includes('audit') || lower.includes('sécurité') || lower.includes('tech')) {
        replyText = `🛡️ **Bilan Technique & Résilience :**\n• Score Sécurité : 100/100 (Zero-Trust)\n• Latence réseau : 14ms sur le nœud Frankfurt\n• Tous les processus daemons tournent sans collision.`;
      }

      const coachReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokens: Math.round(replyText.length / 3.5),
        domain: 'Stratégie'
      };

      setMessages(prev => [...prev, coachReply]);
      setIsTyping(false);
      haptics.trigger('success');
    }, 600);
  };

  const handleExportChat = () => {
    haptics.trigger('selection');
    try {
      let transcript = `# Dialogue Exécutif — Coach AI (${workspace})\n`;
      transcript += `*Date : ${new Date().toLocaleString('fr-FR')}*\n\n---\n\n`;

      messages.forEach(m => {
        transcript += `**[${m.timestamp}] ${m.sender === 'user' ? 'Directeur Général' : 'Coach OS IA'} :**\n${m.text}\n\n`;
      });

      const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omk-coach-chat-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Transcription du chat exportée en Markdown');
    } catch {
      showToast('Erreur lors de l\'export');
    }
  };

  const handleInjectTemplateToChat = (template: PromptTemplate) => {
    haptics.trigger('selection');
    setSelectedTemplate(null);
    setActiveTab('chat');
    setInput(template.promptText);
    showToast(`Template "${template.title}" inséré dans le chat`);
  };

  const handleInjectSuggestionToChat = (suggestion: StrategicSuggestion) => {
    haptics.trigger('selection');
    setSelectedSuggestion(null);
    setActiveTab('chat');
    const prompt = `Analysons en détail le conseil suivant : "${suggestion.title}". ${suggestion.desc} Quel est le plan d'action immédiat pour maximiser l'impact de ${suggestion.impact} ?`;
    handleSend(prompt);
  };

  const handleDeleteMemory = (memoryId: string) => {
    haptics.trigger('warning');
    setMemoriesList(prev => prev.filter(m => m.id !== memoryId));
    if (selectedMemory?.id === memoryId) {
      setSelectedMemory(null);
    }
    showToast('Fait retiré de la mémoire à long terme');
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
              className="h-full flex flex-col p-3 sm:p-4 space-y-2.5"
            >
              {/* Telemetry & Quick Header */}
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Bot size={13} />
                  <span>Gemini 2.5 Flash • Context 1M</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportChat}
                    className="p-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors text-[10px]"
                  >
                    <Download size={11} />
                    <span>Exporter</span>
                  </button>

                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setMessages([]);
                      showToast('Conversation réinitialisée');
                    }}
                    className="p-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors text-[10px]"
                  >
                    <Trash2 size={11} />
                    <span>Effacer</span>
                  </button>
                </div>
              </div>

              {/* Quick Prompts Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
                {[
                  'Analyse trésorerie & Runway',
                  'Closing Apex Corp $42k',
                  'Audit sécurité Zero-Trust',
                  'Objectifs Q4 $100k MRR'
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <Sparkles size={10} className="text-emerald-400" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md theme-transition ${
                        m.sender === 'user'
                          ? 'bg-emerald-500 text-slate-950 font-semibold'
                          : 'bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-slate-200'
                      }`}
                    >
                      {m.sender === 'coach' && (
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800/80 text-emerald-400 font-semibold text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <Bot size={13} />
                            <span>Coach OS IA • Diagnostic</span>
                          </div>
                          {m.tokens && <span className="text-slate-500 font-mono">{m.tokens} tok</span>}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div className={`text-[9px] mt-1.5 text-right font-mono ${m.sender === 'user' ? 'text-slate-950/70' : 'text-slate-500'}`}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <Bot size={13} className="text-emerald-400 animate-spin" />
                      <span>Coach AI analyse les métriques de votre workspace...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="pt-2 border-t border-slate-800/80 flex items-center gap-2 bg-slate-950/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-800/60"
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
                  className="p-2.5 bg-emerald-500 disabled:opacity-40 hover:bg-emerald-400 rounded-xl text-slate-950 font-bold transition-all shadow-md active:scale-95"
                >
                  <Send size={13} />
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 2: STRATEGIC SUGGESTIONS */}
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
                subtitle="Recommandations d'optimisation générées en continu à partir des données réelles"
                badge={`${STRATEGIC_SUGGESTIONS.length} Opportunités`}
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                icon={Lightbulb}
                kpis={[
                  { label: 'Impact Cumulé', value: '+$67.0k', sub: 'Sur le trimestre', trend: 'up' },
                  { label: 'Gain de Temps', value: '37h/sem', sub: 'Automatisations' },
                  { label: 'Score Alignement', value: '98.5%', sub: 'Vision Business' }
                ]}
              >
                <div className="space-y-3">
                  {STRATEGIC_SUGGESTIONS.map(s => (
                    <DetailCard
                      key={s.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedSuggestion(s);
                      }}
                      isInteractive
                      title={s.title}
                      badge={s.impact}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={Lightbulb}
                      subtitle={`Domaine : ${s.cat} • Gain : ${s.timeGain}`}
                      actions={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInjectSuggestionToChat(s);
                          }}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare size={11} /> Discuter
                        </button>
                      }
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{s.desc}</p>
                      <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                        <span>Effort : <strong className="text-slate-200">{s.effort}</strong></span>
                        <span className="text-emerald-400 font-medium">Plan d'action & ROI →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: PROMPT TEMPLATES GALLERY */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Catalogue de Prompts Experts"
                subtitle="Modèles de cadrage exécutif pour piloter votre entreprise au plus haut niveau"
                icon={Sparkles}
                badge={`${PROMPT_TEMPLATES.length} Templates`}
                kpis={[
                  { label: 'Prompts Prêts', value: PROMPT_TEMPLATES.length, sub: 'Prêts à l\'emploi' },
                  { label: 'Taux Succès', value: '99.2%', sub: 'Qualité réponses', trend: 'up' },
                  { label: 'Temps Moyen', value: '1.6s', sub: 'Latence IA' }
                ]}
              >
                <div className="space-y-3">
                  {PROMPT_TEMPLATES.map(pt => (
                    <DetailCard
                      key={pt.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedTemplate(pt);
                      }}
                      isInteractive
                      title={pt.title}
                      badge={pt.category}
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-semibold"
                      icon={Sparkles}
                      subtitle={`Détail : ${pt.detailLevel} • Vitesse : ${pt.responseSpeed}`}
                      actions={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInjectTemplateToChat(pt);
                          }}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-1 transition-colors"
                        >
                          <Send size={11} /> Utiliser
                        </button>
                      }
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{pt.desc}</p>
                      <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                        <span>Poids : <strong className="text-slate-200">~{pt.tokensEst} tokens</strong></span>
                        <span className="text-emerald-400 font-medium">Inspecter template →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: LONG-TERM MEMORY */}
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
                subtitle="Faits, contraintes réglementaires et objectifs mémorisés pour contextualiser les réponses"
                icon={BrainCircuit}
                badge={`${memoriesList.length} Faits`}
                kpis={[
                  { label: 'Faits Mémorisés', value: memoriesList.length, sub: 'Graphe sémantique' },
                  { label: 'Utilisations', value: memoriesList.reduce((a, b) => a + b.usageCount, 0), sub: 'Injections prompt' },
                  { label: 'Précision', value: '100%', sub: 'Cohérence' }
                ]}
              >
                <div className="space-y-3">
                  {memoriesList.map(m => (
                    <DetailCard
                      key={m.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedMemory(m);
                      }}
                      isInteractive
                      title={m.key}
                      badge={m.priority}
                      badgeColor={m.priority === 'Haute' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
                      icon={BrainCircuit}
                      subtitle={`Capturé le ${m.date} • ${m.usageCount} utilisations`}
                    >
                      <p className="text-xs text-slate-200 pt-1 font-medium leading-relaxed">{m.value}</p>
                      <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                        <span>Modules liés : {m.linkedModules.join(', ')}</span>
                        <span className="text-emerald-400 font-medium">Inspecter mémoire →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 5: EXECUTIVE REPORTS */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Rapports d'Activité & Synthèses Exécutives"
                subtitle="Résumés de gouvernance générés automatiquement pour le Conseil d'Administration"
                icon={FileText}
                badge={`${INITIAL_REPORTS.length} Rapports`}
                kpis={[
                  { label: 'Rapports Prêts', value: INITIAL_REPORTS.length, sub: 'Synthèses consolidées' },
                  { label: 'Score Moyen', value: '97.3/100', sub: 'Conformité gouvernance', trend: 'up' },
                  { label: 'Lecture Moy.', value: '3 min', sub: 'Format concis' }
                ]}
              >
                <div className="space-y-3">
                  {INITIAL_REPORTS.map(r => (
                    <DetailCard
                      key={r.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedReport(r);
                      }}
                      isInteractive
                      title={r.title}
                      badge={r.score}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={FileText}
                      subtitle={`${r.date} • Lecture : ${r.readTime}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{r.summary}</p>
                      <div className="flex justify-between items-center pt-2.5 text-[11px] text-slate-400">
                        <span>Conformité : <strong className="text-emerald-400">{r.compliance}</strong></span>
                        <span className="text-emerald-400 font-medium">Lire rapport complet →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAIL DRAWER FOR STRATEGIC SUGGESTION */}
      <DetailDrawer
        isOpen={!!selectedSuggestion}
        onClose={() => setSelectedSuggestion(null)}
        title={selectedSuggestion?.title || ''}
        subtitle={`Domaine : ${selectedSuggestion?.cat} • Impact estimé : ${selectedSuggestion?.impact}`}
        badge={selectedSuggestion?.effort || 'Faible'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
        avatarText={selectedSuggestion?.title?.charAt(0) || 'C'}
        breadcrumbs={[
          { label: 'Coach AI', onClick: () => setSelectedSuggestion(null) },
          { label: 'Conseils', onClick: () => setSelectedSuggestion(null) },
          { label: selectedSuggestion?.title || 'Conseil' }
        ]}
        actions={[
          {
            id: 'apply-sug',
            label: 'Appliquer Recommandation',
            icon: Zap,
            variant: 'primary',
            onClick: () => {
              if (selectedSuggestion) {
                haptics.trigger('success');
                showToast(`Recommandation "${selectedSuggestion.title}" planifiée`);
                setSelectedSuggestion(null);
              }
            }
          },
          {
            id: 'discuss-sug',
            label: 'Discuter dans le Chat',
            icon: MessageSquare,
            onClick: () => {
              if (selectedSuggestion) handleInjectSuggestionToChat(selectedSuggestion);
            }
          }
        ]}
        kpis={[
          { label: 'Impact Estimé', value: selectedSuggestion?.impact || '+$0', sub: 'Revenu / Économie', trend: 'up' },
          { label: 'Gain de Temps', value: selectedSuggestion?.timeGain || '0h/sem', sub: 'Temps récupéré' },
          { label: 'Retour s/ Invest.', value: selectedSuggestion?.roi || '10x', sub: 'Multiplicateur' },
          { label: 'Confiance IA', value: selectedSuggestion?.confidence || '95%', sub: 'Précision modèle' }
        ]}
        aiInsight={{
          title: 'Analyse Prédictive & Justification',
          content: selectedSuggestion?.rationale || '',
          actionLabel: 'Lancer simulation d\'impact',
          onAction: () => showToast('Simulation complétée : ROI confirmé à +12x')
        }}
        tabs={[
          {
            id: 'plan',
            label: 'Plan d\'Action',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Étapes d'exécution recommandées</div>
                  <div className="space-y-2">
                    {selectedSuggestion?.actionPlan.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DETAIL DRAWER FOR PROMPT TEMPLATE */}
      <DetailDrawer
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.title || ''}
        subtitle={`${selectedTemplate?.desc}`}
        badge={selectedTemplate?.category || 'Prompt'}
        badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-semibold"
        avatarText={selectedTemplate?.title?.charAt(0) || 'P'}
        breadcrumbs={[
          { label: 'Coach AI', onClick: () => setSelectedTemplate(null) },
          { label: 'Prompts', onClick: () => setSelectedTemplate(null) },
          { label: selectedTemplate?.title || 'Template' }
        ]}
        actions={[
          {
            id: 'use-template',
            label: 'Injecter dans le Chat',
            icon: Send,
            variant: 'primary',
            onClick: () => {
              if (selectedTemplate) handleInjectTemplateToChat(selectedTemplate);
            }
          },
          {
            id: 'copy-template',
            label: 'Copier Prompt',
            icon: Copy,
            onClick: () => {
              if (selectedTemplate) {
                haptics.trigger('selection');
                navigator.clipboard.writeText(selectedTemplate.promptText);
                showToast('Texte du prompt copié');
              }
            }
          }
        ]}
        kpis={[
          { label: 'Longueur Tokens', value: `~${selectedTemplate?.tokensEst}`, sub: 'Poids du contexte' },
          { label: 'Vitesse Réponse', value: selectedTemplate?.responseSpeed || 'Rapide', sub: 'Latence d\'inférence' },
          { label: 'Niveau Détail', value: selectedTemplate?.detailLevel || 'Exécutif', sub: 'Structure de sortie' },
          { label: 'Taux Réussite', value: selectedTemplate?.successRate || '99%', sub: 'Score de conformité', trend: 'up' }
        ]}
        aiInsight={{
          title: 'Conseil de Personnalisation',
          content: `Ce prompt utilise les variables [${selectedTemplate?.variables.join(', ')}]. Le Coach OS complétera automatiquement ces champs à partir de vos données réelles.`,
          actionLabel: 'Pré-remplir les variables avec mes données',
          onAction: () => {
            if (selectedTemplate) handleInjectTemplateToChat(selectedTemplate);
          }
        }}
        tabs={[
          {
            id: 'prompt-text',
            label: 'Texte du Prompt',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Prompt Système Configuré</div>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedTemplate?.promptText}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Exemple de Sortie Générée</div>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedTemplate?.sampleOutput}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DETAIL DRAWER FOR MEMORY ITEM */}
      <DetailDrawer
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        title={selectedMemory?.key || ''}
        subtitle={`Catégorie : ${selectedMemory?.category} • Capturé le ${selectedMemory?.date}`}
        badge={selectedMemory?.priority || 'Normale'}
        badgeColor={selectedMemory?.priority === 'Haute' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
        avatarText={selectedMemory?.key?.charAt(0) || 'M'}
        breadcrumbs={[
          { label: 'Coach AI', onClick: () => setSelectedMemory(null) },
          { label: 'Mémoire', onClick: () => setSelectedMemory(null) },
          { label: selectedMemory?.key || 'Fait' }
        ]}
        actions={[
          {
            id: 'copy-mem',
            label: 'Copier',
            icon: Copy,
            onClick: () => {
              if (selectedMemory) {
                haptics.trigger('selection');
                navigator.clipboard.writeText(`${selectedMemory.key} : ${selectedMemory.value}`);
                showToast('Fait copié');
              }
            }
          },
          {
            id: 'delete-mem',
            label: 'Oublier Fait',
            icon: Trash2,
            variant: 'danger',
            onClick: () => {
              if (selectedMemory) handleDeleteMemory(selectedMemory.id);
            }
          }
        ]}
        kpis={[
          { label: 'Priorité', value: selectedMemory?.priority || 'Normale', sub: 'Poids dans le prompt' },
          { label: 'Utilisations', value: selectedMemory?.usageCount || 0, sub: 'Injections récentes' },
          { label: 'Modules Liés', value: selectedMemory?.linkedModules.length || 0, sub: 'Connexions actives' },
          { label: 'Date d\'ajout', value: selectedMemory?.date || '', sub: 'Historique' }
        ]}
        tabs={[
          {
            id: 'mem-val',
            label: 'Détail du Fait Mémorisé',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Contenu Sémantique Retenu</div>
                  <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-100 font-medium leading-relaxed border border-slate-800">
                    {selectedMemory?.value}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DETAIL DRAWER FOR EXECUTIVE REPORT */}
      <DetailDrawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.title || ''}
        subtitle={`${selectedReport?.date} • Score de gouvernance : ${selectedReport?.score}`}
        badge={selectedReport?.compliance || 'Conforme'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="R"
        breadcrumbs={[
          { label: 'Coach AI', onClick: () => setSelectedReport(null) },
          { label: 'Rapports', onClick: () => setSelectedReport(null) },
          { label: selectedReport?.title || 'Rapport' }
        ]}
        actions={[
          {
            id: 'export-report',
            label: 'Télécharger Rapport',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              if (selectedReport) {
                haptics.trigger('selection');
                const blob = new Blob([`# ${selectedReport.title}\n\n${selectedReport.summary}\n\n${selectedReport.fullContent}`], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedReport.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.md`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Rapport téléchargé en Markdown');
              }
            }
          },
          {
            id: 'share-board',
            label: 'Transmettre au Board',
            icon: Share2,
            onClick: () => {
              haptics.trigger('success');
              showToast('Rapport envoyé aux membres du Conseil d\'Administration');
            }
          }
        ]}
        kpis={[
          { label: 'Score Exécutif', value: selectedReport?.score || '98/100', sub: 'Audit gouvernance', trend: 'up' },
          { label: 'Temps Lecture', value: selectedReport?.readTime || '3 min', sub: 'Format concis' },
          { label: 'Indicateurs Clés', value: selectedReport?.keyMetricsCount || 6, sub: 'Métriques auditées' },
          { label: 'Conformité', value: selectedReport?.compliance || 'Conforme', sub: 'Zero anomalie' }
        ]}
        tabs={[
          {
            id: 'report-content',
            label: 'Synthèse Intégrale',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Contenu Analytique du Rapport</div>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedReport?.fullContent}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Actions Découlantes Immédiates</div>
                  <div className="space-y-1.5">
                    {selectedReport?.actionItems.map((act, i) => (
                      <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                        <Check size={12} className="text-emerald-400 shrink-0" />
                        <span className="text-slate-200">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
