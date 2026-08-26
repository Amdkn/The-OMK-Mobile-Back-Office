import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppDefinition, AppId } from '../types';
import { FolderPlus } from 'lucide-react';

interface Props {
  key?: React.Key;
  app: AppDefinition;
  onClick: (id: AppId) => void;
  onLongPress?: () => void;
  isOverlay?: boolean;
  isEditMode?: boolean;
  isGroupTarget?: boolean;
  badgeCount?: number;
  hasSyncPulse?: boolean;
}

export function AppIconView({ 
  app, 
  isOverlay = false, 
  isEditMode = false,
  isGroupTarget = false,
  badgeCount = 0,
  hasSyncPulse = false
}: { 
  app: AppDefinition; 
  isOverlay?: boolean;
  isEditMode?: boolean;
  isGroupTarget?: boolean;
  badgeCount?: number;
  hasSyncPulse?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 w-16 select-none relative ${
      isOverlay ? 'scale-110 rotate-2 transition-transform z-50' : ''
    } ${isEditMode ? 'animate-[wiggle_1.2s_ease-in-out_infinite]' : ''}`}>
      {/* Icon Tile */}
      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${app.color} ${
        isOverlay 
          ? 'shadow-2xl ring-4 ring-emerald-400/80 bg-slate-900' 
          : isGroupTarget
            ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-2xl bg-emerald-950/60'
            : 'shadow-lg group-hover:scale-105 group-active:scale-95'
      } transition-all relative overflow-hidden`}>
        <app.icon size={26} strokeWidth={1.5} className={isGroupTarget ? 'scale-90 opacity-70' : ''} />
        
        {/* Visual Grouping Indicator overlay when hovering dead-center */}
        {isGroupTarget && (
          <div className="absolute inset-0 bg-emerald-500/25 backdrop-blur-[1px] flex flex-col items-center justify-center animate-pulse">
            <FolderPlus size={20} className="text-emerald-300 drop-shadow-md" />
            <span className="text-[8px] font-bold text-emerald-200 uppercase tracking-tighter">Grouper</span>
          </div>
        )}
      </div>

      {/* Visual Notification Badge (red dot with counts or sync pulse) */}
      {!isOverlay && !isGroupTarget && (
        <>
          {badgeCount > 0 ? (
            <span 
              className="absolute -top-1.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] shadow-[0_0_10px_rgba(244,63,94,0.7)] flex items-center justify-center border-2 border-slate-950 z-20 animate-pulse tracking-tighter"
              title={`${badgeCount} alerte${badgeCount > 1 ? 's' : ''} non lue${badgeCount > 1 ? 's' : ''}`}
            >
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          ) : hasSyncPulse ? (
            <span 
              className="absolute -top-1 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.8)] z-20 animate-ping"
              title="Synchronisation active"
            />
          ) : null}
        </>
      )}

      {/* Styled Frame Label for High Legibility across all wallpapers */}
      <div className="max-w-[72px] px-1.5 py-0.5 rounded-md bg-slate-950/70 border border-slate-700/60 shadow-sm flex items-center justify-center">
        <span className="text-[10px] font-semibold text-slate-100 text-center leading-tight truncate w-full tracking-tight">
          {app.name}
        </span>
      </div>
    </div>
  );
}

// Optimization (Bolt ⚡): Wrapped in React.memo to prevent unnecessary icon re-renders
// during parent HomeScreen state changes (e.g. status bar timer ticks, scroll, gesture pull).
export const SortableAppIcon = React.memo(function SortableAppIcon({
  app, 
  onClick, 
  onLongPress,
  isEditMode = false, 
  isGroupTarget = false,
  badgeCount = 0,
  hasSyncPulse = false
}: Props) {
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = React.useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: app.id,
    transition: {
      duration: 320,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring physics bounce curve
    }
  });

  const handlePointerDown = () => {
    isLongPressTriggeredRef.current = false;
    if (onLongPress && !isEditMode) {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        onLongPress();
      }, 450);
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick(app.id);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
    zIndex: isDragging ? 0 : 'auto',
    opacity: isDragging ? 0.2 : 1,
    touchAction: 'none',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        handlePointerDown();
        listeners?.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        handlePointerUp();
        listeners?.onPointerUp?.(e);
      }}
      onPointerCancel={(e) => {
        handlePointerUp();
        listeners?.onPointerCancel?.(e);
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onLongPress) onLongPress();
      }}
      className="flex flex-col items-center justify-center p-1 rounded-2xl group relative touch-none focus:outline-none transition-opacity cursor-pointer"
      title={app.name}
    >
      <AppIconView 
        app={app} 
        isEditMode={isEditMode}
        isGroupTarget={isGroupTarget}
        badgeCount={badgeCount}
        hasSyncPulse={hasSyncPulse}
      />
    </div>
  );
});

