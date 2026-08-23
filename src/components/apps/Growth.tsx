import React, { useState } from 'react';
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
  Layers,
  CheckCircle2,
  Filter,
  BarChart3,
  Sliders,
  ExternalLink,
  Plus,
  Play,
  Pause,
  Copy,
  RefreshCw,
  Zap,
  Globe,
  Share2,
  Download,
  Flame,
  ArrowDownRight,
  MousePointerClick,
  Eye,
  Percent,
  Compass,
  Link,
  ShieldCheck,
  Check
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

interface FunnelStep {
  id: string;
  stageNumber: number;
  name: string;
  category: string;
  volume: string;
  rawVolume: number;
  conversionRate: string;
  dropOffRate: string;
  marginalCac: string;
  avgTimeOnStep: string;
  description: string;
  frictionPoints: string[];
  activeExperiments: string[];
  optimizationLevers: { label: string; impact: string; active: boolean }[];
}

interface CampaignItem {
  id: string;
  name: string;
  platform: string;
  budget: string;
  rawBudget: number;
  roas: string;
  spend: string;
  rawSpend: number;
  conversions: number;
  cpa: string;
  ctr: string;
  status: 'Actif' | 'En pause';
  headline: string;
  copy: string;
  targetAudience: string;
  geoTarget: string;
  format: string;
  impressions: string;
  clicks: string;
}

interface KeywordItem {
  id: string;
  word: string;
  rank: string;
  volume: string;
  change: string;
  kd: number;
  da: number;
  monthlyClicks: string;
  intent: 'Transactionnel' | 'Commercial' | 'Informationnel';
  targetUrl: string;
  referringDomains: number;
  toxicityScore: string;
  competitors: { name: string; position: string }[];
  history: { month: string; position: number }[];
}

interface ABTestItem {
  id: string;
  name: string;
  sample: string;
  winner: string;
  status: 'Actif' | 'Terminé';
  confidence: string;
  rollout: number;
  hypothesis: string;
  targetMetric: string;
  controlRate: string;
  variantRate: string;
  uplift: string;
}

