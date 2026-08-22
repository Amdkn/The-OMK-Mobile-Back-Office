import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Database, Code, Play, Pause, Volume2, 
  Sparkles, Bot, Clock, RotateCcw, Phone, PhoneOff, Mic, MicOff,
  Activity, ShieldCheck, Waves, Cpu, RefreshCw, X
} from 'lucide-react';
import { Paradigm } from '../types';
import { useOSStore, Workspace } from '../store/osStore';
import { useDynamicIslandStore } from '../store/dynamicIslandStore';
import { focusAudio, SOUND_TRACKS } from '../services/focusAudio';
import { haptics } from '../services/haptics';

export const triggerFaceID = () => {
  useDynamicIslandStore.getState().triggerFaceID();
};

export default function DynamicIsland({ paradigm }: { paradigm: Paradigm }) {
  const { workspace, setWorkspace } = useOSStore();
  const {
    isExpanded,
    setIsExpanded,
    activeTab,
    setActiveTab,
    isFaceIdActive,
    triggerFaceID: triggerFaceIdAction,
    activeCall,
    startSimulatedCall,
    acceptCall,
    declineCall,
    toggleMuteCall,
    transientToast,
    showTransientToast,
    pomodoroSeconds,
    isPomodoroRunning,
    pomodoroMode,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    tickPomodoro,
    aiPrompt,
    setAiPrompt,
    aiResponse,
    isAiProcessing,
    runAiDiagnostic
  } = useDynamicIslandStore();

  const islandRef = useRef<HTMLDivElement>(null);

  // Audio State from Focus Audio Service
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(SOUND_TRACKS[0].id);
  const [audioVolume, setAudioVolume] = useState(0.5);

  useEffect(() => {
    const unsub = focusAudio.subscribe((playing, trackId, vol) => {
      setIsPlayingAudio(playing);
      setCurrentTrackId(trackId);
      setAudioVolume(vol);
    });
    return unsub;
  }, []);

  // Pomodoro Interval ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPomodoroRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomodoroRunning, tickPomodoro]);

  // Call duration counter
  const [callDuration, setCallDuration] = useState(0);
  useEffect(() => {
    let callTimer: NodeJS.Timeout | null = null;
    if (activeCall && activeCall.status === 'connected') {
      callTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (callTimer) clearInterval(callTimer);
    };
  }, [activeCall?.status]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        if (isExpanded) {
          setIsExpanded(false);
        }
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, setIsExpanded]);

  const workspaces: { name: Workspace; icon: any; color: string; bg: string; desc: string; badge: string }[] = [
    { name: 'Sandbox', icon: Code, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-400', desc: 'Isolé (IndexedDB local)', badge: 'LOCAL' },
    { name: 'Development', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-400', desc: 'Connecté (Dev DB)', badge: 'DEV DB' },
    { name: 'Production', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-400', desc: 'Live (Prod DB Cloud)', badge: 'PROD LIVE' },
  ];

  const currentTrack = useMemo(() => {
    return SOUND_TRACKS.find(t => t.id === currentTrackId) || SOUND_TRACKS[0];
  }, [currentTrackId]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeWsConfig = useMemo(() => {
    return workspaces.find(w => w.name === workspace) || workspaces[0];
  }, [workspace]);

  // Android punch-hole minimalist camera
  if (paradigm === 'android') {
    return (
      <div 
        onClick={() => {
          haptics.trigger('selection');
          triggerFaceIdAction();
        }}
        className="w-4 h-4 bg-black rounded-full border border-slate-700 shadow-inner mt-2 pointer-events-auto cursor-pointer flex items-center justify-center group"
        title="Capteur photo & Biométrie"
      >
        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full group-hover:bg-cyan-400 transition-colors" />
      </div>
    );
  }

  // Fixed compact width to guarantee zero overlap with status bar icons
  const compactWidth = isFaceIdActive 
    ? 140 
    : activeCall 
      ? 165 
      : transientToast 
        ? 160 
        : 124;

  const compactHeight = isFaceIdActive ? 40 : 30;

  const expandedHeight = activeTab === 'call' && activeCall 
    ? 330 
    : activeTab === 'ai' 
      ? 370 
      : 345;

  return (
    <>
      {/* 1. Backdrop Isolation Dimmer: ensures 100% readability without background bleed */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 cursor-pointer pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* 2. Dynamic Island Outer Container */}
      <div className="relative pointer-events-auto flex justify-center z-50">
        <motion.div
          ref={islandRef}
          className="text-slate-50 shadow-[0_25px_70px_rgba(0,0,0,0.95)] border border-slate-700 overflow-hidden select-none"
          style={{
            backgroundColor: '#070a11', // 100% Solid Opaque Dark Matte background
            borderRadius: isExpanded ? 32 : 22,
          }}
          initial={false}
          animate={{
            width: isExpanded ? 356 : compactWidth,
            height: isExpanded ? expandedHeight : compactHeight,
            y: isExpanded ? 4 : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 35,
            mass: 0.5
          }}
          onClick={() => {
            if (!isExpanded && !isFaceIdActive) {
              setIsExpanded(true);
            }
          }}
        >
          {/* COMPACT MODE */}
          {!isExpanded && (
            <div className="w-full h-full flex items-center justify-between px-2.5">
              {/* Case A: Face ID Active */}
              {isFaceIdActive ? (
                <div className="w-full h-full flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-emerald-400 rounded-sm border-t-0 border-r-0 rotate-45 animate-pulse" />
                      <div className="absolute inset-0 border-2 border-emerald-400 rounded-sm border-b-0 border-l-0 rotate-45 animate-pulse" />
                      <ShieldCheck size={11} className="text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 tracking-wider">Face ID</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              ) : transientToast ? (
                /* Case B: Transient Toast */
                <div className="w-full h-full flex items-center justify-between text-[10.5px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles size={12} className="text-amber-400 shrink-0" />
                    <span className="truncate font-bold text-white">{transientToast.title}</span>
                  </div>
                  <span className="text-[9px] text-slate-300 shrink-0 font-mono font-semibold">{transientToast.subtitle}</span>
                </div>
              ) : activeCall ? (
                /* Case C: Active Call Compact Pill */
                <div 
                  className="w-full h-full flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setActiveTab('call');
                    setIsExpanded(true);
                  }}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${activeCall.status === 'connected' ? 'bg-emerald-500' : 'bg-green-500 animate-bounce'}`}>
                      <Phone size={9} className="text-white fill-white" />
                    </div>
                    <span className="text-[10.5px] font-bold truncate text-white">
                      {activeCall.callerName.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {activeCall.status === 'connected' ? formatTimer(callDuration) : 'Appel...'}
                  </span>
                </div>
              ) : (
                /* Case D: Standard Idle / Pomodoro / Audio Compact Pill (Constant Width) */
                <div className="w-full h-full flex items-center justify-between cursor-pointer">
                  {/* Left: Indicator */}
                  <div className="flex items-center gap-1.5">
                    {isPlayingAudio ? (
                      <div className="flex items-end gap-0.5 h-2.5">
                        <span className="w-0.5 bg-cyan-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2.5" />
                        <span className="w-0.5 bg-blue-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-1.5" />
                        <span className="w-0.5 bg-indigo-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-3" />
                      </div>
                    ) : isPomodoroRunning ? (
                      <Clock size={11} className="text-rose-400 shrink-0" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${workspace === 'Production' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : workspace === 'Development' ? 'bg-blue-400 shadow-[0_0_6px_#3b82f6]' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'}`} />
                    )}
                    <span className="text-[10px] font-bold tracking-tight text-white font-mono uppercase">
                      {isPlayingAudio ? '432Hz' : isPomodoroRunning ? formatTimer(pomodoroSeconds) : activeWsConfig.badge}
                    </span>
                  </div>

                  {/* Center: Simulated Optical Lens Pinhole */}
                  <div className="w-2 h-2 rounded-full bg-black border border-slate-800 shadow-inner flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-slate-800" />
                  </div>

                  {/* Right: Status Icon */}
                  <div className="flex items-center gap-1">
                    {isAiProcessing ? (
                      <Sparkles size={11} className="text-amber-400 animate-spin" />
                    ) : isPlayingAudio ? (
                      <Waves size={11} className="text-cyan-400 animate-pulse" />
                    ) : isPomodoroRunning ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-slate-400">PRO</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXPANDED MODE (100% OPAQUE SOLID HUD) */}
          {isExpanded && (
            <div 
              className="w-full h-full p-4 flex flex-col justify-between text-slate-100"
              style={{ backgroundColor: '#070a11' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Tab Bar */}
              <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-1 bg-[#0f1422] p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'workspace'
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Server size={13} className="text-emerald-400" />
                    <span>Stack</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'media'
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Waves size={13} className="text-cyan-400" />
                    <span>Audio</span>
                    {isPlayingAudio && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                  </button>

                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'ai'
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Copilot</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pomodoro')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'pomodoro'
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock size={13} className="text-rose-400" />
                    <span>Focus</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      triggerFaceIdAction();
                      showTransientToast('Face ID Vérifié', 'Authentification Biométrique OK');
                    }}
                    title="Tester FaceID"
                    className="w-7 h-7 rounded-full bg-[#111726] hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <ShieldCheck size={14} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-7 h-7 rounded-full bg-[#111726] hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* TAB 1: WORKSPACES & BAAS TELEMETRY */}
              {activeTab === 'workspace' && (
                <div className="flex-1 flex flex-col justify-between pt-2.5">
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Environnements Actifs</span>
                      <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        100% DISPONIBLE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {workspaces.map(ws => {
                        const isSelected = workspace === ws.name;
                        return (
                          <button
                            key={ws.name}
                            onClick={() => {
                              haptics.trigger('selection');
                              setWorkspace(ws.name);
                              showTransientToast('Workspace Activé', ws.name);
                            }}
                            className={`p-2.5 rounded-2xl flex flex-col items-center text-center transition-all border ${
                              isSelected
                                ? `${ws.bg} text-white shadow-xl shadow-black/80 scale-[1.02]`
                                : 'bg-[#0f1422] border-slate-800 text-slate-300 hover:bg-[#151c2e] hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl bg-black flex items-center justify-center mb-1.5 border border-slate-700 ${ws.color}`}>
                              <ws.icon size={16} />
                            </div>
                            <span className="text-[12px] font-extrabold text-white">{ws.name}</span>
                            <span className="text-[9px] text-slate-300 font-mono font-semibold mt-0.5">{ws.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* System Telemetry Chips */}
                  <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-2.5 my-1.5 flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <Activity size={13} className="text-emerald-400" />
                      <span className="text-slate-400">Latence:</span>
                      <span className="font-mono font-bold text-emerald-400">14 ms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Database size={13} className="text-blue-400" />
                      <span className="text-slate-400">Cache:</span>
                      <span className="font-mono font-bold text-blue-400">Synchro</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Cpu size={13} className="text-purple-400" />
                      <span className="text-slate-400">FPS:</span>
                      <span className="font-mono font-bold text-purple-400">60</span>
                    </div>
                  </div>

                  {/* Quick Action Simulator */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startSimulatedCall()}
                      className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950"
                    >
                      <Phone size={13} className="fill-current" />
                      <span>Simuler Appel VIP</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerFaceIdAction();
                        showTransientToast('Face ID', 'Capteur biométrique activé');
                      }}
                      className="py-2 px-3 bg-[#0f1422] hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>FaceID</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AMBIENT SOUND & FOCUS MEDIA ENGINE */}
              {activeTab === 'media' && (
                <div className="flex-1 flex flex-col justify-between pt-2.5">
                  <div className="flex items-center justify-between bg-[#0f1422] border border-slate-800 p-2.5 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Waves size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">{currentTrack.title}</div>
                        <div className="text-[10px] text-cyan-300 font-medium">{currentTrack.subtitle}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        haptics.trigger('medium');
                        focusAudio.togglePlay(currentTrack.id);
                      }}
                      className="w-10 h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform active:scale-95 font-bold"
                    >
                      {isPlayingAudio ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
                    </button>
                  </div>

                  {/* Track List Selector */}
                  <div className="grid grid-cols-2 gap-2 my-2">
                    {SOUND_TRACKS.map(track => {
                      const isSelected = currentTrackId === track.id;
                      return (
                        <button
                          key={track.id}
                          onClick={() => {
                            haptics.trigger('selection');
                            focusAudio.play(track.id);
                          }}
                          className={`p-2.5 rounded-2xl text-left transition-all border flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0f2438] border-cyan-400 text-cyan-200 shadow-md shadow-black/60'
                              : 'bg-[#0f1422] border-slate-800 text-slate-300 hover:bg-[#151c2e] hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <div className="text-[11px] font-extrabold text-white truncate">{track.title}</div>
                            <div className="text-[9px] text-cyan-400 font-mono font-semibold mt-0.5">{track.category}</div>
                          </div>
                          {isSelected && isPlayingAudio && (
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 bg-[#0f1422] border border-slate-800 rounded-2xl px-3 py-2">
                    <Volume2 size={14} className="text-cyan-400 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioVolume}
                      onChange={(e) => focusAudio.setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[11px] font-mono font-bold text-white w-9 text-right">
                      {Math.round(audioVolume * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: OMK NEURAL AI COPILOT */}
              {activeTab === 'ai' && (
                <div className="flex-1 flex flex-col justify-between pt-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>OMK Neural Copilot</span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        GEMINI ACTIVE
                      </span>
                    </div>

                    {/* AI Prompt Input Bar */}
                    <div className="flex items-center gap-2 bg-[#0f1422] border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-amber-400">
                      <input
                        type="text"
                        placeholder="Ex: Diagnostic de santé BaaS..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') runAiDiagnostic();
                        }}
                        className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-400 outline-none font-medium"
                      />
                      <button
                        onClick={() => runAiDiagnostic()}
                        disabled={isAiProcessing}
                        className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors disabled:opacity-50"
                      >
                        {isAiProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      </button>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                      <button
                        onClick={() => runAiDiagnostic('Audit MRR & Expansion')}
                        className="px-2.5 py-1 bg-[#131b2e] hover:bg-slate-700 border border-slate-700 rounded-xl whitespace-nowrap text-slate-100 font-semibold"
                      >
                        📊 Audit MRR
                      </button>
                      <button
                        onClick={() => runAiDiagnostic('Diagnostic Santé BaaS')}
                        className="px-2.5 py-1 bg-[#131b2e] hover:bg-slate-700 border border-slate-700 rounded-xl whitespace-nowrap text-slate-100 font-semibold"
                      >
                        ⚡ Santé Stack
                      </button>
                      <button
                        onClick={() => runAiDiagnostic('Nettoyage du Cache')}
                        className="px-2.5 py-1 bg-[#131b2e] hover:bg-slate-700 border border-slate-700 rounded-xl whitespace-nowrap text-slate-100 font-semibold"
                      >
                        🧹 Purge Cache
                      </button>
                    </div>

                    {/* AI Response Card */}
                    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3 min-h-[95px] max-h-[110px] overflow-y-auto text-[11.5px] leading-relaxed">
                      {isAiProcessing ? (
                        <div className="flex items-center gap-2 text-amber-400 font-semibold animate-pulse py-4 justify-center">
                          <Bot size={16} />
                          <span>Analyse neurale en cours...</span>
                        </div>
                      ) : aiResponse ? (
                        <div className="text-white font-medium">{aiResponse}</div>
                      ) : (
                        <div className="text-slate-400 text-center py-4 font-medium">
                          Sélectionnez une action rapide ou saisissez une requête pour exécuter un audit en temps réel.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FOCUS POMODORO TIMER */}
              {activeTab === 'pomodoro' && (
                <div className="flex-1 flex flex-col items-center justify-between pt-2">
                  <div className="text-center">
                    <div className="inline-block bg-rose-500/20 border border-rose-500/40 px-3 py-0.5 rounded-full mb-1">
                      <span className="text-[10px] font-black tracking-wider uppercase text-rose-300">
                        {pomodoroMode === 'work' ? 'Mode Concentration (Deep Work)' : 'Mode Pause Récupération'}
                      </span>
                    </div>
                    <div className="text-5xl font-black font-mono tracking-tight text-white mt-1 drop-shadow-md">
                      {formatTimer(pomodoroSeconds)}
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startPomodoro(25 * 60)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        pomodoroMode === 'work' && isPomodoroRunning
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-950'
                          : 'bg-[#0f1422] text-slate-200 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      25m Focus
                    </button>
                    <button
                      onClick={() => startPomodoro(5 * 60)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        pomodoroMode === 'break' && isPomodoroRunning
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950'
                          : 'bg-[#0f1422] text-slate-200 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      5m Pause
                    </button>
                    <button
                      onClick={() => startPomodoro(50 * 60)}
                      className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#0f1422] text-slate-200 border border-slate-800 hover:text-white hover:border-slate-700"
                    >
                      50m Sprint
                    </button>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 w-full justify-center">
                    <button
                      onClick={pausePomodoro}
                      className={`px-8 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 transition-all shadow-lg ${
                        isPomodoroRunning
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-950'
                          : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950'
                      }`}
                    >
                      {isPomodoroRunning ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                      <span>{isPomodoroRunning ? 'Pause' : 'Démarrer'}</span>
                    </button>
                    <button
                      onClick={resetPomodoro}
                      className="p-2.5 rounded-2xl bg-[#0f1422] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Réinitialiser"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* SPECIAL TAB / MODAL: INCOMING & ACTIVE CALL SCREEN */}
              {activeTab === 'call' && activeCall && (
                <div className="flex-1 flex flex-col justify-between pt-2 text-center">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-lg font-bold shadow-xl border-2 border-slate-700">
                        {activeCall.callerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {activeCall.status === 'ringing' && (
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                      )}
                    </div>
                    <div className="text-base font-extrabold text-white">{activeCall.callerName}</div>
                    <div className="text-xs text-slate-300 font-medium">{activeCall.callerTitle}</div>
                    <div className="text-[10px] text-emerald-300 font-mono font-bold mt-1 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 inline-block">
                      {activeCall.company}
                    </div>
                    
                    {activeCall.status === 'connected' && (
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-2 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/40">
                        {formatTimer(callDuration)}
                      </div>
                    )}
                  </div>

                  {/* Call Action Buttons */}
                  <div className="flex items-center justify-center gap-6 mt-2">
                    {activeCall.status === 'ringing' ? (
                      <>
                        <button
                          onClick={declineCall}
                          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-950 transition-transform active:scale-95"
                          title="Refuser"
                        >
                          <PhoneOff size={20} />
                        </button>
                        <button
                          onClick={acceptCall}
                          className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-950 transition-transform active:scale-95 animate-bounce"
                          title="Décrocher"
                        >
                          <Phone size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={toggleMuteCall}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors font-bold ${
                            activeCall.isMuted
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-[#0f1422] hover:bg-slate-800 text-white border border-slate-700'
                          }`}
                          title="Microphone"
                        >
                          {activeCall.isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                          onClick={declineCall}
                          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-950 transition-transform active:scale-95"
                          title="Raccrocher"
                        >
                          <PhoneOff size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
