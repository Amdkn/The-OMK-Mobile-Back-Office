import React, { useState, useMemo } from 'react';
import { AppId, AppDefinition } from '../types';
import { useOSStore } from '../store/osStore';
import { haptics } from '../services/haptics';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useAppEventListener } from '../hooks/useAppEventBus';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  TouchSensor,
  MouseSensor,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableAppIcon, AppIconView } from './SortableAppIcon';
import GlobalSearch from './GlobalSearch';
import DynamicWidgetsGrid from './widgets/DynamicWidgetsGrid';
import { 
  Bot, Scale, Users, Server, WalletCards, PhoneCall, TerminalSquare, 
  LockKeyhole, Settings, LayoutDashboard, Landmark, HardHat, PieChart,
  Users2, LineChart, Cpu, Network, Lightbulb, UserCog
} from 'lucide-react';

export const APPS: AppDefinition[] = [
  { id: 'coach-ai', name: 'Coach AI', icon: Bot, color: 'bg-emerald-950 text-emerald-400 border-emerald-900', inDock: true },
  { id: 'baas-hub', name: 'BaaS Hub', icon: Scale, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'jaas-job', name: 'JaaS JOB', icon: Users, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'paas-pro', name: 'PaaS PRO', icon: Server, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'wallet', name: 'Wallet', icon: WalletCards, color: 'bg-slate-900 text-slate-300 border-slate-800', inDock: true },
  { id: 'leads', name: 'Leads', icon: PhoneCall, color: 'bg-slate-900 text-slate-300 border-slate-800', inDock: true },
  { id: 'terminal', name: 'Terminal', icon: TerminalSquare, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'finance', name: 'Finance', icon: Landmark, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'operations', name: 'Operations', icon: HardHat, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'sales', name: 'Sales OS', icon: PieChart, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'clients', name: 'Clients', icon: Users2, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'growth', name: 'Growth', icon: LineChart, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'product', name: 'Product', icon: Cpu, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'ontology', name: 'Ontology', icon: Network, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'cognition', name: 'Cognition', icon: Lightbulb, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'hr', name: 'People / HR', icon: UserCog, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'lock', name: 'Lock', icon: LockKeyhole, color: 'bg-red-950/30 text-red-400 border-red-900/50', inDock: true },
];

