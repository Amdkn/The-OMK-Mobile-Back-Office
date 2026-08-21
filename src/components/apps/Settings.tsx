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
  Info,
  ChevronRight,
  Eye,
  Contrast,
  Layers,
  Cpu
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { ThemeId, ContrastLevel, WallpaperId } from '../../types';
import { WALLPAPERS } from '../WallpaperBackground';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const SETTINGS_TABS = [
  { id: 'display', label: 'Affichage', icon: Contrast },
  { id: 'themes', label: 'Thèmes', icon: Palette, badge: 4 },
  { id: 'wallpapers', label: 'Fonds', icon: ImageIcon, badge: 6 },
  { id: 'system', label: 'Système', icon: ShieldCheck, badge: 'v4.2' }
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
    workspace 
  } = useOSStore();

  const [activeTab, setActiveTab] = useState('display');

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
      {/* Navigation Submenu Tabs */}
      <AppTopNav 
        tabs={SETTINGS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

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
                  content="Le contraste dynamique est synchronisé avec les variables CSS globales (--color-slate-*) pour une lisibilité parfaite de jour comme de nuit sans clignotement."
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

          {/* TAB 4: SYSTEM INFO */}
          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
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
                    <span className="font-mono text-slate-300">Framer Motion + Tailwind CSS</span>
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
