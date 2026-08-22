import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../../store/osStore';
import { AppEventBus, OMK_EVENTS } from '../../services/eventBus';
import { AppEvent } from '../../types';
import { haptics } from '../../services/haptics';
import { 
  Radio, X, Play, Pause, Trash2, Send, Copy, Check, 
  ChevronRight, ChevronDown, Filter, Search, Terminal,
  Users2, Calendar, CheckSquare, Landmark, Bot, Server,
  Sparkles, Layers, ShieldCheck, RefreshCw
} from 'lucide-react';

export default function EventBusDevOverlay() {
  const { 
    events, 
    clearEvents, 
    isDevOverlayOpen, 
    setDevOverlayOpen, 
    workspace,
    emitEvent 
  } = useOSStore();

  const [isRecording, setIsRecording] = useState(true);
  const [selectedSender, setSelectedSender] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'emitter'>('stream');

  // Custom Event Emitter State
  const [customType, setCustomType] = useState('OMK_CLIENT_UPDATED');
  const [customSender, setCustomSender] = useState<'clients' | 'tasks' | 'calendar' | 'finance' | 'system'>('clients');
  const [customPayload, setCustomPayload] = useState('{\n  "clientId": "cl-apex-99",\n  "name": "Apex Quantum Corp",\n  "mrr": 42000,\n  "healthScore": 98\n}');
  const [emitSuccess, setEmitSuccess] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (selectedSender !== 'all' && evt.sender !== selectedSender) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesType = evt.type.toLowerCase().includes(q);
        const matchesSender = evt.sender.toLowerCase().includes(q);
        const matchesPayload = evt.payload ? JSON.stringify(evt.payload).toLowerCase().includes(q) : false;
        return matchesType || matchesSender || matchesPayload;
      }
      return true;
    });
  }, [events, selectedSender, searchQuery]);

  const handleCopyPayload = (id: string, payload: any) => {
    haptics.trigger('light');
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleEmitCustom = () => {
    try {
      setPayloadError(null);
      const parsed = customPayload.trim() ? JSON.parse(customPayload) : {};
      haptics.trigger('appLaunch');
      emitEvent(customType, customSender, parsed);
      setEmitSuccess(true);
      setTimeout(() => setEmitSuccess(false), 2000);
    } catch (e: any) {
      haptics.trigger('error');
      setPayloadError(`JSON Invalide: ${e.message}`);
    }
  };

  const handleQuickEmit = (type: string, sender: any, payload: any) => {
    haptics.trigger('medium');
    emitEvent(type, sender, payload);
    setEmitSuccess(true);
    setTimeout(() => setEmitSuccess(false), 2000);
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'clients': return <Users2 size={12} className="text-blue-400" />;
      case 'tasks': return <CheckSquare size={12} className="text-emerald-400" />;
      case 'calendar': return <Calendar size={12} className="text-purple-400" />;
      case 'finance': return <Landmark size={12} className="text-emerald-400" />;
      case 'coach-ai': return <Bot size={12} className="text-emerald-400" />;
      case 'paas-pro': return <Server size={12} className="text-purple-400" />;
      case 'system': return <Sparkles size={12} className="text-amber-400" />;
      default: return <Radio size={12} className="text-slate-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <>
      {/* Floating Toggle Button on Mobile / In-Frame */}
      {!isDevOverlayOpen && (
        <button
          onClick={() => {
            haptics.trigger('selection');
            setDevOverlayOpen(true);
          }}
          title="Ouvrir le Débogueur AppEventBus"
          className="fixed bottom-4 right-4 z-40 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-mono transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold tracking-tight">EventBus</span>
          <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-500/30 rounded-md text-[10px] text-emerald-300">
            {events.length}
          </span>
        </button>
      )}

      {/* Main Dev Overlay Slide-Over Drawer */}
      <AnimatePresence>
        {isDevOverlayOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDevOverlayOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col h-full pointer-events-auto text-slate-100 overflow-hidden font-sans"
            >
              {/* Header Bar */}
              <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Radio size={14} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                        AppEventBus Inspector
                      </h3>
                      <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-mono">
                        DEV LIVE
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Flux inter-modules en temps réel ({workspace})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setIsRecording(prev => !prev);
                    }}
                    title={isRecording ? 'Mettre en pause' : 'Reprendre l’enregistrement'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isRecording 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isRecording ? <Pause size={13} /> : <Play size={13} />}
                  </button>

                  <button
                    onClick={() => {
                      haptics.trigger('medium');
                      clearEvents();
                    }}
                    title="Vider les événements"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setDevOverlayOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Subheader Navigation Tabs */}
              <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setActiveTab('stream');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'stream'
                        ? 'bg-slate-800 text-emerald-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Traffic Stream ({events.length})
                  </button>
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setActiveTab('emitter');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'emitter'
                        ? 'bg-slate-800 text-emerald-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Simulateur d'Événements
                  </button>
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  {filteredEvents.length} affichés
                </div>
              </div>

              {/* TAB 1: Real-time Stream */}
              {activeTab === 'stream' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Filter & Search Bar */}
                  <div className="p-2.5 border-b border-slate-800/60 bg-slate-950 flex flex-col gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filtrer type, module, payload..."
                        className="w-full pl-7 pr-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
                      />
                    </div>

                    {/* Sender Quick Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
                      {[
                        { id: 'all', label: 'Tous' },
                        { id: 'clients', label: 'Clients' },
                        { id: 'tasks', label: 'Tasks' },
                        { id: 'calendar', label: 'Calendar' },
                        { id: 'finance', label: 'Finance' },
                        { id: 'system', label: 'System' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            haptics.trigger('selection');
                            setSelectedSender(tab.id);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider shrink-0 transition-colors border ${
                            selectedSender === tab.id
                              ? 'bg-slate-800 border-slate-700 text-slate-100'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Feed List */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2 font-mono scrollbar-hide">
                    {filteredEvents.length === 0 ? (
                      <div className="py-16 text-center text-slate-500">
                        <Radio size={24} className="mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-400">Aucun événement capturé</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Effectuez une action dans un module ou lancez un test depuis le simulateur.
                        </p>
                      </div>
                    ) : (
                      filteredEvents.map(evt => {
                        const isExpanded = expandedEventId === evt.id;
                        const isCopied = copiedId === evt.id;

                        return (
                          <div
                            key={evt.id}
                            className={`rounded-xl border transition-all ${
                              isExpanded 
                                ? 'bg-slate-900/90 border-slate-700 shadow-md' 
                                : 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700/80'
                            }`}
                          >
                            {/* Card Header Row */}
                            <div 
                              onClick={() => {
                                haptics.trigger('light');
                                setExpandedEventId(isExpanded ? null : evt.id);
                              }}
                              className="p-2.5 flex items-center justify-between gap-2 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="p-1 rounded-md bg-slate-950 border border-slate-800 shrink-0">
                                  {getSenderIcon(evt.sender)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-slate-200 truncate">
                                      {evt.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                                    <span className="text-emerald-400">{evt.sender}</span>
                                    <span>•</span>
                                    <span>{formatTime(evt.timestamp)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyPayload(evt.id, evt);
                                  }}
                                  title="Copier le JSON"
                                  className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                                >
                                  {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                                <div className="text-slate-500">
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                              </div>
                            </div>

                            {/* Expanded JSON Inspector */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-slate-800/80 bg-slate-950 p-2.5 rounded-b-xl overflow-hidden"
                                >
                                  <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 font-mono">
                                    <span>Payload JSON</span>
                                    <span className="text-emerald-400">ID: {evt.id}</span>
                                  </div>
                                  <pre className="text-[10px] bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed max-h-48">
                                    {evt.payload 
                                      ? JSON.stringify(evt.payload, null, 2) 
                                      : '// Aucun payload associé'}
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Event Simulator & Quick Triggers */}
              {activeTab === 'emitter' && (
                <div className="flex-1 overflow-y-auto p-3.5 space-y-4 font-mono scrollbar-hide">
                  {/* Quick Preset Emitters */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-emerald-400" /> Déclencheurs Rapides Prédéfinis
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleQuickEmit(
                          'OMK_CLIENT_CREATED',
                          'clients',
                          { id: 'cl-auto-1', name: 'Quantum Core Ltd', mrr: 28000, healthScore: 96 }
                        )}
                        className="p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl flex items-center justify-between text-left transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Users2 size={13} className="text-blue-400" />
                          <div>
                            <div className="text-[11px] font-bold text-slate-200">Nouveau Client Entreprise</div>
                            <div className="text-[9px] text-slate-400">OMK_CLIENT_CREATED (from 'clients')</div>
                          </div>
                        </div>
                        <Send size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </button>

                      <button
                        onClick={() => handleQuickEmit(
                          'OMK_TASK_COMPLETED',
                          'tasks',
                          { taskId: 'task-882', title: 'Audit SOC2 Type II complété', assignee: 'Ops Team', status: 'done' }
                        )}
                        className="p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between text-left transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare size={13} className="text-emerald-400" />
                          <div>
                            <div className="text-[11px] font-bold text-slate-200">Tâche Ops Terminée</div>
                            <div className="text-[9px] text-slate-400">OMK_TASK_COMPLETED (from 'tasks')</div>
                          </div>
                        </div>
                        <Send size={12} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </button>

                      <button
                        onClick={() => handleQuickEmit(
                          'OMK_CALENDAR_EVENT',
                          'calendar',
                          { eventId: 'cal-399', title: 'Board Sync Q3', date: '2026-08-22 14:00', attendees: ['CEO', 'CTO', 'Lead Arch'] }
                        )}
                        className="p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-xl flex items-center justify-between text-left transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-purple-400" />
                          <div>
                            <div className="text-[11px] font-bold text-slate-200">Événement Agenda Planifié</div>
                            <div className="text-[9px] text-slate-400">OMK_CALENDAR_EVENT (from 'calendar')</div>
                          </div>
                        </div>
                        <Send size={12} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                      </button>

                      <button
                        onClick={() => handleQuickEmit(
                          'OMK_FINANCE_TRANSACTION',
                          'finance',
                          { txId: 'tx-994', amount: 42000, currency: 'USD', status: 'settled', customer: 'Apex Corp' }
                        )}
                        className="p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between text-left transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Landmark size={13} className="text-emerald-400" />
                          <div>
                            <div className="text-[11px] font-bold text-slate-200">Paiement Stripe Encaissé</div>
                            <div className="text-[9px] text-slate-400">OMK_FINANCE_TRANSACTION (from 'finance')</div>
                          </div>
                        </div>
                        <Send size={12} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Custom Dispatch Form */}
                  <div className="pt-3 border-t border-slate-800/70">
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Terminal size={12} className="text-emerald-400" /> Émetteur Manuel Personnalisé
                    </h4>

                    <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          Nom de l'événement (type)
                        </label>
                        <input
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          Module Émetteur (Sender)
                        </label>
                        <select
                          value={customSender}
                          onChange={(e) => setCustomSender(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="clients">clients (Clients OS)</option>
                          <option value="tasks">tasks (Operations & Tâches)</option>
                          <option value="calendar">calendar (Agenda / Planning)</option>
                          <option value="finance">finance (Trésorerie & Finance)</option>
                          <option value="system">system (OMK Core OS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          Payload JSON
                        </label>
                        <textarea
                          rows={4}
                          value={customPayload}
                          onChange={(e) => {
                            setCustomPayload(e.target.value);
                            setPayloadError(null);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed resize-none"
                        />
                        {payloadError && (
                          <div className="text-[10px] text-red-400 mt-1">{payloadError}</div>
                        )}
                      </div>

                      <button
                        onClick={handleEmitCustom}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        {emitSuccess ? <Check size={13} /> : <Send size={13} />}
                        <span>{emitSuccess ? 'Événement Émis !' : 'Diffuser sur AppEventBus'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay Footer Info */}
              <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Isolation : {workspace}</span>
                </div>
                <span>Zustand Reactive Store</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
