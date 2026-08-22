import { create } from 'zustand';
import { focusAudio, SOUND_TRACKS } from '../services/focusAudio';
import { haptics } from '../services/haptics';

export type DynamicIslandTab = 'workspace' | 'media' | 'ai' | 'pomodoro' | 'call';

export interface IncomingCallState {
  callerName: string;
  callerTitle: string;
  company: string;
  avatarUrl?: string;
  durationSec: number;
  status: 'ringing' | 'connected' | 'ended';
  isMuted: boolean;
}

interface DynamicIslandStore {
  isExpanded: boolean;
  activeTab: DynamicIslandTab;
  isFaceIdActive: boolean;
  activeCall: IncomingCallState | null;
  transientToast: { title: string; subtitle: string; icon?: string } | null;
  
  // Pomodoro
  pomodoroSeconds: number;
  pomodoroInitial: number;
  isPomodoroRunning: boolean;
  pomodoroMode: 'work' | 'break';

  // AI Capsule
  aiPrompt: string;
  aiResponse: string | null;
  isAiProcessing: boolean;

  // Actions
  setIsExpanded: (expanded: boolean) => void;
  setActiveTab: (tab: DynamicIslandTab) => void;
  triggerFaceID: () => void;
  showTransientToast: (title: string, subtitle: string, durationMs?: number) => void;
  
  // Call simulation
  startSimulatedCall: (name?: string, title?: string, company?: string) => void;
  acceptCall: () => void;
  declineCall: () => void;
  toggleMuteCall: () => void;
  
  // Pomodoro actions
  startPomodoro: (seconds?: number) => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;

  // AI Capsule actions
  setAiPrompt: (prompt: string) => void;
  runAiDiagnostic: (presetPrompt?: string) => Promise<void>;
}

export const useDynamicIslandStore = create<DynamicIslandStore>((set, get) => ({
  isExpanded: false,
  activeTab: 'workspace',
  isFaceIdActive: false,
  activeCall: null,
  transientToast: null,

  pomodoroSeconds: 25 * 60,
  pomodoroInitial: 25 * 60,
  isPomodoroRunning: false,
  pomodoroMode: 'work',

  aiPrompt: '',
  aiResponse: null,
  isAiProcessing: false,

  setIsExpanded: (expanded) => {
    haptics.trigger('selection');
    set({ isExpanded: expanded });
  },

  setActiveTab: (tab) => {
    haptics.trigger('selection');
    set({ activeTab: tab });
  },

  triggerFaceID: () => {
    haptics.trigger('light');
    set({ isFaceIdActive: true });
    setTimeout(() => {
      haptics.trigger('success');
      set({ isFaceIdActive: false });
    }, 1800);
  },

  showTransientToast: (title, subtitle, durationMs = 2500) => {
    haptics.trigger('light');
    set({ transientToast: { title, subtitle } });
    setTimeout(() => {
      set({ transientToast: null });
    }, durationMs);
  },

  startSimulatedCall: (
    name = 'Alexandre de Mortier',
    title = 'Head of Cloud & Enterprise Data',
    company = 'Nexar Corp (Sponsor)'
  ) => {
    haptics.trigger('appLaunch');
    set({
      activeCall: {
        callerName: name,
        callerTitle: title,
        company,
        durationSec: 0,
        status: 'ringing',
        isMuted: false
      },
      activeTab: 'call',
      isExpanded: true
    });
  },

  acceptCall: () => {
    haptics.trigger('success');
    set(state => {
      if (!state.activeCall) return state;
      return {
        activeCall: {
          ...state.activeCall,
          status: 'connected'
        }
      };
    });
  },

  declineCall: () => {
    haptics.trigger('appClose');
    set(state => {
      if (!state.activeCall) return state;
      return {
        activeCall: {
          ...state.activeCall,
          status: 'ended'
        }
      };
    });
    setTimeout(() => {
      set({ activeCall: null, isExpanded: false });
    }, 600);
  },

  toggleMuteCall: () => {
    haptics.trigger('light');
    set(state => {
      if (!state.activeCall) return state;
      return {
        activeCall: {
          ...state.activeCall,
          isMuted: !state.activeCall.isMuted
        }
      };
    });
  },

  startPomodoro: (seconds = 25 * 60) => {
    haptics.trigger('medium');
    set({
      isPomodoroRunning: true,
      pomodoroSeconds: seconds,
      pomodoroInitial: seconds
    });
  },

  pausePomodoro: () => {
    haptics.trigger('light');
    set(state => ({ isPomodoroRunning: !state.isPomodoroRunning }));
  },

  resetPomodoro: () => {
    haptics.trigger('light');
    set(state => ({
      isPomodoroRunning: false,
      pomodoroSeconds: state.pomodoroInitial
    }));
  },

  tickPomodoro: () => {
    set(state => {
      if (!state.isPomodoroRunning || state.pomodoroSeconds <= 0) {
        if (state.pomodoroSeconds === 0 && state.isPomodoroRunning) {
          haptics.trigger('success');
          return {
            isPomodoroRunning: false,
            pomodoroSeconds: state.pomodoroMode === 'work' ? 5 * 60 : 25 * 60,
            pomodoroMode: state.pomodoroMode === 'work' ? 'break' : 'work'
          };
        }
        return state;
      }
      return { pomodoroSeconds: state.pomodoroSeconds - 1 };
    });
  },

  setAiPrompt: (prompt) => set({ aiPrompt: prompt }),

  runAiDiagnostic: async (presetPrompt?: string) => {
    const query = presetPrompt || get().aiPrompt || 'Analyse de santé de la stack BaaS';
    haptics.trigger('medium');
    set({ isAiProcessing: true, aiPrompt: query, aiResponse: null });

    await new Promise(resolve => setTimeout(resolve, 1400));

    let reply = '';
    if (query.toLowerCase().includes('mrr') || query.toLowerCase().includes('client')) {
      reply = '✅ Audit MRR : Croissance saine +14.2% MoM. 2 clients identifiés avec un potentiel d\'expansion (+4 800 €/m). Zéro risque de désabonnement critique.';
    } else if (query.toLowerCase().includes('santé') || query.toLowerCase().includes('system') || query.toLowerCase().includes('latence')) {
      reply = '⚡ Diagnostic Cluster : Latence P99 à 24ms, Quotas Firestore 42% utilisés. Zéro goulot d\'étranglement sur le circuit offline-first.';
    } else if (query.toLowerCase().includes('nettoy') || query.toLowerCase().includes('cache')) {
      reply = '🧹 Optimisation terminée : 1.8 Mo de métriques périmées purgées. Index Firestore réalignés, vitesse de requête +18%.';
    } else {
      reply = `🧠 Copilot : Requête "${query}" traitée. Toutes les connexions RPC et micro-services BaaS fonctionnent à leur niveau nominal.`;
    }

    haptics.trigger('success');
    set({ isAiProcessing: false, aiResponse: reply });
  }
}));
