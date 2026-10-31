# Edge Capabilities Inventory for Issue #29

## Convergence Status Report

This document inventories the unique mobile situations/capabilities in The OMK Mobile Back-Office repository and classifies them against the canonical OMK Business OS.

---

## Inventory of Mobile Capabilities

### Gate 1: Urgent Notifications
| Location | Classification | Notes |
|----------|---------------|-------|
| `src/components/NotificationCenter.tsx` | **ALREADY_CANONICAL** | Standard alert primitive via AppEventBus system |

### Gate 2: Reply Capability
| Location | Classification | Notes |
|----------|---------------|-------|
| `src/components/apps/clients/ContactDetailModal.tsx` | **ALREADY_CANONICAL** | Contact communication history part of Client domain model |

### Gate 3: Scan/Upload Capability
| Location | Classification | Notes |
|----------|---------------|-------|
| `src/components/apps/Clients.tsx` (JSON import/export) | **ALREADY_CANONICAL** | File upload part of shared domain patterns |
| `src/components/apps/Finance.tsx` (expense receipts) | **ALREADY_CANONICAL** | File upload part of shared domain patterns |
| `src/components/apps/Wallet.tsx` (document download) | **ALREADY_CANONICAL** | File upload part of shared domain patterns |

### Gate 4: Client Lookup
| Location | Classification | Notes |
|----------|---------------|-------|
| `src/App.tsx` (GlobalSearch) | **ALREADY_CANONICAL** | Global discovery across apps - shared OS capability |
| `src/components/HomeScreen.tsx` (search) | **ALREADY_CANONICAL** | Same as above |

### Gate 5: Payment Status
| Location | Classification | Notes |
|----------|---------------|-------|
| `src/components/apps/Wallet.tsx` | **ALREADY_CANONICAL** | FinancialTransaction.status in Finance domain |
| `src/components/apps/Finance.tsx` | **ALREADY_CANONICAL** | Expense.status part of Finance domain |

### Gate 6: Next Action / Pipeline
| Location | Classification | Notes |
|----------|---------------|-------|
| `src/components/apps/Leads.tsx` | **ALREADY_CANONICAL** | Campaign pipeline, call records, voice bot scheduling |
| `src/components/apps/JaaS.tsx` | **ALREADY_CANONICAL** | Candidate dispatch missions, recruitment pipeline |
| `src/components/apps/Clients.tsx` | **ALREADY_CANONICAL** | Project milestones, contract renewals, health alerts |

### Gate 7: Security/Error Sanitization
| Location | Classification | Notes |
|----------|---------------|-------|
| `server.ts` (Gemini endpoint - commit 8a3fa88) | **SUPERSEDED** | Error sanitization already extracted, mobile uses upstream patterns |

---

## Detailed Capability Inventories

### Domain: Clients & Relationships
| Capability | Source Location | Canonical Status |
|------------|-----------------|------------------|
| Client Master Data | `src/types.ts` (Client), `src/services/clientStorage.ts` | ALREADY_CANONICAL |
| Contact Management | `src/components/apps/clients/ContactDetailModal.tsx` | ALREADY_CANONICAL |
| Project Tracking | `src/components/apps/clients/ProjectDetailModal.tsx` | ALREADY_CANONICAL |
| Contract Management | `src/components/apps/clients/ContractDetailModal.tsx` | ALREADY_CANONICAL |
| Support Tickets | `src/components/apps/clients/TicketDetailModal.tsx` | ALREADY_CANONICAL |
| Health Scoring | `src/components/apps/clients/Clients.tsx` (sante tab) | ALREADY_CANONICAL |
| SLA Tracking | `src/components/apps/clients/Clients.tsx` | ALREADY_CANONICAL |

### Domain: Finance & Payments
| Capability | Source Location | Canonical Status |
|------------|-----------------|------------------|
| Treasury Management | `src/components/apps/Finance.tsx` | ALREADY_CANONICAL |
| Expense Tracking | `src/components/apps/Finance.tsx` | ALREADY_CANONICAL |
| Budget Control | `src/components/apps/Finance.tsx` | ALREADY_CANONICAL |
| Tax Compliance | `src/components/apps/Finance.tsx` | ALREADY_CANONICAL |
| Virtual Cards | `src/components/apps/Wallet.tsx` | ALREADY_CANONICAL |
| Bank Reconciliation | `src/components/apps/Wallet.tsx` | ALREADY_CANONICAL |
| Crypto/Blockchain Proof | `src/components/apps/Wallet.tsx` | ALREADY_CANONICAL |

