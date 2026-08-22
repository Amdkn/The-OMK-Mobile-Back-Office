import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Bot, Sparkles, Check, ArrowRight } from 'lucide-react';

export interface DetailDrawerBreadcrumb {
  label: string;
  onClick?: () => void;
}

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  avatarText?: string;
  icon?: React.ElementType;
  breadcrumbs?: DetailDrawerBreadcrumb[];
  actions?: {
    id: string;
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'primary';
  }[];
  kpis?: {
    label: string;
    value: string | number;
    sub?: string;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  aiInsight?: {
    title?: string;
    content: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  tabs?: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  children?: React.ReactNode;
}

export default function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  avatarText,
  icon: Icon,
  breadcrumbs,
  actions = [],
  kpis = [],
  aiInsight,
  tabs = [],
  children
}: DetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0]?.id || 'main');

  React.useEffect(() => {
    if (tabs.length > 0 && (!activeTab || !tabs.find(t => t.id === activeTab))) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs]);

  const breadcrumbItems: DetailDrawerBreadcrumb[] = breadcrumbs && breadcrumbs.length > 0
    ? breadcrumbs
    : [
        { label: 'Détail', onClick: onClose },
        { label: title || 'Fiche' }
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-slate-950/95 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col h-full z-10 backdrop-blur-2xl theme-transition overflow-hidden"
          >
            {/* Top Bar Header with Breadcrumb (Fil d'Ariane) */}
            <div className="py-2.5 px-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md shrink-0 gap-2">
              {/* Breadcrumb Trail */}
              <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs min-w-0 flex-1 overflow-x-auto scrollbar-hide py-0.5">
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && <ChevronRight size={12} className="text-slate-500 shrink-0 mx-0.5" />}
                      {isLast ? (
                        <span className="font-semibold text-emerald-400 truncate max-w-[140px] sm:max-w-[200px]">
                          {item.label}
                        </span>
                      ) : (
                        <button
                          onClick={item.onClick || onClose}
                          className="text-slate-400 hover:text-slate-200 transition-colors truncate max-w-[100px] shrink-0 font-medium hover:underline"
                        >
                          {item.label}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>

              {/* Status Badge & Close Button */}
              <div className="flex items-center gap-2 shrink-0">
                {badge && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeColor}`}>
                    {badge}
                  </span>
                )}
                <button
                  onClick={onClose}
                  title="Fermer"
                  className="w-7 h-7 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
              {/* Identity Header */}
              <div className="flex items-start gap-4">
                {avatarText ? (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-slate-800 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-400 shadow-inner shrink-0">
                    {avatarText}
                  </div>
                ) : Icon ? (
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon size={24} />
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-slate-100 truncate">{title}</h2>
                  {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              {actions.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {actions.map((act) => {
                    const ActIcon = act.icon;
                    const isDanger = act.variant === 'danger';
                    const isPrimary = act.variant === 'primary';

                    return (
                      <button
                        key={act.id}
                        onClick={act.onClick}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
                          isPrimary
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 font-semibold shadow-md'
                            : isDanger
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-slate-900/80 hover:bg-slate-850 text-slate-300 border-slate-800'
                        }`}
                      >
                        <ActIcon size={16} className={isPrimary ? 'text-slate-950 mb-1' : isDanger ? 'text-red-400 mb-1' : 'text-slate-400 mb-1'} />
                        <span className="text-[10px] font-medium leading-tight text-center truncate max-w-full">
                          {act.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* AI Insight Box */}
              {aiInsight && (
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/30 rounded-3xl p-4 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>{aiInsight.title || 'Diagnostic Coach AI'}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiInsight.content}</p>
                  {aiInsight.actionLabel && (
                    <button
                      onClick={aiInsight.onAction}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{aiInsight.actionLabel}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* KPIs Grid */}
              {kpis.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5">
                  {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">{kpi.label}</div>
                      <div className="text-lg font-bold text-slate-100">{kpi.value}</div>
                      {kpi.sub && <div className="text-[10px] text-slate-500 mt-0.5">{kpi.sub}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tabs if any */}
              {tabs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 px-2 text-xs font-medium rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-slate-800 text-slate-100 shadow-sm font-semibold border border-slate-700/60'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    {tabs.find((t) => t.id === activeTab)?.content}
                  </div>
                </div>
              )}

              {/* Additional Custom Children */}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
