import { AppId, AppDefinition } from '../types';
import { 
  Bot, 
  Scale, 
  Users, 
  Server, 
  WalletCards, 
  PhoneCall, 
  TerminalSquare, 
  LockKeyhole 
} from 'lucide-react';

const APPS: AppDefinition[] = [
  { id: 'coach-ai', name: 'Coach AI', icon: Bot, color: 'bg-emerald-950 text-emerald-400 border-emerald-900', inDock: true },
  { id: 'baas-hub', name: 'BaaS Hub', icon: Scale, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'jaas-job', name: 'JaaS JOB', icon: Users, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'paas-pro', name: 'PaaS PRO', icon: Server, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'wallet', name: 'Wallet', icon: WalletCards, color: 'bg-slate-900 text-slate-300 border-slate-800', inDock: true },
  { id: 'leads', name: 'Leads', icon: PhoneCall, color: 'bg-slate-900 text-slate-300 border-slate-800', inDock: true },
  { id: 'terminal', name: 'Terminal', icon: TerminalSquare, color: 'bg-slate-900 text-slate-300 border-slate-800' },
  { id: 'lock', name: 'Lock', icon: LockKeyhole, color: 'bg-red-950/30 text-red-400 border-red-900/50', inDock: true },
];

export default function HomeScreen({ onOpenApp }: { onOpenApp: (id: AppId) => void }) {
  const gridApps = APPS.filter(a => !a.inDock);
  const dockApps = APPS.filter(a => a.inDock);

  return (
    <div className="flex flex-col h-full w-full relative z-10 px-6 pt-16 pb-6">
      {/* Widgets */}
      <div className="grid grid-cols-2 gap-4 mb-8">
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

      {/* Grid */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-6">
        {gridApps.map(app => (
          <button 
            key={app.id} 
            onClick={() => onOpenApp(app.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${app.color} shadow-lg active:scale-95 transition-transform`}>
              <app.icon size={28} strokeWidth={1.5} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Dock */}
      <div className="mt-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-4 flex justify-around">
          {dockApps.map(app => (
            <button 
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center group relative"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${app.color} shadow-lg active:scale-95 transition-transform`}>
                <app.icon size={24} strokeWidth={1.5} />
              </div>
              {/* Optional dot indicator for active/notifications could go here */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
