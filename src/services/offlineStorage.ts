import localforage from 'localforage';
import { AppId } from '../types';

// Configure dedicated localforage instances for robust IndexedDB caching
const appViewerStore = localforage.createInstance({
  name: 'OMK_Mobile_OS',
  storeName: 'appviewer_cache',
  description: 'IndexedDB cache for all OMK Mobile OS AppViewer modules and offline states'
});

const systemStateStore = localforage.createInstance({
  name: 'OMK_Mobile_OS',
  storeName: 'system_state_cache',
  description: 'Cached snapshots of system events, settings, and widget configurations'
});

export interface CachedModuleEntry<T = any> {
  appId: AppId | string;
  data: T;
  cachedAt: number;
  workspace: string;
  version: number;
}

export class OfflineStorageService {
  private static isInitialized = false;

  public static async init() {
    if (this.isInitialized) return;
    try {
      await appViewerStore.ready();
      await systemStateStore.ready();
      this.isInitialized = true;
    } catch (e) {
      console.warn('IndexedDB initialization fallback to memory/localStorage', e);
    }
  }

  /**
   * Save and cache module data to IndexedDB
   */
  public static async cacheAppData<T>(
    appId: AppId | string, 
    workspace: string, 
    data: T
  ): Promise<void> {
    try {
      const key = `${workspace}_${appId}`;
      const entry: CachedModuleEntry<T> = {
        appId,
        data,
        cachedAt: Date.now(),
        workspace,
        version: 1
      };
      await appViewerStore.setItem(key, entry);
    } catch (error) {
      console.error(`Failed to cache data for ${appId} in IndexedDB:`, error);
    }
  }

  /**
   * Retrieve cached module data from IndexedDB with fallback
   */
  public static async getCachedAppData<T>(
    appId: AppId | string, 
    workspace: string, 
    fallbackData?: T
  ): Promise<T | null> {
    try {
      const key = `${workspace}_${appId}`;
      const entry = await appViewerStore.getItem<CachedModuleEntry<T>>(key);
      if (entry && entry.data) {
        return entry.data;
      }
    } catch (error) {
      console.warn(`Failed to read cached data for ${appId}:`, error);
    }
    return fallbackData ?? null;
  }

  /**
   * Check if running in browser offline mode
   */
  public static isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  /**
   * Listen to online / offline network events
   */
  public static listenNetworkStatus(callback: (isOnline: boolean) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Clear cache for a specific module or all
   */
  public static async clearAppCache(appId?: AppId | string, workspace?: string): Promise<void> {
    try {
      if (appId && workspace) {
        await appViewerStore.removeItem(`${workspace}_${appId}`);
      } else {
        await appViewerStore.clear();
      }
    } catch (e) {
      console.warn('Error clearing IndexedDB cache', e);
    }
  }

  /**
   * Pre-seed default offline data for critical modules so the app is instantly functional offline
   */
  public static async seedDefaultOfflineCache(workspace: string = 'Sandbox') {
    const seedData: Record<string, any> = {
      finance: {
        mrr: 124500,
        runwayMonths: 18,
        invoices: [
          { id: 'INV-2026-94', client: 'Quantum Logic', amount: 42000, status: 'paid', date: '2026-08-18' },
          { id: 'INV-2026-95', client: 'Apex Corp', amount: 28500, status: 'pending', date: '2026-08-20' },
          { id: 'INV-2026-96', client: 'SaaS Prime', amount: 15000, status: 'paid', date: '2026-08-15' }
        ],
        cashBalance: 840000
      },
      clients: [
        { id: 'cli-1', name: 'Apex Corp', status: 'active', mrr: 28500, healthScore: 98, tier: 'Enterprise' },
        { id: 'cli-2', name: 'Quantum Logic', status: 'active', mrr: 42000, healthScore: 95, tier: 'Enterprise' },
        { id: 'cli-3', name: 'HyperScale AI', status: 'active', mrr: 19000, healthScore: 91, tier: 'Scale' },
        { id: 'cli-4', name: 'Fintech Hub', status: 'active', mrr: 15000, healthScore: 96, tier: 'Growth' },
        { id: 'cli-5', name: 'Omni Retail', status: 'active', mrr: 12000, healthScore: 89, tier: 'Growth' },
        { id: 'cli-6', name: 'CyberShield IO', status: 'active', mrr: 8000, healthScore: 94, tier: 'Starter' }
      ],
      operations: {
        sprint: 'Sprint S34 - Hardening & SOC2',
        completedTasks: 18,
        totalTasks: 20,
        blockersResolved: 2,
        leadTimeDays: 2.4
      },
      'paas-pro': {
        pods: 8,
        uptime: '99.99%',
        latencyP99: 28,
        clusterRegion: 'Frankfurt (eu-central-1)',
        deploymentsCount: 142
      },
      security: {
        shieldStatus: 'Active & Enforced',
        vulnerabilities: 0,
        lastFidoAuth: 'Frankfurt-02 Key Verified',
        zeroTrustPolicy: 'Strict RBAC + FIDO2 Hardware Token'
      }
    };

    for (const [appId, data] of Object.entries(seedData)) {
      await this.cacheAppData(appId, workspace, data);
    }
  }
}

// Auto initialize on import
OfflineStorageService.init();
