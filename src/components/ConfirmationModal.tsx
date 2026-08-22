import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, Check, ShieldAlert } from 'lucide-react';
import { haptics } from '../services/haptics';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  // Global Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        haptics.trigger('light');
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20',
          borderAccent: 'border-amber-500/40'
        };
      case 'info':
        return {
          icon: ShieldAlert,
          iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          confirmBtn: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold shadow-blue-500/20',
          borderAccent: 'border-blue-500/40'
        };
      case 'danger':
      default:
        return {
          icon: Trash2,
          iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          confirmBtn: 'bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-rose-500/30',
          borderAccent: 'border-rose-500/40'
        };
    }
  };

  const style = getVariantStyles();
  const IconComponent = style.icon;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-16 bg-black/80 backdrop-blur-xl animate-fade-in"
        onClick={(e) => {
          e.stopPropagation();
          haptics.trigger('light');
          onCancel();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`w-full max-w-sm rounded-[2rem] bg-slate-900/98 border ${style.borderAccent} shadow-2xl p-5 flex flex-col relative overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Icon */}
          <div className="flex items-start gap-3.5 mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${style.iconBg} shadow-md`}>
              <IconComponent size={20} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-sm font-bold text-slate-100 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                haptics.trigger('light');
                onCancel();
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Fermer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('light');
                onCancel();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.trigger('warning');
                onConfirm();
              }}
              className={`px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${style.confirmBtn}`}
            >
              <Check size={14} strokeWidth={2.5} />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
