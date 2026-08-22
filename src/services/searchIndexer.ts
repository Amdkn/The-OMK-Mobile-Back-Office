// Centralized Search Indexing Service for OMK Mobile OS
// Catalogs Applications, In-App Notes, Client Records, System Settings, Files/Documents, and System Actions
import { SearchResultItem, SearchResultCategory, AppId, NoteItem } from '../types';
import { APPS } from '../components/HomeScreen';
import { ClientStorageService, Client } from './clientStorage';
import { NotesService } from '../modules/notes';
import { Workspace } from '../store/osStore';
import { 
  FileText, FileCode, FileSpreadsheet, FileCheck, Database,
  Palette, Sliders, Layers, Settings, Bell, Sparkles, Lock, DollarSign,
  Building2, Users, StickyNote
} from 'lucide-react';

export interface IndexerSearchOptions {
  category?: 'all' | 'apps' | 'notes' | 'clients' | 'files' | 'settings' | 'actions';
  workspace: Workspace;
  theme: string;
  contrast: string;
  paradigm: string;
  onOpenApp: (id: AppId) => void;
  setTheme: (theme: any) => void;
  setContrast: (contrast: any) => void;
  setWorkspace: (ws: Workspace) => void;
  setParadigm: (paradigm: any) => void;
  lock: () => void;
  openNotificationCenter: () => void;
  simulateIncomingAlert: () => void;
}

