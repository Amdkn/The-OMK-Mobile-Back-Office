import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Database, 
  ShieldCheck, 
  Building2, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  Terminal, 
  Key, 
  Lock, 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  ChevronRight, 
  Layers, 
  HardDrive, 
  ShieldAlert, 
  Zap, 
  Server, 
  CheckSquare, 
  Square, 
  Clock, 
  Users, 
  Sparkles, 
  ArrowRight,
  Radio,
  FileCheck2,
  Landmark,
  Eye,
  Sliders,
  Folder,
  FileCode,
  Link,
  Shield,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

// --- DATA DEFINITIONS ---

interface EndpointMetric {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  latency: string;
  rps: string;
  successRate: string;
}

interface MicroserviceItem {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'healthy' | 'degraded' | 'maintenance';
  latencyP50: string;
  latencyP95: string;
  latencyP99: string;
  throughputRPS: string;
  errorRate: string;
  rateLimit: {
    maxRPS: number;
    burstRPS: number;
    policy: string;
  };
  tokenQuota: {
    apiKeyMasked: string;
    allocatedMonthly: string;
    consumed: string;
    percentUsed: number;
    resetDate: string;
  };
  endpoints: EndpointMetric[];
  aiInsight: string;
}

interface S3File {
  name: string;
  size: string;
  type: string;
  lastModified: string;
  mime: string;
}

interface S3BucketItem {
  id: string;
  name: string;
  region: string;
  objectsCount: number;
  totalSizeBytes: string;
  monthlyCost: string;
  encryption: string;
  accessControl: string;
  corsEnabled: boolean;
  versioning: boolean;
  files: S3File[];
  policyJson: string;
  aiInsight: string;
}

interface RBACPermission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}

interface IAMRoleItem {
  id: string;
  name: string;
  type: 'Role IAM' | 'Service Account' | 'Auditeur Externe';
  privilegeLevel: 'SuperAdmin' | 'Developer' | 'Automated Daemon' | 'Read-Only Audit';
  assignedUsers: string[];
  mfaEnforced: boolean;
  sessionDuration: string;
  lastRotated: string;
  securityScore: string;
  permissions: RBACPermission[];
  aiInsight: string;
}

interface CorporateDoc {
  id: string;
  title: string;
  date: string;
  size: string;
  type: string;
  status: 'verified' | 'pending';
  authority: string;
  description: string;
  filingNumber: string;
}

// --- INITIAL MOCK DATA ---

const INITIAL_SERVICES: MicroserviceItem[] = [
  {
    id: 'svc-auth',
    name: 'Auth & Session Gateway',
    category: 'Sécurité & Identité',
    version: 'v4.2.1',
    status: 'healthy',
    latencyP50: '8ms',
    latencyP95: '18ms',
    latencyP99: '32ms',
    throughputRPS: '420 req/s',
    errorRate: '0.01%',
    rateLimit: {
      maxRPS: 600,
      burstRPS: 1200,
      policy: 'Token Bucket avec Exponential Backoff'
    },
    tokenQuota: {
      apiKeyMasked: 'omk_live_auth_98a2••••••••4092',
      allocatedMonthly: '10,000,000 tokens',
      consumed: '6,840,000 tokens',
      percentUsed: 68,
      resetDate: '01 Sept 2026'
    },
    endpoints: [
      { path: '/api/v1/auth/login', method: 'POST', latency: '24ms', rps: '48 req/s', successRate: '99.9%' },
      { path: '/api/v1/auth/session/verify', method: 'GET', latency: '6ms', rps: '280 req/s', successRate: '100%' },
      { path: '/api/v1/auth/mfa/challenge', method: 'POST', latency: '14ms', rps: '64 req/s', successRate: '99.8%' },
      { path: '/api/v1/auth/logout', method: 'DELETE', latency: '8ms', rps: '28 req/s', successRate: '100%' }
    ],
    aiInsight: 'Le taux de cache-hit sur /api/v1/auth/session/verify est de 94.2%. Recommandation : étendre le TTL de session à 30 minutes pour réduire la charge CPU de 8% sur le cluster Redis.'
  },
  {
    id: 'svc-billing',
    name: 'Payment & Stripe Webhook Proxy',
    category: 'Fintech & Facturation',
    version: 'v3.8.0',
    status: 'healthy',
    latencyP50: '110ms',
    latencyP95: '240ms',
    latencyP99: '420ms',
    throughputRPS: '95 req/s',
    errorRate: '0.04%',
    rateLimit: {
      maxRPS: 250,
      burstRPS: 500,
      policy: 'Strict IP Rate-Limiting + Signature Check'
    },
    tokenQuota: {
      apiKeyMasked: 'omk_live_bill_33f1••••••••8819',
      allocatedMonthly: '2,000,000 tokens',
      consumed: '1,120,000 tokens',
      percentUsed: 56,
      resetDate: '01 Sept 2026'
    },
    endpoints: [
      { path: '/api/v1/billing/charge', method: 'POST', latency: '210ms', rps: '18 req/s', successRate: '99.8%' },
      { path: '/api/v1/billing/subscriptions', method: 'GET', latency: '35ms', rps: '45 req/s', successRate: '100%' },
      { path: '/api/v1/webhooks/stripe', method: 'POST', latency: '120ms', rps: '32 req/s', successRate: '99.6%' }
    ],
    aiInsight: 'La synchronisation des webhooks Stripe fonctionne à 100% sans timeout. L\'idempotency key sur chaque requête garantit zéro double facturation.'
  },
  {
    id: 'svc-ai-rag',
    name: 'Vector Embeddings & RAG Engine',
    category: 'IA & Base Vectorielle',
    version: 'v2.6.4',
    status: 'healthy',
    latencyP50: '42ms',
    latencyP95: '95ms',
    latencyP99: '180ms',
    throughputRPS: '160 req/s',
    errorRate: '0.01%',
    rateLimit: {
      maxRPS: 400,
      burstRPS: 800,
      policy: 'Dynamic Token Leaky Bucket'
    },
    tokenQuota: {
      apiKeyMasked: 'omk_live_rag_77b0••••••••9934',
      allocatedMonthly: '25,000,000 tokens',
      consumed: '18,200,000 tokens',
      percentUsed: 73,
      resetDate: '01 Sept 2026'
    },
    endpoints: [
      { path: '/api/v1/ai/embeddings/create', method: 'POST', latency: '65ms', rps: '55 req/s', successRate: '99.9%' },
      { path: '/api/v1/ai/rag/search', method: 'POST', latency: '38ms', rps: '90 req/s', successRate: '100%' },
      { path: '/api/v1/ai/models/health', method: 'GET', latency: '12ms', rps: '15 req/s', successRate: '100%' }
    ],
    aiInsight: 'L\'indexation HNSW sur pgvector réduit le temps de recherche cosine à 38ms. 99% des requêtes sémantiques sont résolues sous 100ms.'
  },
  {
    id: 'svc-telemetry',
    name: 'Telemetry Ingest & eBPF Streamer',
    category: 'Observabilité & Réseau',
    version: 'v5.1.0',
    status: 'healthy',
    latencyP50: '4ms',
    latencyP95: '12ms',
    latencyP99: '22ms',
    throughputRPS: '1,850 req/s',
    errorRate: '0.00%',
    rateLimit: {
      maxRPS: 5000,
      burstRPS: 10000,
      policy: 'Kernel-Level eBPF Bypass & Fast Ingest'
    },
    tokenQuota: {
      apiKeyMasked: 'omk_live_ebpf_11c9••••••••0022',
      allocatedMonthly: 'Illimité (Stream Interne)',
      consumed: '142M événements',
      percentUsed: 28,
      resetDate: '01 Sept 2026'
    },
    endpoints: [
      { path: '/api/v1/telemetry/ingest', method: 'POST', latency: '5ms', rps: '1400 req/s', successRate: '100%' },
      { path: '/api/v1/telemetry/stream', method: 'GET', latency: '2ms', rps: '350 req/s', successRate: '100%' },
      { path: '/metrics', method: 'GET', latency: '15ms', rps: '100 req/s', successRate: '100%' }
    ],
    aiInsight: 'Le streamer eBPF capture l\'intégralité des flux réseau au niveau du kernel Linux sans aucun overhead CPU sur les applications hébergées.'
  }
];

