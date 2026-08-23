import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck2, 
  Building2, 
  Zap, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  Terminal, 
  Play, 
  Server, 
  CheckSquare, 
  Square, 
  Clock, 
  ShieldCheck, 
  Award, 
  FileText, 
  DollarSign, 
  LifeBuoy, 
  PhoneCall, 
  Code, 
  RotateCcw, 
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  AlertOctagon,
  Copy,
  Plus,
  X,
  Trash2,
  ListPlus
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

// --- DATA DEFINITIONS ---

interface ChecklistStep {
  step: number;
  title: string;
  desc: string;
  done: boolean;
}

interface AuditEntry {
  date: string;
  user: string;
  action: string;
  status: 'valid' | 'warning';
}

interface SOPItem {
  id: string;
  code: string;
  title: string;
  category: string;
  version: string;
  lastAudited: string;
  auditor: string;
  complianceScore: string;
  avgExecTime: string;
  certification: string;
  steps: ChecklistStep[];
  auditLogs: AuditEntry[];
  aiInsight: string;
}

interface VendorInvoice {
  id: string;
  month: string;
  amount: string;
  status: string;
}

interface VendorItem {
  id: string;
  name: string;
  category: string;
  monthlyCost: string;
  rawCost: number;
  sla: string;
  actualUptime: string;
  renewalDate: string;
  noticePeriod: string;
  status: 'active' | 'review' | 'pending';
  reliabilityScore: string;
  supportTier: string;
  escalation: {
    l1: string;
    l2: string;
    emergency: string;
    tam: string;
  };
  invoices: VendorInvoice[];
  contractDetails: string;
  aiInsight: string;
}