const INITIAL_FUNNEL_STEPS: FunnelStep[] = [
  {
    id: 'f1',
    stageNumber: 1,
    name: 'Visiteurs Uniques & Trafic Global',
    category: 'Top of Funnel (TOFU)',
    volume: '38,400 visites',
    rawVolume: 38400,
    conversionRate: '100%',
    dropOffRate: '0%',
    marginalCac: '€0.85',
    avgTimeOnStep: '2m 15s',
    description: 'Ensemble des sessions web issues du SEO organique, des campagnes publicitaires sponsorisées et de la viralité réseau.',
    frictionPoints: [
      'Temps de chargement initial mobile (LCP à 1.4s, optimisable à 0.8s)',
      'Décrochage sur le premier viewport sans scroll sur desktop'
    ],
    activeExperiments: [
      'Test Hero Headline ultra-ciblée SaaS & AI Back-Office',
      'Préchargement optimisé des polices et assets Tailwind'
    ],
    optimizationLevers: [
      { label: 'Accélération CDN Edge Cloudflare', impact: '+6% rétention', active: true },
      { label: 'Affichage immédiat de la démo interactive sandbox', impact: '+14% engagement', active: true },
      { label: 'Bandeau preuve sociale "Utilisé par 500+ agences"', impact: '+8% clic', active: false }
    ]
  },
  {
    id: 'f2',
    stageNumber: 2,
    name: 'Leads Qualifiés Inbound & MQLs',
    category: 'Middle of Funnel (MOFU)',
    volume: '1,420 leads MQL',
    rawVolume: 1420,
    conversionRate: '3.70%',
    dropOffRate: '96.30%',
    marginalCac: '€18.20',
    avgTimeOnStep: '4m 30s',
    description: 'Visiteurs ayant soumis leur email professionnel, téléchargé une documentation technique ou démarré un sandbox.',
    frictionPoints: [
      'Formulaire de contact avec trop de champs obligatoires',
      'Absence d\'authentification en 1-clic Google OAuth / GitHub'
    ],
    activeExperiments: [
      'Suppression du numéro de téléphone requis dans l\'onboarding',
      'Ajout du bouton d\'authentification OAuth GitHub / Google'
    ],
    optimizationLevers: [
      { label: 'Inscription simplifiée en 1 clic (Magic Link)', impact: '+22% leads', active: true },
      { label: 'Lead magnet : Livre blanc Architecture BaaS 2026', impact: '+12% téléchargements', active: true },
      { label: 'Widget chatbot IA de qualification instantanée', impact: '+19% conversion', active: false }
    ]
  },
  {
    id: 'f3',
    stageNumber: 3,
    name: 'Activations Sandbox & Essais Libres',
    category: 'Product-Led Growth (PLG)',
    volume: '420 espaces actifs',
    rawVolume: 420,
    conversionRate: '29.58%',
    dropOffRate: '70.42%',
    marginalCac: '€42.50',
    avgTimeOnStep: '18m 45s',
    description: 'Utilisateurs ayant instancié au moins un micro-service ou connecté leur premier agent MCP dans l\'interface.',
    frictionPoints: [
      'Configuration initiale de l\'API Key jugée technique pour les profils non-dev',
      'Manque de templates préconfigurés (CRM, Stripe, Supabase)'
    ],
    activeExperiments: [
      'Wizard d\'intégration avec 4 templates prédéfinis 1-clic',
      'Assistance interactive pas-à-pas guidée par Coach AI'
    ],
    optimizationLevers: [
      { label: 'Template 1-clic BaaS Prêt à l\'emploi', impact: '+35% activation', active: true },
      { label: 'Guide interactif interactif avec félicitations haptiques', impact: '+15% complétion', active: true },
      { label: 'Email automatique J+1 avec vidéo tutoriel 90s', impact: '+9% réactivation', active: false }
    ]
  },
  {
    id: 'f4',
    stageNumber: 4,
    name: 'Opportunités SQL & Démos Planifiées',
    category: 'Sales Qualified Leads (SQL)',
    volume: '114 démos & SQLs',
    rawVolume: 114,
    conversionRate: '27.14%',
    dropOffRate: '72.86%',
    marginalCac: '€84.00',
    avgTimeOnStep: '3 jours',
    description: 'Prospects entreprise ayant validé leur budget, besoin technique et réservé un créneau avec l\'équipe Account Executive.',
    frictionPoints: [
      'Créneaux de démonstration trop éloignés (> 48h)',
      'Questionnaire pré-démo parfois redondant avec les données sandbox'
    ],
    activeExperiments: [
      'Routage intelligent Cal.com avec matching timezone automatique',
      'Pré-remplissage automatique des slides démo avec l\'ARR du prospect'
    ],
    optimizationLevers: [
      { label: 'Prise de RDV instantanée post-activation sandbox', impact: '+28% démos', active: true },
      { label: 'Rappel SMS/WhatsApp H-2 avant la visioconférence', impact: '-40% no-shows', active: true },
      { label: 'Accès VIP immédiat au Discord Enterprise OMK', impact: '+11% closing', active: false }
    ]
  },
  {
    id: 'f5',
    stageNumber: 5,
    name: 'Clients Signés & Souscriptions ARR',
    category: 'Closing & Contrats Signés',
    volume: '38 contrats signés',
    rawVolume: 38,
    conversionRate: '33.33%',
    dropOffRate: '66.67%',
    marginalCac: '€28.40',
    avgTimeOnStep: '12 jours',
    description: 'Souscriptions payantes transformées en abonnements annuels récurrents (BaaS Hub Enterprise & PaaS Pro).',
    frictionPoints: [
      'Délai de validation du service juridique / conformité RGPD client',
      'Facturation mensuelle vs annuelle avec escompte'
    ],
    activeExperiments: [
      'Mise à disposition du pack de conformité RGPD / SOC2 téléchargeable',
      'Offre 2 mois offerts sur engagement 12 mois affichée par défaut'
    ],
    optimizationLevers: [
      { label: 'Signature électronique DocuSign intégrée in-app', impact: '-60% délai signature', active: true },
      { label: 'Paiement Stripe SEPA Entreprise sans friction', impact: '+18% cash-in', active: true },
      { label: 'Onboarding CSM dédié offert pour tout contrat > €10k', impact: '+25% expansion', active: true }
    ]
  }
];

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  { 
    id: 'c1', 
    name: 'Google Search - Agency Automation & AI OS', 
    platform: 'Google Ads Search',
    budget: '€1,200', 
    rawBudget: 1200, 
    roas: '4.2x', 
    spend: '€840', 
    rawSpend: 840, 
    conversions: 38, 
    cpa: '€22.10', 
    ctr: '4.8%',
    status: 'Actif',
    headline: 'OMK Mobile Back-Office | L\'OS Tout-en-Un pour Agences IA',
    copy: 'Déployez des bacs à sable clients, automatisez votre facturation et pilotez votre flotte d\'agents MCP en temps réel.',
    targetAudience: 'Directeurs d\'Agence, CTOs SaaS, Fondateurs Tech (25-55 ans)',
    geoTarget: 'France, Belgique, Suisse, Luxembourg',
    format: 'Responsive Search Ads (RSA)',
    impressions: '17,500',
    clicks: '840'
  },
  { 
    id: 'c2', 
    name: 'LinkedIn Ads - Enterprise Decision Makers', 
    platform: 'LinkedIn Campaign Manager',
    budget: '€2,500', 
    rawBudget: 2500, 
    roas: '3.1x', 
    spend: '€1,850', 
    rawSpend: 1850, 
    conversions: 24, 
    cpa: '€77.08', 
    ctr: '2.3%',
    status: 'Actif',
    headline: 'Modernisez vos Opérations Back-Office avec l\'Architecture MCP',
    copy: 'Gouvernance, isolation multi-tenant et monitoring temps réel pour DSI et Directions des Opérations exigeantes.',
    targetAudience: 'Titres : VP Engineering, Head of IT, DSI, Chief Operations Officer',
    geoTarget: 'France, Royaume-Uni, Allemagne, États-Unis',
    format: 'Single Image Sponsored Content + Document Ad',
    impressions: '42,000',
    clicks: '966'
  },
  { 
    id: 'c3', 
    name: 'Meta Retargeting - Landing Page Visitors & Sandbox', 
    platform: 'Meta Ads (Facebook & Instagram)',
    budget: '€600', 
    rawBudget: 600, 
    roas: '5.8x', 
    spend: '€420', 
    rawSpend: 420, 
    conversions: 52, 
    cpa: '€8.07', 
    ctr: '6.2%',
    status: 'Actif',
    headline: 'Reprenez là où vous en étiez : Votre Sandbox OMK vous attend',
    copy: 'Activez vos 14 jours d\'essai sans carte bancaire et testez la puissance de nos micro-services scalables.',
    targetAudience: 'Visiteurs web 14 jours (Pixel custom audience) sans conversion',
    geoTarget: 'Europe de l\'Ouest & Amérique du Nord',
    format: 'Carousel Video Ads (Story & Feed)',
    impressions: '28,400',
    clicks: '1,760'
  },
  { 
    id: 'c4', 
    name: 'X Ads Tech Devs - BaaS Cloud Runtime & Rust', 
    platform: 'X (Twitter) Ads',
    budget: '€800', 
    rawBudget: 800, 
    roas: '3.7x', 
    spend: '€510', 
    rawSpend: 510, 
    conversions: 29, 
    cpa: '€17.58', 
    ctr: '3.9%',
    status: 'Actif',
    headline: 'High-Performance Rust Runtime for Enterprise Autonomous Agents',
    copy: 'Lightning-fast micro-services, sub-millisecond execution and seamless TypeScript/Rust SDK integration.',
    targetAudience: 'Followers of @rustlang, @typescript, @docker, @huggingface',
    geoTarget: 'Worldwide (Tech Hubs)',
    format: 'Promoted Tweet with Media Card',
    impressions: '31,200',
    clicks: '1,216'
  }
];

