import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  ChevronRight, 
  User, 
  Server, 
  FileText, 
  ArrowUpRight,
  Flame,
  Check,
  Building2,
  Terminal as TerminalIcon
} from 'lucide-react';
import { haptics } from '../../../services/haptics';
import { AppEventBus } from '../../../services/eventBus';

export interface SupportTicket {
  id: string;
  client: string;
  title: string;
  priority: 'P1 - Critique' | 'P2 - Moyenne' | 'P3 - Normale';
  time: string;
  status: string;
  description?: string;
  slaLimit?: string;
  logs?: string[];
  messages?: { sender: string; role: string; time: string; text: string; isInternal?: boolean }[];
}

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  workspace: string;
  onToast: (msg: string) => void;
  onUpdateStatus?: (ticketId: string, newStatus: string) => void;
}

export default function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  workspace,
  onToast,
  onUpdateStatus
}: TicketDetailModalProps) {
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState(ticket?.messages || []);
  const [currentStatus, setCurrentStatus] = useState(ticket?.status || 'En cours de diagnostic');

  useEffect(() => {
    if (ticket) {
      setCurrentStatus(ticket.status);
      setMessages(ticket.messages || [
        {
          sender: 'Monitoring Cloud OMK',
          role: 'Système Automatique',
          time: ticket.time,
          text: `Alerte déclenchée sur les sondes de disponibilité du cluster client (${ticket.client}). Incident classé en priorité ${ticket.priority}.`,
          isInternal: true
        },
        {
          sender: ticket.client,
          role: 'Contact Client Entreprise',
          time: 'Il y a 30m',
          text: `Nous constatons une dégradation anormale des temps de réponse sur nos endpoints de production. Pouvez-vous vérifier la latence et l'allocation des nœuds ?`
        }
      ]);
    }
  }, [ticket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !ticket) return null;

  const isP1 = ticket.priority.includes('P1');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      sender: 'Vous (Ingénierie Support)',
      role: 'Support Tier-3',
      time: "À l'instant",
      text: replyText.trim(),
      isInternal: false
    };

    setMessages(prev => [...prev, newMsg]);
    setReplyText('');
    haptics.trigger('success');
    onToast('Message transmis au client et consigné dans le journal du ticket');

    AppEventBus.emit('TICKET_REPLIED', 'clients', {
      ticketId: ticket.id,
      client: ticket.client
    });
  };

  const handleResolveTicket = () => {
    haptics.trigger('success');
    setCurrentStatus('Résolu');
    if (onUpdateStatus) onUpdateStatus(ticket.id, 'Résolu');
    onToast(`Ticket ${ticket.id} marqué comme Résolu`);
    AppEventBus.emit('TICKET_RESOLVED', 'clients', { ticketId: ticket.id });
  };

  const handleEscalate = () => {
    haptics.trigger('warning');
    setCurrentStatus('Escaladé Équipe Infra / SRE');
    if (onUpdateStatus) onUpdateStatus(ticket.id, 'Escaladé Équipe Infra / SRE');
    onToast(`Alerte d'astreinte envoyée aux ingénieurs SRE`);
  };

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 pt-16 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        >
          {/* Header with Breadcrumb & Close */}
          <div className="px-4 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <nav aria-label="Fil d'Ariane Ticket" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-x-auto scrollbar-hide">
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-emerald-400 font-medium truncate transition-colors"
              >
                Support SLA
              </button>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-slate-400 truncate">{ticket.client}</span>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-emerald-400 font-bold truncate font-mono">{ticket.id}</span>
            </nav>
            <button
              onClick={() => {
                haptics.trigger('light');
                onClose();
              }}
              title="Fermer la fiche ticket"
              aria-label="Fermer"
              className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm border border-slate-700/50 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Hero Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isP1 
                ? 'bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900/90 border-red-500/40' 
                : 'bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900/90 border-sky-500/30'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isP1 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {ticket.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{ticket.title}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Building2 size={12} className="text-slate-500" />
                    <span>Compte : <strong>{ticket.client}</strong></span>
                    <span>•</span>
                    <Clock size={11} className="text-slate-500" />
                    <span>Ouvert il y a {ticket.time}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    currentStatus === 'Résolu' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {currentStatus}
                  </div>
                </div>
              </div>

              {/* SLA Target Banner */}
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px]">
                  <ShieldAlert size={14} className={isP1 ? 'text-red-400' : 'text-sky-400'} />
                  <span className="text-slate-300">Objectif SLA Premier Contact :</span>
                  <span className="font-mono font-bold text-slate-100">&lt; 15 min (Respecté)</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> 100% Conforme
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleResolveTicket}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <Check size={13} strokeWidth={3} />
                  <span>Clôturer / Résolu</span>
                </button>
                <button
                  onClick={handleEscalate}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <AlertTriangle size={13} className="text-amber-400" />
                  <span>Escalader SRE</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Logs */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <TerminalIcon size={13} className="text-emerald-400" />
                  Logs Télémétrie Incident
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Cluster Frankfurt-02</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[10.5px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-emerald-400">[2026-08-22T20:20:00Z] INFO Probe latency increased from 14ms to 182ms on region eu-central-1.</div>
                <div className="text-amber-400">[2026-08-22T20:21:15Z] WARN Autoscaler triggered: adding 2 worker replicas to node pool.</div>
                <div className="text-slate-400">[2026-08-22T20:22:40Z] SUCCESS Pod allocation stabilized. Latency p99 dropped to 28ms.</div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-0.5">
                Fil de Discussion ({messages.length})
              </div>

              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                      m.isInternal 
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400' 
                        : m.sender.includes('Vous')
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200 ml-4'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{m.sender}</span>
                        <span className="text-slate-500">({m.role})</span>
                      </div>
                      <span className="text-slate-500 font-mono">{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Répondre au client ou consigner une action technique..."
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1 transition-all shadow active:scale-95"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
