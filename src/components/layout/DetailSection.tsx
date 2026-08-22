import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, LucideIcon } from 'lucide-react';

export interface KPIItem {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ElementType;
  accentColor?: string;
}

export interface DetailSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ElementType;
  kpis?: KPIItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Responsive DetailSection Layout
 * Automatically detects viewport constraints & orientation shifts to dynamically adjust padding
 */
export default function DetailSection({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  icon: Icon,
  kpis,
  actions,
  children,
  className = ''
}: DetailSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      const height = containerRef.current?.offsetHeight || window.innerHeight;
      setIsCompact(width < 380);
      setIsLandscape(width > height && width > 480);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Dynamic responsive padding based on container dimensions
  const dynamicPadding = isCompact
    ? 'px-3 pt-2.5 pb-24 space-y-3'
    : isLandscape
    ? 'px-6 pt-3 pb-24 space-y-4'
    : 'px-4 pt-3.5 pb-24 space-y-4';

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col overflow-y-auto scrollbar-hide theme-transition ${dynamicPadding} ${className}`}
    >
      {/* Header Banner (if provided) */}
      {(title || subtitle || Icon || badge || actions) && (
        <div className={`bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl ${
          isCompact ? 'p-3.5' : 'p-4.5'
        } shadow-lg relative overflow-hidden theme-transition`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`${
                  isCompact ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl'
                } bg-slate-950/80 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner`}>
                  <Icon size={isCompact ? 16 : 20} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {title && (
                    <h2 className={`${
                      isCompact ? 'text-sm' : 'text-base'
                    } font-semibold text-slate-100 tracking-tight`}>
                      {title}
                    </h2>
                  )}
                  {badge && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="shrink-0 flex items-center gap-1.5">{actions}</div>}
          </div>

          {/* KPI Mini-Grid inside header */}
          {kpis && kpis.length > 0 && (
            <div className={`grid ${
              kpis.length === 1 ? 'grid-cols-1' : kpis.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            } gap-2.5 mt-3 pt-3 border-t border-slate-800/80`}>
              {kpis.map((kpi, idx) => (
                <div key={idx} className="flex flex-col bg-slate-950/50 rounded-2xl p-2.5 border border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="truncate">{kpi.label}</span>
                    {kpi.icon && <kpi.icon size={12} className="opacity-70 text-slate-300" />}
                  </div>
                  <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold text-slate-100 mt-1 truncate`}>
                    {kpi.value}
                  </div>
                  {kpi.sub && (
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      {kpi.trend === 'up' && <span className="text-emerald-400 font-medium">↑</span>}
                      {kpi.trend === 'down' && <span className="text-red-400 font-medium">↓</span>}
                      <span className="truncate">{kpi.sub}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Section Content */}
      <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
        {children}
      </div>
    </div>
  );
}

/**
 * Standardized Card Component for Depth & Hierarchy
 */
export interface DetailCardProps {
  key?: React.Key;
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  badge?: string;
  badgeColor?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
}

export function DetailCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor,
  actions,
  children,
  className = '',
  onClick,
  isInteractive = false
}: DetailCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 md:p-5 shadow-lg relative overflow-hidden theme-transition ${
        isInteractive || onClick ? 'cursor-pointer hover:border-slate-700 active:scale-[0.99] transition-all' : ''
      } ${className}`}
    >
      {(title || Icon || badge || actions) && (
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-7 h-7 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                <Icon size={15} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {title && <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</span>}
                {badge && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Standardized AI Insight Banner
 */
export interface AIInsightCardProps {
  key?: React.Key;
  title?: string;
  content: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AIInsightCard({
  title = 'Coach AI Insight',
  content,
  actionLabel,
  onAction
}: AIInsightCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950/70 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-4 shadow-lg theme-transition">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
        <Sparkles size={15} className="animate-pulse" />
        <span>{title}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-3 w-full py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-xs font-medium text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{actionLabel}</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
