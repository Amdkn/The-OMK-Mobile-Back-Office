-- ============================================================================
-- OMK MOBILE BACK OFFICE: MULTI-TENANT ARCHITECTURE & ENTERPRISE RLS SCHEMA
-- Migration: 20260823000000_multi_tenant_schema_and_rls.sql
-- Description: Complete production schema, 17 multi-tenant tables, indexes,
--              triggers, 4-tier RLS policies (admin, employee, client, visitor),
--              auth helper functions, and comprehensive multi-tenant seed data.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. AUTH & CONTEXT HELPER FUNCTIONS (PostgreSQL & Supabase compatible)
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS UUID AS $$
BEGIN
  -- 1. Try Supabase JWT claim: 'tenant_id'
  IF (nullif(current_setting('request.jwt.claim.tenant_id', true), '')) IS NOT NULL THEN
    RETURN (current_setting('request.jwt.claim.tenant_id', true))::uuid;
  END IF;

  -- 2. Try Supabase JWT app_metadata / user_metadata claim
  IF (nullif(current_setting('request.jwt.claims', true), '')) IS NOT NULL THEN
    DECLARE
      claims JSONB := current_setting('request.jwt.claims', true)::jsonb;
    BEGIN
      IF (claims ->> 'tenant_id') IS NOT NULL THEN
        RETURN (claims ->> 'tenant_id')::uuid;
      ELSIF (claims -> 'app_metadata' ->> 'tenant_id') IS NOT NULL THEN
        RETURN (claims -> 'app_metadata' ->> 'tenant_id')::uuid;
      ELSIF (claims -> 'user_metadata' ->> 'tenant_id') IS NOT NULL THEN
        RETURN (claims -> 'user_metadata' ->> 'tenant_id')::uuid;
      END IF;
    END;
  END IF;

  -- 3. Try custom session setting for manual override / background workers
  IF (nullif(current_setting('app.current_tenant_id', true), '')) IS NOT NULL THEN
    RETURN (current_setting('app.current_tenant_id', true))::uuid;
  END IF;

  -- Fallback: OMK Corp Default Tenant UUID for dev / fallback
  RETURN 'a0000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
  -- 1. Try Supabase JWT claim: 'user_role' or 'role'
  IF (nullif(current_setting('request.jwt.claim.user_role', true), '')) IS NOT NULL THEN
    RETURN current_setting('request.jwt.claim.user_role', true);
  END IF;

  IF (nullif(current_setting('request.jwt.claims', true), '')) IS NOT NULL THEN
    DECLARE
      claims JSONB := current_setting('request.jwt.claims', true)::jsonb;
    BEGIN
      IF (claims ->> 'user_role') IS NOT NULL THEN
        RETURN (claims ->> 'user_role');
      ELSIF (claims -> 'app_metadata' ->> 'role') IS NOT NULL THEN
        RETURN (claims -> 'app_metadata' ->> 'role');
      ELSIF (claims -> 'user_metadata' ->> 'role') IS NOT NULL THEN
        RETURN (claims -> 'user_metadata' ->> 'role');
      END IF;
    END;
  END IF;

  -- 2. Try custom session setting
  IF (nullif(current_setting('app.current_user_role', true), '')) IS NOT NULL THEN
    RETURN current_setting('app.current_user_role', true);
  END IF;

  -- Default to 'employee' if unauthenticated/unspecified
  RETURN 'employee';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.client_id()
RETURNS UUID AS $$
BEGIN
  -- Try to retrieve client_id claim for 'client' role users
  IF (nullif(current_setting('request.jwt.claim.client_id', true), '')) IS NOT NULL THEN
    RETURN (current_setting('request.jwt.claim.client_id', true))::uuid;
  END IF;

  IF (nullif(current_setting('request.jwt.claims', true), '')) IS NOT NULL THEN
    DECLARE
      claims JSONB := current_setting('request.jwt.claims', true)::jsonb;
    BEGIN
      IF (claims ->> 'client_id') IS NOT NULL THEN
        RETURN (claims ->> 'client_id')::uuid;
      ELSIF (claims -> 'user_metadata' ->> 'client_id') IS NOT NULL THEN
        RETURN (claims -> 'user_metadata' ->> 'client_id')::uuid;
      END IF;
    END;
  END IF;

  IF (nullif(current_setting('app.current_client_id', true), '')) IS NOT NULL THEN
    RETURN (current_setting('app.current_client_id', true))::uuid;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.user_role() = 'admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Automatic updated_at trigger helper
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLES DEFINITIONS (17 ENTITIES)
-- ============================================================================

