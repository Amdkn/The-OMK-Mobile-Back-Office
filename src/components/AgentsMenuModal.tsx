import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Bot, Sparkles, Power, Check, Shield, Zap, 
  MessageSquare, Sliders, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useOSStore } from '../store/osStore';
import { haptics } from '../services/haptics';
import { CoachAgent } from '../types';

export default function AgentsMenuModal() {
  const { 
    isAgentsMenuOpen, 
    closeAgentsMenu, 
    agents, 
    toggleAgentActive, 
    setAgentActive,
    turnOffAllAgents,
    activateAllAgents,
    theme 
  } = useOSStore();

  const activeAgentsCount = agents.filter(a => a.isActive).length;

  const handleIsolateAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('selection');
    agents.forEach(a => {
      setAgentActive(a.id, a.id === agentId);
    });
  };

  return (
    <AnimatePresence>
      {isAgentsMenuOpen && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex flex-col justify-start pt-14 pb-6 px-3 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAgentsMenu}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* Popover Window (Web Desktop / Ryos style) */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-h-[82vh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 backdrop-blur-2xl theme-transition"
          >
            {/* Header Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SUR LE BUREAU</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeAgentsCount} Actif{activeAgentsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-100 tracking-tight">Coach OS Assistants</h2>
                </div>
              </div>

              <button
                onClick={closeAgentsMenu}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-header notification/info */}
            <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Activez les assistants pour les déployer sur l'écran</span>
              <button 
                onClick={activateAllAgents}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Tout activer
              </button>
            </div>

            {/* List of Agents */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hide">
              {agents.map((agent) => {
                const isActive = agent.isActive;

                return (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgentActive(agent.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-slate-850 border-emerald-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850/60 opacity-80'
                    }`}
                  >
                    {/* Left: Avatar Emoji & Persona Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border shrink-0 transition-transform ${
                        isActive 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-slate-800 border-emerald-500/40 scale-105 shadow-inner' 
                          : 'bg-slate-800 border-slate-700'
                      }`}>
                        <span>{agent.iconEmoji}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-100 truncate">{agent.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {agent.avatarName}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 truncate mt-0.5">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    {/* Right: Isolate button & Toggle Switch */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleIsolateAgent(agent.id, e)}
                        title="Afficher uniquement cet assistant"
                        className="px-2 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                      >
                        Seul
                      </button>

                      {/* iOS/Web style toggle switch */}
                      <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                        isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                      }`}>
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={turnOffAllAgents}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Power size={14} className="text-rose-400" />
                <span>Éteindre les assistants</span>
              </button>

              <button
                onClick={closeAgentsMenu}
                className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Terminé
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
