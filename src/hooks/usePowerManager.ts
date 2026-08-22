import { useState, useEffect, useCallback } from 'react';
import { useOSStore } from '../store/osStore';
import { haptics } from '../services/haptics';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export function usePowerManager() {
  const { 
    isLowPowerMode, 
    toggleLowPowerMode, 
    setLowPowerMode, 
    batteryLevel, 
    setBatteryLevel, 
    isCharging, 
    toggleCharging 
  } = useOSStore();

  const [hasHardwareBattery, setHasHardwareBattery] = useState(false);
  const [hardwareLevel, setHardwareLevel] = useState<number | null>(null);
  const [hardwareCharging, setHardwareCharging] = useState<boolean | null>(null);

  // Read Hardware Battery Status if supported by browser
  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithBattery) : null;
    if (!nav || !nav.getBattery) return;

    let batteryInstance: BatteryManager | null = null;

    nav.getBattery().then(battery => {
      batteryInstance = battery;
      setHasHardwareBattery(true);
      
      const updateBatteryInfo = () => {
        const lvl = Math.round(battery.level * 100);
        setHardwareLevel(lvl);
        setHardwareCharging(battery.charging);
        setBatteryLevel(lvl);

        // Auto trigger low power mode if battery < 20% and not charging
        if (lvl <= 20 && !battery.charging && !isLowPowerMode) {
          setLowPowerMode(true);
        }
      };

      updateBatteryInfo();

      battery.addEventListener('levelchange', updateBatteryInfo);
      battery.addEventListener('chargingchange', updateBatteryInfo);
    }).catch(() => {
      // Fallback silently to simulated store battery
    });

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => {});
        batteryInstance.removeEventListener('chargingchange', () => {});
      }
    };
  }, [isLowPowerMode, setBatteryLevel, setLowPowerMode]);

  const effectiveBatteryLevel = hardwareLevel ?? batteryLevel;
  const effectiveCharging = hardwareCharging ?? isCharging;

  // Auto Low Power mode condition (manual toggle OR battery <= 20% discharging)
  const isAutoLowPower = effectiveBatteryLevel <= 20 && !effectiveCharging;
  const isPowerSavingActive = isLowPowerMode || isAutoLowPower;

  // Throttled sync intervals: 30 seconds for power saving vs 5 seconds for normal
  const syncIntervalMs = isPowerSavingActive ? 30000 : 5000;
  const telemetryRefreshMs = isPowerSavingActive ? 15000 : 2500;
  const throttleFactor = isPowerSavingActive ? 6 : 1;

  const toggleSaver = useCallback(() => {
    haptics.trigger('selection');
    toggleLowPowerMode();
  }, [toggleLowPowerMode]);

  return {
    isLowPowerMode: isPowerSavingActive,
    isManualLowPower: isLowPowerMode,
    isAutoLowPower,
    batteryLevel: effectiveBatteryLevel,
    isCharging: effectiveCharging,
    hasHardwareBattery,
    syncIntervalMs,
    telemetryRefreshMs,
    throttleFactor,
    toggleLowPowerMode: toggleSaver,
    setLowPowerMode,
    powerStatusLabel: isPowerSavingActive 
      ? 'Économie d’énergie (Syncs réduits à 30s)' 
      : 'Performance Normale (Live 5s)'
  };
}
