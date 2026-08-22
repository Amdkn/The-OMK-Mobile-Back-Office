/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useOSStore } from './store/osStore';
import { AnimatePresence } from 'motion/react';
import PhoneChassis from './components/PhoneChassis';
import LockScreen from './components/LockScreen';
import HomeScreen from './components/HomeScreen';
import AppViewer from './components/AppViewer';
import StatusBar from './components/StatusBar';
import WallpaperBackground from './components/WallpaperBackground';
import NotificationCenter from './components/NotificationCenter';

export default function App() {
  const { 
    isLocked, 
    paradigm, 
    activeApp, 
    theme, 
    contrast, 
    brightness, 
    unlock, 
    closeApp, 
    openApp, 
    setParadigm 
  } = useOSStore();

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center md:p-8 font-sans text-slate-100 selection:bg-emerald-500/30">
      {/* Paradigm Selector (Desktop Only) */}
      <div className="hidden md:flex flex-col gap-4 absolute left-8 top-1/2 -translate-y-1/2 z-50">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">OS Paradigm</h2>
        <button
          onClick={() => setParadigm('ios')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            paradigm === 'ios' 
              ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          iOS Style
        </button>
        <button
          onClick={() => setParadigm('android')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            paradigm === 'android' 
              ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Android Style
        </button>
      </div>

      <PhoneChassis>
        <div 
          data-theme={theme} 
          data-contrast={contrast} 
          className="relative w-full h-full bg-slate-950 overflow-hidden text-slate-100 flex flex-col theme-transition"
          style={{
            filter: `brightness(${brightness}%)`
          }}
        >
          {/* Dynamic Wallpaper & Material Texture */}
          <WallpaperBackground />

          {/* Persistent Dynamic OS Status Bar */}
          <StatusBar paradigm={paradigm} />
          
          <div className="relative flex-1 w-full overflow-hidden">
            {isLocked ? (
              <LockScreen onUnlock={unlock} paradigm={paradigm} />
            ) : (
              <>
                <HomeScreen onOpenApp={openApp} />
                <AnimatePresence>
                  {activeApp && (
                    <AppViewer key={activeApp} appId={activeApp} onClose={closeApp} />
                  )}
                </AnimatePresence>
                {/* Slide-over Notification Center */}
                <NotificationCenter onOpenApp={openApp} />
              </>
            )}
          </div>
        </div>
      </PhoneChassis>
    </div>
  );
}

