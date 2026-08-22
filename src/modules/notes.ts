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
  private static pendingFlushPromises: Record<string, Promise<void> | null> = {};

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
   * Robust Validation and Sanitization layer to ensure 100% data integrity before IndexedDB write
   */
  public static validateAndSanitizeNote(raw: any, defaultWorkspace: string = 'Sandbox'): NoteItem {
    const validCategories: NoteItem['category'][] = ['Stratégie', 'Finance', 'Clients', 'Ops', 'Idées', 'Général'];
    const id = typeof raw?.id === 'string' && raw.id.trim().length > 0 
      ? raw.id.trim() 
      : `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const title = typeof raw?.title === 'string' ? raw.title.trim() : 'Note Sans Titre';
    const content = typeof raw?.content === 'string' ? raw.content : '';
    const category = validCategories.includes(raw?.category) ? raw.category : 'Général';
    const tags = Array.isArray(raw?.tags) 
      ? raw.tags.filter((t: any) => typeof t === 'string' && t.trim().length > 0).map((t: string) => t.trim()) 
      : ['Note'];
    const isPinned = Boolean(raw?.isPinned);
    const color = typeof raw?.color === 'string' && raw.color.length > 0 ? raw.color : 'emerald';
    const workspace = typeof raw?.workspace === 'string' && raw.workspace.length > 0 ? raw.workspace : defaultWorkspace;
    const createdAt = typeof raw?.createdAt === 'number' && !isNaN(raw.createdAt) ? raw.createdAt : Date.now();
    const updatedAt = typeof raw?.updatedAt === 'number' && !isNaN(raw.updatedAt) ? raw.updatedAt : Date.now();

    return {
      id,
      title: title || 'Note Sans Titre',
      content,
      category,
      tags: tags.length > 0 ? tags : ['Note'],
      isPinned,
      color,
      workspace,
      createdAt,
      updatedAt
    };
  }

  public static validateAndSanitizeList(rawList: unknown, workspace: string): NoteItem[] {
    if (!Array.isArray(rawList)) return [];
    return rawList
      .filter(item => item !== null && typeof item === 'object')
      .map(item => this.validateAndSanitizeNote(item, workspace));
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
      const stored = await notesStore.getItem<unknown>(`notes_${workspace}`);
      if (stored !== null && stored !== undefined && Array.isArray(stored)) {
        const validated = this.validateAndSanitizeList(stored, workspace);
        this.memoryCache[workspace] = validated;
        return validated;
      }
      // Seed default notes if completely uninitialized (null/undefined)
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
   * Save full list of notes for a workspace with validation and guaranteed serialization
   */
  public static async saveNotes(workspace: string, notes: NoteItem[]): Promise<void> {
    await this.init();
    const sanitized = this.validateAndSanitizeList(notes, workspace);
    this.memoryCache[workspace] = sanitized;

    // Test serialization before committing to persistent storage
    try {
      const serialized = JSON.parse(JSON.stringify(sanitized));
      const writePromise = notesStore.setItem(`notes_${workspace}`, serialized).then(() => {
        this.pendingFlushPromises[workspace] = null;
      });
      this.pendingFlushPromises[workspace] = writePromise;
      await writePromise;

      // Dispatch custom event for immediate cross-component reactivity
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('omk:notes_updated', { detail: { workspace, count: sanitized.length } }));
      }
    } catch (e) {
      console.error(`Failed to save validated notes for ${workspace}:`, e);
      throw e;
    }
  }

  /**
   * Guarantee all pending writes are flushed before closing views
   */
  public static async flushPendingSaves(workspace: string): Promise<boolean> {
    try {
      const pending = this.pendingFlushPromises[workspace];
      if (pending) {
        await pending;
      }
      // Ensure memoryCache is flushed to disk
      if (this.memoryCache[workspace]) {
        await this.saveNotes(workspace, this.memoryCache[workspace]);
      }
      return true;
    } catch (e) {
      console.error('Error flushing notes storage:', e);
      return false;
    }
  }

  /**
   * Export all notes for a workspace as formatted JSON
   */
  public static async exportJSON(workspace: string): Promise<string> {
    const notes = await this.getNotes(workspace);
    return JSON.stringify(notes, null, 2);
  }

  /**
   * Export all notes as a combined Markdown document
   */
  public static async exportMarkdown(workspace: string): Promise<string> {
    const notes = await this.getNotes(workspace);
    let md = `# OMK Notes & Capture — Workspace: ${workspace}\n`;
    md += `*Exporté le : ${new Date().toLocaleString('fr-FR')}*\n\n---\n\n`;

    notes.forEach((note, idx) => {
      md += `## ${idx + 1}. ${note.title}\n`;
      md += `**Catégorie :** ${note.category} | **Statut :** ${note.isPinned ? 'Épinglée' : 'Standard'} | **Mis à jour :** ${new Date(note.updatedAt).toLocaleString('fr-FR')}\n`;
      if (note.tags && note.tags.length > 0) {
        md += `**Tags :** \`${note.tags.join('`, `')}\`\n\n`;
      }
      md += `${note.content}\n\n---\n\n`;
    });

    return md;
  }

  /**
   * Import notes from JSON string or array, merging or replacing with valid schema checking
   */
  public static async importNotes(workspace: string, jsonString: string, merge: boolean = true): Promise<NoteItem[]> {
    try {
      const parsed = JSON.parse(jsonString);
      const incoming: NoteItem[] = Array.isArray(parsed) ? parsed : [parsed];
      
      const validated: NoteItem[] = incoming.map((item, idx) => ({
        id: item.id || `imported-${Date.now()}-${idx}`,
        title: item.title || 'Note Importée',
        content: item.content || '',
        category: (item.category as any) || 'Général',
        tags: Array.isArray(item.tags) ? item.tags : ['Importé'],
        isPinned: Boolean(item.isPinned),
        color: item.color || 'emerald',
        workspace,
        createdAt: item.createdAt || Date.now(),
        updatedAt: Date.now()
      }));

      let result: NoteItem[];
      if (merge) {
        const existing = await this.getNotes(workspace);
        const existingIds = new Set(existing.map(n => n.id));
        const filteredNew = validated.filter(n => !existingIds.has(n.id));
        result = [...filteredNew, ...existing];
      } else {
        result = validated;
      }

      await this.saveNotes(workspace, result);
      return result;
    } catch (e) {
      console.error('Failed to import notes:', e);
      throw new Error('Format de fichier invalide. Veuillez importer un fichier JSON valide.');
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
