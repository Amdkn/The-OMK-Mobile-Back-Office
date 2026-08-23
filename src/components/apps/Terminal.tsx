import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Unlock,
  Layers,
  Sparkles,
  Download,
  Clock,
  RotateCw,
  AlertTriangle,
  FileText,
  Activity,
  ShieldCheck,
  Zap,
  Server,
  Code,
  Check,
  ChevronRight,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import DetailSection, { DetailCard, AIInsightCard, KPIItem } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  type: 'info' | 'error' | 'success';
  timestamp: string;
  durationMs: number;
  exitCode: number;
}

interface PresetScript {
  id: string;
  name: string;
  command: string;
  desc: string;
  category: 'Sync' | 'Test' | 'Backup' | 'Deploy' | 'Audit';
  avgTime: string;
  successRate: string;
  privilege: 'User' | 'Dev' | 'Root / SRE';
  flags: string[];
}

interface EnvSecret {
  id: string;
  key: string;
  value: string;
  masked: string;
  env: 'Production' | 'Staging' | 'Sandbox';
  lastRotated: string;
  scope: string;
  encryption: string;
}

interface SystemProcess {
  pid: number;
  name: string;
  cpu: string;
  mem: string;
  uptime: string;
  status: 'running' | 'warning' | 'idle';
  threads: number;
  port?: number;
}

const PRESET_SCRIPTS: PresetScript[] = [
  { 
    id: 'ps1', 
    name: 'omk-sync --all', 
    command: 'omk-sync --all --verify-checksum',
    desc: 'Synchronise l\'ontologie avec les bases de données distantes et adaptateurs MCP.', 
    category: 'Sync',
    avgTime: '1.2s',
    successRate: '99.8%',
    privilege: 'Dev',
    flags: ['--all', '--verify-checksum', '--dry-run=false']
  },
  { 
    id: 'ps2', 
    name: 'omk-test --ci', 
    command: 'omk-test --ci --coverage --threshold=95',
    desc: 'Exécute la suite complète de tests unitaires, d\'intégration et contrats de sécurité Zero-Trust.', 
    category: 'Test',
    avgTime: '3.8s',
    successRate: '98.5%',
    privilege: 'Dev',
    flags: ['--ci', '--coverage', '--threshold=95']
  },
  { 
    id: 'ps3', 
    name: 'omk-backup --s3', 
    command: 'omk-backup --s3 --region=eu-west-1 --encrypt=aes-256-gcm',
    desc: 'Génère un snapshot chiffré des états de mémoire, bases IndexedDB et configurations OS.', 
    category: 'Backup',
    avgTime: '2.4s',
    successRate: '100%',
    privilege: 'Root / SRE',
    flags: ['--s3', '--encrypt=aes-256-gcm', '--compress=zstd']
  },
  { 
    id: 'ps4', 
    name: 'omk-deploy --edge', 
    command: 'omk-deploy --edge --target=cloudflare-workers --canary=10%',
    desc: 'Déploie les workers edge et met à jour le routage DNS Cloudflare avec validation progressive.', 
    category: 'Deploy',
    avgTime: '4.5s',
    successRate: '99.1%',
    privilege: 'Root / SRE',
    flags: ['--edge', '--canary=10%', '--tls=strict']
  },
  { 
    id: 'ps5', 
    name: 'omk-audit --security', 
    command: 'omk-audit --security --deep --check-tokens',
    desc: 'Analyse les vecteurs de fuite potentiels, intégrité des sessions et permissions API.', 
    category: 'Audit',
    avgTime: '1.9s',
    successRate: '100%',
    privilege: 'Root / SRE',
    flags: ['--deep', '--check-tokens', '--json-out']
  }
];

