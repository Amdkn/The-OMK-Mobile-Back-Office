import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  ExternalLink, 
  ShieldAlert, 
  Calendar, 
  FileText, 
  Share2, 
  Archive, 
  Clock, 
  Activity, 
  Check, 
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers,
  FileCheck,
  Edit,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  ChevronRight,
  X,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { ClientStorageService, Client, Contact, Project } from '../../services/clientStorage';
import { useOSStore } from '../../store/osStore';
import { haptics } from '../../services/haptics';
import { AppEventBus } from '../../services/eventBus';
import ContactDetailModal from './clients/ContactDetailModal';
import ProjectDetailModal from './clients/ProjectDetailModal';
import ClientMetricsTab from './clients/ClientMetricsTab';

const CLIENTS_TABS = [
  { id: 'portefeuille', label: 'Portefeuille', icon: Users, badge: 4 },
  { id: 'pipeline', label: 'Pipeline & Onboarding', icon: TrendingUp, badge: 3 },
  { id: 'sante', label: 'Santé & Risques', icon: Activity, badge: 1, badgeColor: 'bg-amber-500 text-slate-950' },
  { id: 'support', label: 'SLA & Support', icon: ShieldAlert, badge: 3 },
  { id: 'contrats', label: 'Contrats', icon: FileCheck, badge: '$38k' }
];

