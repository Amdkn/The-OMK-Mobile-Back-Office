import React, { useState, useEffect } from 'react';
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
  Award,
  Download,
  Share2,
  Calendar,
  Layers,
  Flame,
  Volume2,
  Plus,
  Image,
  ExternalLink,
  Target,
  Clock,
  Send,
  Check,
  Globe,
  Radio,
  FileCheck
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

interface CallRecord {
  id: number | string;
  name: string;
  number: string;
  time: string;
  duration: string;
  status: 'completed' | 'missed' | 'pending';
  score: string;
  intent: string;
  transcript: string;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  leads: number;
  cpl: string;
  spend: string;
  budgetMonthly: number;
  roas: string;
  impressions: string;
  ctr: string;
  keywords: string[];
  status: 'active' | 'paused';
}

interface GooglePost {
  id: string;
  headline: string;
  body: string;
  ctaType: string;
  scheduleDate: string;
  status: 'Programmé' | 'Publié';
  views: number;
  clicks: number;
  mediaName: string;
}

interface BotLog {
  id: string;
  from: string;
  caller: string;
  summary: string;
  time: string;
  duration: string;
  intent: string;
}

const INITIAL_CALLS: CallRecord[] = [
  { id: 1, name: 'Client Potentiel (Cabinet Alpha)', number: '+33 6 12 34 56 78', time: '14:30', duration: '5m 23s', status: 'completed', score: '94%', intent: 'Demande d\'intégration OMK OS', transcript: 'Le prospect souhaite migrer son infrastructure vers le PaaS Pro avec 50 licences.' },
  { id: 2, name: 'Lead Local Inbound', number: '+33 1 42 68 90 00', time: '11:15', duration: '0s', status: 'missed', score: '78%', intent: 'Rappel automatique programmé', transcript: 'Message vocal reçu : demande de démo pour le module Finance OS.' },
  { id: 3, name: 'Partenaire Stratégique', number: '+33 6 88 99 00 11', time: 'Hier', duration: '12m 45s', status: 'completed', score: '99%', intent: 'Contrat d\'apporteur d\'affaires', transcript: 'Accord de principe sur 15% de commission sur les contrats Enterprise signés.' },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Google Ads Search Local', platform: 'Google Ads', leads: 42, cpl: '€14.20', spend: '€596.40', budgetMonthly: 800, roas: '4.8x', impressions: '14,200', ctr: '3.8%', keywords: ['ERP back office mobile', 'logiciel gestion entreprise', 'PaaS cloud France'], status: 'active' },
  { id: 'c2', name: 'LinkedIn B2B Retargeting', platform: 'LinkedIn', leads: 18, cpl: '€38.50', spend: '€693.00', budgetMonthly: 1000, roas: '3.2x', impressions: '8,400', ctr: '1.9%', keywords: ['CTO startup', 'Directeur Général PME', 'SaaS back office'], status: 'active' },
  { id: 'c3', name: 'Google Maps Boost Local', platform: 'Google Maps', leads: 64, cpl: '€8.40', spend: '€537.60', budgetMonthly: 600, roas: '6.1x', impressions: '24,000', ctr: '5.2%', keywords: ['éditeur logiciel Paris 8', 'solution cloud souveraine'], status: 'active' },
];

const INITIAL_GOOGLE_POSTS: GooglePost[] = [
  {
    id: 'gp-1',
    headline: 'Découvrez OMK OS v4 : La Révolution Back-Office Mobile',
    body: 'Gestion multi-tenant, orchestrateur sécurisé et intelligence artificielle intégrée. Testez notre bac à sable gratuit dès aujourd\'hui.',
    ctaType: 'En savoir plus',
    scheduleDate: 'Vendredi 28 Août 2026 à 10:00',
    status: 'Programmé',
    views: 0,
    clicks: 0,
    mediaName: 'omk_v4_hero.webp'
  },
  {
    id: 'gp-2',
    headline: 'Webinar Live : Automatisez votre Trésorerie et vos Leads',
    body: 'Retrouvez nos experts en direct pour une démonstration complète des modules Finance & Leads automatisés.',
    ctaType: 'S\'inscrire',
    scheduleDate: '15 Août 2026 (Publié)',
    status: 'Publié',
    views: 1240,
    clicks: 168,
    mediaName: 'webinar_finance.jpg'
  }
];

