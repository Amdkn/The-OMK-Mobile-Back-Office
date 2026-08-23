import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  HeartHandshake, 
  Calendar, 
  Award, 
  ChevronRight, 
  Bot, 
  FileText, 
  Mail,
  ShieldCheck,
  Coffee,
  CheckCircle2,
  Phone,
  Briefcase,
  Sparkles,
  ArrowRight,
  Clock,
  Send,
  Plus,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
  CalendarCheck,
  CalendarClock,
  UserCheck,
  Sliders,
  DollarSign,
  Laptop,
  CheckSquare,
  Square,
  RefreshCw,
  Zap,
  Globe,
  Star
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: 'Actif' | 'En congé' | 'Onboarding';
  start: string;
  email: string;
  phone: string;
  salary: string;
  bonus: string;
  equity: string;
  skills: string[];
  bio: string;
  lastReview: string;
  reviewScore: string;
  manager: string;
  workMode: string;
  meetings: { id: string; date: string; time: string; topic: string; completed: boolean }[];
  actionItems: { id: string; text: string; done: boolean }[];
}

interface LeaveItem {
  id: string;
  employee: string;
  employeeRole: string;
  dept: string;
  type: 'Congés Payés' | 'Conférence Tech' | 'RTT & Récupération' | 'Congé Parental' | 'Maladie';
  dates: string;
  days: number;
  status: 'Approuvé' | 'En attente' | 'Rejeté';
  replacement: string;
  replacementRole: string;
  reason: string;
  balanceRemaining: number;
  calendarSynced: boolean;
}

interface ReviewCycle {
  id: string;
  cycle: string;
  target: string;
  status: string;
  deadline: string;
  completionRate: number;
  totalParticipants: number;
  submittedCount: number;
  averageScore: number;
  rubric: { criteria: string; weight: string; score: number; description: string }[];
  participants: { id: string; name: string; role: string; dept: string; submitted: boolean; score?: number }[];
}

interface PerkItem {
  id: string;
  title: string;
  cat: string;
  val: string;
  provider: string;
  budgetMonthly: string;
  annualCap: string;
  reimbursementDelay: string;
  tier: string;
  description: string;
  guarantees: { item: string; coverage: string; ceiling: string }[];
  claims: { id: string; title: string; date: string; amount: string; status: 'Approuvé' | 'En cours' | 'Rejeté' }[];
}

const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: 'e1', 
    name: 'Alexandre Meyer', 
    role: 'Staff Engineer (Rust & Distributed Systems)', 
    dept: 'Engineering', 
    status: 'Actif', 
    start: 'Fév 2026', 
    email: 'alex@omk.corp',
    phone: '+33 6 11 22 33 44',
    salary: '$9,500/m',
    bonus: '$18,000/an (Objectifs)',
    equity: '1.25% BSPCE',
    skills: ['Rust', 'WebAssembly', 'Distributed Consensus', 'gRPC', 'PostgreSQL', 'Docker'],
    bio: 'Lead architect sur le moteur de runtime, la virtualisation légère et l\'isolation des bacs à sable.',
    lastReview: 'Note 4.9/5 • Performance technique exceptionnelle, mentorat actif des juniors.',
    reviewScore: '4.9 / 5.0',
    manager: 'Directeur Technique (CTO)',
    workMode: 'Full Remote (Paris, UTC+1)',
    meetings: [
      { id: 'm1', date: 'Jeudi 28 Août', time: '14:30', topic: 'Architecture Consensus Raft & Roadmap Q4', completed: false },
      { id: 'm2', date: '14 Août 2026', time: '10:00', topic: 'Bilan de mi-trimestre & Rétrospective sprint', completed: true }
    ],
    actionItems: [
      { id: 'a1', text: 'Rédiger l\'ADR pour l\'intégration WebAssembly runtime', done: true },
      { id: 'a2', text: 'Planifier la session d\'onboarding de la nouvelle recrue Rust', done: false },
      { id: 'a3', text: 'Préparer les slides pour le Tech Talk interne', done: false }
    ]
  },
  { 
    id: 'e2', 
    name: 'Sophie Laurent', 
    role: 'Lead Growth & Enterprise Expansion', 
    dept: 'Marketing & Sales', 
    status: 'Actif', 
    start: 'Mar 2026', 
    email: 'sophie@omk.corp',
    phone: '+33 6 55 66 77 88',
    salary: '$8,200/m',
    bonus: '$24,000/an (Commissions ARR)',
    equity: '0.85% BSPCE',
    skills: ['Go-to-Market', 'Inbound AI', 'Enterprise Sales', 'HubSpot', 'RevOps', 'LinkedIn Ads'],
    bio: 'Responsable de l\'acquisition B2B, des partenariats stratégiques grands comptes et du pipeline inbound.',
    lastReview: 'Note 4.8/5 • Objectifs Q2 dépassés de +18%, pipeline enterprise multiplié par 2.4x.',
    reviewScore: '4.8 / 5.0',
    manager: 'Chief Revenue Officer (CRO)',
    workMode: 'Hybride (Paris 8e / Télétravail)',
    meetings: [
      { id: 'm3', date: 'Mardi 26 Août', time: '11:00', topic: 'Pipeline Q3 Enterprise & Déploiement BaaS Hub', completed: false },
      { id: 'm4', date: '12 Août 2026', time: '16:00', topic: 'Optimisation du CAC et allocation budget Meta', completed: true }
    ],
    actionItems: [
      { id: 'a4', text: 'Finaliser le pitch deck pour le compte Fortune 500', done: true },
      { id: 'a5', text: 'Calibrer la nouvelle grille de commissions commerciales Q4', done: false }
    ]
  },
  { 
    id: 'e3', 
    name: 'Marc Dupont', 
    role: 'Lead Product & System Designer', 
    dept: 'Design', 
    status: 'Actif', 
    start: 'Jan 2026', 
    email: 'marc@omk.corp',
    phone: '+33 6 99 88 77 66',
    salary: '$7,800/m',
    bonus: '$10,000/an (Qualité produit)',
    equity: '0.90% BSPCE',
    skills: ['Figma', 'Design Systems', 'Tailwind CSS', 'Motion UI', 'Accessibilité', 'Prototypage'],
    bio: 'Créateur du design system OMK Mobile OS, garant de l\'ergonomie, des micro-interactions et de la cohérence visuelle.',
    lastReview: 'Note 5.0/5 • Score CSAT design record, refonte de la navigation mobile saluée par les utilisateurs.',
    reviewScore: '5.0 / 5.0',
    manager: 'Head of Product',
    workMode: 'Full Remote (Lyon, UTC+1)',
    meetings: [
      { id: 'm5', date: 'Vendredi 29 Août', time: '15:00', topic: 'Refonte des DetailDrawers & Micro-interactions', completed: false },
      { id: 'm6', date: '15 Août 2026', time: '09:30', topic: 'Review accessibilité et contrastes thème sombre', completed: true }
    ],
    actionItems: [
      { id: 'a6', text: 'Publier la v2.4 de la bibliothèque de composants Figma', done: true },
      { id: 'a7', text: 'Concevoir les wireframes du module Cognition & Coach AI', done: true },
      { id: 'a8', text: 'Documenter les directives haptiques pour mobile', done: false }
    ]
  },
  { 
    id: 'e4', 
    name: 'Elena Rostova', 
    role: 'Senior AI & LLM Systems Engineer', 
    dept: 'Engineering', 
    status: 'Actif', 
    start: 'Avr 2026', 
    email: 'elena@omk.corp',
    phone: '+33 6 33 44 55 66',
    salary: '$9,000/m',
    bonus: '$15,000/an (Brevets & IA)',
    equity: '1.10% BSPCE',
    skills: ['Python', 'PyTorch', 'Model Fine-tuning', 'Vector Search', 'LangChain', 'Rust'],
    bio: 'Spécialiste de l\'inférence locale et de l\'orchestration des agents autonomes multi-modaux.',
    lastReview: 'Note 4.95/5 • Déploiement ultra-rapide du pipeline RAG avec latence < 120ms.',
    reviewScore: '4.95 / 5.0',
    manager: 'Directeur Technique (CTO)',
    workMode: 'Full Remote (Berlin, UTC+1)',
    meetings: [
      { id: 'm7', date: 'Mercredi 27 Août', time: '10:00', topic: 'Benchmarks Inférence Multi-agents & Optimisation mémoire', completed: false }
    ],
    actionItems: [
      { id: 'a9', text: 'Mettre à jour le benchmark d\'évaluation des embeddings', done: true },
      { id: 'a10', text: 'Rédiger la documentation de l\'API Cognition', done: false }
    ]
  }
];

