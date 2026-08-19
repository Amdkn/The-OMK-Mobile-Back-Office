import { Paradigm } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

// A simple store or event bus for dynamic island states could go here, 
// but we'll manage it locally for the scanning animation as an example.
export const triggerFaceID = () => {
  const event = new CustomEvent('trigger-faceid');
  window.dispatchEvent(event);
}

export default function DynamicIsland({ paradigm }: { paradigm: Paradigm }) {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const handleFaceId = () => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2000);
    };
    window.addEventListener('trigger-faceid', handleFaceId);
    return () => window.removeEventListener('trigger-faceid', handleFaceId);
  }, []);

  if (paradigm === 'android') {
    return (
      <div className="w-4 h-4 bg-black rounded-full border border-slate-900 shadow-inner mt-2 pointer-events-auto" />
    );
  }

  // iOS Style
  return (
    <motion.div 
      className="bg-black rounded-full pointer-events-auto flex items-center justify-center overflow-hidden"
      initial={{ width: 100, height: 28, y: 4 }}
      animate={{ 
        width: isScanning ? 140 : 100, 
        height: isScanning ? 40 : 28,
        y: 4
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-emerald-500 rounded-sm border-t-0 border-r-0 rotate-45 animate-pulse" />
            <div className="w-4 h-4 border-2 border-emerald-500 rounded-sm border-b-0 border-l-0 rotate-45 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
