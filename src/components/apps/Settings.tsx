import { useState } from 'react';
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
  ChevronUp,
  Bell,
  Lock,
  Wifi,
  Bot,
  Fingerprint,
  Download,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  Radio,
  Share2,
  Key,
  FolderCheck,
  CheckCircle2,
  SlidersHorizontal,
  FileCode,
  Gauge
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { usePowerManager } from '../../hooks/usePowerManager';
import { OfflineStorageService } from '../../services/offlineStorage';
import { haptics } from '../../services/haptics';
import { ThemeId, ContrastLevel } from '../../types';
import { WALLPAPERS } from '../WallpaperBackground';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';

interface NavTab {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  desc?: string;
}

const PRIMARY_TABS: NavTab[] = [
  { id: 'display', label: 'Affichage', icon: Contrast },
  { id: 'themes', label: 'Thèmes', icon: Palette, badge: 4 },
  { id: 'wallpapers', label: 'Fonds', icon: ImageIcon, badge: 6 },
  { id: 'system', label: 'Système', icon: ShieldCheck, badge: 'v4.2' }
];

const EXTENDED_TABS: NavTab[] = [
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 'IA', desc: 'Alertes, sons et vibrations haptiques' },
  { id: 'security', label: 'Sécurité & Accès', icon: Lock, badge: 'Chiffré', desc: 'Code PIN, biométrie et sandbox' },
  { id: 'network', label: 'Réseau & Sync', icon: Wifi, badge: '5G', desc: 'Connectivité, WebSocket et cloud' },
  { id: 'ai_settings', label: 'Intelligence IA', icon: Bot, badge: 'Gemini', desc: 'Modèles, autonomie et vision' },
  { id: 'storage', label: 'Stockage & Export', icon: HardDrive, badge: 'IndexedDB', desc: 'Gestion mémoire, export JSON et backup' },
  { id: 'accessibility', label: 'Accessibilité', icon: Sliders, badge: 'AA+', desc: 'Animations, taille de police et clarté' }
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
  const [activeTab, setActiveTab] = useState('display');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  // Extended Settings State
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
  const [pingSpeed, setPingSpeed] = useState<number | null>(18);
  const [isTestingPing, setIsTestingPing] = useState(false);

  const isExtendedTabActive = EXTENDED_TABS.some(t => t.id === activeTab);
  const activeExtendedTabObj = EXTENDED_TABS.find(t => t.id === activeTab);

  const handleTabSelect = (tabId: string) => {
    haptics.trigger('selection');
    setActiveTab(tabId);
  };

  const handleClearCache = async () => {
    haptics.trigger('medium');
    await OfflineStorageService.clearAppCache();
    await OfflineStorageService.seedDefaultOfflineCache(workspace);
    setCacheMessage('Cache IndexedDB réinitialisé avec succès');
    setTimeout(() => setCacheMessage(null), 3000);
  };

  const handleExportConfig = () => {
    haptics.trigger('success');
    const configData = {
      os: 'OMK Mobile OS',
      version: '4.2',
      exportDate: new Date().toISOString(),
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
    setCacheMessage('Configuration exportée au format JSON');
    setTimeout(() => setCacheMessage(null), 3000);
  };

  const testPing = () => {
    setIsTestingPing(true);
    haptics.trigger('light');
    setTimeout(() => {
      setPingSpeed(Math.floor(Math.random() * 14) + 12);
      setIsTestingPing(false);
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

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-100 theme-transition overflow-hidden">
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
                  <span>Autres pages de paramétrage</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {EXTENDED_TABS.length} rubriques
                </span>
              </div>

              {/* Grid of Extended Settings Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: DISPLAY & BRIGHTNESS */}
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
                          onClick={() => setContrast(opt.id)}
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
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: THEMES */}
          {activeTab === 'themes' && (
            <motion.div
              key="themes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Moteur de Thème OMK"
                subtitle="Harmonie visuelle et palette de couleurs du système"
                icon={Palette}
                badge="4 Thèmes Système"
              >
                <div className="grid grid-cols-1 gap-3">
                  {themes.map((t) => (
                    <DetailCard
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      isInteractive
                      title={t.name}
                      badge={theme === t.id ? 'Actif' : 'Sélectionner'}
                      badgeColor={theme === t.id ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
                      icon={Palette}
                      subtitle={t.desc}
                    >
                      <div className="flex items-center gap-3 pt-2">
                        <div className={`w-10 h-10 rounded-2xl ${t.sampleBg} ${t.sampleBorder} border-2 flex items-center justify-center shadow-inner relative overflow-hidden`}>
                          <div className={`w-3 h-3 rounded-full ${t.accent}`} />
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {t.id}
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: WALLPAPERS */}
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
                      onClick={() => setWallpaper(wp.id)}
                      className={`group relative flex flex-col p-3 rounded-3xl border transition-all text-left overflow-hidden ${
                        wallpaper === wp.id
                          ? 'bg-slate-900/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Visual miniature */}
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

          {/* TAB 4: SYSTEM INFO, POWER & OFFLINE CACHE */}
          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Power Management Section */}
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
                      onClick={power.toggleLowPowerMode}
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
                    <span>État de la batterie: <strong className="text-slate-200 font-mono">{power.batteryLevel}% {power.isCharging ? '(En charge)' : ''}</strong></span>
                    <span>Intervalle sync: <strong className="text-emerald-400 font-mono">{power.syncIntervalMs / 1000}s</strong></span>
                  </div>
                </div>
              </DetailSection>

              {/* IndexedDB Offline Cache Section */}
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

                  {cacheMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] text-center"
                    >
                      {cacheMessage}
                    </motion.div>
                  )}
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
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-slate-400">Pile Visuelle</span>
                    <span className="font-mono text-slate-300">Motion + Tailwind CSS</span>
                  </div>
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* EXTENDED TAB 1: NOTIFICATIONS & SOUNDS */}
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
                {/* Haptics Intensity Control */}
                <DetailCard title="Intensité du Retour Haptique" icon={Smartphone}>
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
                      {(['off', 'light', 'medium', 'heavy'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setHapticIntensity(level);
                            if (level !== 'off') haptics.trigger(level === 'heavy' ? 'success' : level);
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

                {/* Sounds & Do Not Disturb */}
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

          {/* EXTENDED TAB 2: SECURITY & PERMISSIONS */}
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
                      onChange={(e) => setScreenTimeout(e.target.value)}
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

          {/* EXTENDED TAB 3: NETWORK & CLOUD SYNC */}
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

          {/* EXTENDED TAB 4: AI & GEMINI SETTINGS */}
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

                {/* AI Creativity Slider */}
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

          {/* EXTENDED TAB 5: STORAGE & BACKUP EXPORT */}
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

          {/* EXTENDED TAB 6: ACCESSIBILITY */}
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
    </div>
  );
}

