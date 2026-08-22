import React from 'react';
import { AppWidget, AppId } from '../../types';
import { haptics } from '../../services/haptics';
import { 
  ArrowUpRight, TrendingUp, TrendingDown, Minus, 
  Pin, PinOff, GripVertical 
} from 'lucide-react';

interface AppWidgetCardProps {
  key?: React.Key;
  widget: AppWidget;
  onClick: (appId: AppId) => void;
  className?: string;
  isCompact?: boolean;
  isCustomizing?: boolean;
  onTogglePin?: (id: string) => void;
}

export default function AppWidgetCard({
  widget,
  onClick,
  className = '',
  isCompact = false,
  isCustomizing = false,
  onTogglePin
}: AppWidgetCardProps) {
  const Icon = widget.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (isCustomizing) {
      e.stopPropagation();
      return;
    }
    haptics.trigger('appLaunch');
    onClick(widget.appId);
  };

  const getAccentBg = () => {
    switch (widget.accentColor) {
      case 'emerald':
        return 'border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950/90 text-emerald-400';
      case 'amber':
        return 'border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-950/90 text-amber-400';
      case 'blue':
        return 'border-blue-500/30 hover:border-blue-500/60 bg-gradient-to-br from-blue-950/30 via-slate-900/80 to-slate-950/90 text-blue-400';
      case 'purple':
        return 'border-purple-500/30 hover:border-purple-500/60 bg-gradient-to-br from-purple-950/30 via-slate-900/80 to-slate-950/90 text-purple-400';
      default:
        return 'border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-300';
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`group relative flex flex-col justify-between rounded-3xl p-3.5 border backdrop-blur-xl shadow-lg transition-all duration-200 select-none ${
        isCustomizing ? 'cursor-grab active:cursor-grabbing border-emerald-500/50 scale-[0.98]' : 'cursor-pointer active:scale-[0.98]'
      } ${getAccentBg()} ${className}`}
    >
      {/* Customization overlay pin/unpin button & drag handle */}
      {isCustomizing && (
        <div className="absolute -top-2 -right-2 z-20 flex items-center gap-1">
          {onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptics.trigger('selection');
                onTogglePin(widget.id);
              }}
              title={widget.isPinned ? "Désépingler du Dashboard" : "Épingler au Dashboard"}
              className={`p-1.5 rounded-full shadow-lg border transition-all ${
                widget.isPinned
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {widget.isPinned ? <Pin size={12} className="fill-slate-950" /> : <PinOff size={12} />}
            </button>
          )}
        </div>
      )}

      {/* Top row: Category/Title & Badge/Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isCustomizing ? (
            <div className="p-1 rounded-md bg-slate-950/70 border border-slate-800 text-slate-400 shrink-0">
              <GripVertical size={12} />
            </div>
          ) : Icon ? (
            <div className="w-6 h-6 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center shrink-0">
              <Icon size={13} />
            </div>
          ) : null}
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 truncate">
            {widget.title}
          </span>
        </div>

        {!isCustomizing && (
          widget.badge ? (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800/80 text-slate-300 shrink-0">
              {widget.badge}
            </span>
          ) : (
            <ArrowUpRight size={13} className="text-slate-500 group-hover:text-slate-200 transition-colors shrink-0 opacity-70 group-hover:opacity-100" />
          )
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`${isCompact ? 'text-sm' : 'text-base font-bold'} font-bold tracking-tight text-slate-100 group-hover:text-emerald-300 transition-colors truncate`}>
            {widget.value}
          </span>
          {widget.trendValue && (
            <div className="flex items-center gap-0.5 text-[10px] font-semibold shrink-0 text-emerald-400">
              {widget.trend === 'up' && <TrendingUp size={11} />}
              {widget.trend === 'down' && <TrendingDown size={11} className="text-red-400" />}
              {widget.trend === 'neutral' && <Minus size={11} className="text-slate-400" />}
              <span>{widget.trendValue}</span>
            </div>
          )}
        </div>

        {widget.subValue && (
          <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
            {widget.subValue}
          </div>
        )}
      </div>
    </div>
  );
}
