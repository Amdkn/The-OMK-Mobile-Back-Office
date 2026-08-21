import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Search, Bot, Mail, Phone, Calendar } from 'lucide-react';

import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface ModelSchema {
  id: string;
  name: string;
  icon?: React.ElementType;
  listFields: {
    primary: (item: any) => string;
    secondary?: (item: any) => string;
    badge?: (item: any) => string | undefined;
    badgeColor?: (item: any) => string;
    accessory?: (item: any) => string;
  };
  detailFields?: {
    label: string;
    value: (item: any) => string | number;
    type?: 'text' | 'email' | 'phone' | 'date' | 'progress';
  }[];
  kpis?: {
    label: string;
    value: (item: any) => string | number;
  }[];
  aiInsight?: (item: any) => { title: string; content: string; actionLabel?: string } | null;
  actions?: {
    id: string;
    label: string;
    icon: React.ElementType;
    onClick: (item: any) => void;
    variant?: 'default' | 'danger';
  }[];
  charts?: {
    title: string;
    type: 'line' | 'bar' | 'area';
    data: (item: any) => any[];
    xAxisKey: string;
    series: {
      key: string;
      color: string;
      name?: string;
    }[];
  }[];
  tabs?: {
    id: string;
    label: string;
    schema: ModelSchema;
    dataKey: string;
  }[];
}

interface StackFrame {
  id: string;
  title: string;
  type: 'list' | 'detail';
  schema: ModelSchema;
  data: any;
}

