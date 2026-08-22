import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore, Workspace } from '../store/osStore';
import { AppId, ThemeId, ContrastLevel, WallpaperId, Paradigm, SearchResultItem, SearchResultCategory } from '../types';
import { APPS } from './HomeScreen';
import { 
  Search, X, Command, ArrowRight, Settings, Palette, Sun, Shield, 
  Sparkles, Layers, Sliders, Lock, Bell, CheckCircle2, ChevronRight,
  TrendingUp, Terminal, Cpu, HardHat, PieChart, Users, DollarSign
} from 'lucide-react';

interface Props {
  onOpenApp: (id: AppId) => void;
}

export default function GlobalSearch({ onOpenApp }: Props) {
  const { 
    theme, 
    setTheme, 
    contrast, 
    setContrast, 
    wallpaper, 
    setWallpaper, 
    workspace, 
    setWorkspace, 
    paradigm, 
    setParadigm,
    brightness,
    setBrightness,
    lock,
    openNotificationCenter,
    simulateIncomingAlert
  } = useOSStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchResultCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Keyboard shortcut listener (Cmd+K / Ctrl+K / '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // App search items
  const appItems: SearchResultItem[] = useMemo(() => {
    const appKeywords: Record<string, string[]> = {
      'coach-ai': ['ia', 'intelligence', 'briefing', 'assistant', 'recommandations', 'automatisation'],
      'baas-hub': ['blockchain', 'smart contracts', 'conformité', 'audit', 'légal', 'fintech'],
      'jaas-job': ['recrutement', 'talents', 'rh', 'hiring', 'candidats', 'carrière'],
      'paas-pro': ['serveur', 'cloud', 'docker', 'kubernetes', 'cluster', 'devops', 'scale'],
      'wallet': ['trésorerie', 'paiements', 'crypto', 'soldes', 'devises', 'stripe'],
      'leads': ['prospection', 'crm', 'pipeline', 'outreach', 'opportunités', 'b2b'],
      'terminal': ['cli', 'commandes', 'bash', 'logs', 'scripts', 'système'],
      'dashboard': ['métriques', 'kpi', 'vue d ensemble', 'stats', 'reporting', 'analytics'],
      'finance': ['mrr', 'arr', 'factures', 'revenus', 'dépenses', 'comptabilité', 'ebitda'],
      'operations': ['infrastructure', 'incidents', 'monitoring', 'maintenance', 'sla'],
      'sales': ['ventes', 'pipeline', 'deals', 'conversion', 'acv', 'contrats'],
      'clients': ['comptes', 'gestion', 'support', 'csat', 'retention', 'nps'],
      'growth': ['acquisition', 'marketing', 'trafic', 'campagnes', 'croissance'],
      'product': ['roadmap', 'features', 'releases', 'backlog', 'spécifications'],
      'ontology': ['graphe', 'données', 'relations', 'schémas', 'entités'],
      'cognition': ['mémoire', 'vecteurs', 'connaissances', 'embeddings', 'modèles'],
      'hr': ['employés', 'organigramme', 'paie', 'évaluations', 'congés', 'équipe'],
      'security': ['zero-trust', '2fa', 'authentification', 'waf', 'pare-feu', 'clés api'],
      'settings': ['paramètres', 'thème', 'contraste', 'fond d écran', 'luminosité', 'système'],
      'lock': ['verrouiller', 'quitter', 'session', 'sécurité']
    };

    return APPS.map(app => ({
      id: `app-${app.id}`,
      title: app.name,
      subtitle: `Module applicatif ${app.inDock ? '· Dock' : ''}`,
      category: 'apps',
      icon: app.icon,
      color: app.color,
      badge: 'Application',
      keywords: appKeywords[app.id] || [],
      action: () => {
        setIsOpen(false);
        if (app.id === 'lock') {
          lock();
        } else {
          onOpenApp(app.id);
        }
      }
    }));
  }, [onOpenApp, lock]);

  // System Settings items
  const settingItems: SearchResultItem[] = useMemo(() => [
    // Theme options
    {
      id: 'setting-theme-dark-oled',
      title: 'Thème : Dark OLED',
      subtitle: 'Noir absolu haute performance énergétique',
      category: 'settings',
      icon: Palette,
      badge: theme === 'dark-oled' ? 'Actif' : 'Thème',
      action: () => { setTheme('dark-oled'); setIsOpen(false); },
      keywords: ['thème', 'sombre', 'oled', 'dark', 'apparence', 'couleur']
    },
    {
      id: 'setting-theme-warm-paper',
      title: 'Thème : Warm Paper',
      subtitle: 'Mode éditorial clair inspiré papier et typographie feutrée',
      category: 'settings',
      icon: Palette,
      badge: theme === 'warm-paper' ? 'Actif' : 'Thème',
      action: () => { setTheme('warm-paper'); setIsOpen(false); },
      keywords: ['thème', 'clair', 'papier', 'light', 'editorial', 'warm']
    },
    {
      id: 'setting-theme-cyberpunk',
      title: 'Thème : Cyberpunk Neon',
      subtitle: 'Accents jaune électrique et contrastes radicaux',
      category: 'settings',
      icon: Palette,
      badge: theme === 'cyberpunk' ? 'Actif' : 'Thème',
      action: () => { setTheme('cyberpunk'); setIsOpen(false); },
      keywords: ['thème', 'cyberpunk', 'neon', 'jaune', 'futuriste']
    },
    {
      id: 'setting-theme-glassmorphism',
      title: 'Thème : Glassmorphism Studio',
      subtitle: 'Surfaces translucides dépolies et reflets givrés',
      category: 'settings',
      icon: Palette,
      badge: theme === 'glassmorphism' ? 'Actif' : 'Thème',
      action: () => { setTheme('glassmorphism'); setIsOpen(false); },
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
      action: () => { setContrast('low'); setIsOpen(false); },
      keywords: ['contraste', 'low', 'faible', 'doux', 'accessibilité']
    },
    {
      id: 'setting-contrast-medium',
      title: 'Contraste : Standard (Medium)',
      subtitle: 'Équilibre optique recommandé pour travail soutenu',
      category: 'settings',
      icon: Sliders,
      badge: contrast === 'medium' ? 'Actif' : 'Contraste',
      action: () => { setContrast('medium'); setIsOpen(false); },
      keywords: ['contraste', 'medium', 'moyen', 'standard', 'accessibilité']
    },
    {
      id: 'setting-contrast-high',
      title: 'Contraste : Élevé (High)',
      subtitle: 'Luminance maximale 100% et contours nets haute lisibilité',
      category: 'settings',
      icon: Sliders,
      badge: contrast === 'high' ? 'Actif' : 'Contraste',
      action: () => { setContrast('high'); setIsOpen(false); },
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
      action: () => { setWorkspace('Sandbox'); setIsOpen(false); },
      keywords: ['workspace', 'environnement', 'sandbox', 'test', 'local']
    },
    {
      id: 'setting-ws-dev',
      title: 'Environnement : Development',
      subtitle: 'Instance connectée aux bases de staging (Dev DB)',
      category: 'settings',
      icon: Layers,
      badge: workspace === 'Development' ? 'Actif' : 'Workspace',
      action: () => { setWorkspace('Development'); setIsOpen(false); },
      keywords: ['workspace', 'environnement', 'dev', 'development', 'staging']
    },
    {
      id: 'setting-ws-prod',
      title: 'Environnement : Production',
      subtitle: 'Infrastructure live haute disponibilité (Prod DB)',
      category: 'settings',
      icon: Layers,
      badge: workspace === 'Production' ? 'Actif' : 'Workspace',
      action: () => { setWorkspace('Production'); setIsOpen(false); },
      keywords: ['workspace', 'environnement', 'prod', 'production', 'live']
    },
    // Paradigms
    {
      id: 'setting-paradigm-ios',
      title: 'Paradigme UI : iOS Style',
      subtitle: 'Dynamic Island interactive & barre de navigation supérieure',
      category: 'settings',
      icon: Settings,
      badge: paradigm === 'ios' ? 'Actif' : 'OS',
      action: () => { setParadigm('ios'); setIsOpen(false); },
      keywords: ['ios', 'iphone', 'dynamic island', 'style', 'paradigm']
    },
    {
      id: 'setting-paradigm-android',
      title: 'Paradigme UI : Android Style',
      subtitle: 'Poinçon caméra minimaliste & disposition sobre',
      category: 'settings',
      icon: Settings,
      badge: paradigm === 'android' ? 'Actif' : 'OS',
      action: () => { setParadigm('android'); setIsOpen(false); },
      keywords: ['android', 'style', 'punch hole', 'caméra', 'paradigm']
    },
    // Wallpaper
    {
      id: 'setting-wallpaper-minimal-mesh',
      title: 'Fond d’écran : Minimal Mesh',
      subtitle: 'Gradation subtile d’ondes numériques',
      category: 'settings',
      icon: Palette,
      badge: wallpaper === 'minimal-mesh' ? 'Actif' : 'Wallpaper',
      action: () => { setWallpaper('minimal-mesh'); setIsOpen(false); },
      keywords: ['fond', 'wallpaper', 'mesh', 'abstrait']
    },
    {
      id: 'setting-wallpaper-matrix-grid',
      title: 'Fond d’écran : Matrix Grid',
      subtitle: 'Trame vectorielle technique & coordonnées',
      category: 'settings',
      icon: Palette,
      badge: wallpaper === 'matrix-grid' ? 'Actif' : 'Wallpaper',
      action: () => { setWallpaper('matrix-grid'); setIsOpen(false); },
      keywords: ['fond', 'wallpaper', 'grid', 'matrix', 'technique']
    },
    {
      id: 'setting-wallpaper-aurora',
      title: 'Fond d’écran : Aurora Frost',
      subtitle: 'Halo boréal et lueur diffuse',
      category: 'settings',
      icon: Palette,
      badge: wallpaper === 'aurora-frost' ? 'Actif' : 'Wallpaper',
      action: () => { setWallpaper('aurora-frost'); setIsOpen(false); },
      keywords: ['fond', 'wallpaper', 'aurora', 'frost', 'lueur']
    }
  ], [theme, contrast, workspace, paradigm, wallpaper, setTheme, setContrast, setWorkspace, setParadigm, setWallpaper]);

  // Quick Actions
  const actionItems: SearchResultItem[] = useMemo(() => [
    {
      id: 'action-notif-center',
      title: 'Ouvrir le Centre de Notifications',
      subtitle: 'Inspecter les alertes et événements des modules',
      category: 'actions',
      icon: Bell,
      badge: 'Action',
      action: () => {
        setIsOpen(false);
        openNotificationCenter();
      },
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
        setIsOpen(false);
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
      action: () => {
        setIsOpen(false);
        lock();
      },
      keywords: ['verrouiller', 'lock', 'quitter', 'sécurité', 'session']
    },
    {
      id: 'action-briefing-coach',
      title: 'Lancer le Briefing IA Quotidien',
      subtitle: 'Accéder aux 3 priorités stratégiques de l’Office',
      category: 'actions',
      icon: Sparkles,
      badge: 'Coach AI',
      action: () => {
        setIsOpen(false);
        onOpenApp('coach-ai');
      },
      keywords: ['coach', 'briefing', 'stratégie', 'ia', 'priorités']
    },
    {
      id: 'action-treasury-status',
      title: 'Vérifier la Trésorerie & Règle des 5',
      subtitle: 'Consulter les soldes bancaires et réserves de cash',
      category: 'actions',
      icon: DollarSign,
      badge: 'Finance',
      action: () => {
        setIsOpen(false);
        onOpenApp('finance');
      },
      keywords: ['trésorerie', 'cash', 'finance', 'banque', 'mrr']
    }
  ], [openNotificationCenter, simulateIncomingAlert, lock, onOpenApp]);

  // Combined and filtered results
  const filteredResults = useMemo(() => {
    let pool: SearchResultItem[] = [];
    if (activeTab === 'all') {
      pool = [...appItems, ...settingItems, ...actionItems];
    } else if (activeTab === 'apps') {
      pool = appItems;
    } else if (activeTab === 'settings') {
      pool = settingItems;
    } else if (activeTab === 'actions') {
      pool = actionItems;
    }

    if (!query.trim()) {
      return pool.slice(0, 12);
    }

    const cleanQuery = query.toLowerCase().trim();
    return pool.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchSub = item.subtitle.toLowerCase().includes(cleanQuery);
      const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(cleanQuery));
      return matchTitle || matchSub || matchKeywords;
    });
  }, [activeTab, query, appItems, settingItems, actionItems]);

  // Handle Arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
      scrollSelectedIntoView((selectedIndex + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
      scrollSelectedIntoView((selectedIndex - 1 + filteredResults.length) % (filteredResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div className="w-full relative z-20 mb-4 px-6">
      {/* OMK Desktop-style Search Bar Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-11 px-3.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between shadow-lg text-slate-400 group transition-all theme-transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search size={15} className="text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
          <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate">
            Rechercher apps, paramètres, actions...
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700/80 rounded-md">
            <Command size={10} /> K
          </kbd>
          <kbd className="sm:hidden inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700/80 rounded-md">
            /
          </kbd>
        </div>
      </button>

      {/* Spotlight Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="relative z-10 w-full max-w-sm bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col theme-transition max-h-[560px]"
            >
              {/* Search Input Bar */}
              <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60">
                <Search size={18} className="text-emerald-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher dans l'écosystème OMK..."
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                {query ? (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"
                  >
                    ESC
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="px-3.5 py-2 border-b border-slate-800/60 flex items-center gap-1.5 bg-slate-900/30 overflow-x-auto scrollbar-hide shrink-0">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'apps', label: 'Applications' },
                  { id: 'settings', label: 'Paramètres' },
                  { id: 'actions', label: 'Actions Rapides' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSelectedIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 border ${
                      activeTab === tab.id
                        ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide max-h-[380px]">
                {filteredResults.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Search size={22} className="mx-auto mb-2 text-slate-600" />
                    <p className="text-xs font-medium text-slate-400">Aucun résultat pour "{query}"</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Essayez un autre mot-clé ou filtre</p>
                  </div>
                ) : (
                  filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                          isSelected
                            ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-sm'
                            : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.color || 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            <ItemIcon size={16} strokeWidth={1.5} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-100 truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-medium border ${
                                  item.badge === 'Actif'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-900 text-slate-400 border-slate-800'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          {isSelected && (
                            <ChevronRight size={15} className="text-emerald-400 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal Footer Key Hints */}
              <div className="px-4 py-2 border-t border-slate-800/70 bg-slate-900/50 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
                <div className="flex items-center gap-3">
                  <span><kbd className="font-mono bg-slate-800 px-1 rounded">↑↓</kbd> Naviguer</span>
                  <span><kbd className="font-mono bg-slate-800 px-1 rounded">↵</kbd> Exécuter</span>
                </div>
                <span>{filteredResults.length} résultats</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
