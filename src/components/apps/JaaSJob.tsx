import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ServerCrash, 
  Cpu, 
  Layers, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertOctagon, 
  Terminal, 
  Copy, 
  Download, 
  ChevronRight, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  Users, 
  Briefcase, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Activity,
  Trash2,
  Mail,
  Send,
  Plus,
  X
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

// --- DATA DEFINITIONS ---

interface CronTaskItem {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  concurrency: string;
  timezone: string;
  status: 'active' | 'paused' | 'running';
  successRate: string;
  avgDuration: string;
  maxThreads: number;
  logs: string[];
  errorTrace: string;
  aiInsight: string;
}

interface DLQItem {
  id: string;
  jobCode: string;
  originQueue: string;
  retriesFailed: string;
  errorCode: string;
  exceptionName: string;
  failedAt: string;
  payload: string;
  rootCause: string;
  aiInsight: string;
}

interface WorkerPoolItem {
  id: string;
  name: string;
  category: string;
  activeThreads: number;
  maxThreads: number;
  cpuUsage: string;
  memoryUsage: string;
  throughputJobsMin: string;
  minInstances: number;
  maxInstances: number;
  status: 'optimal' | 'scaling' | 'busy';
  aiInsight: string;
}

interface CandidateItem {
  id: string;
  name: string;
  role: string;
  score: string;
  match: string;
  exp: string;
  status: string;
  email: string;
  aiNotes: string;
}

// --- INITIAL MOCK DATA ---

const INITIAL_CRON_TASKS: CronTaskItem[] = [
  {
    id: 'cron-1',
    name: 'Nightly DB Schema & Data Backup',
    schedule: '0 3 * * * (Quotidien 03:00 UTC)',
    nextRun: 'Demain à 03:00 UTC (dans 5h 48m)',
    concurrency: 'Forbid Concurrent (Instance Unique)',
    timezone: 'UTC / Europe-Paris',
    status: 'active',
    successRate: '100%',
    avgDuration: '4m 12s',
    maxThreads: 1,
    logs: [
      '[03:00:01] INFO  [worker-cron-01] Starting pg_dump snapshot on db-primary-eu',
      '[03:02:10] INFO  [worker-cron-01] Compressing stream gzip level 9: 4.8 GB written',
      '[03:04:12] SUCCESS [worker-cron-01] Upload completed to s3://omk-backups-immutable-eu',
      '[03:04:15] INFO  [worker-cron-01] Checksum SHA-512 validated and registered in Compliance Vault'
    ],
    errorTrace: '0 anomalie détectée - Code retour exit 0 (Succès nominal sur les 180 derniers runs)',
    aiInsight: 'Ce job de sauvegarde s\'exécute pendant le creux de trafic système. L\'utilisation mémoire culmine à 340 MB, bien en-deçà des 1024 MB alloués au conteneur.'
  },
  {
    id: 'cron-2',
    name: 'Stripe Invoice & Ledger Reconciliation',
    schedule: '*/15 * * * * (Toutes les 15 minutes)',
    nextRun: 'Dans 6 min (16:00 UTC)',
    concurrency: 'Queue Next (File Sécurisée)',
    timezone: 'UTC',
    status: 'active',
    successRate: '99.8%',
    avgDuration: '1.4s',
    maxThreads: 2,
    logs: [
      '[15:45:00] INFO  [worker-cron-02] Polling Stripe un-reconciled events: 14 transactions found',
      '[15:45:01] SUCCESS [worker-cron-02] 14 entries reconciled into General Ledger (account 512000)',
      '[15:45:01] INFO  [worker-cron-02] VAT split computed accurately: $412.50 collected'
    ],
    errorTrace: 'Aucune erreur constatée sur les 200 dernières exécutions programmées',
    aiInsight: 'Le temps moyen de réconciliation bancaire est descendu à 1.4s. La déduplication par idempotency key empêche toute double écriture comptable.'
  },
  {
    id: 'cron-3',
    name: 'Vector Embeddings Index Re-ranking',
    schedule: '0 */6 * * * (Toutes les 6 heures)',
    nextRun: 'À 18:00 UTC (dans 2h 12m)',
    concurrency: 'Forbid Concurrent',
    timezone: 'UTC',
    status: 'active',
    successRate: '99.4%',
    avgDuration: '45s',
    maxThreads: 4,
    logs: [
      '[12:00:00] INFO  [worker-cron-03] Re-indexing 24,000 document vectors with pgvector HNSW algorithm',
      '[12:00:25] INFO  [worker-cron-03] Cosine similarity clusters recalculated across 8 shards',
      '[12:00:45] SUCCESS [worker-cron-03] Index optimization completed (Cosine recall: 99.85%)'
    ],
    errorTrace: 'Zéro erreur - Index pgvector 100% synchronisé',
    aiInsight: 'Le re-ranking sémantique a amélioré la pertinence des réponses du Coach AI de 12% tout en conservant une latence d\'interrogation sous 28ms.'
  },
  {
    id: 'cron-4',
    name: 'Telemetry Ingest & Metric Rollup',
    schedule: '*/5 * * * * (Toutes les 5 minutes)',
    nextRun: 'Dans 1 min',
    concurrency: 'Allow Concurrent',
    timezone: 'UTC',
    status: 'active',
    successRate: '100%',
    avgDuration: '320ms',
    maxThreads: 2,
    logs: [
      '[15:55:00] INFO  [worker-cron-04] Aggregating 120,000 telemetry events from eBPF streamer',
      '[15:55:00] SUCCESS [worker-cron-04] Prometheus rollup metrics stored in TimescaleDB partitions'
    ],
    errorTrace: 'Nominal - Flux continu',
    aiInsight: 'L\'agrégation par fenêtres glissantes réduit le volume brut de logs de 88% sans perte de granularité sur les alertes P99.'
  }
];

