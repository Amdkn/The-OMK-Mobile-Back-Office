import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../store/osStore';
import { AppId, SearchResultItem } from '../types';
import { haptics } from '../services/haptics';
import { SearchIndexingService } from '../services/searchIndexer';
import { 
  Search, X, Command, ChevronRight, Mic, MicOff, Sparkles, Volume2
} from 'lucide-react';

interface Props {
  onOpenApp: (id: AppId) => void;
}

export default function GlobalSearch({ onOpenApp }: Props) {
  const { 
    theme, 
    setTheme, 
    contrast, 
    setContrast, 
    workspace, 
    setWorkspace, 
    paradigm, 
    setParadigm,
    lock,
    openNotificationCenter,
    simulateIncomingAlert
  } = useOSStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Global Keyboard shortcut listener (Cmd+K / Ctrl+K / '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        haptics.trigger('light');
        setIsOpen(prev => !prev);
      } else if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        haptics.trigger('light');
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      stopVoiceRecognition();
    }
  }, [isOpen]);

  // Build centralized search catalog
  const catalog = useMemo(() => {
    return SearchIndexingService.getCatalog({
      workspace,
      theme,
      contrast,
      paradigm,
      onOpenApp: (id) => {
        haptics.trigger('appLaunch');
        setIsOpen(false);
        onOpenApp(id);
      },
      setTheme: (t) => {
        haptics.trigger('light');
        setTheme(t);
        setIsOpen(false);
      },
      setContrast: (c) => {
        haptics.trigger('light');
        setContrast(c);
        setIsOpen(false);
      },
      setWorkspace: (ws) => {
        haptics.trigger('light');
        setWorkspace(ws);
        setIsOpen(false);
      },
      setParadigm: (p) => {
        haptics.trigger('light');
        setParadigm(p);
        setIsOpen(false);
      },
      lock: () => {
        haptics.trigger('heavy');
        setIsOpen(false);
        lock();
      },
      openNotificationCenter: () => {
        haptics.trigger('selection');
        setIsOpen(false);
        openNotificationCenter();
      },
      simulateIncomingAlert: () => {
        haptics.trigger('medium');
        setIsOpen(false);
        simulateIncomingAlert();
        openNotificationCenter();
      }
    });
  }, [workspace, theme, contrast, paradigm, onOpenApp, setTheme, setContrast, setWorkspace, setParadigm, lock, openNotificationCenter, simulateIncomingAlert]);

  // Perform search using SearchIndexingService
  const filteredResults = useMemo(() => {
    return SearchIndexingService.search(catalog, query, activeTab);
  }, [catalog, query, activeTab]);

  // Voice Command Interpreter using Web Speech API
  const handleVoiceCommand = (rawTranscript: string) => {
    const text = rawTranscript.trim().toLowerCase();
    setSpeechTranscript(rawTranscript);

    // Helper to speak feedback for true AI-native interaction
    const speakFeedback = (phrase: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.lang = 'fr-FR';
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {}
      }
    };

    // 1. Natural Language Data Queries (e.g. "Quel est le MRR", "Combien de clients", "Quelles sont les tâches", etc.)
    if (text.includes('mrr') || text.includes('chiffre') || text.includes('revenu') || text.includes('trésorerie') || text.includes('cash')) {
      const msg = 'Votre MRR actuel est de $124,500 (+14.2%). Clôture Stripe validée.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('finance');
      });
      return;
    }

    if (text.includes('client') || text.includes('crm') || text.includes('compte')) {
      const msg = 'Vous avez 6 clients actifs avec un score de santé moyen de 94%.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('clients');
      });
      return;
    }

    if (text.includes('tâche') || text.includes('task') || text.includes('ops') || text.includes('opération')) {
      const msg = '18 tâches sur 20 sont complétées pour le sprint actif.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('operations');
      });
      return;
    }

    if (text.includes('agenda') || text.includes('réunion') || text.includes('meeting') || text.includes('calendrier') || text.includes('planning')) {
      const msg = '3 réunions prévues aujourd’hui. Prochain point à 14h00 avec Apex Corp.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('hr');
      });
      return;
    }

    if (text.includes('lead') || text.includes('prospect') || text.includes('pipe') || text.includes('pipeline') || text.includes('vente')) {
      const msg = 'Pipeline actif estimé à $340k sur 14 prospects qualifiés.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('leads');
      });
      return;
    }

    if (text.includes('paas') || text.includes('cluster') || text.includes('serveur') || text.includes('pod') || text.includes('infra')) {
      const msg = 'Cluster PaaS en autoscale sur 8 pods. Latence p99 stabilisée à 28ms.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('paas-pro');
      });
      return;
    }

    if (text.includes('sécurité') || text.includes('security') || text.includes('zero trust') || text.includes('fido') || text.includes('shield')) {
      const msg = 'Bouclier Zero-Trust actif. 0 vulnérabilité détectée, session FIDO2 validée.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('security');
      });
      return;
    }

    if (text.includes('coach') || text.includes('ia') || text.includes('ai') || text.includes('briefing') || text.includes('conseil')) {
      const msg = 'Lancement de Coach AI. Vos 3 priorités stratégiques sont prêtes.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        onOpenApp('coach-ai');
      });
      return;
    }

    if (text.includes('terminal') || text.includes('console') || text.includes('bash') || text.includes('cli')) {
      executeVoiceAction('Ouverture du Terminal OMK...', () => {
        onOpenApp('terminal');
      });
      return;
    }

    if (text.includes('réglage') || text.includes('paramètre') || text.includes('setting') || text.includes('configuration')) {
      executeVoiceAction('Ouverture des Réglages Système...', () => {
        onOpenApp('settings');
      });
      return;
    }

    if (text.includes('dashboard') || text.includes('tableau de bord') || text.includes('kpi')) {
      executeVoiceAction('Ouverture du Dashboard Global...', () => {
        onOpenApp('dashboard');
      });
      return;
    }

    // 2. Workspace switch commands (e.g., "bascule en production", "switch to sandbox")
    if (text.includes('production') || text.includes('prod')) {
      const msg = 'Bascule vers l’environnement Production.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        setWorkspace('Production');
      });
      return;
    }
    if (text.includes('sandbox') || text.includes('local') || text.includes('isolé')) {
      const msg = 'Bascule vers l’environnement Sandbox.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        setWorkspace('Sandbox');
      });
      return;
    }
    if (text.includes('développement') || text.includes('dev')) {
      const msg = 'Bascule vers l’environnement Development.';
      speakFeedback(msg);
      executeVoiceAction(msg, () => {
        setWorkspace('Development');
      });
      return;
    }

    // 3. Theme switch commands
    if (text.includes('cyberpunk') || text.includes('cyber')) {
      executeVoiceAction('Activation du thème Cyberpunk...', () => {
        setTheme('cyberpunk');
      });
      return;
    }
    if (text.includes('oled') || text.includes('dark oled') || text.includes('sombre')) {
      executeVoiceAction('Activation du thème Dark OLED...', () => {
        setTheme('dark-oled');
      });
      return;
    }
    if (text.includes('warm') || text.includes('papier') || text.includes('paper')) {
      executeVoiceAction('Activation du thème Warm Paper...', () => {
        setTheme('warm-paper');
      });
      return;
    }
    if (text.includes('glass') || text.includes('verre')) {
      executeVoiceAction('Activation du thème Glassmorphism...', () => {
        setTheme('glassmorphism');
      });
      return;
    }

    // 4. System controls
    if (text.includes('verrouille') || text.includes('lock') || text.includes('bloquer')) {
      executeVoiceAction('Verrouillage immédiat du système...', () => {
        lock();
      });
      return;
    }
    if (text.includes('notification') || text.includes('alerte') || text.includes('alert')) {
      executeVoiceAction('Ouverture du centre de notifications...', () => {
        openNotificationCenter();
      });
      return;
    }

    // 5. Fallback: populate query and search directly
    setQuery(rawTranscript);
    setVoiceFeedback(`Recherche : "${rawTranscript}"`);
    setTimeout(() => {
      setVoiceFeedback(null);
    }, 2000);
  };

  const executeVoiceAction = (feedbackMsg: string, action: () => void) => {
    haptics.trigger('appLaunch');
    setVoiceFeedback(feedbackMsg);
    setTimeout(() => {
      stopVoiceRecognition();
      setIsOpen(false);
      setVoiceFeedback(null);
      action();
    }, 600);
  };

  const startVoiceRecognition = () => {
    setSpeechError(null);
    setVoiceFeedback(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech API non supportée sur ce navigateur.');
      // Simulated voice command prompt for fallback
      const simulatedCommands = ['Ouvre Finance', 'Lance Coach AI', 'Bascule en Production', 'Thème Cyberpunk', 'Ouvre Leads'];
      const randomCmd = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      handleVoiceCommand(randomCmd);
      return;
    }

    try {
      haptics.trigger('medium');
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechTranscript(transcript);
        if (event.results[0].isFinal) {
          handleVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Accès micro refusé.');
        } else {
          setSpeechError('Erreur de reconnaissance.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech init failed:', e);
      setIsListening(false);
      setSpeechError('Erreur d’initialisation micro.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      haptics.trigger('light');
      stopVoiceRecognition();
    } else {
      if (!isOpen) setIsOpen(true);
      startVoiceRecognition();
    }
  };

  // Handle Arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      haptics.trigger('selection');
      setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
      scrollSelectedIntoView((selectedIndex + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      haptics.trigger('selection');
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
      scrollSelectedIntoView((selectedIndex - 1 + filteredResults.length) % (filteredResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div className="w-full relative z-20 mb-3 px-6">
      {/* Search Bar Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            haptics.trigger('light');
            setIsOpen(true);
          }}
          className="flex-1 h-11 px-3.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between shadow-lg text-slate-400 group transition-all theme-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search size={15} className="text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate">
              Rechercher ou commande vocale...
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700/80 rounded-md">
              <Command size={10} /> K
            </kbd>
            <kbd className="sm:hidden inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700/80 rounded-md">
              /
            </kbd>
          </div>
        </button>

        {/* Quick Voice Command Trigger Button */}
        <button
          onClick={toggleVoice}
          title="Commande vocale IA"
          className={`h-11 w-11 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-all shadow-lg shrink-0 ${
            isListening 
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
              : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-emerald-400 hover:border-emerald-500/40 active:scale-95'
          }`}
        >
          {isListening ? <Mic size={17} /> : <Mic size={17} />}
        </button>
      </div>

      {/* Slide-Down Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pointer-events-auto">
            {/* Backdrop with Frosted Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                stopVoiceRecognition();
                setIsOpen(false);
              }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Slide-Down Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, y: -60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="relative z-10 w-full max-w-sm bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col theme-transition max-h-[580px]"
            >
              {/* Search Input Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center gap-2.5 bg-slate-900/70">
                <Search size={17} className="text-emerald-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Tapez ou dictez une commande..."
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />

                {/* Microphone inside search bar */}
                <button
                  onClick={toggleVoice}
                  title="Activer la dictée vocale"
                  className={`p-1.5 rounded-xl border transition-all shrink-0 ${
                    isListening
                      ? 'bg-red-500/20 border-red-500/60 text-red-400 animate-pulse'
                      : 'bg-slate-950/60 border-slate-800 text-emerald-400 hover:border-slate-700'
                  }`}
                >
                  <Mic size={15} />
                </button>

                {query ? (
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      setQuery('');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      stopVoiceRecognition();
                      setIsOpen(false);
                    }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200 shrink-0"
                  >
                    ESC
                  </button>
                )}
              </div>

              {/* Voice Listening Active Waveform Banner */}
              <AnimatePresence>
                {(isListening || voiceFeedback) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-emerald-950/40 border-b border-emerald-500/30 p-3 flex items-center justify-between gap-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                        {isListening ? <Volume2 size={13} className="animate-pulse" /> : <Sparkles size={13} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-emerald-300 truncate">
                          {voiceFeedback || (speechTranscript ? `"${speechTranscript}"` : 'Écoute vocale active... Parlez maintenant')}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Ex: "Ouvre Finance", "Passe en Production", "Mode Cyberpunk"
                        </div>
                      </div>
                    </div>
                    {isListening && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {speechError && (
                <div className="bg-red-950/40 border-b border-red-500/30 px-3.5 py-1.5 text-[11px] text-red-300 flex items-center justify-between">
                  <span>{speechError}</span>
                  <button onClick={() => setSpeechError(null)} className="text-red-400 hover:text-red-200">
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Category Filter Tabs */}
              <div className="px-3.5 py-2 border-b border-slate-800/60 flex items-center gap-1.5 bg-slate-900/30 overflow-x-auto scrollbar-hide shrink-0">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'apps', label: 'Applications' },
                  { id: 'clients', label: 'Clients & CRM' },
                  { id: 'files', label: 'Fichiers & Docs' },
                  { id: 'settings', label: 'Paramètres' },
                  { id: 'actions', label: 'Actions' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      haptics.trigger('selection');
                      setActiveTab(tab.id);
                      setSelectedIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 border ${
                      activeTab === tab.id
                        ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide max-h-[380px]">
                {filteredResults.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Search size={22} className="mx-auto mb-2 text-slate-600" />
                    <p className="text-xs font-medium text-slate-400">Aucun résultat pour "{query}"</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Essayez un autre mot-clé ou la commande vocale</p>
                  </div>
                ) : (
                  filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          stopVoiceRecognition();
                          item.action();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                          isSelected
                            ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-sm'
                            : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.color || 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            <ItemIcon size={16} strokeWidth={1.5} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-100 truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-medium border ${
                                  item.badge === 'Actif'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-900 text-slate-400 border-slate-800'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          {isSelected && (
                            <ChevronRight size={15} className="text-emerald-400 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal Footer Key Hints */}
              <div className="px-4 py-2 border-t border-slate-800/70 bg-slate-900/50 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
                <div className="flex items-center gap-3">
                  <span><kbd className="font-mono bg-slate-800 px-1 rounded">↑↓</kbd> Naviguer</span>
                  <span><kbd className="font-mono bg-slate-800 px-1 rounded">↵</kbd> Exécuter</span>
                </div>
                <span>{filteredResults.length} indexés ({workspace})</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
