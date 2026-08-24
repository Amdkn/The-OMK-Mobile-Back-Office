import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Send, 
  GraduationCap, 
  DollarSign, 
  ChevronDown, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building2, 
  MapPin, 
  Award, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  Check, 
  AlertCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Bot, 
  Play, 
  Zap, 
  ArrowUpRight, 
  Download, 
  Eye, 
  Share2, 
  Copy, 
  Trophy, 
  BookOpen, 
  BadgeCheck, 
  ShieldCheck, 
  Landmark, 
  Video, 
  BarChart3, 
  X,
  Target,
  FileCheck,
  Activity,
  Compass,
  FileSearch,
  MessageSquareCode
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { haptics } from '../../services/haptics';
import { Candidat, Entreprise, ProjetCirculaire, TransactionAffiliation, JaaSFormation, JaaSDispatchMission } from '../../types';
import { AppEventBus, OMK_EVENTS } from '../../services/eventBus';
import { useAppEventListener } from '../../hooks/useAppEventBus';
import DetailDrawer from '../layout/DetailDrawer';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';

interface NavTab {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  desc?: string;
  row?: number;
}

// 4 Onglets Métier Centraux
const PRIMARY_TABS: NavTab[] = [
  { id: 'profiles', label: 'Profils Master', icon: Users, badge: '18 CVs' },
  { id: 'dispatch', label: 'Multi-Dispatch 1-Click', icon: Send, badge: 'SLA 48h' },
  { id: 'training', label: 'Formations & Bilans', icon: GraduationCap, badge: 'CPF / CACES' },
  { id: 'affiliates', label: 'Affiliation ($50/filleul)', icon: DollarSign, badge: '$50/u' }
];

// Menu Extensible sur 3 Lignes de Rubriques Métier (12 sous-pages)
const EXTENDED_TABS: NavTab[] = [
  // Ligne 1 : Candidats & Accélération de Carrière
  { id: 'audit_cv', label: 'Audit CV & Scoring IA', icon: FileSearch, badge: 'ATS 98%', desc: 'Diagnostic sémantique, extraction des mots-clés et optimisation 1-Click', row: 1 },
  { id: 'interview_sim', label: 'Simulations Entretiens IA', icon: MessageSquareCode, badge: 'Live', desc: 'Entraînement vocal et mise en situation face au coach recruteur virtuel', row: 1 },
  { id: 'skills_passport', label: 'Passeport Compétences', icon: Award, badge: 'CACES 1-3-5', desc: 'Registre blockchain des certifications, permis cariste et habilitations SST', row: 1 },
  { id: 'job_radar', label: 'Radar Offres 30km', icon: Compass, badge: 'Bassin Local', desc: 'Scraping d\'opportunités d\'embauche prioritaires en flux continu', row: 1 },

  // Ligne 2 : Réseau Entreprises & Dispatch
  { id: 'hubs_map', label: 'Bassins & Entrepôts', icon: Building2, badge: 'Hubs IDF', desc: 'Cartographie des plateformes logistiques partenaires (Garonor, Rungis...)', row: 2 },
  { id: 'recruiters_sla', label: 'Réseau Recruteurs SLA', icon: ShieldCheck, badge: '48h Garanti', desc: 'Conventions d\'engagement mutuel et suivi des réponses sous 48 heures', row: 2 },
  { id: 'contracts_1click', label: 'Contrats 1-Click', icon: FileCheck, badge: 'eIDAS', desc: 'Génération et signature numérique de promesses d\'embauche et conventions', row: 2 },
  { id: 'trial_followup', label: 'Suivi Période d\'Essai', icon: Activity, badge: 'Garantie J+60', desc: 'Points de contrôle J+7, J+30 et garantie de remplacement candidat', row: 2 },

  // Ligne 3 : Monétisation, Bilans & Affiliés
  { id: 'ambassadors_rank', label: 'Réseau Ambassadeurs', icon: Trophy, badge: 'Top 10', desc: 'Classement des parrains actifs, commissions débloquées et kit de parrainage', row: 3 },
  { id: 'funding_cpf', label: 'Financements CPF & OPCO', icon: Landmark, badge: '100% Pris en charge', desc: 'Instruction des dossiers Qualiopi, abondements région et tiers-payant', row: 3 },
  { id: 'webinars_pro', label: 'Webinaires Pro & Live', icon: Video, badge: 'Hebdo', desc: 'Sessions collectives de coaching, masterclasses logistique et replays', row: 3 },
  { id: 'analytics_roi', label: 'Analytics & Taux Insertion', icon: BarChart3, badge: '94.2% ROI', desc: 'Mesure de performance de l\'abonnement annuel $300/an et salaire moyen', row: 3 }
];

