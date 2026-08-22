import React from 'react';
import { SmartFolder, AppDefinition, AppId } from '../types';
import { APPS } from './HomeScreen';
import { Folder, X } from 'lucide-react';

interface SmartFolderIconProps {
  key?: React.Key;
  folder: SmartFolder;
  onClick: () => void;
  isOverlay?: boolean;
  isEditMode?: boolean;
  onDissolve?: () => void;
  isDropTarget?: boolean;
  badgeCount?: number;
}

export function SmartFolderIconView({ 
  folder, 
  isOverlay = false,
  isEditMode = false,
  onDissolve,
  isDropTarget = false,
  badgeCount = 0
}: { 
  folder: SmartFolder; 
  isOverlay?: boolean;
  isEditMode?: boolean;
  onDissolve?: () => void;
  isDropTarget?: boolean;
  badgeCount?: number;
}) {
  // Get apps inside folder
  const folderApps = folder.appIds
    .map(id => APPS.find(a => a.id === id))
    .filter((a): a is AppDefinition => a !== undefined)
    .slice(0, 4);

  return (
    <div className={`flex flex-col items-center gap-1.5 w-16 select-none relative ${
      isOverlay ? 'scale-110 rotate-2 transition-transform z-50' : ''
    } ${isEditMode ? 'animate-[wiggle_1.2s_ease-in-out_infinite]' : ''}`}>
      {/* Folder Container */}
      <div className={`w-14 h-14 rounded-[1.25rem] bg-slate-900/85 border border-slate-700/80 p-1.5 shadow-lg backdrop-blur-md grid grid-cols-2 gap-1 items-center justify-items-center relative ${
        isOverlay 
          ? 'shadow-2xl ring-4 ring-emerald-400/80' 
          : isDropTarget
            ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-105 bg-emerald-950/70'
            : 'group-hover:scale-105 group-active:scale-95'
      } transition-all`}>
        {folderApps.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center text-slate-500">
            <Folder size={18} />
          </div>
        ) : (
          folderApps.map(app => (
            <div 
              key={app.id}
              className={`w-4.5 h-4.5 rounded-md flex items-center justify-center ${app.color} text-[8px]`}
            >
              <app.icon size={10} strokeWidth={2} />
            </div>
          ))
        )}

        {/* Quick Dissolve Badge in Edit Groups Mode */}
        {isEditMode && onDissolve ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDissolve();
            }}
            title="Dissocier ce groupe"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-400 text-white shadow-lg flex items-center justify-center border-2 border-slate-950 z-20 active:scale-90 transition-transform"
          >
            <X size={10} strokeWidth={3} />
          </button>
        ) : badgeCount > 0 && !isOverlay ? (
          <span 
            className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] shadow-[0_0_10px_rgba(244,63,94,0.7)] flex items-center justify-center border-2 border-slate-950 z-20 animate-pulse tracking-tighter"
            title={`${badgeCount} alerte${badgeCount > 1 ? 's' : ''} non lue${badgeCount > 1 ? 's' : ''}`}
          >
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        ) : null}
      </div>

      {/* High-Contrast Semi-Transparent Dark Backdrop with Drop Shadow */}
      <div className="px-1.5 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-full min-w-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold text-slate-100 text-center leading-tight truncate w-full drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)]">
          {folder.name}
        </span>
      </div>
    </div>
  );
}

export default function SmartFolderIcon({ 
  folder, 
  onClick, 
  isEditMode = false, 
  onDissolve, 
  isDropTarget = false,
  badgeCount = 0
}: SmartFolderIconProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-1 rounded-2xl group relative touch-none focus:outline-none transition-opacity"
      title={`Dossier ${folder.name}`}
    >
      <SmartFolderIconView 
        folder={folder} 
        isEditMode={isEditMode}
        onDissolve={onDissolve}
        isDropTarget={isDropTarget}
        badgeCount={badgeCount}
      />
    </button>
  );
}
