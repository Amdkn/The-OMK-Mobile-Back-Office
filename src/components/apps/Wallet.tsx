import React, { useState } from 'react';
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
  Unlock,
  RefreshCcw, 
  ShieldCheck, 
  Landmark, 
  History, 
  KeyRound,
  FileText,
  DollarSign,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
  Layers,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { haptics } from '../../services/haptics';

// TYPES & INTERFACES
export interface VirtualCardItem {
  id: string;
  name: string;
  accountType: string;
  currency: 'USD' | 'EUR' | 'GBP';
  balance: number;
  monthlyLimit: number;
  spentThisMonth: number;
  cardNumberMasked: string;
  cardNumberFull: string;
  cvv: string;
  expDate: string;
  cardHolder: string;
  isFrozen: boolean;
  cardType: 'Obsidian Multi-usage' | 'Éphémère SaaS' | 'Fournisseur Dédié';
  dailyLimit: number;
  singleTxLimit: number;
  allowInternational: boolean;
  allowOnline: boolean;
  securityProtocol: string;
  recentTx: {
    id: string;
    merchant: string;
    amount: string;
    date: string;
    status: string;
  }[];
}

export interface FinancialTransfer {
  id: string;
  name: string;
  amount: string;
  rawAmount: number;
  type: 'in' | 'out';
  status: 'completed' | 'pending' | 'reversed';
  date: string;
  category: string;
  ref: string;
  blockchainHash: string;
  gasFee: string;
  network: string;
  blockNumber: number;
  confirmations: number;
  senderAddress: string;
  receiverAddress: string;
  complianceScore: string;
  settlementRail: string;
  receiptNumber: string;
  taxVatRate: string;
}

export interface BankConnector {
  id: string;
  name: string;
  currency: string;
  status: 'synced' | 'connecting' | 'warning';
  lastSync: string;
  balance: string;
  rawBalance: number;
  ibanMasked: string;
  bic: string;
  syncFrequency: string;
  authExpiry: string;
}

export interface SecurityEnclaveKey {
  id: string;
  name: string;
  hsmSlot: string;
  standard: string;
  status: 'optimal' | 'rotation_due';
  lastRotated: string;
  multiSigQuorum: string;
  signingAlgorithm: string;
  publicKeyFingerprint: string;
}

// SAMPLE DATA
const INITIAL_CARDS: VirtualCardItem[] = [
  {
    id: 'card-obsidian',
    name: 'OMK Corporate Obsidian',
    accountType: 'USD Corporate Master',
    currency: 'USD',
    balance: 124500.00,
    monthlyLimit: 50000.00,
    spentThisMonth: 9840.00,
    cardNumberMasked: '•••• •••• •••• 8842',
    cardNumberFull: '4532 8819 4021 8842',
    cvv: '739',
    expDate: '08/29',
    cardHolder: 'BaaS LLC Operations',
    isFrozen: false,
    cardType: 'Obsidian Multi-usage',
    dailyLimit: 10000.00,
    singleTxLimit: 5000.00,
    allowInternational: true,
    allowOnline: true,
    securityProtocol: '3D Secure v2.2 + HSM Enclave',
    recentTx: [
      { id: 'ctx-1', merchant: 'Google Cloud EMEA', amount: '-$840.50', date: 'Hier, 09:12', status: 'Approuvé 3DS' },
      { id: 'ctx-2', merchant: 'OpenAI API Tokens', amount: '-$320.00', date: '12 Août', status: 'Approuvé Auto' },
      { id: 'ctx-3', merchant: 'AWS Infrastructure', amount: '-$1,420.00', date: '10 Août', status: 'Approuvé 3DS' }
    ]
  },
  {
    id: 'card-saas',
    name: 'Cloud Infra Dedicated',
    accountType: 'USD Ephemeral Provider',
    currency: 'USD',
    balance: 18400.00,
    monthlyLimit: 15000.00,
    spentThisMonth: 3420.00,
    cardNumberMasked: '•••• •••• •••• 4192',
    cardNumberFull: '4921 7734 1092 4192',
    cvv: '284',
    expDate: '12/28',
    cardHolder: 'BaaS LLC Operations',
    isFrozen: false,
    cardType: 'Éphémère SaaS',
    dailyLimit: 3000.00,
    singleTxLimit: 2000.00,
    allowInternational: true,
    allowOnline: true,
    securityProtocol: '3D Secure v2.2 Dynamic CVV',
    recentTx: [
      { id: 'ctx-4', merchant: 'Cloudflare Enterprise', amount: '-$1,200.00', date: '08 Août', status: 'Approuvé' },
      { id: 'ctx-5', merchant: 'Datadog APM Monitoring', amount: '-$450.00', date: '05 Août', status: 'Approuvé' }
    ]
  },
  {
    id: 'card-ai',
    name: 'AI Model Inferences Vault',
    accountType: 'USD Vendor Capped',
    currency: 'USD',
    balance: 24800.00,
    monthlyLimit: 10000.00,
    spentThisMonth: 1280.00,
    cardNumberMasked: '•••• •••• •••• 9901',
    cardNumberFull: '4111 0029 4812 9901',
    cvv: '516',
    expDate: '04/27',
    cardHolder: 'BaaS LLC Operations',
    isFrozen: true,
    cardType: 'Fournisseur Dédié',
    dailyLimit: 2000.00,
    singleTxLimit: 1000.00,
    allowInternational: false,
    allowOnline: true,
    securityProtocol: 'Verrouillage Marchand Restreint',
    recentTx: [
      { id: 'ctx-6', merchant: 'Anthropic Bedrock Bill', amount: '-$680.00', date: '01 Août', status: 'Approuvé' }
    ]
  }
];

