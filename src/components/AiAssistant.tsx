import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Maximize2, 
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  recommendedProducts?: Product[];
}

export const AiAssistant: React.FC = () => {
  const { 
    isAiChatOpen, 
    setIsAiChatOpen, 
    products, 
    setSelectedProduct, 
    settings 
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Welcome to AURA Modern Living. I am your AI Architectural Concierge. How may I assist your space today?\n\nI speak all languages — English, Georgian (ქართული), Turkish (Türkçe), Russian (Русский), German, French, and more. Ask me about dimensions, materials, catalog recommendations, or shipping!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiChatOpen) {
      scrollToBottom();
    }
  }, [messages, isAiChatOpen]);

  const quickPrompts = [
    { text: 'Recommend a modern modular sofa', lang: 'EN' },
    { text: 'რა ზომები აქვს Nexus Sectional-ს?', lang: 'KA' },
    { text: 'Show dining tables for 8 people', lang: 'EN' },
    { text: 'Teslimat ve montaj nasıl yapılıyor?', lang: 'TR' }
  ];

  // Helper to extract embedded product cards from "[product:prod-id]"
  const parseMessageContent = (text: string): { cleanText: string; matchedProducts: Product[] } => {
    const matchedProducts: Product[] = [];
    const productTagRegex = /\[product:([a-zA-Z0-9_-]+)\]/g;
    
    let match;
    while ((match = productTagRegex.exec(text)) !== null) {
      const prodId = match[1];
      const found = products.find(p => p.id === prodId);
      if (found && !matchedProducts.some(p => p.id === found.id)) {
        matchedProducts.push(found);
      }
    }

    const cleanText = text.replace(productTagRegex, '').trim();
    return { cleanText, matchedProducts };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || inputMessage;
    if (!userText.trim() || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText.trim(),
          conversationHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        const { cleanText, matchedProducts } = parseMessageContent(data.reply || '');

        const assistantMsg: Message = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: cleanText,
          recommendedProducts: matchedProducts,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Failed to fetch AI reply');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'I apologize, but I am momentarily experiencing network delay. You may explore our full collection from the categories menu or ask again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'init-' + Date.now(),
        role: 'assistant',
        content: 'Conversation reset. How may I assist you with our architectural furniture collection today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className="relative group p-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black shadow-[0_0_30px_rgba(0,240,255,0.45)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
          aria-label="Open AI Architectural Concierge"
        >
          <div className="relative">
            <Bot className="w-6 h-6 stroke-[2.2]" />
            <Sparkles className="w-3 h-3 absolute -top-1.5 -right-1.5 text-white animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          {/* Tooltip on Hover */}
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-xl glass-panel border border-cyan-400/40 text-xs font-semibold text-cyan-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Multilingual AI Concierge
          </span>

          {/* Pulse Ripple Ring */}
          <span className="absolute -inset-1 rounded-2xl bg-cyan-400 opacity-25 animate-ping -z-10" />
        </button>
      </div>

      {/* Modern Glassmorphic Chat Window */}
      {isAiChatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[82vh] glass-panel rounded-3xl border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                    AURA AI Concierge
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                  <Globe className="w-3 h-3" />
                  <span>Multilingual · Live Catalog Grounded</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAiChatOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="overflow-y-auto p-4 space-y-4 flex-grow text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-medium shadow-[0_0_15px_rgba(0,240,255,0.25)] rounded-br-xs'
                      : 'glass-card border border-white/10 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>

                {/* Inline Product Cards recommended by AI */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    {msg.recommendedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className="glass-card rounded-xl p-2.5 border border-cyan-400/30 flex items-center justify-between gap-3 hover:border-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.category} · <span className="font-mono text-cyan-300 font-bold">${p.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-cyan-400 p-3 glass-card rounded-2xl w-24">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 border-t border-white/5 bg-white/[0.01] flex items-center gap-1.5 overflow-x-auto shrink-0">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.text)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:text-cyan-300 text-[11px] text-slate-300 transition-colors shrink-0"
              >
                {qp.text}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/10 glass-panel flex items-center gap-2 shrink-0 bg-black/40"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything in any language..."
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