const INITIAL_LEAVES: LeaveItem[] = [
  { 
    id: 'l1', 
    employee: 'Sophie Laurent', 
    employeeRole: 'Lead Growth & Enterprise Expansion',
    dept: 'Marketing & Sales',
    type: 'Congés Payés', 
    dates: '12 - 19 Août 2026', 
    days: 5, 
    status: 'Approuvé', 
    replacement: 'Marc Dupont',
    replacementRole: 'Lead Product Designer',
    reason: 'Congés annuels estivaux et récupération.',
    balanceRemaining: 18,
    calendarSynced: true
  },
  { 
    id: 'l2', 
    employee: 'Alexandre Meyer', 
    employeeRole: 'Staff Engineer (Rust)',
    dept: 'Engineering',
    type: 'Conférence Tech', 
    dates: '02 - 04 Sept 2026', 
    days: 3, 
    status: 'En attente', 
    replacement: 'Elena Rostova',
    replacementRole: 'Senior AI Engineer',
    reason: 'Participation et intervention speaker à la conférence RustConf Europe 2026.',
    balanceRemaining: 21,
    calendarSynced: false
  },
  { 
    id: 'l3', 
    employee: 'Elena Rostova', 
    employeeRole: 'Senior AI Engineer',
    dept: 'Engineering',
    type: 'RTT & Récupération', 
    dates: '11 - 12 Sept 2026', 
    days: 2, 
    status: 'En attente', 
    replacement: 'Alexandre Meyer',
    replacementRole: 'Staff Engineer',
    reason: 'Récupération d\'astreinte nocturne lors de la release v2.0.',
    balanceRemaining: 10,
    calendarSynced: false
  },
  { 
    id: 'l4', 
    employee: 'Marc Dupont', 
    employeeRole: 'Lead Product Designer',
    dept: 'Design',
    type: 'Congés Payés', 
    dates: '22 - 29 Sept 2026', 
    days: 6, 
    status: 'Approuvé', 
    replacement: 'Sophie Laurent',
    replacementRole: 'Lead Growth',
    reason: 'Congé annuel famille.',
    balanceRemaining: 14,
    calendarSynced: true
  }
];

const INITIAL_REVIEWS: ReviewCycle[] = [
  { 
    id: 'r1', 
    cycle: 'Q3 2026 360° Review', 
    target: 'Tous les collaborateurs (Engineering, Growth, Product)', 
    status: 'En cours (75%)', 
    deadline: '30 Sept 2026',
    completionRate: 75,
    totalParticipants: 4,
    submittedCount: 3,
    averageScore: 4.88,
    rubric: [
      { criteria: 'Excellence Technique & Qualité d\'Exécution', weight: '30%', score: 4.95, description: 'Rigueur architecturale, vélocité, robustesse du code et standards d\'ingénierie.' },
      { criteria: 'Leadership, Mentorat & Esprit d\'Équipe', weight: '25%', score: 4.80, description: 'Capacité à guider ses pairs, documentation claire, bienveillance et partage du savoir.' },
      { criteria: 'Impact Business & Alignement Objectifs OKR', weight: '25%', score: 4.90, description: 'Contribution directe à la croissance, livraison dans les délais et résolution proactive.' },
      { criteria: 'Communication & Culture OMK', weight: '20%', score: 4.85, description: 'Transparence, autonomie en contexte remote et respect des valeurs d\'innovation.' }
    ],
    participants: [
      { id: 'e1', name: 'Alexandre Meyer', role: 'Staff Engineer', dept: 'Engineering', submitted: true, score: 4.90 },
      { id: 'e2', name: 'Sophie Laurent', role: 'Lead Growth', dept: 'Marketing', submitted: true, score: 4.80 },
      { id: 'e3', name: 'Marc Dupont', role: 'Lead Designer', dept: 'Design', submitted: true, score: 5.00 },
      { id: 'e4', name: 'Elena Rostova', role: 'Senior AI Engineer', dept: 'Engineering', submitted: false }
    ]
  },
  { 
    id: 'r2', 
    cycle: 'Q2 2026 Performance & OKR', 
    target: 'Direction, Leads & Pôles Opérationnels', 
    status: 'Clôturé & Validé', 
    deadline: '30 Juin 2026',
    completionRate: 100,
    totalParticipants: 4,
    submittedCount: 4,
    averageScore: 4.82,
    rubric: [
      { criteria: 'Objectifs Trimestriels OKR', weight: '40%', score: 4.85, description: 'Taux de concrétisation des jalons trimestriels clés.' },
      { criteria: 'Vélocité & Productivité', weight: '30%', score: 4.80, description: 'Cadence de déploiement et satisfaction client interne.' },
      { criteria: 'Collaboration Transverse', weight: '30%', score: 4.80, description: 'Synergie fluide entre pôle Produit, Sales et Ingénierie.' }
    ],
    participants: [
      { id: 'e1', name: 'Alexandre Meyer', role: 'Staff Engineer', dept: 'Engineering', submitted: true, score: 4.85 },
      { id: 'e2', name: 'Sophie Laurent', role: 'Lead Growth', dept: 'Marketing', submitted: true, score: 4.80 },
      { id: 'e3', name: 'Marc Dupont', role: 'Lead Designer', dept: 'Design', submitted: true, score: 4.90 },
      { id: 'e4', name: 'Elena Rostova', role: 'Senior AI Engineer', dept: 'Engineering', submitted: true, score: 4.75 }
    ]
  }
];

