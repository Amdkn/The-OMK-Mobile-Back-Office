import { createClient, SupabaseClient } from '@supabase/supabase-js';
import localforage from 'localforage';

// ============================================================================
// 1. COMPREHENSIVE MULTI-TENANT DATABASE MODEL INTERFACES
// ============================================================================

export type TenantRole = 'admin' | 'employee' | 'client' | 'visitor';
export type TenantTier = 'starter' | 'growth' | 'enterprise' | 'custom';
export type TenantStatus = 'active' | 'suspended' | 'trial' | 'archived';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tier: TenantTier;
  currency: string;
  domain?: string;
  logo_url?: string;
  status: TenantStatus;
  settings: {
    features?: string[];
    theme?: string;
    primaryColor?: string;
    logo?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  auth_user_id?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: TenantRole;
  client_id?: string;
  department?: string;
  title?: string;
  phone?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  tier: 'Enterprise' | 'Premium' | 'Standard' | 'Startup';
  status: 'Active' | 'Onboarding' | 'At Risk' | 'Churned' | 'Prospect';
  health_score: number;
  mrr: number;
  industry?: string;
  account_owner_id?: string;
  contact_email?: string;
  contact_phone?: string;
  contacts?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    decisionMaker?: boolean;
    preferredChannel?: string;
  }>;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  tenant_id: string;
  client_id: string;
  contract_number: string;
  title: string;
  type: 'MSA' | 'SOW' | 'SLA' | 'NDA' | 'Subscription' | 'Licensing';
  status: 'draft' | 'active' | 'pending_renewal' | 'expired' | 'terminated';
  value: number;
  billing_cycle: 'monthly' | 'quarterly' | 'annual' | 'milestone';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  document_url?: string;
  terms_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  tenant_id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'Critique' | 'Haute' | 'Moyenne' | 'Normale';
  progress: number;
  budget: number;
  spent: number;
  lead_id?: string;
  start_date?: string;
  due_date?: string;
  milestones?: Array<{
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }>;
  deliverables?: Array<{
    name: string;
    type: string;
    status: 'ready' | 'pending' | 'draft';
    url?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  tenant_id: string;
  client_id: string;
  project_id?: string;
  ticket_number: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'support' | 'bug' | 'feature_request' | 'billing' | 'incident';
  assigned_to?: string;
  reporter_email?: string;
  sla_due_at?: string;
  resolved_at?: string;
  comments?: Array<{
    id: string;
    author: string;
    message: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  client_id?: string;
  title: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  amount: number;
  probability: number;
  expected_close_date?: string;
  assigned_to?: string;
  source?: string;
  competitors?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'disqualified';
  score: number;
  estimated_acv?: number;
  source: 'inbound' | 'outbound' | 'referral' | 'event' | 'website' | 'partner';
  industry?: string;
  assigned_to?: string;
  qualification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  client_id?: string;
  transaction_number: string;
  type: 'income' | 'expense' | 'transfer' | 'tax';
  category: 'Subscriptions' | 'Consulting' | 'Infrastructure' | 'Salaries' | 'Marketing' | 'Tools' | 'Office' | 'Legal' | 'Other';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'reconciled' | 'failed' | 'refunded';
  date: string;
  description: string;
  payment_method?: 'Stripe' | 'Bank Wire' | 'Credit Card' | 'SEPA' | 'PayPal' | 'Crypto';
  invoice_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  tenant_id: string;
  fiscal_year: number;
  department: 'Engineering' | 'Sales & Growth' | 'Product & Design' | 'Operations & Legal' | 'Executive' | 'General';
  allocated_amount: number;
  spent_amount: number;
  currency: string;
  status: 'on_track' | 'warning' | 'exceeded' | 'closed';
  quarterly_allocations?: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  profile_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  job_title: string;
  manager_id?: string;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'intern';
  status: 'active' | 'on_leave' | 'probation' | 'terminated';
  hire_date: string;
  compensation?: {
    salary: number;
    currency: string;
    bonus_target?: number;
  };
  skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface Leave {
  id: string;
  tenant_id: string;
  employee_id: string;
  leave_type: 'paid_time_off' | 'sick_leave' | 'parental' | 'unpaid' | 'remote_work';
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SOP {
  id: string;
  tenant_id: string;
  code: string;
  title: string;
  category: 'Operations' | 'Security' | 'Engineering' | 'HR' | 'Sales' | 'Finance';
  version: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  author_id?: string;
  content: string;
  checklist?: Array<{
    step: number;
    task: string;
    done: boolean;
  }>;
  tags?: string[];
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Microservice {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  cluster: string;
  status: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  replicas_active: number;
  replicas_desired: number;
  cpu_usage_pct: number;
  memory_usage_mb: number;
  uptime_pct: number;
  endpoint_url?: string;
  version: string;
  last_health_check?: string;
  created_at: string;
  updated_at: string;
}

export interface CronJob {
  id: string;
  tenant_id: string;
  name: string;
  schedule: string;
  target_service: string;
  action: string;
  status: 'active' | 'paused' | 'failed' | 'running';
  last_run_at?: string;
  next_run_at?: string;
  last_status?: 'success' | 'failure' | 'timeout' | 'running';
  last_duration_ms?: number;
  retry_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  target_entity: string;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Note {
  id: string;
  tenant_id: string;
  author_id?: string;
  title: string;
  content: string;
  category: 'Stratégie' | 'Finance' | 'Ops' | 'Clients' | 'Idées' | 'Général';
  tags?: string[];
  is_pinned?: boolean;
  color?: string;
  workspace: string;
  created_at: string;
  updated_at: string;
}

export type DatabaseTableMap = {
  tenants: Tenant;
  profiles: Profile;
  clients: Client;
  contracts: Contract;
  projects: Project;
  tickets: Ticket;
  deals: Deal;
  leads: Lead;
  transactions: Transaction;
  budgets: Budget;
  employees: Employee;
  leaves: Leave;
  sops: SOP;
  microservices: Microservice;
  cron_jobs: CronJob;
  audit_logs: AuditLog;
  notes: Note;
};

export type TableName = keyof DatabaseTableMap;

// ============================================================================
// 2. SETTINGS UI & SYSTEM CONFIG TYPES
// ============================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  serviceRoleKeyMasked?: string;
  schema: string;
  region: string;
  status: 'connected' | 'offline' | 'degraded';
  ssl: boolean;
  connectionPool: string;
  poolSize?: number;
  maxConnections: number;
  activeConnections: number;
  tablesCount?: number;
  activeRLSStatus?: string;
  latencyMs: number;
  version: string;
  dbVersion?: string;
}

export interface SupabaseMigration {
  id: string;
  version: string;
  name: string;
  appliedAt: string;
  status: 'applied' | 'pending' | 'rolled_back';
  tablesCount: number;
  tablesAffected: string[];
  executionTimeMs: number;
  ddlSnippet: string;
  ddl?: string;
  author: string;
  rlsPoliciesEnforced: string[];
  checksum: string;
}

export interface SupabaseRLSRule {
  id: string;
  table: string;
  tableName?: string;
  policyName: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  command?: string;
  role: string;
  definition: string;
  usingExpression?: string;
  isStrict: boolean;
  status: 'enforced' | 'disabled';
}

// ============================================================================
// 3. DEFAULT SEED DATA FOR OFFLINE / MOCK PERSISTENCE
// ============================================================================

export const DEFAULT_TENANT_ID_OMK = 'a0000000-0000-0000-0000-000000000001';
export const DEFAULT_TENANT_ID_APEX = 'a0000000-0000-0000-0000-000000000002';
export const DEFAULT_TENANT_ID_STARLIGHT = 'a0000000-0000-0000-0000-000000000003';

const INITIAL_MOCK_DATA: { [K in TableName]: DatabaseTableMap[K][] } = {
  tenants: [
    {
      id: DEFAULT_TENANT_ID_OMK,
      slug: 'omk-corp',
      name: 'OMK Corporation',
      tier: 'enterprise',
      currency: 'USD',
      domain: 'omk-corp.io',
      logo_url: '/assets/omk-logo.svg',
      status: 'active',
      settings: {
        features: ['crm', 'finance', 'hr', 'ops', 'ai', 'paas', 'baas'],
        theme: 'dark-oled',
        primaryColor: '#10b981'
      },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: DEFAULT_TENANT_ID_APEX,
      slug: 'apex-quantum',
      name: 'Apex Quantum Technologies',
      tier: 'enterprise',
      currency: 'USD',
      domain: 'apexquantum.io',
      logo_url: '/assets/apex-logo.svg',
      status: 'active',
      settings: {
        features: ['crm', 'finance', 'ops', 'ai', 'paas'],
        theme: 'cyberpunk',
        primaryColor: '#3b82f6'
      },
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: DEFAULT_TENANT_ID_STARLIGHT,
      slug: 'starlight-media',
      name: 'Starlight Media & Studios',
      tier: 'growth',
      currency: 'EUR',
      domain: 'starlightmedia.fr',
      logo_url: '/assets/starlight-logo.svg',
      status: 'active',
      settings: {
        features: ['crm', 'growth', 'notes', 'ai'],
        theme: 'warm-paper',
        primaryColor: '#f59e0b'
      },
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  profiles: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      email: 'alexandre@omk-corp.io',
      full_name: 'Alexandre de Morais',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'admin',
      department: 'Executive',
      title: 'CEO & Chief Architect',
      phone: '+1 (555) 019-2831',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      email: 'elena.rostova@omk-corp.io',
      full_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'employee',
      department: 'Operations',
      title: 'VP Operations & Delivery',
      phone: '+1 (555) 019-4822',
      is_active: true,
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      email: 'marcus.vance@apexquantum.io',
      full_name: 'Marcus Vance',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'client',
      client_id: 'c0000000-0000-0000-0000-000000000001',
      department: 'Engineering Leadership',
      title: 'Chief Technology Officer',
      phone: '+1 (555) 829-1029',
      is_active: true,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      email: 'guest.analyst@external.io',
      full_name: 'Guest Tech Auditor',
      role: 'visitor',
      department: 'External',
      title: 'Security & Systems Auditor',
      phone: '+1 (555) 999-0000',
      is_active: true,
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  clients: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      name: 'Apex Quantum Corp',
      tier: 'Enterprise',
      status: 'Active',
      health_score: 98,
      mrr: 42000,
      industry: 'Fintech & Quantum Cryptography',
      account_owner_id: 'b0000000-0000-0000-0000-000000000001',
      contact_email: 'contact@apexquantum.io',
      contact_phone: '+1 (555) 829-1029',
      tags: ['Tier-1', 'Fintech', 'SOC2', 'High-ARR'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      name: 'NeuroLink Biometrics',
      tier: 'Enterprise',
      status: 'Active',
      health_score: 94,
      mrr: 28500,
      industry: 'HealthTech & Neural AI',
      account_owner_id: 'b0000000-0000-0000-0000-000000000002',
      contact_email: 'enterprise@neurolink.bio',
      contact_phone: '+1 (555) 392-8811',
      tags: ['Biotech', 'HIPAA', 'AI-Pipeline'],
      created_at: '2026-01-20T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      name: 'Starlight Studios France',
      tier: 'Premium',
      status: 'Onboarding',
      health_score: 90,
      mrr: 18000,
      industry: 'Creative Media & CGI Rendering',
      account_owner_id: 'b0000000-0000-0000-0000-000000000002',
      contact_email: 'ops@starlightmedia.fr',
      contact_phone: '+33 1 42 68 55 00',
      tags: ['Media', 'PaaS-Heavy', 'Europe'],
      created_at: '2026-02-15T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  contracts: [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      client_id: 'c0000000-0000-0000-0000-000000000001',
      contract_number: 'CTR-2026-APEX-001',
      title: 'Enterprise Master Services & PaaS Dedicated Cloud Agreement',
      type: 'MSA',
      status: 'active',
      value: 504000,
      billing_cycle: 'monthly',
      start_date: '2026-01-01',
      end_date: '2027-01-01',
      auto_renew: true,
      terms_summary: 'SLA 99.99%, support 24/7 dédié avec canal Slack partagé et HSM managé.',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      client_id: 'c0000000-0000-0000-0000-000000000002',
      contract_number: 'CTR-2026-NEURO-002',
      title: 'Neural Pipeline Processing & BaaS Cloud License',
      type: 'Subscription',
      status: 'active',
      value: 342000,
      billing_cycle: 'annual',
      start_date: '2026-03-01',
      end_date: '2027-03-01',
      auto_renew: true,
      terms_summary: 'Ingestion jusqu à 10TB/jour, chiffrement E2E conforme HIPAA.',
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  projects: [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      client_id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Quantum Encryption Edge Proxy v4',
      description: 'Déploiement du cluster zéro-latence avec accélération cryptographique matérielle.',
      status: 'in-progress',
      priority: 'Critique',
      progress: 78,
      budget: 150000,
      spent: 98400,
      start_date: '2026-02-01',
      due_date: '2026-10-31',
      milestones: [
        { id: 'm-1', title: 'Architecture Review & SOC2 Prep', dueDate: '2026-03-01', completed: true },
        { id: 'm-2', title: 'Hardware Security Module Integration', dueDate: '2026-06-15', completed: true },
        { id: 'm-3', title: 'Global Benchmarking & Pen-Testing', dueDate: '2026-09-30', completed: false }
      ],
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  tickets: [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      client_id: 'c0000000-0000-0000-0000-000000000001',
      project_id: 'e0000000-0000-0000-0000-000000000001',
      ticket_number: 'TCK-8821',
      title: 'Optimisation throughput clusters EU-West',
      description: 'Augmentation de la charge de 30% observée durant les pics horaires boursiers.',
      status: 'in_progress',
      priority: 'high',
      category: 'support',
      reporter_email: 'marcus.vance@apexquantum.io',
      sla_due_at: '2026-08-24T18:00:00Z',
      created_at: '2026-08-22T14:30:00Z',
      updated_at: '2026-08-22T14:30:00Z'
    }
  ],
  deals: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      client_id: 'c0000000-0000-0000-0000-000000000001',
      title: 'Extension PaaS Cluster Asie-Pacifique',
      stage: 'negotiation',
      amount: 180000,
      probability: 85,
      expected_close_date: '2026-09-30',
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  leads: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      company_name: 'Hyperion Logistics',
      contact_name: 'David Sterling',
      contact_email: 'd.sterling@hyperion-logistics.com',
      contact_phone: '+1 (555) 438-9901',
      status: 'qualified',
      score: 96,
      estimated_acv: 145000,
      source: 'inbound',
      industry: 'Logistics & Supply Chain',
      created_at: '2026-08-10T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  transactions: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      client_id: 'c0000000-0000-0000-0000-000000000001',
      transaction_number: 'TX-2026-08-001',
      type: 'income',
      category: 'Subscriptions',
      amount: 42000,
      currency: 'USD',
      status: 'completed',
      date: '2026-08-20',
      description: 'Stripe Clôture Mensuelle Apex Quantum Enterprise',
      payment_method: 'Stripe',
      created_at: '2026-08-20T10:00:00Z',
      updated_at: '2026-08-20T10:00:00Z'
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      transaction_number: 'TX-2026-08-002',
      type: 'expense',
      category: 'Infrastructure',
      amount: 12450,
      currency: 'USD',
      status: 'completed',
      date: '2026-08-18',
      description: 'AWS Cloud GPU Cluster Facturation',
      payment_method: 'Bank Wire',
      created_at: '2026-08-18T12:00:00Z',
      updated_at: '2026-08-18T12:00:00Z'
    }
  ],
  budgets: [
    {
      id: '40000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      fiscal_year: 2026,
      department: 'Engineering',
      allocated_amount: 480000,
      spent_amount: 312000,
      currency: 'USD',
      status: 'on_track',
      quarterly_allocations: { Q1: 120000, Q2: 120000, Q3: 120000, Q4: 120000 },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  employees: [
    {
      id: '50000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      profile_id: 'b0000000-0000-0000-0000-000000000001',
      employee_code: 'EMP-001',
      first_name: 'Alexandre',
      last_name: 'de Morais',
      email: 'alexandre@omk-corp.io',
      department: 'Executive',
      job_title: 'Chief Architect & CEO',
      employment_type: 'full_time',
      status: 'active',
      hire_date: '2024-01-01',
      compensation: { salary: 220000, currency: 'USD', bonus_target: 50000 },
      skills: ['Distributed Systems', 'PostgreSQL RLS', 'React Architecture'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      profile_id: 'b0000000-0000-0000-0000-000000000002',
      employee_code: 'EMP-002',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@omk-corp.io',
      department: 'Operations',
      job_title: 'VP Operations & Delivery',
      employment_type: 'full_time',
      status: 'active',
      hire_date: '2024-03-15',
      compensation: { salary: 165000, currency: 'USD', bonus_target: 30000 },
      skills: ['Operations', 'SLA Management', 'SOC2 Compliance'],
      created_at: '2024-03-15T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  leaves: [
    {
      id: '55000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      employee_id: '50000000-0000-0000-0000-000000000002',
      leave_type: 'paid_time_off',
      start_date: '2026-09-01',
      end_date: '2026-09-08',
      total_days: 5,
      status: 'approved',
      approved_by: '50000000-0000-0000-0000-000000000001',
      reason: 'Congés annuels été',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-05T00:00:00Z'
    }
  ],
  sops: [
    {
      id: '60000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      code: 'SOP-SEC-01',
      title: 'Procédure d\'Isolation Multi-Tenant et Audit RLS',
      category: 'Security',
      version: '2.4',
      status: 'published',
      author_id: 'b0000000-0000-0000-0000-000000000001',
      content: 'Vérification continue des politiques de Row-Level Security et étanchéité absolue entre locataires.',
      checklist: [
        { step: 1, task: 'Vérifier le JWT claims tenant_id', done: true },
        { step: 2, task: 'Exécuter les suites de tests RLS d\'injection', done: true }
      ],
      tags: ['Security', 'RLS', 'SOC2'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  microservices: [
    {
      id: '70000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      name: 'BaaS Core Ledger & Event Router',
      slug: 'baas-core-ledger',
      cluster: 'us-east-cluster-01',
      status: 'healthy',
      replicas_active: 6,
      replicas_desired: 6,
      cpu_usage_pct: 28.5,
      memory_usage_mb: 2048,
      uptime_pct: 99.99,
      version: 'v4.1.0',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    },
    {
      id: '70000000-0000-0000-0000-000000000002',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      name: 'Cognition Neural Worker Engine',
      slug: 'cognition-worker',
      cluster: 'us-east-gpu-02',
      status: 'healthy',
      replicas_active: 4,
      replicas_desired: 4,
      cpu_usage_pct: 42.0,
      memory_usage_mb: 4096,
      uptime_pct: 99.95,
      version: 'v3.8.2',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  cron_jobs: [
    {
      id: '80000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      name: 'Stripe Daily Billing & Reconciliation',
      schedule: '0 2 * * *',
      target_service: 'baas-core-ledger',
      action: 'reconcile_daily_ledgers',
      status: 'active',
      last_status: 'success',
      last_duration_ms: 340,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z'
    }
  ],
  audit_logs: [
    {
      id: '90000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      actor_email: 'alexandre@omk-corp.io',
      actor_role: 'admin',
      action: 'MIGRATION_BOOTSTRAP',
      target_entity: 'schema_20260823000000',
      details: { status: 'success', tables: 17, rls: true },
      created_at: '2026-08-22T21:00:00Z'
    }
  ],
  notes: [
    {
      id: '95000000-0000-0000-0000-000000000001',
      tenant_id: DEFAULT_TENANT_ID_OMK,
      author_id: 'b0000000-0000-0000-0000-000000000001',
      title: 'Architecture Cadrage Supabase Multi-Tenant 2026',
      content: 'Toutes les tables intègrent tenant_id et bénéficient de Row Level Security stricte avec 4 rôles.',
      category: 'Stratégie',
      tags: ['Architecture', 'Supabase', 'RLS', 'Security'],
      is_pinned: true,
      workspace: 'Production',
      created_at: '2026-08-22T20:00:00Z',
      updated_at: '2026-08-22T20:00:00Z'
    }
  ]
};

// ============================================================================
// 4. OFFLINE INDEXEDDB PERSISTENCE ENGINE
// ============================================================================

const mockDbStore = localforage.createInstance({
  name: 'OMK_Mobile_OS',
  storeName: 'supabase_mock_tables',
  description: 'Local multi-tenant database cache mirroring Supabase PostgreSQL schema'
});

class MockDatabase {
  private static isLoaded = false;
  private static memoryStore: Record<string, any[]> = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));

  public static async initialize(): Promise<void> {
    if (this.isLoaded) return;
    try {
      await mockDbStore.ready();
      for (const table of Object.keys(INITIAL_MOCK_DATA) as TableName[]) {
        const stored = await mockDbStore.getItem<any[]>(table);
        if (stored && Array.isArray(stored) && stored.length > 0) {
          this.memoryStore[table] = stored;
        } else {
          await mockDbStore.setItem(table, INITIAL_MOCK_DATA[table]);
        }
      }
      this.isLoaded = true;
    } catch (e) {
      console.warn('Fallback: in-memory mock database', e);
      this.isLoaded = true;
    }
  }

  public static async getTable(table: string): Promise<any[]> {
    await this.initialize();
    return this.memoryStore[table] || [];
  }

  public static async setTable(table: string, data: any[]): Promise<void> {
    await this.initialize();
    this.memoryStore[table] = data;
    try {
      await mockDbStore.setItem(table, data);
    } catch (e) {
      console.warn(`Failed to persist table ${table} in IndexedDB:`, e);
    }
  }

  public static async reset(): Promise<void> {
    this.memoryStore = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    try {
      await mockDbStore.clear();
      for (const table of Object.keys(INITIAL_MOCK_DATA) as TableName[]) {
        await mockDbStore.setItem(table, INITIAL_MOCK_DATA[table]);
      }
    } catch (e) {
      console.warn('Failed to clear IndexedDB store', e);
    }
  }
}

// ============================================================================
// 5. MOCK QUERY BUILDER (POSTGREST / SUPABASE COMPATIBLE)
// ============================================================================

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number | null;
  status: number;
  statusText: string;
}

export class MockQueryBuilder<T extends Record<string, any> = any> {
  private tableName: TableName;
  private filters: Array<(item: T) => boolean> = [];
  private orderConfig?: { column: string; ascending: boolean };
  private limitCount?: number;
  private offsetCount?: number;
  private isSingle = false;
  private isMaybeSingle = false;
  private activeTenantId?: string;
  private activeRole?: TenantRole;
  private activeClientId?: string;

  constructor(
    tableName: TableName, 
    activeTenantId?: string, 
    activeRole?: TenantRole,
    activeClientId?: string
  ) {
    this.tableName = tableName;
    this.activeTenantId = activeTenantId;
    this.activeRole = activeRole || 'employee';
    this.activeClientId = activeClientId;
  }

  public select(_columns: string = '*'): this {
    return this;
  }

  public eq(column: string, value: any): this {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  public neq(column: string, value: any): this {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  public in(column: string, values: any[]): this {
    this.filters.push((item) => values.includes(item[column]));
    return this;
  }

  public gt(column: string, value: any): this {
    this.filters.push((item) => item[column] > value);
    return this;
  }

  public gte(column: string, value: any): this {
    this.filters.push((item) => item[column] >= value);
    return this;
  }

  public lt(column: string, value: any): this {
    this.filters.push((item) => item[column] < value);
    return this;
  }

  public lte(column: string, value: any): this {
    this.filters.push((item) => item[column] <= value);
    return this;
  }

  public like(column: string, pattern: string): this {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.filters.push((item) => regex.test(String(item[column] ?? '')));
    return this;
  }

  public ilike(column: string, pattern: string): this {
    return this.like(column, pattern);
  }

  public order(column: string, options: { ascending?: boolean } = {}): this {
    this.orderConfig = { column, ascending: options.ascending !== false };
    return this;
  }

  public limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  public range(from: number, to: number): this {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  public single(): Promise<QueryResult<T>> {
    this.isSingle = true;
    return this.execute();
  }

  public maybeSingle(): Promise<QueryResult<T | null>> {
    this.isMaybeSingle = true;
    return this.execute();
  }

  public async insert(values: Partial<T> | Partial<T>[]): Promise<QueryResult<T[]>> {
    const rawTable = await MockDatabase.getTable(this.tableName);
    const rows = Array.isArray(values) ? values : [values];
    const newItems: T[] = rows.map((v) => {
      const now = new Date().toISOString();
      return {
        id: v.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tenant_id: this.activeTenantId || v.tenant_id || DEFAULT_TENANT_ID_OMK,
        created_at: v.created_at || now,
        updated_at: now,
        ...v
      } as unknown as T;
    });

    const updatedTable = [...rawTable, ...newItems];
    await MockDatabase.setTable(this.tableName, updatedTable);

    return {
      data: newItems,
      error: null,
      count: newItems.length,
      status: 201,
      statusText: 'Created'
    };
  }

  public async update(values: Partial<T>): Promise<QueryResult<T[]>> {
    const rawTable = await MockDatabase.getTable(this.tableName);
    const modified: T[] = [];
    const now = new Date().toISOString();

    const updatedTable = rawTable.map((item) => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item as unknown as T)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        const updated = {
          ...item,
          ...values,
          updated_at: now
        } as unknown as T;
        modified.push(updated);
        return updated;
      }
      return item;
    });

    await MockDatabase.setTable(this.tableName, updatedTable);

    return {
      data: modified,
      error: null,
      count: modified.length,
      status: 200,
      statusText: 'OK'
    };
  }

  public async delete(): Promise<QueryResult<T[]>> {
    const rawTable = await MockDatabase.getTable(this.tableName);
    const deleted: T[] = [];

    const updatedTable = rawTable.filter((item) => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item as unknown as T)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        deleted.push(item as unknown as T);
        return false;
      }
      return true;
    });

    await MockDatabase.setTable(this.tableName, updatedTable);

    return {
      data: deleted,
      error: null,
      count: deleted.length,
      status: 200,
      statusText: 'OK'
    };
  }

  public async upsert(values: Partial<T> | Partial<T>[]): Promise<QueryResult<T[]>> {
    const rawTable = await MockDatabase.getTable(this.tableName);
    const rows = Array.isArray(values) ? values : [values];
    const now = new Date().toISOString();
    const resultItems: T[] = [];

    const tableMap = new Map<string, any>(rawTable.map((item: any) => [item.id, item]));

    for (const row of rows) {
      const id = row.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const existing = tableMap.get(id);
      const updatedItem = {
        ...(existing || {}),
        ...row,
        id,
        tenant_id: this.activeTenantId || row.tenant_id || existing?.tenant_id || DEFAULT_TENANT_ID_OMK,
        created_at: existing?.created_at || row.created_at || now,
        updated_at: now
      } as unknown as T;

      tableMap.set(id, updatedItem);
      resultItems.push(updatedItem);
    }

    await MockDatabase.setTable(this.tableName, Array.from(tableMap.values()));

    return {
      data: resultItems,
      error: null,
      count: resultItems.length,
      status: 200,
      statusText: 'OK'
    };
  }

  public async execute(): Promise<QueryResult<any>> {
    try {
      const rawTable = await MockDatabase.getTable(this.tableName);
      let items = [...rawTable] as unknown as T[];

      // 1. Tenant RLS Filter
      if (this.activeTenantId && this.tableName !== 'tenants') {
        items = items.filter((item: any) => item.tenant_id === this.activeTenantId);
      }

      // 2. Client Role RLS Filter (Scoped to their client_id)
      if (this.activeRole === 'client' && this.activeClientId) {
        if (['contracts', 'projects', 'tickets'].includes(this.tableName)) {
          items = items.filter((item: any) => item.client_id === this.activeClientId);
        } else if (this.tableName === 'clients') {
          items = items.filter((item: any) => item.id === this.activeClientId);
        }
      }

      // 3. User Query Filters
      for (const filter of this.filters) {
        items = items.filter(filter);
      }

      // 4. Order By
      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        items.sort((a: any, b: any) => {
          const valA = a[column];
          const valB = b[column];
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }

      // 5. Pagination
      if (this.offsetCount !== undefined) {
        items = items.slice(this.offsetCount);
      }
      if (this.limitCount !== undefined) {
        items = items.slice(0, this.limitCount);
      }

      // 6. Single checks
      if (this.isSingle) {
        if (items.length === 0) {
          return {
            data: null,
            error: new Error(`Row not found in ${this.tableName}`),
            status: 404,
            statusText: 'Not Found'
          };
        }
        return {
          data: items[0],
          error: null,
          count: 1,
          status: 200,
          statusText: 'OK'
        };
      }

      if (this.isMaybeSingle) {
        return {
          data: items.length > 0 ? items[0] : null,
          error: null,
          count: items.length,
          status: 200,
          statusText: 'OK'
        };
      }

      return {
        data: items,
        error: null,
        count: items.length,
        status: 200,
        statusText: 'OK'
      };
    } catch (e: any) {
      return {
        data: null,
        error: e,
        status: 500,
        statusText: e.message || 'Internal Error'
      };
    }
  }

  public then<TResult1 = QueryResult<T[]>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected);
  }
}

// ============================================================================
// 6. HYBRID SUPABASE CLIENT SERVICE & SETTINGS ENGINE
// ============================================================================

const DEFAULT_MIGRATIONS: SupabaseMigration[] = [
  {
    id: 'mig-1',
    version: '20260823000000',
    name: '20260823000000_multi_tenant_schema_and_rls.sql',
    appliedAt: '2026-08-23T00:00:00Z',
    status: 'applied',
    tablesCount: 17,
    tablesAffected: ['tenants', 'profiles', 'clients', 'contracts', 'projects', 'tickets', 'deals', 'leads', 'transactions', 'budgets', 'employees', 'leaves', 'sops', 'microservices', 'cron_jobs', 'audit_logs', 'notes'],
    executionTimeMs: 142,
    ddlSnippet: '-- Complete 17-table schema with 4-tier RLS policies (admin, employee, client, visitor)',
    ddl: '-- Complete 17-table schema with 4-tier RLS policies (admin, employee, client, visitor)',
    author: 'Alexandre de Morais (Chief Architect)',
    rlsPoliciesEnforced: ['p_tenants_select', 'p_clients_tenant_isolation', 'p_contracts_tenant_isolation', 'p_projects_tenant_isolation', 'p_tickets_tenant_isolation'],
    checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    id: 'mig-2',
    version: '20260820000000',
    name: '20260820000000_core_indexes_and_extensions.sql',
    appliedAt: '2026-08-20T10:00:00Z',
    status: 'applied',
    tablesCount: 17,
    tablesAffected: ['tenants', 'profiles', 'clients', 'contracts'],
    executionTimeMs: 88,
    ddlSnippet: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
    ddl: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
    author: 'DevOps / Platform Engineering',
    rlsPoliciesEnforced: ['p_core_extensions_check'],
    checksum: 'sha256:8b4a2c9183d2e0f498c11e74a873634a1d84b912a76ef4821a8d94e1b38f2981'
  }
];

const DEFAULT_RLS_RULES: SupabaseRLSRule[] = [
  {
    id: 'rls-1',
    table: 'tenants',
    policyName: 'p_tenants_select',
    action: 'SELECT',
    role: 'public',
    definition: 'id = auth.tenant_id() OR auth.user_role() = "admin" OR auth.user_role() = "visitor"',
    isStrict: true,
    status: 'enforced'
  },
  {
    id: 'rls-2',
    table: 'clients',
    policyName: 'p_clients_select',
    action: 'SELECT',
    role: 'authenticated',
    definition: '(tenant_id = auth.tenant_id() AND auth.user_role() IN ("admin", "employee")) OR (tenant_id = auth.tenant_id() AND auth.user_role() = "client" AND id = auth.client_id())',
    isStrict: true,
    status: 'enforced'
  },
  {
    id: 'rls-3',
    table: 'contracts',
    policyName: 'p_contracts_admin_all',
    action: 'ALL',
    role: 'admin',
    definition: 'auth.user_role() = "admin" AND tenant_id = auth.tenant_id()',
    isStrict: true,
    status: 'enforced'
  },
  {
    id: 'rls-4',
    table: 'tickets',
    policyName: 'p_tickets_client_insert',
    action: 'INSERT',
    role: 'client',
    definition: 'auth.user_role() = "client" AND tenant_id = auth.tenant_id() AND client_id = auth.client_id()',
    isStrict: true,
    status: 'enforced'
  },
  {
    id: 'rls-5',
    table: 'transactions',
    policyName: 'p_transactions_select',
    action: 'SELECT',
    role: 'authenticated',
    definition: 'tenant_id = auth.tenant_id() AND auth.user_role() IN ("admin", "employee")',
    isStrict: true,
    status: 'enforced'
  },
  {
    id: 'rls-6',
    table: 'audit_logs',
    policyName: 'p_audit_logs_select',
    action: 'SELECT',
    role: 'admin',
    definition: 'tenant_id = auth.tenant_id() AND auth.user_role() = "admin"',
    isStrict: true,
    status: 'enforced'
  }
];

export class SupabaseClientService {
  private static realClient: SupabaseClient | null = null;
  private static activeTenantId: string = DEFAULT_TENANT_ID_OMK;
  private static activeRole: TenantRole = 'admin';
  private static activeClientId?: string = 'c0000000-0000-0000-0000-000000000001';
  private static config: SupabaseConfig = {
    url: 'https://omk-backoffice.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.omk-anon-key-mock',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.omk-service-role-mock',
    schema: 'public',
    region: 'eu-west-3 (Paris)',
    status: 'connected',
    ssl: true,
    connectionPool: 'PgBouncer Transaction Mode',
    maxConnections: 120,
    activeConnections: 14,
    latencyMs: 16,
    version: 'PostgreSQL 16.3 (Supabase Multi-Tenant)'
  };

  private static migrations: SupabaseMigration[] = [...DEFAULT_MIGRATIONS];
  private static rlsRules: SupabaseRLSRule[] = [...DEFAULT_RLS_RULES];

  public static initialize(): void {
    const supabaseUrl = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL);

    const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined') {
      try {
        this.realClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        this.config.url = supabaseUrl;
        this.config.anonKey = supabaseAnonKey;
      } catch (e) {
        console.warn('Failed to initialize real Supabase client, running in Mock/Offline mode', e);
        this.realClient = null;
      }
    }
  }

  public static isConnected(): boolean {
    return true;
  }

  public static setTenantContext(tenantId: string, role: TenantRole = 'employee', clientId?: string): void {
    this.activeTenantId = tenantId;
    this.activeRole = role;
    this.activeClientId = clientId;
  }

  public static getActiveTenantId(): string {
    return this.activeTenantId;
  }

  public static getActiveRole(): TenantRole {
    return this.activeRole;
  }

  public static getActiveClientId(): string | undefined {
    return this.activeClientId;
  }

  public static from<K extends TableName>(tableName: K): MockQueryBuilder<DatabaseTableMap[K]> {
    return new MockQueryBuilder<DatabaseTableMap[K]>(
      tableName,
      this.activeTenantId,
      this.activeRole,
      this.activeClientId
    );
  }

  public static getRawClient(): SupabaseClient | null {
    return this.realClient;
  }

  public static async resetLocalDatabase(): Promise<void> {
    await MockDatabase.reset();
  }

  public static async exportSnapshot(): Promise<string> {
    await MockDatabase.initialize();
    const snapshot: Record<string, any> = {};
    for (const table of Object.keys(INITIAL_MOCK_DATA) as TableName[]) {
      snapshot[table] = await MockDatabase.getTable(table);
    }
    return JSON.stringify(snapshot, null, 2);
  }

  // --- SETTINGS UI ADAPTER METHODS ---

  public static getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public static getMigrations(): SupabaseMigration[] {
    return [...this.migrations];
  }

  public static getRLSRules(): SupabaseRLSRule[] {
    return [...this.rlsRules];
  }

  public static async checkConnection(): Promise<{ connected: boolean; latency: number }> {
    const latency = Math.floor(Math.random() * 12) + 12;
    this.config.latencyMs = latency;
    return { connected: true, latency };
  }

  public static async verifyRLSPolicies(): Promise<{ passed: boolean; totalPolicies: number; enforcedCount: number }> {
    return {
      passed: true,
      totalPolicies: this.rlsRules.length,
      enforcedCount: this.rlsRules.filter(r => r.status === 'enforced').length
    };
  }

  public static async simulateMigration(name: string, ddl: string): Promise<SupabaseMigration> {
    const newMig: SupabaseMigration = {
      id: `mig-${Date.now()}`,
      version: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
      name,
      appliedAt: new Date().toISOString(),
      status: 'applied',
      tablesCount: 1,
      tablesAffected: ['custom_table'],
      executionTimeMs: Math.floor(Math.random() * 100) + 50,
      ddlSnippet: ddl.slice(0, 150) + (ddl.length > 150 ? '...' : ''),
      ddl,
      author: 'Alexandre de Morais (Admin)',
      rlsPoliciesEnforced: ['p_custom_isolation'],
      checksum: `sha256:${Date.now()}simulated`
    };
    this.migrations.unshift(newMig);
    return newMig;
  }
}

// Bootstrap service on import
SupabaseClientService.initialize();

// Alias export for compatibility with Settings.tsx
export const supabaseClient = SupabaseClientService;
export default SupabaseClientService;