export class SearchIndexingService {
  /**
   * Builds the comprehensive searchable catalog from real-time OS state & client storage
   */
  public static getCatalog(options: IndexerSearchOptions): SearchResultItem[] {
    const {
      workspace,
      theme,
      contrast,
      paradigm,
      onOpenApp,
      setTheme,
      setContrast,
      setWorkspace,
      setParadigm,
      lock,
      openNotificationCenter,
      simulateIncomingAlert
    } = options;

    const catalog: SearchResultItem[] = [];

    // 1. APPLICATIONS CATALOG
    const appKeywords: Record<string, string[]> = {
      'notes': ['notes', 'capture', 'mémo', 'texte', 'idées', 'todo', 'brouillon', 'document'],
      'coach-ai': ['ia', 'intelligence', 'briefing', 'assistant', 'recommandations', 'automatisation', 'ai'],
      'baas-hub': ['blockchain', 'smart contracts', 'conformité', 'audit', 'légal', 'fintech', 'baas'],
      'jaas-job': ['recrutement', 'talents', 'rh', 'hiring', 'candidats', 'carrière', 'job', 'jaas'],
      'paas-pro': ['serveur', 'cloud', 'docker', 'kubernetes', 'cluster', 'devops', 'scale', 'paas'],
      'wallet': ['trésorerie', 'paiements', 'crypto', 'soldes', 'devises', 'stripe', 'banque'],
      'leads': ['prospection', 'crm', 'pipeline', 'outreach', 'opportunités', 'b2b', 'appels', 'campagnes'],
      'terminal': ['cli', 'commandes', 'bash', 'logs', 'scripts', 'système', 'console'],
      'dashboard': ['métriques', 'kpi', 'vue d ensemble', 'stats', 'reporting', 'analytics', 'vue'],
      'finance': ['mrr', 'arr', 'factures', 'revenus', 'dépenses', 'comptabilité', 'ebitda', 'trésorerie'],
      'operations': ['infrastructure', 'incidents', 'monitoring', 'maintenance', 'sla', 'uptime'],
      'sales': ['ventes', 'pipeline', 'deals', 'conversion', 'acv', 'contrats', 'commercial'],
      'clients': ['comptes', 'gestion', 'support', 'csat', 'retention', 'nps', 'portefeuille', 'clients'],
      'growth': ['acquisition', 'marketing', 'trafic', 'campagnes', 'croissance', 'analytics'],
      'product': ['roadmap', 'features', 'releases', 'backlog', 'spécifications', 'produit'],
      'ontology': ['graphe', 'données', 'relations', 'schémas', 'entités', 'connaissances'],
      'cognition': ['mémoire', 'vecteurs', 'connaissances', 'embeddings', 'modèles', 'ia'],
      'hr': ['employés', 'organigramme', 'paie', 'évaluations', 'congés', 'équipe', 'rh', 'people'],
      'security': ['zero-trust', '2fa', 'authentification', 'waf', 'pare-feu', 'clés api', 'audit'],
      'settings': ['paramètres', 'thème', 'contraste', 'fond d écran', 'luminosité', 'système', 'réglages'],
      'lock': ['verrouiller', 'quitter', 'session', 'sécurité', 'fermer']
    };

    APPS.forEach(app => {
      catalog.push({
        id: `app-${app.id}`,
        title: app.name,
        subtitle: `Module applicatif ${app.inDock ? '· Dock' : ''}`,
        category: 'apps' as SearchResultCategory,
        icon: app.icon,
        color: app.color,
        badge: 'Application',
        keywords: appKeywords[app.id] || [],
        action: () => {
          if (app.id === 'lock') {
            lock();
          } else {
            onOpenApp(app.id);
          }
        }
      });
    });

    // 2. IN-APP NOTES CONTENT (Indexed from Notes module & IndexedDB)
    try {
      const notes = NotesService.getNotesSync(workspace);
      notes.forEach((note: NoteItem) => {
        const snippet = note.content.slice(0, 90).replace(/\n/g, ' ') + (note.content.length > 90 ? '...' : '');
        catalog.push({
          id: `note-item-${note.id}`,
          title: note.title,
          subtitle: snippet || `Note dans ${note.category}`,
          category: 'notes' as any,
          icon: StickyNote,
          color: 'bg-emerald-950/60 text-emerald-300 border-emerald-900',
          badge: note.category,
          keywords: [
            note.title,
            note.category,
            ...note.tags,
            'note',
            'capture',
            'in-app',
            ...note.content.split(/\s+/).slice(0, 20)
          ],
          action: () => {
            onOpenApp('notes');
          }
        });
      });
    } catch (e) {
      console.warn('Failed to index notes for search:', e);
    }

    // 3. IN-APP CLIENT RECORDS (Dynamic from ClientStorageService isolated to current workspace)
    try {
      const clientRecords = ClientStorageService.loadClients(workspace);
      clientRecords.forEach((client: Client) => {
        const contactNames = client.contacts?.map(c => c.name).join(' ') || '';
        const projectNames = client.projects?.map(p => p.name).join(' ') || '';
        catalog.push({
          id: `client-${client.id}`,
          title: client.name,
          subtitle: `${client.tier} · MRR $${client.mrr.toLocaleString()} · Santé ${client.healthScore}% · SLA ${client.sla}`,
          category: 'clients' as any,
          icon: Building2,
          color: client.status === 'at-risk' ? 'bg-amber-950/60 text-amber-400 border-amber-900' : 'bg-blue-950/60 text-blue-400 border-blue-900',
          badge: client.tier,
          keywords: [
            client.name, 
            client.industry, 
            client.tier, 
            client.status, 
            'client', 
            'crm', 
            contactNames, 
            projectNames, 
            `mrr-${client.mrr}`
          ],
          action: () => {
            onOpenApp('clients');
          }
        });
      });
    } catch (e) {
      console.warn('Failed to index client records for search:', e);
    }

    // 4. FILES & DOCUMENTS
    const files = [
      {
        id: 'file-financial-model',
        title: 'Q3_Financial_Model_Consolidated.xlsx',
        subtitle: 'Modélisation EBITDA, seuil de rentabilité et projection ARR $2.4M',
        category: 'files' as any,
        icon: FileSpreadsheet,
        badge: 'Feuille Calcul',
        color: 'bg-emerald-950/60 text-emerald-400 border-emerald-900',
        keywords: ['finance', 'excel', 'ebitda', 'modèle', 'trésorerie', 'xlsx', 'mrr'],
        action: () => onOpenApp('finance')
      },
      {
        id: 'file-client-acme',
        title: 'Client_Agreement_Acme_Enterprise.pdf',
        subtitle: "Contrat SLA Or 99.99%, clause d'expansion +$4k/m, signataire CEO",
        category: 'files' as any,
        icon: FileCheck,
        badge: 'Contrat PDF',
        color: 'bg-blue-950/60 text-blue-400 border-blue-900',
        keywords: ['acme', 'contrat', 'pdf', 'client', 'sla', 'accord'],
        action: () => onOpenApp('clients')
      },
      {
        id: 'file-soc2-report',
        title: 'SOC2_Security_Audit_Report_2026.json',
        subtitle: 'Rapport de conformité Zero-Trust, 0 vulnérabilité critique',
        category: 'files' as any,
        icon: FileCode,
        badge: 'Audit JSON',
        color: 'bg-purple-950/60 text-purple-400 border-purple-900',
        keywords: ['sécurité', 'soc2', 'audit', 'json', 'conformité', 'zero-trust'],
        action: () => onOpenApp('security')
      },
      {
        id: 'file-cluster-config',
        title: 'Frankfurt_Cluster_Topology.yaml',
        subtitle: 'Configuration Pods Kubernetes PaaS Pro, autoscaling 4-32 vCPU',
        category: 'files' as any,
        icon: FileCode,
        badge: 'Config YAML',
        color: 'bg-amber-950/60 text-amber-400 border-amber-900',
        keywords: ['kubernetes', 'cluster', 'yaml', 'paas', 'docker', 'devops'],
        action: () => onOpenApp('paas-pro')
      },
      {
        id: 'file-sales-deck',
        title: 'Enterprise_Sales_Deck_Q3.key',
        subtitle: 'Pitch deck 18 slides avec benchmark concurrentiel et pricing matrix',
        category: 'files' as any,
        icon: FileText,
        badge: 'Présentation',
        color: 'bg-pink-950/60 text-pink-400 border-pink-900',
        keywords: ['sales', 'deck', 'pitch', 'slides', 'commercial', 'vente'],
        action: () => onOpenApp('sales')
      },
      {
        id: 'file-ontology-weights',
        title: 'Neural_Ontology_Embeddings.bin',
        subtitle: 'Vecteurs sémantiques 1536d pour les graphes de connaissances multi-agents',
        category: 'files' as any,
        icon: Database,
        badge: 'Données IA',
        color: 'bg-teal-950/60 text-teal-400 border-teal-900',
        keywords: ['ontologie', 'embeddings', 'vecteurs', 'cognition', 'ia', 'binaire'],
        action: () => onOpenApp('ontology')
      }
    ];
    catalog.push(...files);

    // 5. WORKSPACE & SYSTEM SETTINGS
    const settingsItems: SearchResultItem[] = [
      // Themes
      {
        id: 'setting-theme-dark-oled',
        title: 'Thème : Dark OLED',
        subtitle: 'Noir absolu haute performance énergétique',
        category: 'settings',
        icon: Palette,
        badge: theme === 'dark-oled' ? 'Actif' : 'Thème',
        action: () => setTheme('dark-oled'),
        keywords: ['thème', 'sombre', 'oled', 'dark', 'apparence', 'couleur']
      },
      {
        id: 'setting-theme-warm-paper',
        title: 'Thème : Warm Paper',
        subtitle: 'Mode éditorial clair inspiré papier et typographie feutrée',
        category: 'settings',
        icon: Palette,
        badge: theme === 'warm-paper' ? 'Actif' : 'Thème',
        action: () => setTheme('warm-paper'),
        keywords: ['thème', 'clair', 'papier', 'light', 'editorial', 'warm']
      },
      {
        id: 'setting-theme-cyberpunk',
        title: 'Thème : Cyberpunk Neon',
        subtitle: 'Accents jaune électrique et contrastes radicaux',
        category: 'settings',
        icon: Palette,
        badge: theme === 'cyberpunk' ? 'Actif' : 'Thème',
        action: () => setTheme('cyberpunk'),
        keywords: ['thème', 'cyberpunk', 'neon', 'jaune', 'futuriste']
      },
      {
        id: 'setting-theme-glassmorphism',
        title: 'Thème : Glassmorphism Studio',
        subtitle: 'Surfaces translucides dépolies et reflets givrés',
        category: 'settings',
        icon: Palette,
        badge: theme === 'glassmorphism' ? 'Actif' : 'Thème',
        action: () => setTheme('glassmorphism'),
        keywords: ['thème', 'verre', 'translucide', 'blur', 'glass', 'givre']
      },
      // Contrast
      {
        id: 'setting-contrast-low',
        title: 'Contraste : Doux (Low)',
        subtitle: 'Atténuation des bordures et opacités relaxantes',
        category: 'settings',
        icon: Sliders,
        badge: contrast === 'low' ? 'Actif' : 'Contraste',
        action: () => setContrast('low'),
        keywords: ['contraste', 'low', 'faible', 'doux', 'accessibilité']
      },
      {
        id: 'setting-contrast-medium',
        title: 'Contraste : Standard (Medium)',
        subtitle: 'Équilibre optique recommandé pour travail soutenu',
        category: 'settings',
        icon: Sliders,
        badge: contrast === 'medium' ? 'Actif' : 'Contraste',
        action: () => setContrast('medium'),
        keywords: ['contraste', 'medium', 'moyen', 'standard', 'accessibilité']
      },
      {
        id: 'setting-contrast-high',
        title: 'Contraste : Élevé (High)',
        subtitle: 'Luminance maximale 100% et contours nets haute lisibilité',
        category: 'settings',
        icon: Sliders,
        badge: contrast === 'high' ? 'Actif' : 'Contraste',
        action: () => setContrast('high'),
        keywords: ['contraste', 'high', 'élevé', 'net', 'accessibilité', 'lumineux']
      },
      // Workspaces
      {
        id: 'setting-ws-sandbox',
        title: 'Environnement : Sandbox',
        subtitle: 'Instance de test isolée (Local DB)',
        category: 'settings',
        icon: Layers,
        badge: workspace === 'Sandbox' ? 'Actif' : 'Workspace',
        action: () => setWorkspace('Sandbox'),
        keywords: ['workspace', 'environnement', 'sandbox', 'test', 'local', 'données']
      },
      {
        id: 'setting-ws-dev',
        title: 'Environnement : Development',
        subtitle: 'Instance connectée aux bases de staging (Dev DB)',
        category: 'settings',
        icon: Layers,
        badge: workspace === 'Development' ? 'Actif' : 'Workspace',
        action: () => setWorkspace('Development'),
        keywords: ['workspace', 'environnement', 'dev', 'development', 'staging', 'données']
      },
      {
        id: 'setting-ws-prod',
        title: 'Environnement : Production',
        subtitle: 'Infrastructure live haute disponibilité (Prod DB)',
        category: 'settings',
        icon: Layers,
        badge: workspace === 'Production' ? 'Actif' : 'Workspace',
        action: () => setWorkspace('Production'),
        keywords: ['workspace', 'environnement', 'prod', 'production', 'live', 'données']
      },
      // Paradigm
      {
        id: 'setting-paradigm-ios',
        title: 'Paradigme UI : iOS Style',
        subtitle: 'Dynamic Island interactive & barre supérieure',
        category: 'settings',
        icon: Settings,
        badge: paradigm === 'ios' ? 'Actif' : 'OS',
        action: () => setParadigm('ios'),
        keywords: ['ios', 'iphone', 'dynamic island', 'style', 'paradigm']
      },
      {
        id: 'setting-paradigm-android',
        title: 'Paradigme UI : Android Style',
        subtitle: 'Poinçon caméra minimaliste & disposition sobre',
        category: 'settings',
        icon: Settings,
        badge: paradigm === 'android' ? 'Actif' : 'OS',
        action: () => setParadigm('android'),
        keywords: ['android', 'style', 'punch hole', 'caméra', 'paradigm']
      }
    ];
    catalog.push(...settingsItems);

    // 6. SYSTEM ACTIONS
    const actionItems: SearchResultItem[] = [
      {
        id: 'action-notif-center',
        title: 'Ouvrir le Centre de Notifications',
        subtitle: 'Inspecter les alertes et événements des modules',
        category: 'actions',
        icon: Bell,
        badge: 'Action',
        action: openNotificationCenter,
        keywords: ['notification', 'alertes', 'centre', 'événements', 'messages']
      },
      {
        id: 'action-simulate-alert',
        title: 'Simuler une Alerte Business Temps-Réel',
        subtitle: 'Injecte un événement push dans le flux télémétrique',
        category: 'actions',
        icon: Sparkles,
        badge: 'Test',
        action: () => {
          simulateIncomingAlert();
          openNotificationCenter();
        },
        keywords: ['simuler', 'test', 'alerte', 'push', 'event']
      },
      {
        id: 'action-lock-device',
        title: 'Verrouiller le Système OMK',
        subtitle: 'Ferme la session active et active l’écran de verrouillage',
        category: 'actions',
        icon: Lock,
        badge: 'Sécurité',
        action: lock,
        keywords: ['verrouiller', 'lock', 'quitter', 'sécurité', 'session']
      },
      {
        id: 'action-new-note',
        title: 'Créer une Nouvelle Note Rapide',
        subtitle: 'Ouvrir le carnet de notes et capturer une idée',
        category: 'actions',
        icon: StickyNote,
        badge: 'Notes',
        action: () => onOpenApp('notes'),
        keywords: ['note', 'capturer', 'écrire', 'texte', 'mémo', 'idée']
      },
      {
        id: 'action-briefing-coach',
        title: 'Lancer le Briefing IA Quotidien',
        subtitle: 'Accéder aux 3 priorités stratégiques de l’Office',
        category: 'actions',
        icon: Sparkles,
        badge: 'Coach AI',
        action: () => onOpenApp('coach-ai'),
        keywords: ['coach', 'briefing', 'stratégie', 'ia', 'priorités']
      },
      {
        id: 'action-treasury-status',
        title: 'Vérifier la Trésorerie & Règle des 5',
        subtitle: 'Consulter les soldes bancaires et réserves de cash',
        category: 'actions',
        icon: DollarSign,
        badge: 'Finance',
        action: () => onOpenApp('finance'),
        keywords: ['trésorerie', 'cash', 'finance', 'banque', 'mrr']
      }
    ];
    catalog.push(...actionItems);

    return catalog;
  }

