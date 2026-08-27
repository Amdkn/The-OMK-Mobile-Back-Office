import React from 'react';
import { useOSStore } from '../store/osStore';
import { WallpaperId } from '../types';

export interface WallpaperConfig {
  id: WallpaperId;
  name: string;
  desc: string;
  themeStyle: 'dark' | 'light' | 'neon' | 'ambient';
  previewGradient: string;
}

export const WALLPAPERS: WallpaperConfig[] = [
  {
    id: 'warm-studio',
    name: 'Warm Studio',
    desc: 'Lumière d\'atelier & texture organique',
    themeStyle: 'ambient',
    previewGradient: 'from-amber-600/30 via-orange-950/40 to-stone-900',
  },
  {
    id: 'minimal-mesh',
    name: 'Minimal Mesh',
    desc: 'Matrice ardoise & radial haute précision',
    themeStyle: 'dark',
    previewGradient: 'from-slate-800 via-slate-900 to-slate-950',
  },
  {
    id: 'aurora-frost',
    name: 'Aurora Frost',
    desc: 'Onde boréale émeraude & halos givrés',
    themeStyle: 'ambient',
    previewGradient: 'from-emerald-800 via-teal-900 to-blue-950',
  },
  {
    id: 'matrix-grid',
    name: 'Matrix Grid',
    desc: 'Perspective cyber & faisceaux laser',
    themeStyle: 'neon',
    previewGradient: 'from-slate-950 via-emerald-950/60 to-slate-950',
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Horizon',
    desc: 'Synthwave néon & dégradé sunset',
    themeStyle: 'neon',
    previewGradient: 'from-amber-500/20 via-pink-950/40 to-slate-950',
  },
  {
    id: 'deep-space',
    name: 'Deep Obsidian',
    desc: 'Cosmos profond & poussière d\'étoiles',
    themeStyle: 'dark',
    previewGradient: 'from-indigo-950 via-purple-950/30 to-slate-950',
  },
];

// Optimization (Bolt ⚡): Targeted store selector & React.memo to prevent
// redundant re-renders and heavy CSS blur reconciliation when unrelated store properties update.
export const WallpaperBackground = React.memo(function WallpaperBackground() {
  const wallpaper = useOSStore((state) => state.wallpaper);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700">
      {/* 1. Warm Studio */}
      {wallpaper === 'warm-studio' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-stone-900/90 to-slate-950">
          <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-orange-600/15 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-yellow-600/10 blur-3xl" />
          <div 
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, var(--color-slate-400) 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>
      )}

      {/* 2. Minimal Mesh */}
      {wallpaper === 'minimal-mesh' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
          <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent" />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)`,
              backgroundSize: '28px 28px'
            }}
          />
        </div>
      )}

      {/* 3. Aurora Frost */}
      {wallpaper === 'aurora-frost' && (
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-emerald-500/25 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-cyan-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl" />
        </div>
      )}

      {/* 4. Matrix Grid */}
      {wallpaper === 'matrix-grid' && (
        <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.25) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(16, 185, 129, 0.25) 1px, transparent 1px)`,
              backgroundSize: '22px 22px'
            }}
          />
        </div>
      )}

      {/* 5. Cyber Horizon */}
      {wallpaper === 'cyber-neon' && (
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 inset-x-0 h-2/3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-purple-950/20 to-transparent" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(234, 179, 8, 0.3) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-amber-950/30 to-transparent" />
        </div>
      )}

      {/* 6. Deep Obsidian */}
      {wallpaper === 'deep-space' && (
        <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(circle_at_50%_20%,_var(--tw-gradient-stops))] from-indigo-950/50 via-slate-950 to-slate-950">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `radial-gradient(1px 1px at 20px 30px, var(--color-slate-200), rgba(0,0,0,0)),
                                radial-gradient(1px 1px at 70px 140px, var(--color-slate-300), rgba(0,0,0,0)),
                                radial-gradient(1.5px 1.5px at 150px 80px, var(--color-slate-100), rgba(0,0,0,0)),
                                radial-gradient(1.2px 1.2px at 220px 210px, var(--color-slate-200), rgba(0,0,0,0)),
                                radial-gradient(1px 1px at 300px 70px, var(--color-slate-300), rgba(0,0,0,0))`,
              backgroundSize: '320px 320px'
            }}
          />
        </div>
      )}

      {/* Subtle material grain overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-slate-400) 0.8px, transparent 0)`,
          backgroundSize: '16px 16px'
        }}
      />
    </div>
  );
});

export default WallpaperBackground;
