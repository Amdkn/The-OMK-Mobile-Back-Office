import { Paradigm } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { useOSStore, Workspace } from '../store/osStore';
import { Server, Database, Code, Check } from 'lucide-react';

// A simple store or event bus for dynamic island states could go here, 
// but we'll manage it locally for the scanning animation as an example.
export const triggerFaceID = () => {
  const event = new CustomEvent('trigger-faceid');
  window.dispatchEvent(event);
}

export default function DynamicIsland({ paradigm }: { paradigm: Paradigm }) {
  const [isScanning, setIsScanning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { workspace, setWorkspace } = useOSStore();
  const islandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFaceId = () => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2000);
    };
    window.addEventListener('trigger-faceid', handleFaceId);
    return () => window.removeEventListener('trigger-faceid', handleFaceId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const workspaces: { name: Workspace; icon: any; color: string; desc: string }[] = [
    { name: 'Sandbox', icon: Code, color: 'text-amber-400', desc: 'Isolé (Local)' },
    { name: 'Development', icon: Database, color: 'text-blue-400', desc: 'Connecté (Dev DB)' },
    { name: 'Production', icon: Server, color: 'text-emerald-400', desc: 'Live (Prod DB)' },
  ];

  if (paradigm === 'android') {
    return (
      <div className="w-4 h-4 bg-black rounded-full border border-slate-900 shadow-inner mt-2 pointer-events-auto" />
    );
  }

  // iOS Style
  return (
    <motion.div 
      ref={islandRef}
      className="bg-black pointer-events-auto flex flex-col items-center overflow-hidden cursor-pointer origin-top"
      style={{ borderRadius: isExpanded ? 40 : 20 }}
      initial={{ width: 100, height: 28, y: 4 }}
      animate={{ 
        width: isExpanded ? 340 : (isScanning ? 140 : 100), 
        height: isExpanded ? 260 : (isScanning ? 40 : 28),
        y: isExpanded ? 12 : 4
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => {
        if (!isExpanded && !isScanning) setIsExpanded(true);
      }}
    >
      <AnimatePresence>
        {isScanning && !isExpanded && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2 h-full"
          >
            <div className="w-4 h-4 border-2 border-emerald-500 rounded-sm border-t-0 border-r-0 rotate-45 animate-pulse" />
            <div className="w-4 h-4 border-2 border-emerald-500 rounded-sm border-b-0 border-l-0 rotate-45 animate-pulse" />
          </motion.div>
        )}
        
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ delay: 0.1 }}
            className="w-full h-full p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()} // prevent clicking inside from bubbling to open logic, though not strictly needed here
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-100 font-medium text-lg tracking-wide">Workspace</span>
              <button onClick={() => setIsExpanded(false)} className="text-slate-400 bg-slate-900/50 hover:bg-slate-800 rounded-full w-7 h-7 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-2 flex-1">
              {workspaces.map(ws => (
                <button
                  key={ws.name}
                  onClick={() => {
                    setWorkspace(ws.name);
                    setTimeout(() => setIsExpanded(false), 200); // slight delay for visual feedback
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${workspace === ws.name ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-transparent hover:bg-slate-900/50 border border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 ${ws.color}`}>
                      <ws.icon size={14} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-medium ${workspace === ws.name ? 'text-slate-100' : 'text-slate-300'}`}>{ws.name}</div>
                      <div className="text-xs text-slate-500">{ws.desc}</div>
                    </div>
                  </div>
                  {workspace === ws.name && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check size={16} className="text-emerald-500" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
