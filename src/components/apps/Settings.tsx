import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  SunMedium, 
  Sliders, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Contrast,
  Layers,
  Zap,
  HardDrive,
  RefreshCw,
  Database,
  ChevronDown,
  Bell,
  Lock,
  Wifi,
  Bot,
  Fingerprint,
  Download,
  Volume2,
  VolumeX,
  Smartphone,
  Radio,
  Share2,
  Key,
  CheckCircle2,
  SlidersHorizontal,
  FileCode,
  Gauge,
  Users,
  Server,
  Code,
  Play,
  ShieldAlert,
  UserPlus,
  X,
  Copy,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Globe,
  Trash2,
  LockKeyhole,
  CheckSquare,
  Square,
  Filter,
  Search,
  Cpu,
  FileText
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { usePowerManager } from '../../hooks/usePowerManager';
import { OfflineStorageService } from '../../services/offlineStorage';
import { haptics } from '../../services/haptics';
import { ThemeId, ContrastLevel, WallpaperId, AppId, UI_UX_PRO_MAX_THEMES } from '../../types';
import { WALLPAPERS } from '../WallpaperBackground';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import DetailDrawer from '../layout/DetailDrawer';
import { 
  tenantService, 
  TenantInfo, 
  RoleId, 
  RoleDefinition, 
  AppPermission, 
  TeamMember,
  TenantId 
} from '../../services/tenantService';
import { 
  supabaseClient, 
  SupabaseConfig, 
  SupabaseMigration, 
  SupabaseRLSRule 
} from '../../services/supabaseClient';

interface NavTab {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  desc?: string;
}

const PRIMARY_TABS: NavTab[] = [
  { id: 'tenant', label: 'Multi-Tenant', icon: Database, badge: 'Supabase' },
  { id: 'rbac', label: 'Rôles & RBAC', icon: ShieldCheck, badge: '4 Rôles' },
  { id: 'display', label: 'Affichage', icon: Contrast },
  { id: 'themes', label: 'Thèmes', icon: Palette, badge: 16 }
];

const EXTENDED_TABS: NavTab[] = [
  { id: 'wallpapers', label: 'Fonds d\'écran', icon: ImageIcon, badge: 6, desc: 'Arrière-plans dynamiques et reflets' },
  { id: 'system', label: 'Système & Kernel', icon: Server, badge: 'v4.2', desc: 'Gestion de l\'énergie, batterie & runtime' },
  { id: 'notifications', label: 'Notifications & Sons', icon: Bell, badge: 'IA', desc: 'Alertes, sons et vibrations haptiques' },
  { id: 'security', label: 'Sécurité & Biométrie', icon: Lock, badge: 'Chiffré', desc: 'Code PIN, biométrie et sandbox' },
  { id: 'network', label: 'Réseau & WebSocket', icon: Wifi, badge: '5G', desc: 'Connectivité, WebSocket et cloud sync' },
  { id: 'ai_settings', label: 'Intelligence IA', icon: Bot, badge: 'Gemini', desc: 'Modèles Gemini 2.5, autonomie et vision' },
  { id: 'storage', label: 'Stockage & Export', icon: HardDrive, badge: 'IndexedDB', desc: 'Gestion mémoire, export JSON et backup' },
  { id: 'accessibility', label: 'Accessibilité WCAG', icon: Sliders, badge: 'AA+', desc: 'Animations, taille de police et clarté' }
];