const INITIAL_DLQ_ITEMS: DLQItem[] = [
  {
    id: 'dlq-1',
    jobCode: 'DLQ-9012: Stripe Webhook Upstream Timeout',
    originQueue: 'queue-billing-webhooks-p1',
    retriesFailed: '5 / 5 Tentatives',
    errorCode: 'HTTP 504 Gateway Timeout',
    exceptionName: 'UpstreamTimeoutException',
    failedAt: 'Il y a 14 min',
    payload: JSON.stringify({
      job_id: 'job_retry_9012',
      event: 'invoice.payment_succeeded',
      customer_id: 'cus_8492019',
      amount_usd: 1250.00,
      payment_intent: 'pi_3Mkj99x82910',
      origin_ip: '54.187.205.12',
      attempt_count: 5,
      first_enqueued_at: '2026-08-22T15:30:12Z'
    }, null, 2),
    rootCause: `UpstreamTimeoutException: Stripe API upstream gateway timed out after 5000ms on route /v1/invoices/inv_998129/pay
  at BillingClient.execute (src/services/stripe.ts:88:14)
  at QueueWorker.process (src/workers/billingWorker.ts:42:9)
  at async JobRunner.dispatch (src/core/runner.ts:118:5)`,
    aiInsight: 'Diagnostic Coach AI : La passerelle distante Stripe a connu une contention réseau temporaire désormais résolue (Code HTTP 200 rétabli). La ré-injection immédiate réussira à 100%.'
  },
  {
    id: 'dlq-2',
    jobCode: 'DLQ-8491: OpenAI Token Limit Exceeded',
    originQueue: 'queue-ai-inference-batch',
    retriesFailed: '3 / 3 Tentatives',
    errorCode: 'HTTP 429 RateLimitExceeded',
    exceptionName: 'RateLimitException',
    failedAt: 'Il y a 38 min',
    payload: JSON.stringify({
      job_id: 'job_retry_8491',
      model: 'gpt-4o',
      max_tokens: 4096,
      prompt_tokens: 14200,
      context_docs_count: 8,
      priority: 'normal'
    }, null, 2),
    rootCause: `RateLimitException: Organization token per minute limit reached for gpt-4o (TPM > 300,000)
  at AIClient.generateEmbeddings (src/services/openai.ts:112:20)
  at BatchWorker.consume (src/workers/aiWorker.ts:74:11)`,
    aiInsight: 'Le quota de tokens de l\'organisation s\'est réinitialisé. Le basculement automatique sur Claude 3.5 Sonnet a été configuré pour la prochaine tentative.'
  },
  {
    id: 'dlq-3',
    jobCode: 'DLQ-7721: PostgreSQL Lock Contention on Ledger',
    originQueue: 'queue-ledger-sync',
    retriesFailed: '4 / 4 Tentatives',
    errorCode: 'PG 55P03 LockNotAvailable',
    exceptionName: 'QueryLockTimeout',
    failedAt: 'Il y a 1h 12m',
    payload: JSON.stringify({
      job_id: 'job_retry_7721',
      journal_entry_id: 'je_883920',
      account_from: '512000',
      account_to: '706000',
      amount_eur: 4500.00,
      reference: 'INV-2026-Q3-09'
    }, null, 2),
    rootCause: `QueryLockTimeout: could not obtain lock on row in relation "general_ledger_entries" after 2000ms
  at PostgresPool.query (src/db/postgres.ts:54:12)
  at LedgerSync.process (src/services/ledger.ts:32:8)`,
    aiInsight: 'La transaction concurrente a été finalisée. La table est désormais libre de tout verrou exclusif.'
  }
];