const INITIAL_BUCKETS: S3BucketItem[] = [
  {
    id: 'bkt-vault',
    name: 'omk-backoffice-vault-prod',
    region: 'eu-west-1 (Irlande)',
    objectsCount: 1420,
    totalSizeBytes: '8.4 GB',
    monthlyCost: '$18.50 / mois',
    encryption: 'AWS KMS AES-256 (Clé Gérée Dédiée)',
    accessControl: 'Strictement Privé (Block Public Access 100%)',
    corsEnabled: true,
    versioning: true,
    files: [
      { name: 'articles_of_organization_wy.pdf', size: '2.4 MB', type: 'PDF', lastModified: '12 Jan 2026', mime: 'application/pdf' },
      { name: 'ein_confirmation_cp575.pdf', size: '1.1 MB', type: 'PDF', lastModified: '15 Jan 2026', mime: 'application/pdf' },
      { name: 'operating_agreement_llc.pdf', size: '3.8 MB', type: 'PDF', lastModified: '18 Jan 2026', mime: 'application/pdf' },
      { name: 'certificate_good_standing_2026.pdf', size: '1.5 MB', type: 'PDF', lastModified: '01 Août 2026', mime: 'application/pdf' },
      { name: 'fec_fiscal_export_2026_q2.zip', size: '14.2 MB', type: 'ZIP', lastModified: '15 Juil 2026', mime: 'application/zip' }
    ],
    policyJson: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'EnforceTLSAndKMSOnly',
          Effect: 'Deny',
          Principal: '*',
          Action: 's3:*',
          Resource: ['arn:aws:s3:::omk-backoffice-vault-prod', 'arn:aws:s3:::omk-backoffice-vault-prod/*'],
          Condition: {
            Bool: { 'aws:SecureTransport': 'false' }
          }
        },
        {
          Sid: 'AllowOMKServiceRoles',
          Effect: 'Allow',
          Principal: { AWS: 'arn:aws:iam::849201928392:role/OMKBackofficeBackendRole' },
          Action: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
          Resource: ['arn:aws:s3:::omk-backoffice-vault-prod', 'arn:aws:s3:::omk-backoffice-vault-prod/*']
        }
      ]
    }, null, 2),
    aiInsight: 'Tous les fichiers légaux et fiscaux sont chiffrés au repos avec clé KMS dédiée. Versioning immuable activé avec protection contre l\'effacement accidentel.'
  },
  {
    id: 'bkt-backups',
    name: 'omk-backups-immutable-eu',
    region: 'eu-central-1 (Francfort)',
    objectsCount: 365,
    totalSizeBytes: '184.2 GB',
    monthlyCost: '$42.80 / mois',
    encryption: 'AWS KMS AES-GCM 256',
    accessControl: 'Object Lock WORM (Rétention 7 ans)',
    corsEnabled: false,
    versioning: true,
    files: [
      { name: 'pg_backup_prod_20260822.sql.gz.enc', size: '4.8 GB', type: 'GZ/ENC', lastModified: 'Aujourd\'hui 03:00', mime: 'application/octet-stream' },
      { name: 'pg_backup_prod_20260821.sql.gz.enc', size: '4.7 GB', type: 'GZ/ENC', lastModified: 'Hier 03:00', mime: 'application/octet-stream' },
      { name: 'wal_archive_stream_q3.tar.gz', size: '12.4 GB', type: 'TAR/GZ', lastModified: '20 Août 2026', mime: 'application/gzip' }
    ],
    policyJson: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'DenyDeleteObjectLock',
          Effect: 'Deny',
          Principal: '*',
          Action: ['s3:DeleteObject', 's3:DeleteObjectVersion'],
          Resource: 'arn:aws:s3:::omk-backups-immutable-eu/*'
        }
      ]
    }, null, 2),
    aiInsight: 'La politique de cycle de vie (Lifecycle Rule) bascule automatiquement les backups de plus de 90 jours vers S3 Glacier Deep Archive ($0.00099/GB).'
  },
  {
    id: 'bkt-media',
    name: 'omk-media-cdn-assets',
    region: 'us-east-1 (N. Virginia)',
    objectsCount: 840,
    totalSizeBytes: '2.1 GB',
    monthlyCost: '$6.20 / mois',
    encryption: 'Amazon S3 Managed (SSE-S3)',
    accessControl: 'Origin Access Identity (CloudFront CDN)',
    corsEnabled: true,
    versioning: false,
    files: [
      { name: 'brand_logo_omk_dark.svg', size: '48 KB', type: 'SVG', lastModified: '10 Août 2026', mime: 'image/svg+xml' },
      { name: 'design_tokens_theme_v2.json', size: '120 KB', type: 'JSON', lastModified: '14 Août 2026', mime: 'application/json' },
      { name: 'client_invoice_template_fr.pdf', size: '450 KB', type: 'PDF', lastModified: '08 Août 2026', mime: 'application/pdf' }
    ],
    policyJson: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipalReadOnly',
          Effect: 'Allow',
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::omk-media-cdn-assets/*'
        }
      ]
    }, null, 2),
    aiInsight: 'Les assets statiques bénéficient d\'un cache Edge mondial Cloudflare / CloudFront avec un temps de réponse moyen de 12ms sur 98% des requêtes.'
  }
];

const INITIAL_ROLES: IAMRoleItem[] = [
  {
    id: 'role-admin',
    name: 'SuperAdmin (Platform Owner)',
    type: 'Role IAM',
    privilegeLevel: 'SuperAdmin',
    assignedUsers: ['alexandre@omk.io', 'admin-emergency-breakglass'],
    mfaEnforced: true,
    sessionDuration: '4 heures (Max)',
    lastRotated: '15 Août 2026 (Il y a 7j)',
    securityScore: '100%',
    permissions: [
      { module: 'Finance & Trésorerie', read: true, write: true, delete: true, admin: true },
      { module: 'Clients & CRM', read: true, write: true, delete: true, admin: true },
      { module: 'Operations & PaaS', read: true, write: true, delete: true, admin: true },
      { module: 'Auth, IAM & Secrets', read: true, write: true, delete: true, admin: true }
    ],
    aiInsight: 'Rôle hautement sécurisé. Authentification par clé matérielle FIDO2 / YubiKey exigée. Zéro mot de passe statique autorisé.'
  },
  {
    id: 'role-dev',
    name: 'Developer Core Services',
    type: 'Role IAM',
    privilegeLevel: 'Developer',
    assignedUsers: ['sophie.l@omk.io', 'julien.v@omk.io', 'dev-team-lead'],
    mfaEnforced: true,
    sessionDuration: '8 heures',
    lastRotated: '01 Août 2026',
    securityScore: '98.5%',
    permissions: [
      { module: 'Finance & Trésorerie', read: false, write: false, delete: false, admin: false },
      { module: 'Clients & CRM', read: true, write: true, delete: false, admin: false },
      { module: 'Operations & PaaS', read: true, write: true, delete: false, admin: false },
      { module: 'Auth, IAM & Secrets', read: false, write: false, delete: false, admin: false }
    ],
    aiInsight: 'Principe du moindre privilège respecté. Les développeurs disposent des droits d\'écriture sur le déploiement et les logs sans accès aux données financières.'
  },
  {
    id: 'role-cicd',
    name: 'CI/CD Deployment Runner',
    type: 'Service Account',
    privilegeLevel: 'Automated Daemon',
    assignedUsers: ['svc-github-actions-prod', 'svc-argo-cd-sync'],
    mfaEnforced: false,
    sessionDuration: '15 minutes (Jeton Éphémère OIDC)',
    lastRotated: 'En continu (OIDC Token)',
    securityScore: '99.9%',
    permissions: [
      { module: 'Finance & Trésorerie', read: false, write: false, delete: false, admin: false },
      { module: 'Clients & CRM', read: false, write: false, delete: false, admin: false },
      { module: 'Operations & PaaS', read: true, write: true, delete: false, admin: false },
      { module: 'Auth, IAM & Secrets', read: true, write: false, delete: false, admin: false }
    ],
    aiInsight: 'Les runners GitHub Actions s\'authentifient via OpenID Connect (OIDC). Aucun secret de longue durée n\'est stocké dans les référentiels GitHub.'
  },
  {
    id: 'role-auditor',
    name: 'Auditor & Compliance Officer',
    type: 'Auditeur Externe',
    privilegeLevel: 'Read-Only Audit',
    assignedUsers: ['bureau-veritas-auditor@external.io', 'cpa-wyoming-accounting'],
    mfaEnforced: true,
    sessionDuration: '2 heures (Session Restreinte)',
    lastRotated: '10 Août 2026',
    securityScore: '99.2%',
    permissions: [
      { module: 'Finance & Trésorerie', read: true, write: false, delete: false, admin: false },
      { module: 'Clients & CRM', read: true, write: false, delete: false, admin: false },
      { module: 'Operations & PaaS', read: true, write: false, delete: false, admin: false },
      { module: 'Auth, IAM & Secrets', read: true, write: false, delete: false, admin: false }
    ],
    aiInsight: 'Accès en lecture seule stricte avec traçabilité intégrale de chaque document consulté. Filigrane dynamique appliqué sur les exports PDF.'
  }
];

const INITIAL_DOCS: CorporateDoc[] = [
  { 
    id: 'doc-1', 
    title: 'Articles of Organization (LLC)', 
    date: '12 Jan 2026', 
    size: '2.4 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'Wyoming Secretary of State',
    description: 'Acte constitutif officiel et immatriculation de la société OMK Global Ventures LLC.',
    filingNumber: 'WY-2026-0019283'
  },
  { 
    id: 'doc-2', 
    title: 'EIN Confirmation Letter (CP 575)', 
    date: '15 Jan 2026', 
    size: '1.1 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'Internal Revenue Service (IRS)',
    description: 'Attribution du numéro d\'identification fiscale fédéral américain officiel.',
    filingNumber: 'EIN: 99-8472910'
  },
  { 
    id: 'doc-3', 
    title: 'Operating Agreement (LLC)', 
    date: '18 Jan 2026', 
    size: '3.8 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'OMK Corporate Governance',
    description: 'Statuts régissant la gouvernance, la répartition des parts et le pouvoir de signature.',
    filingNumber: 'OA-v2.1-LEGAL'
  },
  { 
    id: 'doc-4', 
    title: 'Certificate of Good Standing', 
    date: '01 Août 2026', 
    size: '1.5 MB', 
    type: 'PDF', 
    status: 'verified', 
    authority: 'State of Wyoming',
    description: 'Certificat d\'existence légale et de pleine conformité à jour délivré par l\'État.',
    filingNumber: 'CGS-2026-88392'
  }
];

const BAAS_TABS = [
  { id: 'microservices', label: 'Microservices & APIs', icon: Cpu, badge: 4 },
  { id: 'storage', label: 'Stockage & S3', icon: Database, badge: '8.4GB' },
  { id: 'iam', label: 'Auth & IAM', icon: ShieldCheck, badge: 4 },
  { id: 'vault', label: 'Coffre Légal', icon: Building2, badge: 'Certifié' }
];

export default function BaaSHub() {
  const [activeTab, setActiveTab] = useState('microservices');
  const [services, setServices] = useState<MicroserviceItem[]>(INITIAL_SERVICES);
  const [buckets, setBuckets] = useState<S3BucketItem[]>(INITIAL_BUCKETS);
  const [roles, setRoles] = useState<IAMRoleItem[]>(INITIAL_ROLES);
  const [docs, setDocs] = useState<CorporateDoc[]>(INITIAL_DOCS);

  // Selected drawers
  const [selectedService, setSelectedService] = useState<MicroserviceItem | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<S3BucketItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<IAMRoleItem | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<CorporateDoc | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state for creation
  const [isDeployServiceOpen, setIsDeployServiceOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

  // Deploy Microservice Form State
  const [svcName, setSvcName] = useState('');
  const [svcRoute, setSvcRoute] = useState('');
  const [svcMethod, setSvcMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [svcCategory, setSvcCategory] = useState('Passerelle & Événements');
  const [svcVersion, setSvcVersion] = useState('v1.0.0');
  const [svcMaxRPS, setSvcMaxRPS] = useState<number>(350);
  const [svcBurstRPS, setSvcBurstRPS] = useState<number>(700);
  const [svcMemoryQuota, setSvcMemoryQuota] = useState('512 MB');

  // IAM RBAC Form State
  const [roleName, setRoleName] = useState('');
  const [roleType, setRoleType] = useState<'Role IAM' | 'Service Account' | 'Auditeur Externe'>('Role IAM');
  const [rolePrivilege, setRolePrivilege] = useState<'SuperAdmin' | 'Developer' | 'Automated Daemon' | 'Read-Only Audit'>('Developer');
  const [roleUsers, setRoleUsers] = useState('lead.dev@omk.io');
  const [roleMfa, setRoleMfa] = useState(true);
  const [roleSessionDuration, setRoleSessionDuration] = useState('4 heures');
  const [rolePermissions, setRolePermissions] = useState<RBACPermission[]>([
    { module: 'Finance & Trésorerie', read: true, write: false, delete: false, admin: false },
    { module: 'Clients & CRM', read: true, write: true, delete: false, admin: false },
    { module: 'Operations & PaaS', read: true, write: true, delete: false, admin: false },
    { module: 'Auth, IAM & Secrets', read: true, write: false, delete: false, admin: false }
  ]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDeployServiceOpen) setIsDeployServiceOpen(false);
        else if (isCreateRoleOpen) setIsCreateRoleOpen(false);
        else if (selectedService) setSelectedService(null);
        else if (selectedBucket) setSelectedBucket(null);
        else if (selectedRole) setSelectedRole(null);
        else if (selectedDoc) setSelectedDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeployServiceOpen, isCreateRoleOpen, selectedService, selectedBucket, selectedRole, selectedDoc]);

  // Handle Deploy Microservice Submit
  const handleDeployServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName.trim() || !svcRoute.trim()) return;

    haptics.trigger('success');
    const cleanRoute = svcRoute.trim().startsWith('/') ? svcRoute.trim() : `/${svcRoute.trim()}`;
    const cleanName = svcName.trim();

    const newMicroservice: MicroserviceItem = {
      id: `svc-${Date.now()}`,
      name: cleanName,
      category: svcCategory,
      version: svcVersion.trim() || 'v1.0.0',
      status: 'healthy',
      latencyP50: '12ms',
      latencyP95: '24ms',
      latencyP99: '40ms',
      throughputRPS: `${Math.round(svcMaxRPS * 0.35)} req/s`,
      errorRate: '0.00%',
      rateLimit: {
        maxRPS: svcMaxRPS,
        burstRPS: svcBurstRPS || svcMaxRPS * 2,
        policy: 'Token Bucket avec Exponential Backoff & Header Inspection'
      },
      tokenQuota: {
        apiKeyMasked: `omk_live_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)}••••••••${Math.floor(1000 + Math.random() * 9000)}`,
        allocatedMonthly: `${svcMemoryQuota || '512 MB'} Quota`,
        consumed: '0 tokens',
        percentUsed: 0,
        resetDate: '01 Sept 2026'
      },
      endpoints: [
        {
          path: cleanRoute,
          method: svcMethod,
          latency: '15ms',
          rps: `${Math.round(svcMaxRPS * 0.25)} req/s`,
          successRate: '100%'
        },
        {
          path: `${cleanRoute}/health`,
          method: 'GET',
          latency: '4ms',
          rps: '10 req/s',
          successRate: '100%'
        }
      ],
      aiInsight: `Microservice "${cleanName}" déployé avec succès sur la route ${cleanRoute}. Rate limit configuré à ${svcMaxRPS} req/s avec allocation mémoire de ${svcMemoryQuota}.`
    };

    setServices(prev => [newMicroservice, ...prev]);
    setIsDeployServiceOpen(false);
    setSvcName('');
    setSvcRoute('');
    showToast(`Microservice "${cleanName}" déployé sur la passerelle`);
  };

  // Handle Permission Toggle for IAM Role
  const handleTogglePermission = (moduleIndex: number, field: keyof Omit<RBACPermission, 'module'>) => {
    haptics.trigger('selection');
    setRolePermissions(prev => {
      const updated = [...prev];
      updated[moduleIndex] = {
        ...updated[moduleIndex],
        [field]: !updated[moduleIndex][field]
      };
      return updated;
    });
  };

  // Handle Create IAM Role Submit
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    haptics.trigger('success');
    const cleanName = roleName.trim();
    const userList = roleUsers.split(',').map(u => u.trim()).filter(Boolean);

    const newIAMRole: IAMRoleItem = {
      id: `role-${Date.now()}`,
      name: cleanName,
      type: roleType,
      privilegeLevel: rolePrivilege,
      assignedUsers: userList.length > 0 ? userList : ['admin@omk.io'],
      mfaEnforced: roleMfa,
      sessionDuration: roleSessionDuration || '4 heures',
      lastRotated: "À l'instant",
      securityScore: '100%',
      permissions: rolePermissions,
      aiInsight: `Règle IAM RBAC "${cleanName}" créée selon le principe de moindre privilège. ${roleMfa ? 'MFA obligatoire exigé.' : 'Accès par token de service.'}`
    };

    setRoles(prev => [newIAMRole, ...prev]);
    setIsCreateRoleOpen(false);
    setRoleName('');
    showToast(`Règle IAM RBAC "${cleanName}" créée avec succès`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Generate Presigned URL Simulation
  const handleGeneratePresignedUrl = (bucketName: string, fileName?: string) => {
    haptics.trigger('success');
    const targetFile = fileName || 'document.pdf';
    const fakeUrl = `https://${bucketName}.s3.amazonaws.com/${targetFile}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900&X-Amz-Signature=849a02fe9...`;
    showToast(`URL présignée 15 min générée et copiée dans le presse-papier`);
  };

  // Rotate Key Action
  const handleRotateKey = (serviceId: string) => {
    haptics.trigger('success');
    showToast(`Nouvelle clé API générée avec succès pour ${selectedService?.name || 'le service'}`);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={BAAS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">

          {/* TAB 1: MICROSERVICES & APIS */}
          {activeTab === 'microservices' && (
            <motion.div
              key="microservices"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Microservices & Passerelles API"
                subtitle="Métriques d'endpoints, latence P95, quotas et rate limits"
                badge={`${services.length} Microservices`}
                icon={Cpu}
                kpis={[
                  { label: 'Disponibilité Globale', value: '99.99%', sub: 'SLA Entreprise', trend: 'up' },
                  { label: 'Latence Médiane P50', value: '14ms', sub: 'Sub-20ms Engine' },
                  { label: 'Débit Global', value: '2,525 req/s', sub: 'Pic de trafic nominal', trend: 'up' }
                ]}
                actions={
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsDeployServiceOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Déployer Microservice</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {services.map(svc => (
                    <DetailCard
                      key={svc.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedService(svc);
                      }}
                      isInteractive
                      title={svc.name}
                      badge={svc.status === 'healthy' ? 'Opérationnel' : 'Sous Pression'}
                      badgeColor={svc.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={Cpu}
                      subtitle={`${svc.category} • Version ${svc.version}`}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Latence P95</div>
                          <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{svc.latencyP95}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Débit RPS</div>
                          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{svc.throughputRPS}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Quota Utilisé</div>
                          <div className="text-xs font-mono font-semibold text-slate-300 mt-0.5">{svc.tokenQuota.percentUsed}%</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Rate Limit : <strong className="text-slate-200">{svc.rateLimit.maxRPS} req/s</strong></span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          Inspecter endpoints & tokens →
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Optimisation Passerelle API AI"
                  content="L'ensemble des microservices répond aux objectifs de latence P99 sous 50ms. Le taux de compression gzip/brotli sur les réponses JSON permet d'économiser 62% de bande passante."
                  actionLabel="Lancer le benchmark de charge synthétique"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Benchmark de charge synthétique exécuté : 0 erreur à 3,000 req/s');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: STORAGE & S3 */}
          {activeTab === 'storage' && (
            <motion.div
              key="storage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Stockage Objet S3 & Coffres"
                subtitle="Buckets chiffrés KMS, explorateur de fichiers et URLs présignées"
                badge="3 Buckets"
                icon={Database}
                kpis={[
                  { label: 'Volume Stocké', value: '194.7 GB', sub: 'Chiffrement AES-256' },
                  { label: 'Objets Archivés', value: '2,625', sub: 'Versioning Actif' },
                  { label: 'Coût Mensuel', value: '$67.50', sub: 'Sous contrôle', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {buckets.map(bkt => (
                    <DetailCard
                      key={bkt.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedBucket(bkt);
                      }}
                      isInteractive
                      title={bkt.name}
                      badge={bkt.totalSizeBytes}
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono font-bold"
                      icon={HardDrive}
                      subtitle={`Région : ${bkt.region}`}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Objets</div>
                          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{bkt.objectsCount} fichiers</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Chiffrement</div>
                          <div className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">KMS Dédié</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Coût</div>
                          <div className="text-xs font-mono font-semibold text-slate-300 mt-0.5">{bkt.monthlyCost.split('/')[0]}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Contrôle : <strong className="text-slate-200">{bkt.accessControl.split(' ')[0]}</strong></span>
                        <span className="text-emerald-400 font-medium">Explorateur & URLs présignées →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Supervision du Stockage Coach AI"
                  content="Les snapshots du bucket omk-backups-immutable-eu sont soumis à une rétention WORM de 7 ans conformément aux réglementations financières. Zéro altération possible."
                  actionLabel="Vérifier l'intégrité SHA-512 des snapshots"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Vérification cryptographique validée : 100% des empreintes SHA-512 concordent');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: AUTH & IAM */}
          {activeTab === 'iam' && (
            <motion.div
              key="iam"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Gestion des Identités & Rôles IAM"
                subtitle="Matrice des permissions RBAC, audit de sécurité et sessions actives"
                badge={`${roles.length} Rôles Actifs`}
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                icon={ShieldCheck}
                kpis={[
                  { label: 'Score Sécurité', value: '99.4%', sub: 'Zero Trust Validé', trend: 'up' },
                  { label: 'Rôles & Comptes', value: `${roles.length} Rôles`, sub: 'Matrice à jour' },
                  { label: 'MFA Obligatoire', value: '100%', sub: 'FIDO2 & TOTP' }
                ]}
                actions={
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsCreateRoleOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Créer Règle RBAC</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {roles.map(role => (
                    <DetailCard
                      key={role.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedRole(role);
                      }}
                      isInteractive
                      title={role.name}
                      badge={role.privilegeLevel}
                      badgeColor={role.privilegeLevel === 'SuperAdmin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-300 border-slate-800'}
                      icon={ShieldCheck}
                      subtitle={`Type : ${role.type} • ${role.assignedUsers.length} assigné(s)`}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">MFA</div>
                          <div className="text-xs font-semibold text-emerald-400 mt-0.5">{role.mfaEnforced ? 'Obligatoire' : 'OIDC Token'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Session Max</div>
                          <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{role.sessionDuration.split(' ')[0]}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Score Audit</div>
                          <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{role.securityScore}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Rotation : <span className="text-slate-300">{role.lastRotated.split('(')[0]}</span></span>
                        <span className="text-emerald-400 font-medium">Matrice RBAC & Audit →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Audit de Moindre Privilège Coach AI"
                  content="L'analyse des journaux d'accès montre qu'aucune élévation de privilège anormale n'a eu lieu sur les 30 derniers jours. Tous les rôles respectent le principe de moindre privilège."
                  actionLabel="Exécuter un scan de conformité IAM"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Scan de conformité IAM achevé : Zéro vulnérabilité détectée');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: CORPORATE VAULT */}
          {activeTab === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Coffre Légal & Gouvernance US"
                subtitle="Société LLC Wyoming, certificat Good Standing et liasses"
                badge="Wyoming LLC"
                icon={Building2}
                kpis={[
                  { label: 'Trésorerie US', value: '$151,100', sub: '+12.4% vs M-1', trend: 'up' },
                  { label: 'Statut Légal', value: 'Good Standing', sub: 'Conformité 100%' },
                  { label: 'Juridiction', value: 'Wyoming', sub: 'Tax Friendly' }
                ]}
              >
                <div className="space-y-3">
                  {docs.map(doc => (
                    <DetailCard
                      key={doc.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedDoc(doc);
                      }}
                      isInteractive
                      title={doc.title}
                      badge={doc.size}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-mono"
                      icon={FileText}
                      subtitle={`Autorité : ${doc.authority} • ${doc.date}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-mono">{doc.filingNumber}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>Inspecter acte légal</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Supervision Juridique BaaS"
                  content="L'entité américaine OMK Global Ventures LLC est à 100% en règle. Aucun renouvellement n'est exigé avant Janvier 2027."
                  actionLabel="Télécharger le certificat Good Standing officiel"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Certificat Good Standing 2026 téléchargé');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 1: MICROSERVICE & API DETAIL DRAWER                         */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name || ''}
        subtitle={`${selectedService?.category} • Version ${selectedService?.version}`}
        badge={selectedService?.status === 'healthy' ? 'Opérationnel' : 'Sous Pression'}
        badgeColor={selectedService?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        avatarText={selectedService?.name.charAt(0) || 'S'}
        breadcrumbs={[
          { label: 'BaaS Hub', onClick: () => setSelectedService(null) },
          { label: 'Microservices & APIs', onClick: () => setSelectedService(null) },
          { label: selectedService?.name.split(' ')[0] || 'Service' }
        ]}
        actions={[
          {
            id: 'rotate_key',
            label: 'Régénérer Clé API',
            icon: Key,
            variant: 'primary',
            onClick: () => selectedService && handleRotateKey(selectedService.id)
          },
          {
            id: 'ping_probe',
            label: 'Tester Sonde Ping',
            icon: Radio,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Sonde de santé ${selectedService?.name} validée (Code HTTP 200 - 12ms)`);
            }
          }
        ]}
        kpis={[
          { label: 'Latence P95', value: selectedService?.latencyP95 || '0ms', sub: `P50: ${selectedService?.latencyP50}`, trend: 'up' },
          { label: 'Débit Global', value: selectedService?.throughputRPS || '0 req/s', sub: 'Flux nominal' },
          { label: 'Taux d\'Erreur', value: selectedService?.errorRate || '0%', sub: 'SLA < 0.05%' },
          { label: 'Quota Consommé', value: `${selectedService?.tokenQuota.percentUsed}%`, sub: selectedService?.tokenQuota.allocatedMonthly.split(' ')[0] }
        ]}
        aiInsight={{
          title: 'Analyse Télémétrique AI',
          content: selectedService?.aiInsight || '',
          actionLabel: 'Ajuster les seuils de rate limiting',
          onAction: () => {
            haptics.trigger('medium');
            showToast('Nouveau seuil de rate limiting appliqué avec succès');
          }
        }}
        tabs={[
          {
            id: 'endpoints_tab',
            label: `Endpoints (${selectedService?.endpoints.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Routes HTTP Exposées</div>
                  <div className="space-y-1.5 pt-1">
                    {selectedService?.endpoints.map((ep, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                            ep.method === 'GET' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-slate-200 text-[11px] truncate">{ep.path}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-emerald-400 font-semibold text-[10.5px]">{ep.latency}</span>
                          <span className="text-slate-500 text-[10px]">{ep.rps}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'ratelimit_tab',
            label: 'Rate Limits & Quota',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Politique de Limitation de Débit</div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Plafond continu :</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedService?.rateLimit.maxRPS} req/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacité en Burst :</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedService?.rateLimit.burstRPS} req/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Algorithme :</span>
                    <span className="text-slate-300">{selectedService?.rateLimit.policy}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Budget & Quotas de Jetons</div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Clé API Active :</span>
                    <span className="font-mono text-slate-300">{selectedService?.tokenQuota.apiKeyMasked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consommation :</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedService?.tokenQuota.consumed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plafond Mensuel :</span>
                    <span className="font-mono text-slate-200">{selectedService?.tokenQuota.allocatedMonthly}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 2: S3 BUCKET & STORAGE DETAIL DRAWER                       */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedBucket}
        onClose={() => setSelectedBucket(null)}
        title={selectedBucket?.name || ''}
        subtitle={`Région ${selectedBucket?.region} • Stockage Objet S3 Chiffré`}
        badge={selectedBucket?.totalSizeBytes}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="S3"
        breadcrumbs={[
          { label: 'BaaS Hub', onClick: () => setSelectedBucket(null) },
          { label: 'Stockage & S3', onClick: () => setSelectedBucket(null) },
          { label: selectedBucket?.name.split('-')[1] || 'Bucket' }
        ]}
        actions={[
          {
            id: 'gen_presigned',
            label: 'URL Présignée (15m)',
            icon: Link,
            variant: 'primary',
            onClick: () => selectedBucket && handleGeneratePresignedUrl(selectedBucket.name)
          },
          {
            id: 'sync_replication',
            label: 'Sync Réplication',
            icon: RefreshCw,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Synchronisation multirégionale du bucket ${selectedBucket?.name} lancée`);
            }
          }
        ]}
        kpis={[
          { label: 'Objets Stockés', value: selectedBucket?.objectsCount || 0, sub: 'Fichiers actifs' },
          { label: 'Volume Total', value: selectedBucket?.totalSizeBytes || '0 GB', sub: 'Chiffré KMS' },
          { label: 'Coût Mensuel', value: selectedBucket?.monthlyCost.split('/')[0] || '$0', sub: 'Facturation S3', trend: 'up' },
          { label: 'Versioning', value: selectedBucket?.versioning ? 'Activé' : 'Désactivé', sub: 'Protection WORM' }
        ]}
        aiInsight={{
          title: 'Analyse de Stockage AI',
          content: selectedBucket?.aiInsight || '',
          actionLabel: 'Générer une politique de cycle de vie Glacier',
          onAction: () => {
            haptics.trigger('medium');
            showToast('Politique de cycle de vie Glacier Deep Archive configurée');
          }
        }}
        tabs={[
          {
            id: 'files_tab',
            label: `Fichiers (${selectedBucket?.files.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-slate-400">
                    <span>Arborescence des Objets</span>
                    <span>Action Rapide</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {selectedBucket?.files.map((file, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder size={14} className="text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-mono text-slate-200 text-[11px] truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-500">{file.size} • {file.lastModified}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => selectedBucket && handleGeneratePresignedUrl(selectedBucket.name, file.name)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-700 text-[10px] font-medium text-emerald-400 flex items-center gap-1 shrink-0"
                        >
                          <Link size={11} /> URL Présignée
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'policy_tab',
            label: 'IAM Bucket Policy',
            content: (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Politique JSON de Sécurité :</span>
                  <button 
                    onClick={() => {
                      haptics.trigger('light');
                      showToast('Politique IAM copiée');
                    }}
                    className="text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1"
                  >
                    <Copy size={12} /> Copier
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[10.5px] text-emerald-300/90 overflow-x-auto leading-relaxed max-h-64 scrollbar-hide">
                  {selectedBucket?.policyJson}
                </pre>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 3: AUTH & IAM RBAC DETAIL DRAWER                           */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={selectedRole?.name || ''}
        subtitle={`${selectedRole?.type} • Niveau ${selectedRole?.privilegeLevel}`}
        badge={`Score ${selectedRole?.securityScore}`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedRole?.name.charAt(0) || 'R'}
        breadcrumbs={[
          { label: 'BaaS Hub', onClick: () => setSelectedRole(null) },
          { label: 'Auth & IAM', onClick: () => setSelectedRole(null) },
          { label: selectedRole?.name.split(' ')[0] || 'Rôle' }
        ]}
        actions={[
          {
            id: 'revoke_sessions',
            label: 'Révoquer Sessions Actives',
            icon: Lock,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('warning');
              showToast(`Toutes les sessions actives pour ${selectedRole?.name} ont été révoquées`);
            }
          },
          {
            id: 'rotate_creds',
            label: 'Forcer Rotation Clés',
            icon: RefreshCw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Rotation immédiate des jetons d'accès ordonnée pour ${selectedRole?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Niveau Privilège', value: selectedRole?.privilegeLevel || 'Standard', sub: 'Matrice Zero Trust' },
          { label: 'MFA Imposé', value: selectedRole?.mfaEnforced ? 'Obligatoire' : 'OIDC Jeton', sub: 'Politique active' },
          { label: 'Durée Session', value: selectedRole?.sessionDuration.split(' ')[0] || '4h', sub: 'Plafond strict' },
          { label: 'Dernière Rotation', value: selectedRole?.lastRotated.split(' ')[0] || 'Récent', sub: 'Sécurité validée' }
        ]}
        aiInsight={{
          title: 'Audit de Moindre Privilège AI',
          content: selectedRole?.aiInsight || '',
          actionLabel: 'Auditer l\'historique des accès',
          onAction: () => {
            haptics.trigger('light');
            showToast('Journal des accès IAM exporté pour conformité');
          }
        }}
        tabs={[
          {
            id: 'rbac_tab',
            label: 'Matrice RBAC',
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Permissions par Module Système</div>
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    {selectedRole?.permissions.map((perm, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="font-semibold text-slate-200">{perm.module}</div>
                        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-center ${perm.read ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-600'}`}>
                            READ {perm.read ? '✓' : '✗'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-center ${perm.write ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-600'}`}>
                            WRITE {perm.write ? '✓' : '✗'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-center ${perm.delete ? 'bg-red-500/20 text-red-300 font-bold' : 'bg-slate-900 text-slate-600'}`}>
                            DELETE {perm.delete ? '✓' : '✗'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-center ${perm.admin ? 'bg-purple-500/20 text-purple-300 font-bold' : 'bg-slate-900 text-slate-600'}`}>
                            ADMIN {perm.admin ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'users_tab',
            label: `Comptes Assignés (${selectedRole?.assignedUsers.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Identités & Comptes de Service</div>
                  <div className="space-y-1.5 pt-1">
                    {selectedRole?.assignedUsers.map((usr, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-slate-200">
                        <span>{usr}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Actif</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 4: CORPORATE DOC DETAIL DRAWER                             */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || ''}
        subtitle={`Autorité : ${selectedDoc?.authority} • ${selectedDoc?.date}`}
        badge={selectedDoc?.status === 'verified' ? 'Certifié Conforme' : 'En Attente'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedDoc?.title.charAt(0) || 'D'}
        breadcrumbs={[
          { label: 'BaaS Hub', onClick: () => setSelectedDoc(null) },
          { label: 'Coffre Légal', onClick: () => setSelectedDoc(null) },
          { label: selectedDoc?.title.split(' ')[0] || 'Acte' }
        ]}
        actions={[
          {
            id: 'download',
            label: 'Télécharger Acte PDF',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('light');
              showToast(`Acte certifié ${selectedDoc?.title} téléchargé`);
            }
          },
          {
            id: 'copy',
            label: 'Copier N° Dépôt',
            icon: Copy,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Numéro de dépôt ${selectedDoc?.filingNumber} copié`);
            }
          }
        ]}
        kpis={[
          { label: 'Numéro Dépôt', value: selectedDoc?.filingNumber.split(' ')[0] || '', sub: 'Registre public' },
          { label: 'Date Dépôt', value: selectedDoc?.date || '', sub: 'Horodatage officiel' },
          { label: 'Taille Document', value: selectedDoc?.size || '', sub: 'Format PDF/A' },
          { label: 'Autorité', value: selectedDoc?.authority.split(' ')[0] || '', sub: selectedDoc?.authority.split(' ').slice(1, 3).join(' ') }
        ]}
        aiInsight={{
          title: 'Validation Juridique Automatisée',
          content: `${selectedDoc?.description} Document archivé avec empreinte immuable sur le registre corporate OMK.`,
          actionLabel: 'Transmettre à l\'expert-comptable',
          onAction: () => {
            haptics.trigger('light');
            showToast('Acte légal transmis au cabinet comptable américain');
          }
        }}
        tabs={[
          {
            id: 'summary',
            label: 'Résumé de l\'Acte',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-200">Objet Juridique</span>
                  <p className="text-slate-400 leading-relaxed">{selectedDoc?.description}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entité concernée :</span>
                    <span className="text-slate-200 font-semibold">OMK Global Ventures LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">État d'immatriculation :</span>
                    <span className="text-emerald-400 font-medium">Wyoming, USA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Archivage Légal :</span>
                    <span className="text-slate-200 font-mono">Vault WORM 10 ans</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* MODAL 1: DÉPLOYER UN NOUVEAU MICROSERVICE                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDeployServiceOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsDeployServiceOpen(false)}
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
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Déployer un Nouveau Microservice</h3>
                    <p className="text-[11px] text-slate-400">Passerelle API haute performance, rate-limiting et gestion des quotas</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDeployServiceOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleDeployServiceSubmit} className="space-y-3.5 text-xs">
                {/* Name & Route */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Nom du Microservice <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={svcName}
                      onChange={e => setSvcName(e.target.value)}
                      placeholder="ex: Notification & SMS Gateway"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Route API Ingress <span className="text-emerald-400">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={svcMethod}
                        onChange={e => setSvcMethod(e.target.value as any)}
                        className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={svcRoute}
                        onChange={e => setSvcRoute(e.target.value)}
                        placeholder="/api/v1/notify/send"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Version */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Catégorie</label>
                    <select
                      value={svcCategory}
                      onChange={e => setSvcCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Passerelle & Événements">Passerelle & Événements</option>
                      <option value="Sécurité & Identité">Sécurité & Identité</option>
                      <option value="Fintech & Facturation">Fintech & Facturation</option>
                      <option value="IA & Base Vectorielle">IA & Base Vectorielle</option>
                      <option value="Observabilité & Réseau">Observabilité & Réseau</option>
                      <option value="Messagerie & Alertes">Messagerie & Alertes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Version Sémantique</label>
                    <input
                      type="text"
                      value={svcVersion}
                      onChange={e => setSvcVersion(e.target.value)}
                      placeholder="v1.0.0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Rate Limits & Memory Quota */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Rate Limit (RPS)</label>
                    <input
                      type="number"
                      min={10}
                      value={svcMaxRPS}
                      onChange={e => setSvcMaxRPS(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Burst Max (req/s)</label>
                    <input
                      type="number"
                      min={20}
                      value={svcBurstRPS}
                      onChange={e => setSvcBurstRPS(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Quota Mémoire</label>
                    <select
                      value={svcMemoryQuota}
                      onChange={e => setSvcMemoryQuota(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="256 MB">256 MB</option>
                      <option value="512 MB">512 MB</option>
                      <option value="1024 MB (1 GB)">1024 MB</option>
                      <option value="2048 MB (2 GB)">2048 MB</option>
                    </select>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Génération automatique de la clé API secrète et configuration du circuit breaker en temps réel.</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsDeployServiceOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!svcName.trim() || !svcRoute.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Déployer le Microservice</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: CRÉER UNE RÈGLE IAM RBAC                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateRoleOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsCreateRoleOpen(false)}
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
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Créer une Règle & Rôle IAM RBAC</h3>
                    <p className="text-[11px] text-slate-400">Attribution des privilèges par module selon le principe du moindre privilège</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateRoleOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateRoleSubmit} className="space-y-3.5 text-xs">
                {/* Role Name & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Nom du Rôle IAM <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roleName}
                      onChange={e => setRoleName(e.target.value)}
                      placeholder="ex: Lead DevOps SRE"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Type de Compte</label>
                    <select
                      value={roleType}
                      onChange={e => setRoleType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Role IAM">Role IAM (Utilisateur Humain)</option>
                      <option value="Service Account">Service Account (Daemon / CI/CD)</option>
                      <option value="Auditeur Externe">Auditeur Externe (Tiers de Confiance)</option>
                    </select>
                  </div>
                </div>

                {/* Privilege Level & Scope / Users */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Niveau de Privilège</label>
                    <select
                      value={rolePrivilege}
                      onChange={e => setRolePrivilege(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="SuperAdmin">SuperAdmin (Accès Global)</option>
                      <option value="Developer">Developer (Lecture/Écriture PaaS)</option>
                      <option value="Automated Daemon">Automated Daemon (OIDC Ephemeral)</option>
                      <option value="Read-Only Audit">Read-Only Audit (Lecture Seule)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Utilisateurs / Scope Assigné
                    </label>
                    <input
                      type="text"
                      value={roleUsers}
                      onChange={e => setRoleUsers(e.target.value)}
                      placeholder="alexandre@omk.io, dev-lead"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* MFA and Session Duration */}
                <div className="grid grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Durée Max Session</label>
                    <select
                      value={roleSessionDuration}
                      onChange={e => setRoleSessionDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="2 heures">2 heures (Session Restreinte)</option>
                      <option value="4 heures">4 heures (Standard)</option>
                      <option value="8 heures">8 heures (Journée Ouvrée)</option>
                      <option value="15 minutes (Jeton OIDC)">15 minutes (Jeton Éphémère)</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={roleMfa}
                        onChange={e => setRoleMfa(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-4 h-4"
                      />
                      <span className="text-xs font-semibold text-slate-200">Exiger Authentification MFA / FIDO2</span>
                    </label>
                  </div>
                </div>

                {/* RBAC Permissions Matrix */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Matrice des Droits Granulaires par Module
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">RBAC v4.2</span>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">Module</th>
                          <th className="py-2 px-2 text-center">Read</th>
                          <th className="py-2 px-2 text-center">Write</th>
                          <th className="py-2 px-2 text-center">Delete</th>
                          <th className="py-2 px-2 text-center">Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {rolePermissions.map((perm, idx) => (
                          <tr key={perm.module} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-2 px-3 font-medium text-slate-200">{perm.module}</td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={perm.read}
                                onChange={() => handleTogglePermission(idx, 'read')}
                                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={perm.write}
                                onChange={() => handleTogglePermission(idx, 'write')}
                                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={perm.delete}
                                onChange={() => handleTogglePermission(idx, 'delete')}
                                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={perm.admin}
                                onChange={() => handleTogglePermission(idx, 'admin')}
                                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateRoleOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!roleName.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Créer le Rôle IAM</span>
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

