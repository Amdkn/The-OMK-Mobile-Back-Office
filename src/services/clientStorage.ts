// Persistent Client Storage Service with JSON Schema and Workspace Isolation

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  dueDate: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface AIInsight {
  title: string;
  content: string;
  actionLabel: string;
}

export interface Client {
  id: string;
  name: string;
  mrr: number;
  status: 'active' | 'at-risk' | 'lead' | 'onboarding';
  healthScore: number;
  lastContact: string;
  industry: string;
  tier: 'Enterprise' | 'Growth' | 'Scale';
  sla: string;
  renewalDate: string;
  revenueHistory: RevenuePoint[];
  contacts: Contact[];
  projects: Project[];
  aiInsight?: AIInsight;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_CLIENTS: Client[] = [
  { 
    id: 'client-1', 
    name: 'Acme Corp', 
    mrr: 12500, 
    status: 'active', 
    healthScore: 94, 
    lastContact: 'Il y a 2h', 
    industry: 'Cloud & SaaS',
    tier: 'Enterprise',
    sla: '99.99% (SLA Or)',
    renewalDate: '15 Déc 2026',
    notes: 'Compte stratégique. Très satisfait du module BaaS Hub. Envisage un déploiement mondial.',
    revenueHistory: [
      { month: 'Jan', revenue: 9500 },
      { month: 'Fév', revenue: 10200 },
      { month: 'Mar', revenue: 11000 },
      { month: 'Avr', revenue: 12500 },
    ],
    contacts: [
      { id: 'c1', name: 'Alice Smith', role: 'Chief Executive Officer', email: 'alice@acme.co', phone: '+33 6 12 34 56 78' },
      { id: 'c2', name: 'Bob Jones', role: 'VP Engineering', email: 'bob@acme.co', phone: '+33 6 98 76 54 32' }
    ],
    projects: [
      { id: 'p1', name: 'Migration Infrastructure Cloud', status: 'in-progress', progress: 75, dueDate: '15 Jan 2027' },
      { id: 'p2', name: 'Audit de Sécurité SOC2', status: 'completed', progress: 100, dueDate: '01 Nov 2026' }
    ],
    aiInsight: {
      title: "Opportunité d'Expansion +$4k MRR",
      content: "L'utilisation de l'API Cognition a augmenté de 140% ce trimestre. Recommandation d'upsell vers le forfait Enterprise Uncapped.",
      actionLabel: 'Générer proposition commerciale'
    }
  },
  { 
    id: 'client-2', 
    name: 'Global Tech Industries', 
    mrr: 8400, 
    status: 'at-risk', 
    healthScore: 42, 
    lastContact: 'Il y a 3j', 
    industry: 'FinTech & Banking',
    tier: 'Enterprise',
    sla: '99.95% (SLA Argent)',
    renewalDate: '28 Fév 2027',
    notes: 'Signale des latences sur le cluster Francfort. Risque de désengagement si non résolu d\'ici 10 jours.',
    revenueHistory: [
      { month: 'Jan', revenue: 12000 },
      { month: 'Fév', revenue: 11000 },
      { month: 'Mar', revenue: 9500 },
      { month: 'Avr', revenue: 8400 },
    ],
    contacts: [
      { id: 'c3', name: 'Charlie Davis', role: 'Head of Infrastructure', email: 'cdavis@globaltech.com', phone: '+1 555-0200' },
      { id: 'c4', name: 'Emma Watson', role: 'Procurement Lead', email: 'ewatson@globaltech.com', phone: '+1 555-0201' }
    ],
    projects: [
      { id: 'p3', name: 'Refonte Pipeline de Données', status: 'on-hold', progress: 35, dueDate: '31 Déc 2026' },
      { id: 'p4', name: 'Optimisation Latence Francfort', status: 'in-progress', progress: 60, dueDate: '10 Nov 2026' }
    ],
    aiInsight: {
      title: 'Alerte Churn Critique (48h)',
      content: 'Baisse de 40% de l\'activité sur le dashboard. 2 tickets de latence non résolus. Lancer un call exécutif de synchronisation.',
      actionLabel: 'Organiser réunion de crise'
    }
  },
  { 
    id: 'client-3', 
    name: 'Nexus Dynamics AI', 
    mrr: 14200, 
    status: 'active', 
    healthScore: 98, 
    lastContact: 'Il y a 30m', 
    industry: 'Autonomous Systems',
    tier: 'Scale',
    sla: '99.99% (SLA Or)',
    renewalDate: '10 Août 2027',
    notes: 'Partenaire clé en IA. Consommation intensive des modèles de raisonnement distribué.',
    revenueHistory: [
      { month: 'Jan', revenue: 6000 },
      { month: 'Fév', revenue: 8500 },
      { month: 'Mar', revenue: 11200 },
      { month: 'Avr', revenue: 14200 },
    ],
    contacts: [
      { id: 'c5', name: 'Diana Prince', role: 'Co-Fondatrice & CTO', email: 'diana@nexus.ai', phone: '+1 555-0300' }
    ],
    projects: [
      { id: 'p5', name: 'Déploiement Ontologie Multi-Agents', status: 'in-progress', progress: 90, dueDate: '05 Déc 2026' }
    ],
    aiInsight: {
      title: 'Croissance Exceptionnelle (+136%)',
      content: 'Nexus Dynamics est en passe de devenir le 1er client en volume de requêtes. Prévoir un cluster dédié dans PaaS Pro.',
      actionLabel: 'Configurer noeud dédié'
    }
  },
  { 
    id: 'client-4', 
    name: 'Vortex Logistics', 
    mrr: 3200, 
    status: 'onboarding', 
    healthScore: 88, 
    lastContact: 'Il y a 1j', 
    industry: 'Logistique & Fret',
    tier: 'Growth',
    sla: '99.90% (SLA Standard)',
    renewalDate: '15 Oct 2027',
    notes: 'Phase d\'onboarding en cours. Intégration API des flottes de transport.',
    revenueHistory: [
      { month: 'Jan', revenue: 0 },
      { month: 'Fév', revenue: 1200 },
      { month: 'Mar', revenue: 2400 },
      { month: 'Avr', revenue: 3200 },
    ],
    contacts: [
      { id: 'c6', name: 'Marc Dupont', role: 'Directeur des Opérations', email: 'm.dupont@vortex.eu', phone: '+33 6 44 22 11 00' }
    ],
    projects: [
      { id: 'p6', name: 'Intégration Télématique API', status: 'in-progress', progress: 50, dueDate: '20 Nov 2026' }
    ],
    aiInsight: {
      title: 'Onboarding à 75% du jalon 1',
      content: 'Les webhooks de tracking sont fonctionnels. Il reste la validation des certificats SSL pour mise en production.',
      actionLabel: 'Valider les certificats'
    }
  }
];

const STORAGE_KEY_PREFIX = 'omk_clients_data_';

export class ClientStorageService {
  private static getKey(workspace = 'Sandbox'): string {
    return `${STORAGE_KEY_PREFIX}${workspace}`;
  }