const INITIAL_SECRETS: EnvSecret[] = [
  { id: 'es1', key: 'GEMINI_API_KEY', value: 'mock_vault_gemini_api_key_sample_token', masked: 'mock_vault_*****************', env: 'Production', lastRotated: 'Il y a 12 jours', scope: 'Gemini 2.5 Flash & Pro APIs', encryption: 'AES-256-GCM' },
  { id: 'es2', key: 'STRIPE_SECRET_KEY', value: 'mock_vault_stripe_secret_key_sample_token', masked: 'mock_vault_*****************', env: 'Production', lastRotated: 'Il y a 30 jours', scope: 'Stripe Billing & Subscriptions', encryption: 'AES-256-GCM' },
  { id: 'es3', key: 'MERCURY_API_TOKEN', value: 'mock_vault_mercury_api_token_sample_token', masked: 'mock_vault_*****************', env: 'Sandbox', lastRotated: 'Il y a 5 jours', scope: 'Mercury Banking Read/Write', encryption: 'AES-256-GCM' },
  { id: 'es4', key: 'SUPABASE_SERVICE_ROLE', value: 'mock_vault_supabase_service_role_sample_token', masked: 'mock_vault_*****************', env: 'Production', lastRotated: 'Il y a 18 jours', scope: 'PostgreSQL Direct Admin Access', encryption: 'AES-256-GCM' },
  { id: 'es5', key: 'REDIS_TLS_URL', value: 'rediss://mock_user:mock_token@internal-redis.cluster:6379', masked: 'rediss://*******************', env: 'Production', lastRotated: 'Il y a 45 jours', scope: 'L2 Distributed Cache & Queue', encryption: 'TLS 1.3 Strict' }
];

const INITIAL_PROCESSES: SystemProcess[] = [
  { pid: 1042, name: 'omk-kernel-daemon', cpu: '1.2%', mem: '142 MB', uptime: '18h 42m', status: 'running', threads: 12, port: 8080 },
  { pid: 1088, name: 'mcp-adapter-proxy', cpu: '0.8%', mem: '88 MB', uptime: '18h 40m', status: 'running', threads: 8, port: 4000 },
  { pid: 1120, name: 'gemini-stream-router', cpu: '2.4%', mem: '210 MB', uptime: '12h 15m', status: 'running', threads: 16, port: 5050 },
  { pid: 1154, name: 'localforage-sync-worker', cpu: '0.3%', mem: '34 MB', uptime: '8h 05m', status: 'idle', threads: 4 },
  { pid: 1202, name: 'websocket-ingress-worker', cpu: '3.1%', mem: '164 MB', uptime: '4h 22m', status: 'warning', threads: 24, port: 9001 }
];

const TERMINAL_TABS = [
  { id: 'cli', label: 'Console', icon: TerminalIcon },
  { id: 'scripts', label: 'Scripts', icon: Play, badge: PRESET_SCRIPTS.length },
  { id: 'history', label: 'Historique', icon: Clock },
  { id: 'secrets', label: 'Variables', icon: KeyRound, badge: INITIAL_SECRETS.length },
  { id: 'processes', label: 'Processus', icon: Cpu, badge: INITIAL_PROCESSES.length }
];

