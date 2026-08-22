import { useEffect, useRef, useState, useCallback } from 'react';
import { AppId, AppLifecycleState } from '../types';
import { useOSStore } from '../store/osStore';
import { appLifecycle } from '../services/appLifecycle';

interface UseAppLifecycleOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onChange?: (state: AppLifecycleState, prevState?: AppLifecycleState) => void;
}

export function useAppLifecycle(appId: AppId | string, options: UseAppLifecycleOptions = {}) {
  const activeApp = useOSStore(state => state.activeApp);
  const isLowPowerMode = useOSStore(state => state.isLowPowerMode);
  const [lifecycleState, setLifecycleState] = useState<AppLifecycleState>(() => {
    return activeApp === appId ? 'active' : 'inactive';
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const isActive = activeApp === appId && lifecycleState === 'active';
  const isPaused = lifecycleState === 'paused' || lifecycleState === 'background';

  // Handle activeApp changes
  useEffect(() => {
    if (activeApp === appId) {
      setLifecycleState('active');
      appLifecycle.transition(appId, 'active', 'open');
    } else {
      setLifecycleState('inactive');
      appLifecycle.transition(appId, 'inactive', 'close');
    }
  }, [activeApp, appId]);

  // Register with global AppLifecycle service for document visibility/focus
  useEffect(() => {
    const unsubscribe = appLifecycle.register(appId, {
      onOpen: () => optionsRef.current.onOpen?.(),
      onClose: () => optionsRef.current.onClose?.(),
      onFocus: () => optionsRef.current.onFocus?.(),
      onBlur: () => optionsRef.current.onBlur?.(),
      onPause: () => {
        setLifecycleState('paused');
        optionsRef.current.onPause?.();
      },
      onResume: () => {
        setLifecycleState('active');
        optionsRef.current.onResume?.();
      },
      onChange: (state, prev) => {
        setLifecycleState(state);
        optionsRef.current.onChange?.(state, prev);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [appId]);

  /**
   * Helper hook utility to run background syncs only when active and throttle on low power
   */
  const createLifecycleInterval = useCallback((
    callback: () => void, 
    baseIntervalMs: number = 5000, 
    lowPowerIntervalMs: number = 30000
  ) => {
    if (!isActive) return () => {};

    const effectiveInterval = isLowPowerMode ? lowPowerIntervalMs : baseIntervalMs;
    const intervalId = window.setInterval(() => {
      if (appLifecycle.isAppActive(appId)) {
        callback();
      }
    }, effectiveInterval);

    return () => clearInterval(intervalId);
  }, [isActive, isLowPowerMode, appId]);

  return {
    lifecycleState,
    isActive,
    isPaused,
    isLowPowerMode,
    createLifecycleInterval
  };
}
