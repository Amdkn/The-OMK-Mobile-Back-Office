import { useState, useMemo } from 'react';
import { AppId, AppDefinition } from '../types';
import { useOSStore } from '../store/osStore';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor
} from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableAppIcon } from './SortableAppIcon';
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
  const [currentPage, setCurrentPage] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = gridAppOrder.indexOf(active.id as AppId);
      const newIndex = gridAppOrder.indexOf(over.id as AppId);
      reorderGridApps(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10 pt-16 pb-6 overflow-hidden">
      {/* Scrollable Pagination Area */}
      <div 
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={gridAppOrder}
            strategy={rectSortingStrategy}
          >
            {/* Page 1 (Widgets + 8 Apps) */}
            <div className="w-full h-full flex-shrink-0 snap-center flex flex-col px-6">
              <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 p-4 rounded-3xl flex flex-col justify-between">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-500 mb-2">Coach OS</div>
                  <div className="text-xl font-medium">En ligne</div>
                  <div className="text-xs text-slate-400 mt-1">Prêt pour les requêtes</div>
                </div>
                <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 p-4 rounded-3xl flex flex-col justify-between">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Règle des 5</div>
                  <div className="text-xl font-medium text-blue-400">$12,450</div>
                  <div className="text-xs text-slate-400 mt-1">Trésorerie active</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-x-4 gap-y-6 content-start">
                {page1Apps.map(app => (
                  <SortableAppIcon key={app.id} app={app} onClick={() => handleAppClick(app.id)} />
                ))}
              </div>
            </div>

            {/* Page 2+ */}
            {extraPages.map((pageApps, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex flex-col px-6 pt-2">
                <div className="grid grid-cols-4 gap-x-4 gap-y-6 content-start">
                  {pageApps.map(app => (
                    <SortableAppIcon key={app.id} app={app} onClick={() => handleAppClick(app.id)} />
                  ))}
                </div>
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2 mb-2 shrink-0 h-4 items-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentPage ? 'bg-slate-200' : 'bg-slate-700'}`} 
            />
          ))}
        </div>
      )}

      {/* Dock */}
      <div className="mt-auto shrink-0 px-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-4 flex justify-around">
          {dockApps.map(app => (
            <button 
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex flex-col items-center group relative"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${app.color} shadow-lg active:scale-95 transition-transform`}>
                <app.icon size={24} strokeWidth={1.5} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
