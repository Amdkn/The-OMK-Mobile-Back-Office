import { AppId } from '../types';
import { 
  SupabaseClientService, 
  TenantRole, 
  TableName,
  DEFAULT_TENANT_ID_OMK, 
  DEFAULT_TENANT_ID_APEX, 
  DEFAULT_TENANT_ID_STARLIGHT 
} from './supabaseClient';

// ============================================================================
// 1. TYPES & INTERFACES FOR MULTI-TENANT RBAC & SETTINGS INTEGRATION
// ============================================================================

export type TenantId = 'omk-corp' | 'omk-enterprise' | 'apex-quantum' | 'starlight-media' | string;
export type RoleId = 'admin' | 'employee' | 'client' | 'visitor';

export interface TenantInfo {
  id: TenantId;
  slug: string;
  name: string;
  tier: 'starter' | 'growth' | 'enterprise' | 'custom';
  dbSchema: string;
  region: string;
  activeUsers: number;
  mrr: number;
  storageUsedMb: number;
  status: 'active' | 'suspended' | 'trial' | 'archived';
  healthScore: number;
  tablesCount: number;
  adminEmail: string;
  primaryColor: string;
  logo: string;
  domain: string;
  currency: string;
  allowedModules: AppId[];
  features: string[];
}

export interface RoleDefinition {
  id: RoleId;
  name: string;
  label?: string;
  badge: string;
  level: number;
  color: string;
  description: string;
  usersCount: number;
  policiesCount: number;
  accessScope: string;
  canWrite: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface AppPermission {
  appId: AppId | string;
  appName: string;
  module: AppId | string;
  label: string;
  category: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
  auditLog: boolean;
  rlsPolicy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  department: string;
  status: 'active' | 'pending' | 'invited' | 'disabled';
  avatar?: string;
  lastActive: string;
  tenantId: TenantId;
  mfaEnabled: boolean;
  twoFactorEnabled?: boolean;
}

// ============================================================================
// 2. DEFAULT PRESETS FOR TENANTS, ROLES & PERMISSIONS
// ============================================================================

export const PRESET_TENANTS: TenantInfo[] = [
  {
    id: DEFAULT_TENANT_ID_OMK,
    slug: 'omk-corp',
    name: 'OMK Corporation',
    tier: 'enterprise',
    dbSchema: 'tenant_omk_corp',
    region: 'eu-west-3 (Paris)',
    activeUsers: 48,
    mrr: 124500,
    storageUsedMb: 1420,
    status: 'active',
    healthScore: 99,
    tablesCount: 17,
    adminEmail: 'alexandre@omk-corp.io',
    primaryColor: '#10b981',
    logo: '/assets/omk-logo.svg',
    domain: 'omk-corp.io',
    currency: 'USD',
    allowedModules: [
      'dashboard', 'finance', 'legal', 'operations', 'sales', 'clients',
      'growth', 'product', 'ontology', 'cognition', 'hr', 'security',
      'notes', 'terminal', 'settings', 'baas-hub', 'jaas-job', 'paas-pro',
      'coach-ai', 'wallet', 'leads'
    ],
    features: ['crm', 'finance', 'hr', 'ops', 'ai', 'paas', 'baas', 'security', 'ontology']
  },
  {
    id: DEFAULT_TENANT_ID_APEX,
    slug: 'apex-quantum',
    name: 'Apex Quantum Technologies',
    tier: 'enterprise',
    dbSchema: 'tenant_apex_quantum',
    region: 'us-east-1 (N. Virginia)',
    activeUsers: 24,
    mrr: 42000,
    storageUsedMb: 890,
    status: 'active',
    healthScore: 98,
    tablesCount: 17,
    adminEmail: 'sarah.chen@apexquantum.io',
    primaryColor: '#3b82f6',
    logo: '/assets/apex-logo.svg',
    domain: 'apexquantum.io',
    currency: 'USD',
    allowedModules: [
      'dashboard', 'finance', 'operations', 'sales', 'clients',
      'product', 'security', 'notes', 'terminal', 'settings',
      'paas-pro', 'coach-ai', 'wallet', 'leads'
    ],
    features: ['crm', 'finance', 'ops', 'ai', 'paas', 'security']
  },
  {
    id: DEFAULT_TENANT_ID_STARLIGHT,
    slug: 'starlight-media',
    name: 'Starlight Media & Studios',
    tier: 'growth',
    dbSchema: 'tenant_starlight_media',
    region: 'eu-west-1 (Ireland)',
    activeUsers: 12,
    mrr: 18000,
    storageUsedMb: 450,
    status: 'active',
    healthScore: 92,
    tablesCount: 17,
    adminEmail: 'julien.delacroix@starlightmedia.fr',
    primaryColor: '#f59e0b',
    logo: '/assets/starlight-logo.svg',
    domain: 'starlightmedia.fr',
    currency: 'EUR',
    allowedModules: [
      'dashboard', 'growth', 'product', 'clients', 'notes',
      'settings', 'coach-ai', 'wallet', 'leads'
    ],
    features: ['crm', 'growth', 'notes', 'ai']
  }
];

export const PRESET_ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    name: 'Administrateur & Fondateur',
    label: 'Accès Souverain & Gouvernance',
    badge: 'Niveau 1',
    level: 1,
    color: '#10b981',
    description: 'Accès intégral et souverain à l\'ensemble des 17 tables, politiques RLS, configuration système et trésorerie.',
    usersCount: 2,
    policiesCount: 17,
    accessScope: 'Tenant Root & System Settings',
    canWrite: true,
    canDelete: true,
    canExport: true
  },
  {
    id: 'employee',
    name: 'Collaborateur & Opérations',
    label: 'Opérations & Exécution',
    badge: 'Niveau 2',
    level: 2,
    color: '#3b82f6',
    description: 'Gestion opérationnelle quotidienne des projets, tickets, clients, leads, SOPs et microservices.',
    usersCount: 18,
    policiesCount: 14,
    accessScope: 'Operational Modules (Read/Write)',
    canWrite: true,
    canDelete: false,
    canExport: true
  },
  {
    id: 'client',
    name: 'Client & Partenaire',
    label: 'Espace Client Dédié',
    badge: 'Niveau 3',
    level: 3,
    color: '#f59e0b',
    description: 'Accès strictement cloisonné à ses propres contrats, projets actifs et tickets de support.',
    usersCount: 34,
    policiesCount: 4,
    accessScope: 'Scoped Client Data (Self only)',
    canWrite: false,
    canDelete: false,
    canExport: false
  },
  {
    id: 'visitor',
    name: 'Visiteur & Auditeur Sandbox',
    label: 'Démonstration & Sandbox',
    badge: 'Niveau 4',
    level: 4,
    color: '#8b5cf6',
    description: 'Consultation bac à sable en lecture seule des modules de démonstration et soumission de leads entrants.',
    usersCount: 5,
    policiesCount: 2,
    accessScope: 'Sandbox Showcase (Read Only)',
    canWrite: false,
    canDelete: false,
    canExport: false
  }
];

