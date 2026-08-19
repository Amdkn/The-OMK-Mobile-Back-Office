import { Briefcase, BarChart3, TrendingUp } from 'lucide-react';

export default function JaaSJob() {
  return (
    <div className="p-6 pt-8 h-full overflow-y-auto pb-12">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
          <div className="text-slate-500 mb-2"><Briefcase size={20} /></div>
          <div className="text-2xl font-light text-slate-100">142</div>
          <div className="text-xs text-slate-400 mt-1">Profils diffusés</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
          <div className="text-emerald-500 mb-2"><TrendingUp size={20} /></div>
          <div className="text-2xl font-light text-slate-100">28%</div>
          <div className="text-xs text-slate-400 mt-1">Taux de réponse</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-blue-500" size={20} />
          <h3 className="font-medium text-slate-200">Campagne en cours</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">LinkedIn Outreach</span>
              <span className="text-blue-400">85%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Email Colding</span>
              <span className="text-emerald-400">42%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[42%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
