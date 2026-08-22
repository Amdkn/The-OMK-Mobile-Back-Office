import { AppId, AppLifecycleState } from '../types';
import { useOSStore } from '../store/osStore';

type LifecycleCallback = (state: AppLifecycleState, prev?: AppLifecycleState) => void;

interface AppLifecycleListeners {
  onOpen?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onChange?: LifecycleCallback;
}

class AppLifecycleService {
  private listeners: Map<string, Set<AppLifecycleListeners>> = new Map();
  private states: Map<string, AppLifecycleState> = new Map();
  private isDocumentVisible: boolean = true;
  private isWindowFocused: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isDocumentVisible = document.visibilityState === 'visible';
      this.isWindowFocused = document.hasFocus ? document.hasFocus() : true;

      document.addEventListener('visibilitychange', () => {
        const visible = document.visibilityState === 'visible';
        this.isDocumentVisible = visible;
        this.handleGlobalVisibilityChange(visible);
      });

      window.addEventListener('focus', () => {
        this.isWindowFocused = true;
        this.handleGlobalFocusChange(true);
      });

      window.addEventListener('blur', () => {
        this.isWindowFocused = false;
        this.handleGlobalFocusChange(false);
      });
    }
  }

  private handleGlobalVisibilityChange(isVisible: boolean) {
    const activeApp = useOSStore.getState().activeApp;
    if (!activeApp) return;

    if (isVisible) {
      this.transition(activeApp, 'active', 'resume');
    } else {
      this.transition(activeApp, 'paused', 'pause');
    }
  }

  private handleGlobalFocusChange(isFocused: boolean) {
    const activeApp = useOSStore.getState().activeApp;
    if (!activeApp) return;

    if (isFocused) {
      this.transition(activeApp, 'active', 'focus');
    } else {
      this.transition(activeApp, 'paused', 'blur');
    }
  }

  public register(appId: AppId | string, callbacks: AppLifecycleListeners): () => void {
    if (!this.listeners.has(appId)) {
      this.listeners.set(appId, new Set());
    }
    this.listeners.get(appId)!.add(callbacks);

    // Initial state check
    const currentActiveApp = useOSStore.getState().activeApp;
    const currentState = currentActiveApp === appId ? 'active' : 'inactive';
    this.states.set(appId, currentState);

    return () => {
      const set = this.listeners.get(appId);
      if (set) {
        set.delete(callbacks);
        if (set.size === 0) {
          this.listeners.delete(appId);
        }
      }
    };
  }

  public transition(appId: AppId | string, newState: AppLifecycleState, reason?: string) {
    const prevState = this.states.get(appId) || 'inactive';
    if (prevState === newState) return;

    this.states.set(appId, newState);
    useOSStore.getState().setAppLifecycleState(appId, newState);

    const listeners = this.listeners.get(appId);
    if (listeners) {
      listeners.forEach(cb => {
        cb.onChange?.(newState, prevState);
        if (newState === 'active') {
          if (prevState === 'inactive') cb.onOpen?.();
          else if (prevState === 'paused' || prevState === 'background') cb.onResume?.();
          cb.onFocus?.();
        } else if (newState === 'paused') {
          cb.onPause?.();
          cb.onBlur?.();
        } else if (newState === 'inactive') {
          cb.onClose?.();
          cb.onBlur?.();
        }
      });
    }

    // Broadcast through system event bus
    useOSStore.getState().emitEvent('LIFECYCLE_TRANSITION', 'system', {
      appId,
      state: newState,
      prevState,
      reason
    });
  }

  public getState(appId: AppId | string): AppLifecycleState {
    return this.states.get(appId) || 'inactive';
  }

  public isAppActive(appId: AppId | string): boolean {
    return this.getState(appId) === 'active' && this.isDocumentVisible;
  }
}

export const appLifecycle = new AppLifecycleService();
