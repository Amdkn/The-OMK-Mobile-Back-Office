import { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { Paradigm } from '../types';
import DynamicIsland from './DynamicIsland';

export default function StatusBar({ paradigm }: { paradigm: Paradigm }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6 pointer-events-none">
      <div className="flex-1 text-sm font-medium pl-1">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      
      <div className="flex-1 flex justify-center">
        <DynamicIsland paradigm={paradigm} />
      </div>

      <div className="flex-1 flex justify-end items-center gap-1.5 text-slate-300 pr-1">
        <Signal size={16} strokeWidth={2.5} />
        <Wifi size={16} strokeWidth={2.5} />
        <BatteryMedium size={20} strokeWidth={2} />
      </div>
    </div>
  );
}