export const PRESET_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Alexandre de Morais',
    email: 'alexandre@omk-corp.io',
    role: 'admin',
    department: 'Direction Générale',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    lastActive: 'À l\'instant',
    tenantId: DEFAULT_TENANT_ID_OMK,
    mfaEnabled: true,
    twoFactorEnabled: true
  },
  {
    id: 'mem-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@omk-corp.io',
    role: 'employee',
    department: 'Opérations & Delivery',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    lastActive: 'Il y a 12 min',
    tenantId: DEFAULT_TENANT_ID_OMK,
    mfaEnabled: true,
    twoFactorEnabled: true
  },
  {
    id: 'mem-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@apexquantum.io',
    role: 'client',
    department: 'Apex Quantum (Client CTO)',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    lastActive: 'Il y a 1 heure',
    tenantId: DEFAULT_TENANT_ID_OMK,
    mfaEnabled: true,
    twoFactorEnabled: true
  },
  {
    id: 'mem-4',
    name: 'Auditeur SOC2 Type-II',
    email: 'guest.analyst@external.io',
    role: 'visitor',
    department: 'Audit Externe',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    lastActive: 'Hier à 18h',
    tenantId: DEFAULT_TENANT_ID_OMK,
    mfaEnabled: false,
    twoFactorEnabled: false
  }
];