// DONNÉES INITIALES MÉTIER
const INITIAL_CANDIDATS: Candidat[] = [
  {
    id: 'cand-1',
    nomComplet: 'Karim Benali',
    posteCible: 'Cariste d\'Entrepôt CACES 1-3-5',
    bassinEmploi: 'Garonor / Aulnay-sous-Bois (93)',
    scoreEmployabilite: 96,
    statut: 'en_attente_dispatch',
    anneesExperience: '4 ans',
    competences: ['CACES R489 1A/1B/3/5', 'Gestion WMS Reflex', 'Préparation vocale', 'Scan RF'],
    certifications: ['CACES 1-3-5 Renouvelé 2026', 'SST Sauveteur Secouriste'],
    email: 'k.benali@candidat-jaas.pro',
    telephone: '+33 6 42 11 89 01',
    pretentionSalariale: '24,500 € / an',
    auditIANotes: 'Profil ultra-qualifié. CV ATS validé à 98/100. Prêt pour dispatch immédiat en plateforme logistique.',
    nombreDispatches: 3,
    formuleAbonnement: 'jaas_annuel_300',
    dateInscription: '12 Août 2026'
  },
  {
    id: 'cand-2',
    nomComplet: 'Sarah Mondovian',
    posteCible: 'Chef d\'Équipe Logistique & Flux',
    bassinEmploi: 'Plateforme Rungis / Orly (94)',
    scoreEmployabilite: 92,
    statut: 'entretien_planifie',
    anneesExperience: '6 ans',
    competences: ['Management 15 préparateurs', 'Optimisation picking', 'Lean Warehousing', 'SAP EWM'],
    certifications: ['Titre Pro Technicien Logistique', 'CACES 3'],
    email: 's.mondovian@candidat-jaas.pro',
    telephone: '+33 6 55 90 23 44',
    pretentionSalariale: '34,000 € / an',
    auditIANotes: 'Excellente posture managériale. Entretien confirmé chez LogiPrime sous SLA 48h.',
    nombreDispatches: 2,
    dateDernierDispatch: 'Il y a 18h',
    formuleAbonnement: 'jaas_annuel_300',
    dateInscription: '10 Août 2026'
  },
  {
    id: 'cand-3',
    nomComplet: 'Mamadou Diop',
    posteCible: 'Préparateur de Commandes Drive & E-commerce',
    bassinEmploi: 'Hub Trappes / Saint-Quentin (78)',
    scoreEmployabilite: 89,
    statut: 'dispatche',
    anneesExperience: '2 ans',
    competences: ['Picking cadencé', 'Contrôle qualité', 'Emballage automatisé', 'Transpalette électrique'],
    certifications: ['CACES R489 1A', 'Habilitation Électrique H0B0'],
    email: 'm.diop@candidat-jaas.pro',
    telephone: '+33 7 88 12 45 67',
    pretentionSalariale: '22,800 € / an',
    auditIANotes: 'Candidat réactif et ponctuel. Envoi multi-dispatch validé vers 3 entrepôts IDF.',
    nombreDispatches: 4,
    dateDernierDispatch: 'Il y a 6h',
    formuleAbonnement: 'jaas_annuel_300',
    dateInscription: '15 Août 2026'
  },
  {
    id: 'cand-4',
    nomComplet: 'Élodie Laurent',
    posteCible: 'Gestionnaire Approvisionnements & Stocks',
    bassinEmploi: 'Roissy CDG / Tremblay (93)',
    scoreEmployabilite: 95,
    statut: 'embauche',
    anneesExperience: '5 ans',
    competences: ['Gestion inventaires tournants', 'ERP Logistique', 'Douanes fret', 'Excel Avancé'],
    certifications: ['DUT Gestion Logistique & Transport', 'Certification OMK Supply'],
    email: 'e.laurent@candidat-jaas.pro',
    telephone: '+33 6 12 77 43 90',
    pretentionSalariale: '31,500 € / an',
    auditIANotes: 'Contrat CDI signé après dispatch JaaS 1-Click. Période d\'essai validée.',
    nombreDispatches: 1,
    formuleAbonnement: 'jaas_annuel_300',
    dateInscription: '01 Août 2026'
  }
];

const INITIAL_ENTREPRISES: Entreprise[] = [
  {
    id: 'ent-1',
    nom: 'LogiPrime Île-de-France',
    secteur: 'Logistique & Entrepôt',
    bassin: 'Garonor & Aulnay (93)',
    adresse: 'Bâtiment 4B, Zone Fret Garonor',
    contactRH: 'Marc Vigneron (DRH)',
    emailRH: 'm.vigneron@logiprime.fr',
    telephoneRH: '+33 1 48 65 20 00',
    slaHeures: 48,
    postesOuverts: 8,
    recrutementsJaaS: 14,
    statutPartenaire: 'certifie_omk',
    dateConvention: '15 Janvier 2026',
    rating: 4.9,
    notes: 'Partenaire historique. SLA moyen de réponse : 18 heures.'
  },
  {
    id: 'ent-2',
    nom: 'TransCold Frais Rungis',
    secteur: 'Retail & Distribution',
    bassin: 'Marché International de Rungis (94)',
    adresse: 'Pavillon E4, MIN Rungis',
    contactRH: 'Valérie Dupont',
    emailRH: 'rh@transcold-rungis.com',
    telephoneRH: '+33 1 46 87 11 22',
    slaHeures: 48,
    postesOuverts: 5,
    recrutementsJaaS: 9,
    statutPartenaire: 'actif',
    dateConvention: '20 Mars 2026',
    rating: 4.7
  },
  {
    id: 'ent-3',
    nom: 'EcoHub Distribution Verte',
    secteur: 'Industrie Verte',
    bassin: 'Trappes / Éancourt (78)',
    adresse: 'Parc d\'Activités des Pépinières',
    contactRH: 'Thomas Meyer',
    emailRH: 'recrutement@ecohub.eu',
    telephoneRH: '+33 1 30 50 44 80',
    slaHeures: 48,
    postesOuverts: 4,
    recrutementsJaaS: 6,
    statutPartenaire: 'certifie_omk',
    dateConvention: '05 Mai 2026',
    rating: 4.8
  }
];

