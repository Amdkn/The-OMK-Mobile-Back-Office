import { Palette } from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { ThemeId } from '../../types';

export default function Settings() {
  const { theme, setTheme } = useOSStore();

  const themes: { id: ThemeId; name: string; desc: string; colors: string[] }[] = [
    { id: 'dark-oled', name: 'Dark OLED', desc: 'terminal-grade', colors: ['bg-slate-950', 'bg-slate-100'] },
    { id: 'warm-paper', name: 'Warm Paper', desc: 'the editor desk', colors: ['bg-[#f4f1ea]', 'bg-orange-500'] },
    { id: 'cyberpunk', name: 'Cyberpunk', desc: 'neon and code', colors: ['bg-black', 'bg-yellow-400'] },
    { id: 'glassmorphism', name: 'Glassmorphism', desc: 'frosted confidence', colors: ['bg-slate-900', 'bg-white/20'] },
  ];

  return (
    <div className="p-6 pt-8 h-full overflow-y-auto scrollbar-hide pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
          <Palette size={24} />
        </div>
        <div>
          <h2 className="text-xl font-medium text-slate-100">Personnalisation</h2>
          <p className="text-sm text-slate-400">Thèmes & Fonds d'écran</p>
        </div>
      </div>

      <div className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-4 px-1">Engine Themes</div>
      
      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex flex-col items-start p-4 rounded-3xl border transition-all text-left ${
              theme === t.id 
                ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex gap-2 mb-4">
              <div className={`w-4 h-4 rounded-full border border-slate-700 ${t.colors[0]}`} />
              <div className={`w-4 h-4 rounded-full border border-slate-700 ${t.colors[1]}`} />
            </div>
            <div className="font-medium text-slate-200 text-sm mb-1">{t.name}</div>
            <div className="text-[10px] text-slate-500 font-medium tracking-wide">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
