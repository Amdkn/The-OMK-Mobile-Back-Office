/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { OSState, Paradigm, AppId } from './types';
import PhoneChassis from './components/PhoneChassis';
import LockScreen from './components/LockScreen';
import HomeScreen from './components/HomeScreen';
import AppViewer from './components/AppViewer';
import StatusBar from './components/StatusBar';

export default function App() {
  const [osState, setOsState] = useState<OSState>('locked');
  const [paradigm, setParadigm] = useState<Paradigm>('ios');
  const [activeApp, setActiveApp] = useState<AppId | null>(null);

  const handleUnlock = () => setOsState('unlocked');
  const handleLock = () => {
    setOsState('locked');
    setActiveApp(null);
  };
  const handleOpenApp = (id: AppId) => {
    if (id === 'lock') {
      handleLock();
    } else {
      setActiveApp(id);
    }
  };
  const handleCloseApp = () => setActiveApp(null);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center md:p-8 font-sans text-slate-100 selection:bg-blue-500/30">
      {/* Paradigm Selector (Desktop Only) */}
      <div className="hidden md:flex flex-col gap-4 absolute left-8 top-1/2 -translate-y-1/2 z-50">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">OS Paradigm</h2>
        <button
          onClick={() => setParadigm('ios')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            paradigm === 'ios' 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          iOS Style
        </button>
        <button
          onClick={() => setParadigm('android')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            paradigm === 'android' 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Android Style
        </button>
      </div>

      <PhoneChassis>
        <div className="relative w-full h-full bg-slate-950 overflow-hidden text-slate-100 flex flex-col">
          <StatusBar paradigm={paradigm} />
          
          <div className="relative flex-1 w-full overflow-hidden">
            {osState === 'locked' ? (
              <LockScreen onUnlock={handleUnlock} paradigm={paradigm} />
            ) : (
              <>
                <HomeScreen onOpenApp={handleOpenApp} />
                {activeApp && (
                  <AppViewer appId={activeApp} onClose={handleCloseApp} />
                )}
              </>
            )}
          </div>
        </div>
      </PhoneChassis>
    </div>
  );
}

