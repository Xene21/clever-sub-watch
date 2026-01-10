import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockInsights = `## 📊 Monthly Subscription Analysis

Based on your connected accounts, here's what I found:

### Monthly Spend Summary
Your total monthly recurring spend is **$112.97**, which translates to **$1,355.64** annually.

### 💸 Biggest Expenses
1. **Adobe Creative Cloud** - $54.99/mo (49% of spending)
2. **ChatGPT Plus** - $20.00/mo (18%)
3. **Netflix** - $15.99/mo (14%)

### ⚠️ Potential Concerns
- **Adobe Creative Cloud** price increased from $52.99 to $54.99 (+3.8%)
- **Disney+** appears to be paused - you haven't been charged in 2 months

### 💡 Optimization Tips
1. Consider the **Netflix Standard with Ads** plan to save $6/mo
2. GitHub Pro offers a **free tier** for personal use - you could save $4/mo
3. Bundle **Disney+, Hulu, ESPN+** for $14.99 vs separate subscriptions

### 🎯 Estimated Savings Potential: **$127/year**

Want me to help you with anything specific?`;

const AIInsights = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your SubPilot AI assistant. I can analyze your subscriptions, find savings opportunities, and answer questions about your recurring expenses. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockInsights,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const quickPrompts = [
    "Analyze my subscriptions",
    "How can I save money?",
    "Show upcoming renewals",
    "Find duplicate services",
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="ml-64 h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">AI Financial Insights</h1>
              <p className="text-sm text-muted-foreground">Get personalized advice about your subscriptions</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.1 : 0 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                message.role === 'assistant' 
                  ? 'bg-primary/10' 
                  : 'bg-secondary'
              }`}>
                {message.role === 'assistant' ? (
                  <Sparkles className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className={`max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.role === 'assistant' 
                    ? 'glass-card text-left' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-lg font-display font-bold mt-0 mb-3">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('- ')) {
                        return <p key={i} className="ml-4 my-1">• {line.replace('- ', '')}</p>;
                      }
                      if (line.match(/^\d+\. /)) {
                        return <p key={i} className="ml-4 my-1">{line}</p>;
                      }
                      if (line.trim() === '') return null;
                      return <p key={i} className="my-2">{line}</p>;
                    })}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div className="glass-card p-4 rounded-2xl">
                <p className="text-muted-foreground">Analyzing your subscriptions...</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your subscriptions..."
              className="flex-1 h-12 bg-secondary/50 border-border/50"
              disabled={isLoading}
            />
            <Button type="submit" variant="hero" size="lg" disabled={isLoading || !input.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AIInsights;
