import { useState, useEffect, useMemo } from 'react';
import { 
  Wifi, Signal, Bell, Zap, Battery, BatteryCharging, 
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning 
} from 'lucide-react';
import { Paradigm } from '../types';
import { useOSStore } from '../store/osStore';
import DynamicIsland from './DynamicIsland';

export default function StatusBar({ paradigm }: { paradigm: Paradigm }) {
  const [time, setTime] = useState(new Date());
  const { 
    theme, 
    contrast, 
    batteryLevel, 
    isCharging, 
    toggleCharging, 
    networkType, 
    signalStrength, 
    notifications, 
    toggleNotificationCenter 
  } = useOSStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
          batteryFill: isCharging ? 'text-amber-600' : batteryLevel < 20 ? 'text-red-600' : 'text-stone-800',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'cyberpunk':
        return {
          textColor: contrast === 'high' ? 'text-yellow-300' : 'text-yellow-400',
          iconColor: 'text-yellow-400',
          accentColor: 'text-cyan-400',
          badgeBg: 'bg-yellow-400 text-black',
          batteryFill: isCharging ? 'text-cyan-400' : batteryLevel < 20 ? 'text-red-400' : 'text-yellow-400',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'glassmorphism':
        return {
          textColor: contrast === 'high' ? 'text-white' : 'text-white/90',
          iconColor: contrast === 'high' ? 'text-white' : 'text-white/80',
          accentColor: 'text-sky-400',
          badgeBg: 'bg-sky-500 text-white',
          batteryFill: isCharging ? 'text-sky-400' : batteryLevel < 20 ? 'text-rose-400' : 'text-white',
          containerClass: `${contrastOpacity} theme-transition`,
        };
      case 'dark-oled':
      default:
        return {
          textColor: contrast === 'high' ? 'text-white' : 'text-slate-200',
          iconColor: contrast === 'high' ? 'text-slate-100' : 'text-slate-400',
          accentColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-500 text-slate-950',
          batteryFill: isCharging ? 'text-emerald-400' : batteryLevel < 20 ? 'text-red-400' : 'text-slate-200',
          containerClass: `${contrastOpacity} theme-transition`,
        };
    }
  }, [theme, contrast, isCharging, batteryLevel]);

  // Battery Icon selector
  const BatteryIcon = useMemo(() => {
    if (isCharging) return BatteryCharging;
    if (batteryLevel >= 80) return BatteryFull;
    if (batteryLevel >= 40) return BatteryMedium;
    if (batteryLevel >= 20) return BatteryLow;
    return BatteryWarning;
  }, [isCharging, batteryLevel]);

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
          className="relative p-1 rounded-lg hover:bg-slate-800/40 transition-colors pointer-events-auto group"
        >
          <Bell size={14} className={`${styleConfig.iconColor} group-hover:${styleConfig.accentColor} transition-colors`} />
          {unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center ${styleConfig.badgeBg} shadow-sm animate-pulse`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Center: Dynamic Island or Notch */}
      <div className="flex-1 flex justify-center">
        <DynamicIsland paradigm={paradigm} />
      </div>

      {/* Right: Network Signal & Battery */}
      <div className="flex-1 flex justify-end items-center gap-1.5 pr-1 pointer-events-auto">
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

        {/* Wi-Fi Icon */}
        <div title="Wi-Fi Connecté">
          <Wifi size={14} strokeWidth={2.5} className={styleConfig.iconColor} />
        </div>

        {/* Battery with dynamic % and toggleable charging */}
        <button 
          onClick={toggleCharging}
          title={`${batteryLevel}% - ${isCharging ? 'En charge (cliquer pour basculer)' : 'Sur batterie (cliquer pour brancher)'}`}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity pl-0.5"
        >
          <span className={`text-[10px] font-medium font-mono ${styleConfig.textColor}`}>
            {batteryLevel}%
          </span>
          <div className="relative flex items-center">
            <BatteryIcon size={18} strokeWidth={2} className={styleConfig.batteryFill} />
            {isCharging && (
              <Zap size={9} className="absolute left-1 text-amber-400 fill-amber-400 animate-pulse" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
