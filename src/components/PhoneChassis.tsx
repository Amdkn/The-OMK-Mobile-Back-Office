import { ReactNode } from 'react';
import { useOSStore } from '../store/osStore';

export default function PhoneChassis({ children }: { children: ReactNode }) {
  const deviceViewMode = useOSStore(state => state.deviceViewMode);

  // Dynamic dimensions based on simulated orientation and form factor
  const getChassisDimensions = () => {
    switch (deviceViewMode) {
      case 'landscape':
        return 'md:w-[850px] md:h-[460px] md:rounded-[2.6rem]';
      case 'tablet':
        return 'md:w-[760px] md:h-[920px] md:max-h-[92vh] md:rounded-[3rem]';
      case 'portrait':
      case 'auto':
      default:
        return 'md:w-[400px] md:h-[850px] md:max-h-[92vh] md:rounded-[3rem]';
    }
  };

  return (
    <div className={`absolute inset-0 md:relative md:inset-auto ${getChassisDimensions()} md:border-[12px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden md:ring-1 md:ring-slate-800 flex flex-col transition-all duration-300`}>
      {/* Hardware Buttons (simulated on desktop) */}
      <div className="hidden md:block absolute -left-[14px] top-[120px] w-1 h-8 bg-slate-800 rounded-l-md" />
      <div className="hidden md:block absolute -left-[14px] top-[180px] w-1 h-14 bg-slate-800 rounded-l-md" />
      <div className="hidden md:block absolute -left-[14px] top-[240px] w-1 h-14 bg-slate-800 rounded-l-md" />
      <div className="hidden md:block absolute -right-[14px] top-[180px] w-1 h-20 bg-slate-800 rounded-r-md" />
      
      {/* Screen Area */}
      <div className="w-full h-full overflow-hidden md:rounded-[2.3rem] relative flex flex-col bg-slate-950">
        {children}
      </div>
    </div>
  );
}