export default function Settings() {
  const { 
    theme, 
    setTheme, 
    contrast, 
    setContrast, 
    wallpaper, 
    setWallpaper, 
    brightness, 
    setBrightness,
    workspace,
    setWorkspace
  } = useOSStore();

  const power = usePowerManager();
  const [activeTab, setActiveTab] = useState('tenant');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- MULTI-TENANT & SUPABASE STATE ---
  const [tenants, setTenants] = useState<TenantInfo[]>(tenantService.getTenants());
  const [activeTenant, setActiveTenantState] = useState<TenantInfo>(tenantService.getActiveTenant());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(supabaseClient.getConfig());
  const [migrations, setMigrations] = useState<SupabaseMigration[]>(supabaseClient.getMigrations());
  const [rlsRules, setRlsRules] = useState<SupabaseRLSRule[]>(supabaseClient.getRLSRules());
  const [isPingingSupabase, setIsPingingSupabase] = useState(false);
  const [isVerifyingRLS, setIsVerifyingRLS] = useState(false);

  // --- RBAC & ROLES STATE ---
  const [roles, setRoles] = useState<RoleDefinition[]>(tenantService.getRoles());
  const [activeRoleId, setActiveRoleId] = useState<RoleId>(tenantService.getActiveRole());
  const [permissionsMatrix, setPermissionsMatrix] = useState<AppPermission[]>(tenantService.getPermissionsForRole(tenantService.getActiveRole()));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(tenantService.getTeamMembers());
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // --- DRAWER / MODAL STATES ---
  const [selectedTenantDrawer, setSelectedTenantDrawer] = useState<TenantInfo | null>(null);
  const [selectedMigrationDrawer, setSelectedMigrationDrawer] = useState<SupabaseMigration | null>(null);
  const [selectedRoleDrawer, setSelectedRoleDrawer] = useState<RoleDefinition | null>(null);
  const [selectedAppPermissionDrawer, setSelectedAppPermissionDrawer] = useState<AppPermission | null>(null);
  const [selectedMemberDrawer, setSelectedMemberDrawer] = useState<TeamMember | null>(null);
  const [selectedGenericDrawer, setSelectedGenericDrawer] = useState<{
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    kpis: { label: string; value: string | number; sub?: string; trend?: 'up' | 'down' | 'neutral' }[];
    aiInsight: { title?: string; content: string; actionLabel?: string; onAction?: () => void };
    tabs: { id: string; label: string; content: React.ReactNode }[];
  } | null>(null);

  // --- MODALS ---
  const [isNewMigrationModalOpen, setIsNewMigrationModalOpen] = useState(false);
  const [newMigrationName, setNewMigrationName] = useState('20260823_add_feature_flag_tables.sql');
  const [newMigrationDDL, setNewMigrationDDL] = useState(`-- Create high-performance feature flags table\nCREATE TABLE IF NOT EXISTS tenant_feature_flags (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    tenant_id TEXT NOT NULL DEFAULT 'omk-enterprise',\n    flag_key TEXT NOT NULL,\n    is_enabled BOOLEAN NOT NULL DEFAULT true,\n    rollout_percentage INT DEFAULT 100,\n    created_at TIMESTAMPTZ DEFAULT now()\n);\nALTER TABLE tenant_feature_flags ENABLE ROW LEVEL SECURITY;\nCREATE POLICY feature_flags_isolation ON tenant_feature_flags FOR ALL USING (tenant_id = current_tenant_id());`);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleId>('employee');
  const [inviteDepartment, setInviteDepartment] = useState('Ingénierie & Produit');

  // --- EXTENDED SETTINGS STATE ---
  const [hapticIntensity, setHapticIntensity] = useState<'off' | 'light' | 'medium' | 'heavy'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [screenTimeout, setScreenTimeout] = useState('2min');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [aiCreativity, setAiCreativity] = useState(0.7);
  const [aiProactiveIsland, setAiProactiveIsland] = useState(true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'compact'>('normal');
  const [pingSpeed, setPingSpeed] = useState<number | null>(16);
  const [isTestingPing, setIsTestingPing] = useState(false);

  const isExtendedTabActive = EXTENDED_TABS.some(t => t.id === activeTab);
  const activeExtendedTabObj = EXTENDED_TABS.find(t => t.id === activeTab);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleTabSelect = (tabId: string) => {
    haptics.trigger('selection');
    setActiveTab(tabId);
  };

  // Switch Tenant
  const handleSwitchTenant = (tenantId: TenantId) => {
    const newActive = tenantService.setActiveTenant(tenantId);
    setActiveTenantState(newActive);
    setTeamMembers(tenantService.getTeamMembers());
    showToast(`Tenant basculé sur [${newActive.name}]`);
  };

  // Switch Role
  const handleSwitchRole = (roleId: RoleId) => {
    const roleDef = tenantService.setActiveRole(roleId);
    setActiveRoleId(roleId);
    setPermissionsMatrix(tenantService.getPermissionsForRole(roleId));
    showToast(`Rôle actif changé en [${roleDef.name}]`);
  };

  // Ping Supabase
  const handlePingSupabase = async () => {
    setIsPingingSupabase(true);
    const result = await supabaseClient.checkConnection();
    setSupabaseConfig({ ...supabaseClient.getConfig(), latencyMs: result.latency });
    setIsPingingSupabase(false);
    showToast(`Supabase Backend connecté (Latence: ${result.latency}ms)`);
  };

  // Verify RLS
  const handleVerifyRLS = async () => {
    setIsVerifyingRLS(true);
    const res = await supabaseClient.verifyRLSPolicies();
    setIsVerifyingRLS(false);
    showToast(`Audit RLS validé : ${res.enforcedCount}/${res.totalPolicies} politiques strictes actives`);
  };

  // Execute Simulated Migration
  const handleExecuteMigration = async () => {
    if (!newMigrationName.trim()) return;
    const newMig = await supabaseClient.simulateMigration(newMigrationName, newMigrationDDL);
    setMigrations(supabaseClient.getMigrations());
    setIsNewMigrationModalOpen(false);
    showToast(`Migration [${newMig.name}] exécutée en ${newMig.executionTimeMs}ms`);
  };

  // Export SQL Dump
  const handleDownloadSQLDump = (tId: TenantId) => {
    haptics.trigger('success');
    const dump = tenantService.generateTenantSQLDump(tId);
    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-dump-${tId}-${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Dump SQL du tenant [${tId}] téléchargé avec succès`);
  };

  // Export JSON Dump
  const handleDownloadJSONDump = (tId: TenantId) => {
    haptics.trigger('success');
    const json = tenantService.exportTenantJSON(tId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-backup-${tId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Archive JSON du tenant [${tId}] exportée`);
  };

  // Invite Team Member
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    const newM = tenantService.inviteTeamMember(inviteEmail, inviteRole, inviteName, inviteDepartment);
    setTeamMembers(tenantService.getTeamMembers());
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Invitation envoyée à ${newM.email} (${newM.role})`);
  };

  // Cache Wiping
  const handleClearCache = async () => {
    haptics.trigger('medium');
    await OfflineStorageService.clearAppCache();
    await OfflineStorageService.seedDefaultOfflineCache(workspace);
    showToast('Cache IndexedDB réinitialisé avec succès');
  };

  // Export Config
  const handleExportConfig = () => {
    haptics.trigger('success');
    const configData = {
      os: 'OMK Mobile OS',
      version: '4.2',
      exportDate: new Date().toISOString(),
      activeTenant: activeTenant.slug,
      activeRole: activeRoleId,
      workspace,
      theme,
      contrast,
      wallpaper,
      brightness,
      hapticIntensity,
      soundEnabled,
      aiModel,
      biometricEnabled
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omk-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Configuration globale exportée au format JSON');
  };

  const testPing = () => {
    setIsTestingPing(true);
    haptics.trigger('light');
    setTimeout(() => {
      setPingSpeed(Math.floor(Math.random() * 14) + 12);
      setIsTestingPing(false);
      showToast('Latence réseau mesurée : 14ms (Passerelle 5G)');
    }, 600);
  };

  const themes: { id: ThemeId; name: string; desc: string; sampleBg: string; sampleBorder: string; sampleText: string; accent: string }[] = [
    { 
      id: 'dark-oled', 
      name: 'Dark OLED', 
      desc: 'Obsidienne pure & terminal haute précision',
      sampleBg: 'bg-[#05070c]',
      sampleBorder: 'border-slate-800',
      sampleText: 'text-slate-100',
      accent: 'bg-emerald-500'
    },
    { 
      id: 'warm-paper', 
      name: 'Warm Paper', 
      desc: 'Éditorial élégant & teinte crème chaleureuse',
      sampleBg: 'bg-[#f4f1ea]',
      sampleBorder: 'border-[#d6d0c4]',
      sampleText: 'text-[#1a1714]',
      accent: 'bg-[#f97316]'
    },
    { 
      id: 'cyberpunk', 
      name: 'Cyberpunk', 
      desc: 'Néon jaune électrique & contraste brutal',
      sampleBg: 'bg-[#060608]',
      sampleBorder: 'border-yellow-400',
      sampleText: 'text-yellow-300',
      accent: 'bg-yellow-400'
    },
    { 
      id: 'glassmorphism', 
      name: 'Glassmorphism', 
      desc: 'Verre dépoli & reflets translucides profonds',
      sampleBg: 'bg-[#090d16]',
      sampleBorder: 'border-white/20',
      sampleText: 'text-white',
      accent: 'bg-sky-400'
    },
  ];

  const contrastOptions: { id: ContrastLevel; label: string; sub: string; desc: string }[] = [
    { 
      id: 'low', 
      label: 'Faible', 
      sub: 'Low Contrast',
      desc: 'Bordures douces et transitions pastel apaisantes pour les yeux.' 
    },
    { 
      id: 'medium', 
      label: 'Standard', 
      sub: 'Balanced',
      desc: 'Équilibre optique parfait certifié pour une lisibilité quotidienne.' 
    },
    { 
      id: 'high', 
      label: 'Élevé', 
      sub: 'High Contrast',
      desc: 'Lignes acérées, contrastes d\'encre maximisés et badges nets.' 
    },
  ];

  const filteredMembers = teamMembers.filter(m => {
    const matchesRole = filterRole === 'all' || m.role === filterRole;
    const matchesQuery = !searchMemberQuery || m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) || m.email.toLowerCase().includes(searchMemberQuery.toLowerCase()) || m.department.toLowerCase().includes(searchMemberQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-100 theme-transition overflow-hidden relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="absolute top-16 left-4 right-4 z-50 p-3 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="truncate flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 5-Button Segmented Navigation Bar */}
      <div className="p-2 sm:p-2.5 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-30 shrink-0 theme-transition">
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-2xl">
          {/* 4 Primary Navigation Tabs */}
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
                    layoutId="activeSettingsTopPill"
                    className="absolute inset-0 bg-slate-800/95 border border-slate-700/60 rounded-xl -z-0 shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}

                {/* Badge */}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute top-0.5 right-1 z-20 min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full text-[8px] font-black leading-none shadow-xs whitespace-nowrap border border-slate-950/20 ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                <div className="relative z-10 flex flex-col items-center w-full">
                  <Icon size={14} className={`mb-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[9.5px] leading-tight truncate w-full text-center px-0.5">
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}

          {/* 5th Menu Button: Expandable Dropdown Trigger */}
          <button
            onClick={() => {
              haptics.trigger('light');
              setIsMenuExpanded(prev => !prev);
            }}
            title={isMenuExpanded ? "Réduire les menus" : "Étendre pour voir plus de réglages"}
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
              <span className="text-[9.5px] leading-tight truncate w-full text-center px-0.5 font-medium">
                {isExtendedTabActive && activeExtendedTabObj ? activeExtendedTabObj.label.split(' ')[0] : 'Étendre'}
              </span>
            </div>
          </button>
        </div>

        {/* Animated Downward Expansion Drawer for Extended Sub-menus */}
        <AnimatePresence>
          {isMenuExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="overflow-hidden bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 shadow-2xl theme-transition"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 px-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <SlidersHorizontal size={13} className="text-emerald-400" />
                  <span>Tous les réglages du système</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {EXTENDED_TABS.length} rubriques
                </span>
              </div>

              {/* Grid of Extended Settings Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {EXTENDED_TABS.map((tab) => {
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
                          <span className="text-[11px] font-semibold truncate leading-tight">
                            {tab.label}
                          </span>
                          {tab.badge && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 truncate leading-normal mt-0.5">
                          {tab.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* ========================================================== */}
          {/* TAB 1: HÉBERGEMENT & MULTI-TENANT (SUPABASE) */}
          {/* ========================================================== */}
          {activeTab === 'tenant' && (
            <motion.div
              key="tenant"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Hébergement & Multi-Tenant Supabase"
                subtitle="Partitionnement de données, politiques RLS strictes et clusters cloud"
                badge={activeTenant.name}
                icon={Database}
                kpis={[
                  { label: 'Tenant Actif', value: activeTenant.slug, sub: activeTenant.regionFlag + ' ' + activeTenant.region.split(' ')[0] },
                  { label: 'Supabase Status', value: `${supabaseConfig.latencyMs}ms`, sub: '100% Connecté', trend: 'up' },
                  { label: 'Tables Protégées', value: `${supabaseConfig.tablesCount}`, sub: 'Isolation RLS', trend: 'up' }
                ]}
                actions={
                  <button
                    onClick={handlePingSupabase}
                    disabled={isPingingSupabase}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Gauge size={12} className={isPingingSupabase ? "animate-spin text-emerald-400" : "text-slate-400"} />
                    <span>{isPingingSupabase ? 'Test...' : 'Tester Latence'}</span>
                  </button>
                }
              >
                {/* Active Tenant Switcher */}
                <DetailCard 
                  title="Sélecteur de Tenant Actif" 
                  subtitle="Basculez instantanément le contexte de données et les permissions de schéma"
                  icon={Database}
                >
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {tenants.map((t) => {
                        const isCurrent = activeTenant.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              haptics.trigger('selection');
                              setSelectedTenantDrawer(t);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-base">{t.regionFlag}</span>
                                  <span className="text-xs font-bold text-slate-100">{t.name}</span>
                                </div>
                                {isCurrent ? (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 uppercase tracking-wider">
                                    Actif
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                    Détails
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                {t.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-mono text-slate-300">{t.tablesCount} tables</span>
                              <span className="font-mono text-emerald-400">{t.storageUsage}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSwitchTenant(t.id);
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  isCurrent
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                }`}
                              >
                                {isCurrent ? 'Sélectionné' : 'Activer'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DetailCard>

                {/* Supabase Backend Cluster Card */}
                <DetailCard
                  title="Connexion Cluster Supabase"
                  subtitle="Statut de l'instance PostgreSQL managée et passerelle GoTrue"
                  icon={Server}
                  isInteractive
                  onClick={() => {
                    haptics.trigger('light');
                    setSelectedGenericDrawer({
                      title: 'Supabase Backend Telemetry',
                      subtitle: 'Architecture cluster cloud, pool de connexions et passerelle API',
                      badge: 'PostgreSQL 16.2',
                      icon: Server,
                      kpis: [
                        { label: 'URL Passerelle', value: 'supabase.co', sub: 'TLS 1.3 / HTTP3' },
                        { label: 'Pool Connections', value: `${supabaseConfig.poolSize}/${supabaseConfig.maxConnections}`, sub: 'PgBouncer Actif' },
                        { label: 'Realtime Channels', value: '3 Actifs', sub: 'WebSocket WSS', trend: 'up' },
                        { label: 'Auth Provider', value: 'GoTrue', sub: 'FIDO2 Passkeys' }
                      ],
                      aiInsight: {
                        title: 'Optimisation Supabase Coach AI',
                        content: 'Le cluster Supabase fonctionne avec un taux de cache-hit de 99.4%. Les politiques RLS sont compilées nativement par PostgreSQL sans surcoût de latence.',
                        actionLabel: 'Tester le débit de réplication',
                        onAction: () => showToast('Test de débit : 1,420 rps validé sans latence résiduelle')
                      },
                      tabs: [
                        {
                          id: 'overview',
                          label: 'Connexion',
                          content: (
                            <div className="space-y-3 text-xs">
                              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 font-mono space-y-1.5">
                                <div className="flex justify-between"><span className="text-slate-400">Endpoint:</span><span className="text-emerald-400">{supabaseConfig.url}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Anon Key:</span><span className="text-slate-300">{supabaseConfig.anonKey.slice(0, 24)}...</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Service Role:</span><span className="text-amber-400">{supabaseConfig.serviceRoleKeyMasked}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Moteur DB:</span><span className="text-slate-200">{supabaseConfig.dbVersion}</span></div>
                              </div>
                            </div>
                          )
                        },
                        {
                          id: 'security',
                          label: 'RLS Rules',
                          content: (
                            <div className="space-y-2 text-xs">
                              {rlsRules.map(rule => (
                                <div key={rule.id} className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-200">{rule.tableName}</span>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">{rule.command}</span>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400">{rule.usingExpression}</div>
                                </div>
                              ))}
                            </div>
                          )
                        }
                      ]
                    });
                  }}
                >
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-slate-200 font-mono">{supabaseConfig.url}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          PostgreSQL 16.2 • Pool: {supabaseConfig.poolSize}/{supabaseConfig.maxConnections} • Auth: GoTrue + Passkeys
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          {supabaseConfig.latencyMs} ms
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-1 rounded-xl border border-slate-700">
                          {supabaseConfig.activeRLSStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </DetailCard>

                {/* Schema Migration Runner */}
                <DetailCard
                  title="Gestionnaire de Migrations & DDL"
                  subtitle="Historique des schémas SQL appliqués et simulateur d'évolution"
                  icon={Code}
                  actions={
                    <button
                      onClick={() => {
                        haptics.trigger('light');
                        setIsNewMigrationModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play size={11} strokeWidth={2.5} />
                      <span>Nouvelle Migration</span>
                    </button>
                  }
                >
                  <div className="space-y-2 pt-1">
                    {migrations.map((mig) => (
                      <div
                        key={mig.id}
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedMigrationDrawer(mig);
                        }}
                        className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                            <FileCode size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-200 truncate font-mono">
                              {mig.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{mig.appliedAt}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-mono">{mig.executionTimeMs} ms</span>
                              <span>•</span>
                              <span>{mig.tablesAffected.length} tables</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            Appliquée
                          </span>
                          <ChevronRight size={14} className="text-slate-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailCard>

                {/* RLS Guarded Policies & Data Backup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* RLS Security Guard */}
                  <DetailCard
                    title="Sécurité RLS Multi-Tenant"
                    subtitle="Isolation granulaire par requête"
                    icon={ShieldAlert}
                  >
                    <div className="space-y-3 pt-1">
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Chaque requête SQL injecte le JWT <code className="text-emerald-400 font-mono">current_tenant_id()</code> pour garantir qu'aucun client ne peut accéder aux enregistrements d'un autre tenant.
                      </p>
                      <button
                        onClick={handleVerifyRLS}
                        disabled={isVerifyingRLS}
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <ShieldCheck size={14} className={isVerifyingRLS ? "animate-spin text-emerald-400" : "text-emerald-400"} />
                        <span>{isVerifyingRLS ? 'Vérification...' : 'Vérifier Règles RLS (100%)'}</span>
                      </button>
                    </div>
                  </DetailCard>

                  {/* Backup & Export */}
                  <DetailCard
                    title="Sauvegarde & Export Tenant"
                    subtitle="Dump SQL ou Archive JSON"
                    icon={Download}
                  >
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => handleDownloadSQLDump(activeTenant.id)}
                        className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Download size={14} strokeWidth={2.5} />
                        <span>Télécharger Dump SQL ({activeTenant.slug})</span>
                      </button>
                      <button
                        onClick={() => handleDownloadJSONDump(activeTenant.id)}
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <HardDrive size={14} className="text-slate-400" />
                        <span>Exporter Archive JSON Complète</span>
                      </button>
                    </div>
                  </DetailCard>
                </div>

                <AIInsightCard
                  title="Architecture Multi-Tenant Coach AI"
                  content={`L'instance [${activeTenant.name}] applique un schéma dédié "${activeTenant.schema}" couplé aux politiques Row Level Security. L'isolation cryptographique garantit la conformité SOC2 et GDPR sans overhead mémoire.`}
                  actionLabel="Lancer un diagnostic d'isolation"
                  onAction={() => showToast('Diagnostic terminé : Aucune fuite inter-tenant détectée')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: RÔLES & PERMISSIONS (RBAC) */}
          {/* ========================================================== */}
          {activeTab === 'rbac' && (
            <motion.div
              key="rbac"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Rôles & Permissions RBAC"
                subtitle="Matrice d'accès granulaire sur les 18 applications et gouvernance d'équipe"
                badge={`Rôle Actif : ${roles.find(r => r.id === activeRoleId)?.name}`}
                icon={ShieldCheck}
                kpis={[
                  { label: 'Rôle Sélectionné', value: roles.find(r => r.id === activeRoleId)?.name || '', sub: 'Privilèges actifs' },
                  { label: 'Modules Couverts', value: '18 / 18 Apps', sub: 'Matrice synchrone', trend: 'up' },
                  { label: 'Membres Équipe', value: `${teamMembers.length} Utilisateurs`, sub: `${activeTenant.name}` }
                ]}
                actions={
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setIsInviteModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserPlus size={12} strokeWidth={2.5} />
                    <span>Inviter</span>
                  </button>
                }
              >
                {/* Active Role Switcher */}
                <DetailCard
                  title="Sélecteur de Rôle RBAC"
                  subtitle="Sélectionnez un rôle pour inspecter sa matrice de droits en direct"
                  icon={Shield}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {roles.map((r) => {
                      const isCurrent = activeRoleId === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            haptics.trigger('selection');
                            setSelectedRoleDrawer(r);
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-100">{r.name}</span>
                              {isCurrent && <CheckCircle2 size={13} className="text-emerald-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mb-2">
                              {r.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-slate-400">{r.usersCount} pers.</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwitchRole(r.id);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                                isCurrent
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {isCurrent ? 'Actif' : 'Choisir'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DetailCard>

                {/* Live Permission Matrix Across All 18 Apps */}
                <DetailCard
                  title={`Matrice de Permissions : ${roles.find(r => r.id === activeRoleId)?.name}`}
                  subtitle="Droits de Lecture (R), Écriture (W), Suppression (D) et Administration (A)"
                  icon={SlidersHorizontal}
                >
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <span className="col-span-6">Application / Module</span>
                      <span className="col-span-6 grid grid-cols-4 text-center">
                        <span>Read</span>
                        <span>Write</span>
                        <span>Del</span>
                        <span>Admin</span>
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
                      {permissionsMatrix.map((perm) => (
                        <div
                          key={perm.appId}
                          onClick={() => {
                            haptics.trigger('selection');
                            setSelectedAppPermissionDrawer(perm);
                          }}
                          className="grid grid-cols-12 items-center px-3 py-2 text-xs hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="col-span-6 flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-semibold text-slate-200 truncate">{perm.appName}</span>
                            <span className="text-[9px] text-slate-500 font-mono shrink-0 hidden sm:inline">
                              ({perm.category})
                            </span>
                          </div>

                          <div className="col-span-6 grid grid-cols-4 text-center">
                            <div className="flex justify-center">
                              {perm.read ? <Check size={13} className="text-emerald-400" strokeWidth={3} /> : <span className="text-slate-600 font-bold">-</span>}
                            </div>
                            <div className="flex justify-center">
                              {perm.write ? <Check size={13} className="text-emerald-400" strokeWidth={3} /> : <span className="text-slate-600 font-bold">-</span>}
                            </div>
                            <div className="flex justify-center">
                              {perm.delete ? <Check size={13} className="text-rose-400" strokeWidth={3} /> : <span className="text-slate-600 font-bold">-</span>}
                            </div>
                            <div className="flex justify-center">
                              {perm.admin ? <Check size={13} className="text-sky-400" strokeWidth={3} /> : <span className="text-slate-600 font-bold">-</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DetailCard>

                {/* Team Member Role Assignment Simulator */}
                <DetailCard
                  title="Gestion & Affectation des Collaborateurs"
                  subtitle="Attribution des rôles et statuts d'accès dans le tenant"
                  icon={Users}
                  actions={
                    <div className="flex items-center gap-2">
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="all">Tous les rôles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employé</option>
                        <option value="client">Client</option>
                        <option value="visitor">Visiteur</option>
                      </select>
                    </div>
                  }
                >
                  <div className="space-y-3 pt-1">
                    {/* Search bar */}
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un membre par nom, email ou département..."
                        value={searchMemberQuery}
                        onChange={(e) => setSearchMemberQuery(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Members List */}
                    <div className="space-y-1.5">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => {
                            haptics.trigger('selection');
                            setSelectedMemberDrawer(member);
                          }}
                          className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-100 truncate">{member.name}</span>
                                {member.twoFactorEnabled && (
                                  <span title="2FA Actif">
                                    <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{member.email} • {member.department}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              member.role === 'admin' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                              member.role === 'employee' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                              member.role === 'client' ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' :
                              'bg-slate-700/40 text-slate-300 border-slate-600'
                            }`}>
                              {roles.find(r => r.id === member.role)?.name}
                            </span>
                            <ChevronRight size={14} className="text-slate-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Gouvernance RBAC & Moindre Privilège"
                  content="Le rôle [Employé] dispose des droits d'écriture sur les applications CRM et Finance mais est automatiquement restreint sur la suppression des bases et la modification des clés de chiffrement."
                  actionLabel="Auditer la conformité des privilèges"
                  onAction={() => showToast('Audit RBAC validé : 100% conforme au principe du moindre privilège')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: DISPLAY & BRIGHTNESS */}
          {/* ========================================================== */}
          {activeTab === 'display' && (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Affichage & Calibration Visuelle"
                subtitle="Contraste global dynamique et luminosité de l'écran"
                badge={`Contraste ${contrast.toUpperCase()}`}
                icon={SunMedium}
                kpis={[
                  { label: 'Luminosité Écran', value: `${brightness}%`, sub: 'Rétroéclairage' },
                  { label: 'Ratio Contraste', value: contrast === 'high' ? '21:1' : contrast === 'medium' ? '12:1' : '7:1', sub: 'WCAG AAA', trend: 'up' },
                  { label: 'Mode Matériel', value: 'Auto-Calibré', sub: 'Fluidité 120Hz' }
                ]}
              >
                {/* Contrast Ratio Selector */}
                <DetailCard title="Ratio de Contraste Global" icon={Contrast}>
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
                      {contrastOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            haptics.trigger('selection');
                            setContrast(opt.id);
                            showToast(`Contraste ajusté sur [${opt.label}]`);
                          }}
                          className={`py-3 px-2 rounded-xl text-center transition-all ${
                            contrast === opt.id
                              ? 'bg-slate-800 border border-emerald-500/60 shadow-md text-slate-100 font-semibold'
                              : 'text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="text-xs">{opt.label}</div>
                          <div className="text-[10px] opacity-60 font-normal">{opt.sub}</div>
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed px-1">
                      {contrastOptions.find(o => o.id === contrast)?.desc}
                    </p>
                  </div>
                </DetailCard>

                {/* Screen Brightness Slider */}
                <DetailCard title="Luminosité de l'écran" icon={SunMedium}>
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-300">Intensité Lumineuse</span>
                      <span className="text-slate-200 font-mono font-semibold">{brightness}%</span>
                    </div>
                    
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-800"
                    />
                    
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Économie d'énergie</span>
                      <span>Clarté Maximale</span>
                    </div>
                  </div>
                </DetailCard>

                <AIInsightCard
                  title="Optimisation Visuelle Coach AI"
                  content="Le contraste dynamique est synchronisé avec les variables CSS globales pour une lisibilité parfaite de jour comme de nuit sans fatigue oculaire."
                  actionLabel="Vérifier la conformité d'accessibilité"
                  onAction={() => showToast('Conformité WCAG AAA validée sur l\'ensemble des modules')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: THEMES */}
          {/* ========================================================== */}
          {activeTab === 'themes' && (
            <motion.div
              key="themes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Moteur de Thèmes UI/UX Pro Max"
                subtitle="Harmonie visuelle, contrastes calibrés et 16 styles d'interface professionnelle"
                icon={Palette}
                badge={`${UI_UX_PRO_MAX_THEMES.length} Thèmes Disponibles`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {UI_UX_PRO_MAX_THEMES.map((t) => (
                    <DetailCard
                      key={t.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setTheme(t.id);
                        showToast(`Thème système appliqué : ${t.name}`);
                      }}
                      isInteractive
                      title={t.name}
                      badge={theme === t.id ? 'Actif' : t.badge || 'Sélectionner'}
                      badgeColor={theme === t.id ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'}
                      icon={Palette}
                      subtitle={t.subtitle}
                    >
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <div className="flex items-center gap-1">
                            {t.palette.map((c, i) => (
                              <span 
                                key={i} 
                                className="w-3 h-3 rounded-full border border-black/30 shadow-xs" 
                                style={{ backgroundColor: c }} 
                              />
                            ))}
                          </div>
                          <span className="text-[9.5px] font-mono text-slate-500">
                            {t.id}
                          </span>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: WALLPAPERS */}
          {/* ========================================================== */}
          {activeTab === 'wallpapers' && (
            <motion.div
              key="wallpapers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Fonds d'écran & Matériaux Translucides"
                subtitle="Transparence dynamique et flou d'arrière-plan"
                icon={ImageIcon}
                badge="6 Fonds Disponibles"
              >
                <div className="grid grid-cols-2 gap-3">
                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setWallpaper(wp.id);
                        showToast(`Fond d'écran configuré : ${wp.name}`);
                      }}
                      className={`group relative flex flex-col p-3 rounded-3xl border transition-all text-left overflow-hidden ${
                        wallpaper === wp.id
                          ? 'bg-slate-900/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-full h-24 rounded-2xl bg-gradient-to-br ${wp.previewGradient} border border-slate-800 mb-3 relative overflow-hidden shadow-inner flex items-center justify-center`}>
                        <div className="w-8 h-8 rounded-xl bg-slate-950/60 backdrop-blur border border-white/20 flex items-center justify-center">
                          <Layers size={14} className="text-white" />
                        </div>
                        
                        {wallpaper === wp.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow font-bold">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="font-medium text-slate-200 text-xs mb-0.5">{wp.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{wp.desc}</div>
                    </button>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: SYSTEM */}
          {/* ========================================================== */}
          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Gestion de l'Énergie & Batterie"
                subtitle="Contrôle automatique du throttling des synchronisations d'arrière-plan"
                icon={Zap}
                badge={power.isLowPowerMode ? "Mode Eco Actif" : "Normal"}
              >
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Zap size={14} className={power.isLowPowerMode ? "text-amber-400 fill-amber-400" : "text-slate-400"} />
                        <span>Mode Économie d'Énergie</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                        Réduit la fréquence de synchronisation des modules OMK (5s → 30s) pour préserver la batterie.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        power.toggleLowPowerMode();
                        showToast(power.isLowPowerMode ? 'Mode Eco désactivé' : 'Mode Eco activé (sync 30s)');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        power.isLowPowerMode
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {power.isLowPowerMode ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Batterie: <strong className="text-slate-200 font-mono">{power.batteryLevel}% {power.isCharging ? '(En charge)' : ''}</strong></span>
                    <span>Intervalle sync: <strong className="text-emerald-400 font-mono">{power.syncIntervalMs / 1000}s</strong></span>
                  </div>
                </div>
              </DetailSection>

              {/* IndexedDB Cache */}
              <DetailSection
                title="Cache Hors-ligne IndexedDB"
                subtitle="Stockage local haute performance pour fonctionnement sans connexion"
                icon={Database}
                badge="localForage"
              >
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <HardDrive size={14} className="text-emerald-400" />
                        <span>Cache AppViewer Local</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                        Données des modules pré-chargées dans IndexedDB pour une réactivité instantanée.
                      </p>
                    </div>

                    <button
                      onClick={handleClearCache}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw size={12} />
                      <span>Recharger Cache</span>
                    </button>
                  </div>
                </div>
              </DetailSection>

              {/* System info */}
              <DetailSection
                title="Informations Système & Noyau"
                subtitle="Spécifications techniques de la couche runtime OMK OS"
                icon={ShieldCheck}
                badge="v4.2 Pro"
              >
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 divide-y divide-slate-800 overflow-hidden text-xs">
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-slate-400">Workspace Actif</span>
                    <span className="font-medium text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                      {workspace}
                    </span>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-slate-400">Moteur de Thème</span>
                    <span className="font-mono text-slate-200">CSS Tokens v4 + Backdrop Blur</span>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-slate-400">Sécurité & Isolation Sandbox</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck size={14} /> Isolée & Conforme
                    </span>
                  </div>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: NOTIFICATIONS */}
          {/* ========================================================== */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Notifications & Retours Sensoriels"
                subtitle="Configuration du moteur haptique, alertes et sons d'interface"
                badge="Sons & Haptique"
                icon={Bell}
              >
                {/* Haptics Intensity */}
                <DetailCard title="Intensité du Retour Haptique" icon={Smartphone}>
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
                      {(['off', 'light', 'medium', 'heavy'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setHapticIntensity(level);
                            if (level !== 'off') haptics.trigger(level === 'heavy' ? 'success' : level);
                            showToast(`Retour haptique réglé sur [${level}]`);
                          }}
                          className={`py-2 px-1 rounded-xl text-center capitalize text-xs font-semibold transition-all ${
                            hapticIntensity === level
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {level === 'off' ? 'Désactivé' : level === 'light' ? 'Léger' : level === 'medium' ? 'Standard' : 'Fort'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Simule des vibrations physiques subtiles lors des frappes au clavier, swipes et basculements de menus.
                    </p>
                  </div>
                </DetailCard>

                {/* Sounds & DND */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        {soundEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-slate-500" />}
                        <span>Sons du Système</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Effets audio d'alertes & clics</p>
                    </div>
                    <button
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        haptics.trigger('light');
                        showToast(soundEnabled ? 'Sons du système désactivés' : 'Sons du système activés');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        soundEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {soundEnabled ? 'Actif' : 'Muet'}
                    </button>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Radio size={15} className={dndEnabled ? "text-amber-400" : "text-slate-400"} />
                        <span>Ne pas déranger</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Silencie toutes les bannières</p>
                    </div>
                    <button
                      onClick={() => {
                        setDndEnabled(!dndEnabled);
                        haptics.trigger('light');
                        showToast(dndEnabled ? 'Mode Ne pas déranger désactivé' : 'Mode Ne pas déranger activé');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        dndEnabled ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {dndEnabled ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: SECURITY */}
          {/* ========================================================== */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Sécurité, Biométrie & Sandbox"
                subtitle="Chiffrement des applications et contrôle granulaire d'accès"
                badge="Niveau Entreprise"
                icon={Lock}
              >
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 divide-y divide-slate-800 overflow-hidden text-xs">
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Fingerprint size={16} className="text-emerald-400" />
                      <div>
                        <div className="font-semibold text-slate-200">Verrouillage Biométrique</div>
                        <div className="text-[10px] text-slate-400">Empreinte Touch ID / Face Recognition</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setBiometricEnabled(!biometricEnabled);
                        haptics.trigger('light');
                        showToast(biometricEnabled ? 'Biométrie désactivée' : 'Biométrie activée');
                      }}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${
                        biometricEnabled ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {biometricEnabled ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>

                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Key size={16} className="text-sky-400" />
                      <div>
                        <div className="font-semibold text-slate-200">Délai avant Verrouillage</div>
                        <div className="text-[10px] text-slate-400">Verrouille automatiquement après inactivité</div>
                      </div>
                    </div>
                    <select
                      value={screenTimeout}
                      onChange={(e) => {
                        setScreenTimeout(e.target.value);
                        showToast(`Délai de veille réglé sur ${e.target.value}`);
                      }}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none"
                    >
                      <option value="30s">30 secondes</option>
                      <option value="1min">1 minute</option>
                      <option value="2min">2 minutes</option>
                      <option value="5min">5 minutes</option>
                      <option value="never">Jamais</option>
                    </select>
                  </div>

                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <div>
                        <div className="font-semibold text-slate-200">Chiffrement IndexedDB Local</div>
                        <div className="text-[10px] text-slate-400">AES-GCM 256-bit matériel</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ACTIF
                    </span>
                  </div>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: NETWORK */}
          {/* ========================================================== */}
          {activeTab === 'network' && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Réseau, Synchronisation & EventBus"
                subtitle="Canaux WebSocket temps réel et passerelles de données"
                badge="5G Connecté"
                icon={Wifi}
                kpis={[
                  { label: 'Latence Passerelle', value: pingSpeed !== null ? `${pingSpeed} ms` : '--', sub: 'EventBus WebSocket' },
                  { label: 'Protocole', value: 'HTTP/3 + WSS', sub: 'Chiffrement TLS 1.3' },
                  { label: 'Mode Réseau', value: cloudSyncEnabled ? 'Cloud Sync' : 'Hors-Ligne', sub: 'Mode Hybride' }
                ]}
              >
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Wifi size={14} className="text-emerald-400" />
                        <span>Synchronisation Cloud en Arrière-plan</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                        Maintient à jour les bases de données et les flux d'activités entre appareils.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCloudSyncEnabled(!cloudSyncEnabled);
                        haptics.trigger('light');
                        showToast(cloudSyncEnabled ? 'Synchronisation suspendue' : 'Synchronisation reprise');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        cloudSyncEnabled ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {cloudSyncEnabled ? 'Connecté' : 'Suspendu'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">Test de Bande Passante & Ping</span>
                    <button
                      onClick={testPing}
                      disabled={isTestingPing}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                    >
                      <Gauge size={12} className={isTestingPing ? "animate-spin text-emerald-400" : "text-slate-400"} />
                      <span>{isTestingPing ? 'Calcul...' : 'Tester Ping'}</span>
                    </button>
                  </div>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: AI SETTINGS */}
          {/* ========================================================== */}
          {activeTab === 'ai_settings' && (
            <motion.div
              key="ai_settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Moteur d'Intelligence Artificielle"
                subtitle="Modèles Gemini, agent autonome et suggestions proactives"
                badge="Gemini 2.5 Flash"
                icon={Bot}
              >
                {/* AI Model Selection */}
                <DetailCard title="Modèle de Raisonnement Actif" icon={Sparkles}>
                  <div className="space-y-2 pt-1">
                    {[
                      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Ultra-rapide, idéal pour l\'assistance en direct et commandes vocales' },
                      { id: 'gemini-pro', name: 'Gemini Pro Enterprise', desc: 'Raisonnement approfondi, synthèse financière et juridique complexe' },
                      { id: 'antigravity-agent', name: 'Agent Autonome DeepMind', desc: 'Exécution d\'actions multi-modules et automatisation de workflows' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setAiModel(m.id);
                          haptics.trigger('light');
                          showToast(`Modèle IA sélectionné : ${m.name}`);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          aiModel === m.id
                            ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold ${aiModel === m.id ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {m.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                        </div>
                        {aiModel === m.id && <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </DetailCard>

                {/* AI Creativity */}
                <DetailCard title="Température & Créativité IA" icon={Sliders}>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-300">Température d'inférence</span>
                      <span className="text-slate-200 font-mono font-semibold">{aiCreativity.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={aiCreativity}
                      onChange={(e) => setAiCreativity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-800"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Précis & Déterministe</span>
                      <span>Créatif & Exploratoire</span>
                    </div>
                  </div>
                </DetailCard>

                {/* Dynamic Island Proactive AI */}
                <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Suggestions Dynamic Island</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Affiche les insights contextuels en haut d'écran</p>
                  </div>
                  <button
                    onClick={() => {
                      setAiProactiveIsland(!aiProactiveIsland);
                      haptics.trigger('light');
                      showToast(aiProactiveIsland ? 'Dynamic Island Proactive désactivée' : 'Dynamic Island Proactive activée');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      aiProactiveIsland ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {aiProactiveIsland ? 'Actif' : 'Désactivé'}
                  </button>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: STORAGE */}
          {/* ========================================================== */}
          {activeTab === 'storage' && (
            <motion.div
              key="storage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Stockage, Sauvegardes & Export"
                subtitle="Statistiques mémoire et gestionnaire d'exportation de configuration"
                badge="IndexedDB Local"
                icon={HardDrive}
                kpis={[
                  { label: 'Espace Alloué', value: '512 MB', sub: 'Quota IndexedDB' },
                  { label: 'Utilisé', value: '4.8 MB', sub: 'Caches & Modèles' },
                  { label: 'Statut Intégrité', value: '100% Sain', sub: 'Index Vérifié' }
                ]}
              >
                {/* Export Config */}
                <DetailCard title="Exportation & Sauvegarde JSON" icon={Download}>
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Téléchargez un fichier de sauvegarde contenant l'ensemble de vos thèmes, personnalisations, raccourcis et configurations du système OMK.
                    </p>
                    <button
                      onClick={handleExportConfig}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                    >
                      <Download size={15} strokeWidth={2.5} />
                      <span>Exporter la Configuration (.json)</span>
                    </button>
                  </div>
                </DetailCard>

                {/* Clear Cache */}
                <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <RefreshCw size={14} className="text-amber-400" />
                      <span>Nettoyage des Caches Temporaires</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Libère l'espace mémoire sans supprimer vos données</p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
                  >
                    Purger
                  </button>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* EXTENDED TAB: ACCESSIBILITY */}
          {/* ========================================================== */}
          {activeTab === 'accessibility' && (
            <motion.div
              key="accessibility"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <DetailSection
                title="Accessibilité & Confort Visuel"
                subtitle="Réglages ergonomiques, réduction des animations et lisibilité"
                badge="Norme WCAG AA"
                icon={Sliders}
              >
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 divide-y divide-slate-800 overflow-hidden text-xs">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-200">Réduire les Animations</div>
                      <div className="text-[10px] text-slate-400">Privilégie les transitions instantanées</div>
                    </div>
                    <button
                      onClick={() => {
                        setReduceMotion(!reduceMotion);
                        haptics.trigger('light');
                        showToast(reduceMotion ? 'Animations système activées' : 'Animations réduites');
                      }}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${
                        reduceMotion ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {reduceMotion ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>

                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-200">Taille de Police Globale</div>
                      <div className="text-[10px] text-slate-400">Échelle typographique du système</div>
                    </div>
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['compact', 'normal', 'large'] as const).map((scale) => (
                        <button
                          key={scale}
                          onClick={() => {
                            setFontSizeScale(scale);
                            haptics.trigger('light');
                            showToast(`Taille de police : ${scale}`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                            fontSizeScale === scale
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {scale === 'compact' ? 'Compact' : scale === 'normal' ? 'Standard' : 'Grand'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================== */}
      {/* DETAIL DRAWERS FOR ENTERPRISE INSPECTION */}
      {/* ========================================================== */}

      {/* 1. TENANT DETAIL DRAWER */}
      {selectedTenantDrawer && (
        <DetailDrawer
          isOpen={!!selectedTenantDrawer}
          onClose={() => setSelectedTenantDrawer(null)}
          title={selectedTenantDrawer.name}
          subtitle={`Région : ${selectedTenantDrawer.region} • Plan : ${selectedTenantDrawer.plan}`}
          badge={selectedTenantDrawer.rlsStatus}
          icon={Database}
          breadcrumbs={[
            { label: 'Multi-Tenant', onClick: () => setSelectedTenantDrawer(null) },
            { label: selectedTenantDrawer.name }
          ]}
          actions={[
            {
              id: 'activate',
              label: activeTenant.id === selectedTenantDrawer.id ? 'Tenant Déjà Actif' : 'Activer ce Tenant',
              icon: Check,
              variant: 'primary',
              onClick: () => {
                handleSwitchTenant(selectedTenantDrawer.id);
                setSelectedTenantDrawer(null);
              }
            },
            {
              id: 'sql',
              label: 'Dump SQL',
              icon: Download,
              variant: 'default',
              onClick: () => handleDownloadSQLDump(selectedTenantDrawer.id)
            }
          ]}
          kpis={[
            { label: 'Utilisateurs', value: selectedTenantDrawer.usersCount, sub: 'Comptes actifs' },
            { label: 'Stockage', value: selectedTenantDrawer.storageUsage, sub: `Quota ${selectedTenantDrawer.storageLimit}` },
            { label: 'Latence', value: `${selectedTenantDrawer.latencyMs} ms`, sub: 'Passerelle API', trend: 'up' },
            { label: 'Tables Protégées', value: selectedTenantDrawer.tablesCount, sub: 'RLS Strict' }
          ]}
          aiInsight={{
            title: `Audit Tenant [${selectedTenantDrawer.slug}]`,
            content: `Le schéma PostgreSQL "${selectedTenantDrawer.schema}" est totalement isolé avec des politiques RLS actives. Les sauvegardes quotidiennes sont synchronisées avec le cluster ${selectedTenantDrawer.region}.`,
            actionLabel: 'Télécharger le rapport de conformité',
            onAction: () => showToast(`Rapport de conformité pour ${selectedTenantDrawer.name} généré`)
          }}
          tabs={[
            {
              id: 'specifications',
              label: 'Spécifications',
              content: (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between"><span className="text-slate-400">Slug Unique:</span><span className="font-mono text-emerald-400">{selectedTenantDrawer.slug}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Database Cluster:</span><span className="font-mono text-slate-200">{selectedTenantDrawer.database}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Schéma SQL:</span><span className="font-mono text-sky-400">{selectedTenantDrawer.schema}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Domaine Personnalisé:</span><span className="font-mono text-slate-300">{selectedTenantDrawer.customDomain}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Contact Principal:</span><span className="text-slate-300">{selectedTenantDrawer.primaryContact}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Date de Création:</span><span className="text-slate-300">{selectedTenantDrawer.createdAt}</span></div>
                  </div>
                </div>
              )
            },
            {
              id: 'backups',
              label: 'Sauvegardes',
              content: (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Sauvegarde Snapshot Quotidienne</div>
                      <div className="text-[10px] text-slate-400">{selectedTenantDrawer.backupStatus}</div>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Valide</span>
                  </div>
                  <button
                    onClick={() => handleDownloadJSONDump(selectedTenantDrawer.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Télécharger Archive Complète (.json)</span>
                  </button>
                </div>
              )
            }
          ]}
        />
      )}

      {/* 2. MIGRATION DETAIL DRAWER */}
      {selectedMigrationDrawer && (
        <DetailDrawer
          isOpen={!!selectedMigrationDrawer}
          onClose={() => setSelectedMigrationDrawer(null)}
          title={selectedMigrationDrawer.name}
          subtitle={`Appliquée le ${selectedMigrationDrawer.appliedAt}`}
          badge={selectedMigrationDrawer.status.toUpperCase()}
          icon={FileCode}
          breadcrumbs={[
            { label: 'Migrations', onClick: () => setSelectedMigrationDrawer(null) },
            { label: selectedMigrationDrawer.name }
          ]}
          actions={[
            {
              id: 'copy',
              label: 'Copier DDL',
              icon: Copy,
              variant: 'default',
              onClick: () => {
                navigator.clipboard.writeText(selectedMigrationDrawer.ddl);
                showToast('DDL SQL copié dans le presse-papier');
              }
            }
          ]}
          kpis={[
            { label: 'Temps Exécution', value: `${selectedMigrationDrawer.executionTimeMs} ms`, sub: 'PostgreSQL Engine' },
            { label: 'Tables Modifiées', value: selectedMigrationDrawer.tablesAffected.length, sub: 'Impact schéma' },
            { label: 'Règles RLS', value: selectedMigrationDrawer.rlsPoliciesEnforced.length, sub: 'Politiques créées' },
            { label: 'Checksum', value: selectedMigrationDrawer.checksum.slice(0, 10), sub: 'SHA-256' }
          ]}
          tabs={[
            {
              id: 'ddl',
              label: 'Code SQL DDL',
              content: (
                <pre className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedMigrationDrawer.ddl}
                </pre>
              )
            },
            {
              id: 'impact',
              label: 'Tables & RLS',
              content: (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-300 mb-1">Tables Impactées :</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMigrationDrawer.tablesAffected.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-300 mb-1">Politiques RLS Enforcées :</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMigrationDrawer.rlsPoliciesEnforced.map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      )}

      {/* 3. RBAC ROLE DETAIL DRAWER */}
      {selectedRoleDrawer && (
        <DetailDrawer
          isOpen={!!selectedRoleDrawer}
          onClose={() => setSelectedRoleDrawer(null)}
          title={`Rôle : ${selectedRoleDrawer.name}`}
          subtitle={selectedRoleDrawer.description}
          badge={selectedRoleDrawer.badge}
          icon={ShieldCheck}
          breadcrumbs={[
            { label: 'Rôles RBAC', onClick: () => setSelectedRoleDrawer(null) },
            { label: selectedRoleDrawer.name }
          ]}
          actions={[
            {
              id: 'activateRole',
              label: activeRoleId === selectedRoleDrawer.id ? 'Rôle Déjà Sélectionné' : 'Appliquer ce Rôle',
              icon: Check,
              variant: 'primary',
              onClick: () => {
                handleSwitchRole(selectedRoleDrawer.id);
                setSelectedRoleDrawer(null);
              }
            }
          ]}
          kpis={[
            { label: 'Niveau Privilège', value: `${selectedRoleDrawer.level} / 100`, sub: 'Hiérarchie RBAC' },
            { label: 'Utilisateurs', value: selectedRoleDrawer.usersCount, sub: 'Attribués dans l\'OS' },
            { label: 'App par Défaut', value: selectedRoleDrawer.defaultApp, sub: 'Point d\'entrée' },
            { label: 'Statut', value: activeRoleId === selectedRoleDrawer.id ? 'Actif' : 'Disponible', sub: 'Session courante' }
          ]}
          aiInsight={{
            title: `Gouvernance : ${selectedRoleDrawer.name}`,
            content: `Ce rôle est conçu pour respecter les standards ISO 27001. Les modifications apportées par les utilisateurs de ce rôle sont auditées dans le journal d'événements.`,
            actionLabel: 'Voir le journal d\'audit associé',
            onAction: () => showToast(`Audit des actions du rôle ${selectedRoleDrawer.name} ouvert`)
          }}
          tabs={[
            {
              id: 'permissions',
              label: 'Matrice Complète',
              content: (
                <div className="space-y-1.5 max-h-80 overflow-y-auto text-xs pr-1">
                  {tenantService.getPermissionsForRole(selectedRoleDrawer.id).map(p => (
                    <div key={p.appId} className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{p.appName}</span>
                      <div className="flex gap-2 text-[10px] font-mono">
                        <span className={p.read ? "text-emerald-400" : "text-slate-600"}>R</span>
                        <span className={p.write ? "text-emerald-400" : "text-slate-600"}>W</span>
                        <span className={p.delete ? "text-rose-400" : "text-slate-600"}>D</span>
                        <span className={p.admin ? "text-sky-400" : "text-slate-600"}>A</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          ]}
        />
      )}

      {/* 4. APP PERMISSION MATRIX DRAWER */}
      {selectedAppPermissionDrawer && (
        <DetailDrawer
          isOpen={!!selectedAppPermissionDrawer}
          onClose={() => setSelectedAppPermissionDrawer(null)}
          title={`Droits : ${selectedAppPermissionDrawer.appName}`}
          subtitle={`Catégorie : ${selectedAppPermissionDrawer.category} • Rôle actif : ${roles.find(r => r.id === activeRoleId)?.name}`}
          badge={selectedAppPermissionDrawer.read ? 'Accessible' : 'Restreint'}
          icon={SlidersHorizontal}
          breadcrumbs={[
            { label: 'Permissions', onClick: () => setSelectedAppPermissionDrawer(null) },
            { label: selectedAppPermissionDrawer.appName }
          ]}
          kpis={[
            { label: 'Lecture (Read)', value: selectedAppPermissionDrawer.read ? 'Autorisé' : 'Bloqué', sub: 'GET Endpoints' },
            { label: 'Écriture (Write)', value: selectedAppPermissionDrawer.write ? 'Autorisé' : 'Bloqué', sub: 'POST/PUT Endpoints' },
            { label: 'Suppression (Del)', value: selectedAppPermissionDrawer.delete ? 'Autorisé' : 'Bloqué', sub: 'DELETE Endpoints' },
            { label: 'Admin (Admin)', value: selectedAppPermissionDrawer.admin ? 'Total' : 'Restreint', sub: 'Gouvernance' }
          ]}
          tabs={[
            {
              id: 'rolesSummary',
              label: 'Droits par Rôle',
              content: (
                <div className="space-y-2 text-xs">
                  {roles.map(r => {
                    const rPerm = tenantService.getPermissionsForRole(r.id).find(p => p.appId === selectedAppPermissionDrawer.appId);
                    return (
                      <div key={r.id} className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{r.name}</div>
                          <div className="text-[10px] text-slate-400">{r.label}</div>
                        </div>
                        <div className="flex gap-2 text-xs font-mono font-bold">
                          <span className={rPerm?.read ? "text-emerald-400" : "text-slate-600"}>R</span>
                          <span className={rPerm?.write ? "text-emerald-400" : "text-slate-600"}>W</span>
                          <span className={rPerm?.delete ? "text-rose-400" : "text-slate-600"}>D</span>
                          <span className={rPerm?.admin ? "text-sky-400" : "text-slate-600"}>A</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          ]}
        />
      )}

      {/* 5. TEAM MEMBER DETAIL DRAWER */}
      {selectedMemberDrawer && (
        <DetailDrawer
          isOpen={!!selectedMemberDrawer}
          onClose={() => setSelectedMemberDrawer(null)}
          title={selectedMemberDrawer.name}
          subtitle={`${selectedMemberDrawer.email} • ${selectedMemberDrawer.department}`}
          badge={selectedMemberDrawer.status}
          icon={Users}
          breadcrumbs={[
            { label: 'Collaborateurs', onClick: () => setSelectedMemberDrawer(null) },
            { label: selectedMemberDrawer.name }
          ]}
          actions={[
            {
              id: 'remove',
              label: 'Supprimer du Tenant',
              icon: Trash2,
              variant: 'danger',
              onClick: () => {
                tenantService.removeTeamMember(selectedMemberDrawer.id);
                setTeamMembers(tenantService.getTeamMembers());
                setSelectedMemberDrawer(null);
                showToast(`Membre ${selectedMemberDrawer.name} retiré du tenant`);
              }
            }
          ]}
          kpis={[
            { label: 'Rôle Actuel', value: roles.find(r => r.id === selectedMemberDrawer.role)?.name || '', sub: 'Privilèges' },
            { label: 'Authentification', value: selectedMemberDrawer.twoFactorEnabled ? '2FA FIDO2' : 'Mot de Passe', sub: 'Niveau sécurité' },
            { label: 'Activité', value: selectedMemberDrawer.lastActive, sub: 'Dernière session' },
            { label: 'Tenant Attribué', value: selectedMemberDrawer.tenantId, sub: 'Isolation' }
          ]}
          tabs={[
            {
              id: 'roleAssignment',
              label: 'Changer de Rôle',
              content: (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">Sélectionnez le nouveau rôle à affecter à ce collaborateur :</p>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          const updated = tenantService.updateMemberRole(selectedMemberDrawer.id, r.id);
                          if (updated) {
                            setSelectedMemberDrawer({ ...selectedMemberDrawer, role: r.id });
                            setTeamMembers(tenantService.getTeamMembers());
                            showToast(`Rôle de ${selectedMemberDrawer.name} mis à jour en [${r.name}]`);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedMemberDrawer.role === r.id
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-100 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{r.name}</span>
                          {selectedMemberDrawer.role === r.id && <Check size={14} className="text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{r.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            }
          ]}
        />
      )}

      {/* 6. GENERIC DETAIL DRAWER */}
      {selectedGenericDrawer && (
        <DetailDrawer
          isOpen={!!selectedGenericDrawer}
          onClose={() => setSelectedGenericDrawer(null)}
          title={selectedGenericDrawer.title}
          subtitle={selectedGenericDrawer.subtitle}
          badge={selectedGenericDrawer.badge}
          icon={selectedGenericDrawer.icon}
          kpis={selectedGenericDrawer.kpis}
          aiInsight={selectedGenericDrawer.aiInsight}
          tabs={selectedGenericDrawer.tabs}
        />
      )}

      {/* ========================================================== */}
      {/* DEDICATED MODALS */}
      {/* ========================================================== */}

      {/* NEW MIGRATION MODAL */}
      <AnimatePresence>
        {isNewMigrationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewMigrationModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Play size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Simuler une Migration Supabase</h3>
                </div>
                <button
                  onClick={() => setIsNewMigrationModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom du fichier de migration (.sql)</label>
                  <input
                    type="text"
                    value={newMigrationName}
                    onChange={(e) => setNewMigrationName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Requêtes SQL DDL & Politiques RLS</label>
                  <textarea
                    rows={8}
                    value={newMigrationDDL}
                    onChange={(e) => setNewMigrationDDL(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-[11px] outline-none focus:border-emerald-500/50 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setIsNewMigrationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExecuteMigration}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Play size={13} strokeWidth={2.5} />
                  <span>Exécuter la Migration</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE TEAM MEMBER MODAL */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.form
              onSubmit={handleInviteMember}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Inviter un Collaborateur</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Dupont"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adresse Email Professionnelle</label>
                  <input
                    type="email"
                    required
                    placeholder="ex: j.dupont@omk.corp"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Département / Équipe</label>
                  <input
                    type="text"
                    placeholder="ex: Finance, DevOps, Ventes"
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rôle & Privilèges RBAC</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as RoleId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500/50"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.label})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <UserPlus size={13} strokeWidth={2.5} />
                  <span>Envoyer l'Invitation</span>
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