const INITIAL_WORKER_POOLS: WorkerPoolItem[] = [
  {
    id: 'pool-realtime',
    name: 'High-Priority Realtime Worker Pool',
    category: 'Ingress & Webhooks',
    activeThreads: 8,
    maxThreads: 16,
    cpuUsage: '24%',
    memoryUsage: '512 MB',
    throughputJobsMin: '450 jobs / min',
    minInstances: 2,
    maxInstances: 16,
    status: 'optimal',
    aiInsight: 'Pool hautement réactif dédié aux paiements Stripe et authentifications. Temps de réponse moyen de traitement : 18ms.'
  },
  {
    id: 'pool-batch',
    name: 'Batch Compute & Data Crunching Pool',
    category: 'Génération & Sauvegardes',
    activeThreads: 12,
    maxThreads: 24,
    cpuUsage: '68%',
    memoryUsage: '3.4 GB',
    throughputJobsMin: '1,200 jobs / min',
    minInstances: 4,
    maxInstances: 32,
    status: 'busy',
    aiInsight: 'Pool optimisé pour les calculs lourds de clôture financière et exports PDF. Autoscaling configuré avec seuil à 75% de charge CPU.'
  },
  {
    id: 'pool-ai',
    name: 'AI Inference & Vector Worker Pool',
    category: 'RAG & Modèles Sémantiques',
    activeThreads: 6,
    maxThreads: 12,
    cpuUsage: '42%',
    memoryUsage: '1.8 GB',
    throughputJobsMin: '180 jobs / min',
    minInstances: 2,
    maxInstances: 12,
    status: 'optimal',
    aiInsight: 'Workers équipés d\'accélérateurs de calcul pour l\'inférence locale et la vectorisation pgvector temps réel.'
  }
];

const INITIAL_CANDIDATES: CandidateItem[] = [
  { 
    id: 'c1', 
    name: 'Alexandre Meyer', 
    role: 'Staff Engineer (Distributed Systems)', 
    score: '98%', 
    match: 'Rust • Kubernetes • MCP Protocol • eBPF', 
    exp: '8 ans', 
    status: 'Entretien Final', 
    email: 'alex.meyer@dev.co',
    aiNotes: 'Profil exceptionnel. A conçu des architectures à plus de 500k req/s. Recommandation : émettre une proposition formelle d\'embauche sous 48h.'
  },
  { 
    id: 'c2', 
    name: 'Sophie Laurent', 
    role: 'Lead Growth & Acquisition B2B', 
    score: '94%', 
    match: 'B2B SaaS • Paid Ads • NRR Expansion', 
    exp: '6 ans', 
    status: 'Test Technique', 
    email: 'sophie.l@growth.io',
    aiNotes: 'Excellente maîtrise du cycle de vente Enterprise et des funnels d\'acquisition outbound.'
  },
  { 
    id: 'c3', 
    name: 'Julien Vasseur', 
    role: 'Cloud Architect & Security Specialist', 
    score: '91%', 
    match: 'TypeScript • Linux Kernel • Zero Trust', 
    exp: '5 ans', 
    status: 'Premier Contact', 
    email: 'j.vasseur@tech.fr',
    aiNotes: 'Solide expérience sur les normes SOC 2 Type II et ISO 27001.'
  }
];

const JAAS_TABS = [
  { id: 'cron', label: 'Cron Jobs & Tasks', icon: Calendar, badge: 4 },
  { id: 'dlq', label: 'Dead Letter Queue', icon: ServerCrash, badge: 3, badgeColor: 'bg-red-500 text-slate-950 font-bold' },
  { id: 'workers', label: 'Worker Pools', icon: Cpu, badge: 'Actif' },
  { id: 'funnel', label: 'Talents & Funnel', icon: Users, badge: 3 }
];

