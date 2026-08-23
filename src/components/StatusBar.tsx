import { useState, useEffect, useMemo } from 'react';
import { 
  Wifi, WifiOff, Bell, Zap, Battery, BatteryCharging, 
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Palette, Signal, Bot
} from 'lucide-react';
import { Paradigm } from '../types';
import { useOSStore } from '../store/osStore';
import { usePowerManager } from '../hooks/usePowerManager';
import { OfflineStorageService } from '../services/offlineStorage';
import { haptics } from '../services/haptics';
import DynamicIsland from './DynamicIsland';

export default function StatusBar({ paradigm }: { paradigm: Paradigm }) {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(OfflineStorageService.isOnline());
  const power = usePowerManager();
  
  const { 
    theme, 
    contrast, 
    signalStrength, 
    networkMode,
    notifications, 
    agents,
    toggleNotificationCenter,
    toggleThemeMenu,
    toggleAgentsMenu,
    cycleRandomDarkTheme
  } = useOSStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = OfflineStorageService.listenNetworkStatus(online => {
      setIsOnline(online);
    });
    return unsub;
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const activeAgentsCount = useMemo(() => {
    return agents.filter(a => a.isActive).length;
  }, [agents]);

  // Dynamic Theme & Contrast adaptive styling across all 16 UI UX Pro Max themes
  const styleConfig = useMemo(() => {
    const contrastOpacity = contrast === 'high' ? 'opacity-100 font-semibold' : contrast === 'low' ? 'opacity-70' : 'opacity-90';

    switch (theme) {
      case 'warm-paper':
        return {
          textColor: contrast === 'high' ? 'text-stone-950' : 'text-stone-800',
          iconColor: contrast === 'high' ? 'text-stone-900' : 'text-stone-700',
          accentColor: 'text-amber-700',
          badgeBg: 'bg-amber-600 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-600' : power.isCharging ? 'text-amber-600' : power.batteryLevel < 20 ? 'text-red-600' : 'text-stone-800',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'editorial':
        return {
          textColor: contrast === 'high' ? 'text-stone-950' : 'text-stone-800',
          iconColor: contrast === 'high' ? 'text-stone-900' : 'text-stone-700',
          accentColor: 'text-emerald-800',
          badgeBg: 'bg-emerald-800 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-600' : power.isCharging ? 'text-emerald-700' : 'text-stone-800',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'minimal-nordic':
        return {
          textColor: 'text-slate-900',
          iconColor: 'text-slate-700',
          accentColor: 'text-sky-600',
          badgeBg: 'bg-sky-500 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-500' : power.isCharging ? 'text-sky-500' : 'text-slate-800',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'brutalism':
        return {
          textColor: 'text-black font-extrabold',
          iconColor: 'text-black',
          accentColor: 'text-red-600',
          badgeBg: 'bg-red-600 text-white font-black',
          batteryFill: power.isLowPowerMode ? 'text-amber-500' : power.isCharging ? 'text-red-600' : 'text-black',
          containerClass: `${contrastOpacity} theme-transition font-mono`,
        };
      case 'neumorphism':
        return {
          textColor: 'text-slate-800 font-medium',
          iconColor: 'text-slate-700',
          accentColor: 'text-teal-600',
          badgeBg: 'bg-teal-600 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-600' : power.isCharging ? 'text-teal-600' : 'text-slate-700',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'claymorphism':
        return {
          textColor: 'text-slate-900 font-bold',
          iconColor: 'text-purple-900',
          accentColor: 'text-purple-600',
          badgeBg: 'bg-purple-600 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-500' : power.isCharging ? 'text-purple-600' : 'text-purple-950',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'cyberpunk':
        return {
          textColor: contrast === 'high' ? 'text-yellow-300' : 'text-yellow-400',
          iconColor: 'text-yellow-400',
          accentColor: 'text-cyan-400',
          badgeBg: 'bg-yellow-400 text-black font-bold',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-cyan-400' : power.batteryLevel < 20 ? 'text-red-400' : 'text-yellow-400',
          containerClass: `${contrastOpacity} theme-transition font-mono`,
        };
      case 'matrix-hacker':
        return {
          textColor: 'text-emerald-400 font-mono font-bold',
          iconColor: 'text-emerald-400',
          accentColor: 'text-emerald-300',
          badgeBg: 'bg-emerald-500 text-black font-black',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-emerald-300' : 'text-emerald-400',
          containerClass: `${contrastOpacity} theme-transition font-mono`,
        };
      case 'aurora-ui':
        return {
          textColor: 'text-cyan-200 font-medium',
          iconColor: 'text-cyan-300',
          accentColor: 'text-pink-400',
          badgeBg: 'bg-pink-500 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-cyan-400' : 'text-cyan-200',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'space-nebula':
        return {
          textColor: 'text-purple-200 font-medium',
          iconColor: 'text-fuchsia-400',
          accentColor: 'text-cyan-300',
          badgeBg: 'bg-fuchsia-500 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-fuchsia-400' : 'text-purple-200',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'midnight-tokyo':
        return {
          textColor: 'text-purple-200 font-medium',
          iconColor: 'text-cyan-400',
          accentColor: 'text-purple-400',
          badgeBg: 'bg-cyan-500 text-black font-bold',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-cyan-400' : 'text-purple-200',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'trust-and-authority':
        return {
          textColor: 'text-slate-100 font-medium',
          iconColor: 'text-amber-300',
          accentColor: 'text-amber-400',
          badgeBg: 'bg-amber-500 text-slate-950 font-bold',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-amber-300' : 'text-slate-200',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'glassmorphism':
      case 'liquid-glass':
        return {
          textColor: contrast === 'high' ? 'text-white' : 'text-white/90',
          iconColor: contrast === 'high' ? 'text-white' : 'text-white/80',
          accentColor: 'text-sky-400',
          badgeBg: 'bg-sky-500 text-white',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-sky-400' : power.batteryLevel < 20 ? 'text-rose-400' : 'text-white',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'dark-oled':
      default:
        return {
          textColor: contrast === 'high' ? 'text-white' : 'text-slate-200',
          iconColor: contrast === 'high' ? 'text-slate-100' : 'text-slate-400',
          accentColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-500 text-slate-950',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-emerald-400' : power.batteryLevel < 20 ? 'text-red-400' : 'text-slate-200',
          containerClass: `${contrastOpacity} theme-transition`,
        };
    }
  }, [theme, contrast, power.isCharging, power.batteryLevel, power.isLowPowerMode]);

  // Battery Icon selector
  const BatteryIcon = useMemo(() => {
    if (power.isCharging) return BatteryCharging;
    if (power.batteryLevel >= 80) return BatteryFull;
    if (power.batteryLevel >= 40) return BatteryMedium;
    if (power.batteryLevel >= 20) return BatteryLow;
    return BatteryWarning;
  }, [power.isCharging, power.batteryLevel]);

  const handleNetworkClick = () => {
    haptics.trigger('selection');
    toggleThemeMenu();
  };

  const handleBatteryClick = () => {
    haptics.trigger('selection');
    cycleRandomDarkTheme();
  };

  const handleAgentsClick = () => {
    haptics.trigger('selection');
    toggleAgentsMenu();
  };

  return (
    <div className={`absolute top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 pointer-events-none select-none ${styleConfig.containerClass}`}>
      {/* Left: Real Live Time & Notification Bell tightly grouped together */}
      <div className="flex items-center gap-1.5 pointer-events-auto pl-0.5 z-40">
        <button
          onClick={toggleNotificationCenter}
          className={`text-xs font-semibold tracking-tight hover:opacity-80 transition-opacity ${styleConfig.textColor}`}
          title="Ouvrir le Centre de Notifications"
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </button>

        {/* Notification Bell Badge */}
        <button
          onClick={toggleNotificationCenter}
          title="Centre de Notifications"
          className="relative p-1 rounded-lg hover:bg-slate-800/40 transition-colors pointer-events-auto flex items-center justify-center group"
        >
          <Bell size={13.5} className={`${styleConfig.iconColor} group-hover:${styleConfig.accentColor} transition-colors shrink-0`} />
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[8px] font-black leading-none flex items-center justify-center ${styleConfig.badgeBg} shadow-md border border-slate-950/20 whitespace-nowrap z-10 animate-pulse`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Center: Dynamic Island perfectly centered without collision */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-50 pointer-events-auto">
        <DynamicIsland paradigm={paradigm} />
      </div>

      {/* Right: EXACTLY 3 Icons (1. Coach OS Agents, 2. Wifi/5G Theme Switcher, 3. Battery Eco Mode) */}
      <div className="flex items-center gap-2 pr-0.5 pointer-events-auto z-40">
        {/* 
          1. COACH OS AGENTS ICON:
          Click opens the Coach OS Assistants Selector & Desktop Deployment Window!
        */}
        <button
          onClick={handleAgentsClick}
          title={`Coach OS Assistants (${activeAgentsCount} actif${activeAgentsCount > 1 ? 's' : ''}) • Cliquez pour gérer et déployer les avatars`}
          className="relative p-1.5 rounded-xl hover:bg-slate-800/50 active:scale-95 transition-all cursor-pointer group flex items-center justify-center"
        >
          <Bot size={15} className={`${styleConfig.iconColor} group-hover:${styleConfig.accentColor} transition-colors shrink-0`} />
          {activeAgentsCount > 0 && (
            <span className="absolute -top-0.5 -right-1 min-w-[13px] h-[13px] px-0.5 rounded-full text-[8px] font-black leading-none flex items-center justify-center bg-emerald-500 text-slate-950 shadow-sm border border-slate-950/20 whitespace-nowrap z-10">
              {activeAgentsCount}
            </span>
          )}
        </button>

        {/* 
          2. NETWORK INDICATOR: ONLY ONE SIGN OF NETWORK (Wifi OU 5G)
          Click opens the floating Theme Switcher Popover Window!
        */}
        <button
          onClick={handleNetworkClick}
          title={
            networkMode === 'wifi'
              ? (isOnline ? "Wi-Fi Actif • Cliquez pour ouvrir le Sélecteur de Thèmes" : "Hors-ligne • Cliquez pour ouvrir le Sélecteur de Thèmes")
              : `5G Réseau Mobile (${signalStrength}/4) • Cliquez pour ouvrir le Sélecteur de Thèmes`
          }
          className="flex items-center gap-1 px-1 py-1 rounded-xl hover:bg-slate-800/50 active:scale-95 transition-all cursor-pointer group"
        >
          {networkMode === 'wifi' ? (
            /* Wifi Glyph */
            isOnline ? (
              <Wifi size={14.5} strokeWidth={2.5} className={`${styleConfig.iconColor} group-hover:${styleConfig.accentColor} transition-colors`} />
            ) : (
              <WifiOff size={14.5} strokeWidth={2.5} className="text-rose-400" />
            )
          ) : (
            /* 5G Cellular Glyph */
            <div className="flex items-center gap-1">
              <div className="flex items-end gap-0.5 h-3 px-0.5">
                {[1, 2, 3, 4].map(bar => (
                  <div 
                    key={bar}
                    className={`w-[2.5px] rounded-xs transition-all ${
                      bar <= signalStrength 
                        ? styleConfig.textColor 
                        : 'opacity-25'
                    }`}
                    style={{ 
                      height: `${bar * 25}%`,
                      backgroundColor: 'currentColor'
                    }}
                  />
                ))}
              </div>
              <span className={`text-[9.5px] font-extrabold font-mono tracking-tighter ${styleConfig.textColor} group-hover:${styleConfig.accentColor}`}>
                5G
              </span>
            </div>
          )}
        </button>

        {/* 
          3. BATTERY INDICATOR:
          Click toggles Low Power Mode and cycles random dark theme from UI UX Pro Max!
        */}
        <button 
          onClick={handleBatteryClick}
          title={`${power.batteryLevel}% - ${power.isCharging ? 'En charge' : 'Sur batterie'} • Cliquez pour basculer le Mode Éco et changer de thème sombre aléatoire`}
          className="flex items-center gap-1 hover:opacity-80 active:scale-95 transition-all pl-0.5 cursor-pointer group"
        >
          <span className={`text-[9.5px] font-semibold font-mono ${styleConfig.textColor} group-hover:${styleConfig.accentColor}`}>
            {power.batteryLevel}%
          </span>
          <div className="relative flex items-center">
            <BatteryIcon size={17} strokeWidth={2} className={styleConfig.batteryFill} />
            {power.isCharging && (
              <Zap size={8.5} className="absolute left-1 text-amber-400 fill-amber-400 animate-pulse" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}