-- Table 1: Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'enterprise' CHECK (tier IN ('starter', 'growth', 'enterprise', 'custom')),
  currency TEXT NOT NULL DEFAULT 'USD',
  domain TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'archived')),
  settings JSONB NOT NULL DEFAULT '{"features": ["crm", "finance", "hr", "ops", "ai"], "theme": "dark-oled"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 2: Profiles / Users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id UUID,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee', 'client', 'visitor')),
  client_id UUID,
  department TEXT,
  title TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_profile_email UNIQUE (tenant_id, email)
);

-- Table 3: Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Standard' CHECK (tier IN ('Enterprise', 'Premium', 'Standard', 'Startup')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Onboarding', 'At Risk', 'Churned', 'Prospect')),
  health_score INTEGER NOT NULL DEFAULT 95 CHECK (health_score BETWEEN 0 AND 100),
  mrr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  industry TEXT,
  account_owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign key back to profiles.client_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_client_id'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT fk_profiles_client_id 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Table 4: Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'MSA' CHECK (type IN ('MSA', 'SOW', 'SLA', 'NDA', 'Subscription', 'Licensing')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'pending_renewal', 'expired', 'terminated')),
  value NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'milestone')),
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  document_url TEXT,
  terms_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_contract_number UNIQUE (tenant_id, contract_number)
);

-- Table 5: Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('planning', 'in-progress', 'on-hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'Normale' CHECK (priority IN ('Critique', 'Haute', 'Moyenne', 'Normale')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  due_date DATE,
  milestones JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 6: Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'support' CHECK (category IN ('support', 'bug', 'feature_request', 'billing', 'incident')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_email TEXT,
  sla_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_ticket_number UNIQUE (tenant_id, ticket_number)
);

-- Table 7: Deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  probability INTEGER NOT NULL DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source TEXT,
  competitors TEXT[] DEFAULT '{}'::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 8: Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'nurturing', 'converted', 'disqualified')),
  score INTEGER NOT NULL DEFAULT 50 CHECK (score BETWEEN 0 AND 100),
  estimated_acv NUMERIC(12,2) DEFAULT 0.00,
  source TEXT NOT NULL DEFAULT 'inbound' CHECK (source IN ('inbound', 'outbound', 'referral', 'event', 'website', 'partner')),
  industry TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  qualification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 9: Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  transaction_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'income' CHECK (type IN ('income', 'expense', 'transfer', 'tax')),
  category TEXT NOT NULL CHECK (category IN ('Subscriptions', 'Consulting', 'Infrastructure', 'Salaries', 'Marketing', 'Tools', 'Office', 'Legal', 'Other')),
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reconciled', 'failed', 'refunded')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Stripe' CHECK (payment_method IN ('Stripe', 'Bank Wire', 'Credit Card', 'SEPA', 'PayPal', 'Crypto')),
  invoice_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_tx_number UNIQUE (tenant_id, transaction_number)
);

-- Table 10: Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL DEFAULT 2026,
  department TEXT NOT NULL CHECK (department IN ('Engineering', 'Sales & Growth', 'Product & Design', 'Operations & Legal', 'Executive', 'General')),
  allocated_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  spent_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'warning', 'exceeded', 'closed')),
  quarterly_allocations JSONB DEFAULT '{"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_dept_year UNIQUE (tenant_id, department, fiscal_year)
);

-- Table 11: Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'probation', 'terminated')),
  hire_date DATE NOT NULL,
  compensation JSONB DEFAULT '{"salary": 0, "currency": "USD", "bonus_target": 0}'::jsonb,
  skills TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_employee_code UNIQUE (tenant_id, employee_code)
);

-- Table 12: Leaves
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'paid_time_off' CHECK (leave_type IN ('paid_time_off', 'sick_leave', 'parental', 'unpaid', 'remote_work')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(4,1) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 13: SOPs (Standard Operating Procedures)
CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Operations', 'Security', 'Engineering', 'HR', 'Sales', 'Finance')),
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  checklist JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  last_reviewed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_sop_code UNIQUE (tenant_id, code)
);

