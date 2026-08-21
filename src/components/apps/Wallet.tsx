import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ChevronRight, 
  X, 
  Bot, 
  Lock, 
  RefreshCcw, 
  ShieldCheck, 
  Landmark, 
  History, 
  KeyRound,
  FileText,
  DollarSign
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';

const TRANSACTIONS = [
  { id: 1, name: 'Virement Client OMK Tech', amount: '+$12,500.00', type: 'in', date: 'Aujourd\'hui, 14:20', category: 'Prestation Enterprise', ref: 'TRX-9901-OMK' },
  { id: 2, name: 'Google Cloud EMEA', amount: '-$840.50', type: 'out', date: 'Hier, 09:12', category: 'Infrastructure Cloud', ref: 'TRX-9882-GCP' },
  { id: 3, name: 'Stripe Payout Automatique', amount: '+$8,400.00', type: 'in', date: '14 Août', category: 'Encaissement SaaS', ref: 'TRX-9821-STR' },
  { id: 4, name: 'OpenAI API Token Usage', amount: '-$320.00', type: 'out', date: '12 Août', category: 'Intelligence Artificielle', ref: 'TRX-9800-OAI' },
];

const CONNECTORS = [
  { id: 'c1', name: 'Mercury Bank USA (USD)', status: 'synced', lastSync: 'Il y a 5 min', balance: '$124,500.00' },
  { id: 'c2', name: 'Stripe Payments Live', status: 'synced', lastSync: 'Temps réel', balance: '$18,400.00' },
  { id: 'c3', name: 'Qonto Corporate (EUR)', status: 'synced', lastSync: 'Il y a 12 min', balance: '€24,800.00' },
];

const WALLET_TABS = [
  { id: 'cards', label: 'Comptes', icon: CreditCard },
  { id: 'history', label: 'Historique', icon: History, badge: 4 },
  { id: 'reconciliation', label: 'Banques', icon: Landmark, badge: 3 },
  { id: 'security', label: 'Sécurité', icon: ShieldCheck, badge: '2FA' }
];

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('cards');
  const [selectedTx, setSelectedTx] = useState<typeof TRANSACTIONS[0] | null>(null);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={WALLET_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: CARDS */}
          {activeTab === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Comptes & Cartes Virtuelles"
                subtitle="Gestion de trésorerie multi-devises (USD / EUR)"
                badge="Mastercard Black"
                icon={CreditCard}
                kpis={[
                  { label: 'Solde Total', value: '$167,700', sub: 'Tous comptes liés', trend: 'up' },
                  { label: 'Plafond Restant', value: '$42,500', sub: 'Mois d\'Août' },
                  { label: 'Dépenses 30j', value: '$9,840', sub: '-8% vs M-1', trend: 'up' }
                ]}
              >
                {/* Virtual Card Graphic */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CreditCard size={120} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">OMK Corporate Obsidian</span>
                      <span className="font-mono text-xs text-slate-400">USD Account</span>
                    </div>
                    <div className="font-mono text-lg tracking-widest text-slate-100">
                      •••• •••• •••• 8842
                    </div>
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <div className="text-[9px] uppercase text-slate-500">Titulaire</div>
                        <div className="font-medium text-slate-200">BaaS LLC Operations</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-slate-500">Exp</div>
                        <div className="font-mono text-slate-200">08/29</div>
                      </div>
                    </div>
                  </div>
                </div>

                <AIInsightCard
                  title="Sécurité & Limites de Dépenses"
                  content="Vos cartes virtuelles éphémères sont automatiquement générées pour chaque nouveau fournisseur SaaS afin de prévenir les prélèvements inattendus."
                  actionLabel="Créer une carte virtuelle éphémère"
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Historique des Flux Financiers"
                subtitle="Entrées et sorties consolidées en direct"
                icon={History}
                badge="4 Transactions"
              >
                <div className="space-y-3">
                  {TRANSACTIONS.map(tx => (
                    <DetailCard
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      isInteractive
                      title={tx.name}
                      badge={tx.amount}
                      badgeColor={tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold' : 'bg-slate-950 text-slate-300 border-slate-800 font-mono font-semibold'}
                      icon={tx.type === 'in' ? ArrowDownLeft : ArrowUpRight}
                      subtitle={tx.date}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Catégorie : {tx.category}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{tx.ref}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: RECONCILIATION */}
          {activeTab === 'reconciliation' && (
            <motion.div
              key="reconciliation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Passerelles Bancaires & Connecteurs"
                subtitle="Synchronisation automatique des relevés bancaires"
                icon={Landmark}
                badge="3 Banques"
              >
                <div className="space-y-3">
                  {CONNECTORS.map(c => (
                    <DetailCard
                      key={c.id}
                      title={c.name}
                      badge={c.balance}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Landmark}
                      subtitle={`Dernière synchronisation : ${c.lastSync}`}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Statut de connexion :</span>
                        <span className="text-emerald-400 font-semibold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {c.status}
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Sécurité & Clés Cryptographiques"
                subtitle="Chiffrement des transactions et signature matérielle"
                icon={ShieldCheck}
                badge="HSM Protégé"
              >
                <DetailCard title="Coffre-Fort Cryptographique" icon={ShieldCheck}>
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Lock size={16} /> Clés privées stockées sous enclave matérielle HSM FIPS 140-2 Level 3.
                    </p>
                    <p>Authentification à 2 facteurs matérielle requise pour tout virement &gt; $5,000.</p>
                  </div>
                </DetailCard>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Transaction Detail */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col theme-transition"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
              <span className="font-medium text-xs text-slate-200">Détail du Mouvement</span>
              <button onClick={() => setSelectedTx(null)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{selectedTx.name}</h3>
                <div className="text-xs text-slate-400">{selectedTx.date}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Montant</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedTx.amount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Catégorie</span>
                  <span className="text-slate-200">{selectedTx.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Référence Unique</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedTx.ref}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
