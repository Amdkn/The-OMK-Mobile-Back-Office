import { useEffect, useRef } from 'react';
import { useOSStore } from '../store/osStore';
import { AppEvent, AppId } from '../types';
import { OMKEventType } from '../services/eventBus';

/**
 * Custom hook to listen for AppEventBus events in React components
 * Automatically handles subscription lifecycle and unsubscription
 */
export function useAppEventListener(
  targetType: OMKEventType | OMKEventType[],
  callback: (event: AppEvent) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const targetTypes = Array.isArray(targetType) ? targetType : [targetType];

  useEffect(() => {
    const unsubscribe = useOSStore.subscribe((state, prevState) => {
      if (state.events.length > 0 && state.events[0] !== prevState.events[0]) {
        const latest = state.events[0];
        if (targetTypes.includes(latest.type) || targetTypes.includes('*')) {
          callbackRef.current(latest);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [targetTypes.join(',')]);
}

/**
 * Hook to easily emit events from components
 */
export function useAppEventEmitter(senderAppId: AppId | 'system') {
  const emitEvent = useOSStore(state => state.emitEvent);
  
  return {
    emit: (type: OMKEventType, payload?: any) => {
      emitEvent(type, senderAppId, payload);
    }
  };
}