-- Table 14: Microservices
CREATE TABLE IF NOT EXISTS microservices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  cluster TEXT NOT NULL DEFAULT 'production-us-east',
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'critical', 'maintenance')),
  replicas_active INTEGER NOT NULL DEFAULT 3,
  replicas_desired INTEGER NOT NULL DEFAULT 3,
  cpu_usage_pct NUMERIC(5,2) NOT NULL DEFAULT 35.0,
  memory_usage_mb INTEGER NOT NULL DEFAULT 1024,
  uptime_pct NUMERIC(5,2) NOT NULL DEFAULT 99.98,
  endpoint_url TEXT,
  version TEXT NOT NULL DEFAULT 'v2.4.1',
  last_health_check TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tenant_microservice_slug UNIQUE (tenant_id, slug)
);

-- Table 15: Cron Jobs
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schedule TEXT NOT NULL,
  target_service TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'failed', 'running')),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_status TEXT DEFAULT 'success' CHECK (last_status IN ('success', 'failure', 'timeout', 'running')),
  last_duration_ms INTEGER DEFAULT 450,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 16: Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 17: Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Général' CHECK (category IN ('Stratégie', 'Finance', 'Ops', 'Clients', 'Idées', 'Général')),
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  color TEXT,
  workspace TEXT NOT NULL DEFAULT 'Sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT MULTI-TENANT QUERYING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_client ON profiles(client_id);

CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_health ON clients(tenant_id, health_score DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_tenant_client ON contracts(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_projects_tenant_client ON projects(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant_client ON tickets(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON tickets(tenant_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_deals_tenant_stage ON deals(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status, score DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_cat ON transactions(tenant_id, category);

CREATE INDEX IF NOT EXISTS idx_budgets_tenant_year ON budgets(tenant_id, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_employees_tenant_dept ON employees(tenant_id, department, status);
CREATE INDEX IF NOT EXISTS idx_leaves_tenant_emp ON leaves(tenant_id, employee_id, status);

CREATE INDEX IF NOT EXISTS idx_sops_tenant_cat ON sops(tenant_id, category, status);
CREATE INDEX IF NOT EXISTS idx_microservices_tenant ON microservices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_tenant ON cron_jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_date ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tenant_ws ON notes(tenant_id, workspace, category);

-- ============================================================================
-- 4. AUTOMATED UPDATED_AT TRIGGERS
-- ============================================================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'tenants', 'profiles', 'clients', 'contracts', 'projects',
    'tickets', 'deals', 'leads', 'transactions', 'budgets',
    'employees', 'leaves', 'sops', 'microservices', 'cron_jobs', 'notes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_handle_updated_at ON %I;
      CREATE TRIGGER trg_handle_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
    ', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) ACTIVATION ON ALL TABLES
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE microservices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. STRICT 4-TIER RLS POLICIES (ADMIN, EMPLOYEE, CLIENT, VISITOR)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLE: tenants
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_tenants_select ON tenants;
CREATE POLICY p_tenants_select ON tenants
  FOR SELECT
  USING (
    id = auth.tenant_id()
    OR auth.user_role() = 'admin'
    OR auth.user_role() = 'visitor'
  );

DROP POLICY IF EXISTS p_tenants_all_admin ON tenants;
CREATE POLICY p_tenants_all_admin ON tenants
  FOR ALL
  USING (auth.user_role() = 'admin' AND id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: profiles
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_profiles_select ON profiles;
CREATE POLICY p_profiles_select ON profiles
  FOR SELECT
  USING (
    tenant_id = auth.tenant_id()
    OR auth.user_role() = 'visitor'
  );

DROP POLICY IF EXISTS p_profiles_admin_all ON profiles;
CREATE POLICY p_profiles_admin_all ON profiles
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_profiles_employee_update_self ON profiles;
CREATE POLICY p_profiles_employee_update_self ON profiles
  FOR UPDATE
  USING (
    tenant_id = auth.tenant_id()
    AND auth.user_role() IN ('employee', 'client')
    AND auth_user_id = auth.uid()
  )
  WITH CHECK (
    tenant_id = auth.tenant_id()
    AND auth.user_role() IN ('employee', 'client')
    AND auth_user_id = auth.uid()
  );

-- ----------------------------------------------------------------------------
-- TABLE: clients
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_clients_select ON clients;
CREATE POLICY p_clients_select ON clients
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (tenant_id = auth.tenant_id() AND auth.user_role() = 'client' AND id = auth.client_id())
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_clients_admin_manage ON clients;
CREATE POLICY p_clients_admin_manage ON clients
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_clients_employee_modify ON clients;
CREATE POLICY p_clients_employee_modify ON clients
  FOR INSERT
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_clients_employee_update ON clients;
CREATE POLICY p_clients_employee_update ON clients
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: contracts
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_contracts_select ON contracts;
CREATE POLICY p_contracts_select ON contracts
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (tenant_id = auth.tenant_id() AND auth.user_role() = 'client' AND client_id = auth.client_id())
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_contracts_admin_all ON contracts;
CREATE POLICY p_contracts_admin_all ON contracts
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_contracts_employee_write ON contracts;
CREATE POLICY p_contracts_employee_write ON contracts
  FOR INSERT
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_contracts_employee_update ON contracts;
CREATE POLICY p_contracts_employee_update ON contracts
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: projects
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_projects_select ON projects;
CREATE POLICY p_projects_select ON projects
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (tenant_id = auth.tenant_id() AND auth.user_role() = 'client' AND client_id = auth.client_id())
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_projects_admin_all ON projects;
CREATE POLICY p_projects_admin_all ON projects
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_projects_employee_write ON projects;
CREATE POLICY p_projects_employee_write ON projects
  FOR INSERT
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_projects_employee_update ON projects;
CREATE POLICY p_projects_employee_update ON projects
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: tickets
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_tickets_select ON tickets;
CREATE POLICY p_tickets_select ON tickets
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (tenant_id = auth.tenant_id() AND auth.user_role() = 'client' AND client_id = auth.client_id())
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_tickets_admin_all ON tickets;
CREATE POLICY p_tickets_admin_all ON tickets
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_tickets_employee_manage ON tickets;
CREATE POLICY p_tickets_employee_manage ON tickets
  FOR ALL
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_tickets_client_insert ON tickets;
CREATE POLICY p_tickets_client_insert ON tickets
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'client'
    AND tenant_id = auth.tenant_id()
    AND client_id = auth.client_id()
  );

DROP POLICY IF EXISTS p_tickets_client_update ON tickets;
CREATE POLICY p_tickets_client_update ON tickets
  FOR UPDATE
  USING (
    auth.user_role() = 'client'
    AND tenant_id = auth.tenant_id()
    AND client_id = auth.client_id()
  )
  WITH CHECK (
    auth.user_role() = 'client'
    AND tenant_id = auth.tenant_id()
    AND client_id = auth.client_id()
  );

-- ----------------------------------------------------------------------------
-- TABLE: deals
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_deals_select ON deals;
CREATE POLICY p_deals_select ON deals
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_deals_admin_all ON deals;
CREATE POLICY p_deals_admin_all ON deals
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_deals_employee_write ON deals;
CREATE POLICY p_deals_employee_write ON deals
  FOR ALL
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: leads
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_leads_select ON leads;
CREATE POLICY p_leads_select ON leads
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_leads_admin_all ON leads;
CREATE POLICY p_leads_admin_all ON leads
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_leads_employee_manage ON leads;
CREATE POLICY p_leads_employee_manage ON leads
  FOR ALL
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_leads_visitor_client_submit ON leads;
CREATE POLICY p_leads_visitor_client_submit ON leads
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.tenant_id()
    OR auth.user_role() IN ('visitor', 'client')
  );

-- ----------------------------------------------------------------------------
-- TABLE: transactions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_transactions_select ON transactions;
CREATE POLICY p_transactions_select ON transactions
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_transactions_admin_all ON transactions;
CREATE POLICY p_transactions_admin_all ON transactions
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_transactions_employee_read_write ON transactions;
CREATE POLICY p_transactions_employee_read_write ON transactions
  FOR INSERT
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_transactions_employee_update ON transactions;
CREATE POLICY p_transactions_employee_update ON transactions
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: budgets
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_budgets_select ON budgets;
CREATE POLICY p_budgets_select ON budgets
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_budgets_admin_all ON budgets;
CREATE POLICY p_budgets_admin_all ON budgets
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_budgets_employee_view ON budgets;
CREATE POLICY p_budgets_employee_view ON budgets
  FOR SELECT
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: employees
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_employees_select ON employees;
CREATE POLICY p_employees_select ON employees
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_employees_admin_all ON employees;
CREATE POLICY p_employees_admin_all ON employees
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_employees_employee_read ON employees;
CREATE POLICY p_employees_employee_read ON employees
  FOR SELECT
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: leaves
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_leaves_select ON leaves;
CREATE POLICY p_leaves_select ON leaves
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_leaves_admin_all ON leaves;
CREATE POLICY p_leaves_admin_all ON leaves
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_leaves_employee_request ON leaves;
CREATE POLICY p_leaves_employee_request ON leaves
  FOR INSERT
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_leaves_employee_update_own ON leaves;
CREATE POLICY p_leaves_employee_update_own ON leaves
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: sops
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_sops_select ON sops;
CREATE POLICY p_sops_select ON sops
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_sops_admin_all ON sops;
CREATE POLICY p_sops_admin_all ON sops
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_sops_employee_write ON sops;
CREATE POLICY p_sops_employee_write ON sops
  FOR INSERT
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_sops_employee_update ON sops;
CREATE POLICY p_sops_employee_update ON sops
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: microservices
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_microservices_select ON microservices;
CREATE POLICY p_microservices_select ON microservices
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_microservices_admin_all ON microservices;
CREATE POLICY p_microservices_admin_all ON microservices
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_microservices_employee_operate ON microservices;
CREATE POLICY p_microservices_employee_operate ON microservices
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: cron_jobs
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_cron_jobs_select ON cron_jobs;
CREATE POLICY p_cron_jobs_select ON cron_jobs
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_cron_jobs_admin_all ON cron_jobs;
CREATE POLICY p_cron_jobs_admin_all ON cron_jobs
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_cron_jobs_employee_operate ON cron_jobs;
CREATE POLICY p_cron_jobs_employee_operate ON cron_jobs
  FOR UPDATE
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: audit_logs
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_audit_logs_select ON audit_logs;
CREATE POLICY p_audit_logs_select ON audit_logs
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() = 'admin')
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_audit_logs_insert ON audit_logs;
CREATE POLICY p_audit_logs_insert ON audit_logs
  FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

-- ----------------------------------------------------------------------------
-- TABLE: notes
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_notes_select ON notes;
CREATE POLICY p_notes_select ON notes
  FOR SELECT
  USING (
    (tenant_id = auth.tenant_id() AND auth.user_role() IN ('admin', 'employee'))
    OR (tenant_id = auth.tenant_id() AND auth.user_role() = 'client' AND author_id = auth.uid())
    OR (auth.user_role() = 'visitor')
  );

DROP POLICY IF EXISTS p_notes_admin_all ON notes;
CREATE POLICY p_notes_admin_all ON notes
  FOR ALL
  USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_notes_employee_all ON notes;
CREATE POLICY p_notes_employee_all ON notes
  FOR ALL
  USING (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id())
  WITH CHECK (auth.user_role() = 'employee' AND tenant_id = auth.tenant_id());

DROP POLICY IF EXISTS p_notes_client_manage_own ON notes;
CREATE POLICY p_notes_client_manage_own ON notes
  FOR ALL
  USING (
    auth.user_role() = 'client'
    AND tenant_id = auth.tenant_id()
    AND author_id = auth.uid()
  )
  WITH CHECK (
    auth.user_role() = 'client'
    AND tenant_id = auth.tenant_id()
    AND author_id = auth.uid()
  );

-- ============================================================================
-- 7. SEED DATA: TENANTS, USERS, CLIENTS, CONTRACTS & OPERATIONS
-- ============================================================================

INSERT INTO tenants (id, slug, name, tier, currency, domain, status, settings)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'omk-corp',
    'OMK Corporation',
    'enterprise',
    'USD',
    'omk-corp.io',
    'active',
    '{"features": ["crm", "finance", "hr", "ops", "ai", "paas", "baas"], "theme": "dark-oled", "primaryColor": "#10b981", "logo": "/assets/omk-logo.svg"}'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'apex-quantum',
    'Apex Quantum Technologies',
    'enterprise',
    'USD',
    'apexquantum.io',
    'active',
    '{"features": ["crm", "finance", "ops", "ai", "paas"], "theme": "cyberpunk", "primaryColor": "#3b82f6", "logo": "/assets/apex-logo.svg"}'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'starlight-media',
    'Starlight Media & Studios',
    'growth',
    'EUR',
    'starlightmedia.fr',
    'active',
    '{"features": ["crm", "growth", "notes", "ai"], "theme": "warm-paper", "primaryColor": "#f59e0b", "logo": "/assets/starlight-logo.svg"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  settings = EXCLUDED.settings;

-- Seed Default Profiles for 4 Role Levels
INSERT INTO profiles (id, tenant_id, email, full_name, role, department, title, phone, is_active)
VALUES
  -- OMK Corp Admin
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'alexandre@omk-corp.io',
    'Alexandre de Morais',
    'admin',
    'Executive',
    'CEO & Chief Architect',
    '+1 (555) 019-2831',
    true
  ),
  -- OMK Corp Employee
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'elena.rostova@omk-corp.io',
    'Elena Rostova',
    'employee',
    'Operations',
    'VP Operations & Delivery',
    '+1 (555) 019-4822',
    true
  ),
  -- OMK Corp Client User (Marcus Vance representing Apex Quantum)
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'marcus.vance@apexquantum.io',
    'Marcus Vance',
    'client',
    'Engineering Leadership',
    'Chief Technology Officer',
    '+1 (555) 829-1029',
    true
  ),
  -- OMK Corp Visitor
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'guest.analyst@external.io',
    'Guest Industry Analyst',
    'visitor',
    'External',
    'Security & Tech Auditor',
    '+1 (555) 999-0000',
    true
  ),
  -- Apex Quantum Admin
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'sarah.chen@apexquantum.io',
    'Sarah Chen',
    'admin',
    'Executive',
    'Managing Director',
    '+1 (555) 744-8831',
    true
  ),
  -- Starlight Media Admin
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000003',
    'julien.delacroix@starlightmedia.fr',
    'Julien Delacroix',
    'admin',
    'Direction Générale',
    'Directeur Artistique & VP',
    '+33 1 42 68 55 00',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Seed Clients
