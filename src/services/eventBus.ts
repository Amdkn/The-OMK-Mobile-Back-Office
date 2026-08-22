// Centralized AppEventBus Service for OMK Mobile OS
// Enables cross-application communication, reactive UI sync, and inter-module event pipelines
import { useOSStore } from '../store/osStore';
import { AppId, AppEvent } from '../types';

export const OMK_EVENTS = {
  CLIENT_CREATED: 'OMK_CLIENT_CREATED',
  CLIENT_UPDATED: 'OMK_CLIENT_UPDATED',
  CLIENT_DELETED: 'OMK_CLIENT_DELETED',
  LEAD_CREATED: 'OMK_LEAD_CREATED',
  LEAD_STATUS_CHANGED: 'OMK_LEAD_STATUS_CHANGED',
  FINANCE_TRANSACTION: 'OMK_FINANCE_TRANSACTION',
  FINANCE_INVOICE_PAID: 'OMK_FINANCE_INVOICE_PAID',
  PAAS_CLUSTER_SCALED: 'OMK_PAAS_CLUSTER_SCALED',
  TASK_COMPLETED: 'OMK_TASK_COMPLETED',
  REFRESH_ALL: 'OMK_REFRESH_ALL',
  WORKSPACE_CHANGED: 'WORKSPACE_CHANGED'
} as const;

export type OMKEventType = typeof OMK_EVENTS[keyof typeof OMK_EVENTS] | string;

export class AppEventBus {
  /**
   * Dispatches an event to the global OS store
   */
  public static emit<T = any>(type: OMKEventType, sender: AppId | 'system', payload?: T): void {
    const store = useOSStore.getState();
    store.emitEvent(type, sender, payload);
  }

  /**
   * Gets the last emitted event of a specific type
   */
  public static getLastEvent<T = any>(type: OMKEventType): AppEvent<T> | undefined {
    return useOSStore.getState().lastEventByType[type];
  }

  /**
   * Subscribe to specific event types
   */
  public static subscribe(
    targetType: OMKEventType | OMKEventType[],
    callback: (event: AppEvent) => void
  ): () => void {
    const types = Array.isArray(targetType) ? targetType : [targetType];
    
    // Subscribe to zustand store changes
    const unsubscribe = useOSStore.subscribe((state, prevState) => {
      if (state.events.length > 0 && state.events[0] !== prevState.events[0]) {
        const latest = state.events[0];
        if (types.includes(latest.type) || types.includes('*')) {
          callback(latest);
        }
      }
    });

    return unsubscribe;
  }
}
