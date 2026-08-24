// Centralized AppEventBus Service for OMK Mobile OS
// Enables cross-application communication, reactive UI sync, and inter-module event pipelines
import { useOSStore } from '../store/osStore';
import { AppId, AppEvent, Candidat, Entreprise, TransactionAffiliation, ProjetCirculaire } from '../types';

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
  
  // JAAS & MÉTIER FLOW EVENTS
  AFFILIATE_REFERRAL_CREDITED: 'referral:credited',
  CANDIDAT_DISPATCHED: 'candidat:dispatched',
  COMPANY_REGISTERED: 'company:registered',
  REFERRAL_CREDITED: 'referral:credited',
  CANDIDAT_CREATED: 'candidat:created',
  CANDIDAT_STATUS_UPDATED: 'candidat:status_updated',
  PROJET_CIRCULAIRE_UPDATED: 'projet:circulaire_updated',
  FORMATION_ENROLLED: 'formation:enrolled',
  SIMULATION_COMPLETED: 'simulation:completed',
  CONTRACT_SIGNED: 'contract:signed',
  
  // SYSTEM EVENTS
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
   * Helper to dispatch candidate multi-dispatch event
   */
  public static emitCandidatDispatched(candidat: Partial<Candidat>, companyName: string, missionId?: string): void {
    AppEventBus.emit('candidat:dispatched', 'jaas-job', {
      candidatId: candidat.id,
      candidatNom: candidat.nomComplet || candidat.fullName,
      posteCible: candidat.posteCible || candidat.roleTarget,
      companyName,
      missionId,
      dispatchedAt: new Date().toISOString(),
      slaHours: 48
    });
  }

  /**
   * Helper to register a partner company
   */
  public static emitCompanyRegistered(company: Partial<Entreprise>): void {
    AppEventBus.emit('company:registered', 'jaas-job', {
      companyId: company.id,
      companyName: company.nom,
      secteur: company.secteur,
      bassin: company.bassin,
      registeredAt: new Date().toISOString()
    });
  }

  /**
   * Helper to credit a referral transaction ($50/filleul)
   */
  public static emitReferralCredited(transaction: Partial<TransactionAffiliation>): void {
    AppEventBus.emit('referral:credited', 'jaas-job', {
      transactionId: transaction.id,
      parrainNom: transaction.parrainNom,
      parrainEmail: transaction.parrainEmail,
      filleulNom: transaction.filleulNom,
      filleulEmail: transaction.filleulEmail,
      montantCommission: transaction.montantCommission || 50,
      timestamp: Date.now()
    });
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