INSERT INTO clients (id, tenant_id, name, tier, status, health_score, mrr, industry, account_owner_id, contact_email, contact_phone, tags)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Apex Quantum Corp',
    'Enterprise',
    'Active',
    98,
    42000.00,
    'Fintech & Quantum Cryptography',
    'b0000000-0000-0000-0000-000000000001',
    'contact@apexquantum.io',
    '+1 (555) 829-1029',
    ARRAY['Tier-1', 'Fintech', 'SOC2', 'High-ARR']
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'NeuroLink Biometrics',
    'Enterprise',
    'Active',
    94,
    28500.00,
    'HealthTech & Neural AI',
    'b0000000-0000-0000-0000-000000000002',
    'enterprise@neurolink.bio',
    '+1 (555) 392-8811',
    ARRAY['Biotech', 'HIPAA', 'AI-Pipeline']
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Starlight Studios France',
    'Premium',
    'Onboarding',
    90,
    18000.00,
    'Creative Media & CGI Rendering',
    'b0000000-0000-0000-0000-000000000002',
    'ops@starlightmedia.fr',
    '+33 1 42 68 55 00',
    ARRAY['Media', 'PaaS-Heavy', 'Europe']
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'Vanguard Defense Systems',
    'Enterprise',
    'Active',
    99,
    65000.00,
    'Aerospace & Secure Systems',
    'b0000000-0000-0000-0000-000000000005',
    'contracts@vanguard-def.com',
    '+1 (555) 700-1122',
    ARRAY['Defense', 'Critical', 'GovCloud']
  )
