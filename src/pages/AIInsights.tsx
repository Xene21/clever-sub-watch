import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User, Loader2, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your SubPilot AI assistant. I can analyze your subscriptions, find savings opportunities, and answer any financial questions you have. What would you like to know?",
  createdAt: new Date().toISOString(),
};

const AIInsights = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSessions, setIsFetchingSessions] = useState(true);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch sessions list on mount ──────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.get('/ai/sessions');
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setIsFetchingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Load a specific session's messages ───────────────────────────────
  const loadSession = async (session: Session) => {
    if (session.id === activeSessionId) return;
    setActiveSessionId(session.id);
    setInput('');
    setIsFetchingMessages(true);
    try {
      const data: Message[] = await api.get(`/ai/sessions/${session.id}/messages`);
      setMessages(data.length > 0 ? data : [INITIAL_MESSAGE]);
    } catch (err) {
      console.error('Failed to load messages', err);
      setMessages([INITIAL_MESSAGE]);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  // ── Start a fresh chat ────────────────────────────────────────────────
  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  // ── Delete a session ─────────────────────────────────────────────────
  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) startNewChat();
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  // ── Send a message ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    // Build the conversation history to send (excluding the welcome stub)
    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(({ role, content }) => ({ role, content }));

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        messages: [...history, { role: 'user', content: input }],
        sessionId: activeSessionId ?? undefined,
      });

      const aiMessage: Message = {
        id: `local-${Date.now() + 1}`,
        role: 'assistant',
        content: response.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update session list
      if (!activeSessionId) {
        // New session was created — set active and refresh list
        setActiveSessionId(response.sessionId);
        await fetchSessions();
      } else {
        // Bump updatedAt on the existing session in local state
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId ? { ...s, updatedAt: new Date().toISOString() } : s
          ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: `local-${Date.now() + 1}`,
        role: 'assistant',
        content: err?.message || 'AI service unavailable',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Analyze my subscriptions",
    "How can I save money?",
    "Show upcoming renewals",
    "Find duplicate services",
  ];

  const groupedSessions = sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const date = new Date(session.updatedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const group = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? 'This Week' : 'Older';
    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="ml-64 h-screen flex">
        {/* History Sidebar */}
        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-screen border-r border-border bg-card/40 flex flex-col overflow-hidden shrink-0"
            >
              <div className="p-4 border-b border-border">
                <Button
                  onClick={startNewChat}
                  className="w-full gap-2 justify-start"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {isFetchingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  Object.entries(groupedSessions).map(([group, convs]) => (
                    <div key={group}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{group}</p>
                      <div className="space-y-0.5">
                        {convs.map(session => (
                          <button
                            key={session.id}
                            onClick={() => loadSession(session)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group flex items-center justify-between gap-2 ${
                              activeSessionId === session.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                            }`}
                          >
                            <span className="truncate flex-1">{session.title}</span>
                            <button
                              onClick={(e) => deleteSession(session.id, e)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <button
          onClick={() => setHistoryOpen(o => !o)}
          className="absolute left-64 top-1/2 -translate-y-1/2 z-10 w-5 h-10 bg-card border border-border rounded-r-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          style={{ marginLeft: historyOpen ? '260px' : '0px', transition: 'margin 0.2s ease-in-out' }}
        >
          {historyOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Chat area */}
        <div className="flex-1 flex flex-col h-screen min-w-0">
          {/* Header */}
          <div className="border-b border-border p-6 shrink-0">
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
            {isFetchingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    message.role === 'assistant' ? 'bg-primary/10' : 'bg-secondary'
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
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-xl font-bold font-display mt-0 mb-3">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold font-display mt-4 mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
                            p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 space-y-1 list-none pl-0">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal pl-5">{children}</ol>,
                            li: ({ children }) => <li className="flex gap-2 items-start"><span className="text-primary mt-0.5 shrink-0">•</span><span>{children}</span></li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                            hr: () => <hr className="border-border my-3" />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

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
                  <p className="text-muted-foreground">Thinking...</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts — only on a fresh chat */}
          {messages.length === 1 && messages[0].id === 'welcome' && (
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
          <div className="border-t border-border p-6 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your finances..."
                className="flex-1 h-12 bg-secondary/50 border-border/50"
                disabled={isLoading}
              />
              <Button type="submit" variant="hero" size="lg" disabled={isLoading || !input.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInsights;
