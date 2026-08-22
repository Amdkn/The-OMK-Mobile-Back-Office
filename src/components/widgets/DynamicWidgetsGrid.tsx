import React, { useState, useMemo } from 'react';
import { AppId, AppWidget } from '../../types';
import { useOSStore } from '../../store/osStore';
import { AppWidgetRegistry } from '../../services/widgetRegistry';
import { SortableWidgetCard } from './SortableWidgetCard';
import AppWidgetCard from './AppWidgetCard';
import RecentActivityWidget from './RecentActivityWidget';
import { 
  Sparkles, Settings2, Check, Plus, Pin, PinOff, 
  RotateCcw, GripVertical, SlidersHorizontal, X, Activity, LayoutGrid 
} from 'lucide-react';
import { haptics } from '../../services/haptics';
import { useAppEventListener } from '../../hooks/useAppEventBus';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'motion/react';

interface DynamicWidgetsGridProps {
  onOpenApp: (id: AppId) => void;
  widgetCols?: number;
  className?: string;
}

export default function DynamicWidgetsGrid({
  onOpenApp,
  widgetCols = 2,
  className = ''
}: DynamicWidgetsGridProps) {
  const { 
    workspace, 
    notifications, 
    pinnedWidgetIds, 
    widgetOrder,
    togglePinWidget, 
    reorderWidgets 
  } = useOSStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'activity'>('metrics');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Raw widgets generated from registry
  const allWidgets = useMemo(() => {
    return AppWidgetRegistry.getWidgets(workspace, unreadCount);
  }, [workspace, unreadCount]);

  // Order widgets according to store widgetOrder
  const orderedAllWidgets = useMemo(() => {
    const list = [...allWidgets];
    list.sort((a, b) => {
      const idxA = widgetOrder.indexOf(a.id);
      const idxB = widgetOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    return list.map(w => ({
      ...w,
      isPinned: pinnedWidgetIds.includes(w.id)
    }));
  }, [allWidgets, widgetOrder, pinnedWidgetIds]);

  // Pinned widgets for the top dashboard
  const pinnedWidgets = useMemo(() => {
    return orderedAllWidgets.filter(w => pinnedWidgetIds.includes(w.id));
  }, [orderedAllWidgets, pinnedWidgetIds]);

  // Determine how many widgets to display on home screen
  const maxDisplayCount = widgetCols >= 4 ? 4 : widgetCols === 3 ? 3 : 2;
  const visibleWidgets = isCustomizing 
    ? pinnedWidgets 
    : pinnedWidgets.slice(0, maxDisplayCount);

  // Configure sensors for drag & drop
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    haptics.trigger('dragStart');
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id as string);
      const newIndex = widgetOrder.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        haptics.trigger('dragDrop');
        reorderWidgets(oldIndex, newIndex);
      }
    } else {
      haptics.trigger('light');
    }
    setActiveDragId(null);
  };

  const activeWidgetDef = useMemo(() => {
    return activeDragId ? allWidgets.find(w => w.id === activeDragId) : null;
  }, [activeDragId, allWidgets]);

  const gridColsClass = 
    widgetCols >= 4 
      ? 'grid-cols-4' 
      : widgetCols === 3 
      ? 'grid-cols-3' 
      : 'grid-cols-2';

  return (
    <div className={`shrink-0 ${className}`}>
      {/* Header bar with View Toggle & Customize Toggle */}
      <div className="flex items-center justify-between px-1 mb-2">
        {/* Tab switch between Live Metrics & Recent Activity */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => {
              haptics.trigger('selection');
              setActiveTab('metrics');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === 'metrics'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid size={11} />
            <span>Widgets</span>
          </button>
          
          <button
            onClick={() => {
              haptics.trigger('selection');
              setActiveTab('activity');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === 'activity'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={11} />
            <span>Activité</span>
          </button>
        </div>

        {activeTab === 'metrics' ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                haptics.trigger('selection');
                setShowManagerModal(true);
              }}
              title="Gérer les widgets"
              className="p-1 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1 px-2 transition-colors"
            >
              <SlidersHorizontal size={11} />
              <span>Gérer</span>
            </button>
            
            <button
              onClick={() => {
                haptics.trigger('selection');
                setIsCustomizing(prev => !prev);
              }}
              title={isCustomizing ? "Terminer" : "Réorganiser"}
              className={`p-1 rounded-lg border text-[10px] flex items-center gap-1 px-2 transition-colors ${
                isCustomizing 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold' 
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isCustomizing ? <Check size={11} /> : <Settings2 size={11} />}
              <span>{isCustomizing ? 'Terminé' : 'Organiser'}</span>
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Sync live
          </span>
        )}
      </div>

      {/* Main Content Area: Tab Dependent */}
      {activeTab === 'activity' ? (
        <RecentActivityWidget onOpenApp={onOpenApp} maxItems={5} />
      ) : (
        /* Grid of sortable and pinnable widgets */
        visibleWidgets.length === 0 ? (
          <div 
            onClick={() => setShowManagerModal(true)}
            className="p-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 text-center cursor-pointer hover:border-emerald-500/40 transition-colors"
          >
            <Sparkles size={16} className="mx-auto mb-1 text-slate-500" />
            <p className="text-xs font-semibold text-slate-400">Aucun widget épinglé</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Cliquez sur Gérer pour afficher des métriques clés</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleWidgets.map(w => w.id)}
              strategy={rectSortingStrategy}
            >
              <div className={`grid ${gridColsClass} gap-2.5`}>
                {visibleWidgets.map(widget => (
                  <SortableWidgetCard
                    key={widget.id}
                    widget={widget}
                    onClick={onOpenApp}
                    isCustomizing={isCustomizing}
                    onTogglePin={togglePinWidget}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
              {activeWidgetDef ? (
                <AppWidgetCard
                  widget={activeWidgetDef}
                  onClick={() => {}}
                  isCustomizing
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      )}

      {/* Modal / Drawer for Full Widget Library Management */}
      <AnimatePresence>
        {showManagerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManagerModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg max-h-[85vh] bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <SlidersHorizontal size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Bibliothèque des AppWidgets</h3>
                    <p className="text-[11px] text-slate-400">Épinglez et configurez les résumés de modules sur l'écran d'accueil</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowManagerModal(false)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Widget Catalog List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-hide">
                {orderedAllWidgets.map(widget => {
                  const isPinned = pinnedWidgetIds.includes(widget.id);
                  const Icon = widget.icon;

                  return (
                    <div
                      key={widget.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isPinned 
                          ? 'bg-slate-900/80 border-slate-700 shadow-md' 
                          : 'bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {Icon && (
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-200">
                            <Icon size={16} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200 truncate">{widget.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {widget.category || widget.appId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-slate-200">{widget.value}</span>
                            <span>•</span>
                            <span className="truncate">{widget.subValue}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          haptics.trigger('selection');
                          togglePinWidget(widget.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isPinned
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400'
                            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                        }`}
                      >
                        {isPinned ? <Pin size={12} className="fill-current" /> : <Plus size={12} />}
                        <span>{isPinned ? 'Épinglé' : 'Ajouter'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowManagerModal(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  Valider et Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