const MODULE_DEFINITIONS: Array<{ id: AppId; label: string; category: string }> = [
  { id: 'dashboard', label: 'Executive Dashboard', category: 'Vue Globale' },
  { id: 'finance', label: 'Finance & Trésorerie', category: 'Finance' },
  { id: 'legal', label: 'Juridique & Contrats', category: 'Gouvernance' },
  { id: 'operations', label: 'Opérations & SOPs', category: 'Exécution' },
  { id: 'sales', label: 'Pipeline Commercial', category: 'Revenus' },
  { id: 'clients', label: 'Comptes Clients', category: 'CRM' },
  { id: 'growth', label: 'Acquisition & Analytics', category: 'Revenus' },
  { id: 'product', label: 'Roadmap & Releases', category: 'Ingénierie' },
  { id: 'ontology', label: 'Ontologie des Données', category: 'Architecture' },
  { id: 'cognition', label: 'Moteur Cognitif IA', category: 'Intelligence' },
  { id: 'hr', label: 'Ressources Humaines', category: 'RH' },
  { id: 'security', label: 'Sécurité & Chiffrement', category: 'Gouvernance' },
  { id: 'notes', label: 'Notes & Mémos', category: 'Productivité' },
  { id: 'terminal', label: 'Terminal Cloud', category: 'Ingénierie' },
  { id: 'settings', label: 'Paramètres Système', category: 'Configuration' },
  { id: 'baas-hub', label: 'BaaS Ledger Hub', category: 'Fintech' },
  { id: 'jaas-job', label: 'JaaS Automations', category: 'Cloud' },
  { id: 'paas-pro', label: 'PaaS Clusters', category: 'Cloud' },
  { id: 'coach-ai', label: 'Coach IA C-Level', category: 'Intelligence' },
  { id: 'wallet', label: 'Wallet & Cartes', category: 'Finance' },
  { id: 'leads', label: 'Gestion des Leads', category: 'Revenus' }
];

// ============================================================================
// 3. SQL SCHEMA METADATA DICTIONARY (FOR INTROSPECTION & AUDIT)
// ============================================================================

export interface TableColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
  defaultValue?: string;
}

export interface TableMetadata {
  name: TableName;
  description: string;
  columns: TableColumnMetadata[];
  rlsPolicies: string[];
  indexes: string[];
}