const INITIAL_PERKS: PerkItem[] = [
  { 
    id: 'p1', 
    title: 'Mutuelle Alan Green 100% Prise en Charge', 
    cat: 'Santé & Prévoyance', 
    val: 'Couverture Premium 100%',
    provider: 'Alan Assurances SAS',
    budgetMonthly: '$140 / collab',
    annualCap: 'Frais réels illimités',
    reimbursementDelay: '< 24 heures (Instantané)',
    tier: 'Formule Green Platinum',
    description: 'Couverture santé haut de gamme avec remboursement des téléconsultations, ostéopathie, psychologie, optique et soins dentaires sans aucun reste à charge.',
    guarantees: [
      { item: 'Médecine Générale & Spécialistes', coverage: '100% Frais Réels (Secteur 1 & 2)', ceiling: 'Sans plafond annuel' },
      { item: 'Optique & Lunettes', coverage: 'Forfait annuel $750', ceiling: '1 monture + verres / an' },
      { item: 'Dentaire & Implants', coverage: '400% Base Sécurité Sociale', ceiling: '$2,500 / an' },
      { item: 'Médecines Douces (Ostéo, Psy)', coverage: '$80 / séance', ceiling: '8 séances / an' },
      { item: 'Assistance Internationale & Rapatriement', coverage: 'Monde Entier 100%', ceiling: '$1,000,000' }
    ],
    claims: [
      { id: 'c1', title: 'Consultation Spécialiste Ophtalmo', date: '18 Août 2026', amount: '$120.00', status: 'Approuvé' },
      { id: 'c2', title: 'Séance Ostéopathie Sportive', date: '04 Août 2026', amount: '$80.00', status: 'Approuvé' }
    ]
  },
  { 
    id: 'p2', 
    title: 'Budget Matériel & Télétravail ($2,500/an)', 
    cat: 'Équipement & Hardware', 
    val: 'MacBook Pro M3 Max + Écran 4K',
    provider: 'Apple Entreprise & Dell Corp',
    budgetMonthly: '$210 / collab',
    annualCap: '$2,500 / an (Rechargeable)',
    reimbursementDelay: 'Sous 48 heures',
    tier: 'Équipement Pro Staff',
    description: 'Enveloppe annuelle dédiée au renouvellement de votre configuration poste de travail, fauteuil ergonomique Herman Miller, bureau assis-debout et périphériques de pointe.',
    guarantees: [
      { item: 'Ordinateur Portable Dev', coverage: 'MacBook Pro 16" M3 Max 64GB', ceiling: 'Remplacement tous les 24 mois' },
      { item: 'Moniteur Externe', coverage: 'Écran Dell UltraSharp 32" 4K HDR', ceiling: '1 unité / collaborateur' },
      { item: 'Mobilier Télétravail', coverage: 'Chaise ergonomique & Desk', ceiling: '$1,000 remboursable' },
      { item: 'Périphériques Audio & Clavier', coverage: 'Casque Sony WH-1000XM5 & Clavier mécanique', ceiling: '$500 / an' }
    ],
    claims: [
      { id: 'c3', title: 'Casque à réduction de bruit Sony XM5', date: '15 Mai 2026', amount: '$380.00', status: 'Approuvé' },
      { id: 'c4', title: 'Support écran articulé Ergotron', date: '22 Juin 2026', amount: '$190.00', status: 'Approuvé' }
    ]
  },
  { 
    id: 'p3', 
    title: 'Abonnement Gym & Bien-être ClassPass', 
    cat: 'Sport & Santé Mentale', 
    val: 'Accès Illimité Salons & Studios',
    provider: 'ClassPass Inc.',
    budgetMonthly: '$85 / collab',
    annualCap: '$1,020 / an',
    reimbursementDelay: 'Crédits mensuels directs',
    tier: 'Accès Illimité VIP',
    description: 'Accès gratuit à plus de 5,000 salles de sport, studios de yoga, pilates, escalade et spas partenaires en Europe et aux États-Unis.',
    guarantees: [
      { item: 'Crédits Mensuels Studio', coverage: '120 crédits / mois', ceiling: 'Report illimité' },
      { item: 'Salles de Sport Réseau', coverage: 'Accès badge illimité 7j/7', ceiling: 'National & International' },
      { item: 'Application Méditation & Sommeil', coverage: 'Abonnement Headspace / Calm offert', ceiling: '100% Inclus' }
    ],
    claims: [
      { id: 'c5', title: 'Recharge mensuelle ClassPass 120 crédits', date: '01 Août 2026', amount: '$85.00', status: 'Approuvé' }
    ]
  },
  { 
    id: 'p4', 
    title: 'Carte Déjeuner & Titres Restaurant Swile', 
    cat: 'Restauration & Mobilité', 
    val: '$13.50 / jour ouvré (Prise en charge 60%)',
    provider: 'Swile SAS',
    budgetMonthly: '$180 / collab',
    annualCap: '$2,160 / an',
    reimbursementDelay: 'Solde rechargé le 1er du mois',
    tier: 'Carte Swile Mastercard',
    description: 'Carte de paiement dématérialisée acceptée partout pour vos repas du midi et éligible au forfait mobilités durables (vélo, transports en commun, train).',
    guarantees: [
      { item: 'Titre Déjeuner Quotidien', coverage: '$13.50 / jour ouvré', ceiling: 'Plafond légal journalier' },
      { item: 'Forfait Mobilité Durable', coverage: '$60 / mois remboursés', ceiling: '$720 / an' }
    ],
    claims: [
      { id: 'c6', title: 'Pass Navigo Mensuel / Abonnement Train', date: '01 Août 2026', amount: '$86.40', status: 'Approuvé' }
    ]
  }
];

const HR_TABS = [
  { id: 'team', label: 'Équipe', icon: Users, badge: 4 },
  { id: 'leaves', label: 'Congés', icon: Calendar, badge: 2, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'reviews', label: 'Évaluations', icon: Award, badge: '75%' },
  { id: 'perks', label: 'Avantages', icon: Coffee, badge: '100%' }
];