export default function HomeScreen({ onOpenApp }: { onOpenApp: (id: AppId) => void }) {
  const { lock, gridAppOrder, reorderGridApps } = useOSStore();
  const layout = useResponsiveLayout();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeDragId, setActiveDragId] = useState<AppId | null>(null);

  // Configure touch sensor with 250ms long-press delay for mobile tactile feel
  const sensors = useSensors(
    useSensor(MouseSensor, { 
      activationConstraint: { 
        distance: 8 
      } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 250, 
        tolerance: 6 
      } 
    }),
    useSensor(KeyboardSensor)
  );
  
  // Dock apps
  const dockApps = APPS.filter(a => a.inDock);

  // Map the ordered IDs back to actual AppDefinitions
  const orderedGridApps = useMemo(() => {
    return gridAppOrder
      .map(id => APPS.find(a => a.id === id))
      .filter((a): a is AppDefinition => a !== undefined);
  }, [gridAppOrder]);

  const activeAppDef = useMemo(() => {
    return activeDragId ? APPS.find(a => a.id === activeDragId) : null;
  }, [activeDragId]);

  // Dynamic pagination capacities based on orientation & grid columns
  const PAGE_1_CAPACITY = layout.isLandscape || layout.isTablet ? layout.gridCols * 2 : 8;
  const PAGE_N_CAPACITY = layout.isLandscape || layout.isTablet ? layout.gridCols * 3 : 16;
  
  const page1Apps = orderedGridApps.slice(0, PAGE_1_CAPACITY);
  const remainingApps = orderedGridApps.slice(PAGE_1_CAPACITY);
  const extraPages = [];
  for (let i = 0; i < remainingApps.length; i += PAGE_N_CAPACITY) {
    extraPages.push(remainingApps.slice(i, i + PAGE_N_CAPACITY));
  }
  const totalPages = 1 + extraPages.length;

  const handleAppClick = (id: AppId) => {
    if (id === 'lock') {
      haptics.trigger('heavy');
      lock();
    } else {
      haptics.trigger('appLaunch');
      onOpenApp(id);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const page = Math.round(scrollLeft / width);
    if (page !== currentPage) {
      haptics.trigger('selection');
      setCurrentPage(page);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    haptics.trigger('dragStart');
    setActiveDragId(event.active.id as AppId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = gridAppOrder.indexOf(active.id as AppId);
      const newIndex = gridAppOrder.indexOf(over.id as AppId);
      if (oldIndex !== -1 && newIndex !== -1) {
        haptics.trigger('dragDrop');
        reorderGridApps(oldIndex, newIndex);
      }
    } else {
      haptics.trigger('light');
    }
    setActiveDragId(null);
  };

  const handleDragCancel = () => {
    haptics.trigger('light');
    setActiveDragId(null);
  };

  const gridColsClass = 
    layout.gridCols >= 6 
      ? 'grid-cols-6' 
      : layout.gridCols === 5 
      ? 'grid-cols-5' 
      : 'grid-cols-4';

  return (
    <div className={`flex flex-col h-full w-full relative z-10 ${
      layout.isLandscape ? 'pt-11 pb-3' : 'pt-14 pb-5'
    } overflow-hidden theme-transition select-none`}>
      {/* OMK Global Search & Voice Command Component */}
      <GlobalSearch onOpenApp={onOpenApp} />

      {/* Scrollable Pagination & App Grid Area */}
      <div 
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext 
            items={gridAppOrder}
            strategy={rectSortingStrategy}
          >
            {/* Page 1: Dynamic OMK AppWidgets Dashboard + First Page Apps */}
            <div className={`w-full h-full flex-shrink-0 snap-center flex flex-col ${
              layout.isLandscape ? 'px-4' : 'px-6'
            }`}>
              {/* Dynamic AppWidgets System */}
              <DynamicWidgetsGrid 
                onOpenApp={onOpenApp} 
                widgetCols={layout.widgetCols}
                className="mb-3"
              />

              {/* Responsive Aligned Application Grid */}
              <div className={`grid ${gridColsClass} gap-x-3 gap-y-3.5 content-start flex-1 overflow-y-auto scrollbar-hide`}>
                {page1Apps.map(app => (
                  <SortableAppIcon 
                    key={app.id} 
                    app={app} 
                    onClick={() => handleAppClick(app.id)} 
                  />
                ))}
              </div>
            </div>

            {/* Page 2+ Additional App Pages */}
            {extraPages.map((pageApps, idx) => (
              <div key={idx} className={`w-full h-full flex-shrink-0 snap-center flex flex-col ${
                layout.isLandscape ? 'px-4 pt-1' : 'px-6 pt-1'
              }`}>
                <div className={`grid ${gridColsClass} gap-x-3 gap-y-3.5 content-start flex-1 overflow-y-auto scrollbar-hide`}>
                  {pageApps.map(app => (
                    <SortableAppIcon 
                      key={app.id} 
                      app={app} 
                      onClick={() => handleAppClick(app.id)} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </SortableContext>

          {/* Smooth Drag Overlay to avoid layout collapse */}
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeAppDef ? (
              <AppIconView app={activeAppDef} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-1 mb-1.5 shrink-0 h-3 items-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage ? 'bg-slate-200 w-4' : 'bg-slate-700 w-1.5'
              }`} 
            />
          ))}
        </div>
      )}

      {/* Persistent Dock with High-Contrast Frosted Container */}
      <div className={`mt-auto shrink-0 ${layout.isLandscape ? 'px-4 pt-0.5' : 'px-6 pt-1'}`}>
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 rounded-[2.2rem] p-2.5 sm:p-3 flex justify-around shadow-xl theme-transition">
          {dockApps.map(app => (
            <button 
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex flex-col items-center group relative focus:outline-none"
              title={app.name}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border ${app.color} shadow-md group-hover:scale-105 active:scale-95 transition-all`}>
                <app.icon size={21} strokeWidth={1.5} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
