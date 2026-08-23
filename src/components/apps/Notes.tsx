import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  StickyNote, Plus, Search, Pin, Trash2, Tag, Sparkles, 
  Check, Filter, Calendar, Folder, ArrowRight, Share2, Edit3, X, Copy, Save,
  Download, Upload, FileText, AlertCircle, Clock, ShieldCheck, Activity,
  CheckCircle2, RefreshCw, Layers, Database, ArrowUpRight, Hash, Eye, BookOpen,
  SlidersHorizontal, CheckSquare
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard, KPIItem } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';
import { useOSStore } from '../../store/osStore';
import { NotesService, NoteTransactionLogEntry } from '../../modules/notes';
import { NoteItem } from '../../types';
import { haptics } from '../../services/haptics';
import ConfirmationModal from '../ConfirmationModal';

const CATEGORIES: Array<NoteItem['category']> = ['Stratégie', 'Finance', 'Ops', 'Clients', 'Idées', 'Général'];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string; dot: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' }
};

export default function NotesApp() {
  const { workspace } = useOSStore();
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Note edit in Drawer state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoteItem['category']>('Stratégie');
  const [editTags, setEditTags] = useState('');
  const [editColor, setEditColor] = useState('emerald');
  const [drawerActiveTab, setDrawerActiveTab] = useState<'editor' | 'preview' | 'ai' | 'meta'>('editor');

  // Confirmation Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteId: string | null;
    noteTitle: string;
  }>({
    isOpen: false,
    noteId: null,
    noteTitle: ''
  });

  // Quick Capture Modal State
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickCategory, setQuickCategory] = useState<NoteItem['category']>('Stratégie');
  const [quickTagInput, setQuickTagInput] = useState('');
  const [quickColor, setQuickColor] = useState('emerald');
  const [quickIsPinned, setQuickIsPinned] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isQuickCaptureOpen) setIsQuickCaptureOpen(false);
        else if (deleteModal.isOpen) setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
        else if (selectedNote) setSelectedNote(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickCaptureOpen, deleteModal.isOpen, selectedNote]);

  // Sync state when a note is selected for Drawer
  const handleSelectNote = (note: NoteItem) => {
    haptics.trigger('selection');
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setEditTags(note.tags.join(', '));
    setEditColor(note.color || 'emerald');
    setDrawerActiveTab('editor');
  };

  // Load notes on mount and workspace changes
  useEffect(() => {
    let isMounted = true;
    const loadNotes = () => {
      NotesService.getNotes(workspace).then(data => {
        if (isMounted) {
          setNotes(data);
        }
      });
    };

    loadNotes();

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.workspace === workspace) {
        loadNotes();
      }
    };

    window.addEventListener('omk:notes_updated', handleCustomUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('omk:notes_updated', handleCustomUpdate);
      NotesService.flushPendingSaves(workspace);
    };
  }, [workspace]);

  // Keep selectedNote synchronized if notes change
  useEffect(() => {
    if (selectedNote) {
      const fresh = notes.find(n => n.id === selectedNote.id);
      if (fresh) {
        setSelectedNote(fresh);
      }
    }
  }, [notes]);

  const handleExportJSON = async () => {
    haptics.trigger('selection');
    try {
      const jsonStr = await NotesService.exportJSON(workspace);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omk-notes-${workspace.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export JSON téléchargé avec succès');
    } catch {
      showToast('Erreur lors de l\'export JSON');
    }
  };

  const handleExportMarkdown = async () => {
    haptics.trigger('selection');
    try {
      const mdStr = await NotesService.exportMarkdown(workspace);
      const blob = new Blob([mdStr], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omk-notes-${workspace.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export Markdown téléchargé avec succès');
    } catch {
      showToast('Erreur lors de l\'export Markdown');
    }
  };

  const handleExportSingleNoteMD = (note: NoteItem) => {
    haptics.trigger('selection');
    try {
      let md = `# ${note.title}\n\n`;
      md += `*Catégorie : ${note.category} | Tags : ${note.tags.join(', ')} | Mis à jour le : ${new Date(note.updatedAt).toLocaleString('fr-FR')}*\n\n---\n\n`;
      md += `${note.content}\n`;

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Note "${note.title}" exportée en Markdown`);
    } catch {
      showToast('Erreur lors de l\'export de la note');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    haptics.trigger('medium');

    try {
      const text = await file.text();
      let updated: NoteItem[];

      if (file.name.endsWith('.json')) {
        updated = await NotesService.importNotes(workspace, text, true);
      } else {
        const title = file.name.replace(/\.[^/.]+$/, '');
        await NotesService.createQuickNote(title, text, 'Général', ['FichierImporté'], workspace, 'emerald');
        updated = await NotesService.getNotes(workspace);
      }

      setNotes(updated);
      showToast(`Fichier "${file.name}" importé avec succès (${updated.length} notes)`);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de l\'importation');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveDrawerNote = async () => {
    if (!selectedNote) return;
    haptics.trigger('success');
    const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedNote: NoteItem = {
      ...selectedNote,
      title: editTitle.trim() || 'Sans titre',
      content: editContent.trim(),
      category: editCategory,
      tags: tags.length ? tags : ['Note'],
      color: editColor,
      updatedAt: Date.now()
    };
    const updatedList = await NotesService.updateNote(workspace, updatedNote);
    setNotes(updatedList);
    setSelectedNote(updatedNote);
    showToast(`Note "${updatedNote.title}" mise à jour`);
  };

  const handleSaveQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() && !quickContent.trim()) return;

    haptics.trigger('success');
    const tags = quickTagInput.split(',').map(t => t.trim()).filter(Boolean);
    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: quickTitle.trim() || 'Note Sans Titre',
      content: quickContent.trim(),
      category: quickCategory,
      tags: tags.length ? tags : ['Note'],
      isPinned: quickIsPinned,
      color: quickColor,
      workspace,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const existing = await NotesService.getNotes(workspace);
    const updated = [newNote, ...existing];
    await NotesService.saveNotes(workspace, updated, 'CREATE');

    setNotes(updated);
    setQuickTitle('');
    setQuickContent('');
    setQuickTagInput('');
    setQuickIsPinned(false);
    setIsQuickCaptureOpen(false);
    showToast(`Note "${newNote.title}" enregistrée`);
  };

  const handleTogglePin = async (note: NoteItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.trigger('light');
    const updated = { ...note, isPinned: !note.isPinned, updatedAt: Date.now() };
    const list = await NotesService.updateNote(workspace, updated);
    setNotes(list);
    if (selectedNote?.id === note.id) setSelectedNote(updated);
    showToast(updated.isPinned ? `Note "${note.title}" épinglée` : `Note "${note.title}" détachée`);
  };

  const handlePromptDeleteNote = (note: { id: string; title: string }, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.trigger('light');
    setDeleteModal({
      isOpen: true,
      noteId: note.id,
      noteTitle: note.title || 'Note sans titre'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.noteId) return;
    const noteId = deleteModal.noteId;
    haptics.trigger('warning');
    const list = await NotesService.deleteNote(workspace, noteId);
    setNotes(list);
    if (selectedNote?.id === noteId) setSelectedNote(null);
    setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
    showToast('Note supprimée de la base locale');
  };

  const handleCopyNote = async (note: NoteItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.trigger('selection');
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Texte de la note copié');
    } catch {
      showToast('Presse-papiers non disponible');
    }
  };

  const handleAppendAISummary = () => {
    if (!selectedNote) return;
    haptics.trigger('medium');
    const summaryBlock = `\n\n### ⚡ Synthèse Stratégique Coach AI\n• **Objectif clé :** Traiter les priorités associées à ${selectedNote.category}.\n• **Action recommandée :** Valider les jalons opérationnels sous 48h.\n• **Statut d'alignement :** 100% cohérent avec la vision Q4.`;
    const newContent = selectedNote.content + summaryBlock;
    setEditContent(newContent);
    const updatedNote: NoteItem = {
      ...selectedNote,
      content: newContent,
      updatedAt: Date.now()
    };
    NotesService.updateNote(workspace, updatedNote).then(updatedList => {
      setNotes(updatedList);
      setSelectedNote(updatedNote);
      showToast('Synthèse Coach AI injectée dans la note');
    });
  };

  // Filtered lists
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesCategory = selectedCategory === 'Tous' || note.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [notes, selectedCategory, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes]);
  const allPinnedNotes = useMemo(() => notes.filter(n => n.isPinned), [notes]);

  // Dynamic Navigation Tabs
  const NOTES_TABS = [
    { id: 'notes', label: 'Toutes', icon: StickyNote, badge: notes.length },
    { id: 'pinned', label: 'Épinglées', icon: Pin, badge: allPinnedNotes.length, badgeColor: 'bg-emerald-500 text-slate-950' },
    { id: 'categories', label: 'Catégories', icon: Folder, badge: CATEGORIES.length },
    { id: 'journal', label: 'Audit & Sync', icon: Database, badge: 'IndexedDB' }
  ];

  // Helper for note metrics
  const wordCount = selectedNote ? selectedNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = selectedNote ? selectedNote.content.split('\n').length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Segmented App Navigation */}
      <AppTopNav
        tabs={NOTES_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* TAB 1: ALL NOTES */}
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Notes & Mémoires"
                subtitle={`Base de connaissances offline-first sécurisée • ${workspace}`}
                badge={`${notes.length} Notes`}
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                icon={StickyNote}
                kpis={[
                  { label: 'Total Notes', value: notes.length, sub: `Partition ${workspace}`, trend: 'up' },
                  { label: 'Épinglées', value: allPinnedNotes.length, sub: 'Priorité active' },
                  { label: 'Catégories', value: new Set(notes.map(n => n.category)).size, sub: 'Structures' }
                ]}
                actions={
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportFile}
                      accept=".json,.md,.txt"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Importer un fichier (.json, .md, .txt)"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Upload size={13} />
                      <span className="hidden sm:inline">Importer</span>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      title="Exporter en Markdown"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                    >
                      <FileText size={13} />
                      <span className="hidden sm:inline">MD</span>
                    </button>
                    <button
                      onClick={() => {
                        haptics.trigger('selection');
                        setIsQuickCaptureOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Capturer</span>
                    </button>
                  </div>
                }
              >
                {/* AI Knowledge Insight Card */}
                <AIInsightCard
                  title="Coach AI • Synthèse Mémoire Active"
                  content={`Vos ${notes.length} notes sont synchronisées en local via IndexedDB Zero-Trust. Les notes prioritaires consolident les objectifs du Sprint et les closing deals.`}
                  actionLabel="Filtrer les notes stratégiques"
                  onAction={() => {
                    haptics.trigger('light');
                    setSelectedCategory('Stratégie');
                  }}
                />

                {/* Search & Category Filter Pills */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par mot-clé, titre, tag ou contenu..."
                      className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                    {['Tous', ...CATEGORIES].map(cat => {
                      const count = cat === 'Tous' ? notes.length : notes.filter(n => n.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            haptics.trigger('selection');
                            setSelectedCategory(cat);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                            selectedCategory === cat
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] opacity-60 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3 pt-1">
                  {filteredNotes.length === 0 ? (
                    <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
                      <StickyNote size={28} className="mx-auto mb-2 text-slate-500 opacity-60" />
                      <p className="text-xs font-medium text-slate-300">Aucune note trouvée</p>
                      <p className="text-[11px] text-slate-500 mt-1">Créez votre première note avec Quick Capture</p>
                      <button
                        onClick={() => setIsQuickCaptureOpen(true)}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md hover:bg-emerald-400"
                      >
                        + Nouvelle Note
                      </button>
                    </div>
                  ) : (
                    filteredNotes.map(note => (
                      <DetailCard
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        isInteractive
                        title={note.title}
                        badge={note.category}
                        badgeColor={COLOR_MAP[note.color || 'emerald']?.badge || 'bg-slate-950 text-slate-300 border-slate-800'}
                        icon={StickyNote}
                        subtitle={`${new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} • ${note.tags.join(', ')}`}
                        actions={
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleCopyNote(note)}
                              title="Copier le contenu"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              {copiedId === note.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                            <button
                              onClick={(e) => handleTogglePin(note, e)}
                              title={note.isPinned ? 'Détacher' : 'Épingler'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                note.isPinned ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              <Pin size={13} className={note.isPinned ? 'fill-emerald-400' : ''} />
                            </button>
                          </div>
                        }
                      >
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pt-1 font-mono">
                          {note.content}
                        </p>
                        <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${COLOR_MAP[note.color || 'emerald']?.dot || 'bg-emerald-400'}`} />
                            <span>{note.tags.length} tag{note.tags.length > 1 ? 's' : ''}</span>
                          </span>
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            Inspecter note & Markdown →
                          </span>
                        </div>
                      </DetailCard>
                    ))
                  )}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: PINNED NOTES */}
          {activeTab === 'pinned' && (
            <motion.div
              key="pinned"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Notes Épinglées & Prioritaires"
                subtitle="Éléments à forte valeur ajoutée maintenus en haut de pile"
                badge={`${allPinnedNotes.length} Prioritaires`}
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                icon={Pin}
                kpis={[
                  { label: 'Notes Épinglées', value: allPinnedNotes.length, sub: 'Priorité P1' },
                  { label: 'Ratio Focus', value: `${notes.length ? Math.round((allPinnedNotes.length / notes.length) * 100) : 0}%`, sub: 'Des notes totales', trend: 'up' },
                  { label: 'Dernière Maj', value: allPinnedNotes[0] ? new Date(allPinnedNotes[0].updatedAt).toLocaleDateString('fr-FR') : 'N/A', sub: 'Plus récent' }
                ]}
              >
                <div className="space-y-3">
                  {allPinnedNotes.length === 0 ? (
                    <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
                      <Pin size={28} className="mx-auto mb-2 text-slate-500 opacity-60" />
                      <p className="text-xs font-medium text-slate-300">Aucune note épinglée</p>
                      <p className="text-[11px] text-slate-500 mt-1">Épingler une note pour l'afficher dans ce cockpit prioritaire</p>
                    </div>
                  ) : (
                    allPinnedNotes.map(note => (
                      <DetailCard
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        isInteractive
                        title={note.title}
                        badge="Priorité P1"
                        badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                        icon={Pin}
                        subtitle={`Catégorie : ${note.category} • ${note.tags.join(', ')}`}
                      >
                        <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed pt-1 font-mono">
                          {note.content}
                        </p>
                        <div className="flex justify-between items-center pt-2.5 text-xs">
                          <span className="text-[11px] text-slate-400">
                            Mis à jour : <strong className="text-slate-200">{new Date(note.updatedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong>
                          </span>
                          <span className="text-emerald-400 text-[11px] font-medium">Ouvrir tiroir d'édition →</span>
                        </div>
                      </DetailCard>
                    ))
                  )}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Explorateur par Catégories"
                subtitle="Organisation thématique et classification sémantique"
                badge={`${CATEGORIES.length} Catégories`}
                icon={Folder}
                kpis={[
                  { label: 'Catégories', value: CATEGORIES.length, sub: 'Structures prédéfinies' },
                  { label: 'Densité Max', value: Math.max(...CATEGORIES.map(c => notes.filter(n => n.category === c).length), 0), sub: 'Notes dans la + dense' },
                  { label: 'Index Tags', value: new Set(notes.flatMap(n => n.tags)).size, sub: 'Tags uniques' }
                ]}
              >
                <div className="space-y-3">
                  {CATEGORIES.map(cat => {
                    const catNotes = notes.filter(n => n.category === cat);
                    const catTags = Array.from(new Set(catNotes.flatMap(n => n.tags))).slice(0, 4);

                    return (
                      <DetailCard
                        key={cat}
                        title={cat}
                        badge={`${catNotes.length} note${catNotes.length > 1 ? 's' : ''}`}
                        badgeColor={catNotes.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}
                        icon={Folder}
                        isInteractive
                        onClick={() => {
                          haptics.trigger('selection');
                          setSelectedCategory(cat);
                          setActiveTab('notes');
                        }}
                      >
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Tags associés :</span>
                            <div className="flex items-center gap-1">
                              {catTags.length > 0 ? catTags.map((t, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                                  #{t}
                                </span>
                              )) : <span className="text-[10px] text-slate-600">Aucun tag</span>}
                            </div>
                          </div>

                          {catNotes.length > 0 && (
                            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                              {catNotes.slice(0, 3).map(n => (
                                <div
                                  key={n.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectNote(n);
                                  }}
                                  className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 flex items-center justify-between cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-200 truncate">{n.title}</span>
                                  </div>
                                  <span className="text-[10px] text-emerald-400 shrink-0">Inspecter →</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DetailCard>
                    );
                  })}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: AUDIT & SYNC */}
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Intégrité des Données & Persistance"
                subtitle="Journal de transactions IndexedDB et résilience hors-ligne"
                badge="100% Local"
                badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/30"
                icon={Database}
                kpis={[
                  { label: 'Moteur Persistance', value: 'IndexedDB', sub: 'localForage Zero-Trust' },
                  { label: 'Espace Alloué', value: `${(JSON.stringify(notes).length / 1024).toFixed(1)} KB`, sub: 'Poids payload JSON' },
                  { label: 'Disponibilité', value: '100% Offline', sub: 'Service Worker ready' }
                ]}
              >
                <div className="space-y-3">
                  <DetailCard
                    title="Sauvegardes Globales & Export"
                    badge="Export Multi-Formats"
                    badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                    icon={Download}
                  >
                    <div className="space-y-2 pt-1 text-xs">
                      <p className="text-slate-300 leading-relaxed">
                        Exportez l'intégralité de vos notes chiffrées en un instant pour vos sauvegardes cloud ou archivage froid.
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={handleExportJSON}
                          className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download size={13} className="text-emerald-400" />
                          <span>Export JSON Brut</span>
                        </button>
                        <button
                          onClick={handleExportMarkdown}
                          className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <FileText size={13} className="text-blue-400" />
                          <span>Export Markdown Global</span>
                        </button>
                      </div>
                    </div>
                  </DetailCard>

                  <DetailCard
                    title="État du Schéma & Sérialisation"
                    badge="Valide"
                    badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                    icon={ShieldCheck}
                  >
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Partition Workspace :</span>
                        <span className="font-mono text-emerald-400">{workspace}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Protocole Transactionnel :</span>
                        <span className="font-mono text-slate-200">Atomic Queue & Checksum SHA</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Reactivité Événementielle :</span>
                        <span className="font-mono text-emerald-400">omk:notes_updated (Broadcast)</span>
                      </div>
                    </div>
                  </DetailCard>
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAIL DRAWER FOR SELECTED NOTE */}
      <DetailDrawer
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={selectedNote?.title || 'Détail de la Note'}
        subtitle={`Mis à jour le ${selectedNote ? new Date(selectedNote.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''} • Partition ${selectedNote?.workspace}`}
        badge={selectedNote?.category || 'Général'}
        badgeColor={COLOR_MAP[selectedNote?.color || 'emerald']?.badge || 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
        avatarText={selectedNote?.title?.charAt(0).toUpperCase() || 'N'}
        breadcrumbs={[
          { label: 'Notes OS', onClick: () => setSelectedNote(null) },
          { label: selectedNote?.category || 'Catégorie', onClick: () => { setSelectedCategory(selectedNote?.category || 'Tous'); setSelectedNote(null); } },
          { label: selectedNote?.title || 'Fiche' }
        ]}
        actions={[
          {
            id: 'pin',
            label: selectedNote?.isPinned ? 'Détacher' : 'Épingler',
            icon: Pin,
            variant: selectedNote?.isPinned ? 'primary' : 'default',
            onClick: () => {
              if (selectedNote) handleTogglePin(selectedNote);
            }
          },
          {
            id: 'copy',
            label: 'Copier Texte',
            icon: Copy,
            onClick: () => {
              if (selectedNote) handleCopyNote(selectedNote);
            }
          },
          {
            id: 'export-md',
            label: 'Exporter MD',
            icon: Download,
            onClick: () => {
              if (selectedNote) handleExportSingleNoteMD(selectedNote);
            }
          },
          {
            id: 'delete',
            label: 'Supprimer',
            icon: Trash2,
            variant: 'danger',
            onClick: () => {
              if (selectedNote) handlePromptDeleteNote(selectedNote);
            }
          }
        ]}
        kpis={[
          { label: 'Mots & Lignes', value: `${wordCount} mots`, sub: `${lineCount} ligne${lineCount > 1 ? 's' : ''}` },
          { label: 'Poids Caractères', value: `${selectedNote?.content.length || 0}`, sub: 'UTF-8 Bytes' },
          { label: 'Lecture Est.', value: `${readingTime} min`, sub: '200 mots/min' },
          { label: 'Priorité & Tags', value: selectedNote?.isPinned ? 'Épinglée ⭐' : 'Standard', sub: `${selectedNote?.tags.length || 0} tag(s)` }
        ]}
        aiInsight={{
          title: 'Coach AI • Analyseur Sémantique',
          content: selectedNote 
            ? `Cette note de type ${selectedNote.category} contient ${wordCount} mots. Le Coach suggère d'extraire des tâches pour le sprint en cours.`
            : 'Diagnostic automatique en cours...',
          actionLabel: 'Injecter synthèse exécutrice Coach AI',
          onAction: handleAppendAISummary
        }}
        tabs={[
          {
            id: 'editor',
            label: 'Éditeur',
            content: (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Titre de la note</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Titre explicite..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Contenu (Markdown Supporté)</label>
                    <span className="text-[10px] text-slate-500 font-mono">{editContent.length} carac.</span>
                  </div>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed resize-none"
                    placeholder="Rédigez ici en Markdown..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Catégorie</label>
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Tags (séparés par virgule)</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      placeholder="ex: Deal, Priorité, Sprint"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Thème Visuel</label>
                  <div className="flex items-center gap-2">
                    {['emerald', 'blue', 'purple', 'amber', 'rose'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          editColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70'
                        } ${COLOR_MAP[c]?.bg} ${COLOR_MAP[c]?.border}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveDrawerNote}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Save size={14} />
                    <span>Sauvegarder les modifications</span>
                  </button>
                </div>
              </div>
            )
          },
          {
            id: 'preview',
            label: 'Aperçu Markdown',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 prose prose-invert max-w-none text-slate-200 leading-relaxed font-sans space-y-2">
                  <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-1.5">{editTitle || selectedNote?.title}</h3>
                  <div className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
                    {editContent || selectedNote?.content}
                  </div>
                </div>
                {selectedNote && selectedNote.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedNote.tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1">
                        <Tag size={10} className="text-emerald-400" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          },
          {
            id: 'metadata',
            label: 'Métadonnées & Audit',
            content: (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Identifiant Unique (UUID) :</span>
                    <span className="font-mono text-[10px] text-slate-300 truncate max-w-[180px]">{selectedNote?.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Date de Création :</span>
                    <span className="font-mono text-slate-300">
                      {selectedNote ? new Date(selectedNote.createdAt).toLocaleString('fr-FR') : ''}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Dernière Modification :</span>
                    <span className="font-mono text-slate-300">
                      {selectedNote ? new Date(selectedNote.updatedAt).toLocaleString('fr-FR') : ''}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Partition Workspace :</span>
                    <span className="font-mono text-emerald-400">{selectedNote?.workspace}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Enregistré dans le store IndexedDB avec persistance offline garantie.</span>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* MODAL: CRÉER UNE NOUVELLE NOTE                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isQuickCaptureOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsQuickCaptureOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 text-slate-100 scrollbar-hide"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <StickyNote size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">Créer une Nouvelle Note</h3>
                    <p className="text-[11px] text-slate-400">Partition {workspace} • Persistance locale chiffrée IndexedDB</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickCaptureOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveQuickNote} className="space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                    Titre de la Note <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quickTitle}
                    onChange={e => setQuickTitle(e.target.value)}
                    placeholder="ex: Cadrage Stratégique Q4 & Négociation Contrat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                {/* Content Markdown */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Contenu (Markdown Supporté) <span className="text-emerald-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">{quickContent.length} carac.</span>
                  </div>
                  <textarea
                    required
                    value={quickContent}
                    onChange={e => setQuickContent(e.target.value)}
                    placeholder="Rédigez ici en Markdown (# Titre, • Listes, `code`, **gras**)..."
                    rows={6}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono leading-relaxed"
                  />
                </div>

                {/* Category & Tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Catégorie</label>
                    <select
                      value={quickCategory}
                      onChange={e => setQuickCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Tags (séparés par virgule)</label>
                    <input
                      type="text"
                      value={quickTagInput}
                      onChange={e => setQuickTagInput(e.target.value)}
                      placeholder="Deal, Priorité, Sprint"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Tag Quick Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold">Ajouter tag :</span>
                  {['Deal', 'Priorité', 'Sprint', 'IA', 'Architecture', 'Finance'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        haptics.trigger('light');
                        const existingTags = quickTagInput.split(',').map(t => t.trim()).filter(Boolean);
                        if (!existingTags.includes(tag)) {
                          setQuickTagInput(existingTags.length > 0 ? `${quickTagInput}, ${tag}` : tag);
                        }
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Pin Toggle & Theme Picker */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  {/* Pin Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={quickIsPinned}
                      onChange={e => {
                        haptics.trigger('selection');
                        setQuickIsPinned(e.target.checked);
                      }}
                      className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                      <Pin size={13} className={quickIsPinned ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'} />
                      <span>Épingler en haut de pile ⭐</span>
                    </span>
                  </label>

                  {/* Color visual theme */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Couleur :</span>
                    {['emerald', 'blue', 'purple', 'amber', 'rose'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          haptics.trigger('light');
                          setQuickColor(color);
                        }}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          quickColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70'
                        } ${COLOR_MAP[color]?.bg} ${COLOR_MAP[color]?.border}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsQuickCaptureOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!quickTitle.trim() && !quickContent.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Créer la Note</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Note Deletion */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Supprimer cette note ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${deleteModal.noteTitle}" de la base locale ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' })}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
