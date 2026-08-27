import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Sparkles, MessageSquare, Bot, ArrowUpRight, 
  CornerDownLeft, RefreshCw, Zap, Shield, ChevronDown
} from 'lucide-react';
import { useOSStore } from '../store/osStore';
import { haptics } from '../services/haptics';
import { CoachAgent } from '../types';

function DraggableAgentAvatar({
  agent,
  containerRef,
  onToggleChat,
  onSendMessage
}: {
  agent: CoachAgent;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggleChat: () => void;
  onSendMessage: (text: string) => void;
}) {
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const setAgentPosition = useOSStore((state) => state.setAgentPosition);
  const setAgentActive = useOSStore((state) => state.setAgentActive);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    haptics.trigger('light');
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    haptics.trigger('light');
    onSendMessage(prompt);
  };

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.05}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const parentW = containerRef.current?.clientWidth || 360;
        const parentH = containerRef.current?.clientHeight || 740;

        const rawNewX = agent.position.x + info.offset.x;
        const rawNewY = agent.position.y + info.offset.y;

        // Gestuelle "Flick / Push off-screen" pour ranger/désactiver l'assistant
        const isFlickedOffscreen = (
          rawNewX < -25 || 
          rawNewX > parentW - 25 || 
          rawNewY < 15 || 
          rawNewY > parentH - 30 ||
          Math.abs(info.velocity.x) > 600 ||
          Math.abs(info.velocity.y) > 600
        );

        if (isFlickedOffscreen) {
          haptics.trigger('warning');
          // Désactivation instantanée : l'agent est rangé et sa position est préparée pour réapparition propre
          setAgentActive(agent.id, false);
          return;
        }

        // Si l'agent reste à l'écran, clamping strict aux marges intérieures sécurisées
        const clampedX = Math.max(12, Math.min(parentW - 65, rawNewX));
        const clampedY = Math.max(55, Math.min(parentH - 110, rawNewY));

        setAgentPosition(agent.id, {
          x: clampedX,
          y: clampedY
        });
      }}
      initial={{ x: agent.position.x, y: agent.position.y, scale: 0.8, opacity: 0 }}
      animate={{ 
        x: agent.position.x, 
        y: agent.position.y, 
        scale: 1, 
        opacity: 1 
      }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      className="absolute top-0 left-0 pointer-events-auto select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="relative group flex flex-col items-center">
        {/* Floating Avatar Character */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (!isDragging) {
              haptics.trigger('selection');
              onToggleChat();
            }
          }}
          className={`relative w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-xl border cursor-grab active:cursor-grabbing transition-all backdrop-blur-md ${
            agent.isChatOpen
              ? 'bg-emerald-500/25 border-emerald-400 ring-4 ring-emerald-500/20 shadow-emerald-500/30'
              : 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/50'
          }`}
        >
          {/* Animated Avatar Character Emoji */}
          <span className="drop-shadow-md animate-bounce-short">
            {agent.iconEmoji}
          </span>

          {/* Online Radar Pulse Beacon */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950" />
          </span>

          {/* Mini name tag badge underneath */}
          <div className="absolute -bottom-2 px-1.5 py-0.2 rounded-md bg-slate-950/90 border border-slate-800 text-[8.5px] font-black tracking-tight text-slate-300 whitespace-nowrap shadow-sm">
            {agent.avatarName}
          </div>
        </motion.button>

        {/* Floating Chat Dialogue Bubble (Constrained within Mobile Chassis Viewport) */}
        <AnimatePresence>
          {agent.isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`absolute top-15 w-[260px] sm:w-[280px] bg-slate-950/95 border border-slate-700/90 rounded-3xl shadow-2xl p-3.5 text-slate-100 backdrop-blur-2xl z-50 overflow-hidden theme-transition ${
                agent.position.x > 150 ? 'right-0 -translate-x-4' : 'left-0 translate-x-2'
              }`}
            >
              {/* Dialogue Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm">
                    {agent.iconEmoji}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{agent.name}</h4>
                    <span className="text-[9px] text-emerald-400 font-mono">{agent.role}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.trigger('selection');
                    onToggleChat();
                  }}
                  className="w-6 h-6 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Proactive Speech Message History */}
              <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 mb-2.5 scrollbar-hide text-xs">
                {agent.messages.slice(-4).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-2xl text-[11px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium ml-4 rounded-br-xs'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 mr-2 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {agent.status === 'thinking' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono py-1">
                    <Sparkles size={11} className="animate-spin" />
                    <span>Réflexion en cours...</span>
                  </div>
                )}
              </div>

              {/* Quick Suggestion Action Chip */}
              <button
                onClick={() => handleQuickPrompt(agent.suggestedPrompt)}
                className="w-full mb-2 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-[10px] text-left text-slate-300 hover:text-emerald-300 flex items-center justify-between gap-1 transition-colors group"
              >
                <span className="truncate flex-1">💡 {agent.suggestedPrompt}</span>
                <ArrowUpRight size={11} className="shrink-0 opacity-60 group-hover:opacity-100" />
              </button>

              {/* Direct Question Form Input */}
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Demander à ${agent.avatarName}...`}
                  className="w-full py-1.5 pl-3 pr-8 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-1 w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 flex items-center justify-center transition-all"
                >
                  <Send size={11} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Optimization (Bolt ⚡): Use fine-grained Zustand store selectors and React.memo
// to prevent full component overlay re-renders on unrelated OS state changes.
export const DesktopAgentsOverlay = React.memo(function DesktopAgentsOverlay() {
  const agents = useOSStore((state) => state.agents);
  const toggleAgentChat = useOSStore((state) => state.toggleAgentChat);
  const sendAgentMessage = useOSStore((state) => state.sendAgentMessage);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeAgents = agents.filter(a => a.isActive);

  if (activeAgents.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
    >
      {activeAgents.map((agent) => (
        <DraggableAgentAvatar
          key={agent.id}
          agent={agent}
          containerRef={containerRef}
          onToggleChat={() => toggleAgentChat(agent.id)}
          onSendMessage={(text) => sendAgentMessage(agent.id, text)}
        />
      ))}
    </div>
  );
});

export default DesktopAgentsOverlay;
