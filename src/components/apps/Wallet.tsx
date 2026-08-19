import { ArrowUpRight, ArrowDownRight, DollarSign, WalletCards } from 'lucide-react';

export default function Wallet() {
  return (
    <div className="p-6 pt-8 h-full overflow-y-auto scrollbar-hide pb-12">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <WalletCards size={100} />
        </div>
        <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-1">Solde Total</div>
        <div className="text-4xl font-light text-white mb-6">$12,450.00</div>
        
        <div className="flex gap-3">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <ArrowUpRight size={18} />
            Retrait Stripe
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700">
            <ArrowDownRight size={18} />
            Dépôt
          </button>
        </div>
      </div>

      <div className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-4 px-1">Transactions Récentes</div>
      <div className="space-y-3">
        {[
          { id: 1, title: 'Affiliation OMK', date: 'Aujourd\'hui, 14:20', amount: '+$450.00', type: 'in' },
          { id: 2, title: 'Serveur AWS', date: 'Hier, 09:15', amount: '-$120.00', type: 'out' },
          { id: 3, title: 'Client Coaching', date: '15 Août, 18:00', amount: '+$1,200.00', type: 'in' },
          { id: 4, title: 'Stripe Payout', date: '12 Août, 08:30', amount: '-$2,000.00', type: 'out' },
        ].map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                {tx.type === 'in' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div>
                <div className="font-medium text-sm text-slate-200">{tx.title}</div>
                <div className="text-xs text-slate-500">{tx.date}</div>
              </div>
            </div>
            <div className={`font-medium ${tx.type === 'in' ? 'text-emerald-400' : 'text-slate-300'}`}>
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