export default function JaaSJob() {
  const [activeTab, setActiveTab] = useState('cron');
  const [cronTasks, setCronTasks] = useState<CronTaskItem[]>(INITIAL_CRON_TASKS);
  const [dlqItems, setDlqItems] = useState<DLQItem[]>(INITIAL_DLQ_ITEMS);
  const [workerPools, setWorkerPools] = useState<WorkerPoolItem[]>(INITIAL_WORKER_POOLS);
  const [candidates, setCandidates] = useState<CandidateItem[]>(INITIAL_CANDIDATES);

  // Selected drawers
  const [selectedCron, setSelectedCron] = useState<CronTaskItem | null>(null);
  const [selectedDLQ, setSelectedDLQ] = useState<DLQItem | null>(null);
  const [selectedPool, setSelectedPool] = useState<WorkerPoolItem | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Cron Planning
  const [isCreateCronOpen, setIsCreateCronOpen] = useState(false);
  const [cronName, setCronName] = useState('');
  const [cronSchedule, setCronSchedule] = useState('*/15 * * * *');
  const [cronScheduleHuman, setCronScheduleHuman] = useState('Toutes les 15 minutes');
  const [cronTargetService, setCronTargetService] = useState('Realtime Worker Pool');
  const [cronTimeout, setCronTimeout] = useState('30s');
  const [cronConcurrency, setCronConcurrency] = useState('Forbid Concurrent (Instance Unique)');
  const [cronTimezone, setCronTimezone] = useState('UTC / Europe-Paris');

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreateCronOpen) setIsCreateCronOpen(false);
        else if (selectedCron) setSelectedCron(null);
        else if (selectedDLQ) setSelectedDLQ(null);
        else if (selectedPool) setSelectedPool(null);
        else if (selectedCandidate) setSelectedCandidate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateCronOpen, selectedCron, selectedDLQ, selectedPool, selectedCandidate]);

  // Handle Create Cron Submit
  const handleCreateCronSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cronName.trim() || !cronSchedule.trim()) return;

    haptics.trigger('success');
    const cleanName = cronName.trim();
    const newCronTask: CronTaskItem = {
      id: `cron-${Date.now()}`,
      name: cleanName,
      schedule: `${cronSchedule.trim()} (${cronScheduleHuman || 'Personnalisé'})`,
      nextRun: 'Prochain créneau d\'exécution nominal',
      concurrency: cronConcurrency,
      timezone: cronTimezone || 'UTC',
      status: 'active',
      successRate: '100%',
      avgDuration: cronTimeout || '1.5s',
      maxThreads: 1,
      logs: [
        `[À l'instant] INFO  [scheduler] Cron task "${cleanName}" enregistrée avec succès sur ${cronTargetService}`,
        `[À l'instant] INFO  [worker] Planification: ${cronSchedule.trim()} | Timeout: ${cronTimeout || '30s'} | Concurrence: ${cronConcurrency}`
      ],
      errorTrace: 'Tâche active et opérationnelle - 0 échec',
      aiInsight: `La tâche "${cleanName}" est orchestrée sur le service cible ${cronTargetService}. Timeout fixé à ${cronTimeout}. Aucun conflit de ressources détecté.`
    };

    setCronTasks(prev => [newCronTask, ...prev]);
    setIsCreateCronOpen(false);
    setCronName('');
    showToast(`Tâche Cron "${cleanName}" planifiée avec succès`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Force Run Cron Task
  const handleForceRunCron = (taskId: string) => {
    haptics.trigger('success');
    const newLog = `[À l'instant] SUCCESS [manual-trigger] Exécution forcée réussie en 820ms par l'opérateur (Code 0)`;

    setCronTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        logs: [newLog, ...task.logs]
      };
    }));

    if (selectedCron && selectedCron.id === taskId) {
      setSelectedCron(prev => prev ? { ...prev, logs: [newLog, ...prev.logs] } : null);
    }

    showToast(`Exécution immédiate du job "${selectedCron?.name || 'Tâche'}" réussie`);
  };

  // Retry DLQ Item
  const handleRetryDLQ = (dlqId: string) => {
    haptics.trigger('success');
    setDlqItems(prev => prev.filter(item => item.id !== dlqId));
    if (selectedDLQ && selectedDLQ.id === dlqId) {
      setSelectedDLQ(null);
    }
    showToast(`Tâche ${selectedDLQ?.jobCode.split(':')[0] || 'DLQ'} ré-injectée avec succès dans la file prioritaire`);
  };

  // Purge DLQ Item
  const handlePurgeDLQ = (dlqId: string) => {
    haptics.trigger('medium');
    setDlqItems(prev => prev.filter(item => item.id !== dlqId));
    if (selectedDLQ && selectedDLQ.id === dlqId) {
      setSelectedDLQ(null);
    }
    showToast(`Tâche ${selectedDLQ?.jobCode.split(':')[0] || 'DLQ'} définitivement purgée`);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={JAAS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">

          {/* TAB 1: CRON JOBS & TASKS */}
          {activeTab === 'cron' && (
            <motion.div
              key="cron"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Tâches Planifiées & Cron Jobs"
                subtitle="Orchestration temporelle, logs d'exécution et déclenchement manuel"
                badge={`${cronTasks.length} Tâches Actives`}
                icon={Calendar}
                kpis={[
                  { label: 'Taux de Réussite', value: '99.9%', sub: 'Zéro échec bloquant', trend: 'up' },
                  { label: 'Exécutions / Jour', value: '412', sub: 'Distribution nominale' },
                  { label: 'Durée Moyenne', value: '1.2s', sub: 'Optimisé', trend: 'up' }
                ]}
                actions={
                  <button
                    onClick={() => {
                      haptics.trigger('selection');
                      setIsCreateCronOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Planifier Tâche Cron</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {cronTasks.map(task => (
                    <DetailCard
                      key={task.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCron(task);
                      }}
                      isInteractive
                      title={task.name}
                      badge={task.status === 'active' ? 'Planifié' : 'En Pause'}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={Calendar}
                      subtitle={`Planning : ${task.schedule.split('(')[0]}`}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Taux Succès</div>
                          <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{task.successRate}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Durée Moyenne</div>
                          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{task.avgDuration}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Concurrence</div>
                          <div className="text-xs font-semibold text-slate-300 mt-0.5">{task.maxThreads} instance</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Prochain : <span className="text-slate-200">{task.nextRun.split('(')[0]}</span></span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          Inspecter logs & Forcer run →
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Optimisation de Planification AI"
                  content="Tous les créneaux de cron jobs sont équilibrés sans chevauchement sur les ressources CPU et E/S disques. Zéro pic de contention détecté."
                  actionLabel="Vérifier la grille de collision temporelle"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Grille de planification auditée : Zéro collision détectée');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: DEAD LETTER QUEUE (DLQ) */}
          {activeTab === 'dlq' && (
            <motion.div
              key="dlq"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Dead Letter Queue (DLQ & Échecs)"
                subtitle="Inspection des payloads échoués, traces d'erreur et ré-injection"
                badge={`${dlqItems.length} En Attente`}
                badgeColor={dlqItems.length > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                icon={ServerCrash}
                kpis={[
                  { label: 'Tâches en DLQ', value: `${dlqItems.length}`, sub: 'Nécessite action' },
                  { label: 'Taux de Récupération', value: '100%', sub: 'Historique des ré-injections', trend: 'up' },
                  { label: 'Rétention DLQ', value: '14 jours', sub: 'Stockage immuable' }
                ]}
              >
                {dlqItems.length === 0 ? (
                  <div className="p-8 bg-slate-900/60 rounded-3xl border border-slate-800 text-center space-y-2">
                    <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-slate-100 text-sm">Dead Letter Queue Vierge</h3>
                    <p className="text-xs text-slate-400">Aucune tâche en échec dans le système. Toutes les files d'attente fonctionnent à 100% de succès.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dlqItems.map(item => (
                      <DetailCard
                        key={item.id}
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedDLQ(item);
                        }}
                        isInteractive
                        title={item.jobCode}
                        badge={item.errorCode}
                        badgeColor="bg-red-500/10 text-red-400 border-red-500/30 font-mono font-semibold"
                        icon={AlertOctagon}
                        subtitle={`File d'origine : ${item.originQueue} • ${item.failedAt}`}
                      >
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 mt-2 font-mono text-[11px] text-red-300 truncate">
                          {item.exceptionName}
                        </div>

                        <div className="flex justify-between items-center pt-2 mt-1 text-[11px]">
                          <span className="text-slate-400">Échecs : <strong className="text-red-400">{item.retriesFailed}</strong></span>
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            Inspecter payload & Ré-injecter →
                          </span>
                        </div>
                      </DetailCard>
                    ))}
                  </div>
                )}

                <AIInsightCard
                  title="Analyse Root Cause AI"
                  content="Les 3 échecs en DLQ proviennent d'indisponibilités réseau tierces temporaires (Stripe et quota OpenAI). Leurs services étant rétablis, la ré-injection globale réussira sans anomalie."
                  actionLabel="Ré-injecter toutes les tâches DLQ en lot"
                  onAction={() => {
                    haptics.trigger('success');
                    setDlqItems([]);
                    showToast('Toutes les tâches DLQ ont été ré-injectées avec succès');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: WORKER POOLS */}
          {activeTab === 'workers' && (
            <motion.div
              key="workers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Clusters & Pools d'Exécution"
                subtitle="Capacité de calcul, consommation mémoire et politiques d'autoscaling"
                badge="3 Pools Actifs"
                icon={Cpu}
                kpis={[
                  { label: 'Threads Totaux', value: '26 / 52', sub: '50% charge nominale' },
                  { label: 'Débit Global', value: '1,830 jobs/m', sub: 'Pic de trafic nominal', trend: 'up' },
                  { label: 'Santé des Nœuds', value: '100%', sub: 'Cluster résilient' }
                ]}
              >
                <div className="space-y-3">
                  {workerPools.map(pool => (
                    <DetailCard
                      key={pool.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedPool(pool);
                      }}
                      isInteractive
                      title={pool.name}
                      badge={`${pool.activeThreads}/${pool.maxThreads} Threads`}
                      badgeColor="bg-slate-950 text-emerald-400 border-slate-800 font-mono font-semibold"
                      icon={Cpu}
                      subtitle={pool.category}
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Charge CPU</div>
                          <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{pool.cpuUsage}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Mémoire RAM</div>
                          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{pool.memoryUsage}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Débit Traitement</div>
                          <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{pool.throughputJobsMin.split('/')[0]}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/50 text-[11px]">
                        <span className="text-slate-400">Autoscaling : <strong className="text-slate-200">{pool.minInstances} → {pool.maxInstances} instances</strong></span>
                        <span className="text-emerald-400 font-medium">Télémétrie & Scaling →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Orchestrateur de Ressources AI"
                  content="Le pool Batch Compute atteint 68% de charge CPU lors de la génération des rapports fiscaux. L'autoscaling dynamique ajoutera 4 instances supplémentaires dès le dépassement de 75%."
                  actionLabel="Optimiser la répartition des threads"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Répartition optimale des threads d\'exécution appliquée');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: TALENTS & FUNNEL */}
          {activeTab === 'funnel' && (
            <motion.div
              key="funnel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Vivier de Talents & Funnel JaaS"
                subtitle="Chasse de têtes automatisée, matching IA et propositions de contrat"
                badge={`${candidates.length} Shortlist`}
                icon={Users}
                kpis={[
                  { label: 'Candidats Sourcés', value: '50', sub: '+18 cette semaine', trend: 'up' },
                  { label: 'Taux de Réponse', value: '43.3%', sub: 'Benchmark supérieur' },
                  { label: 'Shortlist Validée', value: `${candidates.length}`, sub: 'Prêts pour embauche' }
                ]}
              >
                <div className="space-y-3">
                  {candidates.map(cand => (
                    <DetailCard
                      key={cand.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCandidate(cand);
                      }}
                      isInteractive
                      title={cand.name}
                      badge={`Score ${cand.score}`}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      icon={Users}
                      subtitle={`${cand.role} • ${cand.exp}`}
                    >
                      <div className="flex items-center justify-between pt-1 mt-1 text-xs">
                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">{cand.match}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                          <span>{cand.status}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Analyse Sourcing Coach AI"
                  content="Le profil Alexandre Meyer correspond à 98% au besoin Staff Engineer. La recommandation est de formuler une offre formelle sous 48h pour devancer les offres concurrentes."
                  actionLabel="Préparer le projet de contrat d'embauche"
                  onAction={() => {
                    haptics.trigger('light');
                    showToast('Projet de contrat d\'embauche généré et prêt pour signature');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 1: CRON TASK DETAIL DRAWER                                 */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedCron}
        onClose={() => setSelectedCron(null)}
        title={selectedCron?.name || ''}
        subtitle={`Planning : ${selectedCron?.schedule}`}
        badge={selectedCron?.status === 'active' ? 'Planifié & Actif' : 'En Pause'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="CRON"
        breadcrumbs={[
          { label: 'JaaS Job', onClick: () => setSelectedCron(null) },
          { label: 'Cron Jobs', onClick: () => setSelectedCron(null) },
          { label: selectedCron?.name.split(' ')[0] || 'Tâche' }
        ]}
        actions={[
          {
            id: 'force_run',
            label: 'Forcer Run Immédiat',
            icon: Play,
            variant: 'primary',
            onClick: () => selectedCron && handleForceRunCron(selectedCron.id)
          },
          {
            id: 'pause_cron',
            label: selectedCron?.status === 'active' ? 'Mettre en Pause' : 'Reprendre',
            icon: RotateCcw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Statut du cron job ${selectedCron?.name} modifié`);
            }
          }
        ]}
        kpis={[
          { label: 'Prochain Run', value: selectedCron?.nextRun.split('(')[0] || '', sub: selectedCron?.timezone || 'UTC' },
          { label: 'Durée Moyenne', value: selectedCron?.avgDuration || '0s', sub: 'Temps d\'exécution', trend: 'up' },
          { label: 'Taux de Succès', value: selectedCron?.successRate || '100%', sub: 'Historique nominal' },
          { label: 'Concurrence', value: `${selectedCron?.maxThreads || 1} instance`, sub: selectedCron?.concurrency.split(' ')[0] }
        ]}
        aiInsight={{
          title: 'Diagnostic d\'Exécution AI',
          content: selectedCron?.aiInsight || '',
          actionLabel: 'Exporter la télémétrie des exécutions',
          onAction: () => {
            haptics.trigger('light');
            showToast('Télémétrie temporelle exportée en CSV');
          }
        }}
        tabs={[
          {
            id: 'cron_logs',
            label: `Logs Récentes (${selectedCron?.logs.length || 0})`,
            content: (
              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                  {selectedCron?.logs.map((log, idx) => (
                    <div key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'cron_trace',
            label: 'Trace & Statut Erreur',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200">Dernier Statut d'Exécution</span>
                <p className="text-emerald-400 font-mono text-[11px] leading-relaxed">{selectedCron?.errorTrace}</p>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 2: DLQ FAILED JOB DETAIL DRAWER                             */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedDLQ}
        onClose={() => setSelectedDLQ(null)}
        title={selectedDLQ?.jobCode.split(':')[0] || ''}
        subtitle={`${selectedDLQ?.jobCode.split(':')[1] || ''} • ${selectedDLQ?.failedAt}`}
        badge={selectedDLQ?.errorCode}
        badgeColor="bg-red-500/10 text-red-400 border-red-500/30 font-mono font-bold"
        avatarText="DLQ"
        breadcrumbs={[
          { label: 'JaaS Job', onClick: () => setSelectedDLQ(null) },
          { label: 'Dead Letter Queue', onClick: () => setSelectedDLQ(null) },
          { label: selectedDLQ?.jobCode.split(':')[0] || 'Erreur' }
        ]}
        actions={[
          {
            id: 'retry_job',
            label: 'Ré-injecter dans la Queue',
            icon: RotateCcw,
            variant: 'primary',
            onClick: () => selectedDLQ && handleRetryDLQ(selectedDLQ.id)
          },
          {
            id: 'purge_job',
            label: 'Purger Définitivement',
            icon: Trash2,
            variant: 'danger',
            onClick: () => selectedDLQ && handlePurgeDLQ(selectedDLQ.id)
          }
        ]}
        kpis={[
          { label: 'Code Erreur', value: selectedDLQ?.errorCode.split(' ')[1] || '500', sub: selectedDLQ?.errorCode.split(' ')[0] },
          { label: 'Tentatives', value: selectedDLQ?.retriesFailed.split(' ')[0] || '5/5', sub: 'Plafond atteint' },
          { label: 'File d\'Origine', value: selectedDLQ?.originQueue.split('-')[1] || 'queue', sub: selectedDLQ?.originQueue.split('-').slice(2).join(' ') },
          { label: 'Horodatage', value: selectedDLQ?.failedAt || 'Récent', sub: 'Incident archivé' }
        ]}
        aiInsight={{
          title: 'Diagnostic de Panne & Root Cause AI',
          content: selectedDLQ?.aiInsight || '',
          actionLabel: 'Tester la connectivité de l\'endpoint distant',
          onAction: () => {
            haptics.trigger('light');
            showToast('Endpoint distant testé : Sonde HTTP 200 (Service rétabli)');
          }
        }}
        tabs={[
          {
            id: 'payload_view',
            label: 'Inspection du Payload',
            content: (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Payload JSON d'injection :</span>
                  <button 
                    onClick={() => {
                      haptics.trigger('light');
                      showToast('Payload JSON copié dans le presse-papier');
                    }}
                    className="text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1"
                  >
                    <Copy size={12} /> Copier
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[10.5px] text-emerald-300/90 overflow-x-auto leading-relaxed max-h-64 scrollbar-hide">
                  {selectedDLQ?.payload}
                </pre>
              </div>
            )
          },
          {
            id: 'stack_trace',
            label: 'Stack Trace Complète',
            content: (
              <div className="space-y-2">
                <span className="text-xs text-slate-400">Trace d'exception levée :</span>
                <pre className="p-3.5 bg-slate-950 rounded-2xl border border-red-900/40 font-mono text-[10px] text-red-300 overflow-x-auto leading-relaxed max-h-64 scrollbar-hide">
                  {selectedDLQ?.rootCause}
                </pre>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 3: WORKER POOL DETAIL DRAWER                               */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        title={selectedPool?.name || ''}
        subtitle={`${selectedPool?.category} • Cluster Distribué`}
        badge={`${selectedPool?.activeThreads}/${selectedPool?.maxThreads} Threads`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText="CPU"
        breadcrumbs={[
          { label: 'JaaS Job', onClick: () => setSelectedPool(null) },
          { label: 'Worker Pools', onClick: () => setSelectedPool(null) },
          { label: selectedPool?.name.split(' ')[0] || 'Pool' }
        ]}
        actions={[
          {
            id: 'scale_up',
            label: 'Scaler +4 Threads',
            icon: Zap,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Capacité augmentée de 4 threads sur ${selectedPool?.name}`);
            }
          },
          {
            id: 'drain_pool',
            label: 'Drainer Travaux',
            icon: RotateCcw,
            onClick: () => {
              haptics.trigger('medium');
              showToast(`Drain progressif des travaux initié sur ${selectedPool?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Charge CPU', value: selectedPool?.cpuUsage || '0%', sub: 'vCPU Cible < 75%', trend: 'up' },
          { label: 'Mémoire RAM', value: selectedPool?.memoryUsage || '0 MB', sub: 'Allocation nominale' },
          { label: 'Débit / Minute', value: selectedPool?.throughputJobsMin.split('/')[0] || '0', sub: 'Trafic traité' },
          { label: 'Autoscaling', value: `${selectedPool?.minInstances} → ${selectedPool?.maxInstances}`, sub: 'Instances pods' }
        ]}
        aiInsight={{
          title: 'Supervision des Ressources AI',
          content: selectedPool?.aiInsight || '',
          actionLabel: 'Ajuster les seuils d\'auto-scaling',
          onAction: () => {
            haptics.trigger('light');
            showToast('Seuils HPA d\'auto-scaling mis à jour');
          }
        }}
        tabs={[
          {
            id: 'pool_telemetry',
            label: 'Télémétrie Nœud',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Spécifications du Nœud d'Exécution</div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Type de Machine :</span>
                    <span className="font-mono text-slate-200">c6i.2xlarge (Compute Optimized)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Driver d'Exécution :</span>
                    <span className="font-mono text-emerald-400">Rust Worker Async Runtime</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temps Moyen de Boucle :</span>
                    <span className="font-mono text-slate-200">14.2ms par tâche</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DETAIL DRAWER 4: CANDIDATE DETAIL DRAWER                                 */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.name || ''}
        subtitle={`${selectedCandidate?.role} • Expérience ${selectedCandidate?.exp}`}
        badge={`Match ${selectedCandidate?.score}`}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
        avatarText={selectedCandidate?.name.charAt(0) || 'C'}
        breadcrumbs={[
          { label: 'JaaS Job', onClick: () => setSelectedCandidate(null) },
          { label: 'Talents & Funnel', onClick: () => setSelectedCandidate(null) },
          { label: selectedCandidate?.name.split(' ')[0] || 'Candidat' }
        ]}
        actions={[
          {
            id: 'send_offer',
            label: 'Envoyer Proposition Contrat',
            icon: Send,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Proposition formelle de contrat transmise à ${selectedCandidate?.name}`);
            }
          },
          {
            id: 'schedule_call',
            label: 'Programmer Entretien',
            icon: Calendar,
            onClick: () => {
              haptics.trigger('light');
              showToast(`Invitation entretien d'architecture envoyée à ${selectedCandidate?.name}`);
            }
          }
        ]}
        kpis={[
          { label: 'Score Matching IA', value: selectedCandidate?.score || '90%', sub: 'Affinité forte', trend: 'up' },
          { label: 'Expérience', value: selectedCandidate?.exp || '5 ans', sub: 'Senior Staff Tier' },
          { label: 'Statut Pipeline', value: selectedCandidate?.status || 'Final', sub: 'Étape courante' },
          { label: 'Contact', value: selectedCandidate?.email.split('@')[0] || '', sub: selectedCandidate?.email.split('@')[1] || '' }
        ]}
        aiInsight={{
          title: 'Évaluation & Profiling AI',
          content: selectedCandidate?.aiNotes || '',
          actionLabel: 'Générer la grille salariale prévisionnelle',
          onAction: () => {
            haptics.trigger('light');
            showToast('Grille salariale alignée avec le benchmark marché');
          }
        }}
        tabs={[
          {
            id: 'skills_tab',
            label: 'Compétences Validées',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Stack Technique Maîtrisée</div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-emerald-300">
                    {selectedCandidate?.match}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Coordonnées Professionnelles</div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail size={14} className="text-slate-400" />
                    <span>{selectedCandidate?.email}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* MODAL: PLANIFIER UNE TÂCHE CRON                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateCronOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsCreateCronOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 text-slate-100 scrollbar-hide"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Planifier une Tâche Cron</h3>
                    <p className="text-[11px] text-slate-400">Orchestration temporelle distribuée, timeout et politique de concurrence</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateCronOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCronSubmit} className="space-y-3.5 text-xs">
                {/* Task Name */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                    Nom de la Tâche Cron <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cronName}
                    onChange={e => setCronName(e.target.value)}
                    placeholder="ex: Nightly Cache Invalidation & CDN Purge"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                {/* Cron Expression & Human Schedule */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Expression Cron (5 Champs) <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cronSchedule}
                      onChange={e => setCronSchedule(e.target.value)}
                      placeholder="0 3 * * *"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Description Temporelle</label>
                    <input
                      type="text"
                      value={cronScheduleHuman}
                      onChange={e => setCronScheduleHuman(e.target.value)}
                      placeholder="ex: Quotidien 03:00 UTC"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Presets for Cron */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Raccourcis Fréquence Courante :</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { expr: '*/5 * * * *', label: 'Toutes les 5m' },
                      { expr: '*/15 * * * *', label: 'Toutes les 15m' },
                      { expr: '0 * * * *', label: 'Toutes les heures' },
                      { expr: '0 3 * * *', label: 'Quotidien 03:00' },
                      { expr: '0 0 * * 1', label: 'Hebdo (Lundi)' }
                    ].map(preset => (
                      <button
                        key={preset.expr}
                        type="button"
                        onClick={() => {
                          haptics.trigger('light');
                          setCronSchedule(preset.expr);
                          setCronScheduleHuman(preset.label);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                          cronSchedule === preset.expr 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Service & Timeout */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Service Cible / Pool</label>
                    <select
                      value={cronTargetService}
                      onChange={e => setCronTargetService(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Realtime Worker Pool">Realtime Worker Pool (Prioritaire)</option>
                      <option value="Batch Compute Cluster">Batch Compute Cluster (Calcul Lourd)</option>
                      <option value="AI Inference & Vector Pool">AI Inference & Vector Pool</option>
                      <option value="PostgreSQL Backup Daemon">PostgreSQL Backup Daemon</option>
                      <option value="Stripe Reconciliation Service">Stripe Reconciliation Service</option>
                      <option value="eBPF Stream Rollup Worker">eBPF Stream Rollup Worker</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Timeout d'Exécution</label>
                    <select
                      value={cronTimeout}
                      onChange={e => setCronTimeout(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="15s">15 secondes</option>
                      <option value="30s">30 secondes (Standard)</option>
                      <option value="60s">60 secondes</option>
                      <option value="5m">5 minutes (Calcul Batch)</option>
                      <option value="15m">15 minutes (Sauvegarde Complète)</option>
                    </select>
                  </div>
                </div>

                {/* Concurrency & Timezone */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Politique de Concurrence</label>
                    <select
                      value={cronConcurrency}
                      onChange={e => setCronConcurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Forbid Concurrent (Instance Unique)">Forbid Concurrent (Unique)</option>
                      <option value="Queue Next (File Sécurisée)">Queue Next (Enfilement)</option>
                      <option value="Allow Concurrent (Parallèle)">Allow Concurrent (Parallèle)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Fuseau Horaire</label>
                    <input
                      type="text"
                      value={cronTimezone}
                      onChange={e => setCronTimezone(e.target.value)}
                      placeholder="UTC / Europe-Paris"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateCronOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!cronName.trim() || !cronSchedule.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Enregistrer la Tâche Cron</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

