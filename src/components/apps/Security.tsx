import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Eye, 
  AlertOctagon, 
  CheckCircle2, 
  Bot, 
  Terminal, 
  RefreshCw, 
  Fingerprint, 
  Layers, 
  Shield,
  Copy,
  Trash2,
  LockKeyhole,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface SecretKey {
  id: string;
  name: string;
  service: string;
  lastUsed: string;
  status: 'Actif' | 'En rotation' | 'Révoqué';
  rotDays: string;
  fingerprint: string;
  scopes: string[];
  created: string;
}

const INITIAL_KEYS: SecretKey[] = [
  { 
    id: 'k1', 
    name: 'Gemini API Key (Production)', 
    service: 'AI Studio Core & LLM Models', 
    lastUsed: 'Il y a 2m', 
    status: 'Actif', 
    rotDays: '48j restants',
    fingerprint: 'SHA256:7f9a8b1c...4d2e',
    scopes: ['models.gemini-2.5-flash', 'models.gemini-2.5-pro', 'interactions.readwrite'],
    created: '15 Mai 2026'
  },
  { 
    id: 'k2', 
    name: 'Stripe Secret Key (Live)', 
    service: 'Payment Processing & Invoicing', 
    lastUsed: 'Il y a 14m', 
    status: 'Actif', 
    rotDays: '12j restants',
    fingerprint: 'SHA256:1a2b3c4d...9e8f',
    scopes: ['charges.write', 'customers.read', 'subscriptions.manage'],
    created: '01 Juin 2026'
  },
  { 
    id: 'k3', 
    name: 'PostgreSQL Master Secret', 
    service: 'Cloud SQL / Supabase Cluster', 
    lastUsed: 'Il y a 1h', 
    status: 'Actif', 
    rotDays: '76j restants',
    fingerprint: 'SHA256:99887766...5544',
    scopes: ['db.readwrite', 'db.replication', 'db.pool_connect'],
    created: '20 Avril 2026'
  },
];

const AUDIT_LOGS = [
  { id: 'al1', user: 'admin@omk.corp', action: 'Auth Token Refresh (OAuth 2.0)', ip: '82.127.18.4', status: 'Succès', time: '14:20' },
  { id: 'al2', user: 'system_daemon', action: 'Automated Snapshot Encryption', ip: '10.0.0.4', status: 'Succès', time: '14:00' },
  { id: 'al3', user: '194.26.29.112', action: 'Blocked Malicious Ingress Scan', ip: '194.26.29.112', status: 'Bloqué', time: '13:42' },
];

const POLICIES = [
  { id: 'p1', name: 'MFA Matériel Obligatoire (FIDO2 / Passkey)', status: 'Appliqué à 100%', compliance: 'SOC-2 Type II' },
  { id: 'p2', name: 'Chiffrement au Repos AES-256-GCM', status: 'Appliqué', compliance: 'ISO 27001' },
  { id: 'p3', name: 'Rotation Automatique des Secrets (90j)', status: 'Planifié', compliance: 'PCI-DSS v4' },
];

const THREATS = [
  { id: 't1', title: 'Brute force SSH bloqué (IP 194.26.29.112)', time: '13:42', severity: 'Moyenne', action: 'IP bannie 24h' },
  { id: 't2', title: 'Tentative injection SQL filtrée par le WAF', time: 'Hier 22:15', severity: 'Faible', action: 'Requête rejetée (HTTP 403)' }
];

const SECURITY_TABS = [
  { id: 'secrets', label: 'Secrets', icon: Key, badge: 3 },
  { id: 'audit', label: 'Audit', icon: Eye },
  { id: 'policies', label: 'Politiques', icon: ShieldCheck, badge: '100%' },
  { id: 'threats', label: 'Menaces', icon: AlertOctagon, badge: 0 }
];