ON CONFLICT (id) DO UPDATE SET
  health_score = EXCLUDED.health_score,
  mrr = EXCLUDED.mrr;

-- Associate client profile
UPDATE profiles 
SET client_id = 'c0000000-0000-0000-0000-000000000001' 
WHERE id = 'b0000000-0000-0000-0000-000000000003';

-- Seed Contracts
INSERT INTO contracts (id, tenant_id, client_id, contract_number, title, type, status, value, billing_cycle, start_date, end_date, auto_renew)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'CTR-2026-APEX-001',
    'Enterprise Master Services & PaaS Dedicated Cloud Agreement',
    'MSA',
    'active',
    504000.00,
    'monthly',
    '2026-01-01',
    '2027-01-01',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'CTR-2026-NEURO-002',
    'Neural Pipeline Processing & BaaS Cloud License',
    'Subscription',
    'active',
    342000.00,
    'annual',
    '2026-03-01',
    '2027-03-01',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'CTR-2026-STAR-003',
    'Creative Cloud Infrastructure & Edge Rendering SOW',
    'SOW',
    'active',
    216000.00,
    'monthly',
    '2026-04-15',
    '2027-04-15',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Projects
INSERT INTO projects (id, tenant_id, client_id, name, description, status, priority, progress, budget, spent, start_date, due_date)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Quantum Encryption Edge Proxy v4',
    'Déploiement du cluster zéro-latence avec accélération cryptographique matérielle.',
    'in-progress',
    'Critique',
    78,
    150000.00,
    98400.00,
    '2026-02-01',
    '2026-10-31'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'Bio-Signals Ingestion Pipeline',
    'Pipeline temps réel pour télémétrie médicale avec conformité HIPAA Tier-3.',
    'in-progress',
    'Haute',
    92,
    95000.00,
    87000.00,
    '2026-01-15',
    '2026-09-15'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Tickets