const INITIAL_TRANSFERS: FinancialTransfer[] = [
  { 
    id: 'tx-1', 
    name: 'Virement Client OMK Tech', 
    amount: '+$12,500.00', 
    rawAmount: 12500, 
    type: 'in', 
    status: 'completed', 
    date: 'Aujourd\'hui, 14:20', 
    category: 'Prestation Enterprise', 
    ref: 'SEPA-INST-20260822-0941',
    blockchainHash: '0x7a3f89b1c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    gasFee: '$0.42 (Polygon / USDC)',
    network: 'Polygon PoS / SEPA Instant Bridge',
    blockNumber: 61842091,
    confirmations: 128,
    senderAddress: '0x99201a88b14c3e7f9a12c8b0a9918234fedcba01',
    receiverAddress: '0x4532b881940218842c9d0e1f2a3b4c5d6e7f8a9b',
    complianceScore: '100/100 (AML Conforme)',
    settlementRail: 'Circle CCTP & SEPA Instant',
    receiptNumber: 'REC-2026-08-9901',
    taxVatRate: '0.00% (Autoliquidation B2B Intra)'
  },
  { 
    id: 'tx-2', 
    name: 'Google Cloud EMEA', 
    amount: '-$840.50', 
    rawAmount: 840.50, 
    type: 'out', 
    status: 'completed', 
    date: 'Hier, 09:12', 
    category: 'Infrastructure Cloud', 
    ref: 'WIRE-GCP-8842109',
    blockchainHash: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    gasFee: '$1.20 (Base L2)',
    network: 'Ethereum L2 Base Network',
    blockNumber: 18492011,
    confirmations: 256,
    senderAddress: '0x4532b881940218842c9d0e1f2a3b4c5d6e7f8a9b',
    receiverAddress: '0x8842019921aaabbccddeeff00112233445566778',
    complianceScore: '100/100 (Fournisseur Vérifié)',
    settlementRail: 'Direct Merchant ACH / Base L2',
    receiptNumber: 'REC-2026-08-9882',
    taxVatRate: '20.00% (TVA Récupérable)'
  },
  { 
    id: 'tx-3', 
    name: 'Stripe Payout Automatique', 
    amount: '+$8,400.00', 
    rawAmount: 8400, 
    type: 'in', 
    status: 'completed', 
    date: '14 Août, 18:00', 
    category: 'Encaissement SaaS', 
    ref: 'STRIPE-PO-448201',
    blockchainHash: '0x3b2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    gasFee: '$0.00 (SEPA Instant Direct)',
    network: 'SEPA Instant Clearing House',
    blockNumber: 0,
    confirmations: 64,
    senderAddress: 'STRIPE_PAYMENTS_EUROPE_SA',
    receiverAddress: 'FR76 3000 6000 0112 3456 7890 184',
    complianceScore: '100/100 (Stripe Verified)',
    settlementRail: 'Stripe Connect Payout',
    receiptNumber: 'REC-2026-08-9821',
    taxVatRate: '0.00% (Collecte SaaS)'
  },
  { 
    id: 'tx-4', 
    name: 'OpenAI API Token Usage', 
    amount: '-$320.00', 
    rawAmount: 320, 
    type: 'out', 
    status: 'completed', 
    date: '12 Août, 11:30', 
    category: 'Intelligence Artificielle', 
    ref: 'ACH-OAI-119283',
    blockchainHash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
    gasFee: '$0.15 (Arbitrum One)',
    network: 'Arbitrum One L2 Settlement',
    blockNumber: 14209182,
    confirmations: 512,
    senderAddress: '0x4532b881940218842c9d0e1f2a3b4c5d6e7f8a9b',
    receiverAddress: '0x0a10a10a10a10a10a10a10a10a10a10a10a10a10',
    complianceScore: '100/100 (Enterprise Merchant)',
    settlementRail: 'Arbitrum USDC + ACH Bridge',
    receiptNumber: 'REC-2026-08-9800',
    taxVatRate: '20.00% (TVA Déductible)'
  },
];