const INITIAL_KEYWORDS: KeywordItem[] = [
  { 
    id: 'kw1', 
    word: 'Solution BaaS LLC USA', 
    rank: '#1', 
    volume: '1.2k / mois', 
    change: '+2 rangs', 
    kd: 24, 
    da: 68, 
    monthlyClicks: '480 clics/m',
    intent: 'Transactionnel',
    targetUrl: 'https://omk.corp/solutions/baas-hub-usa',
    referringDomains: 42,
    toxicityScore: '0% (Sain)',
    competitors: [
      { name: 'Firstbase.io', position: '#2' },
      { name: 'Stripe Atlas', position: '#3' }
    ],
    history: [
      { month: 'Avr', position: 6 },
      { month: 'Mai', position: 4 },
      { month: 'Juin', position: 3 },
      { month: 'Juil', position: 2 },
      { month: 'Août', position: 1 }
    ]
  },
  { 
    id: 'kw2', 
    word: 'MCP AI Operating System', 
    rank: '#2', 
    volume: '3.4k / mois', 
    change: '+5 rangs', 
    kd: 42, 
    da: 72, 
    monthlyClicks: '890 clics/m',
    intent: 'Commercial',
    targetUrl: 'https://omk.corp/technology/mcp-os',
    referringDomains: 58,
    toxicityScore: '0% (Sain)',
    competitors: [
      { name: 'Anthropic MCP Directory', position: '#1' },
      { name: 'LangChain Ecosystem', position: '#3' }
    ],
    history: [
      { month: 'Avr', position: 14 },
      { month: 'Mai', position: 9 },
      { month: 'Juin', position: 7 },
      { month: 'Juil', position: 4 },
      { month: 'Août', position: 2 }
    ]
  },
  { 
    id: 'kw3', 
    word: 'Automatisation agence locale', 
    rank: '#1', 
    volume: '850 / mois', 
    change: '= Stable', 
    kd: 18, 
    da: 64, 
    monthlyClicks: '360 clics/m',
    intent: 'Transactionnel',
    targetUrl: 'https://omk.corp/agences/automatisation-complete',
    referringDomains: 31,
    toxicityScore: '0% (Sain)',
    competitors: [
      { name: 'Make.com Enterprise', position: '#2' },
      { name: 'Zapier Central', position: '#4' }
    ],
    history: [
      { month: 'Avr', position: 2 },
      { month: 'Mai', position: 2 },
      { month: 'Juin', position: 1 },
      { month: 'Juil', position: 1 },
      { month: 'Août', position: 1 }
    ]
  },
  { 
    id: 'kw4', 
    word: 'Multi-tenant Back-Office Mobile', 
    rank: '#3', 
    volume: '2.1k / mois', 
    change: '+4 rangs', 
    kd: 35, 
    da: 66, 
    monthlyClicks: '540 clics/m',
    intent: 'Informationnel',
    targetUrl: 'https://omk.corp/architecture/multi-tenant-mobile',
    referringDomains: 39,
    toxicityScore: '0% (Sain)',
    competitors: [
      { name: 'Retool Mobile', position: '#1' },
      { name: 'Appsmith Cloud', position: '#2' }
    ],
    history: [
      { month: 'Avr', position: 11 },
      { month: 'Mai', position: 8 },
      { month: 'Juin', position: 6 },
      { month: 'Juil', position: 5 },
      { month: 'Août', position: 3 }
    ]
  }
];

