import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Phone, 
  Mail, 
  Video, 
  MapPin, 
  Building, 
  Clock, 
  ShieldCheck, 
  Check, 
  Copy, 
  MessageSquare, 
  Plus, 
  ChevronRight,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Contact, ContactInteraction, ClientStorageService, Client } from '../../../services/clientStorage';
import { haptics } from '../../../services/haptics';
import { AppEventBus } from '../../../services/eventBus';

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  client: Client | null;
  workspace: string;
  onUpdateContact?: (updatedContact: Contact) => void;
  onToast: (msg: string) => void;
}

export default function ContactDetailModal({
  isOpen,
  onClose,
  contact,
  client,
  workspace,
  onUpdateContact,
  onToast
}: ContactDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logType, setLogType] = useState<'call' | 'email' | 'meeting' | 'note'>('call');
  const [logSummary, setLogSummary] = useState('');

  if (!isOpen || !contact || !client) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    haptics.trigger('light');
    onToast(`${fieldName} copié dans le presse-papier`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAction = (type: 'call' | 'mail' | 'video') => {
    haptics.trigger('medium');
    if (type === 'call') {
      onToast(`Appel vers ${contact.name} (${contact.phone})`);
    } else if (type === 'mail') {
      onToast(`Email ouvert vers ${contact.email}`);
    } else if (type === 'video') {
      onToast(`Lien Visio HD généré et envoyé à ${contact.name}`);
    }
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSummary.trim()) return;

    const newInteraction: ContactInteraction = {
      id: `int-${Date.now()}`,
      type: logType,
      date: "Aujourd'hui à " + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      summary: logSummary.trim(),
      author: 'Vous (Compte Actuel)'
    };

    const updatedInteractions = [newInteraction, ...(contact.interactions || [])];
    const updatedContact: Contact = {
      ...contact,
      lastInteraction: "À l'instant",
      interactions: updatedInteractions
    };

    // Update in client contacts list
    const updatedContacts = client.contacts.map(c => c.id === contact.id ? updatedContact : c);
    ClientStorageService.updateClient(client.id, { contacts: updatedContacts }, workspace);

    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }

    AppEventBus.emit('CONTACT_INTERACTION_ADDED', 'clients', {
      clientId: client.id,
      contactId: contact.id,
      interaction: newInteraction
    });

    haptics.trigger('success');
    onToast('Compte-rendu d\'interaction enregistré avec succès');
    setLogSummary('');
    setIsAddingLog(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header with Breadcrumb & Close */}
          <div className="px-4 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <nav aria-label="Fil d'Ariane Contact" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-x-auto scrollbar-hide">
              <span className="text-slate-400 font-medium truncate">{client.name}</span>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-slate-400 shrink-0">Contacts</span>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-slate-100 font-bold truncate">{contact.name}</span>
            </nav>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Identity & Status Hero */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg font-bold shadow-inner">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {contact.name}
                    {contact.decisionMaker && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={11} />
                        Décisionnaire
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-emerald-400 font-medium">{contact.role}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building size={11} className="text-slate-500" />
                    <span>{contact.department || 'Direction & Management'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Call, Mail, Video, Log) */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleAction('call')}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/70 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <Phone size={14} />
                </div>
                <span className="text-[10px] font-medium">Appeler</span>
              </button>

              <button
                onClick={() => handleAction('mail')}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/70 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                  <Mail size={14} />
                </div>
                <span className="text-[10px] font-medium">Email</span>
              </button>

              <button
                onClick={() => handleAction('video')}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/70 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                  <Video size={14} />
                </div>
                <span className="text-[10px] font-medium">Visio HD</span>
              </button>

              <button
                onClick={() => {
                  haptics.trigger('light');
                  setIsAddingLog(!isAddingLog);
                }}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                  isAddingLog 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                    : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700/70 text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <span className="text-[10px] font-medium">Note / CR</span>
              </button>
            </div>

            {/* Direct Information Details */}
            <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Coordonnées & Profil</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Email */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-slate-500">Email Professionnel</div>
                    <div className="font-mono text-slate-200 text-[11px] truncate">{contact.email}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(contact.email, 'Email')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copiedField === 'Email' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>

                {/* Phone */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-slate-500">Ligne Directe / Mobile</div>
                    <div className="font-mono text-slate-200 text-[11px] truncate">{contact.phone}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(contact.phone, 'Téléphone')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copiedField === 'Téléphone' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>

                {/* Location */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center gap-2">
                  <MapPin size={14} className="text-slate-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500">Localisation / Fuseau</div>
                    <div className="text-slate-200 font-medium">{contact.location || 'Paris, France (UTC+1)'}</div>
                  </div>
                </div>

                {/* Preferred Channel */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center gap-2">
                  <MessageSquare size={14} className="text-slate-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500">Canal Préféré</div>
                    <div className="text-slate-200 font-medium">{contact.preferredChannel || 'Slack Connect VIP'}</div>
                  </div>
                </div>
              </div>

              {/* Strategic Notes */}
              {contact.notes && (
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/90 text-xs">
                  <div className="text-[10px] text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>Contexte & Préférences de Négociation</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Add Log Form */}
            <AnimatePresence>
              {isAddingLog && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddInteraction}
                  className="p-3.5 bg-slate-800/80 rounded-2xl border border-emerald-500/30 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Plus size={13} className="text-emerald-400" />
                      Nouveau Compte-Rendu d'Échange
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingLog(false)}
                      className="text-slate-400 hover:text-slate-200 text-[11px]"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    {(['call', 'email', 'meeting', 'note'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLogType(t)}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium border transition-colors capitalize ${
                          logType === t
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t === 'call' ? 'Appel' : t === 'email' ? 'Email' : t === 'meeting' ? 'Réunion' : 'Note'}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={logSummary}
                    onChange={(e) => setLogSummary(e.target.value)}
                    placeholder="Résumez l'échange, les engagements pris ou les prochaines étapes..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/50 resize-none"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Send size={12} />
                      <span>Enregistrer l'échange</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Interaction History (Timeline) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Historique des Échanges ({contact.interactions?.length || 0})
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={10} />
                  Dernier contact : {contact.lastInteraction || 'Récemment'}
                </span>
              </div>

              <div className="space-y-2">
                {contact.interactions && contact.interactions.length > 0 ? (
                  contact.interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                            interaction.type === 'call' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            interaction.type === 'meeting' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            interaction.type === 'email' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {interaction.type}
                          </span>
                          <span className="text-slate-400 font-medium">{interaction.author}</span>
                        </div>
                        <span className="text-slate-500">{interaction.date}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{interaction.summary}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                    Aucun échange consigné pour ce contact. Cliquez sur "Note / CR" pour ajouter le premier.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