interface ExecutionLog {
  timestamp: string;
  duration: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

interface AutomationItem {
  id: string;
  name: string;
  triggerType: string;
  frequency: string;
  successRate: string;
  avgDuration: string;
  dailyExecs: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  logs: ExecutionLog[];
  payload: string;
  aiInsight: string;
}

interface IncidentItem {
  id: string;
  title: string;
  desc: string;
  status: 'active' | 'resolved';
  severity: 'high' | 'medium' | 'low';
  service: string;
  fix: string;
  impact: string;
  startedAt: string;
  logs: string[];
}

// --- INITIAL MOCK DATA ---

const INITIAL_SOPS: SOPItem[] = [
  {
    id: 'sop-1',
    code: 'SOP-OPS-01',
    title: 'Déploiement Zero-Downtime & Canary',
    category: 'Déploiement & Infrastructure',
    version: 'v3.4',
    lastAudited: '18 Août 2026',
    auditor: 'Bureau Veritas / ISO 27001',
    complianceScore: '99.4%',
    avgExecTime: '4m 30s',
    certification: 'ISO 27001 & SOC 2 Type II',
    steps: [
      { step: 1, title: 'Vérification intégrité image OCI & signature Cosign', desc: 'Contrôle de la signature cryptographique du conteneur avant déploiement.', done: true },
      { step: 2, title: 'Création réplique Canary 10% du trafic', desc: 'Injection progressive du trafic utilisateur avec observation télémétrique APM.', done: true },
      { step: 3, title: 'Contrôle automatique du taux d\'erreur HTTP (< 0.01%)', desc: 'Validation des sondes Prometheus sur une fenêtre glissante de 120s.', done: true },
      { step: 4, title: 'Bascule progressive 100% et purge cache CDN', desc: 'Routage intégral vers les pods v2 et invalidation des clés de cache.', done: false },
      { step: 5, title: 'Notification Slack & enregistrement au registre de release', desc: 'Notification automatique du canal #engineering et horodatage.', done: false }
    ],
    auditLogs: [
      { date: '18 Août 2026 14:32', user: 'Alexandre M. (Lead DevOps)', action: 'Audit de certification annuel validé sans non-conformité', status: 'valid' },
      { date: '10 Août 2026 09:15', user: 'Système CI/CD Auto', action: 'Exécution nominale Canary release v4.2.1', status: 'valid' },
      { date: '02 Août 2026 22:40', user: 'Sophie L. (Security Officer)', action: 'Revue des politiques de signature Cosign', status: 'valid' }
    ],
    aiInsight: 'La procédure SOP-OPS-01 affiche un taux de succès de 100%. Recommandation : automatiser l\'étape 4 de purge CDN via l\'agent MCP Cloudflare pour économiser 45 secondes.'
  },
  {
    id: 'sop-2',
    code: 'SOP-SEC-02',
    title: 'Gestion d\'Incident Critique P1 & Escalade',
    category: 'Sécurité & Continuité',
    version: 'v2.8',
    lastAudited: '12 Août 2026',
    auditor: 'SOC 2 Lead Auditor',
    complianceScore: '98.8%',
    avgExecTime: '8m 15s',
    certification: 'SOC 2 Type II & ANSI/ISA-95',
    steps: [
      { step: 1, title: 'Déclenchement cellule de crise & pont PagerDuty', desc: 'Ouverture du canal audio d\'urgence et affectation du coordinateur d\'incident.', done: true },
      { step: 2, title: 'Isolation du sous-système impacté (Circuit Breaker)', desc: 'Activation du mode dégradé et bascule sur réplica read-only.', done: true },
      { step: 3, title: 'Communication publique sur StatusPage OMK', desc: 'Publication du message d\'information sous un délai maximum de 15 minutes.', done: false },
      { step: 4, title: 'Application du runbook correctif certifié', desc: 'Exécution du script de remédiation validé par l\'équipe sécurité.', done: false },
      { step: 5, title: 'Post-mortem blameless sous 48 heures ouvrées', desc: 'Rédaction du compte-rendu avec plan d\'action préventif.', done: false }
    ],
    auditLogs: [
      { date: '12 Août 2026 11:00', user: 'Marc D. (Auditeur Cyber)', action: 'Simulation d\'incident P1 exécutée avec MTTR de 6m40s', status: 'valid' },
      { date: '28 Juil 2026 16:20', user: 'Alexandre M.', action: 'Mise à jour des contacts d\'escalade TAM AWS', status: 'valid' }
    ],
    aiInsight: 'Le temps moyen de déclenchement du pont PagerDuty est descendu à 48 secondes. L\'intégration du bot IA d\'astreinte a réduit le délai de premier diagnostic de 65%.'
  },
  {
    id: 'sop-3',
    code: 'SOP-INF-03',
    title: 'Rotation des Secrets & Certificats TLS',
    category: 'Cryptographie & Sécurité',
    version: 'v4.0',
    lastAudited: '05 Août 2026',
    auditor: 'Security Operations OMK',
    complianceScore: '100%',
    avgExecTime: '2m 10s',
    certification: 'ISO 27001 / Zero Trust',
    steps: [
      { step: 1, title: 'Génération nouvelles paires de clés ECDSA P-384', desc: 'Création des clés cryptographiques dans le coffre HSM sécurisé.', done: true },
      { step: 2, title: 'Déploiement simultané dans HashiCorp Vault & AWS KMS', desc: 'Synchronisation multicloud chiffrée avec double approbation.', done: true },
      { step: 3, title: 'Recharge à chaud des passerelles TLS NGINX/Envoy', desc: 'Signal SIGHUP pour bascule sans coupure des connexions TCP actives.', done: true },
      { step: 4, title: 'Révocation et archivage sécurisé des anciens secrets', desc: 'Suppression définitive des anciens jetons du registre opérationnel.', done: true }
    ],
    auditLogs: [
      { date: '05 Août 2026 04:00', user: 'Rotation Automatique Daemon', action: 'Rotation trimestrielle des certificats wildcard *.omk.io', status: 'valid' },
      { date: '05 Mai 2026 04:00', user: 'Rotation Automatique Daemon', action: 'Rotation trimestrielle nominale exécutée en 1m58s', status: 'valid' }
    ],
    aiInsight: 'La rotation est 100% automatisée sans aucune action manuelle requise. Prochaine exécution programmée le 5 Novembre 2026 à 04:00 UTC.'
  },
  {
    id: 'sop-4',
    code: 'SOP-BCP-04',
    title: 'Sauvegarde Immuable & Plan de Reprise (PRA)',
    category: 'Continuité d\'Activité',
    version: 'v2.1',
    lastAudited: '01 Août 2026',
    auditor: 'Comité de Continuité OMK',
    complianceScore: '99.1%',
    avgExecTime: '12m 00s',
    certification: 'ISO 22301 & SOC 2',
    steps: [
      { step: 1, title: 'Snapshot incrémental PostgreSQL avec WAL streaming', desc: 'Capture de l\'état de la base de données avec garantie de consistance ACID.', done: true },
      { step: 2, title: 'Chiffrement AES-GCM 256 bits et transfert S3 Glacier', desc: 'Stockage immuable (Object Lock) avec rétention légale de 7 ans.', done: true },
      { step: 3, title: 'Test de restauration automatisé sur environnement bac à sable', desc: 'Instanciation d\'un cluster éphémère pour vérifier l\'intégrité des tables.', done: true },
      { step: 4, title: 'Rapport d\'intégrité checksum SHA-512 envoyé au compliance vault', desc: 'Enregistrement de la preuve de sauvegarde infalsifiable.', done: false }
    ],
    auditLogs: [
      { date: '01 Août 2026 03:30', user: 'Job Backup PRA', action: 'Test de restauration sandbox validé en 9m12s (RPO: 0s, RTO: 9m)', status: 'valid' }
    ],
    aiInsight: 'RPO (Recovery Point Objective) mesuré à 0 seconde et RTO (Recovery Time Objective) à 9m12s, largement en dessous du seuil contractuel de 30 minutes.'
  }
];

const INITIAL_VENDORS: VendorItem[] = [
  {
    id: 'v-1',
    name: 'Amazon Web Services (AWS)',
    category: 'IaaS / Compute, RDS & S3',
    monthlyCost: '$3,420 / mois',
    rawCost: 3420,
    sla: '99.99%',
    actualUptime: '99.995%',
    renewalDate: '15 Jan 2027',
    noticePeriod: '30 jours',
    status: 'active',
    reliabilityScore: '99.9%',
    supportTier: 'Enterprise TAM 24/7',
    escalation: {
      l1: 'aws-support@amazon.com (Hotline +1 888-280-4331)',
      l2: 'TAM Dédié : Patrick V. (p.vogel@aws.internal)',
      emergency: 'AWS Urgent Crisis Bridge (Code: OMK-9821)',
      tam: 'Patrick Vogel (Réponse moyenne < 8 min)'
    },
    invoices: [
      { id: 'INV-AWS-2026-08', month: 'Août 2026', amount: '$3,420.00', status: 'Payé' },
      { id: 'INV-AWS-2026-07', month: 'Juillet 2026', amount: '$3,280.50', status: 'Payé' },
      { id: 'INV-AWS-2026-06', month: 'Juin 2026', amount: '$3,150.00', status: 'Payé' }
    ],
    contractDetails: 'Contrat Entreprise 12 mois avec remise volume EDP de 14% sur compute EKS et transfert réseau.',
    aiInsight: 'Négociation annuelle : Le volume de compute a augmenté de 28% sur 6 mois. Possibilité de réserver des instances Savings Plans 3 ans pour économiser 22% ($750/mois).'
  },
  {
    id: 'v-2',
    name: 'Stripe Payments US',
    category: 'Fintech / Passerelle de Paiement',
    monthlyCost: '$1,240 / mois',
    rawCost: 1240,
    sla: '99.99%',
    actualUptime: '99.98%',
    renewalDate: '01 Mars 2027',
    noticePeriod: 'Tacite reconduction',
    status: 'active',
    reliabilityScore: '99.8%',
    supportTier: 'Stripe Enterprise Custom',
    escalation: {
      l1: 'priority-support@stripe.com',
      l2: 'Account Manager : Claire M. (claire.m@stripe.com)',
      emergency: 'Stripe Incident Desk (+1 888-926-2289)',
      tam: 'Claire Martin (Account Executive)'
    },
    invoices: [
      { id: 'INV-STR-2026-08', month: 'Août 2026', amount: '$1,240.00', status: 'Prélevé' },
      { id: 'INV-STR-2026-07', month: 'Juillet 2026', amount: '$1,180.00', status: 'Prélevé' }
    ],
    contractDetails: 'Taux négocié Inter-Entreprises 1.4% + $0.20 par transaction réussie. Payouts instantanés activés.',
    aiInsight: 'Le taux d\'autorisation des cartes bancaires est de 96.8%. Radar Fraud Protection a bloqué 12 tentatives suspectes ce mois sans aucun faux positif.'
  },
  {
    id: 'v-3',
    name: 'Datadog Observability',
    category: 'APM & Télémétrie Distribuée',
    monthlyCost: '$890 / mois',
    rawCost: 890,
    sla: '99.95%',
    actualUptime: '99.99%',
    renewalDate: '30 Nov 2026',
    noticePeriod: '30 jours',
    status: 'review',
    reliabilityScore: '99.7%',
    supportTier: 'Datadog Pro Support',
    escalation: {
      l1: 'support@datadoghq.com',
      l2: 'Escalation Team (emea-escalations@datadoghq.com)',
      emergency: 'Datadog Emergency Bridge Hotline',
      tam: 'Jean-Luc R. (Solutions Engineer)'
    },
    invoices: [
      { id: 'INV-DD-2026-08', month: 'Août 2026', amount: '$890.00', status: 'Payé' },
      { id: 'INV-DD-2026-07', month: 'Juillet 2026', amount: '$890.00', status: 'Payé' }
    ],
    contractDetails: 'Licence 50 hôtes avec ingestion logs 15 jours de rétention et synthetics tests continus.',
    aiInsight: 'Revue de renouvellement requise avant le 30 Novembre. 12 hôtes de staging consomment des métriques APM non essentielles qui peuvent être réduites.'
  },
  {
    id: 'v-4',
    name: 'Anthropic & OpenAI API',
    category: 'IA Générative & Modèles LLM',
    monthlyCost: '$1,650 / mois',
    rawCost: 1650,
    sla: '99.90%',
    actualUptime: '99.92%',
    renewalDate: 'Mensuel renouvelable',
    noticePeriod: 'Immédiat',
    status: 'active',
    reliabilityScore: '99.5%',
    supportTier: 'Enterprise Scale Tier',
    escalation: {
      l1: 'enterprise-support@anthropic.com',
      l2: 'Developer Relations Desk',
      emergency: 'Priority API Status Hotline',
      tam: 'Sarah B. (AI Technical Specialist)'
    },
    invoices: [
      { id: 'INV-AI-2026-08', month: 'Août 2026', amount: '$1,650.00', status: 'Payé' },
      { id: 'INV-AI-2026-07', month: 'Juillet 2026', amount: '$1,420.00', status: 'Payé' }
    ],
    contractDetails: 'Crédits prépayés avec basculement automatique Claude 3.5 Sonnet / GPT-4o en cas de saturation de débit.',
    aiInsight: 'L\'optimisation du prompt caching sur les requêtes Coach AI a réduit la consommation de tokens d\'entrée de 42%, maintenant la facture sous le seuil d\'alerte.'
  }
];

const INITIAL_AUTOMATIONS: AutomationItem[] = [
  {
    id: 'n8n-1',
    name: 'Sync Stripe Webhooks -> Grand Livre',
    triggerType: 'Webhook Ingress (n8n Engine)',
    frequency: 'Temps Réel (Instant)',
    successRate: '99.8%',
    avgDuration: '240ms',
    dailyExecs: '1,420 / jour',
    status: 'active',
    lastRun: 'Il y a 2 min',
    logs: [
      { timestamp: '15:42:10', duration: '228ms', status: 'success', message: 'Event invoice.payment_succeeded traité pour acct_99182 ($450.00)' },
      { timestamp: '15:38:02', duration: '245ms', status: 'success', message: 'Écriture comptable générée et lettrée sur compte 512000' },
      { timestamp: '15:20:18', duration: '310ms', status: 'success', message: 'Envoi reçu PDF client généré par worker JaaS' },
      { timestamp: '14:50:00', duration: '512ms', status: 'warning', message: 'Retry webhook 1/3 sur latence temporaire base PostgreSQL' }
    ],
    payload: JSON.stringify({
      event: 'invoice.payment_succeeded',
      id: 'evt_3Mkj99x82910',
      created: 1787391730,
      data: {
        object: {
          id: 'in_1Mkj8891029',
          customer: 'cus_8492019',
          amount_paid: 45000,
          currency: 'usd',
          status: 'paid',
          hosted_invoice_url: 'https://pay.stripe.com/invoice/inv_98129'
        }
      },
      metadata: {
        source: 'omk_billing_service',
        environment: 'production'
      }
    }, null, 2),
    aiInsight: 'Le nœud de synchronisation n8n traite 100% des transactions en moins de 300ms. Aucune anomalie de lettrage détectée sur les 7 derniers jours.'
  },
  {
    id: 'n8n-2',
    name: 'Alert Escalation & PagerDuty Dispatch',
    triggerType: 'Prometheus Alertmanager Hook',
    frequency: 'Sur Événement (Event-Driven)',
    successRate: '100%',
    avgDuration: '180ms',
    dailyExecs: '42 / jour',
    status: 'active',
    lastRun: 'Il y a 18 min',
    logs: [
      { timestamp: '15:24:00', duration: '175ms', status: 'success', message: 'Alerte MemoryPressure ap-south reçue et acquittée' },
      { timestamp: '14:10:15', duration: '190ms', status: 'success', message: 'Notification d\'astreinte envoyée sur canal Slack #ops-alerts' },
      { timestamp: '12:00:00', duration: '160ms', status: 'success', message: 'Heartbeat de supervision régulier - 0 alerte critique' }
    ],
    payload: JSON.stringify({
      receiver: 'n8n-pagerduty-dispatcher',
      status: 'firing',
      alerts: [
        {
          status: 'firing',
          labels: {
            alertname: 'NodeHighMemoryUsage',
            severity: 'warning',
            instance: 'ap-south-edge-01'
          },
          annotations: {
            summary: 'RAM utilisation > 90% sur nœud Singapore',
            runbook: 'https://docs.omk.internal/runbooks/rb-mem-01'
          }
        }
      ]
    }, null, 2),
    aiInsight: 'L\'escalade intelligente regroupe les alertes similaires pour éviter la fatigue d\'alerte. Taux de déduplication : 88%.'
  },
  {
    id: 'n8n-3',
    name: 'Postgres Backup & S3 Cold Archive',
    triggerType: 'Cron Schedule (03:00 UTC)',
    frequency: 'Quotidien',
    successRate: '99.5%',
    avgDuration: '8m 42s',
    dailyExecs: '1 / jour',
    status: 'active',
    lastRun: 'Aujourd\'hui 03:00',
    logs: [
      { timestamp: '03:00:01', duration: '4m 12s', status: 'success', message: 'pg_dump streaming compressé gzip niveau 9 (Taille: 4.8 GB)' },
      { timestamp: '03:04:15', duration: '3m 30s', status: 'success', message: 'Transfert chiffré multipart vers bucket S3 vault-backup-eu' },
      { timestamp: '03:07:45', duration: '1m 00s', status: 'success', message: 'Génération de l\'empreinte SHA-512 et validation checksum' }
    ],
    payload: JSON.stringify({
      job_id: 'backup_pg_prod_20260822',
      status: 'completed',
      size_bytes: 5153960755,
      sha512: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      destination: 's3://omk-backups-immutable-eu/prod/2026-08-22.sql.gz.enc',
      duration_seconds: 522
    }, null, 2),
    aiInsight: 'La compression et le streaming direct ont permis de maintenir le temps de backup sous les 10 minutes pour une base de 5.2 GB.'
  },
  {
    id: 'n8n-4',
    name: 'Lead Qualification & Agent Dispatch',
    triggerType: 'Formulaire Entrant Webhook',
    frequency: 'Temps Réel',
    successRate: '98.9%',
    avgDuration: '1.2s',
    dailyExecs: '180 / jour',
    status: 'active',
    lastRun: 'Il y a 44 min',
    logs: [
      { timestamp: '14:58:12', duration: '1.1s', status: 'success', message: 'Enrichissement Clearbit + scoring IA effectué pour contact@fintech-scale.io' },
      { timestamp: '14:58:13', duration: '0.1s', status: 'success', message: 'Lead routé vers Pipeline Enterprise (Score 94/100)' }
    ],
    payload: JSON.stringify({
      lead_id: 'ld_849201',
      email: 'alexandre@fintech-scale.io',
      company: 'Fintech Scale SAS',
      estimated_acv: 45000,
      score: 94,
      tier: 'Enterprise Tier',
      assigned_rep: 'Sophie L.'
    }, null, 2),
    aiInsight: 'Le score de conversion des leads qualifiés par ce workflow est supérieur de 34% aux flux non enrichis.'
  }
];

const INITIAL_INCIDENTS: IncidentItem[] = [
  { 
    id: 'inc-1', 
    title: 'Latence API Stripe Webhooks', 
    desc: 'Pics de 800ms observés sur l\'endpoint de checkout et confirmation de paiement.', 
    status: 'active', 
    severity: 'high', 
    service: 'Payment Gateway (Ingress)', 
    fix: 'Basculer le trafic sur le fallback CDN et redémarrer le pool de connexions Redis.',
    impact: '3% des paiements avec délai de confirmation +2s',
    startedAt: 'Il y a 22m',
    logs: [
      '[15:30:12] WARN: Redis connection pool exhaustion on cluster-eu-central-1',
      '[15:30:45] ERROR: Webhook retry threshold reached (attempt 3/5)',
      '[15:32:00] INFO: Auto-scaler spawned 2 fallback pods automatically'
    ]
  },
  { 
    id: 'inc-2', 
    title: 'Mise à niveau Base PostgreSQL (v16.4)', 
    desc: 'Migration sans interruption complétée avec succès à 04:00 AM.', 
    status: 'resolved', 
    severity: 'low', 
    service: 'PostgreSQL Main Cluster', 
    fix: 'Basculement synchrone du replica vers le maître.',
    impact: 'Zéro interruption de service utilisateur',
    startedAt: 'Aujourd\'hui 04:00',
    logs: [
      '[04:00:01] INFO: Starting zero-downtime schema migration v4.2',
      '[04:01:15] SUCCESS: Indexes re-built successfully on standby instance',
      '[04:02:00] SUCCESS: Traffic routed to primary node nominal'
    ]
  },
  { 
    id: 'inc-3', 
    title: 'Saturation Cache Redis (Auto-LRU)', 
    desc: 'Nettoyage des clés expirées exécuté avec succès par l\'agent de maintenance.', 
    status: 'resolved', 
    severity: 'medium', 
    service: 'Redis Cache Cluster', 
    fix: 'Auto-eviction appliquée avec libération de 4.2GB.',
    impact: 'Latence temporaire +12ms pendant 45s',
    startedAt: 'Hier 18:40',
    logs: [
      '[18:40:00] WARN: Memory watermark 85% reached on redis-01',
      '[18:40:45] SUCCESS: LRU eviction freed 4.2GB RAM automatically'
    ]
  }
];

const OPS_TABS = [
  { id: 'sops', label: 'SOPs & Procédures', icon: FileCheck2, badge: 4 },
  { id: 'vendors', label: 'Fournisseurs SaaS', icon: Building2, badge: 4 },
  { id: 'automations', label: 'Automations n8n', icon: Zap, badge: 'Live' },
  { id: 'incidents', label: 'Incidents Live', icon: ShieldAlert, badge: 1, badgeColor: 'bg-amber-500 text-slate-950 font-bold' }
];

export default function Operations() {
  const [activeTab, setActiveTab] = useState('sops');
  const [sops, setSops] = useState<SOPItem[]>(INITIAL_SOPS);
  const [vendors, setVendors] = useState<VendorItem[]>(INITIAL_VENDORS);
  const [automations, setAutomations] = useState<AutomationItem[]>(INITIAL_AUTOMATIONS);
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_INCIDENTS);