export default function Terminal() {
  const { theme, workspace, contrast, brightness, wallpaper } = useOSStore();
  const [activeTab, setActiveTab] = useState('cli');
  const [input, setInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Terminal execution history
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      command: 'sys.init --kernel=omk-v4.2',
      output: 'OMK OS Kernel v4.2.1 initialisé.\nArchitecture : ARM64/V8 Multi-Core\nMCP Bridge : Connecté (Port 4000)\nIndexedDB : Persistant\nTapez "help" pour afficher la liste des commandes.',
      type: 'info',
      timestamp: '09:00:00',
      durationMs: 12,
      exitCode: 0
    }
  ]);

  // Modals & Drawers Selected States
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<CommandOutput | null>(null);
  const [selectedScript, setSelectedScript] = useState<PresetScript | null>(null);
  const [selectedSecret, setSelectedSecret] = useState<EnvSecret | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<SystemProcess | null>(null);
  
  // Revealed secrets state
  const [revealedSecretIds, setRevealedSecretIds] = useState<Set<string>>(new Set());
  const [processesList, setProcessesList] = useState<SystemProcess[]>(INITIAL_PROCESSES);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (activeTab === 'cli') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

  const handleCommand = (cmdStr?: string) => {
    const raw = (cmdStr !== undefined ? cmdStr : input).trim();
    if (!raw) return;

    haptics.trigger('light');
    const startTime = performance.now();
    const lower = raw.toLowerCase();
    let res = '';
    let type: 'info' | 'error' | 'success' = 'info';
    let exitCode = 0;

    if (lower === 'help') {
      res = `Commandes disponibles:\n  help        : Affiche ce menu d'aide interactif\n  status      : État des services de l'OS & télémétrie\n  env         : Liste les variables d'environnement configurées\n  theme       : Info sur le thème, luminosité et fond actif\n  clear       : Efface l'historique de la console\n  ps          : Liste les processus système actifs\n  omk-sync    : Synchronise l'ontologie avec les adaptateurs MCP\n  omk-test    : Exécute la suite de tests et contrats de sécurité\n  omk-backup  : Génère un snapshot chiffré des états de mémoire\n  omk-deploy  : Déploie sur Cloudflare Edge avec canary check`;
      type = 'info';
    } else if (lower === 'status') {
      res = `[OMK OS Kernel v4.2.1 - Production Engine]\n• Partition Workspace : ${workspace}\n• Thème Actif         : ${theme}\n• Luminosité          : ${brightness}%\n• Contraste           : ${contrast}%\n• MCP Adapter Bridge  : CONNECTÉ (Latence: 14ms)\n• Persistance Locale  : IndexedDB (100% Hors-Ligne)\n• Sécurité Zero-Trust : Active (FIDO2 + mTLS)`;
      type = 'success';
    } else if (lower === 'env') {
      res = `Variables d'environnement configurées (Partition: ${workspace}):\n  NODE_ENV=production\n  WORKSPACE=${workspace}\n  THEME=${theme}\n  BRIGHTNESS=${brightness}%\n  CONTRAST=${contrast}%\n  MCP_BRIDGE_PORT=4000\n  ENCRYPTION_ENGINE=AES-256-GCM`;
      type = 'info';
    } else if (lower === 'theme') {
      res = `Configuration Affichage:\n  Thème: ${theme}\n  Fond d'écran: ${wallpaper}\n  Luminosité: ${brightness}%\n  Contraste: ${contrast}%`;
      type = 'info';
    } else if (lower === 'ps') {
      res = `PID   | NOM                      | CPU   | RAM    | STATUT\n` +
        processesList.map(p => `${p.pid.toString().padEnd(5)} | ${p.name.padEnd(24)} | ${p.cpu.padEnd(5)} | ${p.mem.padEnd(6)} | ${p.status}`).join('\n');
      type = 'info';
    } else if (lower === 'clear') {
      setHistory([]);
      setInput('');
      showToast('Console réinitialisée');
      return;
    } else if (lower.startsWith('omk-sync')) {
      res = `[omk-sync] Démarrage de la synchronisation...\n✔ Connexion socket MCP : OK (0.2s)\n✔ Ingestion schémas Drizzle/Firestore : 48 entités synchronisées\n✔ Validation des checksums SHA : 100% conforme\n-> Synchronisation achevée avec succès (0 erreurs).`;
      type = 'success';
    } else if (lower.startsWith('omk-test')) {
      res = `[omk-test] Lancement des suites de tests CI...\n✔ Tests unitaires Store OS : 42/42 passés (100%)\n✔ Contrats de sécurité FIDO2 : Validés\n✔ Intégrité IndexedDB : 100% intègre\n-> Tests terminés sans anomalie en 1.8s.`;
      type = 'success';
    } else if (lower.startsWith('omk-backup')) {
      res = `[omk-backup] Création du snapshot chiffré...\n✔ Chiffrement AES-256-GCM : OK\n✔ Upload S3 (eu-west-1) : 4.8 MB transférés\n✔ Digest Checksum SHA-256 : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n-> Snapshot persisté avec succès.`;
      type = 'success';
    } else if (lower.startsWith('omk-deploy')) {
      res = `[omk-deploy] Déploiement Cloudflare Workers...\n✔ Build artifact optimisé (240 KB)\n✔ Canary routing 10% activé\n✔ Healthcheck Edge : 200 OK (Latence 8ms)\n-> Déploiement complété à 100%.`;
      type = 'success';
    } else if (lower.startsWith('omk-audit')) {
      res = `[omk-audit] Analyse de sécurité globale...\n✔ 5/5 Clés API avec rotation conforme\n✔ Zero fuite de tokens détectée dans les logs\n✔ Politique CORS & Content-Security-Policy : Strict\n-> Score de sécurité : 100/100 (A+).`;
      type = 'success';
    } else {
      res = `Commande inconnue: "${raw}". Tapez "help" pour voir les instructions ou cliquez sur un script préconfiguré.`;
      type = 'error';
      exitCode = 127;
    }

    const durationMs = Math.round(performance.now() - startTime + (type === 'success' ? 140 : 10));

    const newEntry: CommandOutput = {
      id: Date.now().toString(),
      command: raw,
      output: res,
      type,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      durationMs,
      exitCode
    };

    setHistory(prev => [...prev, newEntry]);
    setInput('');
    if (type === 'success') {
      haptics.trigger('success');
    }
  };

  const handleExportSession = () => {
    haptics.trigger('selection');
    try {
      let logContent = `=== OMK Mobile OS — Terminal Session Log ===\n`;
      logContent += `Date : ${new Date().toLocaleString('fr-FR')}\n`;
      logContent += `Workspace : ${workspace} | Kernel : v4.2.1\n\n`;

      history.forEach((h, idx) => {
        logContent += `[${h.timestamp}] (${h.durationMs}ms | exit: ${h.exitCode}) > ${h.command}\n`;
        logContent += `${h.output}\n`;
        logContent += `------------------------------------------------------------\n`;
      });

      const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omk-terminal-session-${Date.now()}.log`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Session de terminal exportée en .log');
    } catch {
      showToast('Erreur lors de l\'export');
    }
  };

  const handleCopyText = (text: string, label: string = 'Texte') => {
    haptics.trigger('selection');
    navigator.clipboard.writeText(text);
    showToast(`${label} copié dans le presse-papiers`);
  };

  const toggleSecretReveal = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.trigger('medium');
    setRevealedSecretIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRestartProcess = (proc: SystemProcess) => {
    haptics.trigger('success');
    setProcessesList(prev => prev.map(p => p.pid === proc.pid ? { ...p, status: 'running', uptime: '0s', cpu: '0.4%' } : p));
    showToast(`Processus ${proc.name} (PID ${proc.pid}) redémarré`);
    if (selectedProcess?.pid === proc.pid) {
      setSelectedProcess({ ...proc, status: 'running', uptime: '0s', cpu: '0.4%' });
    }
  };

  const handleKillProcess = (proc: SystemProcess) => {
    haptics.trigger('warning');
    setProcessesList(prev => prev.filter(p => p.pid !== proc.pid));
    showToast(`Signal SIGKILL transmis au processus ${proc.name} (PID ${proc.pid})`);
    if (selectedProcess?.pid === proc.pid) {
      setSelectedProcess(null);
    }
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
          {/* TAB 1: CLI CONSOLE */}
          {activeTab === 'cli' && (
            <motion.div
              key="cli"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full flex flex-col p-3 sm:p-4 space-y-2.5"
            >
              {/* Telemetry & Quick Action Bar */}
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-semibold text-slate-200">bash — omk@system:~</span>
                  <span className="hidden sm:inline text-slate-500 font-mono">({workspace})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSession}
                    title="Exporter la session console"
                    className="p-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors text-[10px]"
                  >
                    <Download size={11} />
                    <span>Exporter</span>
                  </button>

                  <button 
                    onClick={() => {
                      haptics.trigger('light');
                      setHistory([]);
                      showToast('Console vidée');
                    }}
                    className="p-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors text-[10px]"
                  >
                    <Trash2 size={11} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Quick Shortcut Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
                {['help', 'status', 'env', 'ps', 'omk-sync --all', 'omk-test --ci', 'omk-backup --s3'].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => handleCommand(cmd)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <span className="text-emerald-400">❯</span>
                    <span>{cmd}</span>
                  </button>
                ))}
              </div>

              {/* Console Output Window */}
              <div className="flex-1 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 flex flex-col font-mono text-xs overflow-hidden shadow-2xl theme-transition">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                  {history.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedHistoryItem(item);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 cursor-pointer transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="opacity-60">❯</span>
                          <span className="text-slate-100 font-bold">{item.command}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity">
                          <span>{item.durationMs}ms</span>
                          <span>{item.timestamp}</span>
                          <span className="text-emerald-400 font-sans">Inspecter →</span>
                        </div>
                      </div>

                      <div className={`whitespace-pre-wrap pl-3 leading-relaxed text-[11px] font-mono ${
                        item.type === 'error' ? 'text-red-400' :
                        item.type === 'success' ? 'text-emerald-300' :
                        'text-slate-300'
                      }`}>
                        {item.output}
                      </div>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Input Prompt */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleCommand(); }}
                  className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2"
                >
                  <span className="text-emerald-400 font-bold">❯</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tapez une commande (help, status, env, omk-sync)..."
                    className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs font-mono"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Run</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SCRIPTS & PIPELINES */}
          {activeTab === 'scripts' && (
            <motion.div
              key="scripts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Scripts & Pipelines Automatisés"
                subtitle="Scripts d'ingénierie système et synchronisation Zero-Trust"
                icon={Play}
                badge={`${PRESET_SCRIPTS.length} Exécutables`}
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                kpis={[
                  { label: 'Scripts Actifs', value: PRESET_SCRIPTS.length, sub: 'Prêts à l\'exécution' },
                  { label: 'Succès Moyen', value: '99.4%', sub: 'Mesure 30 jours', trend: 'up' },
                  { label: 'Durée Moyenne', value: '2.8s', sub: 'Sur le cluster' }
                ]}
              >
                <div className="space-y-3">
                  {PRESET_SCRIPTS.map(ps => (
                    <DetailCard
                      key={ps.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedScript(ps);
                      }}
                      isInteractive
                      title={ps.name}
                      badge={ps.category}
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono"
                      icon={Play}
                      subtitle={`Privilège : ${ps.privilege} • Durée moy. : ${ps.avgTime}`}
                      actions={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('cli');
                            setTimeout(() => handleCommand(ps.name), 100);
                          }}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-1 transition-colors"
                        >
                          <Play size={11} /> Exécuter
                        </button>
                      }
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{ps.desc}</p>
                      <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-slate-400">
                        <span>Succès : <strong className="text-emerald-400">{ps.successRate}</strong></span>
                        <span className="text-emerald-400 font-sans">Inspecter options →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: COMMAND HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Historique des Commandes"
                subtitle="Journal exhaustif des exécutions et traces stdout/stderr"
                icon={Clock}
                badge={`${history.length} Entrées`}
                kpis={[
                  { label: 'Total Commandes', value: history.length, sub: 'Cette session' },
                  { label: 'Taux Réussite', value: `${history.length ? Math.round((history.filter(h => h.exitCode === 0).length / history.length) * 100) : 100}%`, sub: 'Code retour 0', trend: 'up' },
                  { label: 'Latence Moy.', value: `${history.length ? Math.round(history.reduce((a, b) => a + b.durationMs, 0) / history.length) : 0}ms`, sub: 'Temps runtime' }
                ]}
              >
                <div className="space-y-3">
                  {history.map(item => (
                    <DetailCard
                      key={item.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedHistoryItem(item);
                      }}
                      isInteractive
                      title={item.command}
                      badge={item.type === 'error' ? `Exit ${item.exitCode}` : 'Exit 0'}
                      badgeColor={item.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30 font-mono' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono'}
                      icon={TerminalIcon}
                      subtitle={`${item.timestamp} • ${item.durationMs}ms`}
                    >
                      <div className="text-xs font-mono text-slate-300 line-clamp-2 leading-relaxed pt-1 whitespace-pre-wrap">
                        {item.output}
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SECRETS & RUNTIME VARIABLES */}
          {activeTab === 'secrets' && (
            <motion.div
              key="secrets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Variables & Clés d'Environnement"
                subtitle="Chiffrement matériel AES-256-GCM et gestion Zero-Trust"
                icon={KeyRound}
                badge="Chiffré"
                badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
                kpis={[
                  { label: 'Clés Configurées', value: INITIAL_SECRETS.length, sub: 'Partition isolée' },
                  { label: 'Chiffrement', value: 'AES-256', sub: 'Hardware Enclave' },
                  { label: 'Conformité', value: '100% Valide', sub: 'Zero fuite', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {INITIAL_SECRETS.map(es => {
                    const isRevealed = revealedSecretIds.has(es.id);

                    return (
                      <DetailCard
                        key={es.id}
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedSecret(es);
                        }}
                        isInteractive
                        title={es.key}
                        badge={es.env}
                        badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                        icon={KeyRound}
                        subtitle={`Scope : ${es.scope}`}
                        actions={
                          <button
                            onClick={(e) => toggleSecretReveal(es.id, e)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title={isRevealed ? 'Masquer la valeur' : 'Révéler la valeur'}
                          >
                            {isRevealed ? <Unlock size={13} className="text-amber-400" /> : <Lock size={13} />}
                          </button>
                        }
                      >
                        <div className="flex justify-between items-center text-xs pt-1 font-mono text-slate-400">
                          <span className={isRevealed ? 'text-emerald-400 font-semibold truncate max-w-[200px]' : 'text-slate-500'}>
                            {isRevealed ? es.value : es.masked}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-sans">Inspecter →</span>
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 5: PROCESSES & DAEMONS */}
          {activeTab === 'processes' && (
            <motion.div
              key="processes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Processus Système & Daemons"
                subtitle="Gestionnaires MCP et threads de calcul en temps réel"
                icon={Cpu}
                badge={`${processesList.length} Actifs`}
                kpis={[
                  { label: 'Processus Actifs', value: processesList.length, sub: 'Threads alloués' },
                  { label: 'Charge Globale', value: '7.8%', sub: '4 Cores ARM64' },
                  { label: 'Mémoire Utilisée', value: '638 MB', sub: 'Pool 2048 MB' }
                ]}
              >
                <div className="space-y-3">
                  {processesList.map(proc => (
                    <DetailCard
                      key={proc.pid}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedProcess(proc);
                      }}
                      isInteractive
                      title={proc.name}
                      badge={`PID ${proc.pid}`}
                      badgeColor={proc.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono' : 'bg-slate-950 text-slate-300 border-slate-800 font-mono'}
                      icon={Cpu}
                      subtitle={`Uptime : ${proc.uptime} • ${proc.threads} Threads`}
                      actions={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestartProcess(proc);
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Redémarrer le processus"
                        >
                          <RefreshCw size={13} />
                        </button>
                      }
                    >
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <span className="text-slate-400">Charge CPU : <strong className={proc.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}>{proc.cpu}</strong></span>
                        <span className="text-slate-400">RAM Allouée : <strong className="text-slate-200">{proc.mem}</strong></span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAIL DRAWER FOR SCRIPT */}
      <DetailDrawer
        isOpen={!!selectedScript}
        onClose={() => setSelectedScript(null)}
        title={selectedScript?.name || ''}
        subtitle={`${selectedScript?.desc}`}
        badge={selectedScript?.category || 'Script'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedScript?.name?.charAt(0) || 'S'}
        breadcrumbs={[
          { label: 'Terminal OS', onClick: () => setSelectedScript(null) },
          { label: 'Scripts', onClick: () => setSelectedScript(null) },
          { label: selectedScript?.name || 'Script' }
        ]}
        actions={[
          {
            id: 'run-script',
            label: 'Exécuter Maintenant',
            icon: Play,
            variant: 'primary',
            onClick: () => {
              if (selectedScript) {
                haptics.trigger('success');
                const scriptCmd = selectedScript.name;
                setSelectedScript(null);
                setActiveTab('cli');
                setTimeout(() => handleCommand(scriptCmd), 100);
              }
            }
          },
          {
            id: 'copy-cmd',
            label: 'Copier Commande',
            icon: Copy,
            onClick: () => {
              if (selectedScript) handleCopyText(selectedScript.command, 'Commande');
            }
          }
        ]}
        kpis={[
          { label: 'Temps Moyen', value: selectedScript?.avgTime || '0s', sub: 'Historique 30j' },
          { label: 'Taux Succès', value: selectedScript?.successRate || '100%', sub: 'Fiabilité pipeline', trend: 'up' },
          { label: 'Privilège Requis', value: selectedScript?.privilege || 'User', sub: 'Contrôle RBAC' },
          { label: 'Catégorie', value: selectedScript?.category || 'Ops', sub: 'Classification' }
        ]}
        aiInsight={{
          title: 'Optimiseur de Script SRE',
          content: `Le script ${selectedScript?.name} bénéficie d'une mise en cache des artifacts intermédiaires. Aucun goulot d'étranglement détecté.`,
          actionLabel: 'Lancer un Dry-Run sans écriture',
          onAction: () => {
            showToast('Dry-Run validé : 0 collision détectée');
          }
        }}
        tabs={[
          {
            id: 'spec',
            label: 'Spécification',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Ligne de commande complète</div>
                  <div className="font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {selectedScript?.command}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Flags & Paramètres supportés</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScript?.flags.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DETAIL DRAWER FOR COMMAND HISTORY ITEM */}
      <DetailDrawer
        isOpen={!!selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
        title={selectedHistoryItem?.command || 'Trace Commande'}
        subtitle={`Exécuté à ${selectedHistoryItem?.timestamp} • Durée : ${selectedHistoryItem?.durationMs}ms`}
        badge={selectedHistoryItem?.exitCode === 0 ? 'Succès (Exit 0)' : `Erreur (Exit ${selectedHistoryItem?.exitCode})`}
        badgeColor={selectedHistoryItem?.exitCode === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}
        avatarText="❯"
        breadcrumbs={[
          { label: 'Terminal OS', onClick: () => setSelectedHistoryItem(null) },
          { label: 'Historique', onClick: () => setSelectedHistoryItem(null) },
          { label: selectedHistoryItem?.command || 'Trace' }
        ]}
        actions={[
          {
            id: 'rerun',
            label: 'Ré-exécuter',
            icon: Play,
            variant: 'primary',
            onClick: () => {
              if (selectedHistoryItem) {
                const cmd = selectedHistoryItem.command;
                setSelectedHistoryItem(null);
                setActiveTab('cli');
                setTimeout(() => handleCommand(cmd), 100);
              }
            }
          },
          {
            id: 'copy-output',
            label: 'Copier Sortie',
            icon: Copy,
            onClick: () => {
              if (selectedHistoryItem) handleCopyText(selectedHistoryItem.output, 'Sortie stdout');
            }
          }
        ]}
        kpis={[
          { label: 'Code Retour', value: `Exit ${selectedHistoryItem?.exitCode}`, sub: selectedHistoryItem?.exitCode === 0 ? 'Nominal' : 'Non-zéro' },
          { label: 'Durée Runtime', value: `${selectedHistoryItem?.durationMs}ms`, sub: 'Horloge processeur' },
          { label: 'Taille Payload', value: `${selectedHistoryItem?.output.length || 0} octets`, sub: 'Buffer stdout' },
          { label: 'Horodatage', value: selectedHistoryItem?.timestamp || '', sub: 'Heure locale' }
        ]}
        tabs={[
          {
            id: 'output',
            label: 'Sortie Standard (stdout)',
            content: (
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedHistoryItem?.output}
              </div>
            )
          }
        ]}
      />

      {/* DETAIL DRAWER FOR SECRETS */}
      <DetailDrawer
        isOpen={!!selectedSecret}
        onClose={() => setSelectedSecret(null)}
        title={selectedSecret?.key || ''}
        subtitle={`Chiffrement : ${selectedSecret?.encryption} • ${selectedSecret?.scope}`}
        badge={selectedSecret?.env || 'Production'}
        badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-semibold"
        avatarText={selectedSecret?.key?.charAt(0) || 'K'}
        breadcrumbs={[
          { label: 'Terminal OS', onClick: () => setSelectedSecret(null) },
          { label: 'Variables', onClick: () => setSelectedSecret(null) },
          { label: selectedSecret?.key || 'Clé' }
        ]}
        actions={[
          {
            id: 'copy-secret',
            label: 'Copier Token',
            icon: Copy,
            variant: 'primary',
            onClick: () => {
              if (selectedSecret) handleCopyText(selectedSecret.value, selectedSecret.key);
            }
          },
          {
            id: 'rotate-key',
            label: 'Régénérer Clé',
            icon: RotateCw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Procédure de rotation lancée pour ${selectedSecret?.key}`);
            }
          }
        ]}
        kpis={[
          { label: 'Environnement', value: selectedSecret?.env || 'Prod', sub: 'Partitionnement' },
          { label: 'Rotation', value: selectedSecret?.lastRotated || 'Récent', sub: 'Cycle 90 jours' },
          { label: 'Chiffrement', value: selectedSecret?.encryption || 'AES-256', sub: 'Hardware Keyring' },
          { label: 'Accès Scope', value: 'Restreint', sub: 'RBAC Zero-Trust' }
        ]}
        tabs={[
          {
            id: 'secret-val',
            label: 'Valeur Chiffrée',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Valeur Active du Token</div>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 break-all border border-slate-800">
                    {selectedSecret?.value}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* DETAIL DRAWER FOR PROCESS */}
      <DetailDrawer
        isOpen={!!selectedProcess}
        onClose={() => setSelectedProcess(null)}
        title={selectedProcess?.name || ''}
        subtitle={`PID ${selectedProcess?.pid} • Port : ${selectedProcess?.port || 'N/A'}`}
        badge={selectedProcess?.status === 'running' ? 'Actif' : selectedProcess?.status === 'warning' ? 'Sous Charge' : 'Inactif'}
        badgeColor={selectedProcess?.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
        avatarText="P"
        breadcrumbs={[
          { label: 'Terminal OS', onClick: () => setSelectedProcess(null) },
          { label: 'Processus', onClick: () => setSelectedProcess(null) },
          { label: selectedProcess?.name || 'Processus' }
        ]}
        actions={[
          {
            id: 'restart-proc',
            label: 'Redémarrer',
            icon: RefreshCw,
            variant: 'primary',
            onClick: () => {
              if (selectedProcess) handleRestartProcess(selectedProcess);
            }
          },
          {
            id: 'kill-proc',
            label: 'Tuer (SIGKILL)',
            icon: Trash2,
            variant: 'danger',
            onClick: () => {
              if (selectedProcess) handleKillProcess(selectedProcess);
            }
          }
        ]}
        kpis={[
          { label: 'Charge CPU', value: selectedProcess?.cpu || '0%', sub: 'Allocation VM' },
          { label: 'Mémoire RAM', value: selectedProcess?.mem || '0 MB', sub: 'Pool résident' },
          { label: 'Threads Actifs', value: selectedProcess?.threads || 1, sub: 'Concurrence' },
          { label: 'Temps d\'activité', value: selectedProcess?.uptime || '0s', sub: 'Sans crash' }
        ]}
        tabs={[
          {
            id: 'proc-info',
            label: 'Télémétrie',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Identifiant PID :</span>
                    <span className="font-mono text-slate-200">{selectedProcess?.pid}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Port Réseau Écouté :</span>
                    <span className="font-mono text-emerald-400">{selectedProcess?.port || 'Non exposé'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Priorité Scheduler (Nice) :</span>
                    <span className="font-mono text-slate-200">0 (Normal Priority)</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
