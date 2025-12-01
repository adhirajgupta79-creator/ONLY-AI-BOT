
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Header, VoiceState } from './components/Header';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { SplashScreen } from './components/SplashScreen';
import { VoiceLogic } from './components/VoiceOrb'; // Renamed import
import { Message, Role, ChatSession, User } from './types';

const DEFAULT_GREETING = "Hello! I am CREATOR. How can I help you today?";

const createNewSession = (greeting = DEFAULT_GREETING): ChatSession => ({
  id: Date.now().toString(),
  title: "New Chat",
  messages: [{
    id: 'init-1',
    role: Role.MODEL,
    content: greeting,
    timestamp: new Date()
  }],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

const App: React.FC = () => {
  // --- Splash Screen State ---
  const [showSplash, setShowSplash] = useState(true);

  // --- Voice State ---
  const [voiceTrigger, setVoiceTrigger] = useState(false); // Toggle to trigger logic
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');

  // --- Authentication State ---
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('auth_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // State for Sessions
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSessions = localStorage.getItem("chat_sessions");
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        }
      } catch (e) {
        console.warn("Failed to load sessions, using fallback");
      }
    }
    return createNewSession().id;
  });
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
     if (typeof window !== "undefined") {
      try {
        const savedSessions = localStorage.getItem("chat_sessions");
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [createNewSession()];
  });

  const sessionsRef = useRef(sessions);
  const activeSessionIdRef = useRef(activeSessionId);
  
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeSessionId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (!user) return; 

    const initChat = () => {
      if (!activeSession) return;
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "DEMO_KEY" });
        const history = activeSession.messages
          .filter(msg => msg.id !== 'init-1')
          .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          }));

        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-pro-preview',
          config: {
            systemInstruction: "You are CREATOR, a helpful, intelligent, and creative AI assistant. Your responses are concise yet comprehensive, formatted with Markdown where appropriate. You prioritize user helpfulness and clarity.",
            tools: [{ googleSearch: {} }], 
          },
          history: history
        });
        setError(null);
      } catch (err) {
        console.error("Failed to initialize chat", err);
      }
    };

    initChat();
  }, [activeSessionId, user]); 

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
     setSessions(prev => prev.map(session => {
         if (session.id === sessionId) {
             return {
                 ...session,
                 messages: newMessages,
                 updatedAt: Date.now()
             };
         }
         return session;
     }));
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title } : session
    ));
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]); 
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this chat?")) {
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        
        if (id === activeSessionId) {
            if (newSessions.length > 0) {
                setActiveSessionId(newSessions[0].id);
            } else {
                const fresh = createNewSession();
                setSessions([fresh]);
                setActiveSessionId(fresh.id);
            }
        }
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chat_sessions');
        localStorage.removeItem('chat_history'); 
      }
      setIsSettingsOpen(false);
    }
  };

  const handleSendMessage = async (text: string, mode?: string): Promise<string | void> => {
    if (!text.trim() || !activeSession) return;
    if (!chatSessionRef.current) return; // Should be inited

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    updateSessionMessages(activeSessionId, updatedMessages);
    
    if (activeSession.messages.length <= 1 && activeSession.title === "New Chat") {
        const newTitle = text.length > 30 ? text.slice(0, 30) + '...' : text;
        updateSessionTitle(activeSessionId, newTitle);
    }

    setIsLoading(true);
    setError(null);

    let promptText = text;
    if (mode === 'deep') {
        promptText = `[SYSTEM INSTRUCTION: Provide a comprehensive answer with all related information in 150-200 words.]\n\n${text}`;
    } else if (mode === 'instant') {
        promptText = `[SYSTEM INSTRUCTION: Provide a minimal, concise response in 50-75 words.]\n\n${text}`;
    } else if (mode === 'study') {
        promptText = `[SYSTEM INSTRUCTION: You are an expert tutor. Explain the following study topic deeply and comprehensively.]\n\n${text}`;
    }

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: promptText });
      
      let fullResponseText = "";
      const collectedGroundingChunks: any[] = [];
      const botMessageId = (Date.now() + 1).toString();
      
      const messagesWithBot = [
          ...updatedMessages, 
          {
            id: botMessageId,
            role: Role.MODEL,
            content: "",
            timestamp: new Date()
          }
      ];
      
      updateSessionMessages(activeSessionId, messagesWithBot);

      for await (const chunk of result) {
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            collectedGroundingChunks.push(...chunk.candidates[0].groundingMetadata.groundingChunks);
        }

        const chunkText = chunk.text;
        if (chunkText) {
          fullResponseText += chunkText;
          setSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                const msgs = session.messages.map(m => 
                    m.id === botMessageId ? { ...m, content: fullResponseText } : m
                );
                return { ...session, messages: msgs, updatedAt: Date.now() };
            }
            return session;
          }));
        }
      }

      if (collectedGroundingChunks.length > 0) {
          const uniqueLinks = new Map<string, string>();
          collectedGroundingChunks.forEach(c => {
              if (c.web?.uri) uniqueLinks.set(c.web.uri, c.web.title || "Source");
          });

          if (uniqueLinks.size > 0) {
              fullResponseText += "\n\n**Sources:**";
              uniqueLinks.forEach((title, uri) => {
                  fullResponseText += `\n* [${title}](${uri})`;
                });
              
              setSessions(prev => prev.map(session => {
                if (session.id === activeSessionId) {
                    const msgs = session.messages.map(m => 
                        m.id === botMessageId ? { ...m, content: fullResponseText } : m
                    );
                    return { ...session, messages: msgs, updatedAt: Date.now() };
                }
                return session;
              }));
          }
      }
      return fullResponseText;
    } catch (err: any) {
      console.error("Error sending message:", err);
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    // Edit logic implementation...
    const currentSessionId = activeSessionIdRef.current;
    const allSessions = sessionsRef.current;
    const session = allSessions.find(s => s.id === currentSessionId);
    if (!session) return;
    const msgIndex = session.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const truncatedMessages = session.messages.slice(0, msgIndex);
    const newUserMessage: Message = { id: Date.now().toString(), role: Role.USER, content: newContent, timestamp: new Date() };
    const messagesForState = [...truncatedMessages, newUserMessage];
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: messagesForState, updatedAt: Date.now() } : s));
    setIsLoading(true);
    // Simulate re-send...
    setTimeout(() => setIsLoading(false), 500); 
  }, []); 

  const handleLogin = (customUser?: User) => {
    const mockUser: User = customUser || {
        id: 'user-' + Date.now(),
        name: 'Demo User',
        email: 'user@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Demo&background=random'
    };
    setUser(mockUser);
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
    }
    setIsSidebarOpen(false);
  };

  // --- VOICE LOGIC INTEGRATION ---
  const handleVoiceTranscript = (role: 'user' | 'model', text: string) => {
      // Inject voice results into chat history
      setSessions(prev => {
          const current = prev.find(s => s.id === activeSessionId);
          if (!current) return prev;
          
          const newMsg: Message = {
              id: Date.now().toString() + role,
              role: role === 'user' ? Role.USER : Role.MODEL,
              content: text,
              timestamp: new Date()
          };
          
          return prev.map(s => s.id === activeSessionId 
              ? { ...s, messages: [...s.messages, newMsg], updatedAt: Date.now() } 
              : s
          );
      });
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gpt-main text-gpt-text transition-colors duration-200">
      
      {/* Invisible Logic Controller */}
      <VoiceLogic 
        apiKey={process.env.API_KEY || 'DEMO_KEY'}
        trigger={voiceTrigger}
        onStateChange={setVoiceState}
        onTranscript={handleVoiceTranscript}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={handleClearAllHistory}
        user={user}
      />

      <div className="flex-none">
        <Header 
            title={activeSession?.title || "CREATOR"} 
            subtitle="Powered by Gemini 3 Pro" 
            onMenuClick={() => setIsSidebarOpen(true)}
            voiceState={voiceState}
            onMicClick={() => setVoiceTrigger(prev => !prev)} // Toggle trigger
        />
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gpt-main">
        <div className="max-w-3xl mx-auto w-full flex flex-col p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} onEdit={handleEditMessage} />
            ))}
            
            {isLoading && (
            <div className="flex justify-start">
                <TypingIndicator />
            </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <div className="bg-gpt-main border-t border-none p-4 w-full">
        <div className="max-w-3xl mx-auto w-full">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            <div className="flex justify-center items-center mt-2 px-1">
            <p className="text-xs text-gray-500 text-center">
                AI can make mistakes. Please review sensitive information.
            </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
