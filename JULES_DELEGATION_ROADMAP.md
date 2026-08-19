# 🗺️ OMK Mobile OS - Roadmap Architecturale & Délégation (Jules AI)

Ce document est le Master Plan pour **Jules.google**. Il corrige et approfondit la vision du **OMK Mobile OS** : il ne s'agit pas d'une simple interface responsive, mais d'un **Edge Client AI-Native** connecté au puissant écosystème *OMK Desktop OS*.

L'OS Desktop repose sur une architecture d'**Agents Autonomes** communiquant via **8 Adaptateurs (MCP, API, CLI, Harness, etc.)**. Le Mobile OS doit agir comme la télécommande exécutive de cette infrastructure complexe.

---

## 🏗️ 1. ARCHITECTURE BACK-END & AI-NATIVE CORE (Les 8 Adaptateurs)
*Le Mobile OS n'exécute pas les commandes lourdes localement. Il s'interface avec le Back-End AI-Native de l'écosystème via des WebSockets et tRPC.*

- [ ] **1.1. Intégration du MCP (Model Context Protocol)** : Connecter le Mobile OS au serveur MCP central. L'IA sur mobile doit pouvoir requêter les outils du back-end (lire des fichiers, exécuter des scripts) via l'adaptateur MCP.
- [ ] **1.2. Monitoring des Adaptateurs (Dashboard Mobile)** : Créer une vue `System Monitor` pour surveiller le statut des 8 adaptateurs (API Gateway, CLI Runner, MCP Server, Data Harness, etc.) en temps réel.
- [ ] **1.3. State Management Distribué** : Utiliser un store synchronisé (ex: Zustand + WebSockets) pour que l'état de l'OS (Agents actifs, Tâches en fond) soit le même sur Mobile et sur Desktop.

## 📱 2. BUSINESS DOMAIN APPS (Transposition Desktop -> Mobile)
*Le Desktop OS possède plus de 20 applications spécialisées. Le Mobile OS doit les organiser via un App Drawer ou une pagination intelligente (Swipe left/right sur le Springboard).*

- [ ] **2.1. Implémenter le Core Business Grid** : Développer les vues mobiles pour :
  - 📊 `Dashboard` & `Macro` (Vue d'ensemble exécutive)
  - 💼 `Finance`, `Legal`, `Operations` (Les piliers de l'entreprise)
  - 🤝 `Sales OS`, `Clients`, `Growth` (Le moteur de revenus)
  - ⚙️ `IT / R&D`, `Product`, `SaaS Builder` (Le moteur technologique)
  - 🧠 `Ontology`, `Cognition`, `Design` (La mémoire et l'identité de l'entreprise)
  - 👥 `People / HR`, `Tasks` (La gestion humaine et opérationnelle)
- [ ] **2.2. Standardisation des Vues (AppShell)** : Créer un composant `MobileAppShell` qui standardise le header (bouton retour) et le layout de chaque application métier pour accélérer la création des 20+ vues.

## 🎨 3. PERSONNALISATION : THÈMES, WALLPAPERS & UI SYSTEM
*Le Desktop brille par ses thèmes (Warm Paper, Dark OLED, Cyberpunk, Glassmorphism, etc.). Le Mobile OS doit hériter de cette richesse visuelle.*

- [ ] **3.1. Composant `Settings.tsx` (Personnalisation)** : Créer l'application Réglages.
- [ ] **3.2. Moteur de Thèmes Global** : Implémenter un ThemeProvider supportant exactement les thèmes du Desktop (ex: modifier dynamiquement les variables CSS Tailwind pour `Warm Paper` (clair/beige), `Dark OLED` (noir absolu), `Cyberpunk` (néon), `Neumorphism`, `Glassmorphism`, `Brutalism`, etc.).
- [ ] **3.3. Gestionnaire de Fonds d'Écran (Wallpapers)** : Permettre de changer l'image de fond du `PhoneChassis` et du `LockScreen`. Créer un effet Parallax subtil avec `framer-motion` lors du défilement du Springboard.

## 🤖 4. MULTI-AGENTS & AVATARS
*L'IA n'est pas qu'un chat textuel, elle a des visages et des personnalités ("Agents: 3" avec le Chien, le Chat, le Trombone).*

- [ ] **4.1. L'Agent Hub (Overlay Mobile)** : Remplacer l'approche Desktop (avatars flottants partout sur l'écran) par une approche mobile. Créer un volet coulissant (depuis le bas) appelé `Agent Hub` où vivent les différents avatars.
- [ ] **4.2. Voix & TTS (Text-to-Speech)** : Intégrer l'adaptateur de Voix (comme vu dans le header Desktop "VOIX"). Les avatars doivent pouvoir parler (API ElevenLabs ou OpenAI TTS) avec une visualisation d'onde audio (Audio Waveform) dans la Dynamic Island.
- [ ] **4.3. Avatars Interactifs 2D/3D** : Intégrer des rendus optimisés pour mobile des entités (Chien 3D, Chat 2D) qui réagissent aux événements de l'OS (ex: le chien apparaît avec une notification "Serveur Down").

---

### 📝 Directives pour Jules.google (Exécution)

1. **Priorité 1 : Le Moteur de Thèmes & Wallpapers**. Avant de coder les 20 applications, assure-toi que l'infrastructure UI (Zustand + Tailwind CSS Variables) permet de switcher de `Dark OLED` à `Warm Paper` instantanément.
2. **Priorité 2 : Le Modèle de Données (Backend)**. Analyse le repository Desktop pour comprendre comment le MCP et les Adaptateurs sont exposés (REST ? GraphQL ? tRPC ?). Crée des hooks clients mockés (ex: `useMCPClient()`) prêts à être branchés.
3. **Priorité 3 : Architecture Modulaire**. Chaque application (Finance, Legal, Cognition...) DOIT avoir son propre dossier dans `/src/components/apps/` avec son propre typage, isolant ainsi la complexité.
