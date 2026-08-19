import { Server, Cpu, HardDrive, Activity } from 'lucide-react';

export default function PaaSPro() {
  return (
    <div className="p-6 pt-8 h-full overflow-y-auto pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute" />
          <div className="w-3 h-3 bg-emerald-500 rounded-full relative" />
        </div>
        <div className="text-lg font-medium text-slate-200">Cluster US-East-1</div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-900/20 text-blue-500 rounded-xl">
            <Cpu size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200 mb-1">CPU Usage</div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[34%]" />
            </div>
          </div>
          <div className="text-sm font-mono text-slate-400">34%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-900/20 text-purple-500 rounded-xl">
            <Activity size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200 mb-1">Memory</div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[68%]" />
            </div>
          </div>
          <div className="text-sm font-mono text-slate-400">11.2GB</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-900/20 text-amber-500 rounded-xl">
            <HardDrive size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200 mb-1">Storage</div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[82%]" />
            </div>
          </div>
          <div className="text-sm font-mono text-slate-400">820GB</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-4 px-1">Active Nodes</div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {[1, 2, 3].map(node => (
            <div key={node} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0">
              <div className="flex items-center gap-3">
                <Server size={16} className="text-slate-500" />
                <span className="text-sm text-slate-300">Node_0{node}</span>
              </div>
              <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Healthy</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