const BANK_CONNECTORS: BankConnector[] = [
  { 
    id: 'c1', 
    name: 'Mercury Bank USA (USD)', 
    currency: 'USD',
    status: 'synced', 
    lastSync: 'Il y a 5 min', 
    balance: '$124,500.00',
    rawBalance: 124500,
    ibanMasked: '•••• •••• •••• 9921',
    bic: 'MERCUS33XXX',
    syncFrequency: 'Temps réel via Webhook',
    authExpiry: 'Dans 84 jours (OAuth 2.0)'
  },
  { 
    id: 'c2', 
    name: 'Stripe Payments Live', 
    currency: 'USD',
    status: 'synced', 
    lastSync: 'Temps réel', 
    balance: '$18,400.00',
    rawBalance: 18400,
    ibanMasked: 'acct_1NZ8842OMK',
    bic: 'STRIPE_API_v1',
    syncFrequency: 'Streaming Webhooks mTLS',
    authExpiry: 'Clé API Restreinte Permanente'
  },
  { 
    id: 'c3', 
    name: 'Qonto Corporate (EUR)', 
    currency: 'EUR',
    status: 'synced', 
    lastSync: 'Il y a 12 min', 
    balance: '€24,800.00',
    rawBalance: 24800,
    ibanMasked: 'FR76 •••• •••• 0184',
    bic: 'QNTOFR22XXX',
    syncFrequency: 'Toutes les 15 minutes',
    authExpiry: 'Dans 62 jours (DSP2)'
  },
];

const SECURITY_KEYS: SecurityEnclaveKey[] = [
  {
    id: 'hsm-1',
    name: 'Master Settlement Vault Key',
    hsmSlot: 'Slot #01 (FIPS 140-2 Level 3)',
    standard: 'Enclave Matérielle AWS CloudHSM',
    status: 'optimal',
    lastRotated: 'Il y a 18 jours',
    multiSigQuorum: '2 sur 3 Signatures Requis',
    signingAlgorithm: 'Ed25519 + secp256k1',
    publicKeyFingerprint: 'SHA256:7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a'
  },
  {
    id: 'hsm-2',
    name: 'mTLS Webhook Mutual Auth Key',
    hsmSlot: 'Slot #04 (Hardware Security Module)',
    standard: 'Certificat X.509 Entreprise',
    status: 'optimal',
    lastRotated: 'Il y a 42 jours',
    multiSigQuorum: 'Signature Automatisée Daemon',
    signingAlgorithm: 'RSA 4096-bit SHA-384',
    publicKeyFingerprint: 'SHA256:9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d'
  }
];

