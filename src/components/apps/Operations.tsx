import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HardHat, 
  Activity, 
  ServerCrash, 
  Cpu, 
  Network, 
  CheckCircle2, 
  Bot, 
  Terminal, 
  ChevronRight, 
  ShieldAlert, 
  Wrench, 
  Play,
  Layers,
  Zap,
  RefreshCw,
  Server,
  AlertOctagon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface Incident {
  id: string;
  title: string;
  desc: string;
  status: 'active' | 'resolved';
  severity: 'high' | 'medium' | 'low';
  service: string;
  fix: string;
  impact: string;
  startedAt: string;
  logs: string[];
}

const INITIAL_INCIDENTS: Incident[] = [
  { 
    id: '1', 
    title: 'Latence API Stripe Webhooks', 
    desc: 'Pics de 800ms observés sur l\'endpoint de checkout.', 
    status: 'active', 
    severity: 'high', 
    service: 'Payment Gateway', 
    fix: 'Basculer le trafic sur le fallback CDN et redémarrer le pool Redis.',
    impact: '3% des paiements avec délai de confirmation +2s',
    startedAt: 'Il y a 22m',
    logs: [
      '[15:30:12] WARN: Redis pool exhaustion on cluster-eu-central-1',
      '[15:30:45] ERROR: Webhook retry threshold reached (attempt 3/5)',
      '[15:32:00] INFO: Auto-scaler spawned 2 fallback pods'
    ]
  },
  { 
    id: '2', 
    title: 'Mise à jour Base PostgreSQL', 
    desc: 'Terminé avec succès à 04:00 AM. 0 downtime.', 
    status: 'resolved', 
    severity: 'low', 
    service: 'PostgreSQL Main', 
    fix: 'Migration de schéma appliquée sans interruption.',
    impact: 'Aucun impact utilisateur',
    startedAt: 'Aujourd\'hui 04:00',
    logs: [
      '[04:00:01] INFO: Starting zero-downtime schema migration v4.2',
      '[04:01:15] SUCCESS: Indexes re-built successfully'
    ]
  },
  { 
    id: '3', 
    title: 'Saturation Cache Redis', 
    desc: 'Nettoyage des clés expirées exécuté automatiquement.', 
    status: 'resolved', 
    severity: 'medium', 
    service: 'Redis Cache', 
    fix: 'Auto-eviction appliquée avec libération de 4.2GB.',
    impact: 'Latence temporaire +12ms pendant 45s',
    startedAt: 'Hier 18:40',
    logs: [
      '[18:40:00] WARN: Memory watermark 85% reached',
      '[18:40:45] SUCCESS: LRU eviction freed 4.2GB RAM'
    ]
  },
];

const SERVICES = [
  { id: 's1', name: 'API Gateway Ingress', uptime: '99.99%', latency: '12ms', status: 'optimal', desc: 'Point d\'entrée TLS & équilibrage de charge' },
  { id: 's2', name: 'Database Cluster (Postgres)', uptime: '99.95%', latency: '8ms', status: 'optimal', desc: 'Instance répliquée multi-région Paris/Francfort' },
  { id: 's3', name: 'MCP Microservices Harness', uptime: '99.90%', latency: '24ms', status: 'optimal', desc: 'Orchestrateur de protocoles d\'outils et agents' },
  { id: 's4', name: 'Payment Stripe Connector', uptime: '98.50%', latency: '840ms', status: 'degraded', desc: 'Tunnel de synchronisation et webhooks bancaires' },
];

const RUNBOOKS = [
  { id: 'rb1', name: 'Purge Totale Cache Redis', time: '~5s', trigger: 'Manuel', status: 'ready', desc: 'Vide les buffers et force le rafraîchissement des tokens' },
  { id: 'rb2', name: 'Failover Base de Données Dev -> Prod', time: '~30s', trigger: 'Sécurisé', status: 'ready', desc: 'Bascule automatique du maître vers le réplica synchrone' },
  { id: 'rb3', name: 'Rotation Clés API & Tokens', time: '~10s', trigger: 'Automatique', status: 'ready', desc: 'Régénération sans coupure des secrets d\'infrastructure' },
];