  public static loadClients(workspace = 'Sandbox'): Client[] {
    if (typeof window === 'undefined') return DEFAULT_CLIENTS;
    try {
      const raw = localStorage.getItem(this.getKey(workspace));
      if (!raw) {
        this.saveClients(DEFAULT_CLIENTS, workspace);
        return DEFAULT_CLIENTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_CLIENTS;
    } catch (e) {
      console.error('Failed to load clients from localStorage:', e);
      return DEFAULT_CLIENTS;
    }
  }

  public static saveClients(clients: Client[], workspace = 'Sandbox'): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getKey(workspace), JSON.stringify(clients, null, 2));
    } catch (e) {
      console.error('Failed to save clients to localStorage:', e);
    }
  }

  public static addClient(newClientData: Omit<Client, 'id'>, workspace = 'Sandbox'): Client {
    const clients = this.loadClients(workspace);
    const newClient: Client = {
      ...newClientData,
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newClient, ...clients];
    this.saveClients(updated, workspace);
    return newClient;
  }

  public static updateClient(id: string, updates: Partial<Client>, workspace = 'Sandbox'): Client | null {
    const clients = this.loadClients(workspace);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedClient: Client = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    clients[index] = updatedClient;
    this.saveClients(clients, workspace);
    return updatedClient;
  }

  public static deleteClient(id: string, workspace = 'Sandbox'): boolean {
    const clients = this.loadClients(workspace);
    const filtered = clients.filter(c => c.id !== id);
    if (filtered.length === clients.length) return false;
    this.saveClients(filtered, workspace);
    return true;
  }

  public static exportJSON(workspace = 'Sandbox'): string {
    const clients = this.loadClients(workspace);
    return JSON.stringify({
      schemaVersion: '1.0.0',
      workspace,
      exportedAt: new Date().toISOString(),
      clients
    }, null, 2);
  }

  public static importJSON(jsonString: string, workspace = 'Sandbox'): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const clientArray: Client[] = Array.isArray(parsed) ? parsed : parsed.clients;
      if (!Array.isArray(clientArray)) {
        return { success: false, count: 0, error: 'Structure JSON invalide : tableau attendu.' };
      }

      // Validate mandatory fields
      const validated: Client[] = clientArray.map((c, i) => ({
        id: c.id || `client-${Date.now()}-${i}`,
        name: c.name || 'Client Sans Nom',
        mrr: Number(c.mrr) || 0,
        status: ['active', 'at-risk', 'lead', 'onboarding'].includes(c.status) ? c.status : 'active',
        healthScore: Number(c.healthScore) || 85,
        lastContact: c.lastContact || 'Récemment',
        industry: c.industry || 'Général',
        tier: ['Enterprise', 'Growth', 'Scale'].includes(c.tier) ? c.tier : 'Growth',
        sla: c.sla || '99.90% SLA',
        renewalDate: c.renewalDate || '31 Déc 2027',
        notes: c.notes || '',
        revenueHistory: Array.isArray(c.revenueHistory) ? c.revenueHistory : [],
        contacts: Array.isArray(c.contacts) ? c.contacts : [],
        projects: Array.isArray(c.projects) ? c.projects : [],
        aiInsight: c.aiInsight
      }));

      this.saveClients(validated, workspace);
      return { success: true, count: validated.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Erreur lors du parsing JSON.' };
    }
  }

  public static resetToDefaults(workspace = 'Sandbox'): Client[] {
    this.saveClients(DEFAULT_CLIENTS, workspace);
    return DEFAULT_CLIENTS;
  }
}