export default function Security() {
  const [activeTab, setActiveTab] = useState('secrets');
  const [keys, setKeys] = useState<SecretKey[]>(INITIAL_KEYS);
  const [selectedKey, setSelectedKey] = useState<SecretKey | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRotateKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, rotDays: '90j restants', lastUsed: 'À l\'instant' } : k));
    if (selectedKey && selectedKey.id === id) {
      setSelectedKey(prev => prev ? { ...prev, rotDays: '90j restants', lastUsed: 'À l\'instant' } : null);
    }
    showToast('Rotation de clé effectuée sans coupure de service');
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={SECURITY_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SECRETS */}
          {activeTab === 'secrets' && (
            <motion.div
              key="secrets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Coffre-fort des Clés & Secrets"
                subtitle="Gestion chiffrée des identifiants et tokens de production"
                badge={`${keys.length} Secrets Actifs`}
                icon={Key}
                kpis={[
                  { label: 'Score Sécurité', value: '98/100', sub: 'Norme SOC-2', trend: 'up' },
                  { label: 'Chiffrement', value: 'AES-256', sub: 'Clés HSM isolées' },
                  { label: 'Tentatives Bloquées', value: '142', sub: 'Ce mois' }
                ]}
              >
                <div className="space-y-3">
                  {keys.map(k => (
                    <DetailCard
                      key={k.id}
                      onClick={() => setSelectedKey(k)}
                      isInteractive
                      title={k.name}
                      badge={k.rotDays}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-mono"
                      icon={Key}
                      subtitle={`Service : ${k.service} • Dernier usage : ${k.lastUsed}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-mono tracking-wider">••••••••••••••••</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{k.status}</span>
                          <Lock size={13} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Audit Automatisé des Secrets"
                  content="La clé Stripe Secret Key arrive à échéance de rotation dans 12 jours. La rotation automatique sans interruption est recommandée dès maintenant."
                  actionLabel="Lancer la rotation Stripe sans coupure"
                  onAction={() => handleRotateKey('k2')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: AUDIT */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Journal d'Audit & Traçabilité"
                subtitle="Événements de connexion, autorisations et appels API sécurisés"
                icon={Eye}
                badge="Immuable"
                kpis={[
                  { label: 'Événements 24h', value: '1,420', sub: '100% audités' },
                  { label: 'IPs Suspectes', value: '1', sub: 'Bloquée automatiquement', trend: 'up' },
                  { label: 'Rétention Audit', value: '365 jours', sub: 'Certifié WORM' }
                ]}
              >
                <div className="space-y-3">
                  {AUDIT_LOGS.map(al => (
                    <DetailCard
                      key={al.id}
                      title={al.action}
                      badge={al.status}
                      badgeColor={al.status === 'Succès' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}
                      icon={Eye}
                      subtitle={`Utilisateur : ${al.user} • IP : ${al.ip} • Heure : ${al.time}`}
                    />
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: POLICIES */}
          {activeTab === 'policies' && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Politiques de Sécurité & Conformité"
                subtitle="Règles d'accès et standards de chiffrement appliqués"
                icon={ShieldCheck}
                badge="3 Politiques Actives"
                kpis={[
                  { label: 'Conformité SOC-2', value: '100%', sub: 'Audité par Mazars', trend: 'up' },
                  { label: 'Conformité RGPD', value: '100%', sub: 'DPO Certifié' },
                  { label: 'ISO 27001', value: 'En cours', sub: 'Audit Q4 2026' }
                ]}
              >
                <div className="space-y-3">
                  {POLICIES.map(p => (
                    <DetailCard
                      key={p.id}
                      title={p.name}
                      badge={p.compliance}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={ShieldCheck}
                      subtitle={`Statut d'application : ${p.status}`}
                    />
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: THREATS */}
          {activeTab === 'threats' && (
            <motion.div
              key="threats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Détection des Menaces & WAF"
                subtitle="Analyse comportementale et protection périmétrique"
                icon={AlertOctagon}
                badge="Niveau de Risque : Nul"
                kpis={[
                  { label: 'Attaques Déjouées', value: '38', sub: 'Ce mois' },
                  { label: 'IPs en Blacklist', value: '14', sub: 'Automatique' },
                  { label: 'Statut Pare-feu', value: 'Actif', sub: 'Règles OWASP Top 10' }
                ]}
              >
                <div className="space-y-3">
                  {THREATS.map(t => (
                    <DetailCard
                      key={t.id}
                      title={t.title}
                      badge={t.time}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800 font-mono"
                      icon={ShieldAlert}
                      subtitle={`Sévérité : ${t.severity} • Action : ${t.action}`}
                    />
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER SECRET KEY INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedKey}
        onClose={() => setSelectedKey(null)}
        title={selectedKey?.name || ''}
        subtitle={`Service : ${selectedKey?.service} • Créé le : ${selectedKey?.created}`}
        badge={selectedKey?.status}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={Key}
        breadcrumbs={[
          { label: 'Security OS', onClick: () => setSelectedKey(null) },
          { label: 'Gestion Clés', onClick: () => setSelectedKey(null) },
          { label: selectedKey?.name || 'Secret' }
        ]}
        actions={[
          {
            id: 'rotate',
            label: 'Effectuer Rotation',
            icon: RefreshCw,
            variant: 'primary',
            onClick: () => selectedKey && handleRotateKey(selectedKey.id)
          },
          {
            id: 'copy',
            label: 'Copier Fingerprint',
            icon: Copy,
            onClick: () => showToast(`Fingerprint ${selectedKey?.fingerprint} copié dans le presse-papier`)
          }
        ]}
        kpis={[
          { label: 'Dernier Usage', value: selectedKey?.lastUsed || '', sub: 'Appel API authentifié' },
          { label: 'Rotation Requise', value: selectedKey?.rotDays || '', sub: 'Politique 90 jours' },
          { label: 'Chiffrement', value: 'AES-256 GCM', sub: 'Hardware Security Module' },
          { label: 'Statut', value: selectedKey?.status || '', sub: 'Valide' }
        ]}
        aiInsight={{
          title: 'Contrôle des Permissions Sécurité',
          content: `Cette clé dispose de scopes restreints aux seules opérations indispensables (${selectedKey?.scopes.length} scopes configurés). Aucun privilège super-admin n'est accordé.`,
          actionLabel: 'Restreindre aux seules IPs du cluster',
          onAction: () => showToast('Restriction IP appliquée au secret')
        }}
        tabs={[
          {
            id: 'scopes',
            label: `Scopes & Permissions (${selectedKey?.scopes.length || 0})`,
            content: (
              <div className="space-y-2">
                {selectedKey?.scopes.map((scope, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400">{scope}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Autorisé</span>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'fingerprint',
            label: 'Empreinte Cryptographique',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200">Empreinte SHA-256 Publique</span>
                <p className="font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-850 break-all text-[11px]">
                  {selectedKey?.fingerprint}
                </p>
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