const OPS_TABS = [
  { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: 1, badgeColor: 'bg-amber-500 text-slate-950' },
  { id: 'services', label: 'Services', icon: Activity },
  { id: 'runbooks', label: 'Runbooks', icon: Play },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench }
];

export default function Operations() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
    showToast('Incident marqué comme résolu avec succès');
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={OPS_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: INCIDENTS */}
          {activeTab === 'incidents' && (
            <motion.div
              key="incidents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Supervision des Incidents"
                subtitle="Alertes télémétriques et résolution assistée par IA"
                badge={`${incidents.filter(i => i.status === 'active').length} Actif`}
                badgeColor={incidents.some(i => i.status === 'active') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                icon={ShieldAlert}
                kpis={[
                  { label: 'MTTR Moyen', value: '4m 12s', sub: '-35% vs Q2', trend: 'up' },
                  { label: 'Disponibilité', value: '99.96%', sub: 'SLA Atteint' },
                  { label: 'Incidents Résolus', value: '24', sub: 'Ce mois' }
                ]}
              >
                <div className="space-y-3">
                  {incidents.map(inc => (
                    <DetailCard
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      isInteractive
                      title={inc.title}
                      badge={inc.status === 'active' ? 'En cours (P1)' : 'Résolu'}
                      badgeColor={inc.status === 'active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                      icon={inc.status === 'active' ? ShieldAlert : CheckCircle2}
                      subtitle={`Service : ${inc.service} • ${inc.startedAt}`}
                    >
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{inc.desc}</p>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Diagnostic Télémétrique Coach AI"
                  content="L'incident Payment Gateway provient d'une contention temporaire de sockets TCP sur Redis. Le runbook Purge Totale Cache Redis résoudra la latence en 5 secondes."
                  actionLabel="Exécuter la purge automatique du cache"
                  onAction={() => {
                    handleResolveIncident('1');
                    showToast('Purge du cache Redis exécutée. Latence revenue à 14ms.');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="État de Santé des Microservices"
                subtitle="Surveillance en temps réel des sondes d'infrastructure"
                icon={Activity}
                badge="4 Noeuds Actifs"
                kpis={[
                  { label: 'Disponibilité Globale', value: '99.98%', sub: 'SLA Entreprise', trend: 'up' },
                  { label: 'Latence Moyenne', value: '14ms', sub: 'P95 Response' },
                  { label: 'Débit Global', value: '4,280 req/s', sub: '+18% ce jour', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {SERVICES.map(srv => (
                    <DetailCard
                      key={srv.id}
                      title={srv.name}
                      badge={srv.uptime}
                      badgeColor={srv.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={Server}
                      subtitle={srv.desc}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Latence P95 : <strong className={srv.status === 'optimal' ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>{srv.latency}</strong></span>
                        <button 
                          onClick={() => showToast(`Sonde de santé pingée sur ${srv.name} (Code HTTP 200)`)}
                          className="text-emerald-400 hover:underline text-[11px] font-medium"
                        >
                          Ping Sonde →
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: RUNBOOKS */}
          {activeTab === 'runbooks' && (
            <motion.div
              key="runbooks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Procédures d'Intervention & Runbooks"
                subtitle="Scripts d'automatisation validés et idempotents"
                icon={Play}
                badge="3 Runbooks Prêts"
                kpis={[
                  { label: 'Exécutions 30j', value: '142', sub: '100% succès' },
                  { label: 'Temps Moyen Exec', value: '8.4s', sub: 'Hyper-rapide' },
                  { label: 'Automatisation', value: '94%', sub: 'Sans intervention manuelle' }
                ]}
              >
                <div className="space-y-3">
                  {RUNBOOKS.map(rb => (
                    <DetailCard
                      key={rb.id}
                      title={rb.name}
                      badge={rb.time}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-mono"
                      icon={Play}
                      subtitle={rb.desc}
                      isInteractive
                      onClick={() => showToast(`Exécution du runbook "${rb.name}" lancée`)}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Déclencheur : <strong className="text-slate-200">{rb.trigger}</strong></span>
                        <span className="text-emerald-400 font-semibold text-[11px]">Exécuter maintenant →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Fenêtres de Maintenance & Mises à Jour"
                subtitle="Calendrier des opérations planifiées hors pic de charge"
                icon={Wrench}
                badge="Prochaine: 28 Août"
                kpis={[
                  { label: 'Fenêtre Idéale', value: '03:00-04:00', sub: 'Creux d\'audience' },
                  { label: 'Dernier Patch', value: 'v4.2.1', sub: 'Appliqué avec succès' },
                  { label: 'Downtime Estimé', value: '0 sec', sub: 'Rolling deployment' }
                ]}
              >
                <DetailCard title="Prochaine Opération Planifiée" icon={Wrench}>
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <div className="font-semibold text-slate-100">Mise à niveau Kernel Linux & Docker Engine</div>
                    <p className="text-slate-400 leading-relaxed">
                      Application des patchs de sécurité CVE-2026 sur les noeuds du cluster européen. Le trafic sera redirigé de manière transparente via le proxy ingress sans interruption de service.
                    </p>
                    <button 
                      onClick={() => showToast('Rappel de maintenance configuré dans le calendrier')}
                      className="mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-200 text-xs font-semibold"
                    >
                      Planifier une notification équipe
                    </button>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER INCIDENT INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title || ''}
        subtitle={`Service : ${selectedIncident?.service} • ${selectedIncident?.startedAt}`}
        badge={selectedIncident?.status === 'active' ? 'Incident En Cours' : 'Résolu'}
        badgeColor={selectedIncident?.status === 'active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        icon={selectedIncident?.status === 'active' ? AlertOctagon : CheckCircle2}
        breadcrumbs={[
          { label: 'Operations', onClick: () => setSelectedIncident(null) },
          { label: 'Incidents', onClick: () => setSelectedIncident(null) },
          { label: selectedIncident?.title || 'Incident' }
        ]}
        actions={[
          {
            id: 'resolve',
            label: selectedIncident?.status === 'active' ? 'Résoudre l\'incident' : 'Ré-ouvrir',
            icon: CheckCircle2,
            variant: 'primary',
            onClick: () => selectedIncident && handleResolveIncident(selectedIncident.id)
          },
          {
            id: 'purge',
            label: 'Purge Cache',
            icon: RefreshCw,
            onClick: () => showToast('Purge manuelle envoyée aux noeuds')
          }
        ]}
        kpis={[
          { label: 'Sévérité', value: selectedIncident?.severity.toUpperCase() || 'P1', sub: 'Impact critique' },
          { label: 'Début Incident', value: selectedIncident?.startedAt || 'N/A', sub: 'Horodatage serveur' },
          { label: 'Statut', value: selectedIncident?.status === 'active' ? 'Actif' : 'Clôturé', sub: 'Supervisé 24/7' },
          { label: 'Service', value: selectedIncident?.service || '', sub: 'Composant impacté' }
        ]}
        aiInsight={{
          title: 'Procédure Corrective Recommandée',
          content: selectedIncident?.fix || '',
          actionLabel: 'Appliquer le correctif automatisé',
          onAction: () => {
            if (selectedIncident) handleResolveIncident(selectedIncident.id);
          }
        }}
        tabs={[
          {
            id: 'logs',
            label: `Logs Télémétriques (${selectedIncident?.logs.length || 0})`,
            content: (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                {selectedIncident?.logs.map((log, idx) => (
                  <div key={idx} className={log.includes('ERROR') ? 'text-red-400' : log.includes('WARN') ? 'text-amber-300' : 'text-slate-400'}>
                    {log}
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'impact',
            label: 'Impact Utilisateur',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200">Évaluation de l'Impact</span>
                <p className="text-slate-400 leading-relaxed">{selectedIncident?.impact}</p>
              </div>
            )
          }
        ]}
      />

      {/* Floating Toast */}
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
