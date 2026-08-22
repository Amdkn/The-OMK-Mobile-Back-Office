import localforage from 'localforage';
import { NoteItem, AppWidget, AppId } from '../types';
import { StickyNote, Plus, Tag, Check, Clock } from 'lucide-react';
import { ActivityService } from '../services/activityService';

// Dedicated localForage instance for Notes persistence
const notesStore = localforage.createInstance({
  name: 'OMK_Mobile_OS',
  storeName: 'notes_repository',
  description: 'Offline-first persistent storage for OMK Notes module'
});

const DEFAULT_NOTES: Record<string, NoteItem[]> = {
  Sandbox: [
    {
      id: 'note-sb-1',
      title: 'Cadrage IA & Gouvernance Multi-Agents',
      content: '1. Valider l’authentification Zero-Trust FIDO2 sur les nœuds Frankfurt.\n2. Établir le quota de tokens à 120k/min pour Coach AI.\n3. Rapprocher les métriques de trésorerie avec la règle des 5.',
      category: 'Stratégie',
      tags: ['IA', 'Zero-Trust', 'Priorités'],
      isPinned: true,
      color: 'emerald',
      workspace: 'Sandbox',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      updatedAt: Date.now() - 1000 * 60 * 15
    },
    {
      id: 'note-sb-2',
      title: 'Feedback Démo Apex Quantum Corp',
      content: 'Le CTO d’Apex Corp a validé le connecteur PaaS Pro. Prochaine étape : signature du contrat $42,000 MRR et provisionnement du cluster dédié.',
      category: 'Clients',
      tags: ['Apex', 'Deal', 'PaaS'],
      isPinned: true,
      color: 'blue',
      workspace: 'Sandbox',
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
      updatedAt: Date.now() - 1000 * 60 * 60 * 1
    },
    {
      id: 'note-sb-3',
      title: 'Idée : Widget Quick-Capture & Voix',
      content: 'Permettre la dictée vocale depuis la Dynamic Island ou le widget HomeScreen pour convertir instantanément un mémo vocal en action CRM.',
      category: 'Idées',
      tags: ['Product', 'SpeechAPI', 'UX'],
      isPinned: false,
      color: 'purple',
      workspace: 'Sandbox',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24
    }
  ],
  Development: [
    {
      id: 'note-dev-1',
      title: 'Checklist Déploiement Staging v2.4',
      content: '• Exécuter les migrations Drizzle/Firestore\n• Tester le failover Redis sur le cluster Frankfurt-02\n• Valider la compatibilité Web Speech API sous Safari iOS',
      category: 'Ops',
      tags: ['Staging', 'DevOps', 'Release'],
      isPinned: true,
      color: 'amber',
      workspace: 'Development',
      createdAt: Date.now() - 1000 * 60 * 180,
      updatedAt: Date.now() - 1000 * 60 * 45
    }
  ],
  Production: [
    {
      id: 'note-prod-1',
      title: 'Revue Trimestrielle Board & EBITDA',
      content: 'MRR franchi à $124.5k. Runway stabilisé à 18 mois. Présentation des comptes consolidés et des projections Q4 au comité de direction.',
      category: 'Finance',
      tags: ['Board', 'MRR', 'Audit'],
      isPinned: true,
      color: 'emerald',
      workspace: 'Production',
      createdAt: Date.now() - 1000 * 60 * 360,
      updatedAt: Date.now() - 1000 * 60 * 120
    }
  ]
};

export class NotesService {
  private static isInitialized = false;
  private static memoryCache: Record<string, NoteItem[]> = { ...DEFAULT_NOTES };