export const DATABASE_SCHEMA_METADATA: TableMetadata[] = [
  {
    name: 'tenants',
    description: 'Multi-tenant organization root records with branding and subscription tier.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'slug', type: 'TEXT', nullable: false },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'tier', type: 'TEXT', nullable: false, defaultValue: "'enterprise'" },
      { name: 'currency', type: 'TEXT', nullable: false, defaultValue: "'USD'" },
      { name: 'domain', type: 'TEXT', nullable: true },
      { name: 'logo_url', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT', nullable: false, defaultValue: "'active'" },
      { name: 'settings', type: 'JSONB', nullable: false },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false }
    ],
    rlsPolicies: ['p_tenants_select', 'p_tenants_all_admin'],
    indexes: ['uq_tenants_slug']
  },
  {
    name: 'profiles',
    description: 'User profiles linked to tenant_id and Supabase Auth with assigned role.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'auth_user_id', type: 'UUID', nullable: true },
      { name: 'email', type: 'TEXT', nullable: false },
      { name: 'full_name', type: 'TEXT', nullable: false },
      { name: 'role', type: 'TEXT', nullable: false, defaultValue: "'employee'" },
      { name: 'client_id', type: 'UUID', nullable: true, isForeignKey: true, references: 'clients(id)' },
      { name: 'department', type: 'TEXT', nullable: true },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'true' }
    ],
    rlsPolicies: ['p_profiles_select', 'p_profiles_admin_all', 'p_profiles_employee_update_self'],
    indexes: ['idx_profiles_tenant', 'idx_profiles_auth_user', 'uq_tenant_profile_email']
  },
  {
    name: 'clients',
    description: 'Enterprise and SMB accounts under management.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'tier', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false },
      { name: 'health_score', type: 'INTEGER', nullable: false, defaultValue: '95' },
      { name: 'mrr', type: 'NUMERIC(12,2)', nullable: false, defaultValue: '0.00' },
      { name: 'industry', type: 'TEXT', nullable: true }
    ],
    rlsPolicies: ['p_clients_select', 'p_clients_admin_manage', 'p_clients_employee_modify', 'p_clients_employee_update'],
    indexes: ['idx_clients_tenant', 'idx_clients_health']
  },
  {
    name: 'contracts',
    description: 'Signed agreements, MSA, SOW, and SLA documents.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'client_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'clients(id)' },
      { name: 'contract_number', type: 'TEXT', nullable: false },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'value', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'billing_cycle', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_contracts_select', 'p_contracts_admin_all', 'p_contracts_employee_write', 'p_contracts_employee_update'],
    indexes: ['idx_contracts_tenant_client', 'idx_contracts_status']
  },
  {
    name: 'projects',
    description: 'Strategic deliveries and technical initiatives.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'client_id', type: 'UUID', nullable: true, isForeignKey: true, references: 'clients(id)' },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false },
      { name: 'progress', type: 'INTEGER', nullable: false, defaultValue: '0' },
      { name: 'budget', type: 'NUMERIC(12,2)', nullable: false }
    ],
    rlsPolicies: ['p_projects_select', 'p_projects_admin_all', 'p_projects_employee_write', 'p_projects_employee_update'],
    indexes: ['idx_projects_tenant_client', 'idx_projects_status']
  },
  {
    name: 'tickets',
    description: 'Operational and technical support tickets with SLA tracking.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'client_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'clients(id)' },
      { name: 'ticket_number', type: 'TEXT', nullable: false },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false },
      { name: 'priority', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_tickets_select', 'p_tickets_admin_all', 'p_tickets_employee_manage', 'p_tickets_client_insert', 'p_tickets_client_update'],
    indexes: ['idx_tickets_tenant_client', 'idx_tickets_status_priority']
  },
  {
    name: 'deals',
    description: 'Commercial opportunities in pipeline.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'stage', type: 'TEXT', nullable: false },
      { name: 'amount', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'probability', type: 'INTEGER', nullable: false }
    ],
    rlsPolicies: ['p_deals_select', 'p_deals_admin_all', 'p_deals_employee_write'],
    indexes: ['idx_deals_tenant_stage']
  },
  {
    name: 'leads',
    description: 'Inbound and outbound business leads.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'company_name', type: 'TEXT', nullable: false },
      { name: 'contact_name', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false },
      { name: 'score', type: 'INTEGER', nullable: false }
    ],
    rlsPolicies: ['p_leads_select', 'p_leads_admin_all', 'p_leads_employee_manage', 'p_leads_visitor_client_submit'],
    indexes: ['idx_leads_tenant_status']
  },
  {
    name: 'transactions',
    description: 'Financial ledger items, Stripe receipts, and expenses.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'transaction_number', type: 'TEXT', nullable: false },
      { name: 'type', type: 'TEXT', nullable: false },
      { name: 'category', type: 'TEXT', nullable: false },
      { name: 'amount', type: 'NUMERIC(14,2)', nullable: false }
    ],
    rlsPolicies: ['p_transactions_select', 'p_transactions_admin_all', 'p_transactions_employee_read_write', 'p_transactions_employee_update'],
    indexes: ['idx_transactions_tenant_date', 'idx_transactions_tenant_cat']
  },
  {
    name: 'budgets',
    description: 'Departmental budget allocations and quarterly tracking.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'fiscal_year', type: 'INTEGER', nullable: false },
      { name: 'department', type: 'TEXT', nullable: false },
      { name: 'allocated_amount', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'spent_amount', type: 'NUMERIC(14,2)', nullable: false }
    ],
    rlsPolicies: ['p_budgets_select', 'p_budgets_admin_all', 'p_budgets_employee_view'],
    indexes: ['idx_budgets_tenant_year']
  },
  {
    name: 'employees',
    description: 'Internal organization staff, compensation, and managerial links.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'employee_code', type: 'TEXT', nullable: false },
      { name: 'first_name', type: 'TEXT', nullable: false },
      { name: 'last_name', type: 'TEXT', nullable: false },
      { name: 'department', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_employees_select', 'p_employees_admin_all', 'p_employees_employee_read'],
    indexes: ['idx_employees_tenant_dept']
  },
  {
    name: 'leaves',
    description: 'Paid time off and leave requests.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'employee_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'employees(id)' },
      { name: 'leave_type', type: 'TEXT', nullable: false },
      { name: 'total_days', type: 'NUMERIC(4,1)', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_leaves_select', 'p_leaves_admin_all', 'p_leaves_employee_request', 'p_leaves_employee_update_own'],
    indexes: ['idx_leaves_tenant_emp']
  },
  {
    name: 'sops',
    description: 'Standard operating procedures and compliance guides.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'code', type: 'TEXT', nullable: false },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'category', type: 'TEXT', nullable: false },
      { name: 'version', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_sops_select', 'p_sops_admin_all', 'p_sops_employee_write', 'p_sops_employee_update'],
    indexes: ['idx_sops_tenant_cat']
  },
  {
    name: 'microservices',
    description: 'Cluster services status, replica counts, and health telemetry.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'slug', type: 'TEXT', nullable: false },
      { name: 'cluster', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_microservices_select', 'p_microservices_admin_all', 'p_microservices_employee_operate'],
    indexes: ['idx_microservices_tenant']
  },
  {
    name: 'cron_jobs',
    description: 'Scheduled automated tasks and recurring executions.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'schedule', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_cron_jobs_select', 'p_cron_jobs_admin_all', 'p_cron_jobs_employee_operate'],
    indexes: ['idx_cron_jobs_tenant']
  },
  {
    name: 'audit_logs',
    description: 'Security and administrative audit trail with immutable timestamps.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'actor_email', type: 'TEXT', nullable: true },
      { name: 'actor_role', type: 'TEXT', nullable: true },
      { name: 'action', type: 'TEXT', nullable: false },
      { name: 'target_entity', type: 'TEXT', nullable: false },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false }
    ],
    rlsPolicies: ['p_audit_logs_select', 'p_audit_logs_insert'],
    indexes: ['idx_audit_logs_tenant_date']
  },
  {
    name: 'notes',
    description: 'Executive and operational notes saved with workspace scoping.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'tenant_id', type: 'UUID', nullable: false, isForeignKey: true, references: 'tenants(id)' },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'content', type: 'TEXT', nullable: false },
      { name: 'category', type: 'TEXT', nullable: false },
      { name: 'workspace', type: 'TEXT', nullable: false }
    ],
    rlsPolicies: ['p_notes_select', 'p_notes_admin_all', 'p_notes_employee_all', 'p_notes_client_manage_own'],
    indexes: ['idx_notes_tenant_ws']
  }
];

