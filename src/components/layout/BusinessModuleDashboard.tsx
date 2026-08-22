import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, Users, Layers, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw, BarChart3, PieChart as PieIcon,
  CheckCircle2, Flame, Sparkles
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { AppId, ThemeId } from '../../types';

interface BusinessModuleDashboardProps {
  appId: AppId;
  appName: string;
}

export default function BusinessModuleDashboard({ appId, appName }: BusinessModuleDashboardProps) {
  const { theme, workspace } = useOSStore();

  // Dynamic Theme Colors configuration for Recharts
  const themeColors = useMemo(() => {
    switch (theme) {
      case 'warm-paper':
        return {
          primary: '#b45309', // Amber-700
          primaryLight: '#d97706', // Amber-600
          secondary: '#c2410c', // Orange-700
          accent: '#0d9488', // Teal-600
          grid: '#e2e8f0',
          text: '#475569',
          bgTooltip: '#ffffff',
          borderTooltip: '#cbd5e1',
          gradientStart: '#d97706',
          gradientEnd: '#fef3c7',
          pieColors: ['#b45309', '#ea580c', '#0d9488', '#eab308', '#64748b']
        };
      case 'cyberpunk':
        return {
          primary: '#facc15', // Yellow-400
          primaryLight: '#fde047',
          secondary: '#22d3ee', // Cyan-400
          accent: '#f43f5e', // Rose-500
          grid: '#1e293b',
          text: '#94a3b8',
          bgTooltip: '#05050a',
          borderTooltip: '#facc15',
          gradientStart: '#facc15',
          gradientEnd: '#000000',
          pieColors: ['#facc15', '#22d3ee', '#f43f5e', '#a855f7', '#4ade80']
        };
      case 'glassmorphism':
        return {
          primary: '#38bdf8', // Sky-400
          primaryLight: '#7dd3fc',
          secondary: '#818cf8', // Indigo-400
          accent: '#fb7185', // Rose-400
          grid: '#334155',
          text: '#94a3b8',
          bgTooltip: 'rgba(15, 23, 42, 0.9)',
          borderTooltip: '#38bdf8',
          gradientStart: '#38bdf8',
          gradientEnd: '#0f172a',
          pieColors: ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#c084fc']
        };
      case 'dark-oled':
      default:
        return {
          primary: '#10b981', // Emerald-500
          primaryLight: '#34d399',
          secondary: '#06b6d4', // Cyan-500
          accent: '#8b5cf6', // Violet-500
          grid: '#1e293b',
          text: '#64748b',
          bgTooltip: '#090d16',
          borderTooltip: '#334155',
          gradientStart: '#10b981',
          gradientEnd: '#020617',
          pieColors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899']
        };
    }
  }, [theme]);

  // Contextual Data generation based on the active Module
  const moduleData = useMemo(() => {
    switch (appId) {
      case 'finance':
      case 'wallet':
        return {
          headline: 'Performance Financière & Trésorerie',
          badge: 'MRR $124.5k',
          kpis: [
            { label: 'Revenu Récurrent (MRR)', val: '$124,500', trend: '+14.2%', up: true, sub: 'vs mois dernier' },
            { label: 'Marge Brute EBITDA', val: '78.4%', trend: '+2.1%', up: true, sub: 'Cible > 75%' },
            { label: 'Trésorerie Disponible', val: '$840,200', trend: '+8.4%', up: true, sub: 'Autonomie 18 mois' },
            { label: 'Délai Moyen Règlement', val: '8.4 jours', trend: '-1.2j', up: true, sub: 'Excellente liquidité' }
          ],
          timeline: [
            { period: 'Sem 1', metric1: 104000, metric2: 78000, metric3: 26000 },
            { period: 'Sem 2', metric1: 112000, metric2: 82000, metric3: 30000 },
            { period: 'Sem 3', metric1: 118500, metric2: 86000, metric3: 32500 },
            { period: 'Sem 4', metric1: 124500, metric2: 91000, metric3: 33500 },
          ],
          distribution: [
            { name: 'SaaS Core', value: 58 },
            { name: 'PaaS Usage', value: 24 },
            { name: 'API Tokens', value: 12 },
            { name: 'Support Dédié', value: 6 }
          ],
          labels: { metric1: 'Revenus Bruts ($)', metric2: 'EBITDA ($)', metric3: 'Flux Net ($)' }
        };
      case 'sales':
      case 'leads':
        return {
          headline: 'Pipeline Commercial & Vitesse de Vente',
          badge: 'Win Rate 34%',
          kpis: [
            { label: 'Valeur du Pipeline', val: '$480,000', trend: '+22.5%', up: true, sub: '38 opportunités' },
            { label: 'Panier Moyen (ACV)', val: '$18,400', trend: '+8.0%', up: true, sub: 'Segments Enterprise' },
            { label: 'Cycle de Vente Moyen', val: '24 Jours', trend: '-4 jours', up: true, sub: 'Accélération Q3' },
            { label: 'Deals Gagnés', val: '14', trend: '+4', up: true, sub: 'Ce mois-ci' }
          ],
          timeline: [
            { period: 'Jan', metric1: 220000, metric2: 12, metric3: 3.8 },
            { period: 'Fév', metric1: 290000, metric2: 16, metric3: 4.2 },
            { period: 'Mar', metric1: 370000, metric2: 24, metric3: 4.6 },
            { period: 'Avr', metric1: 480000, metric2: 38, metric3: 5.1 },
          ],
          distribution: [
            { name: 'Fintech & Web3', value: 40 },
            { name: 'Autonomous IA', value: 30 },
            { name: 'Logistique', value: 20 },
            { name: 'Santé & Biotech', value: 10 }
          ],
          labels: { metric1: 'Pipeline ($)', metric2: 'Opportunités', metric3: 'Vélocité' }
        };
      case 'clients':
        return {
          headline: 'Santé des Comptes & Rétention NRR',
          badge: 'CSAT 4.9/5',
          kpis: [
            { label: 'Net Revenue Retention', val: '118%', trend: '+4.2%', up: true, sub: 'Expansion organique' },
            { label: 'Score Santé Moyen', val: '92/100', trend: '+6 pts', up: true, sub: 'Risque maîtrisé' },
            { label: 'Taux de Churn Net', val: '0.4%', trend: '-0.2%', up: true, sub: 'Benchmark < 1%' },
            { label: 'Comptes Enterprise', val: '4 Comptes', trend: '100% actifs', up: true, sub: 'SLA Or validé' }
          ],
          timeline: [
            { period: 'M-3', metric1: 91, metric2: 94, metric3: 112 },
            { period: 'M-2', metric1: 93, metric2: 96, metric3: 114 },
            { period: 'M-1', metric1: 95, metric2: 97, metric3: 116 },
            { period: 'Actuel', metric1: 98, metric2: 99, metric3: 118 },
          ],
          distribution: [
            { name: 'Tier Enterprise', value: 65 },
            { name: 'Tier Scale', value: 25 },
            { name: 'Tier Growth', value: 10 }
          ],
          labels: { metric1: 'Satisfaction (%)', metric2: 'Uptime SLA (%)', metric3: 'NRR (%)' }
        };
      default:
        return {
          headline: `Indicateurs Clés & Télémétrie · ${appName}`,
          badge: `${workspace} Mode`,
          kpis: [
            { label: 'Efficience Opérationnelle', val: '96.8%', trend: '+3.4%', up: true, sub: 'Moteur MCP optimisé' },
            { label: 'Latence Médiane P99', val: '24ms', trend: '-6ms', up: true, sub: 'Seuil SLA respecté' },
            { label: 'Événements Traités / sec', val: '4,850', trend: '+18%', up: true, sub: 'Flux streaming actif' },
            { label: 'Fiabilité du Service', val: '99.99%', trend: 'Zéro incident', up: true, sub: 'Cluster résilient' }
          ],
          timeline: [
            { period: '08:00', metric1: 1800, metric2: 24, metric3: 99 },
            { period: '12:00', metric1: 3400, metric2: 28, metric3: 98 },
            { period: '16:00', metric1: 4850, metric2: 22, metric3: 100 },
            { period: '20:00', metric1: 2900, metric2: 18, metric3: 100 },
          ],
          distribution: [
            { name: 'Traitement Vectoriel', value: 45 },
            { name: 'Appels API / REST', value: 30 },
            { name: 'WebSockets Live', value: 15 },
            { name: 'Sync DB Staging', value: 10 }
          ],
          labels: { metric1: 'Requêtes / min', metric2: 'Latence (ms)', metric3: 'Santé (%)' }
        };
    }
  }, [appId, appName, workspace]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-slate-100 theme-transition scrollbar-hide pb-20">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl shadow-lg theme-transition">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Business Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {moduleData.badge}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-1">{moduleData.headline}</h2>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
          <BarChart3 size={20} />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {moduleData.kpis.map((kpi, idx) => (
          <div 
            key={idx}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all theme-transition"
          >
            <span className="text-[11px] text-slate-400 font-medium truncate">{kpi.label}</span>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-lg font-bold font-mono text-slate-100 tracking-tight">{kpi.val}</span>
              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                kpi.up ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {kpi.trend}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Chart 1: Main Velocity Trend AreaChart */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-lg space-y-2 theme-transition">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Trajectoire Temporelle & Flux</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Temps-Réel • {workspace}</span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moduleData.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="themeColorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColors.primary} stopOpacity={0.45}/>
                  <stop offset="95%" stopColor={themeColors.primary} stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="themeSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColors.secondary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={themeColors.secondary} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} opacity={0.3} />
              <XAxis dataKey="period" stroke={themeColors.text} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={themeColors.text} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: themeColors.bgTooltip, 
                  borderColor: themeColors.borderTooltip, 
                  borderRadius: 14, 
                  fontSize: 11,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="metric1" 
                stroke={themeColors.primary} 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#themeColorGrad)" 
                name={moduleData.labels.metric1} 
              />
              <Area 
                type="monotone" 
                dataKey="metric2" 
                stroke={themeColors.secondary} 
                strokeWidth={1.8} 
                fillOpacity={1} 
                fill="url(#themeSecondaryGrad)" 
                name={moduleData.labels.metric2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Distribution & Allocation Donut/Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Donut Chart */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-lg space-y-2 theme-transition">
          <div className="flex items-center gap-2 mb-1">
            <PieIcon size={15} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Ventilation par Segment</span>
          </div>

          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moduleData.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {moduleData.distribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={themeColors.pieColors[index % themeColors.pieColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: themeColors.bgTooltip, 
                    borderColor: themeColors.borderTooltip, 
                    borderRadius: 12, 
                    fontSize: 11 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {moduleData.distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: themeColors.pieColors[idx % themeColors.pieColors.length] }} 
                />
                <span className="text-slate-300 truncate">{item.name}:</span>
                <span className="font-mono font-bold text-slate-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Breakdown */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-lg space-y-2 theme-transition">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={15} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Indice de Performance Trimestrielle</span>
          </div>

          <div className="h-40 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} opacity={0.25} />
                <XAxis dataKey="period" stroke={themeColors.text} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={themeColors.text} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: themeColors.bgTooltip, 
                    borderColor: themeColors.borderTooltip, 
                    borderRadius: 12, 
                    fontSize: 11 
                  }} 
                />
                <Bar 
                  dataKey="metric1" 
                  fill={themeColors.primary} 
                  radius={[6, 6, 0, 0]} 
                  name={moduleData.labels.metric1} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> Objectifs Q3 validés
            </span>
            <span className="text-emerald-400 font-mono font-bold">+18.4% YoY</span>
          </div>
        </div>
      </div>

      {/* Real-time AI Analysis Card */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/90 border border-emerald-500/30 rounded-3xl p-4 shadow-xl space-y-2 theme-transition">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <Sparkles size={15} />
          <span>Diagnostic IA Temps-Réel · Coach OS</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Les signaux télémétriques du module <strong className="text-slate-100">{appName}</strong> confirment une convergence nominale avec une marge opérationnelle stable à 78.4%. Aucun goulet d'étranglement ou risque de rupture n'est détecté.
        </p>
      </div>
    </div>
  );
}
