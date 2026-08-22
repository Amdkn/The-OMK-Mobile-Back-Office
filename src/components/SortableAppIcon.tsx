import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppDefinition } from '../types';

interface Props {
  key?: React.Key;
  app: AppDefinition;
  onClick: () => void;
  isOverlay?: boolean;
}

export function AppIconView({ app, isOverlay = false }: { app: AppDefinition; isOverlay?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 w-16 select-none ${
      isOverlay ? 'scale-110 rotate-1 transition-transform' : ''
    }`}>
      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${app.color} ${
        isOverlay ? 'shadow-2xl ring-2 ring-emerald-400/60' : 'shadow-lg group-hover:scale-105 group-active:scale-95'
      } transition-all`}>
        <app.icon size={26} strokeWidth={1.5} />
      </div>
      <span className="text-[10px] font-medium text-slate-200 text-center leading-tight truncate w-full px-0.5">
        {app.name}
      </span>
    </div>
  );
}

export function SortableAppIcon({ app, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    zIndex: isDragging ? 0 : 'auto',
    opacity: isDragging ? 0.35 : 1,
    touchAction: 'none',
  };

  return (
    <button 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-1 rounded-2xl group relative touch-none focus:outline-none transition-opacity"
    >
      <AppIconView app={app} />
    </button>
  );
}
