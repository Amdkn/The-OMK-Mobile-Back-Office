import { useState, useEffect, useRef } from 'react';

const BOOT_SEQUENCE = [
  "[OK] Initializing kernel...",
  "[OK] Mounting root filesystem...",
  "[OK] Starting secure encrypted tunnel...",
  "[INFO] Chiffrement AES-256 activé.",
  "[INFO] Conformité d'État : Validée.",
  "[OK] Starting BaaS Hub Daemon...",
  "[OK] Starting Wallet Interface...",
  "[INFO] Network connection established. Latence 12ms.",
  "root@omk-mobile-os:~# "
];

export default function Terminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < BOOT_SEQUENCE.length) {
        setLogs(prev => [...prev, BOOT_SEQUENCE[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full bg-slate-950 p-4 font-mono text-[11px] text-emerald-500 overflow-y-auto pt-6">
      <div className="mb-4 text-emerald-700/50">
        <pre>
{`
  ___  __  __ _  __
 / _ \\|  \\/  | |/ /
| (_) | |\\/| | ' / 
 \\___/|_|  |_|_|\\_\\
 MOBILE OS - SECURE SHELL
`}
        </pre>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="mb-1">
          <span className="text-slate-500">{new Date().toISOString().split('T')[1].slice(0, -1)} </span>
          <span className={log.includes('[OK]') ? 'text-emerald-400' : log.includes('[INFO]') ? 'text-blue-400' : 'text-slate-300'}>
            {log}
          </span>
        </div>
      ))}
      {logs.length === BOOT_SEQUENCE.length && (
        <div className="flex items-center mt-1">
          <span className="w-2 h-4 bg-emerald-500 animate-pulse" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
