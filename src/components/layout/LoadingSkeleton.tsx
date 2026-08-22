import React from 'react';
import { useOSStore } from '../../store/osStore';

export interface LoadingSkeletonProps {
  variant?: 'app' | 'dashboard' | 'list' | 'detail' | 'stats' | 'card';
  count?: number;
  className?: string;
  message?: string;
}

export default function LoadingSkeleton({
  variant = 'app',
  count = 3,
  className = '',
  message
}: LoadingSkeletonProps) {
  const { theme } = useOSStore();

  const isLight = theme === 'warm-paper';
  const isCyber = theme === 'cyberpunk';
  
  // Theme-aware base pulse classes
  const pulseBg = isLight 
    ? 'bg-amber-900/10' 
    : isCyber 
    ? 'bg-yellow-500/10' 
    : 'bg-slate-800/60';

  const cardBg = isLight
    ? 'bg-amber-50/70 border-amber-900/15'
    : isCyber
    ? 'bg-black/80 border-yellow-500/30'
    : 'bg-slate-900/70 border-slate-800/80';

  const renderContent = () => {
    switch (variant) {
      case 'stats':
        return (
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
            {Array.from({ length: count || 3 }).map((_, i) => (
              <div key={i} className={`${cardBg} p-3.5 rounded-2xl border backdrop-blur-md animate-pulse space-y-2.5`}>
                <div className="flex justify-between items-center">
                  <div className={`h-3 w-16 ${pulseBg} rounded-md`} />
                  <div className={`h-4 w-4 ${pulseBg} rounded-full`} />
                </div>
                <div className={`h-6 w-24 ${pulseBg} rounded-md`} />
                <div className={`h-2.5 w-14 ${pulseBg} rounded-md`} />
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-2.5 ${className}`}>
            {Array.from({ length: count || 4 }).map((_, i) => (
              <div key={i} className={`${cardBg} p-3 rounded-2xl border backdrop-blur-md animate-pulse flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl ${pulseBg} shrink-0`} />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className={`h-3.5 w-28 ${pulseBg} rounded-md`} />
                    <div className={`h-2.5 w-40 ${pulseBg} rounded-md`} />
                  </div>
                </div>
                <div className={`h-5 w-14 rounded-full ${pulseBg} shrink-0`} />
              </div>
            ))}
          </div>
        );

      case 'dashboard':
        return (
          <div className={`space-y-4 p-4 ${className}`}>
            {/* Header Banner */}
            <div className={`${cardBg} p-4 rounded-3xl border backdrop-blur-md animate-pulse space-y-3`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${pulseBg}`} />
                  <div className="space-y-1">
                    <div className={`h-4 w-28 ${pulseBg} rounded-md`} />
                    <div className={`h-2.5 w-36 ${pulseBg} rounded-md`} />
                  </div>
                </div>
                <div className={`h-6 w-16 rounded-full ${pulseBg}`} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/40">
                <div className={`h-12 ${pulseBg} rounded-xl`} />
                <div className={`h-12 ${pulseBg} rounded-xl`} />
                <div className={`h-12 ${pulseBg} rounded-xl`} />
              </div>
            </div>

            {/* Chart placeholder */}
            <div className={`${cardBg} p-4 rounded-3xl border backdrop-blur-md animate-pulse space-y-3`}>
              <div className="flex justify-between items-center">
                <div className={`h-3.5 w-32 ${pulseBg} rounded-md`} />
                <div className={`h-3.5 w-16 ${pulseBg} rounded-md`} />
              </div>
              <div className={`h-40 w-full ${pulseBg} rounded-2xl`} />
            </div>

            {/* List */}
            <div className="space-y-2">
              <div className={`${cardBg} p-3 rounded-2xl border animate-pulse h-14`} />
              <div className={`${cardBg} p-3 rounded-2xl border animate-pulse h-14`} />
            </div>
          </div>
        );

      case 'detail':
        return (
          <div className={`space-y-3.5 p-4 ${className}`}>
            <div className={`${cardBg} p-4 rounded-3xl border backdrop-blur-md animate-pulse space-y-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${pulseBg}`} />
                <div className="space-y-1.5 flex-1">
                  <div className={`h-4 w-36 ${pulseBg} rounded-md`} />
                  <div className={`h-3 w-48 ${pulseBg} rounded-md`} />
                </div>
              </div>
            </div>
            <div className={`${cardBg} p-4 rounded-3xl border backdrop-blur-md animate-pulse space-y-3`}>
              <div className={`h-3.5 w-24 ${pulseBg} rounded-md`} />
              <div className="space-y-2">
                <div className={`h-3 w-full ${pulseBg} rounded-md`} />
                <div className={`h-3 w-5/6 ${pulseBg} rounded-md`} />
                <div className={`h-3 w-4/6 ${pulseBg} rounded-md`} />
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className={`${cardBg} p-4 rounded-3xl border backdrop-blur-md animate-pulse space-y-3 ${className}`}>
            <div className="flex justify-between items-center">
              <div className={`h-3.5 w-28 ${pulseBg} rounded-md`} />
              <div className={`h-5 w-12 rounded-full ${pulseBg}`} />
            </div>
            <div className={`h-8 w-36 ${pulseBg} rounded-md`} />
            <div className={`h-3 w-full ${pulseBg} rounded-md`} />
          </div>
        );

      case 'app':
      default:
        return (
          <div className={`p-4 space-y-4 ${className}`}>
            {/* Top Navigation skeleton */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-20 rounded-xl ${pulseBg}`} />
                <div className={`h-7 w-20 rounded-xl ${pulseBg}`} />
              </div>
              <div className={`h-7 w-16 rounded-xl ${pulseBg}`} />
            </div>

            {/* 3 KPI Blocks */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className={`${cardBg} p-3 rounded-2xl border animate-pulse space-y-1.5`}>
                <div className={`h-2.5 w-12 ${pulseBg} rounded-md`} />
                <div className={`h-5 w-16 ${pulseBg} rounded-md`} />
              </div>
              <div className={`${cardBg} p-3 rounded-2xl border animate-pulse space-y-1.5`}>
                <div className={`h-2.5 w-12 ${pulseBg} rounded-md`} />
                <div className={`h-5 w-16 ${pulseBg} rounded-md`} />
              </div>
              <div className={`${cardBg} p-3 rounded-2xl border animate-pulse space-y-1.5`}>
                <div className={`h-2.5 w-12 ${pulseBg} rounded-md`} />
                <div className={`h-5 w-16 ${pulseBg} rounded-md`} />
              </div>
            </div>

            {/* AI Insight Card Skeleton */}
            <div className={`${cardBg} p-4 rounded-3xl border border-emerald-500/20 animate-pulse space-y-2`}>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30" />
                <div className="h-3 w-28 bg-emerald-500/20 rounded-md" />
              </div>
              <div className={`h-3 w-full ${pulseBg} rounded-md`} />
              <div className={`h-3 w-4/5 ${pulseBg} rounded-md`} />
            </div>

            {/* Main Content Rows */}
            <div className="space-y-2.5 pt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`${cardBg} p-3.5 rounded-2xl border animate-pulse flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${pulseBg}`} />
                    <div className="space-y-1">
                      <div className={`h-3.5 w-32 ${pulseBg} rounded-md`} />
                      <div className={`h-2.5 w-24 ${pulseBg} rounded-md`} />
                    </div>
                  </div>
                  <div className={`h-4 w-12 ${pulseBg} rounded-md`} />
                </div>
              ))}
            </div>

            {message && (
              <div className="text-center text-xs font-medium text-slate-400 pt-2 animate-pulse">
                {message}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-start">
      {renderContent()}
    </div>
  );
}
