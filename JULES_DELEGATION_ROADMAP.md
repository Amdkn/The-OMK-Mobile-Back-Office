# 🗺️ OMK MOBILE BACK OFFICE — CAHIER DES CHARGES DÉLÉGATION JULES (GOOGLE)
> **Dépôt :** `Amdkn/The-OMK-Mobile-Back-Office`  
> **Rôle :** Jumeau Numérique Mobile Exécutif de `OMK-DESKTOP-WEB-OS`  
> **Cible d'Exécution :** Agent Autonome **Jules (Google)** & Ingénierie OMK Core  
> **Version du Protocole :** v2.4-Production-Ready  
> **Standard Qualité :** Zéro régression, Typage 100% strict, Zéro code tronqué / `// TODO`

---

## 1. ARCHITECTURE & STACK OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           THE OMK MOBILE BACK OFFICE (EDGE CLIENT)                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Springboard UI ] ─── [ Dynamic Island ] ─── [ DynamicWidgetsGrid ] ─── [ Dock ]      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Web Speech Command Palette ] ◄──► [ SearchIndexingService ] ◄──► [ Haptics Service ] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  [ useAppEventBus (Pub/Sub) ] ◄──► [ usePowerManager ] ◄──► [ useResponsiveLayout ]     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Zustand OS Store (osStore.ts) ] ◄──► [ Isolated LocalForage / IndexedDB Storage ]   │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │ WebSocket / tRPC / FastMCP
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                      OMK-DESKTOP-WEB-OS & FAST-MCP GATEWAYS (CORE)                     │
│  8 Adaptateurs : FastMCP · REST API · WebSockets · CLI Daemon · Cloud SQL · Vault       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Rôle du Mobile OS
Le **OMK Mobile Back Office** n'est pas un simple site web responsive ou une coquille vide : c'est un **Edge Client AI-Native** ultra-rapide agissant comme le centre de commande et la télécommande exécutive de l'infrastructure globale `OMK-DESKTOP-WEB-OS`.
- **Exécution Edge Réactive :** Lecture et écriture locales instantanées avec synchronisation idempotente.
- **Support Multi-Paradigmes :** Switch fluide entre navigation iOS (Dynamic Island interactive) et Android (Camera Punch-Hole & Gesture Bar).
- **Gestionnaire d'Énergie & Throttling :** Mode basse consommation matériel désactivant les calculs GPU lourds, allégeant les transitions et réduisant la fréquence télémétrique (30s au lieu de 5s).

### 1.2 Modèle d'Événements Découplé (Pub/Sub EventBus)
L'ensemble des modules applicatifs, widgets et services système communiquent exclusivement à travers un bus d'événements asynchrone non-bloquant (`eventBus.ts`, `useAppEventBus.ts`).

```typescript
// Contrat d'émission / écoute standardisé
AppEventBus.emit<T>(type: OMKEventType, sender: AppId | 'system', payload: T);
AppEventBus.subscribe(types: OMKEventType[], handler: (event: AppEvent) => void);
```

### 1.3 Validation Stricte des Schémas d'État (TypeScript & Zod)
Chaque flux de données transitant par le bus, le cache `localForage` ou les routes d'API serveur doit posséder un schéma de validation Zod strict et des types TypeScript immuables. Aucune propriété `any` non contrôlée n'est tolérée.

---

## 2. MATRICE DES 8 DOMAINES MÉTIERS À IMPLÉMENTER EN PROFONDEUR

Chaque domaine correspond à une division stratégique de l'empire OMK, assignée à un avatar et une escouade de super-héros.

---

