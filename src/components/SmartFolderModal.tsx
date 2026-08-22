import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartFolder, AppId, AppDefinition } from '../types';
import { APPS } from './HomeScreen';
import { useOSStore } from '../store/osStore';
import { haptics } from '../services/haptics';
import { X, Edit2, Check, Trash2, FolderPlus, Plus, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface SmartFolderModalProps {
  folder: SmartFolder;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
}

export default function SmartFolderModal({ folder, onClose, onOpenApp }: SmartFolderModalProps) {
  const { renameSmartFolder, deleteSmartFolder, dissolveSmartFolder, removeAppFromFolder, addAppToFolder } = useOSStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [isAddingApps, setIsAddingApps] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    onConfirm: () => {}
  });

  const folderApps = folder.appIds
    .map(id => APPS.find(a => a.id === id))
    .filter((a): a is AppDefinition => a !== undefined);

  // Available apps not yet in this folder
  const availableApps = APPS.filter(a => !folder.appIds.includes(a.id) && a.id !== 'lock');

  const handleSaveName = () => {
    if (folderName.trim()) {
      renameSmartFolder(folder.id, folderName.trim());
    }
    setIsEditingName(false);
    haptics.trigger('success');
  };

  const handlePromptDissolveFolder = () => {
    haptics.trigger('light');
    setConfirmModal({
      isOpen: true,
      title: 'Dissocier ce groupe ?',
      message: `Toutes les applications de "${folder.name}" seront replacées sur votre écran d'accueil sans perte de données.`,
      confirmLabel: 'Dissocier',
      onConfirm: () => {
        haptics.trigger('warning');
        dissolveSmartFolder(folder.id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        onClose();
      }
    });
  };

  const handleAppLaunch = (appId: AppId) => {
    if (isEditMode) return;
    haptics.trigger('appLaunch');
    onClose();
    onOpenApp(appId);
  };

  const handlePromptExtractApp = (e: React.MouseEvent, app: AppDefinition) => {
    e.stopPropagation();
    haptics.trigger('light');
    setConfirmModal({
      isOpen: true,
      title: `Retirer ${app.name} ?`,
      message: `L'application "${app.name}" sera extraite du groupe "${folder.name}" et replacée sur l'écran d'accueil.`,
      confirmLabel: 'Retirer',
      onConfirm: () => {
        haptics.trigger('medium');
        removeAppFromFolder(folder.id, app.id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (folder.appIds.length <= 1) {
          onClose();
        }
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 bg-black/75 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm rounded-[2.5rem] bg-slate-900/95 border border-slate-700/80 shadow-2xl p-5 flex flex-col relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with editable title and mode toggles */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-xl bg-slate-950 border border-emerald-500 text-sm font-bold text-slate-100 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer truncate" onClick={() => setIsEditingName(true)}>
                <h3 className="text-base font-bold text-slate-100 tracking-tight truncate">
                  {folder.name}
                </h3>
                <Edit2 size={12} className="text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Explicit Edit Mode Toggle */}
            <button
              onClick={() => {
                haptics.trigger('selection');
                setIsEditMode(!isEditMode);
              }}
              title={isEditMode ? "Terminer l'édition" : "Mode Édition des groupes"}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                isEditMode
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <SlidersHorizontal size={13} className={isEditMode ? 'animate-spin' : ''} />
              <span>{isEditMode ? 'Terminé' : 'Éditer'}</span>
            </button>

            <button
              onClick={handlePromptDissolveFolder}
              title="Dissocier le dossier (replacer les apps sur l'écran)"
              className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-center transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Instructions Banner / Status */}
        <div className="mb-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{isEditMode ? 'Mode Édition : touchez la croix pour sortir une app' : 'Touchez une application pour lancer :'}</span>
          <span className="font-mono text-emerald-400 text-[10px]">{folderApps.length} app{folderApps.length > 1 ? 's' : ''}</span>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-3 gap-3.5 py-2 content-start min-h-[140px]">
          {folderApps.map(app => (
            <div key={app.id} className="flex flex-col items-center gap-1.5 relative">
              <button
                onClick={() => handleAppLaunch(app.id)}
                className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${app.color} shadow-md hover:scale-105 active:scale-95 transition-all relative ${
                  isEditMode ? 'animate-[wiggle_1.2s_ease-in-out_infinite]' : ''
                }`}
              >
                <app.icon size={26} strokeWidth={1.5} />
              </button>
              
              {/* Dark backdrop label for high contrast */}
              <div className="px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-sm max-w-full min-w-0 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-slate-100 text-center leading-tight truncate w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {app.name}
                </span>
              </div>

              {/* Extraction Cross Button - Always accessible, prominently emphasized in Edit Mode */}
              <button
                onClick={e => handlePromptExtractApp(e, app)}
                className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-400 text-white shadow-xl flex items-center justify-center text-xs font-bold border-2 border-slate-900 transition-all z-10 ${
                  isEditMode ? 'scale-110 ring-2 ring-rose-400 animate-pulse' : 'hover:scale-110 active:scale-90'
                }`}
                title={`Sortir ${app.name} du groupe`}
                aria-label={`Sortir ${app.name} du groupe`}
              >
                <X size={13} strokeWidth={2.8} />
              </button>
            </div>
          ))}

          {/* Add app button */}
          <button
            onClick={() => setIsAddingApps(!isAddingApps)}
            className="w-14 h-14 rounded-[1.25rem] flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/40 text-slate-400 hover:text-emerald-400 transition-all active:scale-95 mx-auto"
          >
            <Plus size={20} />
            <span className="text-[8px] font-semibold mt-0.5">Ajouter</span>
          </button>
        </div>

        {/* Add more apps drawer */}
        <AnimatePresence>
          {isAddingApps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-800 overflow-hidden"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Ajouter une application au groupe
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 scrollbar-hide">
                {availableApps.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 text-center">Toutes les applications sont déjà incluses</p>
                ) : (
                  availableApps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => {
                        haptics.trigger('selection');
                        addAppToFolder(folder.id, app.id);
                      }}
                      className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${app.color} flex items-center justify-center`}>
                          <app.icon size={13} />
                        </div>
                        <span className="text-xs font-semibold text-slate-200">{app.name}</span>
                      </div>
                      <Plus size={14} className="text-emerald-400" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Destructive Action Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </motion.div>
    </div>
  );
}
