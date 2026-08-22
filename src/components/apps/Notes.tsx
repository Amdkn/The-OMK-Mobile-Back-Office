import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  StickyNote, Plus, Search, Pin, Trash2, Tag, Sparkles, 
  Check, Filter, Calendar, Folder, ArrowRight, Share2, Edit3, X
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard, KPIItem } from '../layout/DetailSection';
import { useOSStore } from '../../store/osStore';
import { NotesService } from '../../modules/notes';
import { NoteItem } from '../../types';
import { haptics } from '../../services/haptics';

const CATEGORIES: Array<NoteItem['category']> = ['Stratégie', 'Finance', 'Ops', 'Clients', 'Idées', 'Général'];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-300' }
};

export default function NotesApp() {
  const { workspace } = useOSStore();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  
  // Quick Capture Form State
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickCategory, setQuickCategory] = useState<NoteItem['category']>('Stratégie');
  const [quickTagInput, setQuickTagInput] = useState('');
  const [quickColor, setQuickColor] = useState('emerald');

  // Load notes on mount and on workspace change
  useEffect(() => {
    NotesService.getNotes(workspace).then(data => {
      setNotes(data);
    });
  }, [workspace]);

  const handleSaveQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() && !quickContent.trim()) return;

    haptics.trigger('success');
    const tags = quickTagInput.split(',').map(t => t.trim()).filter(Boolean);
    const newNote = await NotesService.createQuickNote(
      quickTitle || 'Sans titre',
      quickContent,
      quickCategory,
      tags.length ? tags : ['Capture'],
      workspace,
      quickColor
    );

    setNotes(prev => [newNote, ...prev]);
    setQuickTitle('');
    setQuickContent('');
    setQuickTagInput('');
    setIsQuickCaptureOpen(false);
  };

  const handleTogglePin = async (note: NoteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('light');
    const updated = { ...note, isPinned: !note.isPinned };
    const list = await NotesService.updateNote(workspace, updated);
    setNotes(list);
    if (selectedNote?.id === note.id) setSelectedNote(updated);
  };

  const handleDeleteNote = async (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.trigger('warning');
    const list = await NotesService.deleteNote(workspace, noteId);
    setNotes(list);
    if (selectedNote?.id === noteId) setSelectedNote(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === 'Tous' || note.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  // Dynamic KPIs for DetailSection
  const kpis: KPIItem[] = [
    {
      label: 'Total Notes',
      value: notes.length,
      sub: `${workspace}`,
      trend: 'up',
      icon: StickyNote
    },
    {
      label: 'Épinglées',
      value: notes.filter(n => n.isPinned).length,
      sub: 'Priorité',
      trend: 'neutral',
      icon: Pin
    },
    {
      label: 'Catégories',
      value: new Set(notes.map(n => n.category)).size,
      sub: 'Organisées',
      trend: 'up',
      icon: Folder
    }
  ];

  return (
    <DetailSection
      title="Notes & Capture"
      subtitle={`Espace de réflexion et base de connaissances offline-first (${workspace})`}
      badge="IndexedDB"
      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      icon={StickyNote}
      kpis={kpis}
      actions={
        <button
          onClick={() => {
            haptics.trigger('selection');
            setIsQuickCaptureOpen(!isQuickCaptureOpen);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Capturer</span>
        </button>
      }
    >
      {/* AI Knowledge Insight */}
      <AIInsightCard
        title="Coach AI • Synthèse Mémoire"
        content="3 notes épinglées sont directement rattachées aux objectifs du Sprint S34 et au closing d'Apex Corp ($42k MRR). La persistance locale IndexedDB garantit la disponibilité 100% hors-ligne."
        actionLabel="Générer un résumé des notes stratégiques"
        onAction={() => {
          haptics.trigger('light');
          setSelectedCategory('Stratégie');
        }}
      />

      {/* Quick Capture Panel Drawer / Modal */}
      <AnimatePresence>
        {isQuickCaptureOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            className="p-4 rounded-3xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Quick Capture Instantanée</span>
              </div>
              <button
                onClick={() => setIsQuickCaptureOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-3">
              <input
                type="text"
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                placeholder="Titre de la note ou idée clé..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
                autoFocus
              />

              <textarea
                value={quickContent}
                onChange={e => setQuickContent(e.target.value)}
                placeholder="Rédigez ou collez vos notes, décisions, extraits de code ou mémo..."
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-medium">Catégorie</label>
                  <select
                    value={quickCategory}
                    onChange={e => setQuickCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-medium">Tags (séparés par virgule)</label>
                  <input
                    type="text"
                    value={quickTagInput}
                    onChange={e => setQuickTagInput(e.target.value)}
                    placeholder="ex: Deal, Urgent, IA"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {['emerald', 'blue', 'purple', 'amber', 'rose'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setQuickColor(color)}
                      className={`w-5 h-5 rounded-full border transition-all ${
                        quickColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70'
                      } ${COLOR_MAP[color]?.bg} ${COLOR_MAP[color]?.border}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickCaptureOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                  >
                    <Check size={14} />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Category Filter Tabs */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, contenu, tag..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
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
          {['Tous', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => {
                haptics.trigger('selection');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Notes Grid */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Pin size={11} className="text-emerald-400" />
            <span>Notes Épinglées ({pinnedNotes.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setSelectedNote(note)}
                onTogglePin={e => handleTogglePin(note, e)}
                onDelete={e => handleDeleteNote(note.id, e)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes Grid */}
      <div className="space-y-2">
        {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
          <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
            <StickyNote size={11} className="text-slate-400" />
            <span>Toutes les notes ({unpinnedNotes.length})</span>
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <StickyNote size={28} className="mx-auto mb-2 text-slate-600 opacity-60" />
            <p className="text-xs font-medium text-slate-400">Aucune note trouvée</p>
            <p className="text-[11px] text-slate-500 mt-1">Créez votre première note avec Quick Capture</p>
            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
            >
              + Nouvelle Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {unpinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setSelectedNote(note)}
                onTogglePin={e => handleTogglePin(note, e)}
                onDelete={e => handleDeleteNote(note.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${COLOR_MAP[selectedNote.color || 'emerald']?.badge}`}>
                    {selectedNote.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(selectedNote.updatedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={e => handleTogglePin(selectedNote, e)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      selectedNote.isPinned 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Épingler"
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={e => handleDeleteNote(selectedNote.id, e)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4.5 overflow-y-auto space-y-3.5 flex-1">
                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {selectedNote.title}
                </h3>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80 font-mono">
                  {selectedNote.content}
                </div>

                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {selectedNote.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1">
                        <Tag size={9} className="opacity-60" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Environnement : {selectedNote.workspace}</span>
                <button
                  onClick={() => {
                    haptics.trigger('success');
                    setSelectedNote(null);
                  }}
                  className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DetailSection>
  );
}

function NoteCard({
  note,
  onClick,
  onTogglePin,
  onDelete
}: {
  key?: React.Key;
  note: NoteItem;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void | Promise<void>;
  onDelete: (e: React.MouseEvent) => void | Promise<void>;
}) {
  const colorStyle = COLOR_MAP[note.color || 'emerald'] || COLOR_MAP.emerald;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`p-3.5 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 backdrop-blur-xl shadow-lg cursor-pointer transition-all flex flex-col justify-between group text-left relative overflow-hidden`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${colorStyle.badge}`}>
            {note.category}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              title={note.isPinned ? 'Détacher' : 'Épingler'}
              className={`p-1 rounded-lg transition-colors ${
                note.isPinned ? 'text-emerald-400' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-slate-300'
              }`}
            >
              <Pin size={12} className={note.isPinned ? 'fill-emerald-400' : ''} />
            </button>
          </div>
        </div>

        <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
          {note.title}
        </h4>

        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500">
        <span className="truncate max-w-[120px]">
          {note.tags.join(' · ')}
        </span>
        <span className="font-mono">
          {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