export default function Clients() {
  const { workspace } = useOSStore();
  const [activeTab, setActiveTab] = useState('portefeuille');
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Selected Detail Modal states for Contacts and Projects
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newContactData, setNewContactData] = useState({ name: '', role: '', email: '', phone: '', decisionMaker: true });
  const [newProjectData, setNewProjectData] = useState({ name: '', status: 'in-progress' as Project['status'], progress: 15, dueDate: '30 Nov 2026', budget: 35000, lead: 'Lead Consultant' });

  // Form State for Create/Edit
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    mrr: 5000,
    status: 'active',
    healthScore: 90,
    industry: 'Cloud & SaaS',
    tier: 'Enterprise',
    sla: '99.99% (SLA Or)',
    renewalDate: '15 Déc 2027',
    notes: '',
    lastContact: "À l'instant",
    contacts: [],
    projects: [],
    revenueHistory: [
      { month: 'Jan', revenue: 4000 },
      { month: 'Fév', revenue: 4500 },
      { month: 'Mar', revenue: 4800 },
      { month: 'Avr', revenue: 5000 },
    ]
  });

  // Load clients whenever workspace changes or on mount
  useEffect(() => {
    const loaded = ClientStorageService.loadClients(workspace);
    setClients(loaded);
  }, [workspace]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    haptics.trigger('selection');
    setFormData({
      name: '',
      mrr: 7500,
      status: 'active',
      healthScore: 92,
      industry: 'Intelligence Artificielle',
      tier: 'Enterprise',
      sla: '99.99% (SLA Or)',
      renewalDate: '31 Déc 2027',
      notes: 'Nouveau compte stratégique déployé via OMK Mobile OS.',
      lastContact: "À l'instant",
      contacts: [
        { id: 'c1', name: 'Directeur Général', role: 'CEO', email: 'contact@enterprise.com', phone: '+33 6 00 00 00 00' }
      ],
      projects: [
        { id: 'p1', name: 'Initialisation Cloud Pod', status: 'in-progress', progress: 20, dueDate: '15 Jan 2027' }
      ],
      revenueHistory: [
        { month: 'Jan', revenue: 6000 },
        { month: 'Fév', revenue: 6800 },
        { month: 'Mar', revenue: 7200 },
        { month: 'Avr', revenue: 7500 },
      ]
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const newClient = ClientStorageService.addClient(formData as Omit<Client, 'id'>, workspace);
    const updated = ClientStorageService.loadClients(workspace);
    setClients(updated);
    setIsAddModalOpen(false);
    haptics.trigger('success');
    AppEventBus.emit('CLIENT_UPDATED', 'clients', { action: 'add', client: newClient });
    showToast(`Client ${newClient.name} enregistré avec succès (persistant)`);
  };

  const handleOpenEdit = (client: Client) => {
    haptics.trigger('selection');
    setFormData({ ...client });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name?.trim()) return;

    const updated = ClientStorageService.updateClient(formData.id, formData, workspace);
    if (updated) {
      const refreshed = ClientStorageService.loadClients(workspace);
      setClients(refreshed);
      setSelectedClient(updated);
      setIsEditModalOpen(false);
      haptics.trigger('success');
      AppEventBus.emit('CLIENT_UPDATED', 'clients', { action: 'update', client: updated });
      showToast(`Fiche client ${updated.name} mise à jour`);
    }
  };

  const handleDeleteClient = (id: string, name: string) => {
    haptics.trigger('warning');
    if (confirm(`Confirmer la suppression définitive du compte ${name} ?`)) {
      ClientStorageService.deleteClient(id, workspace);
      const refreshed = ClientStorageService.loadClients(workspace);
      setClients(refreshed);
      setSelectedClient(null);
      haptics.trigger('medium');
      AppEventBus.emit('CLIENT_UPDATED', 'clients', { action: 'delete', clientId: id });
      showToast(`Compte ${name} supprimé de la base`);
    }
  };

  const handleAddContactToClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newContactData.name.trim()) return;

    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name: newContactData.name.trim(),
      role: newContactData.role.trim() || 'Directeur Projet & Stratégie',
      email: newContactData.email.trim() || 'contact@client.com',
      phone: newContactData.phone.trim() || '+33 1 00 00 00 00',
      decisionMaker: newContactData.decisionMaker,
      lastInteraction: "À l'instant",
      location: 'Paris, France (UTC+1)',
      preferredChannel: 'Slack Connect',
      interactions: [
        {
          id: `int-${Date.now()}`,
          type: 'meeting',
          date: "Aujourd'hui",
          summary: 'Prise de contact initiale et intégration au registre des interlocuteurs clés.',
          author: 'Équipe Compte'
        }
      ]
    };

    const updatedContacts = [...(selectedClient.contacts || []), newContact];
    const updatedClient = ClientStorageService.updateClient(selectedClient.id, { contacts: updatedContacts }, workspace);
    if (updatedClient) {
      setClients(ClientStorageService.loadClients(workspace));
      setSelectedClient(updatedClient);
    }

    haptics.trigger('success');
    showToast(`Contact ${newContact.name} ajouté au compte`);
    setNewContactData({ name: '', role: '', email: '', phone: '', decisionMaker: true });
    setIsAddContactOpen(false);
  };

  const handleAddProjectToClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newProjectData.name.trim()) return;

    const newProj: Project = {
      id: `p-${Date.now()}`,
      name: newProjectData.name.trim(),
      status: newProjectData.status,
      progress: newProjectData.progress,
      dueDate: newProjectData.dueDate.trim() || 'Fin de trimestre',
      budget: newProjectData.budget,
      lead: newProjectData.lead,
      priority: 'Haute',
      description: 'Projet d\'intégration et déploiement stratégique sur infrastructure sécurisée.',
      milestones: [
        { id: `m1-${Date.now()}`, title: 'Cadrage & Spécifications d\'architecture', dueDate: 'J+10', completed: true, owner: newProjectData.lead },
        { id: `m2-${Date.now()}`, title: 'Déploiement en pré-production & Tests de charge', dueDate: 'J+30', completed: false, owner: newProjectData.lead },
        { id: `m3-${Date.now()}`, title: 'Recette finale & Mise en production', dueDate: newProjectData.dueDate, completed: false, owner: newProjectData.lead }
      ],
      deliverables: [
        { name: 'Architecture_System_Specs.pdf', type: 'Spécification technique', status: 'ready' },
        { name: 'Security_Audit_Report.pdf', type: 'Rapport d\'audit', status: 'ready' }
      ]
    };

    const updatedProjects = [...(selectedClient.projects || []), newProj];
    const updatedClient = ClientStorageService.updateClient(selectedClient.id, { projects: updatedProjects }, workspace);
    if (updatedClient) {
      setClients(ClientStorageService.loadClients(workspace));
      setSelectedClient(updatedClient);
    }

    haptics.trigger('success');
    showToast(`Projet ${newProj.name} initialisé avec jalons`);
    setNewProjectData({ name: '', status: 'in-progress', progress: 15, dueDate: '30 Nov 2026', budget: 35000, lead: 'Lead Consultant' });
    setIsAddProjectOpen(false);
  };

  const handleOpenJsonManager = () => {
    haptics.trigger('selection');
    const jsonStr = ClientStorageService.exportJSON(workspace);
    setJsonInput(jsonStr);
    setIsJsonModalOpen(true);
  };

  const handleSaveJsonImport = () => {
    const result = ClientStorageService.importJSON(jsonInput, workspace);
    if (result.success) {
      const refreshed = ClientStorageService.loadClients(workspace);
      setClients(refreshed);
      setIsJsonModalOpen(false);
      haptics.trigger('success');
      AppEventBus.emit('CLIENT_UPDATED', 'clients', { action: 'import' });
      showToast(`${result.count} comptes importés avec succès`);
    } else {
      haptics.trigger('error');
      alert(`Erreur d'import : ${result.error}`);
    }
  };

  const handleResetDefaults = () => {
    haptics.trigger('warning');
    if (confirm('Réinitialiser le portefeuille aux données par défaut ?')) {
      const resetList = ClientStorageService.resetToDefaults(workspace);
      setClients(resetList);
      setSelectedClient(null);
      setIsJsonModalOpen(false);
      AppEventBus.emit('CLIENT_UPDATED', 'clients', { action: 'reset' });
      haptics.trigger('success');
      showToast('Base clients réinitialisée aux données de démonstration');
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || c.tier.toLowerCase() === filterTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const totalMRR = clients.reduce((acc, c) => acc + c.mrr, 0);
  const avgHealth = clients.length > 0 ? Math.round(clients.reduce((acc, c) => acc + c.healthScore, 0) / clients.length) : 0;
  const activeCount = clients.filter(c => c.status === 'active').length;

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={CLIENTS_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Contextual Sub-Bar with Breadcrumbs (Fil d'Ariane) */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Clients" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('portefeuille');
              setSelectedClient(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Clients</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {CLIENTS_TABS.find(t => t.id === activeTab)?.label || 'Portefeuille'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            {workspace} DB
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleOpenJsonManager}
            className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Download size={11} />
            <span className="hidden xs:inline">JSON</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PORTEFEUILLE (CLIENTS LIST & MASTER-DETAIL) */}
          {activeTab === 'portefeuille' && (
            <motion.div
              key="portefeuille"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Portefeuille Clients Entreprise"
                subtitle="Gestion centralisée des comptes, MRR et persistance JSON"
                badge={`${clients.length} Comptes Suivis`}
                icon={Users}
                kpis={[
                  { label: 'MRR Global', value: `$${totalMRR.toLocaleString()}`, sub: '+18.4% ce mois', trend: 'up' },
                  { label: 'Score Santé Moyen', value: `${avgHealth}/100`, sub: 'Optimum > 85', trend: 'up' },
                  { label: 'Comptes Actifs', value: `${activeCount}/${clients.length}`, sub: 'Taux rétention 96%' }
                ]}
              >
                {/* Search & Filtering Bar */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Rechercher un compte, secteur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shrink-0 text-xs">
                    {(['all', 'Enterprise', 'Scale', 'Growth'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => {
                          haptics.trigger('selection');
                          setFilterTier(tier);
                        }}
                        className={`px-2.5 py-1 rounded-xl transition-colors text-[11px] ${
                          filterTier === tier 
                            ? 'bg-slate-800 text-emerald-400 font-medium' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tier === 'all' ? 'Tous' : tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clients Cards List with Deep Interaction */}
                <div className="space-y-3">
                  {filteredClients.map((client) => {
                    const isAtRisk = client.status === 'at-risk';
                    const isLead = client.status === 'lead';
                    const isOnboarding = client.status === 'onboarding';

                    const badgeColor = isAtRisk
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : isOnboarding
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : isLead
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                    const badgeText = isAtRisk
                      ? 'À Risque'
                      : isOnboarding
                      ? 'Onboarding'
                      : isLead
                      ? 'Prospect'
                      : 'Actif & Sain';

                    return (
                      <DetailCard
                        key={client.id}
                        title={client.name}
                        subtitle={`${client.industry} • ${client.tier}`}
                        icon={Building2}
                        badge={badgeText}
                        badgeColor={badgeColor}
                        isInteractive
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedClient(client);
                        }}
                        actions={
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-100 text-xs">
                              ${client.mrr.toLocaleString()}<span className="text-[10px] text-slate-500 font-normal">/m</span>
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                              <ArrowUpRight size={13} />
                            </div>
                          </div>
                        }
                      >
                        {/* Nested Mini Data Rows */}
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Activity size={13} className={isAtRisk ? 'text-red-400' : 'text-emerald-400'} />
                              <span>Score Santé:</span>
                              <span className={`font-semibold ${isAtRisk ? 'text-red-400' : 'text-emerald-400'}`}>
                                {client.healthScore}/100
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Clock size={11} />
                              <span>{client.lastContact}</span>
                            </div>
                          </div>

                          {/* Mini Progress bar of health */}
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full rounded-full ${
                                isAtRisk ? 'bg-red-500' : client.healthScore > 90 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${client.healthScore}%` }}
                            />
                          </div>

                          {/* Quick sub-tags */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-400">
                              {client.contacts?.length || 0} Contact{(client.contacts?.length || 0) > 1 ? 's' : ''} • {client.projects?.length || 0} Projet{(client.projects?.length || 0) > 1 ? 's' : ''}
                            </span>
                            <span className="text-emerald-400/90 font-medium text-[10px]">
                              Inspecter la fiche →
                            </span>
                          </div>
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>

                <AIInsightCard
                  title="Supervision IA du Portefeuille"
                  content="Le moteur de recommandation vérifie la cohérence du schéma JSON et synchronise les enregistrements locaux sur chaque mutation."
                  actionLabel="Générer rapport de santé global"
                  onAction={() => {
                    haptics.trigger('selection');
                    showToast('Rapport de portefeuille consolidé avec succès');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: PIPELINE & ONBOARDING */}
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Pipeline d'Acquisition & Déploiement"
                subtitle="Suivi des étapes d'intégration technique et d'activation des contrats"
                icon={TrendingUp}
                badge="3 Déploiements Actifs"
                kpis={[
                  { label: 'Valeur Pipeline', value: '$64,000', sub: 'ARR Pondéré', trend: 'up' },
                  { label: 'Délai d\'Activation', value: '14 Jours', sub: 'Moyenne système' },
                  { label: 'Taux de Conversion', value: '78%', sub: '+6% vs mois N-1', trend: 'up' }
                ]}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { stage: '1. Cadrage & Architecture', count: 2, value: '$22k', color: 'border-sky-500/40 text-sky-400', desc: 'Définition des connecteurs d\'ontologie et dimensionnement des pods' },
                    { stage: '2. Intégration API & Webhooks', count: 1, value: '$18k', color: 'border-amber-500/40 text-amber-400', desc: 'Vérification des clés de chiffrement et configuration des endpoints' },
                    { stage: '3. Recette de Sécurité SOC2', count: 1, value: '$14k', color: 'border-purple-500/40 text-purple-400', desc: 'Audit des règles d\'isolation réseau et tests d\'intrusion' },
                    { stage: '4. Mise en Production', count: 1, value: '$10k', color: 'border-emerald-500/40 text-emerald-400', desc: 'Bascule du trafic en direct et monitoring des SLA 99.99%' },
                  ].map((step, idx) => (
                    <DetailCard
                      key={idx}
                      title={step.stage}
                      badge={`${step.count} Compte(s)`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Layers}
                      subtitle={step.desc}
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">ARR Estimé:</span>
                        <span className="font-mono font-bold text-slate-100">{step.value}</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: SANTÉ & RISQUES */}
          {activeTab === 'sante' && (
            <motion.div
              key="sante"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Matrice de Santé & Prévention du Churn"
                subtitle="Algorithmes prédictifs analysant la fréquence d'usage et les signaux faibles"
                icon={Activity}
                badge="1 Risque Détecté"
                kpis={[
                  { label: 'NPS Global', value: '+74', sub: 'Excellent (Benchmark 60)', trend: 'up' },
                  { label: 'Volatilité MRR', value: '1.2%', sub: 'Niveau minimal' },
                  { label: 'Expansion Potentielle', value: '+$34k', sub: 'D\'ici Q4 2026', trend: 'up' }
                ]}
              >
                <DetailCard
                  title="Analyse Détaillée des Risques"
                  subtitle="Comptes nécessitant une action prioritaire"
                  icon={AlertTriangle}
                  badge="Urgence Haute"
                  badgeColor="bg-red-500/10 text-red-400 border-red-500/30"
                >
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-red-300 text-xs">Global Tech Industries</span>
                        <span className="text-[10px] text-red-400 font-mono">Santé: 42/100</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Décroissance d'activité de -40% suite aux latences constatées sur le cluster Francfort. Un contact direct avec Charlie Davis est recommandé.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const found = clients.find(c => c.name.includes('Global Tech'));
                            if (found) setSelectedClient(found);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium text-center"
                        >
                          Ouvrir la fiche d'incident →
                        </button>
                        <button 
                          onClick={() => {
                            haptics.trigger('medium');
                            showToast('Ticket d\'urgence escaladé à l\'équipe Infrastructure');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-800"
                        >
                          Escalader Ingénierie
                        </button>
                      </div>
                    </div>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SUPPORT & SLA */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Engagements de Service & Tickets SLA"
                subtitle="Respect des temps de réponse et résolution des requêtes critiques"
                icon={ShieldAlert}
                badge="SLA 99.98% Respecté"
                kpis={[
                  { label: 'Temps Moyen Réponse', value: '14 min', sub: 'Objectif < 30 min', trend: 'up' },
                  { label: 'Tickets Résolus', value: '98.4%', sub: 'Premier contact' },
                  { label: 'Disponibilité API', value: '99.99%', sub: 'SLA Entreprise' }
                ]}
              >
                <div className="space-y-3">
                  {[
                    { id: 't1', client: 'Global Tech', title: 'Latence API v2 Frankfurt cluster', priority: 'P1 - Critique', time: 'Il y a 45m', status: 'En cours de diagnostic' },
                    { id: 't2', client: 'Nexus Dynamics', title: 'Extension quota token cognition', priority: 'P3 - Normale', time: 'Il y a 2h', status: 'Résolu (Quota doublé)' },
                    { id: 't3', client: 'Vortex Logistics', title: 'Validation certificat SSL webhook', priority: 'P2 - Moyenne', time: 'Il y a 4h', status: 'En attente retour client' }
                  ].map((ticket) => (
                    <DetailCard
                      key={ticket.id}
                      title={ticket.title}
                      subtitle={`${ticket.client} • ${ticket.time}`}
                      icon={ShieldAlert}
                      badge={ticket.priority}
                      badgeColor={ticket.priority.includes('P1') ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Statut: <strong className="text-slate-200">{ticket.status}</strong></span>
                        <button 
                          onClick={() => {
                            haptics.trigger('light');
                            showToast(`Ticket ${ticket.id} synchronisé`);
                          }}
                          className="text-emerald-400 hover:underline text-[11px] font-medium"
                        >
                          Détails du fil →
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 5: CONTRATS & FACTURATION */}
          {activeTab === 'contrats' && (
            <motion.div
              key="contrats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Contrats, Renouvellements & Facturation"
                subtitle="Engagements contractuels pluriannuels et cycles de facturation"
                icon={FileCheck}
                badge={`$${(totalMRR * 12).toLocaleString()} ARR Total`}
                kpis={[
                  { label: 'ARR Contractuel', value: `$${(totalMRR * 12).toLocaleString()}`, sub: 'Revenus récurrents', trend: 'up' },
                  { label: 'Comptes Signés', value: `${clients.length}`, sub: '100% conformes' },
                  { label: 'Factures Émises', value: '100%', sub: 'Zéro impayé' }
                ]}
              >
                <div className="space-y-3">
                  {clients.map((c) => (
                    <DetailCard
                      key={c.id}
                      title={c.name}
                      subtitle={`SLA: ${c.sla} • Renouvellement: ${c.renewalDate}`}
                      icon={FileText}
                      badge={`${c.tier} Plan`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedClient(c);
                      }}
                      actions={
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          ${(c.mrr * 12).toLocaleString()}/an
                        </span>
                      }
                    >
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="text-slate-400">Cycle de facturation: <strong className="text-slate-200">Mensuel Automatisé</strong></span>
                        <span className="text-slate-500 text-[11px]">Inspecter les clauses →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* DEEP DRILLDOWN SLIDE-OVER INSPECTOR FOR ANY SELECTED CLIENT */}
      <DetailDrawer
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.name || ''}
        subtitle={`${selectedClient?.industry} • Tier ${selectedClient?.tier}`}
        badge={selectedClient?.status === 'at-risk' ? 'À Risque' : selectedClient?.status === 'onboarding' ? 'Onboarding' : 'Actif'}
        badgeColor={selectedClient?.status === 'at-risk' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        avatarText={selectedClient?.name.charAt(0)}
        breadcrumbs={[
          { label: 'Clients', onClick: () => setSelectedClient(null) },
          { 
            label: CLIENTS_TABS.find(t => t.id === activeTab)?.label || 'Portefeuille', 
            onClick: () => setSelectedClient(null) 
          },
          { label: selectedClient?.name || 'Fiche Client' }
        ]}
        actions={[
          {
            id: 'edit',
            label: 'Modifier',
            icon: Edit,
            variant: 'primary',
            onClick: () => selectedClient && handleOpenEdit(selectedClient)
          },
          {
            id: 'call',
            label: 'Visio',
            icon: Phone,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Appel visio sécurisé initié avec ${selectedClient?.name}`);
            }
          },
          {
            id: 'delete',
            label: 'Supprimer',
            icon: Trash2,
            onClick: () => selectedClient && handleDeleteClient(selectedClient.id, selectedClient.name)
          }
        ]}
        kpis={[
          { label: 'Revenu MRR', value: `$${selectedClient?.mrr.toLocaleString()}`, sub: 'Mensuel garanti' },
          { label: 'Score Santé', value: `${selectedClient?.healthScore}/100`, sub: (selectedClient?.healthScore || 0) > 80 ? 'Optimal' : 'Sous surveillance' },
          { label: 'Niveau SLA', value: selectedClient?.sla.split(' ')[0] || '99.9%', sub: selectedClient?.sla.split(' ')[1] || 'SLA Standard' },
          { label: 'Échéance Renouvellement', value: selectedClient?.renewalDate || 'N/A', sub: 'Reconduction tacite' }
        ]}
        aiInsight={selectedClient?.aiInsight ? {
          title: selectedClient.aiInsight.title,
          content: selectedClient.aiInsight.content,
          actionLabel: selectedClient.aiInsight.actionLabel,
          onAction: () => {
            haptics.trigger('selection');
            showToast(`Action IA activée: ${selectedClient.aiInsight?.actionLabel}`);
          }
        } : undefined}
        tabs={[
          {
            id: 'analytics',
            label: 'MRR & Métriques',
            content: selectedClient ? (
              <ClientMetricsTab client={selectedClient} onToast={showToast} />
            ) : null
          },
          {
            id: 'contacts',
            label: `Contacts (${selectedClient?.contacts?.length || 0})`,
            content: (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Interlocuteurs Clés ({selectedClient?.contacts?.length || 0})
                  </span>
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setIsAddContactOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Nouveau Contact</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedClient?.contacts?.map((contact) => (
                    <div 
                      key={contact.id} 
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedContact(contact);
                      }}
                      className="p-3 bg-slate-900/90 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all duration-150 group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                            {contact.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-100 text-xs truncate group-hover:text-emerald-400 transition-colors">
                                {contact.name}
                              </span>
                              {contact.decisionMaker && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
                                  <ShieldCheck size={9} />
                                  Décisionnaire
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{contact.role}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {contact.lastInteraction || 'Récent'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-500 font-mono text-[10px] truncate max-w-[180px]">{contact.email}</span>
                        <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 text-[11px]">
                          Fiche & Échanges ({contact.interactions?.length || 0})
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'projects',
            label: `Projets (${selectedClient?.projects?.length || 0})`,
            content: (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Livrables & Déploiements ({selectedClient?.projects?.length || 0})
                  </span>
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setIsAddProjectOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Nouveau Projet</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedClient?.projects?.map((proj) => (
                    <div 
                      key={proj.id} 
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedProject(proj);
                      }}
                      className="p-3 bg-slate-900/90 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all duration-150 group space-y-2.5"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 text-xs truncate group-hover:text-sky-400 transition-colors">
                            {proj.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Briefcase size={10} className="text-slate-500" />
                            <span>Lead: {proj.lead || 'Équipe Technique'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            proj.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : proj.status === 'on-hold'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            {proj.status === 'completed' ? 'Terminé' : proj.status === 'on-hold' ? 'En Pause' : 'En Cours'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Avancement ({proj.milestones?.filter(m => m.completed).length || 0}/{proj.milestones?.length || 0} jalons)</span>
                          <span className="font-mono font-bold text-slate-200">{proj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300" 
                            style={{ width: `${proj.progress}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                        <span>Échéance: {proj.dueDate}</span>
                        <span className="text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 text-[11px]">
                          Inspecter jalons & budget
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]}
      />

      {/* MODAL FICHE DÉTAILLÉE CONTACT */}
      <ContactDetailModal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
        client={selectedClient}
        workspace={workspace}
        onUpdateContact={(updatedContact) => {
          setSelectedContact(updatedContact);
          if (selectedClient) {
            const updatedContacts = selectedClient.contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
            setSelectedClient({ ...selectedClient, contacts: updatedContacts });
            setClients(ClientStorageService.loadClients(workspace));
          }
        }}
        onToast={showToast}
      />

      {/* MODAL FICHE DÉTAILLÉE PROJET */}
      <ProjectDetailModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        client={selectedClient}
        workspace={workspace}
        onUpdateProject={(updatedProject) => {
          setSelectedProject(updatedProject);
          if (selectedClient) {
            const updatedProjects = selectedClient.projects.map(p => p.id === updatedProject.id ? updatedProject : p);
            setSelectedClient({ ...selectedClient, projects: updatedProjects });
            setClients(ClientStorageService.loadClients(workspace));
          }
        }}
        onToast={showToast}
      />

      {/* MODAL AJOUT CONTACT RAPIDE */}
      <AnimatePresence>
        {isAddContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-sm">Nouveau Contact Client</h3>
                </div>
                <button onClick={() => setIsAddContactOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddContactToClient} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    value={newContactData.name}
                    onChange={e => setNewContactData({ ...newContactData, name: e.target.value })}
                    placeholder="Ex: Sophie Martin"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rôle / Titre</label>
                  <input
                    type="text"
                    value={newContactData.role}
                    onChange={e => setNewContactData({ ...newContactData, role: e.target.value })}
                    placeholder="Ex: VP Engineering, CTO, Sponsor"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={newContactData.email}
                      onChange={e => setNewContactData({ ...newContactData, email: e.target.value })}
                      placeholder="sophie@client.com"
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={newContactData.phone}
                      onChange={e => setNewContactData({ ...newContactData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContactData.decisionMaker}
                    onChange={e => setNewContactData({ ...newContactData, decisionMaker: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300">Marquer comme décideur clé (Sponsor/Signataire)</span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Enregistrer le contact
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL AJOUT PROJET RAPIDE */}
      <AnimatePresence>
        {isAddProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-sky-400" />
                  <h3 className="font-bold text-sm">Nouveau Projet Client</h3>
                </div>
                <button onClick={() => setIsAddProjectOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddProjectToClient} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nom du Projet</label>
                  <input
                    type="text"
                    value={newProjectData.name}
                    onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                    placeholder="Ex: Migration BaaS & Cloud Pod"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Lead Responsable</label>
                    <input
                      type="text"
                      value={newProjectData.lead}
                      onChange={e => setNewProjectData({ ...newProjectData, lead: e.target.value })}
                      placeholder="Ex: Thomas L."
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Échéance Cible</label>
                    <input
                      type="text"
                      value={newProjectData.dueDate}
                      onChange={e => setNewProjectData({ ...newProjectData, dueDate: e.target.value })}
                      placeholder="Ex: 15 Déc 2026"
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Budget Alloué ($)</label>
                  <input
                    type="number"
                    value={newProjectData.budget}
                    onChange={e => setNewProjectData({ ...newProjectData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Créer le projet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CLIENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-sm">Nouveau Compte Client</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nom de l'entreprise *</label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Quantum Horizon Labs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">MRR ($) *</label>
                    <input
                      required
                      type="number"
                      value={formData.mrr || ''}
                      onChange={e => setFormData({ ...formData, mrr: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Score Santé (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.healthScore || ''}
                      onChange={e => setFormData({ ...formData, healthScore: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Secteur</label>
                    <input
                      type="text"
                      value={formData.industry || ''}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Ex: FinTech & IA"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Tier / Plan</label>
                    <select
                      value={formData.tier || 'Enterprise'}
                      onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="Scale">Scale</option>
                      <option value="Growth">Growth</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Statut</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="active">Actif</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="at-risk">À Risque</option>
                      <option value="lead">Prospect</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">SLA Contractuel</label>
                    <input
                      type="text"
                      value={formData.sla || '99.99% (SLA Or)'}
                      onChange={e => setFormData({ ...formData, sla: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Notes & Contexte Stratégique</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Objectifs de déploiement, interlocuteurs..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CLIENT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-sm">Modifier la Fiche Compte</h3>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nom de l'entreprise</label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">MRR ($)</label>
                    <input
                      type="number"
                      value={formData.mrr || ''}
                      onChange={e => setFormData({ ...formData, mrr: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Score Santé</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.healthScore || ''}
                      onChange={e => setFormData({ ...formData, healthScore: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Tier Plan</label>
                    <select
                      value={formData.tier || 'Enterprise'}
                      onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="Scale">Scale</option>
                      <option value="Growth">Growth</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Statut</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="active">Actif</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="at-risk">À Risque</option>
                      <option value="lead">Prospect</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JSON STORAGE SCHEMA SYNC & EXPORT/IMPORT MODAL */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl space-y-3 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-sm">Gestionnaire Schéma JSON & Persistance</h3>
                </div>
                <button onClick={() => setIsJsonModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Les données de vos clients sont synchronisées dans le stockage local persistant sous l'environnement <strong className="text-emerald-400">{workspace}</strong>.
              </p>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Payload JSON (Édition directe / Export / Import) :</label>
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  className="w-full bg-slate-950 font-mono text-[11px] text-emerald-400 p-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <button
                  onClick={handleResetDefaults}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors flex items-center gap-1.5 text-[11px]"
                >
                  <RotateCcw size={12} />
                  <span>Réinitialiser</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(jsonInput);
                      haptics.trigger('light');
                      showToast('JSON copié dans le presse-papier');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium"
                  >
                    Copier
                  </button>
                  <button
                    onClick={handleSaveJsonImport}
                    className="py-2 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md flex items-center gap-1"
                  >
                    <Upload size={13} strokeWidth={2.5} />
                    <span>Sauvegarder JSON</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Toast Notification */}
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
