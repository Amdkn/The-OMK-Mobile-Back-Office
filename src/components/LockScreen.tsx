import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ScanFace, Bell } from 'lucide-react';
import { Paradigm } from '../types';
import { triggerFaceID } from './DynamicIsland';
import { useOSStore } from '../store/osStore';

interface LockScreenProps {
  onUnlock: () => void;
  paradigm: Paradigm;
}

const NOTIFICATIONS = [
  { id: 1, app: 'Wallet', title: 'Rapprochement bancaire', desc: 'Complété avec succès.', time: 'À l\'instant' },
  { id: 2, app: 'Leads', title: 'Lead local qualifié', desc: 'Nouvel appel reçu de Google Business.', time: 'Il y a 5m' },
];

export default function LockScreen({ onUnlock, paradigm }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      setTimeout(() => onUnlock(), 300);
    }
  }, [pin, onUnlock]);

  const handleNumpad = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleFaceID = () => {
    triggerFaceID();
    setTimeout(() => onUnlock(), 1500);
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10 px-6 pb-12 pt-16">
      <div className="flex flex-col items-center justify-center space-y-1 mb-8">
        <Lock size={16} className="text-slate-400 mb-2" />
        <div className="text-6xl font-light tracking-tighter">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm font-medium text-slate-400">
          {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide py-4">
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="bg-slate-900/60 backdrop-blur-md border border-slate-800/50 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <Bell size={12} /> {n.app}
              </div>
              <span className="text-xs text-slate-500">{n.time}</span>
            </div>
            <div className="font-medium text-sm text-slate-200">{n.title}</div>
            <div className="text-sm text-slate-400">{n.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center">
        <div className="flex gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-colors ${i < pin.length ? 'bg-slate-200' : 'bg-slate-800 border border-slate-700'}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleNumpad(num)}
              className="w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur text-2xl font-light active:bg-slate-800 transition-colors"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumpad('0')}
            className="w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur text-2xl font-light active:bg-slate-800 transition-colors"
          >
            0
          </button>
          <div />
        </div>

        <button 
          onClick={handleFaceID}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-slate-300 font-medium text-sm border border-slate-800 active:bg-slate-800 transition-colors"
        >
          <ScanFace size={18} />
          FaceID / Biométrie
        </button>
      </div>
    </div>
  );
}
