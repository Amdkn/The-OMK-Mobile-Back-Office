import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Activity, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { Client, InvoiceItem } from '../../../services/clientStorage';
import { haptics } from '../../../services/haptics';

interface ClientMetricsTabProps {
  client: Client;
  onToast: (msg: string) => void;
}

export default function ClientMetricsTab({ client, onToast }: ClientMetricsTabProps) {
  const [metricView, setMetricView] = useState<'revenue' | 'usage'>('revenue');

  const annualArr = client.mrr * 12;
  const seats = client.seatsCount || 30;
  const priceSeat = client.pricePerSeat || 80;
  const baseLicensing = seats * priceSeat;
  const addOns = Math.max(0, client.mrr - baseLicensing);

  // Computed usage data for alternate graph
  const usageChartData = (client.revenueHistory || []).map((pt, idx) => ({
    month: pt.month,
    usageCalls: Math.round((pt.revenue / 2.5) * (1 + idx * 0.1)),
    quotaPercent: Math.min(100, Math.round((pt.revenue / client.mrr) * (client.usageMetrics?.quotaUsagePercent || 75)))
  }));

  const handleDownloadInvoice = (inv: InvoiceItem) => {
    haptics.trigger('light');
    onToast(`Facture ${inv.number} (${inv.period}) téléchargée en PDF`);
  };

  const handleApplyUpsell = () => {
    haptics.trigger('medium');
    onToast(`Avenant d'expansion commerciale généré pour ${client.name}`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Financial Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <DollarSign size={12} className="text-emerald-400" />
            <span>MRR Contracté</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            ${client.mrr.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">Facturation {client.billingCycle || 'Mensuel'}</div>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp size={12} className="text-sky-400" />
            <span>ARR Annualisé</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            ${annualArr.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">+24% Net Retention</div>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Users size={12} className="text-purple-400" />
            <span>Licences & Sièges</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            {seats} <span className="text-xs text-slate-400 font-normal">sièges</span>
          </div>
          <div className="text-[10px] text-slate-500">${priceSeat}/siège/mois</div>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap size={12} className="text-amber-400" />
            <span>Potentiel Expansion</span>
          </div>
          <div className="text-sm font-bold font-mono text-amber-400 truncate">
            {client.expansionPotential || '+$3,500/m'}
          </div>
          <div className="text-[10px] text-slate-500">Opportunité IA détectée</div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-slate-200">Dynamique de Croissance du Compte</div>
            <div className="text-[10px] text-slate-400">Évolution consolidée sur les derniers mois</div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                haptics.trigger('light');
                setMetricView('revenue');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                metricView === 'revenue'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revenu MRR ($)
            </button>
            <button
              onClick={() => {
                haptics.trigger('light');
                setMetricView('usage');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                metricView === 'usage'
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Consommation API
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-48 w-full pt-2">
          {metricView === 'revenue' ? (
            client.revenueHistory && client.revenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={client.revenueHistory}>
                  <defs>
                    <linearGradient id="clientMrrGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 12, fontSize: 12 }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenu MRR']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#clientMrrGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Aucun historique disponible</div>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageChartData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 12, fontSize: 12 }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} req`, 'Requêtes API']}
                />
                <Bar dataKey="usageCalls" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Contract & Licensing Breakdown Card */}
      <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
            Structure de l'Offre & Facturation
          </div>
          <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {client.plan || 'Forfait Enterprise Dédié'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Licences de Base ({seats} utilisateurs)</span>
            <span className="font-mono font-semibold text-slate-200">${baseLicensing.toLocaleString()}/mois</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Add-ons Compute & API AI Uncapped</span>
            <span className="font-mono font-semibold text-slate-200">${addOns.toLocaleString()}/mois</span>
          </div>

          <div className="h-px bg-slate-800 my-1" />

          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-200">Total Mensuel Récurrent (MRR)</span>
            <span className="font-mono text-emerald-400 text-sm">${client.mrr.toLocaleString()} HT</span>
          </div>
        </div>
      </div>

      {/* Operational Usage & SLA Telemetry */}
      {client.usageMetrics && (
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-400" />
              Télémétrie & Conformité SLA
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              SLA Respecté
            </span>
          </div>

          {/* Quota Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Consommation Quota API ({client.usageMetrics.apiCallsCount})</span>
              <span className="font-mono font-bold text-slate-200">{client.usageMetrics.quotaUsagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all ${
                  client.usageMetrics.quotaUsagePercent > 85 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`} 
                style={{ width: `${client.usageMetrics.quotaUsagePercent}%` }} 
              />
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
              <div className="text-[9px] text-slate-500">Disponibilité Réelle</div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{client.usageMetrics.uptimeRealtime}</div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
              <div className="text-[9px] text-slate-500">Latence Moyenne</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{client.usageMetrics.averageLatencyMs} ms</div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
              <div className="text-[9px] text-slate-500">Taux d'Erreur 5xx</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{client.usageMetrics.errorRatePercent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Invoicing Ledger (Grand Livre des Factures) */}
      <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt size={13} className="text-slate-400" />
            Historique des Factures ({client.invoices?.length || 0})
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Calendar size={10} />
            Échéance contrat : {client.renewalDate}
          </span>
        </div>

        <div className="space-y-1.5">
          {client.invoices && client.invoices.length > 0 ? (
            client.invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200 text-xs">{inv.number}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      inv.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {inv.status === 'paid' ? 'Payée' : 'En Attente'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Période: {inv.period} • Échéance: {inv.dueDate}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-100 text-xs">
                    ${inv.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDownloadInvoice(inv)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              Aucune facture archivée pour ce cycle.
            </div>
          )}
        </div>
      </div>

      {/* Strategic Notes & Expansion CTA */}
      <div className="p-3.5 bg-gradient-to-br from-emerald-950/30 to-slate-900/90 rounded-2xl border border-emerald-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Sparkles size={13} />
            Recommandation Croissance IA
          </div>
          <button
            onClick={handleApplyUpsell}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all shadow-md active:scale-95"
          >
            <span>Créer Avenant</span>
            <ArrowUpRight size={12} />
          </button>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          Le volume de requêtes de {client.name} approche le seuil de 80% du forfait actuel. Une proposition d'extension vers le palier supérieur permettra de sécuriser <strong>{client.expansionPotential || '+$3,500/mois'}</strong> de MRR additionnel.
        </p>
      </div>
    </div>
  );
}
