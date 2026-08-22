import React, { useState, useMemo } from 'react';
import { AppId, AppDefinition } from '../types';
import { useOSStore } from '../store/osStore';
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
import { 
  Bot, Scale, Users, Server, WalletCards, PhoneCall, TerminalSquare, 
  LockKeyhole, Settings, LayoutDashboard, Landmark, HardHat, PieChart,
  Users2, LineChart, Cpu, Network, Lightbulb, UserCog, Activity, DollarSign
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
  const { lock, gridAppOrder, reorderGridApps, workspace } = useOSStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeDragId, setActiveDragId] = useState<AppId | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { 
      activationConstraint: { 
        distance: 8 
      } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 200, 
        tolerance: 6 
      } 
    }),
    useSensor(KeyboardSensor)
  );
  
  // Dock apps are static in this implementation
  const dockApps = APPS.filter(a => a.inDock);

  // Map the ordered IDs back to actual AppDefinitions, filtering out any missing ones
  const orderedGridApps = useMemo(() => {
    return gridAppOrder
      .map(id => APPS.find(a => a.id === id))
      .filter((a): a is AppDefinition => a !== undefined);
  }, [gridAppOrder]);

  const activeAppDef = useMemo(() => {
    return activeDragId ? APPS.find(a => a.id === activeDragId) : null;
  }, [activeDragId]);

  const PAGE_1_CAPACITY = 8;
  const PAGE_N_CAPACITY = 16;
  
  const page1Apps = orderedGridApps.slice(0, PAGE_1_CAPACITY);
  const remainingApps = orderedGridApps.slice(PAGE_1_CAPACITY);
  const extraPages = [];
  for (let i = 0; i < remainingApps.length; i += PAGE_N_CAPACITY) {
    extraPages.push(remainingApps.slice(i, i + PAGE_N_CAPACITY));
  }
  const totalPages = 1 + extraPages.length;

  const handleAppClick = (id: AppId) => {
    if (id === 'lock') {
      lock();
    } else {
      onOpenApp(id);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const page = Math.round(scrollLeft / width);
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as AppId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = gridAppOrder.indexOf(active.id as AppId);
      const newIndex = gridAppOrder.indexOf(over.id as AppId);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderGridApps(oldIndex, newIndex);
      }
    }
    setActiveDragId(null);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10 pt-14 pb-5 overflow-hidden theme-transition select-none">
      {/* OMK Global Search Component */}
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
            {/* Page 1 (Widgets + 8 Apps) */}
            <div className="w-full h-full flex-shrink-0 snap-center flex flex-col px-6">
              {/* Top Business Status Widgets */}
              <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                <div 
                  onClick={() => onOpenApp('coach-ai')}
                  className="bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 p-3.5 rounded-3xl flex flex-col justify-between shadow-lg cursor-pointer transition-all hover:border-emerald-500/30 group theme-transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Coach OS</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">{workspace}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Activity size={12} className="text-emerald-500" /> Prêt pour requêtes
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => onOpenApp('finance')}
                  className="bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 p-3.5 rounded-3xl flex flex-col justify-between shadow-lg cursor-pointer transition-all hover:border-emerald-500/30 group theme-transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Trésorerie</span>
                    <DollarSign size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">$124,500</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Règle des 5 active</div>
                  </div>
                </div>
              </div>

              {/* 4-Column Aligned Application Grid */}
              <div className="grid grid-cols-4 gap-x-3 gap-y-4 content-start flex-1">
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
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex flex-col px-6 pt-1">
                <div className="grid grid-cols-4 gap-x-3 gap-y-4 content-start flex-1">
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
        <div className="flex justify-center gap-1.5 mt-1 mb-2 shrink-0 h-3 items-center">
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
      <div className="mt-auto shrink-0 px-6 pt-1">
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 rounded-[2.2rem] p-3 flex justify-around shadow-xl theme-transition">
          {dockApps.map(app => (
            <button 
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex flex-col items-center group relative focus:outline-none"
              title={app.name}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${app.color} shadow-md group-hover:scale-105 active:scale-95 transition-all`}>
                <app.icon size={22} strokeWidth={1.5} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
