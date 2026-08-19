import { ShieldCheck, FileText, Landmark } from 'lucide-react';

export default function BaaSHub() {
  return (
    <div className="p-6 pt-8 h-full overflow-y-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900/30 text-blue-500 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-xl font-medium text-slate-100">OMK LLC</div>
            <div className="text-sm text-slate-400">Wyoming, USA</div>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-slate-800">
          <span className="text-sm text-slate-400">Statut</span>
          <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-medium rounded-md">Actif - Good Standing</span>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-slate-800">
          <span className="text-sm text-slate-400">EIN Number</span>
          <span className="text-sm font-mono text-slate-300">XX-XXXX892</span>
        </div>
      </div>

      <div className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-4 px-1">Documents Légaux</div>
      <div className="space-y-3">
        <div className="flex items-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl gap-4">
          <FileText size={20} className="text-slate-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">Articles of Organization</div>
            <div className="text-xs text-slate-500">PDF • 1.2 MB</div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl gap-4">
          <Landmark size={20} className="text-slate-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">Tax Form 1099-K</div>
            <div className="text-xs text-slate-500">PDF • 450 KB</div>
          </div>
        </div>
      </div>
    </div>
  );
}