const INITIAL_PROJETS_CIRCULAIRES: ProjetCirculaire[] = [
  {
    id: 'proj-1',
    titre: 'Parcours SAS Logistique Cariste CACES 1-3-5',
    candidatId: 'cand-1',
    candidatNom: 'Karim Benali',
    entrepriseId: 'ent-1',
    entrepriseNom: 'LogiPrime Île-de-France',
    statut: 'placement_actif',
    progression: 75,
    parrainNom: 'Yassine M. (Ambassadeur)',
    mentorNom: 'Coach AI & Marc V.',
    prochaineEtape: 'Entretien final le 25/08 à 10h00',
    financementCPF: true,
    gainAnnuelEstime: '24,500 €',
    dateDemarrage: '12 Août 2026',
    slaDaysRemaining: 2
  },
  {
    id: 'proj-2',
    titre: 'Reconversion Chef d\'Équipe WMS / SAP',
    candidatId: 'cand-2',
    candidatNom: 'Sarah Mondovian',
    entrepriseId: 'ent-2',
    entrepriseNom: 'TransCold Frais Rungis',
    statut: 'periode_essai',
    progression: 90,
    parrainNom: 'Nadia B. (Top Parrain)',
    mentorNom: 'Valérie Dupont',
    prochaineEtape: 'Bilan J+30 prévu le 02/09',
    financementCPF: true,
    gainAnnuelEstime: '34,000 €',
    dateDemarrage: '01 Août 2026',
    slaDaysRemaining: 8
  }
];

const INITIAL_AFFILIATION_TRANSACTIONS: TransactionAffiliation[] = [
  {
    id: 'aff-tx-1',
    parrainNom: 'Yassine Mansouri',
    parrainEmail: 'y.mansouri@ambassadeur-jaas.io',
    codeParrain: 'OMK-YASSINE-50',
    filleulNom: 'Karim Benali',
    filleulEmail: 'k.benali@candidat-jaas.pro',
    montantCommission: 50,
    statut: 'credite',
    dateTransaction: '12 Août 2026',
    planAbonnement: 'JaaS $300/an',
    factureRef: 'INV-JAAS-8812',
    modePaiement: 'Solde OMK'
  },
  {
    id: 'aff-tx-2',
    parrainNom: 'Nadia Belkacem',
    parrainEmail: 'n.belkacem@ambassadeur-jaas.io',
    codeParrain: 'OMK-NADIA-50',
    filleulNom: 'Sarah Mondovian',
    filleulEmail: 's.mondovian@candidat-jaas.pro',
    montantCommission: 50,
    statut: 'verse',
    dateTransaction: '10 Août 2026',
    planAbonnement: 'JaaS $300/an',
    factureRef: 'INV-JAAS-8790',
    modePaiement: 'Stripe Connect'
  },
  {
    id: 'aff-tx-3',
    parrainNom: 'Yassine Mansouri',
    parrainEmail: 'y.mansouri@ambassadeur-jaas.io',
    codeParrain: 'OMK-YASSINE-50',
    filleulNom: 'Mamadou Diop',
    filleulEmail: 'm.diop@candidat-jaas.pro',
    montantCommission: 50,
    statut: 'credite',
    dateTransaction: '15 Août 2026',
    planAbonnement: 'JaaS $300/an',
    factureRef: 'INV-JAAS-8845',
    modePaiement: 'Solde OMK'
  },
  {
    id: 'aff-tx-4',
    parrainNom: 'Yassine Mansouri',
    parrainEmail: 'y.mansouri@ambassadeur-jaas.io',
    codeParrain: 'OMK-YASSINE-50',
    filleulNom: 'Sébastien Roux',
    filleulEmail: 's.roux@candidat-jaas.pro',
    montantCommission: 50,
    statut: 'credite',
    dateTransaction: '18 Août 2026',
    planAbonnement: 'JaaS $300/an',
    factureRef: 'INV-JAAS-8899',
    modePaiement: 'Solde OMK'
  }
];

const INITIAL_FORMATIONS: JaaSFormation[] = [
  {
    id: 'form-1',
    title: 'Passeport CACES R489 Catégories 1A, 1B, 3, 5',
    category: 'CACES & Logistique',
    durationHours: 35,
    enrolledCandidates: 14,
    completionRate: 98,
    certifyingBody: 'Qualiopi / CACES Certifié',
    badgeCode: 'CACES-PRO-2026',
    status: 'active',
    nextSessionDate: 'Lundi 25 Août 2026',
    aiSyllabusSummary: 'Maîtrise de la conduite en sécurité des chariots élévateurs, gerbage en hauteur et circulation en allées étroites.'
  },
  {
    id: 'form-2',
    title: 'Bilan d\'Employabilité & Simulation Entretiens IA',
    category: 'Bilan & Soft Skills',
    durationHours: 12,
    enrolledCandidates: 28,
    completionRate: 100,
    certifyingBody: 'OMK Talent Academy',
    badgeCode: 'SOFT-SKILLS-IA',
    status: 'active',
    nextSessionDate: 'Permanent (100% en ligne)',
    aiSyllabusSummary: 'Entraînement immersif avec scoring instantané sur la posture, la négociation salariale et la valorisation des compétences.'
  },
  {
    id: 'form-3',
    title: 'WMS & Outils Numériques Logistique (SAP, Reflex)',
    category: 'IA & Numérique',
    durationHours: 20,
    enrolledCandidates: 9,
    completionRate: 91,
    certifyingBody: 'CPF Éligible 100%',
    badgeCode: 'WMS-REFLEX-SAP',
    status: 'scheduled',
    nextSessionDate: '01 Septembre 2026',
    aiSyllabusSummary: 'Gestion informatisée des emplacements, traçabilité des palettes et interfaçage avec les terminaux radiofréquence.'
  }
];