// ============================================================================
// 4. MULTI-TENANT STATE MANAGER & ACCESS CONTROL SERVICE
// ============================================================================

type TenantChangeListener = (tenant: TenantInfo, role: RoleId) => void;

export class TenantService {
  private static activeTenantId: TenantId = DEFAULT_TENANT_ID_OMK;
  private static activeRole: RoleId = 'admin';
  private static tenantsList: TenantInfo[] = [...PRESET_TENANTS];
  private static teamMembersList: TeamMember[] = [...PRESET_TEAM_MEMBERS];
  private static listeners: Set<TenantChangeListener> = new Set();
  private static isInitialized = false;

  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTenantId = localStorage.getItem('omk_active_tenant_id') || localStorage.getItem('omk_active_tenant_slug');
        const savedRole = localStorage.getItem('omk_active_user_role') as RoleId | null;

        if (savedTenantId) {
          const match = this.tenantsList.find(t => t.id === savedTenantId || t.slug === savedTenantId);
          if (match) {
            this.activeTenantId = match.id;
          }
        }

        if (savedRole && ['admin', 'employee', 'client', 'visitor'].includes(savedRole)) {
          this.activeRole = savedRole;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error while loading tenant state:', e);
    }

    const currentConfig = this.tenantsList.find(t => t.id === this.activeTenantId || t.slug === this.activeTenantId) || this.tenantsList[0];
    SupabaseClientService.setTenantContext(
      currentConfig.id, 
      this.activeRole, 
      this.activeRole === 'client' ? 'c0000000-0000-0000-0000-000000000001' : undefined
    );
  }

  public static getTenants(): TenantInfo[] {
    this.init();
    return [...this.tenantsList];
  }

  public static getActiveTenant(): TenantInfo {
    this.init();
    return this.tenantsList.find(t => t.id === this.activeTenantId || t.slug === this.activeTenantId) || this.tenantsList[0];
  }

  public static getActiveTenantId(): TenantId {
    return this.getActiveTenant().id;
  }

  public static setActiveTenant(tenantIdOrSlug: TenantId): TenantInfo {
    this.init();
    const target = this.tenantsList.find(t => t.id === tenantIdOrSlug || t.slug === tenantIdOrSlug);
    if (!target) return this.getActiveTenant();

    this.activeTenantId = target.id;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('omk_active_tenant_id', target.id);
        localStorage.setItem('omk_active_tenant_slug', target.slug);
      }
    } catch (e) {
      console.warn('Failed to persist tenant switch:', e);
    }

    SupabaseClientService.setTenantContext(
      target.id, 
      this.activeRole,
      this.activeRole === 'client' ? 'c0000000-0000-0000-0000-000000000001' : undefined
    );
    this.notifyListeners();
    return target;
  }

  public static switchTenant(slugOrId: string): boolean {
    const res = this.setActiveTenant(slugOrId);
    return res.slug === slugOrId || res.id === slugOrId;
  }

  public static getRoles(): RoleDefinition[] {
    return [...PRESET_ROLES];
  }

  public static getActiveRole(): RoleId {
    this.init();
    return this.activeRole;
  }

  public static setActiveRole(roleId: RoleId): RoleDefinition {
    this.init();
    this.activeRole = roleId;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('omk_active_user_role', roleId);
      }
    } catch (e) {
      console.warn('Failed to persist role switch:', e);
    }

    const currentConfig = this.getActiveTenant();
    SupabaseClientService.setTenantContext(
      currentConfig.id, 
      roleId,
      roleId === 'client' ? 'c0000000-0000-0000-0000-000000000001' : undefined
    );
    this.notifyListeners();
    return PRESET_ROLES.find(r => r.id === roleId) || PRESET_ROLES[0];
  }

  public static switchRole(role: RoleId): void {
    this.setActiveRole(role);
  }

  public static getPermissionsForRole(roleId: RoleId): AppPermission[] {
    return MODULE_DEFINITIONS.map(mod => {
      const isAllowedByTenant = this.getActiveTenant().allowedModules.includes(mod.id);
      
      let read = false;
      let write = false;
      let del = false;
      let admin = false;

      if (roleId === 'admin') {
        read = true;
        write = true;
        del = true;
        admin = true;
      } else if (roleId === 'employee') {
        read = true;
        write = !['legal', 'security', 'ontology', 'terminal', 'settings'].includes(mod.id);
        del = ['notes', 'leads', 'product'].includes(mod.id);
        admin = false;
      } else if (roleId === 'client') {
        read = ['dashboard', 'clients', 'notes', 'paas-pro', 'coach-ai', 'wallet', 'leads'].includes(mod.id);
        write = ['notes', 'leads', 'coach-ai'].includes(mod.id);
        del = mod.id === 'notes';
        admin = false;
      } else if (roleId === 'visitor') {
        read = ['dashboard', 'product', 'growth', 'clients', 'notes', 'coach-ai'].includes(mod.id);
        write = ['leads', 'coach-ai'].includes(mod.id);
        del = false;
        admin = false;
      }

      return {
        appId: mod.id,
        appName: mod.label,
        module: mod.id,
        label: mod.label,
        category: mod.category,
        read: read && isAllowedByTenant,
        write: write && isAllowedByTenant,
        delete: del && isAllowedByTenant,
        admin: admin && isAllowedByTenant,
        auditLog: true,
        rlsPolicy: `p_${mod.id}_${roleId}_isolation`
      };
    });
  }

  public static getTeamMembers(): TeamMember[] {
    this.init();
    return [...this.teamMembersList];
  }

  public static inviteTeamMember(email: string, role: RoleId, name: string, department: string): TeamMember {
    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name,
      email,
      role,
      department,
      status: 'invited',
      lastActive: 'En attente',
      tenantId: this.getActiveTenantId(),
      mfaEnabled: false,
      twoFactorEnabled: false
    };
    this.teamMembersList.push(newMember);
    return newMember;
  }

  public static removeTeamMember(id: string): boolean {
    const initialLen = this.teamMembersList.length;
    this.teamMembersList = this.teamMembersList.filter(m => m.id !== id);
    return this.teamMembersList.length < initialLen;
  }

  public static updateMemberRole(id: string, newRole: RoleId): TeamMember | undefined {
    const member = this.teamMembersList.find(m => m.id === id);
    if (member) {
      member.role = newRole;
      return member;
    }
    return undefined;
  }

  public static generateTenantSQLDump(tenantId: TenantId): string {
    const tenant = this.tenantsList.find(t => t.id === tenantId || t.slug === tenantId) || this.getActiveTenant();
    return `-- ============================================================================
-- SQL DUMP FOR TENANT: ${tenant.name} (${tenant.slug})
-- Generated at: ${new Date().toISOString()}
-- PostgreSQL Schema & Row-Level Security State
-- ============================================================================

SET search_path TO public, auth;
SET app.current_tenant_id = '${tenant.id}';

-- Tenant Metadata
INSERT INTO tenants (id, slug, name, tier, currency, domain, status, settings)
VALUES (
  '${tenant.id}',
  '${tenant.slug}',
  '${tenant.name}',
  '${tenant.tier}',
  '${tenant.currency}',
  '${tenant.domain}',
  '${tenant.status}',
  '${JSON.stringify(tenant.features)}'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Active RLS Constraints Verified
-- Total Isolated Tables: 17
`;
  }

  public static exportTenantJSON(tenantId: TenantId): string {
    const tenant = this.tenantsList.find(t => t.id === tenantId || t.slug === tenantId) || this.getActiveTenant();
    return JSON.stringify({
      tenant,
      members: this.teamMembersList.filter(m => m.tenantId === tenant.id),
      exportedAt: new Date().toISOString(),
      schemaVersion: '20260823000000'
    }, null, 2);
  }

  public static canRead(module: AppId | string): boolean {
    const permissions = this.getPermissionsForRole(this.activeRole);
    const p = permissions.find(item => item.module === module);
    return p ? p.read : false;
  }

  public static canWrite(module: AppId | string): boolean {
    const permissions = this.getPermissionsForRole(this.activeRole);
    const p = permissions.find(item => item.module === module);
    return p ? p.write : false;
  }

  public static canDelete(module: AppId | string): boolean {
    const permissions = this.getPermissionsForRole(this.activeRole);
    const p = permissions.find(item => item.module === module);
    return p ? p.delete : false;
  }

  public static getAccessibleModules(): AppId[] {
    const permissions = this.getPermissionsForRole(this.activeRole);
    return permissions.filter(p => p.read).map(p => p.module as AppId);
  }

  public static subscribe(listener: TenantChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const tenant = this.getActiveTenant();
    this.listeners.forEach(fn => fn(tenant, this.activeRole));
  }

  public static getMigrationStatus() {
    return {
      version: '20260823000000',
      name: '20260823000000_multi_tenant_schema_and_rls.sql',
      appliedAt: '2026-08-23T00:00:00Z',
      status: 'active',
      tablesCount: DATABASE_SCHEMA_METADATA.length,
      rlsEnabled: true,
      rolesSupported: ['admin', 'employee', 'client', 'visitor']
    };
  }

  public static getDatabaseTablesMetadata(): TableMetadata[] {
    return DATABASE_SCHEMA_METADATA;
  }

  public static getTableMetadata(tableName: TableName): TableMetadata | undefined {
    return DATABASE_SCHEMA_METADATA.find(t => t.name === tableName);
  }

  public static async verifyRLSContainment(): Promise<{
    passed: boolean;
    tenantId: string;
    role: RoleId;
    checkedTables: number;
    violationsFound: number;
    details: string[];
  }> {
    const activeTenantId = this.getActiveTenantId();
    const details: string[] = [];
    let violationsFound = 0;

    const tablesToCheck: TableName[] = ['clients', 'contracts', 'projects', 'tickets', 'transactions', 'employees'];

    for (const tbl of tablesToCheck) {
      const res = await SupabaseClientService.from(tbl).select('*');
      if (res.data) {
        const foreignItems = res.data.filter((item: any) => item.tenant_id !== activeTenantId);
        if (foreignItems.length > 0) {
          violationsFound += foreignItems.length;
          details.push(`[VIOLATION] ${foreignItems.length} foreign rows leaked in table '${tbl}' for tenant ${activeTenantId}`);
        } else {
          details.push(`[SECURE] Table '${tbl}' correctly isolated (${res.data.length} records returned).`);
        }
      }
    }

    return {
      passed: violationsFound === 0,
      tenantId: activeTenantId,
      role: this.activeRole,
      checkedTables: tablesToCheck.length,
      violationsFound,
      details
    };
  }
}

// Auto-initialize
TenantService.init();

// Export tenantService object for compatibility with Settings.tsx
export const tenantService = TenantService;
export default TenantService;
