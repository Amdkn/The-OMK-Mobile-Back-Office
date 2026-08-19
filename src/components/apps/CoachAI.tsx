import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
};

export default function CoachAI() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Bonjour. Je suis votre Coach OS. Comment puis-je vous aider aujourd'hui ?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `J'ai analysé votre requête : "${userMsg}". Les KPIs sont nominaux et la trésorerie est stable. Voulez-vous que je génère un rapport complet ?`, 
        sender: 'ai' 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-sm' 
                : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-200 p-3 rounded-2xl rounded-bl-sm border border-slate-700 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-150" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-300" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900 pb-8">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full p-1 pr-2">
          <div className="p-2 text-slate-500">
            <Bot size={20} />
          </div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Demandez au coach..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-emerald-600 text-white rounded-full disabled:opacity-50 transition-opacity"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