export default function JaaS() {
  const [activeTab, setActiveTab] = useState<string>('profiles');
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ÉTATS DES DONNÉES
  const [candidats, setCandidats] = useState<Candidat[]>(INITIAL_CANDIDATS);
  const [entreprises, setEntreprises] = useState<Entreprise[]>(INITIAL_ENTREPRISES);
  const [projets, setProjets] = useState<ProjetCirculaire[]>(INITIAL_PROJETS_CIRCULAIRES);
  const [affiliations, setAffiliations] = useState<TransactionAffiliation[]>(INITIAL_AFFILIATION_TRANSACTIONS);
  const [formations, setFormations] = useState<JaaSFormation[]>(INITIAL_FORMATIONS);

  // TIROIR D'INSPECTION (DetailDrawer)
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [selectedProjet, setSelectedProjet] = useState<ProjetCirculaire | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionAffiliation | null>(null);

  // MODALES D'ACTION
  const [isNewCandidatModalOpen, setIsNewCandidatModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);
  const [isSimInterviewModalOpen, setIsSimInterviewModalOpen] = useState(false);

  // Formulaire nouveau candidat
  const [newNom, setNewNom] = useState('');
  const [newPoste, setNewPoste] = useState('Cariste CACES 1-3-5');
  const [newBassin, setNewBassin] = useState('Garonor / Aulnay (93)');
  const [newEmail, setNewEmail] = useState('');
  const [newTel, setNewTel] = useState('');
  const [newExp, setNewExp] = useState('3 ans');
  const [newSalaire, setNewSalaire] = useState('25,000 € / an');

  // Formulaire dispatch
  const [selectedDispatchCandidateId, setSelectedDispatchCandidateId] = useState<string>('');
  const [selectedTargetCompanyId, setSelectedTargetCompanyId] = useState<string>('');

  // Formulaire affiliation
  const [newFilleulNom, setNewFilleulNom] = useState('');
  const [newFilleulEmail, setNewFilleulEmail] = useState('');
  const [newParrainCode, setNewParrainCode] = useState('OMK-YASSINE-50');

  // Simulation d'entretien
  const [simQuestion, setSimQuestion] = useState('Présentez-vous et expliquez pourquoi la sécurité en entrepôt est votre priorité n°1.');
  const [simAnswer, setSimAnswer] = useState('');
  const [simFeedback, setSimFeedback] = useState<string | null>(null);
  const [isAnalyzingSim, setIsAnalyzingSim] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Réaction aux événements de l'AppEventBus OMK
  useAppEventListener('*', (event) => {
    if (event.type === 'candidat:dispatched' || event.type === OMK_EVENTS.CANDIDAT_DISPATCHED) {
      showToast(`⚡ Dispatch actif : ${event.payload?.candidatNom || 'Candidat'} envoyé à ${event.payload?.companyName || 'Entreprise'}`);
    } else if (event.type === 'company:registered' || event.type === OMK_EVENTS.COMPANY_REGISTERED) {
      showToast(`🏢 Nouvelle entreprise partenaire : ${event.payload?.companyName || 'Entreprise'}`);
    } else if (event.type === 'referral:credited' || event.type === OMK_EVENTS.AFFILIATE_REFERRAL_CREDITED) {
      showToast(`💰 Commission affiliée : +$50 crédités pour ${event.payload?.parrainNom || 'Parrain'}`);
    }
  });

  const isExtendedTabActive = EXTENDED_TABS.some(t => t.id === activeTab);
  const activeExtendedTabObj = EXTENDED_TABS.find(t => t.id === activeTab);

  const handleTabSelect = (tabId: string) => {
    haptics.trigger('selection');
    setActiveTab(tabId);
  };

  // Calculs Affiliation ($50/filleul, objectif 6 filleuls = $300 remboursés)
  const totalReferralsCount = affiliations.length;
  const targetReferrals = 6;
  const currentReferralEarnings = totalReferralsCount * 50;
  const referralTargetProgress = Math.min(100, Math.round((totalReferralsCount / targetReferrals) * 100));

  // Candidats filtrés
  const filteredCandidats = useMemo(() => {
    return candidats.filter(c => {
      const matchQuery = 
        c.nomComplet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.posteCible.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bassinEmploi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.statut === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [candidats, searchQuery, statusFilter]);

  // Handler: Création de Candidat Master
  const handleCreateCandidat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom || !newEmail) return;

    const newCand: Candidat = {
      id: `cand-${Date.now()}`,
      nomComplet: newNom,
      posteCible: newPoste,
      bassinEmploi: newBassin,
      scoreEmployabilite: Math.floor(Math.random() * 10) + 90, // 90-99
      statut: 'en_attente_dispatch',
      anneesExperience: newExp,
      competences: ['CACES R489', 'WMS Reflex', 'Préparation de Commandes', 'Contrôle Qualité'],
      certifications: ['Passeport CACES OMK', 'SST Validé'],
      email: newEmail,
      telephone: newTel || '+33 6 00 00 00 00',
      pretentionSalariale: newSalaire,
      auditIANotes: 'Profil validé par l\'audit IA JaaS. Score ATS optimal. Prêt pour multi-dispatch.',
      nombreDispatches: 0,
      formuleAbonnement: 'jaas_annuel_300',
      dateInscription: 'Aujourd\'hui'
    };

    setCandidats(prev => [newCand, ...prev]);
    setIsNewCandidatModalOpen(false);
    setNewNom('');
    setNewEmail('');
    setNewTel('');

    haptics.trigger('success');
    showToast(`Master Profil créé : ${newCand.nomComplet} (Score IA : ${newCand.scoreEmployabilite}/100)`);

    AppEventBus.emit('candidat:created', 'jaas-job', { candidatId: newCand.id, nom: newCand.nomComplet });
  };

  // Handler: Déclenchement du Multi-Dispatch 1-Click
  const handleLaunchDispatch = (candId?: string, entId?: string) => {
    const candidateToDispatch = candidats.find(c => c.id === (candId || selectedDispatchCandidateId)) || candidats[0];
    const targetEnt = entreprises.find(e => e.id === (entId || selectedTargetCompanyId)) || entreprises[0];

    if (!candidateToDispatch || !targetEnt) return;

    setCandidats(prev => prev.map(c => {
      if (c.id === candidateToDispatch.id) {
        return {
          ...c,
          statut: 'dispatche',
          nombreDispatches: c.nombreDispatches + 1,
          dateDernierDispatch: 'À l\'instant'
        };
      }
      return c;
    }));

    // Créer ou mettre à jour un projet circulaire
    const newProj: ProjetCirculaire = {
      id: `proj-${Date.now()}`,
      titre: `Dispatch Express : ${candidateToDispatch.posteCible}`,
      candidatId: candidateToDispatch.id,
      candidatNom: candidateToDispatch.nomComplet,
      entrepriseId: targetEnt.id,
      entrepriseNom: targetEnt.nom,
      statut: 'placement_actif',
      progression: 60,
      mentorNom: targetEnt.contactRH,
      prochaineEtape: `Retour recruteur attendu sous 48h (SLA Garanti)`,
      financementCPF: true,
      gainAnnuelEstime: candidateToDispatch.pretentionSalariale,
      dateDemarrage: 'Aujourd\'hui',
      slaDaysRemaining: 2
    };

    setProjets(prev => [newProj, ...prev]);
    setIsDispatchModalOpen(false);

    haptics.trigger('appLaunch');
    showToast(`🚀 Multi-Dispatch 1-Click envoyé à ${targetEnt.nom} (SLA 48h actif)`);

    AppEventBus.emitCandidatDispatched(candidateToDispatch, targetEnt.nom, newProj.id);
  };

  // Handler: Enregistrement d'un Filleul ($50 commission)
  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilleulNom || !newFilleulEmail) return;

    const newTx: TransactionAffiliation = {
      id: `aff-tx-${Date.now()}`,
      parrainNom: 'Yassine Mansouri (Vous)',
      parrainEmail: 'y.mansouri@ambassadeur-jaas.io',
      codeParrain: newParrainCode,
      filleulNom: newFilleulNom,
      filleulEmail: newFilleulEmail,
      montantCommission: 50,
      statut: 'credite',
      dateTransaction: 'Aujourd\'hui',
      planAbonnement: 'JaaS $300/an',
      factureRef: `INV-JAAS-${Math.floor(Math.random() * 9000) + 1000}`,
      modePaiement: 'Solde OMK'
    };

    setAffiliations(prev => [newTx, ...prev]);
    setIsNewReferralModalOpen(false);
    setNewFilleulNom('');
    setNewFilleulEmail('');

    haptics.trigger('success');
    showToast(`🎉 Filleul inscrit ! Commission de +$50 créditée (Total : $${(affiliations.length + 1) * 50}/$300)`);

    AppEventBus.emitReferralCredited(newTx);
  };

  // Handler: Évaluation simulation IA
  const handleAnalyzeSimulation = () => {
    if (!simAnswer) return;
    setIsAnalyzingSim(true);
    haptics.trigger('selection');

    setTimeout(() => {
      setIsAnalyzingSim(false);
      setSimFeedback(`✅ Excellent score de clarté (94/100). Points forts : mention du respect strict des protocoles de circulation piéton/engin et des EPI. Recommandation : préciser l'expérience sur terminaux vocaux pour maximiser l'offre salariale.`);
      haptics.trigger('success');
      AppEventBus.emit('simulation:completed', 'jaas-job', { score: 94 });
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-14 left-4 right-4 z-50 p-3 rounded-2xl bg-emerald-500 text-slate-950 font-semibold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/50 backdrop-blur-md"
          >
            <CheckCircle2 size={16} className="text-slate-950 shrink-0" />
            <span className="truncate flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 5-Button Segmented Navigation Bar (Structure Extensible style Settings) */}
      <div className="p-2 sm:p-2.5 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-30 shrink-0">
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-2xl">
          {/* 4 Onglets Métier Centraux */}
          {PRIMARY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-slate-100 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeJaaSTopPill"
                    className="absolute inset-0 bg-slate-800/95 border border-emerald-500/40 rounded-xl -z-0 shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}

                {/* Badge */}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute top-0.5 right-1 z-20 min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full text-[8px] font-black leading-none shadow-xs whitespace-nowrap border border-slate-950/20 ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                <div className="relative z-10 flex flex-col items-center w-full">
                  <Icon size={14} className={`mb-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[9px] sm:text-[9.5px] leading-tight truncate w-full text-center px-0.5">
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}

          {/* 5ème Bouton : Menu Extensible Accordéon */}
          <button
            onClick={() => {
              haptics.trigger('light');
              setIsMenuExpanded(prev => !prev);
            }}
            title={isMenuExpanded ? "Réduire les rubriques" : "Étendre pour voir les 12 rubriques métier"}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
              isExtendedTabActive || isMenuExpanded
                ? 'text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Dynamic Extended Badge */}
            <span
              className={`absolute top-0.5 right-1 z-20 min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full text-[8px] font-black leading-none shadow-xs whitespace-nowrap border border-slate-950/20 ${
                isExtendedTabActive
                  ? 'bg-emerald-500 text-slate-950'
                  : isMenuExpanded
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {isExtendedTabActive ? '•' : `+${EXTENDED_TABS.length}`}
            </span>

            <div className="relative z-10 flex flex-col items-center w-full">
              <motion.div
                animate={{ rotate: isMenuExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="mb-0.5"
              >
                <ChevronDown size={14} className={isExtendedTabActive || isMenuExpanded ? 'text-emerald-400' : 'text-slate-400'} />
              </motion.div>
              <span className="text-[9px] sm:text-[9.5px] leading-tight truncate w-full text-center px-0.5 font-medium">
                {isExtendedTabActive && activeExtendedTabObj ? activeExtendedTabObj.label.split(' ')[0] : 'Étendre'}
              </span>
            </div>
          </button>
        </div>

        {/* Panneau Déroulant : 12 Sous-Pages Métier Organisées en 3 Lignes Thématiques */}
        <AnimatePresence>
          {isMenuExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="overflow-hidden bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 px-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <SlidersHorizontal size={13} className="text-emerald-400" />
                  <span>Architecture Métier JaaS (JOB as a Service - $300)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  12 Modules
                </span>
              </div>

              {/* Ligne 1 : Candidats & Accélération */}
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5 px-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ligne 1 : Candidats & Accélération de Carrière
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {EXTENDED_TABS.filter(t => t.row === 1).map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          handleTabSelect(tab.id);
                          setIsMenuExpanded(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-100 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10.5px] font-semibold truncate leading-tight">
                              {tab.label}
                            </span>
                            {tab.badge && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[8.5px] text-slate-400 truncate mt-0.5">
                            {tab.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ligne 2 : Réseau Entreprises & Dispatch */}
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5 px-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Ligne 2 : Réseau Entreprises & Multi-Dispatch
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {EXTENDED_TABS.filter(t => t.row === 2).map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          handleTabSelect(tab.id);
                          setIsMenuExpanded(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-blue-500/15 border-blue-500/50 text-slate-100 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-blue-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10.5px] font-semibold truncate leading-tight">
                              {tab.label}
                            </span>
                            {tab.badge && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[8.5px] text-slate-400 truncate mt-0.5">
                            {tab.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ligne 3 : Monétisation, Bilans & Affiliation */}
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5 px-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Ligne 3 : Monétisation, Bilans & Réseau d\'Affiliation
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {EXTENDED_TABS.filter(t => t.row === 3).map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          handleTabSelect(tab.id);
                          setIsMenuExpanded(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500/50 text-slate-100 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10.5px] font-semibold truncate leading-tight">
                              {tab.label}
                            </span>
                            {tab.badge && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[8.5px] text-slate-400 truncate mt-0.5">
                            {tab.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* ========================================================================= */}
        {/* ONGLET 1 : PROFILS MASTER                                                */}
        {/* ========================================================================= */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            {/* Header Action & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher cariste, CACES, nom, bassin..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 px-2.5 py-2 focus:outline-hidden"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en_attente_dispatch">En attente dispatch</option>
                  <option value="dispatche">Multi-dispatché</option>
                  <option value="entretien_planifie">Entretien planifié</option>
                  <option value="embauche">Embauché</option>
                </select>
              </div>

              <button
                onClick={() => {
                  haptics.trigger('light');
                  setIsNewCandidatModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg transition-all"
              >
                <Plus size={14} />
                <span>Nouveau Candidat Master</span>
              </button>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Profils Actifs JaaS</span>
                <div className="text-xl font-black text-slate-100 mt-1">{candidats.length} CVs</div>
                <span className="text-[10px] text-emerald-400 mt-1 font-mono">100% Qualifiés ATS</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">En Attente Dispatch</span>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {candidats.filter(c => c.statut === 'en_attente_dispatch').length}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">SLA &lt; 48h</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Taux d\'Employabilité</span>
                <div className="text-xl font-black text-emerald-400 mt-1">94.2%</div>
                <span className="text-[10px] text-emerald-400 mt-1 font-mono">Score IA Moyen</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Abonnement Annuel</span>
                <div className="text-xl font-black text-blue-400 mt-1">$300 / an</div>
                <span className="text-[10px] text-blue-300 mt-1 font-mono">Amorti à 6 filleuls</span>
              </div>
            </div>

            {/* List of Candidates */}
            <div className="space-y-2">
              {filteredCandidats.map((candidat) => (
                <div
                  key={candidat.id}
                  onClick={() => {
                    haptics.trigger('selection');
                    setSelectedCandidat(candidat);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      {candidat.scoreEmployabilite}%
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{candidat.nomComplet}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          candidat.statut === 'en_attente_dispatch'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : candidat.statut === 'embauche'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {candidat.statut.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{candidat.posteCible}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-slate-500" />
                          {candidat.bassinEmploi}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={11} className="text-slate-500" />
                          {candidat.anneesExperience}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <DollarSign size={11} />
                          {candidat.pretentionSalariale}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDispatchCandidateId(candidat.id);
                        setIsDispatchModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Send size={12} />
                      <span>Multi-Dispatch 1-Click</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 2 : MULTI-DISPATCH 1-CLICK                                        */}
        {/* ========================================================================= */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Moteur de Multi-Dispatch 1-Click</h3>
                    <p className="text-xs text-slate-400">Envoi simultané des CV Master aux recruteurs conventionnés avec SLA 48h garanti</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDispatchModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Nouveau Dispatch</span>
                </button>
              </div>
            </div>

            {/* SLA Monitor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Engagement SLA 48h</span>
                  <span className="text-emerald-400 font-bold">100% Respecté</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Temps Moyen 1ère Réponse</span>
                  <span className="text-blue-400 font-bold">18.4 Heures</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[65%]" />
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Conventions Entreprises</span>
                  <span className="text-amber-400 font-bold">{entreprises.length} Partenaires</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[80%]" />
                </div>
              </div>
            </div>

            {/* Dispatch Missions & Circular Projects */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missions en cours de Dispatch & Placements</h4>
              {projets.map((projet) => (
                <div
                  key={projet.id}
                  onClick={() => setSelectedProjet(projet)}
                  className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Send size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{projet.titre}</h4>
                        <p className="text-[11px] text-slate-300">
                          {projet.candidatNom} ➔ <span className="text-emerald-400 font-medium">{projet.entrepriseNom}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {projet.progression}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock size={11} className="text-emerald-400" />
                      {projet.prochaineEtape}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Gain : {projet.gainAnnuelEstime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 3 : FORMATIONS & BILANS                                           */}
        {/* ========================================================================= */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Catalogue Certifiant Qualiopi & CPF</h3>
                <p className="text-xs text-slate-400">Passeports CACES, bilans d\'employabilité et montée en compétences</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                100% Finançable CPF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formations.map((formation) => (
                <div
                  key={formation.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold uppercase">
                        {formation.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-1">{formation.title}</h4>
                    </div>
                    <span className="text-xs font-black text-emerald-400 shrink-0">
                      {formation.durationHours}h
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {formation.aiSyllabusSummary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1 font-mono text-emerald-400">
                      <BadgeCheck size={13} />
                      {formation.certifyingBody}
                    </span>
                    <span className="text-slate-400">
                      Prochaine session : <strong className="text-slate-200">{formation.nextSessionDate}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      haptics.trigger('success');
                      showToast(`Inscription enregistrée pour le module [${formation.title}]`);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen size={13} />
                    <span>Inscrire un Candidat JaaS</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 4 : AFFILIATION ($50/FILLEUL)                                      */}
        {/* ========================================================================= */}
        {activeTab === 'affiliates' && (
          <div className="space-y-4">
            {/* Bannière Amortissement */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Programme Ambassadeur : $50 / Filleul</h3>
                    <p className="text-xs text-slate-400">Objectif : 6 filleuls inscrits à l\'offre JaaS ($300) = Abonnement 100% remboursé</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewReferralModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Ajouter un Filleul ($50)</span>
                </button>
              </div>

              {/* Progress towards 6 referrals ($300 goal) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Progression : <strong>{totalReferralsCount} / {targetReferrals} filleuls</strong> ($ {currentReferralEarnings} / $300)
                  </span>
                  <span className="text-amber-400 font-bold font-mono">{referralTargetProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${referralTargetProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Commissions Totales</span>
                <div className="text-xl font-black text-amber-400 mt-1">${currentReferralEarnings}</div>
                <span className="text-[10px] text-emerald-400 mt-1 font-mono">+$50 par adhésion $300</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Filleuls Inscrits</span>
                <div className="text-xl font-black text-slate-100 mt-1">{totalReferralsCount} / 6</div>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">
                  {Math.max(0, targetReferrals - totalReferralsCount)} restants pour le seuil
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lien Ambassadeur</span>
                <div className="text-xs font-mono font-bold text-slate-200 mt-1 truncate">OMK-YASSINE-50</div>
                <button
                  onClick={() => {
                    haptics.trigger('light');
                    showToast('Lien de parrainage copié dans le presse-papiers');
                  }}
                  className="text-[10px] text-emerald-400 hover:underline mt-1 flex items-center gap-1 font-semibold"
                >
                  <Copy size={11} /> Copier le lien
                </button>
              </div>
            </div>

            {/* List of Referral Transactions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historique des Commissions ($50 / filleul)</h4>
              {affiliations.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                      +$50
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{tx.filleulNom}</h4>
                      <p className="text-[11px] text-slate-400">{tx.filleulEmail} • Code : {tx.codeParrain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {tx.statut}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{tx.dateTransaction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SOUS-PAGES DU MENU EXTENSIBLE (12 SOUS-PAGES)                             */}
        {/* ========================================================================= */}
        {activeTab === 'audit_cv' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Audit CV & Scoring IA (Normes ATS 2026)</h3>
            <p className="text-xs text-slate-400">Diagnostic sémantique pour caristes, chefs d\'équipe et préparateurs.</p>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Diagnostic automatique pour Karim Benali</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Score ATS : 98/100</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mots-clés logistiques détectés : <strong>CACES R489 1-3-5, WMS Reflex, Sécurité Entrepôt, Picking RF</strong>. Le CV est prêt pour distribution 1-Click.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'interview_sim' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Simulations d\'Entretiens IA en Live</h3>
                <p className="text-xs text-slate-400">Entraînement immersif avec feedback immédiat du recruteur virtuel</p>
              </div>
              <button
                onClick={() => setIsSimInterviewModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Play size={13} />
                <span>Lancer Simulation</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400">Question Coach IA :</div>
              <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                "{simQuestion}"
              </p>
              <textarea
                value={simAnswer}
                onChange={(e) => setSimAnswer(e.target.value)}
                placeholder="Rédigez ou dictez votre réponse ici..."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                onClick={handleAnalyzeSimulation}
                disabled={isAnalyzingSim || !simAnswer}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>{isAnalyzingSim ? 'Analyse IA en cours...' : 'Évaluer ma réponse'}</span>
              </button>

              {simFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 mt-2">
                  {simFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'skills_passport' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Passeport Compétences & Badges CACES</h3>
            <p className="text-xs text-slate-400">Registre infalsifiable des habilitations et certifications logistiques</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                  <Award size={16} /> CACES R489 Catégories 1-3-5
                </div>
                <p className="text-xs text-slate-300">Délivré par organisme certifié Qualiopi. Validité 5 ans.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                  <ShieldCheck size={16} /> SST Sauveteur Secouriste du Travail
                </div>
                <p className="text-xs text-slate-300">Habilitation sécurité et premiers secours en milieu industriel.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'job_radar' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Radar Offres d\'Emploi Bassin 30km</h3>
            <p className="text-xs text-slate-400">Scraping continu des postes prioritaires IDF</p>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Cariste CACES 5 - LogiPrime Garonor</h4>
                  <p className="text-[11px] text-slate-400">Aulnay-sous-Bois (93) • 25k€ • CDI Immédiat</p>
                </div>
                <button
                  onClick={() => handleLaunchDispatch(candidats[0]?.id, entreprises[0]?.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                >
                  Postuler 1-Click
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fallback info for other extended tabs */}
        {!['profiles', 'dispatch', 'training', 'affiliates', 'audit_cv', 'interview_sim', 'skills_passport', 'job_radar'].includes(activeTab) && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              Module Métier : {activeExtendedTabObj?.label || activeTab}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {activeExtendedTabObj?.desc || 'Module opérationnel JaaS connecté aux flux de données OMK.'}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TIROIR D'INSPECTION CANDIDAT (DetailDrawer)                                */}
      {/* ========================================================================= */}
      {selectedCandidat && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setSelectedCandidat(null)}
          title={selectedCandidat.nomComplet}
          subtitle={selectedCandidat.posteCible}
          badge={`Score IA ${selectedCandidat.scoreEmployabilite}%`}
          badgeColor="emerald"
          icon={Users}
          breadcrumbs={[
            { label: 'JaaS JOB' },
            { label: 'Candidats' },
            { label: selectedCandidat.nomComplet }
          ]}
          actions={[
            {
              id: 'dispatch',
              label: 'Lancer Multi-Dispatch 1-Click',
              icon: Send,
              variant: 'primary',
              onClick: () => {
                setSelectedDispatchCandidateId(selectedCandidat.id);
                setIsDispatchModalOpen(true);
              }
            }
          ]}
          kpis={[
            { label: 'Score ATS IA', value: `${selectedCandidat.scoreEmployabilite}/100`, trend: 'up' },
            { label: 'Expérience', value: selectedCandidat.anneesExperience },
            { label: 'Prétention', value: selectedCandidat.pretentionSalariale },
            { label: 'Dispatches', value: `${selectedCandidat.nombreDispatches} envoyés` }
          ]}
          aiInsight={{
            title: 'Diagnostic Recrutement IA',
            content: selectedCandidat.auditIANotes,
            actionLabel: 'Multi-Dispatch Immédiat',
            onAction: () => handleLaunchDispatch(selectedCandidat.id)
          }}
          tabs={[
            {
              id: 'overview',
              label: 'Compétences & Habilitations',
              content: (
                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-300 mb-1.5">Compétences Clés :</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidat.competences.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-300 mb-1.5">Certifications :</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidat.certifications.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'contact',
              label: 'Coordonnées',
              content: (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-emerald-400" />
                    <span>{selectedCandidat.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-emerald-400" />
                    <span>{selectedCandidat.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-emerald-400" />
                    <span>{selectedCandidat.bassinEmploi}</span>
                  </div>
                </div>
              )
            }
          ]}
        />
      )}

      {/* ========================================================================= */}
      {/* MODALE : NOUVEAU CANDIDAT MASTER                                          */}
      {/* ========================================================================= */}
      {isNewCandidatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Créer un Master Profil Candidat</h3>
              </div>
              <button onClick={() => setIsNewCandidatModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCandidat} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  placeholder="ex: Rachid Tazi"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Poste Cible</label>
                  <input
                    type="text"
                    required
                    value={newPoste}
                    onChange={(e) => setNewPoste(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bassin Emploi</label>
                  <input
                    type="text"
                    required
                    value={newBassin}
                    onChange={(e) => setNewBassin(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="candidat@email.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={newTel}
                    onChange={(e) => setNewTel(e.target.value)}
                    placeholder="+33 6 ..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCandidatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Valider Profil Master
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : LANCEMENT MULTI-DISPATCH 1-CLICK                                 */}
      {/* ========================================================================= */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Lancer un Multi-Dispatch 1-Click</h3>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Sélectionner le Candidat Master</label>
                <select
                  value={selectedDispatchCandidateId || candidats[0]?.id}
                  onChange={(e) => setSelectedDispatchCandidateId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden"
                >
                  {candidats.map(c => (
                    <option key={c.id} value={c.id}>{c.nomComplet} ({c.posteCible} - Score {c.scoreEmployabilite}%)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Entreprise Partenaire Cible (SLA 48h)</label>
                <select
                  value={selectedTargetCompanyId || entreprises[0]?.id}
                  onChange={(e) => setSelectedTargetCompanyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden"
                >
                  {entreprises.map(e => (
                    <option key={e.id} value={e.id}>{e.nom} ({e.bassin} - {e.postesOuverts} postes)</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px]">
                ⚡ Envoi automatique du CV ATS avec engagement contractuel de réponse sous 48h.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDispatch()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Envoyer Dispatch 1-Click</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : AJOUTER FILLEUL AFFILIATION                                      */}
      {/* ========================================================================= */}
      {isNewReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Enregistrer un Filleul ($50/adhésion)</h3>
              </div>
              <button onClick={() => setIsNewReferralModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nom du Filleul</label>
                <input
                  type="text"
                  required
                  value={newFilleulNom}
                  onChange={(e) => setNewFilleulNom(e.target.value)}
                  placeholder="ex: Samy Naciri"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Email du Filleul</label>
                <input
                  type="email"
                  required
                  value={newFilleulEmail}
                  onChange={(e) => setNewFilleulEmail(e.target.value)}
                  placeholder="filleul@email.com"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Votre Code Parrain</label>
                <input
                  type="text"
                  value={newParrainCode}
                  onChange={(e) => setNewParrainCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px]">
                💰 Chaque inscription à l'offre JaaS ($300/an) crédite automatiquement $50 sur votre solde ambassadeur.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewReferralModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Créditer Commission ($50)
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