### 🏛️ DOMAINE 1 : GROWTH & ACQUISITION
- **Avatar & Escouade :** *Superman / Gardiens de la Galaxie*
- **Identifiant App :** `growth` (complémentaire de `leads`)
- **Mission :** Domination du trafic organique, SEO local, optimisation des fiches d'autorité Google Business Profile (GBP), campagnes d'acquisition géo-ciblées.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🚀 GROWTH ENGINE — SUPERMAN & GUARDIANS                                │
├────────────────────────────────┬───────────────────────────────────────┤
│ [GBP Authority Score: 94/100]  │ [Local Rank Grid: #1 sur 8 Secteurs]  │
├────────────────────────────────┴───────────────────────────────────────┤
│  • Campagnes Locales : "Miami Dental AI", "Paris Avocats B2B"         │
│  • Citations NAP & Backlinks Locaux vérifiés (98.6% cohérence)         │
│  • Automatisation des Avis 5★ Google via SMS/Email trigger            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Dashboard Acquisition & Ranking :** Grille de positionnement local (Local 3-Pack tracker), score de visibilité globale, CTR organique.
2. **Gestionnaire de Fiches GBP (Google Business Profile) :** Statut de vérification, audit des attributs, générateur de posts d'actualité automatisés, modération des avis entrants.
3. **Campagnes Géo-Ciblées :** Création et activation de campagnes de prospection locale, budget journalier, CPA cible, projection des impressions.

#### Widgets Dédiés
- `GrowthRadarWidget` : Carte thermique du classement local sur 9 points GPS.
- `ReviewsVelocityWidget` : Rythme de collecte des avis clients et note moyenne en temps réel.

#### Actions d'Écriture
- `createLocalCampaign(payload: LocalCampaignInput)` : Déploie une nouvelle campagne d'acquisition avec ciblage code postal et mot-clé.
- `updateGbpAttributes(profileId: string, attributes: GbpAttributes)` : Met à jour les horaires, catégories et descriptions SEO.
- `replyToReview(reviewId: string, response: string, autoAi: boolean)` : Publie une réponse optimisée SEO à un avis client.

#### Événements Émis sur l'EventBus
- `GROWTH_CAMPAIGN_LAUNCHED` (`{ campaignId, geoTarget, budget }`)
- `GROWTH_GBP_UPDATED` (`{ profileId, updatedFields }`)
- `GROWTH_REVIEW_RECEIVED` (`{ reviewId, rating, author, requiresAction }`)

---

### 👥 DOMAINE 2 : PEOPLE, TALENTS & HR
- **Avatar & Escouade :** *Green Lantern / X-Men*
- **Identifiant App :** `hr` (intégré à `jaas-job` et `clients`)
- **Mission :** Gestion du capital humain, pipeline de recrutement des talents d'élite, ingestion **Master Profile 1-Click**, et exécution de la méthodologie **12-Week Year (12WY)**.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🧬 PEOPLE & TALENT MATRIX — GREEN LANTERN & X-MEN                     │
├────────────────────────────────┬───────────────────────────────────────┤
│ [12WY Score Équipe: 87.4%]     │ [Candidats en Pipeline: 24 Actifs]    │
├────────────────────────────────┴───────────────────────────────────────┤
│  • Ingestion Master Profile 1-Click (LinkedIn/PDF -> Score AI 96/100) │
│  • Suivi des Tâches Tactiques Semaine S08 (12-Week Year)               │
│  • Registre des Contrats & Évaluations Trimestrielles 360°            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Master Talent Pipeline :** Vue Kanban des candidats (Sourcing, Entretien Technique, Culture Fit, Offre Émise, Onboardé).
2. **Ingesteur Master Profile 1-Click :** Zone de drop ou collage de profil générant une fiche candidat normalisée avec matrice de compétences, score d'affinité IA et prétentions salariales.
3. **Tableau de Bord 12-Week Year (12WY) :** Objectifs tactiques par trimestre de 12 semaines, scores d'exécution hebdomadaires, rétrospectives d'équipe.
4. **Annuaire & Organigramme Exécutif :** Rôles, contacts d'urgence, contrats, autorisations d'accès.

#### Widgets Dédiés
- `TwelveWeekYearProgressWidget` : Jauge d'avancement du cycle en cours (Semaine W/12) et taux de complétion tactique.
- `TalentPipelineRadarWidget` : Répartition des compétences recherchées vs acquises.

#### Actions d'Écriture
- `ingestMasterProfile(rawInput: string | File)` : Parse et structure automatiquement un profil candidat via IA.
- `advanceCandidateStage(candidateId: string, nextStage: CandidateStage)` : Fait progresser le candidat dans l'entonnoir RH.
- `update12WYScore(memberId: string, weekNumber: number, score: number)` : Enregistre le score de performance hebdomadaire.

#### Événements Émis sur l'EventBus
- `HR_CANDIDATE_INGESTED` (`{ candidateId, role, matchScore }`)
- `HR_STAGE_ADVANCED` (`{ candidateId, fromStage, toStage }`)
- `HR_12WY_SCORE_LOGGED` (`{ memberId, weekNumber, executionRate }`)

---

### ⚙️ DOMAINE 3 : OPERATIONS & DARK FACTORY
- **Avatar & Escouade :** *Batman / Fantastic 4*
- **Identifiant App :** `operations`
- **Mission :** File de tâches GTD (Getting Things Done), automatisation industrielle des processus récurrents (**Dark Factory**), monitoring des SOPs (Standard Operating Procedures) et taux de disponibilité opérationnelle.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🏭 DARK FACTORY & OPERATIONS — BATMAN & FANTASTIC 4                    │
├────────────────────────────────┬───────────────────────────────────────┤
│ [SOP Compliance: 99.4%]        │ [Dark Factory Bots: 12/12 Online]     │
├────────────────────────────────┴───────────────────────────────────────┤
│  • File GTD : Boîte de réception, Prochaines actions, Délégué, Attente │
│  • Dark Factory Pipeline : 420 jobs traités automatiquement/jour      │
│  • Registre des Incidents & Procédures d'Escalade P1/P2               │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Gestionnaire GTD (Getting Things Done) :** Inbox, Actions Contextuelles (@DeepWork, @Call, @Admin), Projets Actifs, Someday/Maybe.
2. **Console Dark Factory :** Monitoring des workers autonomes en tâche de fond, débit d'exécution des tâches sans intervention humaine, file d'attente d'erreurs.
3. **Bibliothèque de SOPs Interactives :** Checklists opérationnelles pas à pas avec horodatage cryptographique et validation d'étapes obligatoires.
4. **Centre de Contrôle de Continuité d'Activité :** Uptime des processus, plan de reprise après sinistre, audits de processus.

#### Widgets Dédiés
- `GTDFocusWidget` : Les 3 actions prioritaires du jour avec minuteur Pomodoro intégré.
- `DarkFactoryThroughputWidget` : Graphique en temps réel des tâches automatisées traitées.

#### Actions d'Écriture
- `createGTDTask(task: GTDTaskInput)` : Ajoute une tâche qualifiée avec contexte, énergie requise et date limite.
- `executeSOPStep(sopId: string, stepIndex: number, verificationData: any)` : Valide une étape de SOP avec preuve d'exécution.
- `triggerDarkFactoryJob(workflowId: string, parameters: Record<string, any>)` : Déclenche un pipeline autonome.

#### Événements Émis sur l'EventBus
- `OP_TASK_CREATED` (`{ taskId, priority, context }`)
- `OP_TASK_COMPLETED` (`{ taskId, durationMinutes }`)
- `OP_DARK_FACTORY_ALERT` (`{ workflowId, status, errorRate }`)

---

### 💻 DOMAINE 4 : IT, INFRASTRUCTURE & FAST-MCP
- **Avatar & Escouade :** *Cyborg / Kang Dynasty*
- **Identifiant App :** `paas-pro` (intégré à `terminal` et `security`)
- **Mission :** Passerelles FastMCP (Model Context Protocol), connecteurs d'API tiers, état des conteneurs Render/Docker/Cloud Run, télémétrie des nœuds et flux de logs d'infrastructure.

```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚡ IT & FAST-MCP GATEWAY — CYBORG & KANG DYNASTY                      │
├────────────────────────────────┬───────────────────────────────────────┤
│ [FastMCP Status: HEALTHY 12ms] │ [Conteneurs Actifs: 8 Pods FRA-01]    │
├────────────────────────────────┴───────────────────────────────────────┤
│  • Connecteurs MCP : Filesystem, CloudSQL, GitHub, Stripe, Gemini Core │
│  • Métriques Serveur : CPU 18%, RAM 42%, Latence p99 24ms              │
│  • Live Tail Logs & Terminal CLI Interactif                            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **FastMCP Gateway Hub :** Statut en direct des 8 adaptateurs MCP, outils exposés (`tools_list`), requêtes par minute, taux d'erreurs.
2. **Container & Cloud Fleet Monitor :** Clusters Render/Docker/Cloud Run, utilisation CPU/Mémoire par pod, contrôles d'autoscaling.
3. **Live Log Streamer :** Filtre de logs par sévérité (`INFO`, `WARN`, `ERROR`, `FATAL`) avec recherche textuelle et export JSON.
4. **Passerelle de Clés API & Webhooks :** Rotation des secrets, audit des permissions, monitoring de la validité des webhooks.

#### Widgets Dédiés
- `MCPGatewayLatencyWidget` : Jauge de latence et disponibilité du protocole MCP.
- `ClusterHealthWidget` : Statut visuel des pods et charge moyenne du cluster.

#### Actions d'Écriture
- `restartContainerPod(podId: string)` : Relance un conteneur défaillant avec vérification de santé post-boot.
- `rotateApiKey(serviceName: string)` : Génère et propage une nouvelle clé d'authentification.
- `executeTerminalCommand(command: string)` : Exécute une commande de diagnostic d'infrastructure via CLI runner.

#### Événements Émis sur l'EventBus
- `IT_MCP_TOOL_INVOKED` (`{ toolName, durationMs, status }`)
- `IT_CONTAINER_SCALED` (`{ clusterId, previousPods, newPods }`)
- `IT_CRITICAL_LOG_TRIGGERED` (`{ service, message, timestamp }`)

---

### 💰 DOMAINE 5 : SALES, LEADS & CLOSING
- **Avatar & Escouade :** *John Jones (Martian Manhunter) / Illuminati*
- **Identifiant App :** `sales` (intégré à `leads` et `clients`)
- **Mission :** Pipeline de conversion B2B à haute vélocité, **Dispatch 1-Click** vers les closers, qualification prédictive des opportunités, signature et closing.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🎯 SALES PIPELINE & CLOSING — JOHN JONES & ILLUMINATI                  │
├────────────────────────────────┬───────────────────────────────────────┤
│ [Pipeline Total: $485,000]     │ [Taux de Closing: 34.2%]              │
├────────────────────────────────┴───────────────────────────────────────┤
│  • Deals Chauds : Acme Corp ($42k MRR), Horizon Labs ($18k MRR)        │
│  • Dispatch 1-Click : Attribution intelligente selon disponibilité     │
│  • Suivi des Rendez-vous de Découverte & Closing Calls                 │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Pipeline de Deals Interactif :** Vue Kanban interactive (Lead Inbound, Qualification, Découverte, Démo, Proposition, Closing Gagné/Perdu).
2. **Dispatch 1-Click Console :** Attribution instantanée d'un lead qualifié au commercial le plus performant avec push notification haptique.
3. **Fiche Opportunité 360° :** Historique complet des échanges, enregistrements d'appels, analyse sentimentale IA, valeur du contrat (ACV).
4. **Calculateur de Commissions & Quotas :** Suivi individuel et d'équipe des objectifs de vente mensuels et trimestriels.

#### Widgets Dédiés
- `SalesPipelineVelocityWidget` : Volume d'opportunités actives et valeur totale pondérée.
- `RecentDealsClosedWidget` : Flux des dernières signatures enregistrées.

#### Actions d'Écriture
- `createDeal(deal: DealInput)` : Crée une nouvelle opportunité avec montant prévisionnel et contact associé.
- `dispatchLeadToOneClick(leadId: string, salesRepId: string)` : Assigne immédiatement l'opportunité avec alerte push.
- `updateDealStage(dealId: string, newStage: DealStage, reasonLost?: string)` : Met à jour l'état d'avancement du contrat.

#### Événements Émis sur l'EventBus
- `SALES_DEAL_CREATED` (`{ dealId, companyName, value }`)
- `SALES_LEAD_DISPATCHED` (`{ leadId, assignedTo, priority }`)
- `SALES_DEAL_WON` (`{ dealId, value, recurringMonthly }`)

---

### 💳 DOMAINE 6 : FINANCE, TRÉSORERIE & AFFILIATION
- **Avatar & Escouade :** *Wonder Woman / Thunderbolts*
- **Identifiant App :** `finance` (intégré à `wallet`)
- **Mission :** Tableau de bord de trésorerie consolidée, application stricte de la **Règle des 5**, suivi temps réel des commissions d'affiliation (**$50 JOB / $150 BUZZ / $250 PRO**), facturation Stripe et Grand Livre (Ledger).

```
┌────────────────────────────────────────────────────────────────────────┐
│ 💎 FINANCE & AFFILIATION — WONDER WOMAN & THUNDERBOLTS                 │
├────────────────────────────────┬───────────────────────────────────────┤
│ [MRR Consolidé: $124,500]      │ [Réserves Trésorerie: 8.4 Mois]       │
├────────────────────────────────┴───────────────────────────────────────┤
│  • Règle des 5 Respectée : 20% Opérations, 20% Taxe, 20% R&D...        │
│  • Affiliation en Attente : $6,450 (JOB: $50, BUZZ: $150, PRO: $250)   │
│  • Grand Livre & Rapprochement Bancaire Stripe / Mercury / Ledger      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Vue Trésorerie Exécutive :** Solde bancaire disponible, MRR/ARR, Runway en mois, ratio dépenses/revenus.
2. **Matrice de la Règle des 5 :** Répartition automatique de chaque encaissement dans les 5 comptes dédiés (Trésorerie d'urgence, Impôts/TVA, Rémunération, Croissance/R&D, Dividendes).
3. **Module Affiliation & Payouts :** Suivi précis des ventes affiliées selon la grille contractuelle officielle :
   - Pack **JOB** ($300) ➔ Commission fixe de **$50**
   - Pack **BUZZ** ($720) ➔ Commission fixe de **$150**
   - Pack **PRO** ($1,500) ➔ Commission fixe de **$250**
4. **Facturation & Grand Livre :** Création de factures conformes, relance des impayés, synchronisation des webhooks Stripe.

#### Widgets Dédiés
- `TreasuryRunwayWidget` : Jauge de santé financière et runway avec alertes de seuil.
- `AffiliationPayoutWidget` : Total des commissions dues et date du prochain virement groupé.

#### Actions d'Écriture
- `recordTransaction(entry: TransactionEntryInput)` : Enregistre une écriture comptable avec ventilation Règle des 5.
- `generateInvoice(invoice: InvoiceInput)` : Émet une facture Stripe et envoie le lien de paiement au client.
- `approveAffiliatePayout(payoutId: string)` : Valide le versement des commissions d'affiliation vérifiées.

#### Événements Émis sur l'EventBus
- `FINANCE_TRANSACTION_RECORDED` (`{ txId, amount, category }`)
- `FINANCE_INVOICE_PAID` (`{ invoiceId, clientName, amount }`)
- `FINANCE_AFFILIATE_PAYOUT_APPROVED` (`{ payoutId, affiliateId, totalAmount }`)

---

### 📦 DOMAINE 7 : PRODUCT, OFFERS & ROI SIMULATOR
- **Avatar & Escouade :** *Flash / Avengers*
- **Identifiant App :** `product` (intégré à `paas-pro`)
- **Mission :** Gestion du catalogue d'offres standardisées (**JOB $300 / BUZZ $720 / PRO $1,500**), packaging des livrables de service, simulateur de retour sur investissement (ROI) pour prospects et clients.

```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚡ PRODUCT SUITE & OFFERS — FLASH & AVENGERS                           │
├────────────────────────────────┬───────────────────────────────────────┤
│ [Offres Actives: 3 Core Packs] │ [ROI Simulateur: x4.8 Rendement Moyen]│
├────────────────────────────────┴───────────────────────────────────────┤
│  • JOB Pack ($300/m)  : Recrutement ciblé, 1 profil validé/semaine    │
│  • BUZZ Pack ($720/m) : Dominance réseaux, 12 vidéos virales/mois      │
│  • PRO Pack ($1,500/m): Solution globale All-In-One + FastMCP Gateway │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Catalogue d'Offres & Bundles :** Fiches détaillées des 3 offres phares avec fonctionnalités incluses, SLAs garantis et limitations techniques.
2. **Simulateur ROI Interactif :** Calculateur dynamique permettant d'ajuster le budget du prospect pour projeter le gain de temps, le coût par acquisition et l'augmentation nette du chiffre d'affaires.
3. **Packaging des Livrables & Feature Flags :** Activation/désactivation de modules selon le pack souscrit par le client.
4. **Roadmap Produit & Release Notes :** Suivi des déploiements de fonctionnalités, changelog versionné et vote des fonctionnalités prioritaires.

#### Widgets Dédiés
- `OfferCatalogQuickPickWidget` : Sélecteur rapide de devis avec calcul instantané du prix mensuel/annuel.
- `ROICalculatorMiniWidget` : Résumé d'impact économique pour pitch commercial instantané.

#### Actions d'Écriture
- `updateOfferPricing(offerId: 'job' | 'buzz' | 'pro', pricing: OfferPricing)` : Ajuste les conditions contractuelles d'une offre.
- `generateROISimulation(inputs: ROISimulatorInputs)` : Produit un rapport PDF/JSON de simulation financière pour un prospect.
- `toggleFeatureFlag(clientId: string, featureKey: string, enabled: boolean)` : Active un livrable dans l'instance client.

#### Événements Émis sur l'EventBus
- `PRODUCT_OFFER_SELECTED` (`{ offerId, bundleTier, pricing }`)
- `PRODUCT_SIMULATION_COMPLETED` (`{ simulationId, projectedROI }`)
- `PRODUCT_FLAG_TOGGLED` (`{ clientId, featureKey, enabled }`)

---

### ⚖️ DOMAINE 8 : LEGAL, COMPLIANCE & NOTARIZED VAULT
- **Avatar & Escouade :** *Aquaman / Eternals*
- **Identifiant App :** `baas-hub` (intégré à `security`)
- **Mission :** Conformité stricte (notamment normes USCIS / Immigration / Travail international), coffre-fort documentaire notarié avec hachage SHA-256, vérification d'identité biométrique et politiques de sécurité au niveau des lignes (Row-Level Security / RLS).

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🛡️ LEGAL & COMPLIANCE VAULT — AQUAMAN & ETERNALS                      │
├────────────────────────────────┬───────────────────────────────────────┤
│ [Audit Conformité: 100% PASS]  │ [Documents Scellés: 184 SHA-256 Valid]│
├────────────────────────────────┴───────────────────────────────────────┤
│  • Dossiers USCIS & Travail International : P-1A, O-1, EB-1, E-2       │
│  • Coffre-fort Notarié : Hachage immuable et horodatage certifié      │
│  • Vérification d'Identité : KYC/KYB & Politiques RLS Supabase/SQL    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Écrans & Vues Requises
1. **Registre de Conformité USCIS & Visas :** Suivi des pièces justificatives, échéances critiques, formulaires I-129 / I-140 / ETA-9089 et statuts des requêtes.
2. **Coffre-Fort Documentaire Notarié :** Liste des contrats scellés avec visualiseur de certificat d'intégrité (hash SHA-256, horodatage UTC certifié).
3. **Console KYC / KYB & Identité :** Validation des pièces d'identité des dirigeants et bénéficiaires effectifs avec score de confiance anti-fraude.
4. **Audit des Politiques RLS (Row-Level Security) :** Matrice de contrôle d'accès aux données sensibles par rôle (Admin, Closer, Développeur, Client).

#### Widgets Dédiés
- `LegalComplianceGaugeWidget` : Taux de complétude des dossiers juridiques actifs.
- `VaultIntegrityWidget` : Statut de synchronisation des hachages cryptographiques du coffre-fort.

#### Actions d'Écriture
- `sealDocumentInVault(document: DocumentToSeal)` : Calcule le hash SHA-256 et verrouille le document dans le coffre-fort.
- `updateUSCISCaseStatus(caseId: string, status: USCISStatus, notes: string)` : Met à jour l'état d'avancement d'un dossier d'immigration.
- `verifyIdentityKYC(identityId: string, decision: 'approved' | 'rejected', notes?: string)` : Valide formellement une vérification d'identité.

#### Événements Émis sur l'EventBus
- `LEGAL_DOCUMENT_SEALED` (`{ docId, sha256, timestamp }`)
- `LEGAL_USCIS_UPDATED` (`{ caseId, status, applicantName }`)
- `LEGAL_RLS_POLICY_AUDITED` (`{ table, policyStatus, timestamp }`)

---

## 3. SYSTÈME DE DONNÉES & SCHÉMAS TYPESCRIPT

Tous les modèles doivent être centralisés dans `/src/types.ts` ou dans leurs dossiers respectifs `/src/types/`.

### 3.1 Définitions Complètes des Modèles Métiers
```typescript
// Grille tarifaire et commissions d'affiliation officielles
export interface CommercialOffer {
  id: 'job' | 'buzz' | 'pro';
  name: string;
  monthlyPrice: 300 | 720 | 1500;
  affiliateCommission: 50 | 150 | 250;
  deliverables: string[];
  slaHours: number;
}

// Transaction financière avec règle des 5
export interface FinancialTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'mrr' | 'affiliate_payout' | 'infrastructure' | 'tax' | 'payroll';
  ruleOfFiveSplit: {
    emergencyTreasury: number; // 20%
    taxesAndVat: number;       // 20%
    executivePay: number;      // 20%
    rndGrowth: number;         // 20%
    dividends: number;         // 20%
  };
  timestamp: number;
  referenceInvoiceId?: string;
}

// Coffre-fort notarié
export interface NotarizedDocument {
  id: string;
  title: string;
  category: 'uscis' | 'contract' | 'nda' | 'corporate_bylaws';
  sha256Hash: string;
  sealedAt: number;
  sealedBy: string;
  isTamperProof: boolean;
  status: 'valid' | 'under_review' | 'expired';
}
```

---

## 4. DESIGN SYSTEM MULTI-THÈMES & UI GUIDELINES

Le Mobile OS supporte 5 thèmes natifs basculables sans rechargement de page via attributs de données `data-theme` :

| Thème | Ambiance & Palette | Cas d'Usage Recommandé |
| :--- | :--- | :--- |
| **Dark OLED** | `#000000` absolu, contrastes néon vert/émeraude `#10B981` | Utilisation nocturne, économie de batterie maximale |
| **Warm Paper** | Fond beige éditorial `#FBF9F5`, bordures encre `#2D2B28` | Sessions de lecture, rédaction de notes, révision de SOPs |
| **Brutalism** | Bordures franches 2px `#000000`, ombres portées nettes décalées | Densité d'information, dashboards de monitoring brut |
| **Claymorphism** | Ombres intérieures douces, boutons gonflés 3D tactiles | Interfaces de saisie rapide, commandes tactiles |
| **Glassmorphism** | Translucidité dépolie `backdrop-blur-xl`, liserés glacés fins | Mode présentation exécutive et animations de prestige |

---

## 5. PROTOCOLE DE VÉRIFICATION & QUALITÉ (ANTI-LAZINESS GATES)

L'agent Jules (Google) ainsi que tout contributeur de code sur ce projet doivent satisfaire **100% des barrières de qualité** suivantes avant validation d'un commit ou d'une PR :

1. 🚫 **Anti-Mock / Anti-Truncation Gate :**
   - Interdiction formelle de laisser des marqueurs de paresse du type `// TODO: Implement later`, `/* rest of code */`, ou `return <div />`.
   - Chaque bouton, formulaire, sélecteur ou modal doit posséder un gestionnaire d'événements réel connecté au store Zustand, à l'EventBus ou à IndexedDB.

2. 🛡️ **Strict TypeScript Compilation Gate :**
   - Exécution systématique de `npm run lint` (`tsc --noEmit`).
   - `noImplicitAny: true` respecté partout. Aucun cast permissif du type `(window as any)` sans typage d'interface explicite.

3. 📳 **Haptic & Feedback Consistency Gate :**
   - Tout déclenchement d'action importante (sauvegarde, validation, suppression, transition de statut) doit appeler `haptics.trigger(...)`.
   - Retour visuel immédiat en cas d'état de chargement via `LoadingSkeleton` ou `PulseIndicator`.

4. 🧪 **Non-Regression Build Gate :**
   - Le script `npm run build` doit compiler sans avertissement bloquant le client SPA Vite et le bundle serveur Node/Express `dist/server.cjs`.

---

## 6. FEUILLE DE ROUTE D'EXÉCUTION JULES (SPRINTS CHRONOLOGIQUES)

```
[SPRINT 1 : CORE DOMAINS INITIALIZATION]
├── Implémentation des 8 vues écrans dans /src/components/apps/
├── Enrichissement du bus d'événements (OMK_EVENTS)
└── Connexion du stockage offline LocalForage pour chaque domaine

[SPRINT 2 : WIDGETS & COMMAND PALETTE ENRICHMENT]
├── Création des 8 widgets spécialisés pour DynamicWidgetsGrid
├── Indexation complète des données métiers dans SearchIndexingService
└── Intégration des commandes vocales Web Speech pour les 8 domaines

[SPRINT 3 : FAST-MCP & BACKEND RECONCILIATION]
├── Finalisation des endpoints serveur dans server.ts
├── Simulation et passerelle de télémétrie MCP
└── Tests de charge et vérification de la persistance multi-workspaces
```

*Ce document fait foi de spécification technique officielle pour le développement autonome de **THE OMK MOBILE BACK OFFICE**.*
