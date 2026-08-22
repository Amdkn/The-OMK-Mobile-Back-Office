import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../store/osStore';
import { NotificationCategory, OSNotification, AppId } from '../types';
import { 
  Bell, CheckCheck, Trash2, X, PlusCircle, ExternalLink,
  DollarSign, Briefcase, Server, ShieldCheck, Sparkles, UserCheck,
  AlertTriangle, Info, CheckCircle2, AlertOctagon
} from 'lucide-react';

interface Props {
  onOpenApp: (id: AppId) => void;
}

export default function NotificationCenter({ onOpenApp }: Props) {
  const { 
    notifications, 
    isNotificationCenterOpen, 
    closeNotificationCenter, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    clearAllNotifications,
    simulateIncomingAlert,
    theme,
    contrast
  } = useOSStore();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') return notifications;
    return notifications.filter(n => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'finance': return DollarSign;
      case 'sales': return Briefcase;
      case 'operations': return Server;
      case 'security': return ShieldCheck;
      case 'coach': return Sparkles;
      case 'hr': return UserCheck;
      default: return Bell;
    }
  };

  const getSeverityBadge = (severity: OSNotification['severity']) => {
    switch (severity) {
      case 'urgent':
        return {
          icon: AlertOctagon,
          className: 'bg-red-500/15 text-red-400 border-red-500/30',
          dot: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500'
        };
      case 'success':
        return {
          icon: CheckCircle2,
          className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500'
        };
      case 'info':
      default:
        return {
          icon: Info,
          className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500'
        };
    }
  };

  const categories: { id: NotificationCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'finance', label: 'Finances' },
    { id: 'sales', label: 'Sales' },
    { id: 'operations', label: 'Opérations' },
    { id: 'security', label: 'Sécurité' },
    { id: 'hr', label: 'RH' },
    { id: 'coach', label: 'Coach' },
  ];

  if (!isNotificationCenterOpen) return null;

  return (
    <AnimatePresence>
      {isNotificationCenterOpen && (
        <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-start pointer-events-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNotificationCenter}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Slide-over Drawer */}
          <motion.div 
            initial={{ y: '-100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-h-[85%] bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 rounded-b-[2rem] shadow-2xl flex flex-col pt-12 pb-4 overflow-hidden theme-transition"
          >
            {/* Header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bell size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100 tracking-tight">Centre de Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Flux d'alertes & télémétrie business</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={simulateIncomingAlert}
                  title="Simuler une alerte entrant"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-1 text-[11px] font-medium"
                >
                  <PlusCircle size={14} className="text-emerald-500" />
                  <span className="hidden sm:inline">Alerte Test</span>
                </button>

                <button
                  onClick={closeNotificationCenter}
                  className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Action Bar & Filter Chips */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800/50 gap-2 shrink-0 bg-slate-900/40">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5 flex-1">
                {categories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 border ${
                        isActive
                          ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
                          : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    title="Tout marquer comme lu"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  >
                    <CheckCheck size={15} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    title="Tout effacer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 max-h-[420px] scrollbar-hide">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-600 mb-2">
                    <Bell size={20} />
                  </div>
                  <div className="text-xs font-medium text-slate-400">Aucune notification</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Le flux des modules est parfaitement synchronisé</div>
                  <button
                    onClick={simulateIncomingAlert}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-medium transition-all"
                  >
                    Générer une alerte de test
                  </button>
                </div>
              ) : (
                filteredNotifications.map(notification => {
                  const CatIcon = getCategoryIcon(notification.category);
                  const badge = getSeverityBadge(notification.severity);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                        notification.isRead
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                          : 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-md ring-1 ring-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 ${
                          notification.isRead ? 'text-slate-400' : 'text-emerald-400'
                        }`}>
                          <CatIcon size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot} ${!notification.isRead ? 'animate-pulse' : 'opacity-60'}`} />
                              <h3 className={`text-xs font-semibold truncate ${notification.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                                {notification.title}
                              </h3>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">{notification.timestamp}</span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mt-0.5">
                            {notification.description}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.className}`}>
                              {notification.category.toUpperCase()}
                            </span>

                            <div className="flex items-center gap-2">
                              {notification.actionLabel && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markNotificationAsRead(notification.id);
                                    onOpenApp(notification.module);
                                  }}
                                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                                >
                                  <span>{notification.actionLabel}</span>
                                  <ExternalLink size={11} />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                title="Supprimer"
                                className="opacity-60 hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Handle Bar Indicator for Pull-up Dismiss */}
            <div className="flex justify-center pt-2">
              <div 
                onClick={closeNotificationCenter}
                className="w-12 h-1 bg-slate-700/80 rounded-full cursor-pointer hover:bg-slate-500 transition-colors"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