  // Selected state for slide-over DetailDrawers
  const [selectedSOP, setSelectedSOP] = useState<SOPItem | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationItem | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state for creation
  const [isCreateSOPOpen, setIsCreateSOPOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // SOP Form State
  const [sopTitle, setSopTitle] = useState('');
  const [sopCategory, setSopCategory] = useState('Déploiement & Infrastructure');
  const [sopCertification, setSopCertification] = useState('ISO 27001 & SOC 2 Type II');
  const [sopVersion, setSopVersion] = useState('v1.0');
  const [sopAuditor, setSopAuditor] = useState('Comité de Conformité OMK');
  const [sopSteps, setSopSteps] = useState<Array<{ title: string; desc: string }>>([
    { title: 'Vérification intégrité & signature cryptographique', desc: 'Contrôle des prérequis système et validation de l\'intégrité des artefacts.' },
    { title: 'Exécution du protocole de déploiement nominal', desc: 'Application des runbooks certifiés et observation télémétrique APM.' }
  ]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');

  // SaaS Vendor Form State
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('IaaS / Compute, RDS & S3');
  const [vendorCost, setVendorCost] = useState<number>(1200);
  const [vendorSLA, setVendorSLA] = useState('99.99%');
  const [vendorSupportTier, setVendorSupportTier] = useState('Enterprise TAM 24/7');
  const [vendorRenewalDate, setVendorRenewalDate] = useState('15 Jan 2027');
  const [vendorNoticePeriod, setVendorNoticePeriod] = useState('30 jours');
  const [vendorL1, setVendorL1] = useState('');
  const [vendorL2, setVendorL2] = useState('');
  const [vendorEmergency, setVendorEmergency] = useState('');

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreateSOPOpen) setIsCreateSOPOpen(false);
        else if (isAddVendorOpen) setIsAddVendorOpen(false);
        else if (selectedSOP) setSelectedSOP(null);
        else if (selectedVendor) setSelectedVendor(null);
        else if (selectedAutomation) setSelectedAutomation(null);
        else if (selectedIncident) setSelectedIncident(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateSOPOpen, isAddVendorOpen, selectedSOP, selectedVendor, selectedAutomation, selectedIncident]);