const WALLET_TABS = [
  { id: 'cards', label: 'Cartes & Soldes', icon: CreditCard, badge: 3 },
  { id: 'history', label: 'Virements & Flux', icon: History, badge: 4 },
  { id: 'reconciliation', label: 'Banques', icon: Landmark, badge: 3 },
  { id: 'security', label: 'Sécurité & HSM', icon: ShieldCheck, badge: '2FA' }
];

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('cards');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for interactive items
  const [cards, setCards] = useState<VirtualCardItem[]>(INITIAL_CARDS);
  const [transfers, setTransfers] = useState<FinancialTransfer[]>(INITIAL_TRANSFERS);

  // Drawer States
  const [selectedCard, setSelectedCard] = useState<VirtualCardItem | null>(null);
  const [selectedTx, setSelectedTx] = useState<FinancialTransfer | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankConnector | null>(null);
  const [selectedKey, setSelectedKey] = useState<SecurityEnclaveKey | null>(null);

  // Card Secret Revelation state
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFreezeCard = (cardId: string) => {
    haptics.trigger('medium');
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const nextState = !c.isFrozen;
        const updated = { ...c, isFrozen: nextState };
        if (selectedCard?.id === cardId) {
          setSelectedCard(updated);
        }
        showToast(nextState ? `Carte ${c.name} gelée avec succès` : `Carte ${c.name} dégelée et opérationnelle`);
        return updated;
      }
      return c;
    }));
  };

  const handleRevealCvv = (cardId: string) => {
    haptics.trigger('selection');
    if (revealedCardId === cardId) {
      setRevealedCardId(null);
      showToast('Identifiants de carte masqués');
    } else {
      setRevealedCardId(cardId);
      showToast('CVV et numéro révélés (masquage automatique après 15s)');
      setTimeout(() => {
        setRevealedCardId(null);
      }, 15000);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    haptics.trigger('selection');
    navigator.clipboard?.writeText(text);
    showToast(`${label} copié dans le presse-papier`);
  };

  const handleReverseTransfer = (transferId: string) => {
    haptics.trigger('warning');
    if (confirm('Initier une demande de rétrogradation / contestation de virement ?')) {
      haptics.trigger('success');
      setTransfers(prev => prev.map(t => {
        if (t.id === transferId) {
          const updated = { ...t, status: 'reversed' as const };
          if (selectedTx?.id === transferId) setSelectedTx(updated);
          return updated;
        }
        return t;
      }));
      showToast('Demande de remboursement transmise au réseau');
    }
  };

  const totalBalance = cards.reduce((acc, c) => acc + c.balance, 0);
  const totalSpent = cards.reduce((acc, c) => acc + c.spentThisMonth, 0);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={WALLET_TABS} 
        activeTab={activeTab} 
        onChange={(tab) => {
          haptics.trigger('selection');
          setActiveTab(tab);
        }} 
      />

      {/* Sub-bar Breadcrumbs */}
      <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
        <nav aria-label="Fil d'Ariane Wallet" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('cards');
              setSelectedCard(null);
              setSelectedTx(null);
            }}
            className="hover:text-emerald-400 text-slate-400 transition-colors font-medium shrink-0 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Wallet OS</span>
          </button>
          <ChevronRight size={12} className="text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {WALLET_TABS.find(t => t.id === activeTab)?.label || 'Cartes'}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            Multi-Devises
          </span>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              haptics.trigger('selection');
              showToast('Rapprochement bancaire à jour (100% équilibré)');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <ShieldCheck size={12} />
            <span className="hidden xs:inline">HSM Actif</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: VIRTUAL CARDS & BALANCES */}
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
                subtitle="Gestion de trésorerie multi-devises (USD / EUR) avec plafonds temps réel"
                badge="3 Cartes Actives"
                icon={CreditCard}
                kpis={[
                  { label: 'Solde Consolidé', value: `$${totalBalance.toLocaleString()}`, sub: 'Comptes maîtres', trend: 'up' },
                  { label: 'Dépenses ce Mois', value: `$${totalSpent.toLocaleString()}`, sub: 'Plafonds respectés' },
                  { label: 'Cartes Éphémères', value: '3 / 10', sub: 'Génération instantanée' }
                ]}
              >
                {/* Visual Card Graphic of Primary Card */}
                <div 
                  onClick={() => {
                    haptics.trigger('selection');
                    setSelectedCard(cards[0]);
                  }}
                  className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-15 transition-opacity">
                    <CreditCard size={140} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">OMK Corporate Obsidian</span>
                      </div>
                      <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                        USD Account
                      </span>
                    </div>

                    <div className="font-mono text-xl tracking-widest text-slate-100 flex items-center justify-between">
                      <span>{revealedCardId === cards[0].id ? cards[0].cardNumberFull : cards[0].cardNumberMasked}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevealCvv(cards[0].id);
                        }}
                        className="p-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {revealedCardId === cards[0].id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <div className="text-[9px] uppercase text-slate-500">Titulaire</div>
                        <div className="font-semibold text-slate-200">{cards[0].cardHolder}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-slate-500">CVV</div>
                        <div className="font-mono font-bold text-emerald-400">
                          {revealedCardId === cards[0].id ? cards[0].cvv : '•••'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-slate-500">Exp</div>
                        <div className="font-mono text-slate-200">{cards[0].expDate}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 pt-2">
                  {cards.map((card) => (
                    <DetailCard
                      key={card.id}
                      title={card.name}
                      subtitle={`${card.accountType} • Exp: ${card.expDate}`}
                      icon={CreditCard}
                      badge={card.isFrozen ? 'Gelée' : 'Active'}
                      badgeColor={card.isFrozen ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedCard(card);
                      }}
                      actions={
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100 text-xs">
                            ${card.balance.toLocaleString()}
                          </span>
                          <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                            <ArrowUpRight size={13} />
                          </div>
                        </div>
                      }
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Dépenses ce mois : <strong className="text-slate-200 font-mono">${card.spentThisMonth.toLocaleString()}</strong></span>
                          <span>Plafond : <strong className="text-slate-200 font-mono">${card.monthlyLimit.toLocaleString()}</strong></span>
                        </div>
                        {/* Progress bar of spend */}
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${Math.min(100, (card.spentThisMonth / card.monthlyLimit) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-slate-500">{card.recentTx.length} débits récents</span>
                          <span className="text-emerald-400 font-medium">Gérer plafonds & sécurité →</span>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Supervision Trésorerie & Risques"
                  content="Vos cartes virtuelles éphémères sont automatiquement plafonnées par fournisseur. Aucune anomalie de facturation récurrente détectée ce mois-ci."
                  actionLabel="Générer une carte virtuelle à usage unique"
                  onAction={() => {
                    haptics.trigger('success');
                    showToast('Nouvelle carte virtuelle éphémère créée ($2,500)');
                  }}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: TRANSFERS & CRYPTO/FIAT */}
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
                subtitle="Virements SEPA instantanés, règlements USDC et traces blockchain"
                icon={History}
                badge={`${transfers.length} Mouvements`}
                kpis={[
                  { label: 'Flux Entrants', value: '+$20.9k', sub: 'Ce mois', trend: 'up' },
                  { label: 'Flux Sortants', value: '-$1.16k', sub: 'SaaS & Infra' },
                  { label: 'Délai Moyen', value: '1.2 sec', sub: 'Règlement instantané', trend: 'up' }
                ]}
              >
                <div className="space-y-3">
                  {transfers.map((tx) => {
                    const isIncoming = tx.type === 'in';
                    const isReversed = tx.status === 'reversed';

                    return (
                      <DetailCard
                        key={tx.id}
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedTx(tx);
                        }}
                        isInteractive
                        title={tx.name}
                        badge={isReversed ? 'Contesté' : tx.amount}
                        badgeColor={
                          isReversed
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 font-mono font-semibold'
                            : isIncoming 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold' 
                            : 'bg-slate-950 text-slate-300 border-slate-800 font-mono font-semibold'
                        }
                        icon={isIncoming ? ArrowDownLeft : ArrowUpRight}
                        subtitle={tx.date}
                        actions={
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <span>Reçu PDF</span>
                            <ArrowUpRight size={13} />
                          </div>
                        }
                      >
                        <div className="space-y-2 pt-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Catégorie : <strong className="text-slate-200">{tx.category}</strong></span>
                            <span className="font-mono text-slate-400 text-[11px]">{tx.network}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px]">
                            <span className="text-slate-500 font-mono truncate max-w-[180px]">{tx.ref}</span>
                            <span className="text-emerald-400 font-medium">Inspecter hash & conformité →</span>
                          </div>
                        </div>
                      </DetailCard>
                    );
                  })}
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
                title="Passerelles Bancaires & Rapprochement"
                subtitle="Synchronisation automatique des relevés et réconciliation comptable"
                icon={Landmark}
                badge="3 Banques Connectées"
                kpis={[
                  { label: 'Rapprochement', value: '100.0%', sub: 'Équilibré à l\'euro', trend: 'up' },
                  { label: 'Comptes Liés', value: '3 Banques', sub: 'USA + Europe' },
                  { label: 'Latence API', value: '45ms', sub: 'OAuth 2.0 / DSP2' }
                ]}
              >
                <div className="space-y-3">
                  {BANK_CONNECTORS.map((bank) => (
                    <DetailCard
                      key={bank.id}
                      title={bank.name}
                      badge={bank.balance}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold"
                      icon={Landmark}
                      subtitle={`Dernière synchronisation : ${bank.lastSync}`}
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedBank(bank);
                      }}
                    >
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400 font-mono">{bank.ibanMasked}</span>
                        <span className="text-emerald-400 font-medium text-[11px]">
                          Inspecter flux & OAuth →
                        </span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: SECURITY & HSM */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Sécurité & Clés Cryptographiques HSM"
                subtitle="Chiffrement des transactions, signature matérielle et enclave FIPS 140-2"
                icon={ShieldCheck}
                badge="HSM Enclave Actif"
                kpis={[
                  { label: 'Enclave', value: 'FIPS 140-2', sub: 'Level 3 Matériel', trend: 'up' },
                  { label: 'Quorum Multi-Sig', value: '2 sur 3', sub: 'Validation requise' },
                  { label: 'Rotation Clés', value: '30 Jours', sub: 'Automatique' }
                ]}
              >
                <div className="space-y-3">
                  {SECURITY_KEYS.map((key) => (
                    <DetailCard
                      key={key.id}
                      title={key.name}
                      subtitle={`${key.hsmSlot} • ${key.standard}`}
                      icon={ShieldCheck}
                      badge="Sécurisé"
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      isInteractive
                      onClick={() => {
                        haptics.trigger('selection');
                        setSelectedKey(key);
                      }}
                    >
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Algorithme :</span>
                          <span className="font-mono text-slate-200">{key.signingAlgorithm}</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/60">
                          <span className="text-slate-500">Quorum: {key.multiSigQuorum}</span>
                          <span className="text-emerald-400 font-medium">Inspecter empreinte publique →</span>
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* DRAWER 1: VIRTUAL CARD CONTROLS, LIMITS, CVV & LINKED TRANSACTIONS */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title={selectedCard?.name || ''}
        subtitle={`${selectedCard?.accountType} • ${selectedCard?.cardType}`}
        badge={selectedCard?.isFrozen ? 'Carte Gelée' : 'Carte Active'}
        badgeColor={selectedCard?.isFrozen ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        icon={CreditCard}
        breadcrumbs={[
          { label: 'Wallet OS', onClick: () => setSelectedCard(null) },
          { label: 'Cartes & Soldes', onClick: () => setSelectedCard(null) },
          { label: selectedCard?.name || 'Carte' }
        ]}
        actions={[
          {
            id: 'toggle_freeze',
            label: selectedCard?.isFrozen ? 'Dégeler la Carte' : 'Geler la Carte',
            icon: selectedCard?.isFrozen ? Unlock : Lock,
            variant: selectedCard?.isFrozen ? 'primary' : 'danger',
            onClick: () => {
              if (selectedCard) handleToggleFreezeCard(selectedCard.id);
            }
          },
          {
            id: 'reveal_cvv',
            label: revealedCardId === selectedCard?.id ? 'Masquer CVV' : 'Révéler CVV',
            icon: revealedCardId === selectedCard?.id ? EyeOff : Eye,
            onClick: () => {
              if (selectedCard) handleRevealCvv(selectedCard.id);
            }
          },
          {
            id: 'adjust_limit',
            label: 'Ajuster Plafond',
            icon: Sliders,
            onClick: () => {
              haptics.trigger('selection');
              showToast(`Plafond de ${selectedCard?.name} rehaussé de +$5,000`);
            }
          }
        ]}
        kpis={[
          { label: 'Plafond Mensuel', value: `$${(selectedCard?.monthlyLimit || 0).toLocaleString()}`, sub: 'Cap mensuel' },
          { label: 'Dépenses Réalisées', value: `$${(selectedCard?.spentThisMonth || 0).toLocaleString()}`, sub: 'Mois en cours' },
          { label: 'Solde Disponible', value: `$${((selectedCard?.monthlyLimit || 0) - (selectedCard?.spentThisMonth || 0)).toLocaleString()}`, sub: 'Marge restante', trend: 'up' },
          { label: 'Sécurité 3DS', value: 'v2.2 HSM', sub: 'Enclave active' }
        ]}
        aiInsight={{
          title: 'Optimisation des Dépenses Cartes',
          content: `La vélocité de dépenses sur ${selectedCard?.name} est de $328/jour. Le risque de dépassement de plafond avant la fin du cycle est de 0%.`,
          actionLabel: 'Activer le renouvellement automatique de token',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Token éphémère régénéré');
          }
        }}
        tabs={[
          {
            id: 'controls',
            label: 'Contrôles & Plafonds',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Plafond Journalier :</span>
                    <span className="font-mono text-slate-200 font-bold">${selectedCard?.dailyLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Plafond Transaction Unique :</span>
                    <span className="font-mono text-emerald-400 font-bold">${selectedCard?.singleTxLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Paiements Internationaux :</span>
                    <span className="text-emerald-400 font-semibold">{selectedCard?.allowInternational ? 'Autorisés' : 'Bloqués'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Paiements en Ligne :</span>
                    <span className="text-emerald-400 font-semibold">{selectedCard?.allowOnline ? 'Actifs' : 'Bloqués'}</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'credentials',
            label: 'Identifiants & CVV',
            content: (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Numéro de Carte :</span>
                    <button
                      onClick={() => selectedCard && handleCopyText(revealedCardId === selectedCard.id ? selectedCard.cardNumberFull : selectedCard.cardNumberMasked, 'Numéro de carte')}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Copy size={11} /> Copier
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold text-slate-100 tracking-wider">
                    {revealedCardId === selectedCard?.id ? selectedCard?.cardNumberFull : selectedCard?.cardNumberMasked}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Code CVV</div>
                      <div className="font-mono text-emerald-400 font-bold text-sm">
                        {revealedCardId === selectedCard?.id ? selectedCard?.cvv : '•••'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Date d'Expiration</div>
                      <div className="font-mono text-slate-200 font-bold text-sm">{selectedCard?.expDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'transactions',
            label: 'Historique des Débits',
            content: (
              <div className="space-y-2">
                {selectedCard?.recentTx.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-100">{tx.merchant}</div>
                      <div className="text-[10px] text-slate-400">{tx.date} • {tx.status}</div>
                    </div>
                    <span className="font-mono text-slate-200 font-bold">{tx.amount}</span>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 2: TRANSFER DETAIL, RECEIPT, BLOCKCHAIN HASH & REVERSE ACTION */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={selectedTx?.name || ''}
        subtitle={`${selectedTx?.category} • ${selectedTx?.date}`}
        badge={selectedTx?.status === 'reversed' ? 'Rétrogradé' : selectedTx?.amount}
        badgeColor={
          selectedTx?.status === 'reversed'
            ? 'bg-red-500/10 text-red-400 border-red-500/30 font-mono font-semibold'
            : selectedTx?.type === 'in' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-semibold' 
            : 'bg-slate-900 text-slate-200 border-slate-700 font-mono font-semibold'
        }
        icon={selectedTx?.type === 'in' ? ArrowDownLeft : ArrowUpRight}
        breadcrumbs={[
          { label: 'Wallet OS', onClick: () => setSelectedTx(null) },
          { label: 'Virements & Flux', onClick: () => setSelectedTx(null) },
          { label: selectedTx?.name || 'Virement' }
        ]}
        actions={[
          {
            id: 'download_receipt',
            label: 'Télécharger Reçu PDF',
            icon: Download,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Reçu fiscal ${selectedTx?.receiptNumber}.pdf exporté`);
            }
          },
          {
            id: 'reverse_tx',
            label: selectedTx?.status === 'reversed' ? 'Virement Déjà Contesté' : 'Contester Virement',
            icon: AlertTriangle,
            variant: 'danger',
            onClick: () => {
              if (selectedTx) handleReverseTransfer(selectedTx.id);
            }
          },
          {
            id: 'copy_hash',
            label: 'Copier Hash Tx',
            icon: Copy,
            onClick: () => {
              if (selectedTx) handleCopyText(selectedTx.blockchainHash, 'Hash Blockchain');
            }
          }
        ]}
        kpis={[
          { label: 'Montant Net', value: selectedTx?.amount || '$0.00', sub: 'Devise de règlement' },
          { label: 'Frais de Réseau', value: selectedTx?.gasFee.split(' ')[0] || '$0.00', sub: selectedTx?.gasFee.split('(')[1]?.replace(')', '') || 'Gas Fee' },
          { label: 'Confirmations', value: `${selectedTx?.confirmations || 0} Blocs`, sub: 'Règlement finalisé', trend: 'up' },
          { label: 'Score Conformité', value: '100% AML', sub: 'Piste d\'audit W3C' }
        ]}
        aiInsight={{
          title: 'Audit Fiscal & Rapprochement Automatisé',
          content: `Le virement ${selectedTx?.ref} est classé sous '${selectedTx?.category}' avec un taux de TVA de ${selectedTx?.taxVatRate}. La preuve cryptographique est ancrée dans le bloc #${selectedTx?.blockNumber}.`,
          actionLabel: 'Exporter la liasse fiscale',
          onAction: () => {
            haptics.trigger('selection');
            showToast('Liasse comptable exportée au format FEC');
          }
        }}
        tabs={[
          {
            id: 'blockchain_proof',
            label: 'Preuve Cryptographique',
            content: (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Réseau d'Ancrage :</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedTx?.network}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Numéro de Bloc :</span>
                    <span className="font-mono text-slate-200">{selectedTx?.blockNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Passerelle de Règlement :</span>
                    <span className="font-mono text-sky-400">{selectedTx?.settlementRail}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>Hash Blockchain Immuable :</span>
                    <button
                      onClick={() => selectedTx && handleCopyText(selectedTx.blockchainHash, 'Hash')}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-medium text-xs"
                    >
                      <Copy size={11} /> Copier
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 font-mono text-[11px] break-all leading-relaxed">
                    {selectedTx?.blockchainHash}
                  </pre>
                </div>
              </div>
            )
          },
          {
            id: 'receipt',
            label: 'Reçu & Justificatif Fiscal',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Numéro de Reçu :</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedTx?.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taux de TVA Appliqué :</span>
                    <span className="font-mono text-emerald-400">{selectedTx?.taxVatRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Score de Conformité AML :</span>
                    <span className="font-mono text-emerald-400">{selectedTx?.complianceScore}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 3: BANK CONNECTOR DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedBank}
        onClose={() => setSelectedBank(null)}
        title={selectedBank?.name || ''}
        subtitle={`${selectedBank?.bic} • ${selectedBank?.syncFrequency}`}
        badge={selectedBank?.status === 'synced' ? 'Synchronisé' : 'Connexion'}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={Landmark}
        breadcrumbs={[
          { label: 'Wallet OS', onClick: () => setSelectedBank(null) },
          { label: 'Banques', onClick: () => setSelectedBank(null) },
          { label: selectedBank?.name || 'Banque' }
        ]}
        actions={[
          {
            id: 'force_sync',
            label: 'Forcer Rapprochement',
            icon: RefreshCcw,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Rapprochement bancaire exécuté pour ${selectedBank?.name}`);
            }
          },
          {
            id: 'download_statement',
            label: 'Relevé MT940 / CSV',
            icon: Download,
            onClick: () => {
              haptics.trigger('selection');
              showToast(`Relevé bancaire MT940 exporté`);
            }
          }
        ]}
        kpis={[
          { label: 'Solde Comptable', value: selectedBank?.balance || '$0.00', sub: 'Certifié banque' },
          { label: 'Fréquence Sync', value: 'Temps Réel', sub: selectedBank?.syncFrequency || 'Auto' },
          { label: 'Validité Session', value: '84 Jours', sub: selectedBank?.authExpiry || 'OAuth 2.0', trend: 'up' },
          { label: 'Conformité DSP2', value: '100% Conforme', sub: 'Agrément bancaire' }
        ]}
        tabs={[
          {
            id: 'bank_details',
            label: 'Informations Passerelle',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Identifiant IBAN / Compte :</span>
                    <span className="font-mono text-slate-200">{selectedBank?.ibanMasked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Code BIC / Swift :</span>
                    <span className="font-mono text-emerald-400">{selectedBank?.bic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dernier Heartbeat :</span>
                    <span className="font-mono text-slate-200">{selectedBank?.lastSync}</span>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* DRAWER 4: SECURITY ENCLAVE KEY DETAIL */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={!!selectedKey}
        onClose={() => setSelectedKey(null)}
        title={selectedKey?.name || ''}
        subtitle={`${selectedKey?.hsmSlot} • ${selectedKey?.standard}`}
        badge="Enclave Active"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        icon={ShieldCheck}
        breadcrumbs={[
          { label: 'Wallet OS', onClick: () => setSelectedKey(null) },
          { label: 'Sécurité & HSM', onClick: () => setSelectedKey(null) },
          { label: selectedKey?.name || 'Clé HSM' }
        ]}
        actions={[
          {
            id: 'rotate_key',
            label: 'Faire Tourner la Clé',
            icon: RotateCcw,
            variant: 'primary',
            onClick: () => {
              haptics.trigger('success');
              showToast(`Rotation de clé HSM effectuée sans interruption de service`);
            }
          },
          {
            id: 'test_signature',
            label: 'Tester Signature mTLS',
            icon: KeyRound,
            onClick: () => {
              haptics.trigger('medium');
              showToast('Signature cryptographique vérifiée avec succès (Ed25519)');
            }
          }
        ]}
        kpis={[
          { label: 'Standard FIPS', value: '140-2 Level 3', sub: 'Enclave matérielle', trend: 'up' },
          { label: 'Multi-Sig Quorum', value: selectedKey?.multiSigQuorum.split(' ')[0] || '2 sur 3', sub: 'Seuil d\'approbation' },
          { label: 'Dernière Rotation', value: selectedKey?.lastRotated || 'Récente', sub: 'Automatisée' },
          { label: 'Statut Enclave', value: 'Optimal', sub: 'Zéro brèche' }
        ]}
        tabs={[
          {
            id: 'crypto_specs',
            label: 'Spécifications Cryptographiques',
            content: (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Algorithme de Signature :</span>
                    <span className="font-mono text-emerald-400">{selectedKey?.signingAlgorithm}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Empreinte Clé Publique (Fingerprint) :</div>
                  <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 font-mono text-[11px] break-all leading-relaxed">
                    {selectedKey?.publicKeyFingerprint}
                  </pre>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* Floating Animated Toast */}
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