  public static async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      await notesStore.ready();
      this.isInitialized = true;
    } catch (e) {
      console.warn('NotesStore IndexedDB fallback', e);
    }
  }

  /**
   * Synchronous getter for search indexer
   */
  public static getNotesSync(workspace: string = 'Sandbox'): NoteItem[] {
    return this.memoryCache[workspace] || DEFAULT_NOTES[workspace] || DEFAULT_NOTES['Sandbox'];
  }

  /**
   * Load notes for a specific workspace with localForage fallback & initial seeding
   */
  public static async getNotes(workspace: string = 'Sandbox'): Promise<NoteItem[]> {
    await this.init();
    try {
      const stored = await notesStore.getItem<NoteItem[]>(`notes_${workspace}`);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        this.memoryCache[workspace] = stored;
        return stored;
      }
      // Seed default notes if empty
      const initial = DEFAULT_NOTES[workspace] || DEFAULT_NOTES['Sandbox'];
      this.memoryCache[workspace] = initial;
      await notesStore.setItem(`notes_${workspace}`, initial);
      return initial;
    } catch (e) {
      console.error(`Failed to load notes for ${workspace}:`, e);
      return DEFAULT_NOTES[workspace] || DEFAULT_NOTES['Sandbox'];
    }
  }

  /**
   * Save full list of notes for a workspace
   */
  public static async saveNotes(workspace: string, notes: NoteItem[]): Promise<void> {
    await this.init();
    this.memoryCache[workspace] = notes;
    try {
      await notesStore.setItem(`notes_${workspace}`, notes);
    } catch (e) {
      console.error(`Failed to save notes for ${workspace}:`, e);
    }
  }

  /**
   * Quick capture note helper
   */
  public static async createQuickNote(
    title: string,
    content: string,
    category: NoteItem['category'] = 'Général',
    tags: string[] = ['QuickCapture'],
    workspace: string = 'Sandbox',
    color: string = 'emerald'
  ): Promise<NoteItem> {
    const existing = await this.getNotes(workspace);
    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim() || 'Note Rapide',
      content: content.trim(),
      category,
      tags: tags.length ? tags : ['Note'],
      isPinned: true,
      color,
      workspace,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newNote, ...existing];
    await this.saveNotes(workspace, updated);

    // Register activity
    ActivityService.log(
      'notes',
      'Notes OS',
      `Nouvelle note capturée : "${newNote.title}"`,
      'edit',
      newNote.category
    );

    return newNote;
  }

  /**
   * Update existing note
   */
  public static async updateNote(workspace: string, note: NoteItem): Promise<NoteItem[]> {
    const existing = await this.getNotes(workspace);
    const updated = existing.map(n => n.id === note.id ? { ...note, updatedAt: Date.now() } : n);
    await this.saveNotes(workspace, updated);
    return updated;
  }

  /**
   * Delete note
   */
  public static async deleteNote(workspace: string, noteId: string): Promise<NoteItem[]> {
    const existing = await this.getNotes(workspace);
    const updated = existing.filter(n => n.id !== noteId);
    await this.saveNotes(workspace, updated);
    return updated;
  }

  /**
   * Search notes matching query
   */
  public static async searchNotes(workspace: string, query: string): Promise<NoteItem[]> {
    const notes = await this.getNotes(workspace);
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  /**
   * Generate AppWidget summary representation for HomeScreen & WidgetRegistry
   */
  public static async getAppWidget(workspace: string = 'Sandbox'): Promise<AppWidget> {
    const notes = await this.getNotes(workspace);
    const pinnedCount = notes.filter(n => n.isPinned).length;
    const latestNote = notes[0];

    return {
      id: 'widget-notes-quickcapture',
      appId: 'notes' as AppId,
      title: 'Notes & Capture',
      category: 'Productivité',
      size: 'small',
      value: `${notes.length} Notes`,
      subValue: latestNote ? `Dernière : ${latestNote.title.slice(0, 20)}...` : 'Quick capture active',
      icon: StickyNote,
      accentColor: 'emerald',
      badge: `${pinnedCount} Épinglées`,
      updatedAt: latestNote ? 'Sync locale' : 'Prêt',
      trend: 'up',
      trendValue: '+1 auj.',
      isPinned: true
    };
  }
}
