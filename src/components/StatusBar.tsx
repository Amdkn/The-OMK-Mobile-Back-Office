import { useState, useEffect, useMemo } from 'react';
import { 
  Wifi, WifiOff, Signal, Bell, Zap, Battery, BatteryCharging, 
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Leaf
} from 'lucide-react';
import { Paradigm } from '../types';
import { useOSStore } from '../store/osStore';
import { usePowerManager } from '../hooks/usePowerManager';
import { OfflineStorageService } from '../services/offlineStorage';
import DynamicIsland from './DynamicIsland';

export default function StatusBar({ paradigm }: { paradigm: Paradigm }) {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(OfflineStorageService.isOnline());
  const power = usePowerManager();
  
  const { 
    theme, 
    contrast, 
    networkType, 
    signalStrength, 
    notifications, 
    toggleNotificationCenter 
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

  // Dynamic Theme & Contrast adaptive styling
  const styleConfig = useMemo(() => {
    // Determine contrast modifier classes
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
      case 'cyberpunk':
        return {
          textColor: contrast === 'high' ? 'text-yellow-300' : 'text-yellow-400',
          iconColor: 'text-yellow-400',
          accentColor: 'text-cyan-400',
          badgeBg: 'bg-yellow-400 text-black',
          batteryFill: power.isLowPowerMode ? 'text-amber-400' : power.isCharging ? 'text-cyan-400' : power.batteryLevel < 20 ? 'text-red-400' : 'text-yellow-400',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'glassmorphism':
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

  return (
    <div className={`absolute top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-5 pointer-events-none select-none ${styleConfig.containerClass}`}>
      {/* Left: Time & Notification Bell indicator */}
      <div className="flex-1 flex items-center gap-2 pointer-events-auto pl-1">
        <button
          onClick={toggleNotificationCenter}
          className={`text-xs sm:text-sm font-medium tracking-tight hover:opacity-80 transition-opacity ${styleConfig.textColor}`}
          title="Ouvrir le Centre de Notifications"
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </button>

        {/* Notification Bell Badge */}
        <button
          onClick={toggleNotificationCenter}
          title="Centre de Notifications"
          className="relative p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors pointer-events-auto flex items-center justify-center group"
        >
          <Bell size={14} className={`${styleConfig.iconColor} group-hover:${styleConfig.accentColor} transition-colors shrink-0`} />
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full text-[8.5px] font-black leading-none flex items-center justify-center ${styleConfig.badgeBg} shadow-md border border-slate-950/20 whitespace-nowrap z-10 animate-pulse`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Center: Dynamic Island or Notch */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-50 pointer-events-auto">
        <DynamicIsland paradigm={paradigm} />
      </div>

      {/* Right: Network Signal, Low Power Mode & Battery */}
      <div className="flex-1 flex justify-end items-center gap-1.5 pr-1 pointer-events-auto">
        {/* Low Power Mode Badge toggle */}
        {power.isLowPowerMode && (
          <button
            onClick={power.toggleLowPowerMode}
            title={power.powerStatusLabel}
            className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5 text-[10px] font-mono hover:scale-105 transition-all"
          >
            <Zap size={10} className="fill-amber-400" />
            <span className="hidden sm:inline text-[9px]">Eco</span>
          </button>
        )}

        {/* Network Signal Indicator with 5G/LTE tag */}
        <div className="flex items-center gap-0.5" title={`Signal réseau: ${signalStrength}/4 · ${networkType}`}>
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
          <span className={`text-[9px] font-bold font-mono tracking-tighter ${styleConfig.textColor}`}>
            {networkType}
          </span>
        </div>

        {/* Wi-Fi Icon / Offline */}
        <div title={isOnline ? "Wi-Fi Connecté (En ligne)" : "Mode Hors-ligne (IndexedDB Cache)"}>
          {isOnline ? (
            <Wifi size={14} strokeWidth={2.5} className={styleConfig.iconColor} />
          ) : (
            <WifiOff size={14} strokeWidth={2.5} className="text-rose-400" />
          )}
        </div>

        {/* Battery with dynamic % and toggleable charging */}
        <button 
          onClick={power.toggleLowPowerMode}
          title={`${power.batteryLevel}% - ${power.isCharging ? 'En charge' : 'Sur batterie'} • ${power.powerStatusLabel}`}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity pl-0.5"
        >
          <span className={`text-[10px] font-medium font-mono ${styleConfig.textColor}`}>
            {power.batteryLevel}%
          </span>
          <div className="relative flex items-center">
            <BatteryIcon size={18} strokeWidth={2} className={styleConfig.batteryFill} />
            {power.isCharging && (
              <Zap size={9} className="absolute left-1 text-amber-400 fill-amber-400 animate-pulse" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