  // Add Step to SOP builder
  const handleAddStepToSOP = () => {
    if (!newStepTitle.trim()) return;
    haptics.trigger('light');
    setSopSteps(prev => [
      ...prev,
      {
        title: newStepTitle.trim(),
        desc: newStepDesc.trim() || 'Étape opérationnelle validée par l\'opérateur.'
      }
    ]);
    setNewStepTitle('');
    setNewStepDesc('');
  };

  // Remove Step from SOP builder
  const handleRemoveStepFromSOP = (index: number) => {
    haptics.trigger('light');
    setSopSteps(prev => prev.filter((_, i) => i !== index));
  };

  // Handle SOP Form Submit
  const handleCreateSOPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopTitle.trim() || sopSteps.length === 0) return;

    haptics.trigger('success');
    const newCode = `SOP-OPS-${String(sops.length + 1).padStart(2, '0')}`;
    const newSOPItem: SOPItem = {
      id: `sop-${Date.now()}`,
      code: newCode,
      title: sopTitle.trim(),
      category: sopCategory,
      version: sopVersion.trim() || 'v1.0',
      lastAudited: 'Aujourd\'hui',
      auditor: sopAuditor.trim() || 'Audit Interne OMK',
      complianceScore: '100%',
      avgExecTime: '4m 30s',
      certification: sopCertification,
      steps: sopSteps.map((st, idx) => ({
        step: idx + 1,
        title: st.title,
        desc: st.desc,
        done: false
      })),
      auditLogs: [
        {
          date: 'À l\'instant',
          user: 'Alexandre M. (Lead DevOps)',
          action: `Création initiale et certification de la procédure ${newCode} (${sopCertification})`,
          status: 'valid'
        }
      ],
      aiInsight: `La procédure ${newCode} a été enregistrée avec succès. Taux de conformité certifié à 100% selon le standard ${sopCertification}.`
    };

    setSops(prev => [newSOPItem, ...prev]);
    setIsCreateSOPOpen(false);
    setSopTitle('');
    setNewStepTitle('');
    setNewStepDesc('');
    showToast(`Procédure SOP "${newSOPItem.title}" (${newCode}) créée avec succès`);
  };

  // Handle Vendor Form Submit
  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    haptics.trigger('success');
    const cleanName = vendorName.trim();
    const cleanPrefix = cleanName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'VND');
    const newVendorItem: VendorItem = {
      id: `v-${Date.now()}`,
      name: cleanName,
      category: vendorCategory,
      monthlyCost: `$${vendorCost.toLocaleString()} / mois`,
      rawCost: vendorCost,
      sla: vendorSLA,
      actualUptime: `${(parseFloat(vendorSLA) + 0.005).toFixed(3)}%`,
      renewalDate: vendorRenewalDate.trim() || '31 Déc 2026',
      noticePeriod: vendorNoticePeriod.trim() || '30 jours',
      status: 'active',
      reliabilityScore: '99.9%',
      supportTier: vendorSupportTier,
      escalation: {
        l1: vendorL1.trim() || `support@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        l2: vendorL2.trim() || `tam-dedicated@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
        emergency: vendorEmergency.trim() || `Hotline P1 24/7 (+1 888-${Math.floor(100+Math.random()*900)}-${Math.floor(1000+Math.random()*9000)})`,
        tam: 'Technical Account Manager Dédié'
      },
      invoices: [
        {
          id: `INV-${cleanPrefix}-2026-08`,
          month: 'Août 2026',
          amount: `$${vendorCost.toFixed(2)}`,
          status: 'Payé'
        }
      ],
      contractDetails: `Contrat de service souscrit avec support ${vendorSupportTier} et engagement SLA ${vendorSLA}.`,
      aiInsight: `Contrat fournisseur "${cleanName}" actif. Supervision en temps réel des SLAs et analyse mensuelle de la facturation.`
    };

    setVendors(prev => [newVendorItem, ...prev]);
    setIsAddVendorOpen(false);
    setVendorName('');
    setVendorL1('');
    setVendorL2('');
    setVendorEmergency('');
    showToast(`Fournisseur SaaS "${newVendorItem.name}" ajouté avec succès`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle SOP checklist step
  const handleToggleStep = (sopId: string, stepIndex: number) => {
    haptics.trigger('selection');
    setSops(prev => prev.map(sop => {
      if (sop.id !== sopId) return sop;
      const newSteps = [...sop.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], done: !newSteps[stepIndex].done };
      return { ...sop, steps: newSteps };
    }));

    if (selectedSOP && selectedSOP.id === sopId) {
      setSelectedSOP(prev => {
        if (!prev) return null;
        const newSteps = [...prev.steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], done: !newSteps[stepIndex].done };
        return { ...prev, steps: newSteps };
      });
    }
  };

  // Manual re-trigger automation
  const handleReTriggerAutomation = (id: string) => {
    haptics.trigger('success');
    const newLog: ExecutionLog = {
      timestamp: 'À l\'instant',
      duration: '195ms',
      status: 'success',
      message: 'Exécution manuelle déclenchée avec succès par l\'opérateur'
    };

    setAutomations(prev => prev.map(auto => {
      if (auto.id !== id) return auto;
      return {
        ...auto,
        lastRun: 'À l\'instant',
        logs: [newLog, ...auto.logs]
      };
    }));

    if (selectedAutomation && selectedAutomation.id === id) {
      setSelectedAutomation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lastRun: 'À l\'instant',
          logs: [newLog, ...prev.logs]
        };
      });
    }

    showToast(`Automation "${selectedAutomation?.name || 'Workflow'}" relancée avec succès`);
  };

  // Resolve incident
  const handleResolveIncident = (id: string) => {
    haptics.trigger('success');
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
    showToast('Incident marqué comme résolu avec succès');
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Segmented Multipage Menu */}
      <AppTopNav 
        tabs={OPS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">

          {/* TAB 1: SOPS & PROCEDURES */}
          {activeTab === 'sops' && (
            <motion.div
              key="sops"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="SOPs & Procédures Certifiées"
                subtitle="Standard Operating Procedures conformes ISO 27001 & SOC 2"
                badge={`${sops.length} Certifiées`}
                icon={FileCheck2}
                kpis={[
                  { label: 'Conformité Globale', value: '99.3%', sub: 'Audit Q3 Validé', trend: 'up' },
                  { label: 'Procédures Actives', value: `${sops.length}`, sub: '100% à jour' },
                  { label: 'Temps Moyen Exec', value: '6m 45s', sub: '-18% vs 2025', trend: 'up' }
                ]}
                actions={
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsCreateSOPOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Créer une SOP</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {sops.map(sop => {
                    const completedSteps = sop.steps.filter(s => s.done).length;
                    const totalSteps = sop.steps.length;
                    const pct = Math.round((completedSteps / totalSteps) * 100);

                    return (
                      <DetailCard
                        key={sop.id}
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedSOP(sop);
                        }}
                        isInteractive
                        title={sop.title}
                        badge={sop.code}
                        badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono font-bold"
                        icon={FileCheck2}
                        subtitle={`${sop.category} • Version ${sop.version}`}
                      >
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <CheckSquare size={13} className="text-emerald-400" />
                              Étapes validées : <strong className="text-slate-100">{completedSteps}/{totalSteps}</strong>
                            </span>
                            <span className="font-mono text-emerald-400 font-semibold">{pct}%</span>
                          </div>

                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                            <span className="text-slate-400">Auditeur : <span className="text-slate-200">{sop.auditor.split('/')[0]}</span></span>
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              Consulter checklist & audit →
                            </span>
                          </div>
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>

                <AIInsightCard
                  title="Supervision de Conformité Coach AI"
                  content="Toutes les procédures opérationnelles sont alignées avec les exigences ISO 27001:2022 et SOC 2 Type II. Aucun écart ou non-conformité majeure n'a été relevé."
                  actionLabel="Télécharger l'attestation de conformité globale"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Attestation ISO 27001 / SOC 2 téléchargée avec succès');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: SAAS VENDORS */}
          {activeTab === 'vendors' && (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Fournisseurs SaaS & Infrastructure"
                subtitle="Contrats, SLAs, facturation mensuelle et escalade"
                badge={`${vendors.length} Partenaires`}
                icon={Building2}
                kpis={[
                  { label: 'Budget SaaS Total', value: `$${vendors.reduce((acc, v) => acc + (v.rawCost || 0), 0).toLocaleString()} / m`, sub: 'Sous plafond budgétaire' },
                  { label: 'SLA Moyen Réel', value: '99.98%', sub: 'Zéro pénalité contractuelle', trend: 'up' },
                  { label: 'Contrats Actifs', value: `${vendors.length} / ${vendors.length}`, sub: 'Tous audités' }
                ]}
                actions={
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsAddVendorOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Ajouter Fournisseur</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {vendors.map(v => (
                    <DetailCard
                      key={v.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedVendor(v);
                      }}
                      isInteractive
                      title={v.name}
                      badge={v.monthlyCost}
                      badgeColor="bg-slate-950 text-slate-100 border-slate-800 font-mono font-semibold"
                      icon={Building2}
                      subtitle={v.category}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">SLA Garanti</div>
                          <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{v.sla}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Renouvellement</div>
                          <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{v.renewalDate}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Support</div>
                          <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{v.supportTier.split(' ')[0]}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Fiabilité : <strong className="text-emerald-400 font-mono">{v.reliabilityScore}</strong></span>
                        <span className="text-emerald-400 font-medium">Inspecter SLA & facturation →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Optimisation Budgétaire Fournisseurs"
                  content="Une économie estimée à $750/mois est envisageable sur AWS en convertissant les nœuds à la demande en Reserved Instances 3 ans. Le contrat Datadog arrive à échéance en Novembre."
                  actionLabel="Lancer la simulation de renégociation"
                  onAction={() => {
                    haptics.trigger('medium');
                    showToast('Simulation de négociation contractuelle générée');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: AUTOMATIONS & N8N */}
          {activeTab === 'automations' && (
            <motion.div
              key="automations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Automations & Moteur n8n"
                subtitle="Workflows distribués, synchronisations et pipelines événementiels"
                badge="Moteur Actif"
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                icon={Zap}
                kpis={[
                  { label: 'Exécutions 24h', value: '1,642', sub: '+14% vs hier', trend: 'up' },
                  { label: 'Taux de Succès', value: '99.8%', sub: 'Haute fiabilité' },
                  { label: 'Latence Moyenne', value: '235ms', sub: 'P95 Exécution', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {automations.map(auto => (
                    <DetailCard
                      key={auto.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedAutomation(auto);
                      }}
                      isInteractive
                      title={auto.name}
                      badge={auto.frequency}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Zap}
                      subtitle={`Déclencheur : ${auto.triggerType}`}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Taux Succès</div>
                          <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{auto.successRate}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Durée Moyenne</div>
                          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{auto.avgDuration}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Dernier Run</div>
                          <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{auto.lastRun}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Volume : <strong className="text-slate-200">{auto.dailyExecs}</strong></span>
                        <span className="text-emerald-400 font-medium">Logs & Debug Payload →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Orchestration & Débogage AI"
                  content="Tous les workflows n8n fonctionnent à leur performance nominale. Le circuit breaker automatique a protégé le webhook Stripe contre 2 pics de charge."
                  actionLabel="Exécuter un diagnostic complet des webhooks"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Diagnostic complet des webhooks n8n exécuté : 100% OK');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: INCIDENTS LIVE */}
          {activeTab === 'incidents' && (
            <motion.div
              key="incidents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Supervision des Incidents & Alertes"
                subtitle="Télémétrie en temps réel et résolution assistée par IA"
                badge={`${incidents.filter(i => i.status === 'active').length} En Cours`}
                badgeColor={incidents.some(i => i.status === 'active') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                icon={ShieldAlert}
                kpis={[
                  { label: 'MTTR Moyen', value: '4m 12s', sub: '-35% vs Q2', trend: 'up' },
                  { label: 'Disponibilité', value: '99.98%', sub: 'SLA Entreprise' },
                  { label: 'Incidents Résolus', value: '28', sub: 'Ce mois' }
                ]}
              >
                <div className="space-y-3">
                  {incidents.map(inc => (
                    <DetailCard
                      key={inc.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedIncident(inc);
                      }}
                      isInteractive
                      title={inc.title}
                      badge={inc.status === 'active' ? 'Incident En Cours (P1)' : 'Résolu'}
                      badgeColor={inc.status === 'active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                      icon={inc.status === 'active' ? ShieldAlert : CheckCircle2}
                      subtitle={`Composant : ${inc.service} • ${inc.startedAt}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{inc.desc}</p>

                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800/60 text-[11px]">
                        <span className="text-slate-400">Impact : <span className="text-slate-300">{inc.impact.split(' ')[0]} {inc.impact.split(' ')[1]}</span></span>
                        <span className="text-emerald-400 font-medium">Inspecter télémétrie & logs →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Diagnostic Télémétrique Coach AI"
                  content="L'incident sur Payment Gateway provient d'une contention temporaire de sockets TCP sur Redis. Le runbook Purge Totale résoudra la latence en 5 secondes."
                  actionLabel="Appliquer le correctif automatisé"
                  onAction={() => {
                    handleResolveIncident('inc-1');
                    showToast('Purge automatique du cache Redis exécutée. Latence nominale rétablie.');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 1: SOP & PROCEDURE DETAIL DRAWER                           */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedSOP}
        onClose={() => setSelectedSOP(null)}
        title={selectedSOP?.title || ''}
        subtitle={`${selectedSOP?.code} • Version ${selectedSOP?.version} (${selectedSOP?.category})`}
        badge={selectedSOP?.certification}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedSOP?.code.split('-')[1] || 'SOP'}
        breadcrumbs={[
          { label: 'Operations', onClick: () => setSelectedSOP(null) },
          { label: 'Procédures SOP', onClick: () => setSelectedSOP(null) },
          { label: selectedSOP?.code || 'SOP' }
        ]}
        actions={[
          {
            id: 'export_pdf',
            label: 'Exporter PDF',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('light');
              showToast(`Export PDF de la procédure ${selectedSOP?.code} téléchargé`);
            }
          },
          {
            id: 'validate_all',
            label: 'Valider Tout',
            icon: CheckSquare,
            onClick: () => {
              if (!selectedSOP) return;
              haptics.trigger('success');
              setSops(prev => prev.map(s => {
                if (s.id !== selectedSOP.id) return s;
                return { ...s, steps: s.steps.map(step => ({ ...step, done: true })) };
              }));
              setSelectedSOP(prev => prev ? { ...prev, steps: prev.steps.map(step => ({ ...step, done: true })) } : null);
              showToast('Toutes les étapes de la procédure ont été validées');
            }
          }
        ]}
        kpis={[
          { label: 'Étapes Validées', value: `${selectedSOP?.steps.filter(s => s.done).length || 0}/${selectedSOP?.steps.length || 0}`, sub: 'Checklist active' },
          { label: 'Score Conformité', value: selectedSOP?.complianceScore || '100%', sub: 'Audit certifié', trend: 'up' },
          { label: 'Dernier Audit', value: selectedSOP?.lastAudited || '', sub: selectedSOP?.auditor.split('/')[0] || '' },
          { label: 'Temps Moyen Exec', value: selectedSOP?.avgExecTime || '5 min', sub: 'Idempotent' }
        ]}
        aiInsight={{
          title: 'Recommandation Procédurale AI',
          content: selectedSOP?.aiInsight || '',
          actionLabel: 'Planifier le prochain audit interne',
          onAction: () => {
            haptics.trigger('medium');
            showToast('Audit interne programmé dans le calendrier de conformité');
          }
        }}
        tabs={[
          {
            id: 'checklist',
            label: `Checklist (${selectedSOP?.steps.filter(s => s.done).length}/${selectedSOP?.steps.length})`,
            content: (
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>Cliquez sur chaque étape pour marquer son exécution :</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    {Math.round(((selectedSOP?.steps.filter(s => s.done).length || 0) / (selectedSOP?.steps.length || 1)) * 100)}%
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedSOP?.steps.map((step, idx) => (
                    <button
                      key={step.step}
                      onClick={() => selectedSOP && handleToggleStep(selectedSOP.id, idx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        step.done 
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100' 
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {step.done ? (
                          <div className="w-5 h-5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                            <CheckSquare size={14} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center text-slate-500">
                            <Square size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${step.done ? 'text-emerald-300 line-through opacity-80' : 'text-slate-100'}`}>
                            Étape {step.step} : {step.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">#{step.step}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'audit_log',
            label: 'Journal d\'Audit',
            content: (
              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mb-2">Historique Immuable des Exécutions</div>
                  {selectedSOP?.auditLogs.map((log, idx) => (
                    <div key={idx} className="pb-2 border-b border-slate-900 last:border-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-semibold">{log.date}</span>
                        <span className="text-slate-400">{log.user}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{log.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'certification',
            label: 'Certifications',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Award size={16} />
                    <span>Conformité Réglementaire Certifiée</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Norme :</span>
                    <span className="text-slate-100 font-semibold">{selectedSOP?.certification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Organisme Auditeur :</span>
                    <span className="text-slate-200">{selectedSOP?.auditor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statut de la preuve :</span>
                    <span className="text-emerald-400 font-mono">Archive SHA-512 Valide</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 2: SAAS VENDOR DETAIL DRAWER                               */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={selectedVendor?.name || ''}
        subtitle={`${selectedVendor?.category} • Contrat Partenaire Actif`}
        badge={`SLA ${selectedVendor?.sla}`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedVendor?.name.charAt(0) || 'V'}
        breadcrumbs={[
          { label: 'Operations', onClick: () => setSelectedVendor(null) },
          { label: 'Fournisseurs SaaS', onClick: () => setSelectedVendor(null) },
          { label: selectedVendor?.name || 'Fournisseur' }
        ]}
        actions={[
          {
            id: 'escalate',
            label: 'Escalade Support P1',
            icon: PhoneCall,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('warning');
              showToast(`Ouverture ticket P1 et pont d'escalade ${selectedVendor?.name}`);
            }
          },
          {
            id: 'download_contract',
            label: 'Télécharger Contrat',
            icon: Download,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Contrat de service ${selectedVendor?.name} téléchargé`);
            }
          }
        ]}
        kpis={[
          { label: 'Dépense Mensuelle', value: selectedVendor?.monthlyCost.split('/')[0] || '$0', sub: 'Facturation récurrente' },
          { label: 'SLA Contractuel', value: selectedVendor?.sla || '99.99%', sub: `Uptime réel : ${selectedVendor?.actualUptime}`, trend: 'up' },
          { label: 'Renouvellement', value: selectedVendor?.renewalDate || '', sub: `Préavis ${selectedVendor?.noticePeriod}` },
          { label: 'Indice Fiabilité', value: selectedVendor?.reliabilityScore || '100%', sub: 'Supervision 24/7' }
        ]}
        aiInsight={{
          title: 'Analyse Contractuelle AI',
          content: selectedVendor?.aiInsight || '',
          actionLabel: 'Exporter le rapport d\'utilisation',
          onAction: () => {
            haptics.trigger('light');
            showToast('Rapport de consommation exporté en CSV');
          }
        }}
        tabs={[
          {
            id: 'sla_tab',
            label: 'SLA & Garanties',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Engagement de Niveau de Service (SLA)</div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Disponibilité garantie :</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedVendor?.sla}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disponibilité constatée (30j) :</span>
                    <span className="font-mono text-emerald-300 font-bold">{selectedVendor?.actualUptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Garantie MTTA Support :</span>
                    <span className="text-slate-200 font-medium">&lt; 15 minutes (P1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pénalité de rupture :</span>
                    <span className="text-slate-300">Crédit de 10% par tranche de 0.1% sous le seuil</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'billing_tab',
            label: 'Facturation',
            content: (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Montant récurrent :</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{selectedVendor?.monthlyCost}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 px-1">Historique des 3 Dernières Factures</div>
                  {selectedVendor?.invoices.map((inv, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-200">{inv.month}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inv.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-100">{inv.amount}</div>
                        <span className="text-[10px] font-semibold text-emerald-400">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'escalation_tab',
            label: 'Escalade Support',
            content: (
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Matrice de Contact & Escalade d'Urgence</div>
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Niveau 1 (Support Général) :</span>
                      <div className="text-slate-200 font-mono text-[11px] mt-0.5">{selectedVendor?.escalation.l1}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Niveau 2 (TAM & Ingénierie Dédiée) :</span>
                      <div className="text-slate-200 font-mono text-[11px] mt-0.5">{selectedVendor?.escalation.l2}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400 uppercase font-semibold">Hotline d'Urgence P1 (24/7) :</span>
                      <div className="text-amber-300 font-mono text-[11px] mt-0.5">{selectedVendor?.escalation.emergency}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 3: AUTOMATION & N8N WORKFLOW DETAIL DRAWER                  */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedAutomation}
        onClose={() => setSelectedAutomation(null)}
        title={selectedAutomation?.name || ''}
        subtitle={`Déclencheur : ${selectedAutomation?.triggerType} (${selectedAutomation?.frequency})`}
        badge={selectedAutomation?.status === 'active' ? 'Opérationnel' : 'En Pause'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="n8n"
        breadcrumbs={[
          { label: 'Operations', onClick: () => setSelectedAutomation(null) },
          { label: 'Automations n8n', onClick: () => setSelectedAutomation(null) },
          { label: selectedAutomation?.name.split(' ')[0] || 'Workflow' }
        ]}
        actions={[
          {
            id: 're_trigger',
            label: 'Relancer l\'Automation',
            icon: RotateCcw,
            variant: 'primary',
            onClick: () => selectedAutomation && handleReTriggerAutomation(selectedAutomation.id)
          },
          {
            id: 'copy_payload',
            label: 'Copier JSON',
            icon: Copy,
            onClick: () => {
              haptics.trigger('light');
              showToast('Payload JSON copié dans le presse-papier');
            }
          }
        ]}
        kpis={[
          { label: 'Taux de Succès', value: selectedAutomation?.successRate || '99.9%', sub: 'Zéro échec bloquant', trend: 'up' },
          { label: 'Durée Moyenne', value: selectedAutomation?.avgDuration || '200ms', sub: 'Latence d\'exécution' },
          { label: 'Exécutions / Jour', value: selectedAutomation?.dailyExecs || '1000', sub: 'Débit nominal' },
          { label: 'Dernier Run', value: selectedAutomation?.lastRun || '', sub: 'Horodatage' }
        ]}
        aiInsight={{
          title: 'Diagnostic de Flux AI',
          content: selectedAutomation?.aiInsight || '',
          actionLabel: 'Optimiser la politique de retry',
          onAction: () => {
            haptics.trigger('light');
            showToast('Politique de retry n8n configurée en mode exponentiel 3 tentatives');
          }
        }}
        tabs={[
          {
            id: 'logs_tab',
            label: `Logs Récents (${selectedAutomation?.logs.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-2">
                  {selectedAutomation?.logs.map((log, idx) => (
                    <div key={idx} className="pb-2 border-b border-slate-900 last:border-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span className="font-semibold text-emerald-400">{log.duration}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${
                        log.status === 'warning' ? 'text-amber-300' : 'text-slate-300'
                      }`}>
                        {log.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'payload_tab',
            label: 'Payload Debug',
            content: (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Format JSON Ingress / Egress :</span>
                  <button 
                    onClick={() => {
                      haptics.trigger('light');
                      showToast('Payload copié');
                    }}
                    className="text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1"
                  >
                    <Copy size={12} /> Copier
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[10.5px] text-emerald-300/90 overflow-x-auto leading-relaxed max-h-72 scrollbar-hide">
                  {selectedAutomation?.payload}
                </pre>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 4: LIVE INCIDENT INSPECTOR                                 */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title || ''}
        subtitle={`Composant : ${selectedIncident?.service} • Déclenché ${selectedIncident?.startedAt}`}
        badge={selectedIncident?.status === 'active' ? 'Incident En Cours' : 'Résolu'}
        badgeColor={selectedIncident?.status === 'active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        icon={selectedIncident?.status === 'active' ? AlertOctagon : CheckCircle2}
        breadcrumbs={[
          { label: 'Operations', onClick: () => setSelectedIncident(null) },
          { label: 'Incidents Live', onClick: () => setSelectedIncident(null) },
          { label: selectedIncident?.title || 'Incident' }
        ]}
        actions={[
          {
            id: 'resolve_btn',
            label: selectedIncident?.status === 'active' ? 'Résoudre l\'incident' : 'Ré-ouvrir',
            icon: CheckCircle2,
            variant: 'primary',
            onClick: () => selectedIncident && handleResolveIncident(selectedIncident.id)
          },
          {
            id: 'purge_btn',
            label: 'Purger Cache Redis',
            icon: RefreshCw,
            onClick: () => {
              haptics.trigger('medium');
              showToast('Purge des nœuds de cache Redis exécutée');
            }
          }
        ]}
        kpis={[
          { label: 'Sévérité', value: selectedIncident?.severity.toUpperCase() || 'P1', sub: 'Impact critique' },
          { label: 'Début Incident', value: selectedIncident?.startedAt || 'N/A', sub: 'Horodatage serveur' },
          { label: 'Statut', value: selectedIncident?.status === 'active' ? 'En Cours' : 'Clôturé', sub: 'Supervisé 24/7' },
          { label: 'Composant', value: selectedIncident?.service.split(' ')[0] || '', sub: selectedIncident?.service.split(' ').slice(1).join(' ') || '' }
        ]}
        aiInsight={{
          title: 'Procédure Corrective Automatisée',
          content: selectedIncident?.fix || '',
          actionLabel: 'Appliquer le correctif automatisé',
          onAction: () => {
            if (selectedIncident) handleResolveIncident(selectedIncident.id);
          }
        }}
        tabs={[
          {
            id: 'incident_logs',
            label: `Logs Télémétriques (${selectedIncident?.logs.length || 0})`,
            content: (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                {selectedIncident?.logs.map((log, idx) => (
                  <div key={idx} className={log.includes('ERROR') ? 'text-red-400' : log.includes('WARN') ? 'text-amber-300' : 'text-slate-400'}>
                    {log}
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'impact_tab',
            label: 'Impact Utilisateur',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200">Évaluation de l'Impact & Portée</span>
                <p className="text-slate-400 leading-relaxed">{selectedIncident?.impact}</p>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* MODAL 1: CRÉER UNE PROCÉDURE SOP                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateSOPOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsCreateSOPOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 text-slate-100 scrollbar-hide"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileCheck2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Créer une Procédure SOP Certifiée</h3>
                    <p className="text-[11px] text-slate-400">Standard Operating Procedure conforme aux normes ISO & SOC 2</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateSOPOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSOPSubmit} className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                    Titre de la Procédure SOP <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sopTitle}
                    onChange={e => setSopTitle(e.target.value)}
                    placeholder="ex: Bascule de Trafic Multi-Région sans Interruption"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                {/* Category & Certification Standard */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Catégorie</label>
                    <select
                      value={sopCategory}
                      onChange={e => setSopCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Déploiement & Infrastructure">Déploiement & Infrastructure</option>
                      <option value="Sécurité & Continuité">Sécurité & Continuité</option>
                      <option value="Cryptographie & Sécurité">Cryptographie & Sécurité</option>
                      <option value="Continuité d'Activité">Continuité d'Activité</option>
                      <option value="Observabilité & Métriques">Observabilité & Métriques</option>
                      <option value="Gouvernance & Qualité">Gouvernance & Qualité</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Norme de Certification</label>
                    <select
                      value={sopCertification}
                      onChange={e => setSopCertification(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ISO 27001 & SOC 2 Type II">ISO 27001 & SOC 2 Type II</option>
                      <option value="SOC 2 Type II & ANSI/ISA-95">SOC 2 Type II & ANSI/ISA-95</option>
                      <option value="ISO 27001 / Zero Trust">ISO 27001 / Zero Trust</option>
                      <option value="ISO 22301 & SOC 2">ISO 22301 & SOC 2</option>
                      <option value="GDPR & HIPAA Compliant">GDPR & HIPAA Compliant</option>
                      <option value="PCI-DSS Level 1">PCI-DSS Level 1</option>
                    </select>
                  </div>
                </div>

                {/* Version & Auditor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Version</label>
                    <input
                      type="text"
                      value={sopVersion}
                      onChange={e => setSopVersion(e.target.value)}
                      placeholder="v1.0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Organisme Auditeur</label>
                    <input
                      type="text"
                      value={sopAuditor}
                      onChange={e => setSopAuditor(e.target.value)}
                      placeholder="Audit Interne OMK"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Steps List Builder */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Constructeur d'Étapes ({sopSteps.length} étape{sopSteps.length > 1 ? 's' : ''})
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Checklist interactive</span>
                  </div>

                  {/* Existing Steps */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {sopSteps.map((st, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-100 text-xs truncate">{st.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{st.desc}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStepFromSOP(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors shrink-0"
                          title="Supprimer cette étape"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Step Box */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <input
                      type="text"
                      value={newStepTitle}
                      onChange={e => setNewStepTitle(e.target.value)}
                      placeholder="Intitulé de la nouvelle étape..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={newStepDesc}
                      onChange={e => setNewStepDesc(e.target.value)}
                      placeholder="Description détaillée ou consigne opérationnelle..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddStepToSOP}
                      disabled={!newStepTitle.trim()}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Ajouter cette étape à la SOP</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateSOPOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!sopTitle.trim() || sopSteps.length === 0}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Enregistrer & Certifier la SOP</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: AJOUTER UN FOURNISSEUR SAAS                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddVendorOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsAddVendorOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 text-slate-100 scrollbar-hide"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Ajouter un Fournisseur SaaS & Infra</h3>
                    <p className="text-[11px] text-slate-400">Enregistrement contractuel, engagements SLA et matrice d'escalade</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddVendorOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddVendorSubmit} className="space-y-3.5 text-xs">
                {/* Name & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Nom du Fournisseur <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={e => setVendorName(e.target.value)}
                      placeholder="ex: Cloudflare Enterprise"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Catégorie</label>
                    <select
                      value={vendorCategory}
                      onChange={e => setVendorCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="IaaS / Compute, RDS & S3">IaaS / Compute, RDS & S3</option>
                      <option value="Fintech / Passerelle de Paiement">Fintech / Passerelle de Paiement</option>
                      <option value="APM & Télémétrie Distribuée">APM & Télémétrie Distribuée</option>
                      <option value="IA Générative & Modèles LLM">IA Générative & Modèles LLM</option>
                      <option value="CDN & WAF Edge Security">CDN & WAF Edge Security</option>
                      <option value="Communication & Mail Gateway">Communication & Mail Gateway</option>
                    </select>
                  </div>
                </div>

                {/* Monthly Cost & SLA Contract */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Coût Mensuel Récurrent ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={vendorCost}
                      onChange={e => setVendorCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">SLA Garanti Contractuel</label>
                    <select
                      value={vendorSLA}
                      onChange={e => setVendorSLA(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="99.99%">99.99% (Quatre Neufs)</option>
                      <option value="99.95%">99.95%</option>
                      <option value="99.90%">99.90%</option>
                      <option value="99.50%">99.50%</option>
                    </select>
                  </div>
                </div>

                {/* Support Tier & Renewal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Niveau de Support</label>
                    <select
                      value={vendorSupportTier}
                      onChange={e => setVendorSupportTier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Enterprise TAM 24/7">Enterprise TAM 24/7</option>
                      <option value="Stripe Enterprise Custom">Stripe Enterprise Custom</option>
                      <option value="Datadog Pro Support">Datadog Pro Support</option>
                      <option value="Enterprise Scale Tier">Enterprise Scale Tier</option>
                      <option value="Business Priority SLA">Business Priority SLA</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Date Renouvellement</label>
                    <input
                      type="text"
                      value={vendorRenewalDate}
                      onChange={e => setVendorRenewalDate(e.target.value)}
                      placeholder="15 Jan 2027"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Escalation Matrix */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Matrice de Contact & Escalade d'Urgence
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Support Général (L1 Email / Tél)</label>
                      <input
                        type="text"
                        value={vendorL1}
                        onChange={e => setVendorL1(e.target.value)}
                        placeholder="support@vendor.com"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">TAM / Ingénieur Dédié (L2)</label>
                      <input
                        type="text"
                        value={vendorL2}
                        onChange={e => setVendorL2(e.target.value)}
                        placeholder="tam-lead@vendor.internal"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-amber-400 block mb-0.5 font-medium">Hotline d'Urgence P1 (24/7 Crisis Bridge)</label>
                    <input
                      type="text"
                      value={vendorEmergency}
                      onChange={e => setVendorEmergency(e.target.value)}
                      placeholder="+1 (888) 555-0199 (Code PIN OMK-8821)"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddVendorOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!vendorName.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Ajouter le Fournisseur</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
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