const INITIAL_AB_TESTS: ABTestItem[] = [
  { 
    id: 'ab1', 
    name: 'Hero CTA: "Démarrer Sandbox" vs "Réserver Démo"', 
    sample: '4,200 visites', 
    winner: 'Var B (+28% conv)', 
    status: 'Terminé',
    confidence: '99.2%',
    rollout: 100,
    hypothesis: 'Permettre un accès instantané au bac à sable sans barrière commerciale augmente drastiquement la conversion des développeurs.',
    targetMetric: 'Taux de création d\'espace Sandbox',
    controlRate: '2.85%',
    variantRate: '3.65%',
    uplift: '+28.07%'
  },
  { 
    id: 'ab2', 
    name: 'Page Pricing: Annuel affiché par défaut (-20%)', 
    sample: '1,850 visites', 
    winner: 'En cours (+14% ARR)', 
    status: 'Actif',
    confidence: '94.8%',
    rollout: 50,
    hypothesis: 'Positionner l\'engagement annuel avec 2 mois offerts favorise les souscriptions pluriannuelles sans détériorer le taux de checkout.',
    targetMetric: 'Valeur moyenne du contrat ARR initial',
    controlRate: '€3,400',
    variantRate: '€3,876',
    uplift: '+14.00%'
  },
  { 
    id: 'ab3', 
    name: 'Onboarding Friction: 2 étapes au lieu de 4', 
    sample: '920 visites', 
    winner: 'Var B (+35% activation)', 
    status: 'Actif',
    confidence: '96.5%',
    rollout: 50,
    hypothesis: 'Reporter la configuration des clés API après le premier déploiement d\'un template réduit le churn d\'activation.',
    targetMetric: 'Taux de complétion du premier micro-service',
    controlRate: '22.0%',
    variantRate: '29.7%',
    uplift: '+35.00%'
  }
];

const GROWTH_TABS = [
  { id: 'funnel', label: 'Funnel & Entonnoir', icon: Layers, badge: '5 Étapes' },
  { id: 'campaigns', label: 'Campagnes & Ads', icon: Target, badge: 4 },
  { id: 'seo', label: 'SEO & Rangs', icon: Search, badge: '#1' },
  { id: 'ab_tests', label: 'A/B Tests & CRO', icon: GitCompare, badge: 3 }
];

