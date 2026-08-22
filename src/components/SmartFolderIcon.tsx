import React from 'react';
import { SmartFolder, AppDefinition, AppId } from '../types';
import { APPS } from './HomeScreen';
import { Folder } from 'lucide-react';

interface SmartFolderIconProps {
  key?: React.Key;
  folder: SmartFolder;
  onClick: () => void;
  isOverlay?: boolean;
}

export function SmartFolderIconView({ folder, isOverlay = false }: { folder: SmartFolder; isOverlay?: boolean }) {
  // Get apps inside folder
  const folderApps = folder.appIds
    .map(id => APPS.find(a => a.id === id))
    .filter((a): a is AppDefinition => a !== undefined)
    .slice(0, 4);

  return (
    <div className={`flex flex-col items-center gap-1.5 w-16 select-none ${
      isOverlay ? 'scale-110 rotate-1 transition-transform' : ''
    }`}>
      <div className={`w-14 h-14 rounded-[1.25rem] bg-slate-900/80 border border-slate-700/80 p-1.5 shadow-lg backdrop-blur-md grid grid-cols-2 gap-1 items-center justify-items-center ${
        isOverlay ? 'shadow-2xl ring-2 ring-emerald-400/60' : 'group-hover:scale-105 group-active:scale-95'
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
      </div>
      <span className="text-[10px] font-medium text-slate-200 text-center leading-tight truncate w-full px-0.5">
        {folder.name}
      </span>
    </div>
  );
}

export default function SmartFolderIcon({ folder, onClick }: SmartFolderIconProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-1 rounded-2xl group relative touch-none focus:outline-none transition-opacity"
      title={`Dossier ${folder.name}`}
    >
      <SmartFolderIconView folder={folder} />
    </button>
  );
}