export default function DataModelViewer({ schema, data, title }: { schema: ModelSchema, data: any[], title: string }) {
  const [stack, setStack] = useState<StackFrame[]>([{
    id: 'root',
    type: 'list',
    schema,
    data,
    title
  }]);

  const push = (frame: StackFrame) => setStack(s => [...s, frame]);
  const pop = () => setStack(s => s.length > 1 ? s.slice(0, -1) : s);

  return (
    <div className="h-full flex flex-col relative bg-transparent text-current overflow-hidden">
      <AnimatePresence initial={false}>
        {stack.map((frame, index) => {
          return (
            <motion.div
              key={frame.id}
              initial={{ x: index === 0 ? 0 : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute inset-0 flex flex-col z-10 theme-transition bg-slate-950/75 backdrop-blur-xl text-slate-100"
            >
              
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-10 shrink-0">
                {index > 0 ? (
                  <button onClick={pop} className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                    <ChevronLeft size={20} />
                    <span className="text-sm font-medium truncate max-w-[100px]">{stack[index - 1].title}</span>
                  </button>
                ) : (
                  <h2 className="text-xl font-medium flex items-center gap-2">
                    {frame.schema.icon && <frame.schema.icon size={20} className="text-emerald-500" />}
                    {frame.title}
                  </h2>
                )}
                {index > 0 && <span className="font-medium absolute left-1/2 -translate-x-1/2 truncate max-w-[150px]">{frame.title}</span>}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {frame.type === 'list' && <ListView frame={frame} onPush={push} />}
                {frame.type === 'detail' && <DetailView frame={frame} onPush={push} />}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ListView({ frame, onPush }: { frame: StackFrame, onPush: (f: StackFrame) => void }) {
  const [search, setSearch] = useState('');
  
  const filtered = (frame.data as any[]).filter(item => {
    if (!search) return true;
    const text = frame.schema.listFields.primary(item).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 shrink-0 border-b border-slate-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input 
            type="text" 
            placeholder={`Search ${frame.schema.name}s...`} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:opacity-50" 
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <ListBase 
          schema={frame.schema} 
          data={filtered} 
          onSelect={(item) => onPush({
            id: `detail-${frame.schema.id}-${item.id || Math.random()}`,
            type: 'detail',
            schema: frame.schema,
            data: item,
            title: frame.schema.listFields.primary(item)
          })} 
        />
      </div>
    </div>
  );
}

function ListBase({ schema, data, onSelect }: { schema: ModelSchema, data: any[], onSelect: (item: any) => void }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 opacity-50 text-sm">No items found.</div>;
  }

  return (
    <div className="space-y-2 pb-20">
      {data.map((item, idx) => {
        const primary = schema.listFields.primary(item);
        const secondary = schema.listFields.secondary?.(item);
        const badge = schema.listFields.badge?.(item);
        const badgeColor = schema.listFields.badgeColor?.(item) || 'text-slate-500 bg-slate-500/10';
        const accessory = schema.listFields.accessory?.(item);

        return (
          <button
            key={item.id || idx}
            onClick={() => onSelect(item)}
            className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-colors group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{primary}</span>
                {badge && <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold ${badgeColor}`}>{badge}</span>}
              </div>
              {(secondary || accessory) && (
                <div className="flex items-center gap-3 text-xs opacity-60">
                  {secondary && <span>{secondary}</span>}
                  {secondary && accessory && <span>•</span>}
                  {accessory && <span>{accessory}</span>}
                </div>
              )}
            </div>
            <ChevronRight size={16} className="opacity-40 group-hover:opacity-80 transition-opacity ml-2 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

function DetailView({ frame, onPush }: { frame: StackFrame, onPush: (f: StackFrame) => void }) {
  const { schema, data } = frame;
  const tabs = [{ id: 'overview', label: 'Overview' }, ...(schema.tabs || [])];
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      {tabs.length > 1 && (
        <div className="flex px-4 pt-3 pb-2 gap-4 border-b border-slate-800 overflow-x-auto scrollbar-hide shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium capitalize pb-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
            {/* Header Identity */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-medium mb-3">
                {schema.listFields.primary(data).charAt(0)}
              </div>
              <h2 className="text-2xl font-medium text-center px-4">{schema.listFields.primary(data)}</h2>
              {schema.listFields.secondary && (
                <p className="text-sm opacity-60 text-center mt-1">{schema.listFields.secondary(data)}</p>
              )}
            </div>

            {/* Quick Actions */}
            {schema.actions && schema.actions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 px-4">
                {schema.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => action.onClick(data)}
                    className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border transition-colors ${
                      action.variant === 'danger' 
                        ? 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10' 
                        : 'border-slate-800 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <action.icon size={20} className="mb-2" />
                    <span className="text-[10px] font-medium leading-tight text-center px-1 opacity-80">{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* AI Insight */}
            {schema.aiInsight && schema.aiInsight(data) && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="flex items-center gap-2 mb-3">
                  <Bot size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{schema.aiInsight(data)!.title}</span>
                </div>
                <p className="text-sm leading-relaxed opacity-90">{schema.aiInsight(data)!.content}</p>
                {schema.aiInsight(data)!.actionLabel && (
                  <button className="mt-4 w-full bg-slate-900 border border-slate-800 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                    {schema.aiInsight(data)!.actionLabel}
                  </button>
                )}
              </div>
            )}

            {/* KPIs */}
            {schema.kpis && schema.kpis.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {schema.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[10px] uppercase opacity-50 mb-1">{kpi.label}</div>
                    <div className="text-2xl font-light">{kpi.value(data)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {schema.charts && schema.charts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2 px-1">Analytics</h3>
                {schema.charts.map((chart, idx) => {
                  const chartData = chart.data(data);
                  if (!chartData || chartData.length === 0) return null;

                  return (
                    <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                      <h4 className="text-sm font-medium mb-4">{chart.title}</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {chart.type === 'line' ? (
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                              <XAxis dataKey={chart.xAxisKey} stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} width={30} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px', color: 'var(--color-slate-400)' }}
                                labelStyle={{ fontSize: '12px', opacity: 0.7, color: 'var(--color-slate-400)' }}
                              />
                              {chart.series.map(s => (
                                <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} name={s.name || s.key} strokeWidth={2} dot={false} />
                              ))}
                            </LineChart>
                          ) : chart.type === 'bar' ? (
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                              <XAxis dataKey={chart.xAxisKey} stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} width={30} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px', color: 'var(--color-slate-400)' }}
                                labelStyle={{ fontSize: '12px', opacity: 0.7, color: 'var(--color-slate-400)' }}
                                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                              />
                              {chart.series.map(s => (
                                <Bar key={s.key} dataKey={s.key} fill={s.color} name={s.name || s.key} radius={[4, 4, 0, 0]} />
                              ))}
                            </BarChart>
                          ) : (
                            <AreaChart data={chartData}>
                              <defs>
                                {chart.series.map(s => (
                                  <linearGradient key={s.key} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                                  </linearGradient>
                                ))}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                              <XAxis dataKey={chart.xAxisKey} stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} width={30} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px', color: 'var(--color-slate-400)' }}
                                labelStyle={{ fontSize: '12px', opacity: 0.7, color: 'var(--color-slate-400)' }}
                              />
                              {chart.series.map(s => (
                                <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={`url(#color-${s.key})`} name={s.name || s.key} strokeWidth={2} />
                              ))}
                            </AreaChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Fields */}
            {schema.detailFields && schema.detailFields.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2 px-1">Details</h3>
                {schema.detailFields.map((field, idx) => {
                  if (field.type === 'progress') {
                    return (
                      <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium">{field.label}</span>
                          <span className="opacity-60">{field.value(data)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${field.value(data)}%` }} />
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        {field.type === 'email' && <Mail size={16} className="opacity-50" />}
                        {field.type === 'phone' && <Phone size={16} className="opacity-50" />}
                        {field.type === 'date' && <Calendar size={16} className="opacity-50" />}
                        <span className="text-sm font-medium">{field.label}</span>
                      </div>
                      <span className="text-sm opacity-80">{field.value(data)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {schema.tabs?.map(tab => activeTab === tab.id && (
          <motion.div key={tab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ListBase
              schema={tab.schema}
              data={data[tab.dataKey] || []}
              onSelect={(item) => onPush({
                id: `detail-${tab.schema.id}-${item.id || Math.random()}`,
                type: 'detail',
                schema: tab.schema,
                data: item,
                title: tab.schema.listFields.primary(item)
              })}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