  /**
   * Search through catalog with weighted category filtering and scoring
   */
  public static search(
    catalog: SearchResultItem[],
    query: string,
    categoryTab: string = 'all'
  ): SearchResultItem[] {
    let pool = catalog;
    if (categoryTab !== 'all') {
      pool = catalog.filter(item => {
        if (categoryTab === 'apps') return item.category === 'apps';
        if (categoryTab === 'notes') return (item as any).category === 'notes';
        if (categoryTab === 'clients') return (item as any).category === 'clients';
        if (categoryTab === 'files') return (item as any).category === 'files';
        if (categoryTab === 'settings') return item.category === 'settings';
        if (categoryTab === 'actions') return item.category === 'actions';
        return true;
      });
    }

    if (!query.trim()) {
      return pool.slice(0, 18);
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    // Score items based on match precision
    const scored = pool.map(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const subLower = item.subtitle.toLowerCase();
      const keywords = item.keywords || [];

      // Exact title match gets highest score
      if (titleLower === cleanQuery) score += 100;
      else if (titleLower.startsWith(cleanQuery)) score += 60;
      else if (titleLower.includes(cleanQuery)) score += 40;

      // Subtitle match
      if (subLower.includes(cleanQuery)) score += 20;

      // Token matches
      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 15;
        if (subLower.includes(token)) score += 8;
        if (keywords.some(k => k.toLowerCase().includes(token))) score += 12;
      }

      return { item, score };
    });

    return scored
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item);
  }
}