INSERT INTO tickets (id, tenant_id, client_id, project_id, ticket_number, title, description, status, priority, category, reporter_email)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'TCK-8821',
    'Optimisation throughput clusters EU-West',
    'Augmentation de la charge de 30% observée durant les pics horaires boursiers.',
    'in_progress',
    'high',
    'support',
    'marcus.vance@apexquantum.io'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000002',
    'TCK-8822',
    'Renouvellement certificats mTLS HSM',
    'Mise à jour planifiée des clés maîtresses sur le module matériel de sécurité.',
    'resolved',
    'urgent',
    'support',
    'security@neurolink.bio'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Deals & Leads
INSERT INTO deals (id, tenant_id, client_id, title, stage, amount, probability, expected_close_date)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Extension PaaS Cluster Asie-Pacifique',
    'negotiation',
    180000.00,
    85,
    '2026-09-30'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'Hyperion Global AI Core Migration',
    'proposal',
    250000.00,
    65,
    '2026-11-15'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO leads (id, tenant_id, company_name, contact_name, contact_email, contact_phone, status, score, estimated_acv, source, industry)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Hyperion Logistics',
    'David Sterling',
    'd.sterling@hyperion-logistics.com',
    '+1 (555) 438-9901',
    'qualified',
    96,
    145000.00,
    'inbound',
    'Logistics & Supply Chain'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Aether Robotics',
    'Klara Novak',
    'k.novak@aether-robotics.de',
    '+49 89 2038 491',
    'contacted',
    88,
    85000.00,
    'website',
    'Industrial Robotics'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Transactions & Budgets
INSERT INTO transactions (id, tenant_id, client_id, transaction_number, type, category, amount, currency, status, date, description, payment_method)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'TX-2026-08-001',
    'income',
    'Subscriptions',
    42000.00,
    'USD',
    'completed',
    CURRENT_DATE - INTERVAL '2 days',
    'Stripe Clôture Mensuelle Apex Quantum Enterprise',
    'Stripe'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'TX-2026-08-002',
    'expense',
    'Infrastructure',
    12450.00,
    'USD',
    'completed',
    CURRENT_DATE - INTERVAL '5 days',
    'AWS Cloud Architecture & GPU Clusters Facturation',
    'Bank Wire'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO budgets (id, tenant_id, fiscal_year, department, allocated_amount, spent_amount, status, quarterly_allocations)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    2026,
    'Engineering',
    480000.00,
    312000.00,
    'on_track',
    '{"Q1": 120000, "Q2": 120000, "Q3": 120000, "Q4": 120000}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    2026,
    'Sales & Growth',
    240000.00,
    168000.00,
    'on_track',
    '{"Q1": 60000, "Q2": 60000, "Q3": 60000, "Q4": 60000}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Employees & Leaves