const AUTO_BOT_LOGS: BotLog[] = [
  { id: 'ab1', from: '+33 6 12 34 56 78', caller: 'Cabinet Alpha (Directeur Tech)', summary: 'Le prospect a demandé les tarifs de licence. Le bot a envoyé la documentation par SMS et créé un rdv pour demain 10h.', time: 'Il y a 20m', duration: '1m 45s', intent: 'Achat Licences' },
  { id: 'ab2', from: '+33 1 42 68 90 00', caller: 'Inbound Anonyme', summary: 'Appel manqué traité : message vocal transcrit avec succès. Lead qualifié "Tier 1".', time: 'Il y a 3h', duration: '45s', intent: 'Support Commercial' },
];

const LEADS_TABS = [
  { id: 'google_business', label: 'Google Pro', icon: MapPin },
  { id: 'calls', label: 'Appels', icon: PhoneCall, badge: 3 },
  { id: 'campaigns', label: 'Campagnes', icon: Megaphone, badge: 3 },
  { id: 'auto_bot', label: 'Bot Vocal', icon: Bot, badge: 'IA' }
];

export default function Leads() {
  const [activeTab, setActiveTab] = useState('google_business');
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [googlePosts, setGooglePosts] = useState<GooglePost[]>(INITIAL_GOOGLE_POSTS);
  
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedBotLog, setSelectedBotLog] = useState<BotLog | null>(null);
  const [selectedGooglePost, setSelectedGooglePost] = useState<GooglePost | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  // Form states: Google Post
  const [postForm, setPostForm] = useState({
    headline: '',
    body: '',
    ctaType: 'En savoir plus',
    scheduleDate: 'Vendredi 28 Août 2026 à 14:00',
    mediaName: 'post_cover_omk.png'
  });

  // Form states: Acquisition Campaign
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    platform: 'Google Ads Search',
    budgetMonthly: 750,
    keywords: 'ERP back-office, PaaS cloud, gestion entreprise',
    goal: 'Leads Qualifiés'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNewPostModalOpen(false);
        setIsNewCampaignModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Submit Google Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.headline.trim() || !postForm.body.trim()) return;

    const newPost: GooglePost = {
      id: `gp-${Date.now()}`,
      headline: postForm.headline.trim(),
      body: postForm.body.trim(),
      ctaType: postForm.ctaType,
      scheduleDate: postForm.scheduleDate,
      status: 'Programmé',
      views: 0,
      clicks: 0,
      mediaName: postForm.mediaName
    };

    setGooglePosts(prev => [newPost, ...prev]);
    haptics.trigger('success');
    setIsNewPostModalOpen(false);
    showToast(`Google Post "${newPost.headline}" programmé avec succès`);

    setPostForm({
      headline: '',
      body: '',
      ctaType: 'En savoir plus',
      scheduleDate: 'Vendredi 28 Août 2026 à 14:00',
      mediaName: 'post_cover_omk.png'
    });
  };

  // Submit New Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) return;

    const kwArray = campaignForm.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const newCamp: Campaign = {
      id: `c-${Date.now()}`,
      name: campaignForm.name.trim(),
      platform: campaignForm.platform,
      leads: 0,
      cpl: '€12.50 (Est.)',
      spend: '€0.00',
      budgetMonthly: Number(campaignForm.budgetMonthly),
      roas: '4.5x (Prév.)',
      impressions: '0',
      ctr: '0.0%',
      keywords: kwArray.length > 0 ? kwArray : ['logiciel entreprise', 'cloud B2B'],
      status: 'active'
    };

    setCampaigns(prev => [newCamp, ...prev]);
    haptics.trigger('success');
    setIsNewCampaignModalOpen(false);
    showToast(`Campagne d'acquisition "${newCamp.name}" créée et activée`);

    setCampaignForm({
      name: '',
      platform: 'Google Ads Search',
      budgetMonthly: 750,
      keywords: 'ERP back-office, PaaS cloud, gestion entreprise',
      goal: 'Leads Qualifiés'
    });
  };

  // Boost campaign budget
  const handleBoostCampaign = (campId: string) => {
    haptics.trigger('success');
    setCampaigns(prev => prev.map(c => {
      if (c.id === campId) {
        const updated = { ...c, budgetMonthly: Math.round(c.budgetMonthly * 1.2), leads: c.leads + 8 };
        if (selectedCampaign?.id === campId) setSelectedCampaign(updated);
        return updated;
      }
      return c;
    }));
    showToast(`Budget de la campagne boosté de +20%`);
  };

  const handleTogglePauseCampaign = (campId: string) => {
    haptics.trigger('medium');
    setCampaigns(prev => prev.map(c => {
      if (c.id === campId) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active';
        const updated: Campaign = { ...c, status: nextStatus as 'active' | 'paused' };
        if (selectedCampaign?.id === campId) setSelectedCampaign(updated);
        return updated;
      }
      return c;
    }));
    showToast(`Statut de la campagne modifié`);
  };

  // Total Leads calculated
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leads, 0);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={LEADS_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Contextual Sub-Bar */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Leads" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('google_business');
              setSelectedCall(null);
              setSelectedCampaign(null);
              setSelectedBotLog(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Leads OS</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {LEADS_TABS.find(t => t.id === activeTab)?.label || 'Google Pro'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            Multi-Canal Inbound
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsNewPostModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <MapPin size={11} />
            <span className="hidden xs:inline">Google Post</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsNewCampaignModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>+ Campagne</span>
          </button>
        </div>
      </div>

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

                {/* Scheduled / Published Google Posts list */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-xs font-semibold text-slate-400">Actualités & Google Posts ({googlePosts.length})</span>
                    <button
                      onClick={() => {
                        haptics.trigger('selection');
                        setIsNewPostModalOpen(true);
                      }}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Programmer un Post</span>
                    </button>
                  </div>

                  {googlePosts.map(post => (
                    <DetailCard
                      key={post.id}
                      title={post.headline}
                      subtitle={post.scheduleDate}
                      icon={MapPin}
                      badge={post.status}
                      badgeColor={post.status === 'Publié' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedGooglePost(post);
                      }}
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <p className="text-slate-300 line-clamp-2 leading-relaxed">{post.body}</p>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                          <span>Bouton d'action : <strong className="text-slate-200 font-medium">{post.ctaType}</strong></span>
                          <span className="text-emerald-400 font-medium">Consulter le post →</span>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Recommandation Locale Coach AI"
                  content="Publier une nouvelle actualité Google Post sur les fonctionnalités de l'OS ce vendredi augmentera les interactions de 24% pendant le week-end."
                  actionLabel="Programmer un Google Post"
                  onAction={() => {
                    haptics.trigger('selection');
                    setIsNewPostModalOpen(true);
                  }}
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
                badge={`${calls.length} Appels`}
                kpis={[
                  { label: 'Appels Reçus', value: '124', sub: '98% qualifiés' },
                  { label: 'Durée Moyenne', value: '6m 12s', sub: 'Haute rétention' },
                  { label: 'Taux Qualification', value: '92%', sub: 'Score IA > 80%', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {calls.map(call => (
                    <DetailCard
                      key={call.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCall(call);
                      }}
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
                badge={`${campaigns.length} Campagnes`}
                kpis={[
                  { label: 'Leads Totaux', value: `${totalLeads}`, sub: 'Coût moyen €14.80' },
                  { label: 'Budget Dépensé', value: '€1,827', sub: 'Sous budget alloué' },
                  { label: 'ROAS Global', value: '4.7x', sub: 'Haute rentabilité', trend: 'up' }
                ]}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-400">Canaux publicitaires actifs</span>
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsNewCampaignModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Créer une Campagne</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {campaigns.map(camp => (
                    <DetailCard
                      key={camp.id}
                      title={camp.name}
                      badge={`CPL ${camp.cpl}`}
                      badgeColor={camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold' : 'bg-slate-950 text-slate-400 border-slate-800 font-mono font-semibold'}
                      icon={Megaphone}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCampaign(camp);
                      }}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Leads générés : <strong className="text-slate-200">{camp.leads}</strong> (ROAS {camp.roas})</span>
                        <span className="text-emerald-400 text-[11px] font-medium">Inspecter campagne →</span>
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
                kpis={[
                  { label: 'Appels Gérés', value: '38', sub: '100% sans attente' },
                  { label: 'RDV Planifiés', value: '14', sub: 'Synchronisés Google Calendar', trend: 'up' },
                  { label: 'Précision IA', value: '99.4%', sub: 'Modèle Speech-to-Text v2' }
                ]}
              >
                <div className="space-y-3">
                  {AUTO_BOT_LOGS.map(log => (
                    <DetailCard
                      key={log.id}
                      title={`Interaction : ${log.from}`}
                      badge={log.time}
                      badgeColor="bg-slate-950 text-slate-400 border-slate-800 font-mono"
                      icon={Bot}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedBotLog(log);
                      }}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{log.summary}</p>
                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] text-emerald-400 font-medium">Consulter transcription complète →</span>
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
      {/* MODAL 1: PROGRAMMER UN GOOGLE POST */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Programmer un Google Post</h3>
                    <p className="text-[10px] text-slate-400">Fiche Google My Business & Référencement Maps</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNewPostModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Titre de l'Actualité (Headline) *</label>
                  <input
                    type="text"
                    required
                    value={postForm.headline}
                    onChange={e => setPostForm({ ...postForm, headline: e.target.value })}
                    placeholder="Ex: Nouveautés OMK OS v4 disponibles"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Corps du Message (Body Text) *</label>
                  <textarea
                    rows={3}
                    required
                    value={postForm.body}
                    onChange={e => setPostForm({ ...postForm, body: e.target.value })}
                    placeholder="Décrivez votre actualité, événement ou offre spéciale..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Bouton d'Action (CTA)</label>
                    <select
                      value={postForm.ctaType}
                      onChange={e => setPostForm({ ...postForm, ctaType: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="En savoir plus">En savoir plus</option>
                      <option value="Appeler">Appeler directement</option>
                      <option value="Réserver">Réserver un créneau</option>
                      <option value="S'inscrire">S'inscrire</option>
                      <option value="Acheter">Acheter en ligne</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Date & Heure de Diffusion</label>
                    <input
                      type="text"
                      value={postForm.scheduleDate}
                      onChange={e => setPostForm({ ...postForm, scheduleDate: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Simulated Media Upload */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Visuel / Photo d'Illustration</label>
                  <div className="p-3 bg-slate-950/70 border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Image size={16} className="text-emerald-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-300 truncate">{postForm.mediaName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        haptics.trigger('light');
                        setPostForm({ ...postForm, mediaName: `visuel_${Date.now().toString().slice(-4)}.jpg` });
                        showToast('Photo attachée au post');
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-200 shrink-0"
                    >
                      Changer
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Programmer le Post</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: CRÉER UNE CAMPAGNE D'ACQUISITION */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Créer une Campagne d'Acquisition</h3>
                    <p className="text-[10px] text-slate-400">Génération de leads et diffusion multi-canal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNewCampaignModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Nom de la Campagne *</label>
                  <input
                    type="text"
                    required
                    value={campaignForm.name}
                    onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    placeholder="Ex: Campagne Google Search Q3 Enterprise"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Plateforme</label>
                    <select
                      value={campaignForm.platform}
                      onChange={e => setCampaignForm({ ...campaignForm, platform: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Google Ads Search">Google Ads Search</option>
                      <option value="Google Maps Boost">Google Maps Boost</option>
                      <option value="LinkedIn B2B">LinkedIn B2B</option>
                      <option value="Meta Ads Enterprise">Meta Ads Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Budget Mensuel (€) *</label>
                    <input
                      type="number"
                      step="50"
                      required
                      value={campaignForm.budgetMonthly}
                      onChange={e => setCampaignForm({ ...campaignForm, budgetMonthly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Mots-Clés Ciblés (Séparés par virgules)</label>
                  <textarea
                    rows={2}
                    value={campaignForm.keywords}
                    onChange={e => setCampaignForm({ ...campaignForm, keywords: e.target.value })}
                    placeholder="Ex: ERP back-office, PaaS pro, serveur dédié Paris"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Objectif Principal</label>
                  <select
                    value={campaignForm.goal}
                    onChange={e => setCampaignForm({ ...campaignForm, goal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Leads Qualifiés">Leads Qualifiés (Formulaires Sandbox)</option>
                    <option value="Appels Entrants">Appels Directs (Liaison Bot Vocal)</option>
                    <option value="Trafic & Démo">Trafic & Réservation Démo</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCampaignModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Lancer la Campagne</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER DÉTAIL GOOGLE POST */}
      <DetailDrawer
        isOpen={!!selectedGooglePost}
        onClose={() => setSelectedGooglePost(null)}
        title={selectedGooglePost?.headline || ''}
        subtitle={`Fiche Google My Business • ${selectedGooglePost?.scheduleDate}`}
        badge={selectedGooglePost?.status}
        badgeColor={selectedGooglePost?.status === 'Publié' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
        avatarText="G"
        breadcrumbs={[
          { label: 'Leads OS', onClick: () => setSelectedGooglePost(null) },
          { label: 'Google Pro', onClick: () => setSelectedGooglePost(null) },
          { label: selectedGooglePost?.headline || 'Google Post' }
        ]}
        actions={[
          {
            id: 'edit_post',
            label: 'Modifier Diffusion',
            icon: Calendar,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('medium');
              showToast('Paramètres de diffusion mis à jour');
            }
          },
          {
            id: 'delete_post',
            label: 'Supprimer Post',
            icon: X,
            variant: 'danger',
            onClick: () => {
              if (selectedGooglePost) {
                haptics.trigger('warning');
                setGooglePosts(prev => prev.filter(p => p.id !== selectedGooglePost.id));
                setSelectedGooglePost(null);
                showToast('Google Post retiré de la file de diffusion');
              }
            }
          }
        ]}
        kpis={[
          { label: 'Statut Post', value: selectedGooglePost?.status || 'Programmé', sub: 'Google Maps API' },
          { label: 'Bouton CTA', value: selectedGooglePost?.ctaType || 'En savoir plus', sub: 'Lien direct back-office' },
          { label: 'Vues Totales', value: `${selectedGooglePost?.views || 0}`, sub: 'Impressions Maps' },
          { label: 'Clics Générés', value: `${selectedGooglePost?.clicks || 0}`, sub: 'Taux engagement 13.5%', trend: 'up' }
        ]}
        tabs={[
          {
            id: 'post_content',
            label: 'Contenu & Visuel',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200">Texte de l'actualité</span>
                  <p className="text-slate-300 leading-relaxed">{selectedGooglePost?.body}</p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Média associé :</span>
                  <span className="font-mono text-emerald-400">{selectedGooglePost?.mediaName}</span>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DRAWER DÉTAIL APPEL */}
      <DetailDrawer
        isOpen={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        title={selectedCall?.name || ''}
        subtitle={`${selectedCall?.number} • ${selectedCall?.time} (${selectedCall?.duration})`}
        badge={`Score ${selectedCall?.score}`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedCall?.name.charAt(0)}
        breadcrumbs={[
          { label: 'Leads OS', onClick: () => setSelectedCall(null) },
          { label: 'Appels', onClick: () => setSelectedCall(null) },
          { label: selectedCall?.name || 'Appel' }
        ]}
        actions={[
          {
            id: 'call_back',
            label: 'Rappeler Prospect',
            icon: PhoneCall,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Appel téléphonique vers ${selectedCall?.number} lancé`);
            }
          },
          {
            id: 'convert',
            label: 'Convertir en Client',
            icon: UserCheck,
            onClick: () => {
              haptics.trigger('medium');
              if (selectedCall) {
                setCalls(prev => prev.map(c => c.id === selectedCall.id ? { ...c, status: 'completed' } : c));
                setSelectedCall({ ...selectedCall, status: 'completed' });
              }
              showToast(`Lead ${selectedCall?.name} converti en compte Client Enterprise`);
            }
          }
        ]}
        kpis={[
          { label: 'Intention Détectée', value: selectedCall?.intent || 'Inconnue', sub: 'Analyse sémantique' },
          { label: 'Score Qualification', value: selectedCall?.score || '0%', sub: 'Tier 1 Enterprise', trend: 'up' },
          { label: 'Durée Appel', value: selectedCall?.duration || '0s', sub: 'VoIP mTLS' },
          { label: 'Statut Traitement', value: selectedCall?.status === 'completed' ? 'Traité' : 'À rappeler', sub: 'Agent IA' }
        ]}
        aiInsight={{
          title: 'Analyse Vocale Coach AI',
          content: `Le prospect a manifesté un intérêt très fort pour l'architecture microservices. Prochaine action recommandée : transmettre un accès Sandbox immédiat.`,
          actionLabel: 'Créer un compte Sandbox de test',
          onAction: () => {
            haptics.trigger('success');
            showToast('Accès Sandbox généré et envoyé par SMS');
          }
        }}
        tabs={[
          {
            id: 'transcript',
            label: 'Retranscription',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200">Transcription Intégrale (STT)</span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{selectedCall?.transcript}"
                </p>
              </div>
            )
          }
        ]}
      />

      {/* DRAWER DÉTAIL CAMPAGNE */}
      <DetailDrawer
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign?.name || ''}
        subtitle={`ROAS : ${selectedCampaign?.roas} • Budget : €${selectedCampaign?.budgetMonthly}/m`}
        badge={selectedCampaign?.status === 'active' ? 'En Cours' : 'En Pause'}
        badgeColor={selectedCampaign?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
        avatarText="C"
        breadcrumbs={[
          { label: 'Leads OS', onClick: () => setSelectedCampaign(null) },
          { label: 'Campagnes', onClick: () => setSelectedCampaign(null) },
          { label: selectedCampaign?.name || 'Campagne' }
        ]}
        actions={[
          {
            id: 'boost',
            label: 'Booster Budget (+20%)',
            icon: Flame,
            variant: 'primary',
            onClick: () => {
              if (selectedCampaign) handleBoostCampaign(selectedCampaign.id);
            }
          },
          {
            id: 'pause',
            label: selectedCampaign?.status === 'active' ? 'Mettre en Pause' : 'Réactiver Campagne',
            icon: X,
            onClick: () => {
              if (selectedCampaign) handleTogglePauseCampaign(selectedCampaign.id);
            }
          }
        ]}
        kpis={[
          { label: 'Leads Captés', value: `${selectedCampaign?.leads || 0}`, sub: 'Ce mois-ci' },
          { label: 'Coût par Lead (CPL)', value: selectedCampaign?.cpl || '€0', sub: 'Optimisé IA', trend: 'up' },
          { label: 'Taux de Clic (CTR)', value: selectedCampaign?.ctr || '0%', sub: `${selectedCampaign?.impressions} impressions` },
          { label: 'Retour sur Dépense', value: selectedCampaign?.roas || '1x', sub: 'Multiplicateur CA' }
        ]}
        aiInsight={{
          title: 'Optimisation Enchères IA',
          content: `La campagne ${selectedCampaign?.name} surperforme avec un ROAS de ${selectedCampaign?.roas}. L'algorithme a ajusté les mots-clés négatifs pour maximiser le taux de conversion.`,
          actionLabel: 'Voir le ciblage démographique',
          onAction: () => {
            haptics.trigger('light');
            showToast('Ciblage démographique affiché');
          }
        }}
        tabs={[
          {
            id: 'targeting',
            label: 'Ciblage & Mots-Clés',
            content: (
              <div className="space-y-2 text-xs">
                {selectedCampaign?.keywords.map((kw, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between">
                    <span className="text-slate-300">"{kw}"</span>
                    <span className="font-mono text-emerald-400 font-bold">Actif</span>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />

      {/* DRAWER DÉTAIL BOT LOG */}
      <DetailDrawer
        isOpen={!!selectedBotLog}
        onClose={() => setSelectedBotLog(null)}
        title={`Appel Bot : ${selectedBotLog?.caller}`}
        subtitle={`${selectedBotLog?.from} • ${selectedBotLog?.time}`}
        badge="Qualifié IA"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="B"
        breadcrumbs={[
          { label: 'Leads OS', onClick: () => setSelectedBotLog(null) },
          { label: 'Bot Vocal', onClick: () => setSelectedBotLog(null) },
          { label: 'Interaction' }
        ]}
        actions={[
          {
            id: 'calendar_bot',
            label: 'Voir RDV Calendrier',
            icon: Calendar,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast('Événement Google Calendar ouvert');
            }
          },
          {
            id: 'listen',
            label: 'Écouter Audio',
            icon: Volume2,
            onClick: () => {
              haptics.trigger('light');
              showToast('Lecture du fichier audio VoIP...');
            }
          }
        ]}
        kpis={[
          { label: 'Intention Détectée', value: selectedBotLog?.intent || 'Demande', sub: 'Modèle NLP v2' },
          { label: 'Durée Dialogue', value: selectedBotLog?.duration || '1m', sub: 'Zéro latence' },
          { label: 'Action Réalisée', value: 'RDV + SMS', sub: '100% automatisé' },
          { label: 'Sentiment', value: '9.8 / 10', sub: 'Très chaleureux', trend: 'up' }
        ]}
        tabs={[
          {
            id: 'summary_tab',
            label: 'Résumé de l\'échange',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300 leading-relaxed">
                  {selectedBotLog?.summary}
                </p>
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
