import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Check, Sparkles, X, Sun, Moon, Zap, 
  Wifi, Radio, Layers, Contrast, Shuffle
} from 'lucide-react';
import { useOSStore } from '../store/osStore';
import { UI_UX_PRO_MAX_THEMES, ThemeId, ThemeCategory, ContrastLevel } from '../types';
import { haptics } from '../services/haptics';

export default function ThemeSwitcherModal() {
  const { 
    isThemeMenuOpen, 
    closeThemeMenu, 
    theme: activeTheme, 
    setTheme, 
    contrast, 
    setContrast,
    networkMode,
    toggleNetworkMode,
    cycleRandomDarkTheme,
    isLowPowerMode
  } = useOSStore();

  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isThemeMenuOpen) {
        closeThemeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isThemeMenuOpen, closeThemeMenu]);

  // Filtered themes list
  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return UI_UX_PRO_MAX_THEMES;
    return UI_UX_PRO_MAX_THEMES.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const activeThemeDef = useMemo(() => {
    return UI_UX_PRO_MAX_THEMES.find(t => t.id === activeTheme) || UI_UX_PRO_MAX_THEMES[0];
  }, [activeTheme]);

  const handleSelectTheme = (themeId: ThemeId) => {
    haptics.trigger('selection');
    setTheme(themeId);
  };

  const handleRandomDark = () => {
    haptics.trigger('medium');
    cycleRandomDarkTheme();
  };

  const handleContrastChange = (c: ContrastLevel) => {
    haptics.trigger('selection');
    setContrast(c);
  };

  return (
    <AnimatePresence>
      {isThemeMenuOpen && (
        <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-start items-center p-3 pointer-events-auto">
          {/* Backdrop Click Dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeThemeMenu}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Floating Theme Switcher Window (Mounted below Top Bar) */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-[370px] sm:max-w-[390px] mt-12 bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] theme-transition"
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Header with Title, Active Badge & Close */}
            <div className="p-3.5 pb-2.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Palette size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-slate-100 tracking-tight">Sélecteur de Thèmes OS</h2>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-semibold border border-emerald-500/30">
                      {activeThemeDef.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {UI_UX_PRO_MAX_THEMES.length} styles UI UX Pro Max synchronisés
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Random Dark Mode Shortcut */}
                <button
                  onClick={handleRandomDark}
                  title="Aléatoire Sombre (Optimisation Éco)"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center gap-1 text-[10px] font-medium"
                >
                  <Shuffle size={12} />
                  <span className="hidden sm:inline">Éco</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={closeThemeMenu}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-3 py-2 border-b border-slate-800/60 bg-slate-950/20 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'Tous (16)', icon: Layers },
                { id: 'dark', label: 'Sombres / OLED', icon: Moon },
                { id: 'light', label: 'Clairs & Épurés', icon: Sun },
                { id: 'tactile', label: 'Tactiles & 3D', icon: Sparkles },
                { id: 'vibrant', label: 'Vibrants / Néon', icon: Zap }
              ].map(cat => {
                const isCatActive = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      haptics.trigger('selection');
                      setSelectedCategory(cat.id as ThemeCategory);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      isCatActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    <Icon size={11} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Theme Cards Grid (Matching Web Desktop from screenshot) */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-hide">
              <div className="grid grid-cols-2 gap-1.5">
                {filteredThemes.map(th => {
                  const isSelected = activeTheme === th.id;

                  return (
                    <motion.button
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-2.5 rounded-2xl border text-left flex flex-col justify-between min-h-[64px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top row: 4 Palette dots & Selection Badge */}
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-1">
                          {th.palette.map((color, idx) => (
                            <span 
                              key={idx}
                              className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xs">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Theme Name & Subtitle */}
                      <div>
                        <div className={`text-[10px] font-extrabold tracking-wider uppercase font-mono leading-tight ${
                          isSelected ? 'text-emerald-300' : 'text-slate-200'
                        }`}>
                          {th.name}
                        </div>
                        <div className="text-[8.5px] text-slate-400 font-sans truncate leading-tight mt-0.5">
                          {th.subtitle}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls Bar: Network Toggle & Contrast Selectors */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                {/* Network Indicator Selector (Wifi vs 5G) */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Radio size={11} className="text-emerald-400" /> Réseau :
                  </span>
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                    <button
                      onClick={() => {
                        haptics.trigger('selection');
                        useOSStore.getState().setNetworkMode('wifi');
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all ${
                        networkMode === 'wifi'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Wifi size={10} />
                      <span>Wi-Fi</span>
                    </button>
                    <button
                      onClick={() => {
                        haptics.trigger('selection');
                        useOSStore.getState().setNetworkMode('5g');
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all ${
                        networkMode === '5g'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-mono">5G</span>
                    </button>
                  </div>
                </div>

                {/* Contrast Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Contrast size={11} className="text-slate-400" /> Contraste :
                  </span>
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                    {(['low', 'medium', 'high'] as ContrastLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleContrastChange(lvl)}
                        className={`px-1.5 py-0.5 rounded-lg text-[9px] font-medium capitalize transition-all ${
                          contrast === lvl
                            ? 'bg-slate-700 text-slate-100 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lvl === 'low' ? 'Bas' : lvl === 'medium' ? 'Std' : 'Haut'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
