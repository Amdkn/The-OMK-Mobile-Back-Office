import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  KeyRound, 
  Cpu, 
  CheckCircle2, 
  Copy, 
  X, 
  Bot, 
  Trash2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  type: 'info' | 'error' | 'success';
}

const PRESET_SCRIPTS = [
  { id: 'ps1', name: 'omk-sync --all', desc: 'Synchronise l\'ontologie avec les bases de données et adaptateurs MCP.' },
  { id: 'ps2', name: 'omk-test --ci', desc: 'Exécute la suite de tests unitaires et de contrats de sécurité.' },
  { id: 'ps3', name: 'omk-backup --s3', desc: 'Génère un snapshot chiffré des états de mémoire et schémas.' },
];

const ENV_SECRETS = [
  { id: 'es1', key: 'GEMINI_API_KEY', masked: 'AIzaSy********************', env: 'Production' },
  { id: 'es2', key: 'STRIPE_SECRET_KEY', masked: 'sk_live_********************', env: 'Production' },
  { id: 'es3', key: 'MERCURY_API_TOKEN', masked: 'merc_tok_******************', env: 'Sandbox' },
];

const PROCESSES = [
  { pid: 1042, name: 'omk-kernel-daemon', cpu: '1.2%', mem: '142 MB', status: 'running' },
  { pid: 1088, name: 'mcp-adapter-proxy', cpu: '0.8%', mem: '88 MB', status: 'running' },
  { pid: 1120, name: 'gemini-stream-router', cpu: '2.4%', mem: '210 MB', status: 'running' },
];

const TERMINAL_TABS = [
  { id: 'cli', label: 'Console', icon: TerminalIcon },
  { id: 'scripts', label: 'Scripts', icon: Play, badge: 3 },
  { id: 'secrets', label: 'Variables', icon: KeyRound },
  { id: 'processes', label: 'Processus', icon: Cpu, badge: 3 }
];

export default function Terminal() {
  const [activeTab, setActiveTab] = useState('cli');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      command: 'sys.init --kernel=omk-v4.2',
      output: 'OMK OS Kernel v4.2 initialisé. Tapez "help" pour voir la liste des commandes.',
      type: 'info'
    }
  ]);

  const { theme, workspace, contrast, brightness, wallpaper } = useOSStore();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'cli') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

  const handleCommand = (cmdStr?: string) => {
    const raw = (cmdStr !== undefined ? cmdStr : input).trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    let res = '';
    let type: 'info' | 'error' | 'success' = 'info';

    if (lower === 'help') {
      res = `Commandes disponibles:\n  help        : Affiche ce menu d'aide\n  status      : État des services de l'OS\n  env         : Liste les variables d'environnement\n  theme       : Info sur le thème et fond actif\n  clear       : Efface l'historique de la console`;
    } else if (lower === 'status') {
      res = `[OMK OS Kernel v4.2]\n• Workspace: ${workspace}\n• Thème: ${theme}\n• Fond d'écran: ${wallpaper}\n• MCP Bridge: Connecté\n• Base de données: Synchronisée (100%)`;
      type = 'success';
    } else if (lower === 'env') {
      res = `Variables d'environnement configurées:\n  NODE_ENV=production\n  WORKSPACE=${workspace}\n  THEME=${theme}\n  BRIGHTNESS=${brightness}%\n  CONTRAST=${contrast}%`;
    } else if (lower === 'theme') {
      res = `Thème actif: ${theme}\nFond d'écran: ${wallpaper}\nLuminosité: ${brightness}%\nContraste: ${contrast}%`;
    } else if (lower === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (lower.startsWith('omk-')) {
      res = `Exécution de [${raw}]...\n-> Pipeline exécuté avec succès (0 erreurs, 100% complété).`;
      type = 'success';
    } else {
      res = `Commande inconnue: "${raw}". Tapez "help" pour obtenir de l'aide.`;
      type = 'error';
    }

    setHistory(prev => [
      ...prev,
      { id: Date.now().toString(), command: raw, output: res, type }
    ]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={TERMINAL_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: CLI */}
          {activeTab === 'cli' && (
            <motion.div
              key="cli"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full flex flex-col p-4"
            >
              <div className="flex-1 bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 flex flex-col font-mono text-xs overflow-hidden shadow-2xl theme-transition">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800/80 text-slate-400 text-[10px]">
                  <span>bash — omk@system:~ ({workspace})</span>
                  <button 
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                  >
                    <Trash2 size={12} /> Effacer
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                  {history.map(item => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="opacity-50">❯</span>
                        <span className="text-slate-100 font-semibold">{item.command}</span>
                      </div>
                      <div className={`whitespace-pre-wrap pl-4 leading-relaxed ${
                        item.type === 'error' ? 'text-red-400' :
                        item.type === 'success' ? 'text-emerald-400' :
                        'text-slate-300'
                      }`}>
                        {item.output}
                      </div>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                <form 
                  onSubmit={(e) => { e.preventDefault(); handleCommand(); }}
                  className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2"
                >
                  <span className="text-emerald-400 font-bold">❯</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tapez une commande (help, status, env)..."
                    className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs font-mono"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs transition-colors"
                  >
                    Exécuter
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SCRIPTS */}
          {activeTab === 'scripts' && (
            <motion.div
              key="scripts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Scripts & Outils Automatisés"
                subtitle="Pipelines de maintenance et synchronisation"
                icon={Play}
                badge="3 Scripts"
              >
                <div className="space-y-3">
                  {PRESET_SCRIPTS.map(ps => (
                    <DetailCard
                      key={ps.id}
                      title={ps.name}
                      badge="Exécutable"
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono"
                      icon={Play}
                    >
                      <div className="space-y-2 pt-1">
                        <p className="text-xs text-slate-300 leading-relaxed">{ps.desc}</p>
                        <button
                          onClick={() => {
                            setActiveTab('cli');
                            setTimeout(() => handleCommand(ps.name), 100);
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                        >
                          <Play size={12} /> Exécuter dans la Console
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: SECRETS */}
          {activeTab === 'secrets' && (
            <motion.div
              key="secrets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Variables d'Environnement Masquées"
                subtitle="Configuration du runtime et clés de service"
                icon={KeyRound}
                badge="Chiffré"
              >
                <div className="space-y-3">
                  {ENV_SECRETS.map(es => (
                    <DetailCard
                      key={es.id}
                      title={es.key}
                      badge={es.env}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={KeyRound}
                    >
                      <div className="flex justify-between items-center text-xs pt-1 font-mono text-slate-400">
                        <span>{es.masked}</span>
                        <Lock size={14} className="text-emerald-400" />
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: PROCESSES */}
          {activeTab === 'processes' && (
            <motion.div
              key="processes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Processus Système en Exécution"
                subtitle="Daemons de fond et proxys MCP"
                icon={Cpu}
                badge="3 Actifs"
              >
                <div className="space-y-3">
                  {PROCESSES.map(proc => (
                    <DetailCard
                      key={proc.pid}
                      title={proc.name}
                      badge={`PID ${proc.pid}`}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-mono"
                      icon={Cpu}
                    >
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <span className="text-slate-400">CPU : <strong className="text-emerald-400">{proc.cpu}</strong></span>
                        <span className="text-slate-400">RAM : <strong className="text-slate-200">{proc.mem}</strong></span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
