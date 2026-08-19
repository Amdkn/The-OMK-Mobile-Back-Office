import { MapPin, PhoneCall, Star, TrendingUp } from 'lucide-react';

export default function Leads() {
  return (
    <div className="p-6 pt-8 h-full overflow-y-auto pb-12">
      <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-900/50 rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-400" size={20} />
            <span className="font-medium text-slate-200">Google Business</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={16} fill="currentColor" />
            <span className="font-medium">4.9</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-light text-white mb-1">2,450</div>
            <div className="text-xs text-slate-400">Vues (30j)</div>
          </div>
          <div>
            <div className="text-3xl font-light text-white mb-1">142</div>
            <div className="text-xs text-slate-400">Interactions</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-sm font-bold tracking-widest uppercase text-slate-500">Appels Entrants</div>
        <div className="flex items-center gap-1 text-xs text-emerald-500">
          <TrendingUp size={14} />
          <span>+12%</span>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { id: 1, name: 'Client Potentiel', number: '+33 6 12 34 56 78', time: '14:30', duration: '5m 23s', status: 'completed' },
          { id: 2, name: 'Anonyme', number: 'Numéro masqué', time: '11:15', duration: '0s', status: 'missed' },
          { id: 3, name: 'Partenaire Local', number: '+33 1 23 45 67 89', time: 'Hier', duration: '12m 45s', status: 'completed' },
        ].map(call => (
          <div key={call.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${call.status === 'missed' ? 'bg-red-900/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                <PhoneCall size={18} />
              </div>
              <div>
                <div className="font-medium text-sm text-slate-200">{call.name}</div>
                <div className="text-xs text-slate-500">{call.number}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-0.5">{call.time}</div>
              <div className={`text-xs ${call.status === 'missed' ? 'text-red-400' : 'text-slate-500'}`}>
                {call.status === 'missed' ? 'Manqué' : call.duration}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