export default function Growth() {
  const [activeTab, setActiveTab] = useState('funnel');
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>(INITIAL_FUNNEL_STEPS);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [keywords, setKeywords] = useState<KeywordItem[]>(INITIAL_KEYWORDS);
  const [abTests, setAbTests] = useState<ABTestItem[]>(INITIAL_AB_TESTS);

  // Selected state for Drawers
  const [selectedFunnelStep, setSelectedFunnelStep] = useState<FunnelStep | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItem | null>(null);
  const [selectedABTest, setSelectedABTest] = useState<ABTestItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Adjust Campaign Budget (+20%)
  const handleIncreaseBudget = (campaignId: string) => {
    haptics.trigger('success');
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newBudgetRaw = Math.round(c.rawBudget * 1.20);
        const updated = {
          ...c,
          rawBudget: newBudgetRaw,
          budget: `€${newBudgetRaw.toLocaleString()}`
        };
        if (selectedCampaign?.id === campaignId) setSelectedCampaign(updated);
        return updated;
      }
      return c;
    }));
    showToast(`Budget de la campagne augmenté de +20% avec succès`);
  };

  // Toggle Campaign Status (Actif / En pause)
  const handleToggleCampaignStatus = (campaignId: string) => {
    haptics.trigger('medium');
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newStatus = c.status === 'Actif' ? 'En pause' : 'Actif';
        const updated = { ...c, status: newStatus as 'Actif' | 'En pause' };
        if (selectedCampaign?.id === campaignId) setSelectedCampaign(updated);
        return updated;
      }
      return c;
    }));
    showToast(`Statut de diffusion de la campagne mis à jour`);
  };

  // Toggle Funnel Lever
  const handleToggleFunnelLever = (stepId: string, leverIdx: number) => {
    haptics.trigger('selection');
    setFunnelSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedLevers = step.optimizationLevers.map((l, i) => i === leverIdx ? { ...l, active: !l.active } : l);
        const updated = { ...step, optimizationLevers: updatedLevers };
        if (selectedFunnelStep?.id === stepId) setSelectedFunnelStep(updated);
        return updated;
      }
      return step;
    }));
  };

  // Promote A/B Test Variant to 100% Rollout
  const handlePromoteABTest = (testId: string) => {
    haptics.trigger('success');
    setAbTests(prev => prev.map(t => {
      if (t.id === testId) {
        const updated = { ...t, rollout: 100, status: 'Terminé' as const };
        if (selectedABTest?.id === testId) setSelectedABTest(updated);
        return updated;
      }
      return t;
    }));
    showToast(`Variante gagnante déployée à 100% du trafic en production !`);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={GROWTH_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ACQUISITION FUNNEL */}
          {activeTab === 'funnel' && (
            <motion.div
              key="funnel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Entonnoir d'Acquisition & Conversion"
                subtitle="Performance étape par étape du trafic jusqu'aux contrats ARR signés"
                badge="CAC Moyen €28.40"
                icon={Layers}
                kpis={[
                  { label: 'Visiteurs Uniques', value: '38.4k', sub: '+28% ce mois', trend: 'up' },
                  { label: 'Taux Conv. Global', value: '3.70%', sub: 'Du trafic aux MQLs', trend: 'up' },
                  { label: 'Contrats ARR', value: '38 signés', sub: 'Valeur moyenne €4.2k', trend: 'up' },
                  { label: 'ROAS Global', value: '4.15x', sub: 'Sur budget omnicanal' }
                ]}
              >
                {/* Mix d'Acquisition Multicanal Banner */}
                <DetailCard title="Mix d'Acquisition Omnicanal" icon={TrendingUp}>
                  <div className="space-y-3 pt-1">
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
                        <span>Campagnes Payantes (Google / LinkedIn / Meta)</span>
                        <span className="font-semibold text-slate-100">34% (13,050 visites)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-emerald-400 h-full rounded-full w-[34%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Recommandations & Affiliation B2B</span>
                        <span className="font-semibold text-slate-100">18% (6,920 visites)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-teal-400 h-full rounded-full w-[18%]" />
                      </div>
                    </div>
                  </div>
                </DetailCard>

                {/* Funnel Steps Interactive Cards */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-1">
                    Étapes de l'Entonnoir de Conversion
                  </span>

                  {funnelSteps.map((step, idx) => (
                    <DetailCard
                      key={step.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedFunnelStep(step);
                      }}
                      isInteractive
                      title={`Étape ${step.stageNumber} • ${step.name}`}
                      badge={step.conversionRate}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-bold"
                      icon={Layers}
                      subtitle={`${step.category} • Volume : ${step.volume}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="grid grid-cols-3 gap-2 py-1 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Volume</span>
                            <span className="font-mono text-slate-200 font-bold text-xs">{step.volume.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Abandon</span>
                            <span className="font-mono text-amber-400 font-bold text-xs">{step.dropOffRate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">CAC Étape</span>
                            <span className="font-mono text-emerald-400 font-bold text-xs">{step.marginalCac}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 text-[11px]">
                            {step.activeExperiments.length} A/B tests en cours • {step.optimizationLevers.filter(l => l.active).length} leviers actifs
                          </span>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>Inspecter & Optimiser</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Recommandation Growth Engine AI"
                  content="L'étape 2 (Leads MQLs vers Sandbox) enregistre le plus fort potentiel d'uplift. L'activation de l'authentification GitHub 1-clic réduira le drop-off de 12%, générant ~180 activations sandbox supplémentaires."
                  actionLabel="Activer les leviers d'accélération d'onboarding"
                  onAction={() => {
                    haptics.trigger('medium');
                    showToast('Leviers d\'accélération activés sur le pipeline d\'onboarding');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: CAMPAIGNS & ADS */}
          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Campagnes Publicitaires & Ads"
                subtitle="Pilotage du budget omnicanal, ROAS en temps réel et prévisualisation créative"
                icon={Target}
                badge={`${campaigns.filter(c => c.status === 'Actif').length} Actives`}
                kpis={[
                  { label: 'Budget Total', value: '€5,100', sub: 'Allocation mensuelle' },
                  { label: 'ROAS Pondéré', value: '4.20x', sub: 'Excellente rentabilité', trend: 'up' },
                  { label: 'CAC Moyen', value: '€28.40', sub: '-14% vs Q2', trend: 'up' },
                  { label: 'CTR Moyen', value: '4.30%', sub: 'Benchmark top tier' }
                ]}
              >
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <DetailCard
                      key={c.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedCampaign(c);
                      }}
                      isInteractive
                      title={c.name}
                      badge={`ROAS ${c.roas}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                      icon={Target}
                      subtitle={`${c.platform} • Budget : ${c.budget}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="grid grid-cols-3 gap-2 py-1 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Dépenses</span>
                            <span className="font-mono text-slate-200 font-bold text-xs">{c.spend}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Conversions</span>
                            <span className="font-mono text-emerald-400 font-bold text-xs">{c.conversions} leads</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">CPA</span>
                            <span className="font-mono text-sky-400 font-bold text-xs">{c.cpa}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <span className={`w-2 h-2 rounded-full ${c.status === 'Actif' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span>{c.status}</span>
                            <span className="text-slate-600">•</span>
                            <span>CTR {c.ctr}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>Gérer la campagne</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Recommandation Budget Meta & Google AI"
                  content="La campagne Meta Retargeting affiche un ROAS record de 5.8x et un coût d'acquisition de seulement €8.07. Augmenter le budget de +20% permettra de capter 18 conversions additionnelles par semaine sans saturation d'audience."
                  actionLabel="Appliquer l'augmentation de budget +20%"
                  onAction={() => {
                    handleIncreaseBudget('c3');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: ORGANIC & SEO */}
          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Positionnement SEO & Mots-Clés Organiques"
                subtitle="Surveillance des positions SERP Google, autorité de domaine et stratégie netlinking"
                icon={Search}
                badge="3 Mots-clés en Top 3"
                kpis={[
                  { label: 'Trafic Organique', value: '18.4k / m', sub: '48% du mix total', trend: 'up' },
                  { label: 'Domain Authority', value: 'DA 68', sub: '+4 pts en 6 mois', trend: 'up' },
                  { label: 'Keywords Top 3', value: '3 requêtes', sub: 'Sur 4 prioritaires' },
                  { label: 'Backlinks Actifs', value: '170 liens', sub: 'Score toxicité 0%', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {keywords.map(kw => (
                    <DetailCard
                      key={kw.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedKeyword(kw);
                      }}
                      isInteractive
                      title={kw.word}
                      badge={kw.rank}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold text-xs"
                      icon={Search}
                      subtitle={`Volume : ${kw.volume} • ${kw.intent}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="grid grid-cols-3 gap-2 py-1 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Clics Estimés</span>
                            <span className="font-mono text-emerald-400 font-bold text-xs">{kw.monthlyClicks.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Difficulté (KD)</span>
                            <span className="font-mono text-amber-400 font-bold text-xs">{kw.kd}/100</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Autorité (DA)</span>
                            <span className="font-mono text-sky-400 font-bold text-xs">DA {kw.da}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <span className="text-emerald-400 font-semibold text-[11px]">
                            {kw.change}
                          </span>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>SERP & Backlinks</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Stratégie de Domination Sémantique AI"
                  content="La requête 'MCP AI Operating System' est passée de la 14e à la 2e position en 4 mois. La publication d'un guide technique complet 'How MCP Redefines Enterprise Back-Offices' permettra de détrôner le concurrent en position #1."
                  actionLabel="Générer le brief éditorial SEO & Structure de contenu"
                  onAction={() => {
                    haptics.trigger('success');
                    showToast('Brief éditorial SEO généré avec 12 opportunités sémantiques');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: A/B TESTS & CRO */}
          {activeTab === 'ab_tests' && (
            <motion.div
              key="ab_tests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Expérimentations & A/B Tests CRO"
                subtitle="Optimisation continue des taux de conversion avec rigueur statistique"
                icon={GitCompare}
                badge={`${abTests.length} Tests`}
                kpis={[
                  { label: 'Uplift Global', value: '+28.0%', sub: 'Impact sur le funnel', trend: 'up' },
                  { label: 'Confiance Moy.', value: '96.8%', sub: 'Significativité p < 0.05', trend: 'up' },
                  { label: 'Échantillon Total', value: '6.9k users', sub: 'Sur 3 tests actifs' },
                  { label: 'Taux Succès Tests', value: '100%', sub: '3 variantes gagnantes', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {abTests.map(test => (
                    <DetailCard
                      key={test.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedABTest(test);
                      }}
                      isInteractive
                      title={test.name}
                      badge={test.winner}
                      badgeColor={test.status === 'Terminé' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold' : 'bg-sky-500/10 text-sky-400 border-sky-500/30 font-semibold'}
                      icon={GitCompare}
                      subtitle={`Échantillon : ${test.sample} • Confiance : ${test.confidence}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <p className="text-slate-400 leading-relaxed text-[11px] line-clamp-2">
                          {test.hypothesis}
                        </p>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <span className="text-slate-500">Rollout :</span>
                            <strong className="text-emerald-400">{test.rollout}% prod</strong>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>Voir variantes & Déployer</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Recommandation Déploiement A/B Test AI"
                  content="Le test Hero CTA a atteint une confiance statistique de 99.2% avec un uplift mesuré de +28.07%. Le déploiement complet à 100% de la production sécurisera un gain prévisionnel de +€14,200 ARR ce trimestre."
                  actionLabel="Déployer la variante gagnante Hero CTA à 100%"
                  onAction={() => {
                    handlePromoteABTest('ab1');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 1. SLIDE-OVER FUNNEL STEP DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedFunnelStep}
        onClose={() => setSelectedFunnelStep(null)}
        title={`Étape ${selectedFunnelStep?.stageNumber} • ${selectedFunnelStep?.name || ''}`}
        subtitle={`${selectedFunnelStep?.category} • Taux de conversion : ${selectedFunnelStep?.conversionRate}`}
        badge={selectedFunnelStep?.conversionRate}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedFunnelStep?.stageNumber.toString()}
        icon={Layers}
        breadcrumbs={[
          { label: 'Growth OS', onClick: () => setSelectedFunnelStep(null) },
          { label: 'Entonnoir', onClick: () => setSelectedFunnelStep(null) },
          { label: selectedFunnelStep?.name || 'Étape' }
        ]}
        actions={[
          {
            id: 'run_experiment',
            label: 'Lancer un A/B Test',
            icon: GitCompare,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Nouveau test A/B initié sur l'étape ${selectedFunnelStep?.name}`);
            }
          },
          {
            id: 'simulate_scenario',
            label: 'Simuler Scénario (+15%)',
            icon: TrendingUp,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Simulation : +15% de conversion sur cette étape générerait +€18,500 ARR`);
            }
          },
          {
            id: 'export_funnel_pdf',
            label: 'Rapport Drop-off (PDF)',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Rapport d'analyse du churn d'étape généré`);
            }
          }
        ]}
        kpis={[
          { label: 'Volume à l\'Étape', value: selectedFunnelStep?.volume.split(' ')[0] || '', sub: 'Ce mois-ci' },
          { label: 'Taux de Passage', value: selectedFunnelStep?.conversionRate || '', sub: 'Étape à étape', trend: 'up' },
          { label: 'Taux de Drop-off', value: selectedFunnelStep?.dropOffRate || '', sub: 'Abandon moyen' },
          { label: 'CAC Marginal', value: selectedFunnelStep?.marginalCac || '', sub: 'Coût unitaire' }
        ]}
        aiInsight={{
          title: 'Analyse d\'Attrition & Optimisation AI',
          content: `${selectedFunnelStep?.description} Temps moyen passé à cette étape : ${selectedFunnelStep?.avgTimeOnStep}. L'activation des leviers recommandés permettra de récupérer ~15% des abandons.`,
          actionLabel: 'Activer tous les leviers d\'optimisation pour cette étape',
          onAction: () => {
            haptics.trigger('success');
            showToast('Tous les leviers d\'accélération activés');
          }
        }}
        tabs={[
          {
            id: 'churn_friction',
            label: 'Analyse du Churn & Friction',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 text-sm">Points de Friction Identifiés</span>
                  <div className="space-y-1.5 pt-1">
                    {selectedFunnelStep?.frictionPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span className="text-slate-300 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Durée Moyenne sur l'Étape</span>
                  <div className="flex justify-between items-center p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Temps d'interaction:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedFunnelStep?.avgTimeOnStep}</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'levers',
            label: `Leviers d'Optimisation (${selectedFunnelStep?.optimizationLevers.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                {selectedFunnelStep?.optimizationLevers.map((lever, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => selectedFunnelStep && handleToggleFunnelLever(selectedFunnelStep.id, idx)}
                    className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-200 block">{lever.label}</span>
                      <span className="text-[11px] text-emerald-400 font-medium">Impact estimé : {lever.impact}</span>
                    </div>
                    <button className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                      lever.active 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {lever.active ? 'Actif' : 'Activer'}
                    </button>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'experiments',
            label: `Expérimentations (${selectedFunnelStep?.activeExperiments.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                {selectedFunnelStep?.activeExperiments.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{exp}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        En cours
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* 2. SLIDE-OVER CAMPAIGN DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign?.name || ''}
        subtitle={`${selectedCampaign?.platform} • Budget : ${selectedCampaign?.budget}`}
        badge={`ROAS ${selectedCampaign?.roas}`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedCampaign?.name.charAt(0)}
        icon={Target}
        breadcrumbs={[
          { label: 'Growth OS', onClick: () => setSelectedCampaign(null) },
          { label: 'Campagnes', onClick: () => setSelectedCampaign(null) },
          { label: selectedCampaign?.name || 'Campagne' }
        ]}
        actions={[
          {
            id: 'boost_budget',
            label: 'Ajuster Budget (+20%)',
            icon: DollarSign,
            variant: 'primary',
            onClick: () => {
              if (selectedCampaign) handleIncreaseBudget(selectedCampaign.id);
            }
          },
          {
            id: 'toggle_campaign',
            label: selectedCampaign?.status === 'Actif' ? 'Mettre en Pause' : 'Relancer la Diffusion',
            icon: selectedCampaign?.status === 'Actif' ? Pause : Play,
            onClick: () => {
              if (selectedCampaign) handleToggleCampaignStatus(selectedCampaign.id);
            }
          },
          {
            id: 'duplicate_ad',
            label: 'Dupliquer Créatif',
            icon: Copy,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Campagne dupliquée en brouillon pour tests A/B`);
            }
          }
        ]}
        kpis={[
          { label: 'ROAS Actuel', value: selectedCampaign?.roas || '', sub: 'Multiplicateur CA', trend: 'up' },
          { label: 'CAC Moyen', value: selectedCampaign?.cpa || '', sub: 'Coût acquisition client' },
          { label: 'CTR Moyen', value: selectedCampaign?.ctr || '', sub: 'Taux de clic publicitaire', trend: 'up' },
          { label: 'Conversions', value: `${selectedCampaign?.conversions || 0} leads`, sub: 'Ce mois-ci' }
        ]}
        aiInsight={{
          title: 'Analyse de Rentabilité & Fatigue Créative AI',
          content: `Le coût par acquisition de ${selectedCampaign?.cpa} est 42% inférieur à la moyenne du marché. L'audience cible répond très favorablement. Recommandation : étendre le ciblage géographique sur le Royaume-Uni et l'Allemagne.`,
          actionLabel: 'Étendre automatiquement le ciblage international',
          onAction: () => {
            haptics.trigger('success');
            showToast('Ciblage international appliqué avec succès');
          }
        }}
        tabs={[
          {
            id: 'creatives',
            label: 'Créatifs & Formats',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5">
                  <span className="font-semibold text-slate-200 text-sm">Aperçu du Format Publicitaire</span>
                  
                  {/* Ad Mockup Card */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                        OMK
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block text-xs">OMK Mobile Back-Office</span>
                        <span className="text-[10px] text-slate-500">Sponsorisé • {selectedCampaign?.platform}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-slate-100 text-xs pt-1">{selectedCampaign?.headline}</h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{selectedCampaign?.copy}</p>

                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono">https://omk.corp/get-started</span>
                      <button className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg">
                        Démarrer Essai
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Spécifications Techniques</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Format de diffusion:</span>
                    <span className="text-slate-200 font-medium">{selectedCampaign?.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Impressions cumulées:</span>
                    <span className="text-slate-200 font-mono">{selectedCampaign?.impressions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clics enregistrés:</span>
                    <span className="text-emerald-400 font-mono font-bold">{selectedCampaign?.clicks}</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'targeting',
            label: 'Audience & Ciblage',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Segment d'Audience Cible</span>
                  <p className="text-slate-300 leading-relaxed">{selectedCampaign?.targetAudience}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Couverture Géographique</span>
                  <p className="text-emerald-400 font-medium">{selectedCampaign?.geoTarget}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Stratégie d'Enchères</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type d'enchère:</span>
                    <span className="text-slate-200">Target ROAS Automatique (tROAS 4.0x)</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* 3. SLIDE-OVER KEYWORD & SEO DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedKeyword}
        onClose={() => setSelectedKeyword(null)}
        title={`SEO • "${selectedKeyword?.word || ''}"`}
        subtitle={`Position SERP : ${selectedKeyword?.rank} • Volume : ${selectedKeyword?.volume}`}
        badge={selectedKeyword?.rank}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
        avatarText="#"
        icon={Search}
        breadcrumbs={[
          { label: 'Growth OS', onClick: () => setSelectedKeyword(null) },
          { label: 'SEO & Rangs', onClick: () => setSelectedKeyword(null) },
          { label: selectedKeyword?.word || 'Mot-clé' }
        ]}
        actions={[
          {
            id: 'reindex_search_console',
            label: 'Forcer Réindexation (GSC)',
            icon: RefreshCw,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Requête de réindexation transmise à Google Search Console`);
            }
          },
          {
            id: 'audit_serp',
            label: 'Audit Sémantique & SERP',
            icon: Search,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Audit sémantique généré pour "${selectedKeyword?.word}"`);
            }
          },
          {
            id: 'boost_backlinks',
            label: 'Générer Brief Netlinking',
            icon: Link,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Brief de netlinking et stratégie d'ancres généré`);
            }
          }
        ]}
        kpis={[
          { label: 'Position SERP', value: selectedKeyword?.rank || '', sub: 'Google France & USA', trend: 'up' },
          { label: 'Volume Mensuel', value: selectedKeyword?.volume.split(' ')[0] || '', sub: 'Requêtes cibles' },
          { label: 'Difficulté (KD)', value: `${selectedKeyword?.kd || 0} / 100`, sub: 'Compétition modérée' },
          { label: 'Domain Authority', value: `DA ${selectedKeyword?.da || 0}`, sub: 'Score d\'autorité', trend: 'up' }
        ]}
        aiInsight={{
          title: 'Stratégie de Maintien de Position #1 AI',
          content: `Le mot-clé "${selectedKeyword?.word}" génère une intention d'achat ${selectedKeyword?.intent}. L'intégration d'un tableau comparatif interactif et d'une section FAQ Schema.org renforcera durablement la position #1 face aux concurrents.`,
          actionLabel: 'Générer le balisage Schema.org FAQ',
          onAction: () => {
            haptics.trigger('success');
            showToast('Code JSON-LD Schema.org généré et copié');
          }
        }}
        tabs={[
          {
            id: 'history',
            label: 'Historique Positions & SERP',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Trajectoire de Positionnement (6 Mois)</span>
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {selectedKeyword?.history.map((h, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">{h.month}</span>
                        <span className="font-mono text-emerald-400 font-bold text-xs">#{h.position}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Concurrents Directs sur la Requête</span>
                  <div className="space-y-1.5">
                    {selectedKeyword?.competitors.map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                        <span className="text-slate-300 font-medium">{comp.name}</span>
                        <span className="text-amber-400 font-mono font-bold">{comp.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'backlinks',
            label: 'Backlinks & Autorité',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Domaines Référents:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedKeyword?.referringDomains} domaines</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Score de Toxicité:</span>
                    <span className="text-emerald-400 font-medium">{selectedKeyword?.toxicityScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">URL de destination:</span>
                    <span className="font-mono text-slate-300 text-[10px] truncate max-w-[200px]">{selectedKeyword?.targetUrl}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* 4. SLIDE-OVER A/B TEST DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedABTest}
        onClose={() => setSelectedABTest(null)}
        title={`A/B Test • ${selectedABTest?.name || ''}`}
        subtitle={`Échantillon : ${selectedABTest?.sample} • Statut : ${selectedABTest?.status}`}
        badge={selectedABTest?.winner}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
        avatarText="A/B"
        icon={GitCompare}
        breadcrumbs={[
          { label: 'Growth OS', onClick: () => setSelectedABTest(null) },
          { label: 'A/B Tests', onClick: () => setSelectedABTest(null) },
          { label: selectedABTest?.name || 'Expérimentation' }
        ]}
        actions={[
          {
            id: 'deploy_winner',
            label: 'Déployer Gagnant à 100%',
            icon: CheckCircle2,
            variant: 'primary',
            onClick: () => {
              if (selectedABTest) handlePromoteABTest(selectedABTest.id);
            }
          },
          {
            id: 'export_stats',
            label: 'Exporter Données Statistiques',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Export CSV des résultats statistiques téléchargé`);
            }
          }
        ]}
        kpis={[
          { label: 'Uplift Mesuré', value: selectedABTest?.uplift || '', sub: 'Gain net', trend: 'up' },
          { label: 'Confiance Stat.', value: selectedABTest?.confidence || '', sub: 'p < 0.01', trend: 'up' },
          { label: 'Échantillon Total', value: selectedABTest?.sample || '', sub: 'Visiteurs uniques' },
          { label: 'Rollout Prod', value: `${selectedABTest?.rollout || 0}%`, sub: 'Trafic alloué' }
        ]}
        aiInsight={{
          title: 'Validation Statistique & Déploiement AI',
          content: `${selectedABTest?.hypothesis} Avec une confiance statistique de ${selectedABTest?.confidence}, la variante surperforme nettement le contrôle. La mise en production à 100% est recommandée immédiatement.`,
          actionLabel: 'Activer la variante gagnante sur l\'ensemble des utilisateurs',
          onAction: () => {
            if (selectedABTest) handlePromoteABTest(selectedABTest.id);
          }
        }}
        tabs={[
          {
            id: 'variants',
            label: 'Variantes & Taux de Conversion',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Groupe Contrôle (Baseline)</span>
                  <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Taux de conversion :</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedABTest?.controlRate}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-500/30 space-y-2">
                  <span className="font-semibold text-emerald-400">Variante B (Gagnante)</span>
                  <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Taux de conversion :</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">{selectedABTest?.variantRate}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400 text-[11px]">Uplift relatif :</span>
                    <span className="font-bold text-emerald-400 text-xs">{selectedABTest?.uplift}</span>
                  </div>
                </div>
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
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
