/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useOSStore } from './store/osStore';
import { AnimatePresence } from 'motion/react';
import { Smartphone, Tablet, RotateCw, Sparkles, Radio, Zap } from 'lucide-react';
import { haptics } from './services/haptics';
import { usePowerManager } from './hooks/usePowerManager';
import { OfflineStorageService } from './services/offlineStorage';
import PhoneChassis from './components/PhoneChassis';
import LockScreen from './components/LockScreen';
import HomeScreen from './components/HomeScreen';
import AppViewer from './components/AppViewer';
import StatusBar from './components/StatusBar';
import WallpaperBackground from './components/WallpaperBackground';
import NotificationCenter from './components/NotificationCenter';
import ThemeSwitcherModal from './components/ThemeSwitcherModal';
import EventBusDevOverlay from './components/dev/EventBusDevOverlay';

export default function App() {
  const { 
    isLocked, 
    paradigm, 
    activeApp, 
    theme, 
    contrast, 
    brightness, 
    deviceViewMode,
    workspace,
    unlock, 
    closeApp, 
    openApp, 
    setParadigm,
    setDeviceViewMode,
    emitEvent,
    simulateIncomingAlert
  } = useOSStore();

  const power = usePowerManager();

  // Initialize IndexedDB offline cache on mount
  useEffect(() => {
    OfflineStorageService.init().then(() => {
      OfflineStorageService.seedDefaultOfflineCache(workspace);
    });
  }, [workspace]);

  // Automated background sync loop throttled by power manager (30s in Low Power vs 5s normal)
  useEffect(() => {
    let syncCount = 0;
    const interval = setInterval(() => {
      syncCount++;
      // Dispatch background telemetry sync pulse
      emitEvent('OMK_TELEMETRY_SYNC', 'system', { 
        timestamp: Date.now(), 
        batteryLevel: power.batteryLevel,
        isLowPowerMode: power.isLowPowerMode,
        syncIntervalMs: power.syncIntervalMs
      });

      // Periodically trigger a live business notification alert (every 4 sync cycles)
      if (syncCount % 4 === 0 && !isLocked) {
        simulateIncomingAlert();
      }
    }, power.syncIntervalMs);

    return () => clearInterval(interval);
  }, [power.syncIntervalMs, power.isLowPowerMode, power.batteryLevel, isLocked, emitEvent, simulateIncomingAlert]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center md:p-8 font-sans text-slate-100 selection:bg-emerald-500/30">
      {/* Desktop Controls Dock */}
      <div className="hidden lg:flex flex-col gap-5 absolute left-8 top-1/2 -translate-y-1/2 z-50 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 rounded-3xl shadow-2xl max-w-[210px]">
        {/* OS Paradigm Switcher */}
        <div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
            OS Paradigm
          </h2>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                haptics.trigger('selection');
                setParadigm('ios');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center justify-between ${
                paradigm === 'ios' 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>iOS Style</span>
              {paradigm === 'ios' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
            <button
              onClick={() => {
                haptics.trigger('selection');
                setParadigm('android');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center justify-between ${
                paradigm === 'android' 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Android Style</span>
              {paradigm === 'android' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Device Orientation & Form Factor Switcher */}
        <div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-1">
            <RotateCw size={11} /> Format & Orientation
          </h2>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                haptics.trigger('selection');
                setDeviceViewMode('portrait');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center gap-2 ${
                deviceViewMode === 'portrait' || deviceViewMode === 'auto'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone size={13} />
              <span>Portrait</span>
            </button>
            <button
              onClick={() => {
                haptics.trigger('selection');
                setDeviceViewMode('landscape');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center gap-2 ${
                deviceViewMode === 'landscape'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCw size={13} />
              <span>Paysage</span>
            </button>
            <button
              onClick={() => {
                haptics.trigger('selection');
                setDeviceViewMode('tablet');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center gap-2 ${
                deviceViewMode === 'tablet'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md' 
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet size={13} />
              <span>Tablette</span>
            </button>
          </div>
        </div>

        {/* Power Management Mode */}
        <div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-1">
            <Zap size={11} className={power.isLowPowerMode ? 'text-amber-400' : 'text-slate-400'} /> Énergie
          </h2>
          <button
            onClick={power.toggleLowPowerMode}
            className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center justify-between ${
              power.isLowPowerMode
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{power.isLowPowerMode ? 'Économie Active' : 'Mode Normal'}</span>
            <span className={`w-2 h-2 rounded-full ${power.isLowPowerMode ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
          </button>
        </div>

        {/* Cross-App Event Bus Live Trigger */}
        <div className="pt-2 border-t border-slate-800/60">
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-1">
            <Radio size={11} className="text-emerald-400" /> AppEventBus
          </h2>
          <button
            onClick={() => {
              haptics.trigger('medium');
              emitEvent('OMK_REFRESH_ALL', 'system', { timestamp: Date.now() });
            }}
            className="w-full px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles size={12} />
            <span>Émettre Événement</span>
          </button>
        </div>
      </div>

      <PhoneChassis>
        <div 
          data-theme={theme} 
          data-contrast={contrast} 
          data-low-power={power.isLowPowerMode ? 'true' : 'false'}
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
              </>
            )}

            {/* Slide-over Notification Center */}
            <NotificationCenter onOpenApp={openApp} />

            {/* Floating Web Desktop Style Theme Switcher Window */}
            <ThemeSwitcherModal />

            {/* Real-time EventBus Debug Overlay */}
            <EventBusDevOverlay />
          </div>
        </div>
      </PhoneChassis>
    </div>
  );
}
