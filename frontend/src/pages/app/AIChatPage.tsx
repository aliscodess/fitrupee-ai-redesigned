import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Zap, Plus, Bot, User, Camera, Repeat2 } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Message { role: 'user' | 'assistant'; content: string; timestamp?: Date; }

const QUICK_PROMPTS = [
  'What should I eat for breakfast under ₹30?',
  'How much protein do I need daily?',
  'Give me a 10-minute home workout',
  'Best cheap protein sources in India',
  'How to lose weight on a tight budget?',
  'Is soya chunks good for muscle building?',
];

const MarkdownText = ({ text }: { text: string }) => {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold" style="color:var(--text-dark)">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-brand-300 text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export default function AIChatPage() {
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m your FitRupee AI coach. I can help you with:\n\n**• Meal planning** on any budget\n**• Workout advice** for home or gym\n**• Calorie tracking** and nutrition tips\n**• Budget shopping** for healthy foods\n\nWhat would you like to know today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { messages: allMessages, chatId });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
      }]);
      if (data.data.chatId) setChatId(data.data.chatId);
    } catch (err: any) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      const userMsg: Message = {
        role: 'user',
        content: '📷 [Food image uploaded for analysis]',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      try {
        const { data } = await api.post('/ai/analyze-image', {
          imageBase64: base64,
          mimeType: file.type,
        });
        const result = data.data;
        const response = `**🍽️ Food Analysis**\n\n**Detected:** ${result.detectedFoods?.join(', ')}\n\n**Nutrition Estimate:**\n• Calories: ${result.estimatedCalories} kcal\n• Protein: ${result.estimatedProtein}g\n• Carbs: ${result.estimatedCarbs}g\n• Fat: ${result.estimatedFat}g\n\n**Portion:** ${result.portionSize}\n\n**Health Score:** ${result.healthScore}/10\n\n**Notes:** ${result.nutritionNotes}\n\n**Budget:** ${result.affordabilityNote}\n\n**Tips:** ${result.suggestions?.join(' • ')}`;
        setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      } catch {
        toast.error('Image analysis failed');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Namaste! 🙏 Starting fresh! What would you like help with today?',
      timestamp: new Date(),
    }]);
    setChatId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <span>🏠</span> Home
        </Link>
        <span>/</span><span>AI Chat Coach</span>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
            <MessageSquare className="text-brand-400" size={24} /> AI Chat Coach
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your personal nutrition & fitness assistant</p>
        </div>
        <button onClick={clearChat} className="btn-ghost flex items-center gap-2 text-sm">
          <Repeat2 size={16} /> New Chat
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
    msg.role === "user"
      ? "bg-brand-500/20 text-brand-400"
      : "text-white"
  }`}
  style={
    msg.role !== "user"
      ? { background: "linear-gradient(135deg,#9b72ef,#f472b6)" }
      : undefined
  }
>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'chat-bubble-user rounded-tr-sm'
                    : 'bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm'
                }`}>
                  <MarkdownText text={msg.content} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(loading || analyzing) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-saffron-500 flex items-center justify-center">
                <Bot size={14} style={{ color: "var(--accent-lav)" }} />
              </div>
              <div className="bg-white/5 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 bg-brand-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 border-t border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="flex-shrink-0 text-xs px-3 py-1.5 pref-pill rounded-full transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3 items-end">
            <input
              type="file" accept="image/*" ref={fileRef}
              onChange={handleImageUpload} className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={analyzing}
              className="p-2.5 pref-pill rounded-xl transition-colors flex-shrink-0"
              title="Analyze food image"
            >
              <Camera size={18} />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about nutrition, workouts, or budget tips..."
                rows={1}
                className="input-field resize-none py-3 pr-12 text-sm leading-relaxed max-h-32"
                style={{ minHeight: 48 }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-2.5 btn-primary rounded-xl flex-shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • 📷 Upload food images for analysis
          </p>
        </div>
      </div>
    </div>
  );
}