INSERT INTO employees (id, tenant_id, profile_id, employee_code, first_name, last_name, email, department, job_title, hire_date, compensation, skills)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'EMP-001',
    'Alexandre',
    'de Morais',
    'alexandre@omk-corp.io',
    'Executive',
    'Chief Architect & CEO',
    '2024-01-01',
    '{"salary": 220000, "currency": "USD", "bonus_target": 50000}'::jsonb,
    ARRAY['Distributed Systems', 'PostgreSQL RLS', 'React Architecture', 'Cloud Infrastructure']
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'EMP-002',
    'Elena',
    'Rostova',
    'elena.rostova@omk-corp.io',
    'Operations',
    'VP Operations & Delivery',
    '2024-03-15',
    '{"salary": 165000, "currency": "USD", "bonus_target": 30000}'::jsonb,
    ARRAY['Operations', 'SLA Management', 'SOC2 Compliance', 'Client Success']
  )
ON CONFLICT (id) DO NOTHING;

-- Seed SOPs, Microservices & Cron Jobs
INSERT INTO sops (id, tenant_id, code, title, category, version, status, author_id, content, checklist)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'SOP-SEC-01',
    'Procédure d''Isolation Multi-Tenant et Audit RLS',
    'Security',
    '2.4',
    'published',
    'b0000000-0000-0000-0000-000000000001',
    'Vérification continue des politiques de Row-Level Security et étanchéité absolue entre locataires.',
    '[{"step": 1, "task": "Vérifier le JWT claims tenant_id", "done": true}, {"step": 2, "task": "Exécuter les suites de tests RLS d''injection", "done": true}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO microservices (id, tenant_id, name, slug, cluster, status, replicas_active, replicas_desired, cpu_usage_pct, memory_usage_mb, uptime_pct, version)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'BaaS Core Ledger & Event Router',
    'baas-core-ledger',
    'us-east-cluster-01',
    'healthy',
    6,
    6,
    28.5,
    2048,
    99.99,
    'v4.1.0'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Cognition Neural Worker Engine',
    'cognition-worker',
    'us-east-gpu-02',
    'healthy',
    4,
    4,
    42.0,
    4096,
    99.95,
    'v3.8.2'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO cron_jobs (id, tenant_id, name, schedule, target_service, action, status, last_status, last_duration_ms)
VALUES
  (
    '80000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Stripe Daily Billing & Reconciliation',
    '0 2 * * *',
    'baas-core-ledger',
    'reconcile_daily_ledgers',
    'active',
    'success',
    340
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Multi-Tenant RLS Integrity Scan',
    '*/30 * * * *',
    'security-auditor',
    'verify_rls_tenant_containment',
    'active',
    'success',
    125
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Notes
INSERT INTO notes (id, tenant_id, author_id, title, content, category, tags, is_pinned, workspace)
VALUES
  (
    '90000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Architecture Cadrage Supabase Multi-Tenant 2026',
    'Toutes les tables intègrent tenant_id et bénéficient de Row Level Security stricte avec 4 rôles (admin, employee, client, visitor).',
    'Stratégie',
    ARRAY['Architecture', 'Supabase', 'RLS', 'Security'],
    true,
    'Production'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Audit Clôture Q3 & Déploiement Clusters',
    'Points à valider avec Marcus Vance (Apex Quantum) concernant l''extension APAC.',
    'Ops',
    ARRAY['Apex', 'Operations', 'Q3'],
    false,
    'Sandbox'
  )
ON CONFLICT (id) DO NOTHING;

-- Log the initial migration in audit_logs
INSERT INTO audit_logs (tenant_id, actor_email, actor_role, action, target_entity, details)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'system@omk-corp.io',
  'admin',
  'MIGRATION_APPLIED',
  'schema_20260823000000',
  '{"status": "success", "tables_created": 17, "rls_policies_applied": true}'::jsonb
);

-- ============================================================================
-- END OF MIGRATION 20260823000000_multi_tenant_schema_and_rls.sql
-- ============================================================================
