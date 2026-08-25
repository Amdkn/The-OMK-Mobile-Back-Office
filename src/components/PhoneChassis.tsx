import { ReactNode } from 'react';
import { useOSStore } from '../store/osStore';

export default function PhoneChassis({ children }: { children: ReactNode }) {
  const deviceViewMode = useOSStore(state => state.deviceViewMode);

  // Dynamic dimensions based on simulated orientation and form factor
  const getChassisDimensions = () => {
    switch (deviceViewMode) {
      case 'landscape':
        return 'w-full h-full md:w-[850px] md:h-[460px] md:max-h-[92vh] rounded-[2.2rem] md:rounded-[2.8rem]';
      case 'tablet':
        return 'w-full h-full md:w-[760px] md:h-[920px] md:max-h-[92vh] rounded-[2.5rem] md:rounded-[3.2rem]';
      case 'portrait':
      case 'auto':
      default:
        return 'w-full h-full md:w-[400px] md:h-[840px] md:max-h-[92vh] rounded-[2.5rem] md:rounded-[3.2rem]';
    }
  };

  return (
    <div className={`relative ${getChassisDimensions()} border-[8px] md:border-[12px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-slate-800/80 flex flex-col shrink-0 transition-all duration-300`}>
      {/* Hardware Buttons (simulated on desktop) */}
      <div className="hidden md:block absolute -left-[14px] top-[120px] w-1 h-8 bg-slate-800 rounded-l-md" />
      <div className="hidden md:block absolute -left-[14px] top-[180px] w-1 h-14 bg-slate-800 rounded-l-md" />
      <div className="hidden md:block absolute -left-[14px] top-[240px] w-1 h-14 bg-slate-800 rounded-l-md" />
      <div className="hidden md:block absolute -right-[14px] top-[180px] w-1 h-20 bg-slate-800 rounded-r-md" />
      
      {/* Screen Area with mathematical inner corner nesting: R_inner = R_outer - BorderWidth */}
      <div className="w-full h-full overflow-hidden rounded-[1.8rem] md:rounded-[2.4rem] relative flex flex-col bg-slate-950">
        {children}
      </div>
    </div>
  );
}
