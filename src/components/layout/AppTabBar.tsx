import React from 'react';
import { motion } from 'motion/react';
import { haptics } from '../../services/haptics';

export interface AppTabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface AppTabBarProps {
  tabs: AppTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Standardized Bottom Tab Bar Component (Floating Dock Style)
 */
export default function AppTabBar({
  tabs,
  activeTab,
  onChange,
  className = ''
}: AppTabBarProps) {
  const handleTabClick = (id: string) => {
    if (id !== activeTab) {
      haptics.trigger('selection');
    }
    onChange(id);
  };

  return (
    <div className={`fixed bottom-4 inset-x-4 z-30 pointer-events-none ${className}`}>
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-1 shadow-2xl flex items-center justify-around gap-1 theme-transition">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTabPill"
                    className="absolute inset-0 bg-slate-800/90 border border-slate-700/60 rounded-xl shadow-sm -z-0"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}

                {/* Discrete Top-Right Notification Badge */}
                {tab.badge !== undefined && tab.badge !== '' && tab.badge !== 0 && (
                  <span
                    className={`absolute top-1 right-2 z-20 min-w-[15px] h-[15px] px-1 flex items-center justify-center rounded-full text-[8.5px] font-black leading-none shadow-xs whitespace-nowrap border border-slate-950/20 ${
                      tab.badgeColor || (isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                
                <div className="relative z-10 flex flex-col items-center w-full">
                  <Icon size={16} className={`mb-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[65px] text-center">
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Standardized Top Segmented Page Menu (Matching Settings & Client Depth Architecture)
 */
export function AppTopNav({
  tabs,
  activeTab,
  onChange,
  className = ''
}: AppTabBarProps) {
  const handleTabClick = (id: string) => {
    if (id !== activeTab) {
      haptics.trigger('selection');
    }
    onChange(id);
  };

  return (
    <div className={`p-2.5 sm:p-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20 shrink-0 theme-transition ${className}`}>
      <div 
        className="grid gap-1 p-1 bg-slate-900/85 border border-slate-800/80 rounded-2xl"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-slate-100 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`activeTopNavPill-${tabs.map(t=>t.id).slice(0,2).join('-')}`}
                  className="absolute inset-0 bg-slate-800/95 border border-slate-700/60 rounded-xl -z-0 shadow-sm"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}

              {/* Discrete Top-Right Notification Badge */}
              {tab.badge !== undefined && tab.badge !== '' && tab.badge !== 0 && (
                <span
                  className={`absolute top-1 right-1.5 z-20 min-w-[15px] h-[15px] px-1 flex items-center justify-center rounded-full text-[8.5px] font-black leading-none shadow-xs whitespace-nowrap border border-slate-950/20 ${
                    tab.badgeColor || (isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200')
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              <div className="relative z-10 flex flex-col items-center w-full">
                <Icon size={15} className={`mb-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight truncate w-full text-center px-0.5">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