### Domain: Sales & Growth
| Capability | Source Location | Canonical Status |
|------------|-----------------|------------------|
| Lead Management | `src/components/apps/Leads.tsx` | ALREADY_CANONICAL |
| Campaign Management | `src/components/apps/Leads.tsx` | ALREADY_CANONICAL |
| Voice Bot Assistant | `src/components/apps/Leads.tsx` | ALREADY_CANONICAL |
| Pipeline Tracking | `src/components/apps/Leads.tsx` | ALREADY_CANONICAL |

### Domain: HR & Talent
| Capability | Source Location | Canonical Status |
|------------|-----------------|------------------|
| JAAS Job Marketplace | `src/components/apps/JaaS.tsx` | ALREADY_CANONICAL |
| Candidate Dispatch | `src/components/apps/JaaS.tsx` | ALREADY_CANONICAL |
| Referral System | `src/components/apps/JaaS.tsx` | ALREADY_CANONICAL |

### Domain: Operations & Infrastructure
| Capability | Source Location | Canonical Status |
|------------|-----------------|------------------|
| PaaS Scaling | `src/components/apps/PaaSPro.tsx` | ALREADY_CANONICAL |
| BaaS Hub | `src/components/apps/BaaSHub.tsx` | ALREADY_CANONICAL |
| Monitoring & SLA | `src/components/apps/Operations.tsx` | ALREADY_CANONICAL |

---

## Capabilities to Extract to Canonical Engine

### 1. Haptics Service
- **File**: `src/services/haptics.ts`
- **Purpose**: Web Vibrate API + Web Audio API micro-pulse tactile feedback
- **Classification**: EXTRACT
- **Rationale**: Reusable UI feedback service for all mobile interactions

### 2. Focus Audio Service
- **File**: `src/services/focusAudio.ts`
- **Purpose**: Audio environment soundscapes (binaural 432Hz, rain, cyber drone, pink noise)
- **Classification**: EXTRACT or MOBILE_ONLY_PRESENTATION
- **Rationale**: Media-specific capability; decide if needed upstream

---

## Zustand/Render Performance Patterns

### Current Implementation
- **Store**: `src/store/osStore.ts` - Zustand with targeted selectors
- **Caching**: `src/services/clientStorage.ts` - In-memory cache with raw string comparison (O(1) retrieval)
- **Optimization**: `src/components/HomeScreen.tsx` - useMemo for badge counts, memoized selectors

### Classification: ALREADY_CANONICAL
Patterns are established and should be documented in upstream Business OS.

---

## Federation & Cross-App Communication

### App Event Bus
- **File**: `src/services/eventBus.ts`
- **Classification**: ALREADY_CANONICAL
- **Events**: CLIENT_CREATED, CLIENT_UPDATED, LEAD_CREATED, etc.
- **Purpose**: Cross-application communication, reactive UI sync

---

## Mobile-Specific Presentation Layer

### Pure Mobile UI Patterns (Not Canonical)
| Feature | Description |
|---------|-------------|
| Paradigm Switching | iOS/Android style toggle |
| Device Form Factor | Portrait/Landscape/Tablet adaptation |
| Theme System | Multiple theme definitions (warm-paper, cyberpunk, etc.) |
| Smart Folders | Grouping mechanism for apps |
| Swipe Gestures | Pull-down notification center |
| Dock Menu | Persistent app dock |

---

## Convergence Summary

### Ready for Upstream: ✅
- Full Client domain (lookup, health, contracts, projects)
- Finance domain (treasury, expenses, budgets, tax)
- Sales domain (leads, campaigns, voice bot)
- HR domain (JaaS, referrals, hiring)
- Wallet domain (cards, transfers, blockchain)
- Security domain (secrets, audit, policies)
- Zustand patterns with selectors
- EventBus for cross-app communication

### To Extract: 🚚
- Haptics Service (tactile feedback)
- Focus Audio Service (decide if upstream)

### Mobile Presentation Only: 📱
- Paradigm switcher
- Device form factor handling
- Theme system
- Smart folders

---

## Next Steps

1. Verify domain parity with OMK Business OS V3
2. Extract haptics.ts to upstream Business OS as shared UI feedback service
3. Document performance patterns (targeted selectors, caching strategies)
4. Confirm focusAudio.ts belongs in Mobile or should be upstreamed

---