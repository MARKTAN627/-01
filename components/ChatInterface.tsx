import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { getChatResponse } from '../services/gemini';
import { ChatMessage, Language } from '../types';
import { getTranslation } from '../services/i18n';

interface ChatProps {
  language: Language;
}

const ChatInterface: React.FC<ChatProps> = ({ language }) => {
  const t = getTranslation(language);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: t.chatInit,
          timestamp: new Date()
        }
      ]);
    }
  }, [language, t.chatInit]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await getChatResponse(history, input, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t.error,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl shadow-maroon-900/10 overflow-hidden">
      <div className="bg-gradient-to-r from-maroon-800 to-maroon-700 p-5 flex items-center gap-3 shadow-md relative z-10">
        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
           <Sparkles className="w-5 h-5 text-saffron-300" />
        </div>
        <h2 className="text-saffron-50 font-serif font-bold text-lg tracking-wide">{t.chatHeader}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-white/30" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20 ${msg.role === 'user' ? 'bg-saffron-500' : 'bg-maroon-800'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-saffron-100" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-saffron-100/90 text-saffron-900 rounded-tr-none border border-saffron-200/50' 
                : 'bg-white/90 text-gray-700 border border-white/60 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-maroon-800 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-5 h-5 text-saffron-100" />
            </div>
            <div className="bg-white/80 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-white/60">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-white/60 backdrop-blur-md border-t border-white/50">
        <div className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-white/80 border border-gray-200/80 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-maroon-500/30 transition-all placeholder:text-gray-400 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;