export default function HR() {
  const [activeTab, setActiveTab] = useState('team');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [leaves, setLeaves] = useState<LeaveItem[]>(INITIAL_LEAVES);
  const [reviews, setReviews] = useState<ReviewCycle[]>(INITIAL_REVIEWS);
  const [perks, setPerks] = useState<PerkItem[]>(INITIAL_PERKS);

  // Selected state for Drawers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewCycle | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<PerkItem | null>(null);

  // Modal states
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [isNew1on1ModalOpen, setIsNew1on1ModalOpen] = useState(false);

  // Form states: New Leave Form
  const [leaveForm, setLeaveForm] = useState({
    employeeId: 'e1',
    type: 'Congés Payés' as LeaveItem['type'],
    dates: '12 - 19 Octobre 2026',
    days: 5,
    reason: '',
    replacementId: 'e2'
  });

  // Form states: New 1-on-1 Form
  const [oneOnOneForm, setOneOnOneForm] = useState({
    employeeId: 'e1',
    date: 'Vendredi 05 Sept 2026',
    time: '11:00',
    topic: 'Point Carrière & Objectifs Q4',
    format: 'Visio Remote (Google Meet)'
  });

  // Scheduler & Action states inside drawers
  const [newMeetingDate, setNewMeetingDate] = useState('Vendredi 05 Sept');
  const [newMeetingTime, setNewMeetingTime] = useState('11:00');
  const [newMeetingTopic, setNewMeetingTopic] = useState('Point Carrière & Objectifs Q4');
  const [newActionText, setNewActionText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNewLeaveModalOpen(false);
        setIsNew1on1ModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle New Leave Request Submission
  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveForm.employeeId);
    const repl = employees.find(e => e.id === leaveForm.replacementId);
    if (!emp) return;

    const newLeave: LeaveItem = {
      id: `l_${Date.now()}`,
      employee: emp.name,
      employeeRole: emp.role,
      dept: emp.dept,
      type: leaveForm.type,
      dates: leaveForm.dates,
      days: Number(leaveForm.days),
      status: 'En attente',
      replacement: repl ? repl.name : 'Équipe Générale',
      replacementRole: repl ? repl.role : 'Backup',
      reason: leaveForm.reason.trim() || 'Demande d\'absence pour convenance personnelle.',
      balanceRemaining: 18,
      calendarSynced: false
    };

    setLeaves(prev => [newLeave, ...prev]);
    haptics.trigger('success');
    setIsNewLeaveModalOpen(false);
    showToast(`Demande de congé pour ${emp.name} (${newLeave.days}j) enregistrée avec succès`);

    setLeaveForm({
      employeeId: 'e1',
      type: 'Congés Payés',
      dates: '12 - 19 Octobre 2026',
      days: 5,
      reason: '',
      replacementId: 'e2'
    });
  };

  // Handle New 1-on-1 Submission from global modal
  const handleCreate1on1ModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === oneOnOneForm.employeeId);
    if (!emp) return;

    const newMeeting = {
      id: `m_${Date.now()}`,
      date: oneOnOneForm.date,
      time: oneOnOneForm.time,
      topic: `${oneOnOneForm.topic} (${oneOnOneForm.format})`,
      completed: false
    };

    setEmployees(prev => prev.map(item => {
      if (item.id === oneOnOneForm.employeeId) {
        const updated = { ...item, meetings: [newMeeting, ...item.meetings] };
        if (selectedEmployee?.id === item.id) setSelectedEmployee(updated);
        return updated;
      }
      return item;
    }));

    haptics.trigger('success');
    setIsNew1on1ModalOpen(false);
    showToast(`Entretien 1-on-1 avec ${emp.name} planifié pour le ${oneOnOneForm.date} à ${oneOnOneForm.time}`);
  };

  // Toggle Action Item Checkbox
  const toggleActionItem = (empId: string, actionId: string) => {
    haptics.trigger('selection');
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const updated = emp.actionItems.map(a => a.id === actionId ? { ...a, done: !a.done } : a);
        const updatedEmp = { ...emp, actionItems: updated };
        if (selectedEmployee?.id === empId) setSelectedEmployee(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
  };

  // Add Action Item
  const handleAddActionItem = (empId: string) => {
    if (!newActionText.trim()) return;
    haptics.trigger('light');
    const newItem = { id: `a_${Date.now()}`, text: newActionText.trim(), done: false };
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const updated = { ...emp, actionItems: [...emp.actionItems, newItem] };
        if (selectedEmployee?.id === empId) setSelectedEmployee(updated);
        return updated;
      }
      return emp;
    }));
    setNewActionText('');
    showToast('Plan d\'action mis à jour');
  };

  // Schedule a 1-on-1 meeting inside Drawer
  const handleScheduleMeeting = (empId: string) => {
    haptics.trigger('success');
    const newMeeting = {
      id: `m_${Date.now()}`,
      date: newMeetingDate,
      time: newMeetingTime,
      topic: newMeetingTopic,
      completed: false
    };
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const updated = { ...emp, meetings: [newMeeting, ...emp.meetings] };
        if (selectedEmployee?.id === empId) setSelectedEmployee(updated);
        return updated;
      }
      return emp;
    }));
    showToast(`1-on-1 planifié avec ${selectedEmployee?.name} pour le ${newMeetingDate} à ${newMeetingTime}`);
  };

  // Approve Leave
  const handleApproveLeave = (leaveId: string) => {
    haptics.trigger('success');
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        const updated = { ...l, status: 'Approuvé' as const, calendarSynced: true };
        if (selectedLeave?.id === leaveId) setSelectedLeave(updated);
        return updated;
      }
      return l;
    }));
    showToast(`Demande de congé validée & synchronisée au calendrier`);
  };

  // Reject Leave
  const handleRejectLeave = (leaveId: string) => {
    haptics.trigger('warning');
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        const updated = { ...l, status: 'Rejeté' as const };
        if (selectedLeave?.id === leaveId) setSelectedLeave(updated);
        return updated;
      }
      return l;
    }));
    showToast(`Demande de congé refusée avec notification envoyée`);
  };

  // Toggle Sync Calendar for Leave
  const handleToggleSyncCalendar = (leaveId: string) => {
    haptics.trigger('light');
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        const updated = { ...l, calendarSynced: !l.calendarSynced };
        if (selectedLeave?.id === leaveId) setSelectedLeave(updated);
        return updated;
      }
      return l;
    }));
    showToast(`Synchronisation du calendrier mise à jour`);
  };

  // Dispatch Reminder for Review Cycle
  const handleDispatchReminders = (reviewId: string) => {
    haptics.trigger('medium');
    showToast(`Notifications et relances Slack/Email envoyées aux 1 participant en attente`);
  };

  // Submit Expense Claim in Perks
  const handleAddPerkClaim = (perkId: string) => {
    haptics.trigger('success');
    const newClaim = {
      id: `c_${Date.now()}`,
      title: 'Facture Santé & Bien-être Q3',
      date: 'Aujourd\'hui',
      amount: '$140.00',
      status: 'Approuvé' as const
    };
    setPerks(prev => prev.map(p => {
      if (p.id === perkId) {
        const updated = { ...p, claims: [newClaim, ...p.claims] };
        if (selectedPerk?.id === perkId) setSelectedPerk(updated);
        return updated;
      }
      return p;
    }));
    showToast(`Nouvelle demande de remboursement de $140.00 enregistrée et approuvée`);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={HR_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Contextual Sub-Bar with Breadcrumb & Quick Actions */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane RH" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('team');
              setSelectedEmployee(null);
              setSelectedLeave(null);
              setSelectedReview(null);
              setSelectedPerk(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>RH OS</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {HR_TABS.find(t => t.id === activeTab)?.label || 'Équipe'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            {employees.length} Collaborateurs
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsNew1on1ModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <CalendarClock size={11} />
            <span className="hidden xs:inline">1-on-1</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('selection');
              setIsNewLeaveModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>+ Congé</span>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: TEAM */}
          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Capital Humain & Équipe"
                subtitle="Effectifs OMK, fiches collaborateurs et entretiens 1-on-1"
                badge={`${employees.length} Membres Actifs`}
                icon={Users}
                kpis={[
                  { label: 'Taux Rétention', value: '100%', sub: '0 turnover', trend: 'up' },
                  { label: 'eNPS Score', value: '+88', sub: 'Excellence cohésion', trend: 'up' },
                  { label: 'Masse Salariale', value: '$34.5k', sub: 'Brut mensuel' },
                  { label: 'Score 360°', value: '4.91 / 5', sub: 'Performance globale', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {employees.map(emp => (
                    <DetailCard
                      key={emp.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedEmployee(emp);
                      }}
                      isInteractive
                      title={emp.name}
                      badge={emp.dept}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Users}
                      subtitle={`${emp.role} • Depuis ${emp.start}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="font-mono">{emp.email}</span>
                          <span className="font-semibold text-emerald-400">{emp.salary}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span>{emp.reviewScore}</span>
                            <span className="text-slate-600">•</span>
                            <span>{emp.workMode.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium hover:text-emerald-300">
                            <span>Voir fiche complète</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Gestion Prédictive des Talents & Rétention"
                  content="Les compétences en Rust, Inférence IA Distribuée et Go-to-Market Enterprise sont en sur-demande. Recommandation : organiser les points 1-on-1 de rentrée pour aligner les évolutions de poste Q4."
                  actionLabel="Planifier un point 1-on-1 carrière avec l'équipe"
                  onAction={() => {
                    haptics.trigger('selection');
                    setIsNew1on1ModalOpen(true);
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: LEAVES */}
          {activeTab === 'leaves' && (
            <motion.div
              key="leaves"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Demandes de Congés & Continuité"
                subtitle="Validation des absences, couverture opérationnelle et synchronisation"
                icon={Calendar}
                badge={`${leaves.filter(l => l.status === 'En attente').length} En attente`}
                badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
                kpis={[
                  { label: 'Solde Moyen', value: '18.2 j', sub: 'Par collaborateur' },
                  { label: 'Taux Approbation', value: '100%', sub: 'Traitement < 24h', trend: 'up' },
                  { label: 'Absences Actuelles', value: '0', sub: '100% disponibles' },
                  { label: 'Continuité Backup', value: '100%', sub: 'Remplaçants assignés', trend: 'up' }
                ]}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-400">Registre des demandes ({leaves.length})</span>
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsNewLeaveModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Nouvelle Demande</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {leaves.map(l => (
                    <DetailCard
                      key={l.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedLeave(l);
                      }}
                      isInteractive
                      title={l.employee}
                      badge={l.status}
                      badgeColor={
                        l.status === 'Approuvé' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : l.status === 'En attente'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }
                      icon={Calendar}
                      subtitle={`${l.type} • ${l.dates} (${l.days} jours)`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Remplaçant : <strong className="text-slate-200 font-medium">{l.replacement}</strong></span>
                          <span className="text-slate-400">Solde : <strong className="text-emerald-400">{l.balanceRemaining}j</strong> restants</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 text-[11px]">
                            {l.calendarSynced ? '🗓️ Sync Calendrier active' : '⏳ Non synchronisé'}
                          </span>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>Gérer la demande</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Analyse de Charge & Continuité Opérationnelle"
                  content="Aucun chevauchement d'absence critique n'est constaté entre les Staff Engineers durant les livraisons du sprint v2.4. La passation de relais est assurée à 100%."
                  actionLabel="Exporter le planning consolidé des congés"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Planning consolidé exporté au format ICS / Google Calendar');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Campagnes d'Évaluation & Feedback 360°"
                subtitle="Revues collégiales, fixation des objectifs OKR et barème d'excellence"
                icon={Award}
                badge="Q3 en cours (75%)"
                kpis={[
                  { label: 'Taux Participation', value: '75%', sub: '3 sur 4 soumises', trend: 'up' },
                  { label: 'Note Moyenne', value: '4.88 / 5', sub: 'Excellence technique', trend: 'up' },
                  { label: 'Date Clôture', value: '30 Sept', sub: 'J-38 avant clôture' },
                  { label: 'Couverture Équipe', value: '100%', sub: 'Engineering & Growth' }
                ]}
              >
                <div className="space-y-3">
                  {reviews.map(r => (
                    <DetailCard
                      key={r.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedReview(r);
                      }}
                      isInteractive
                      title={r.cycle}
                      badge={r.status}
                      badgeColor={r.status.includes('Clôturé') ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
                      icon={Award}
                      subtitle={`Cible : ${r.target} • Échéance : ${r.deadline}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Progression de la campagne</span>
                            <span className="font-semibold text-slate-200">{r.completionRate}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div 
                              className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${r.completionRate}%` }} 
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 text-[11px]">
                            Note moyenne actuelle : <strong className="text-emerald-400">{r.averageScore}/5</strong>
                          </span>
                          <div className="flex items-center gap-1 text-sky-400 font-medium">
                            <span>Inspecter la grille 360°</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Synthèse IA des Compétences Collectives"
                  content="L'équipe surperforme particulièrement sur l'Excellence Technique (4.95/5) et l'Impact Business (4.90/5). 1 évaluation reste en cours pour Elena Rostova."
                  actionLabel="Envoyer une relance douce aux évaluateurs restants"
                  onAction={() => {
                    haptics.trigger('medium');
                    showToast('Notification de rappel 360° envoyée avec succès');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: PERKS */}
          {activeTab === 'perks' && (
            <motion.div
              key="perks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Package d'Avantages Sociaux & Bien-être"
                subtitle="Politique de rémunération globale, santé, matériel et remboursements"
                icon={Coffee}
                badge={`${perks.length} Avantages Actifs`}
                kpis={[
                  { label: 'Budget Moyen', value: '$615/m', sub: 'Par collaborateur' },
                  { label: 'Taux Utilisation', value: '98%', sub: 'Adhésion maximale', trend: 'up' },
                  { label: 'Délai Remb.', value: '< 24h', sub: 'Virement instantané', trend: 'up' },
                  { label: 'Indice Bien-Être', value: '9.8 / 10', sub: 'Top tier tech 2026', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {perks.map(p => (
                    <DetailCard
                      key={p.id}
                      onClick={() => {
                        haptics.trigger('light');
                        setSelectedPerk(p);
                      }}
                      isInteractive
                      title={p.title}
                      badge={p.tier}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Coffee}
                      subtitle={`Catégorie : ${p.cat} • ${p.budgetMonthly}`}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <p className="text-slate-400 line-clamp-2 leading-relaxed text-[11px]">
                          {p.description}
                        </p>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 text-[11px]">
                            Garanties : <strong className="text-slate-200">{p.guarantees.length} postes couverts</strong>
                          </span>
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span>Détails & Notes de frais</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Optimisation du Package Salarial Global"
                  content="Le remboursement 100% de la mutuelle Alan Green et le budget matériel annuel de $2,500 positionnent l'offre OMK dans le 99e percentile des startups tech européennes."
                  actionLabel="Télécharger la synthèse des avantages collaborateurs (PDF)"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Guide complet du package salarial et avantages téléchargé');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NOUVELLE DEMANDE DE CONGÉ */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewLeaveModalOpen && (
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
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Nouvelle Demande de Congé</h3>
                    <p className="text-[10px] text-slate-400">Validation d'absence et passation de relais</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNewLeaveModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateLeave} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Collaborateur Demandeur *</label>
                  <select
                    value={leaveForm.employeeId}
                    onChange={e => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role.split('(')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Type de Congé</label>
                    <select
                      value={leaveForm.type}
                      onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Congés Payés">Congés Payés</option>
                      <option value="RTT & Récupération">RTT & Récupération</option>
                      <option value="Conférence Tech">Conférence Tech</option>
                      <option value="Congé Parental">Congé Parental</option>
                      <option value="Maladie">Maladie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Jours Ouvrés</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={leaveForm.days}
                      onChange={e => setLeaveForm({ ...leaveForm, days: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Dates de l'Absence *</label>
                  <input
                    type="text"
                    required
                    value={leaveForm.dates}
                    onChange={e => setLeaveForm({ ...leaveForm, dates: e.target.value })}
                    placeholder="Ex: 12 - 19 Octobre 2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Collègue Remplaçant (Backup Continuité)</label>
                  <select
                    value={leaveForm.replacementId}
                    onChange={e => setLeaveForm({ ...leaveForm, replacementId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role.split('(')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Motif & Contexte</label>
                  <textarea
                    rows={2}
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Ex: Vacances annuelles, récupération d'astreinte..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewLeaveModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Soumettre Demande</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: PLANIFIER UN ENTRETIEN 1-ON-1 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNew1on1ModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-slate-100 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <CalendarClock size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Planifier Entretien 1-on-1</h3>
                    <p className="text-[10px] text-slate-400">Suivi individuel, carrière et alignement OKR</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNew1on1ModalOpen(false)} 
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreate1on1ModalSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Collaborateur *</label>
                  <select
                    value={oneOnOneForm.employeeId}
                    onChange={e => setOneOnOneForm({ ...oneOnOneForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.dept})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Date</label>
                    <input
                      type="text"
                      required
                      value={oneOnOneForm.date}
                      onChange={e => setOneOnOneForm({ ...oneOnOneForm, date: e.target.value })}
                      placeholder="Ex: Vendredi 05 Sept"
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">Heure</label>
                    <input
                      type="text"
                      required
                      value={oneOnOneForm.time}
                      onChange={e => setOneOnOneForm({ ...oneOnOneForm, time: e.target.value })}
                      placeholder="11:00"
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Sujet & Ordre du Jour *</label>
                  <input
                    type="text"
                    required
                    value={oneOnOneForm.topic}
                    onChange={e => setOneOnOneForm({ ...oneOnOneForm, topic: e.target.value })}
                    placeholder="Ex: Bilan de sprint & Objectifs Q4"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Format / Modalité</label>
                  <select
                    value={oneOnOneForm.format}
                    onChange={e => setOneOnOneForm({ ...oneOnOneForm, format: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="Visio Remote (Google Meet)">Visio Remote (Google Meet)</option>
                    <option value="Bureaux Paris 8e">En présentiel (Bureaux Paris 8e)</option>
                    <option value="Point Téléphonique">Point Téléphonique</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNew1on1ModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Bloquer le Créneau</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. SLIDE-OVER EMPLOYEE DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={selectedEmployee?.name || ''}
        subtitle={`${selectedEmployee?.role} • ${selectedEmployee?.dept}`}
        badge={selectedEmployee?.status}
        badgeColor={selectedEmployee?.status === 'Actif' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        avatarText={selectedEmployee?.name.charAt(0)}
        icon={Users}
        breadcrumbs={[
          { label: 'RH OS', onClick: () => setSelectedEmployee(null) },
          { label: 'Effectifs', onClick: () => setSelectedEmployee(null) },
          { label: selectedEmployee?.name || 'Collaborateur' }
        ]}
        actions={[
          {
            id: 'schedule_1on1',
            label: 'Planifier 1-on-1',
            icon: CalendarClock,
            variant: 'primary',
            onClick: () => {
              if (selectedEmployee) handleScheduleMeeting(selectedEmployee.id);
            }
          },
          {
            id: 'email_emp',
            label: 'Contacter Email',
            icon: Mail,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Email direct envoyé à ${selectedEmployee?.email}`);
            }
          },
          {
            id: 'payslip_pdf',
            label: 'Bulletin de Paie',
            icon: FileText,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Dernier bulletin de paie généré pour ${selectedEmployee?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Rémunération', value: selectedEmployee?.salary || '', sub: 'Fixe brut mensuel' },
          { label: 'Ancienneté', value: selectedEmployee?.start || '', sub: 'En poste' },
          { label: 'Score 360°', value: selectedEmployee?.reviewScore || '4.9/5', sub: 'Top 5% Performance', trend: 'up' },
          { label: 'Contrat RH', value: 'CDI Cadre', sub: 'Forfait 218 jours' }
        ]}
        aiInsight={{
          title: 'Synthèse Carrière & Coaching AI',
          content: `${selectedEmployee?.bio} Recommandation : Valider les objectifs trimestriels et activer le palier supérieur de rémunération variable.`,
          actionLabel: 'Générer proposition d\'évolution de poste & rémunération',
          onAction: () => {
            haptics.trigger('success');
            showToast(`Proposition d'évolution et grille salariale préparée pour ${selectedEmployee?.name}`);
          }
        }}
        tabs={[
          {
            id: 'compensation',
            label: 'Rémunération & Contrat',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5">
                  <span className="font-semibold text-slate-200 text-sm">Package Salarial & Avantages</span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Salaire Fixe Brut</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">{selectedEmployee?.salary}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Bonus & Variable</span>
                      <span className="font-mono text-sky-400 font-bold text-sm">{selectedEmployee?.bonus}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Capital & Equity</span>
                      <span className="font-mono text-amber-400 font-bold text-sm">{selectedEmployee?.equity}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Mode de Travail</span>
                      <span className="text-slate-200 font-semibold text-xs">{selectedEmployee?.workMode}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Responsable Hiérarchique:</span>
                    <span className="text-slate-200 font-medium">{selectedEmployee?.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date d'embauche:</span>
                    <span className="text-slate-200 font-mono">{selectedEmployee?.start}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Convention Collective:</span>
                    <span className="text-slate-200">SYNTEC (Statut Cadre)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mutuelle & Prévoyance:</span>
                    <span className="text-emerald-400 font-medium">Alan Green (100% Pris en charge)</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'scheduler',
            label: `1-on-1 & Actions (${selectedEmployee?.meetings.length || 0})`,
            content: (
              <div className="space-y-4 text-xs">
                {/* Meeting Scheduler Form */}
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CalendarClock size={15} />
                    <span>Planifier un Nouvel Entretien 1-on-1</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Sujet de la Rencontre</label>
                      <input
                        type="text"
                        value={newMeetingTopic}
                        onChange={(e) => setNewMeetingTopic(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        placeholder="Ex: Bilan de sprint & Objectifs Q4"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Date</label>
                        <input
                          type="text"
                          value={newMeetingDate}
                          onChange={(e) => setNewMeetingDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Heure</label>
                        <input
                          type="text"
                          value={newMeetingTime}
                          onChange={(e) => setNewMeetingTime(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedEmployee) handleScheduleMeeting(selectedEmployee.id);
                      }}
                      className="w-full mt-2 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 rounded-xl font-semibold text-slate-950 text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <CalendarCheck size={14} />
                      <span>Confirmer le Créneau 1-on-1</span>
                    </button>
                  </div>
                </div>

                {/* Meetings List */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block">Historique & Prochains Rendez-vous</span>
                  {selectedEmployee?.meetings.map(m => (
                    <div key={m.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">{m.topic}</span>
                        <span className="text-[11px] text-slate-400">{m.date} à {m.time}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        m.completed 
                          ? 'bg-slate-950 text-slate-400 border-slate-800' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {m.completed ? 'Terminé' : 'À venir'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Items Checklist */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5">
                  <span className="font-semibold text-slate-200 block">Plan d'Action & Engagements Réciproques</span>
                  <div className="space-y-1.5">
                    {selectedEmployee?.actionItems.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => selectedEmployee && toggleActionItem(selectedEmployee.id, item.id)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 cursor-pointer transition-colors"
                      >
                        {item.done ? (
                          <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-500 shrink-0" />
                        )}
                        <span className={`text-xs ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedEmployee) handleAddActionItem(selectedEmployee.id);
                      }}
                      placeholder="Ajouter une action..."
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => selectedEmployee && handleAddActionItem(selectedEmployee.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'reviews',
            label: 'Évaluations & Bio',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">Dernière Revue Performance</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {selectedEmployee?.reviewScore}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pt-1">
                    {selectedEmployee?.lastReview}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block">Compétences Clés & Stack</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedEmployee?.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block">Coordonnées Professionnelles</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200 font-mono">{selectedEmployee?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Téléphone:</span>
                    <span className="text-slate-200 font-mono">{selectedEmployee?.phone}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* 2. SLIDE-OVER LEAVE DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title={`Congé • ${selectedLeave?.employee || ''}`}
        subtitle={`${selectedLeave?.type} • ${selectedLeave?.dates}`}
        badge={selectedLeave?.status}
        badgeColor={
          selectedLeave?.status === 'Approuvé' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : selectedLeave?.status === 'En attente'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }
        avatarText={selectedLeave?.employee.charAt(0)}
        icon={Calendar}
        breadcrumbs={[
          { label: 'RH OS', onClick: () => setSelectedLeave(null) },
          { label: 'Congés', onClick: () => setSelectedLeave(null) },
          { label: selectedLeave?.employee || 'Demande' }
        ]}
        actions={[
          ...(selectedLeave?.status !== 'Approuvé' ? [{
            id: 'approve_leave',
            label: 'Approuver la Demande',
            icon: CheckCircle2,
            variant: 'primary' as const,
            onClick: () => {
              if (selectedLeave) handleApproveLeave(selectedLeave.id);
            }
          }] : []),
          ...(selectedLeave?.status !== 'Rejeté' ? [{
            id: 'reject_leave',
            label: 'Refuser / Demander Ajustement',
            icon: X,
            variant: 'danger' as const,
            onClick: () => {
              if (selectedLeave) handleRejectLeave(selectedLeave.id);
            }
          }] : []),
          {
            id: 'sync_calendar',
            label: selectedLeave?.calendarSynced ? 'Désactiver Sync iCal' : 'Synchroniser Google Calendar',
            icon: CalendarCheck,
            onClick: () => {
              if (selectedLeave) handleToggleSyncCalendar(selectedLeave.id);
            }
          }
        ]}
        kpis={[
          { label: 'Durée Demandée', value: `${selectedLeave?.days} jours`, sub: 'Jours ouvrés' },
          { label: 'Solde Restant', value: `${selectedLeave?.balanceRemaining} jours`, sub: 'Sur 25j annuels' },
          { label: 'Continuité Backup', value: '100% Assurée', sub: `Relais : ${selectedLeave?.replacement.split(' ')[0]}`, trend: 'up' },
          { label: 'Statut Calendrier', value: selectedLeave?.calendarSynced ? 'Synchronisé' : 'En attente', sub: 'Google Cal / Outlook' }
        ]}
        aiInsight={{
          title: 'Continuité de Service & Sprint AI',
          content: `L'absence de ${selectedLeave?.employee} (${selectedLeave?.days} jours) est couverte par ${selectedLeave?.replacement}. Aucune dépendance de blocage sur le sprint en cours.`,
          actionLabel: 'Notifier l\'équipe sur Slack #annonces-omk',
          onAction: () => {
            haptics.trigger('light');
            showToast('Message automatique de notification posté sur Slack');
          }
        }}
        tabs={[
          {
            id: 'details',
            label: 'Détails & Période',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 text-sm">Informations sur l'Absence</span>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type de congé:</span>
                      <span className="text-slate-200 font-medium">{selectedLeave?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Période exacte:</span>
                      <span className="text-emerald-400 font-mono font-medium">{selectedLeave?.dates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nombre de jours décomptés:</span>
                      <span className="text-slate-200 font-bold">{selectedLeave?.days} jours ouvrés</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Motif renseigné:</span>
                      <span className="text-slate-300">{selectedLeave?.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block">Remplacement & Passation de Relais</span>
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-200 font-medium block">{selectedLeave?.replacement}</span>
                      <span className="text-[11px] text-slate-400">{selectedLeave?.replacementRole}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Backup Confirmé
                    </span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* 3. SLIDE-OVER REVIEW CYCLE DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title={selectedReview?.cycle || ''}
        subtitle={`Cible : ${selectedReview?.target} • Date limite : ${selectedReview?.deadline}`}
        badge={selectedReview?.status}
        badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/30"
        avatarText="360"
        icon={Award}
        breadcrumbs={[
          { label: 'RH OS', onClick: () => setSelectedReview(null) },
          { label: 'Évaluations', onClick: () => setSelectedReview(null) },
          { label: selectedReview?.cycle || 'Campagne' }
        ]}
        actions={[
          {
            id: 'remind_reviewers',
            label: 'Relancer les Retardataires',
            icon: Send,
            variant: 'primary',
            onClick: () => {
              if (selectedReview) handleDispatchReminders(selectedReview.id);
            }
          },
          {
            id: 'export_report',
            label: 'Exporter Rapport 360° (PDF)',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Rapport complet d'évaluation ${selectedReview?.cycle} généré`);
            }
          }
        ]}
        kpis={[
          { label: 'Taux Complétion', value: `${selectedReview?.completionRate}%`, sub: `${selectedReview?.submittedCount} / ${selectedReview?.totalParticipants} soumises`, trend: 'up' },
          { label: 'Score Moyen', value: `${selectedReview?.averageScore} / 5`, sub: 'Excellence globale', trend: 'up' },
          { label: 'Date Limite', value: selectedReview?.deadline || '30 Sept', sub: 'Clôture automatique' },
          { label: 'Participants', value: `${selectedReview?.totalParticipants} Équipes`, sub: 'Engineering, Growth, Product' }
        ]}
        aiInsight={{
          title: 'Synthèse Analytique du Feedback 360°',
          content: `La campagne ${selectedReview?.cycle} démontre une très forte cohésion et une vélocité accrue. Les points forts relevés : architecture modulaire et clarté de la communication produit.`,
          actionLabel: 'Générer la matrice de compétences 360°',
          onAction: () => {
            haptics.trigger('success');
            showToast('Matrice de compétences générée avec succès');
          }
        }}
        tabs={[
          {
            id: 'rubric',
            label: 'Rubrique 360° & Barème',
            content: (
              <div className="space-y-3 text-xs">
                {selectedReview?.rubric.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{item.criteria}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Poids : {item.weight}</span>
                        <span className="font-mono text-emerald-400 font-bold">{item.score} / 5</span>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{item.description}</p>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800 mt-1">
                      <div 
                        className="bg-emerald-400 h-full rounded-full" 
                        style={{ width: `${(item.score / 5) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'participants',
            label: `Collaborateurs (${selectedReview?.participants.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                {selectedReview?.participants.map(p => (
                  <div key={p.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-200 block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">{p.role} • {p.dept}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.submitted ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Soumis ({p.score}/5)
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            haptics.trigger('medium');
                            showToast(`Relance envoyée à ${p.name}`);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                        >
                          Relancer →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* 4. SLIDE-OVER PERK DETAIL DRAWER */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedPerk}
        onClose={() => setSelectedPerk(null)}
        title={selectedPerk?.title || ''}
        subtitle={`Catégorie : ${selectedPerk?.cat} • ${selectedPerk?.val}`}
        badge={selectedPerk?.tier}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedPerk?.title.charAt(0)}
        icon={Coffee}
        breadcrumbs={[
          { label: 'RH OS', onClick: () => setSelectedPerk(null) },
          { label: 'Avantages', onClick: () => setSelectedPerk(null) },
          { label: selectedPerk?.title || 'Avantage' }
        ]}
        actions={[
          {
            id: 'submit_claim',
            label: 'Déclarer Note de Frais ($140)',
            icon: DollarSign,
            variant: 'primary',
            onClick: () => {
              if (selectedPerk) handleAddPerkClaim(selectedPerk.id);
            }
          },
          {
            id: 'download_guide',
            label: 'Guide des Garanties (PDF)',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Guide des garanties ${selectedPerk?.title} téléchargé`);
            }
          }
        ]}
        kpis={[
          { label: 'Budget Mensuel', value: selectedPerk?.budgetMonthly || '$140', sub: 'Prise en charge 100%' },
          { label: 'Plafond Annuel', value: selectedPerk?.annualCap || 'Illimité', sub: 'Frais réels' },
          { label: 'Délai Remb.', value: selectedPerk?.reimbursementDelay || '< 24h', sub: 'Virement direct', trend: 'up' },
          { label: 'Fournisseur', value: selectedPerk?.provider.split(' ')[0] || 'Partenaire', sub: 'Contrat Entreprise' }
        ]}
        aiInsight={{
          title: 'Recommandation Avantages & Rétention AI',
          content: `L'avantage ${selectedPerk?.title} enregistre un taux de satisfaction de 98%. Recommandation : maintenir le plafond annuel pour préserver la compétitivité du package de recrutement.`,
          actionLabel: 'Consulter le benchmark salarial externe',
          onAction: () => {
            haptics.trigger('light');
            showToast('Benchmark salarial Tech Europe 2026 ouvert');
          }
        }}
        tabs={[
          {
            id: 'guarantees',
            label: `Garanties Couvertes (${selectedPerk?.guarantees.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                {selectedPerk?.guarantees.map((g, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{g.item}</span>
                      <span className="text-emerald-400 font-mono font-medium">{g.coverage}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">Plafond : {g.ceiling}</span>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'claims',
            label: `Notes de Frais & Demandes (${selectedPerk?.claims.length || 0})`,
            content: (
              <div className="space-y-3 text-xs">
                <button
                  onClick={() => {
                    if (selectedPerk) handleAddPerkClaim(selectedPerk.id);
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Plus size={15} />
                  <span>Soumettre une Nouvelle Dépense</span>
                </button>

                <div className="space-y-2">
                  {selectedPerk?.claims.map(claim => (
                    <div key={claim.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">{claim.title}</span>
                        <span className="text-[11px] text-slate-400">{claim.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold block">{claim.amount}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {claim.status}
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
