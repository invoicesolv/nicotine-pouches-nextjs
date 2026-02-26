'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import Pusher from 'pusher-js';

interface Message {
  id: string;
  content: string;
  type: 'visitor' | 'agent';
  timestamp: Date;
}

interface LiveChatWidgetProps {
  workspaceId?: string;
  className?: string;
}

export function LiveChatWidget({ 
  workspaceId = process.env.NEXT_PUBLIC_WORKSPACE_ID || '37f99e9d-a2b6-4900-8cfb-fe1e58afa592',
  className = '' 
}: LiveChatWidgetProps) {
  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number = 1) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string): string | null => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [visitorId, setVisitorId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentIsTyping, setAgentIsTyping] = useState(false);
  const [showPreChatForm, setShowPreChatForm] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  // Generate visitor ID on first load
  useEffect(() => {
    let storedVisitorId = getCookie('tryckeget_visitor_id');
    if (!storedVisitorId) {
      storedVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCookie('tryckeget_visitor_id', storedVisitorId, 365); // Store for 1 year
    }
    setVisitorId(storedVisitorId);

    // Restore visitor info if available
    const savedName = getCookie('tryckeget_visitor_name');
    const savedEmail = getCookie('tryckeget_visitor_email');
    
    if (savedName) setVisitorName(savedName);
    if (savedEmail) setVisitorEmail(savedEmail);

    // Restore existing session from cookie if available
    const existingSessionId = getCookie('tryckeget_session_id');
    if (existingSessionId) {
      setSessionId(existingSessionId);
      setIsConnected(true);
      setShowPreChatForm(false); // Don't show pre-chat form if session exists
      console.log(`[LiveChat] Restored existing session:`, existingSessionId);
    }
  }, []);

  // Connect to live chat when widget opens
  useEffect(() => {
    if (isOpen && visitorId && !isConnected && !showPreChatForm) {
      connectToLiveChat();
    }
  }, [isOpen, visitorId, showPreChatForm]);

  // Pusher connection for real-time messages
  useEffect(() => {
    if (!sessionId || !isConnected) {
      // Cleanup existing connections
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      return;
    }

    const connectPusher = () => {
      try {
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
        
        if (!pusherKey || !pusherCluster) {
          console.error('[LiveChat] Pusher configuration missing');
          return;
        }

        console.log('[LiveChat] Connecting to Pusher...');
        
        pusherRef.current = new Pusher(pusherKey, {
          cluster: pusherCluster,
          authEndpoint: 'https://www.axelio.io/api/pusher/auth',
          auth: {
            headers: {
              'Authorization': `Bearer ${visitorId}`
            }
          }
        });

        // Subscribe to live chat channel
        const channelName = `private-workspace-${workspaceId}`;
        channelRef.current = pusherRef.current.subscribe(channelName);

        channelRef.current.bind('live_chat_message', (data: any) => {
          console.log('[LiveChat] Pusher message received:', data);
          
          if (data.sessionId === sessionId) {
            setShowWelcomeMessage(false);
            
            const newMessage: Message = {
              id: data.message.id,
              content: data.message.content,
              type: data.message.sender === 'agent' ? 'agent' : 'visitor',
              timestamp: new Date(data.message.timestamp)
            };
            
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
          }
        });

        pusherRef.current.connection.bind('connected', () => {
          console.log('[LiveChat] Pusher connected');
        });

        pusherRef.current.connection.bind('error', (error: any) => {
          console.error('[LiveChat] Pusher error:', error);
        });

      } catch (error) {
        console.error('[LiveChat] Pusher connection failed:', error);
      }
    };

    connectPusher();

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [sessionId, isConnected, workspaceId, visitorId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages from CRM every 3 seconds
  useEffect(() => {
    if (!sessionId || !isConnected) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(
          `https://www.axelio.io/api/live-chat/messages?sessionId=${sessionId}&workspaceId=${workspaceId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.messages) {
            // Hide welcome message when real messages arrive
            if (data.messages.length > 0) {
              setShowWelcomeMessage(false);
            }
            
            // Convert CRM message format to widget format
            const formattedMessages: Message[] = data.messages.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              type: msg.sender === 'agent' ? 'agent' : 'visitor',
              timestamp: new Date(msg.timestamp),
            }));

            // Only update if we have new messages
            if (formattedMessages.length > messages.length) {
              setMessages(formattedMessages);
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Poll immediately and then every 3 seconds as fallback (WebSocket handles real-time)
    pollMessages();
    const interval = setInterval(pollMessages, 3000); // Poll every 3 seconds as fallback

    return () => clearInterval(interval);
  }, [sessionId, isConnected, workspaceId, messages.length]);

  // Phase 2: Poll for agent typing status (CRM dev ready - ACTIVATED)
  useEffect(() => {
    if (!sessionId || !isConnected) return;
    
    const pollTyping = async () => {
      try {
        const res = await fetch(
          `https://www.axelio.io/api/live-chat/typing-status?sessionId=${sessionId}&workspaceId=${workspaceId}`
        );
        const data = await res.json();
        setAgentIsTyping(data.isTyping || false);
      } catch (e) {
        // Ignore errors for now
      }
    };
    
    const interval = setInterval(pollTyping, 500);
    return () => clearInterval(interval);
  }, [sessionId, isConnected, workspaceId]);

  // Poll for session status to detect chat closure
  useEffect(() => {
    if (!sessionId || !isConnected) return;
    
    const pollStatus = async () => {
      try {
        const res = await fetch(
          `https://www.axelio.io/api/live-chat/session-status?sessionId=${sessionId}&workspaceId=${workspaceId}`
        );
        const data = await res.json();
        
        if (data.status === 'ended') {
          // Chat was closed by agent
          setIsConnected(false);
          setMessages(prev => [...prev, {
            id: 'chat_closed',
            content: 'The chat has been ended by an agent. Thank you for contacting us!',
            type: 'agent',
            timestamp: new Date()
          }]);
        }
      } catch (e) {
        console.error('Error polling session status:', e);
      }
    };
    
    const interval = setInterval(pollStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [sessionId, isConnected, workspaceId]);

  const connectToLiveChat = async (name?: string, email?: string) => {
    try {
      const currentPage = window.location.href;
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Use visitor ID from cookie (more reliable than state)
      const currentVisitorId = getCookie('tryckeget_visitor_id') || visitorId;
      
      console.log(`[LiveChat] Attempting to connect to CRM...`, {
        workspaceId,
        visitorId: currentVisitorId,
        currentPage,
        isProduction,
        visitorName: name || visitorName,
        visitorEmail: email || visitorEmail
      });
      
      const response = await fetch(
        'https://www.axelio.io/api/live-chat/connect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            workspaceId,
            visitorId: currentVisitorId,
            currentPage,
            visitorName: name || visitorName,
            visitorEmail: email || visitorEmail
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LiveChat] Connection failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to connect to live chat: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle case where CRM returns error message
      if (data.error || data.message === 'Failed to create chat channel') {
        console.warn(`[LiveChat] CRM returned error:`, data);
        // Still show chat widget but with offline message
        setIsConnected(false);
        setMessages([{
          id: 'offline',
          content: 'Chat is currently offline. You can still leave a message and we\'ll get back to you.',
          type: 'agent',
          timestamp: new Date(),
        }]);
        return;
      }
      
      console.log(`[LiveChat] Connected successfully:`, {
        sessionId: data.sessionId,
      });
      
      setSessionId(data.sessionId);
      setIsConnected(true);

      // Store session ID in cookie for persistence across page refreshes
      setCookie('tryckeget_session_id', data.sessionId, 1); // Store for 1 day

      // Add welcome message
      setMessages([{
        id: 'welcome',
        content: 'Hi! Welcome to Nicotine Pouches. How can we help you today?',
        type: 'agent',
        timestamp: new Date(),
      }]);

    } catch (error) {
      console.error('[LiveChat] Connection error:', error);
      setIsConnected(false);
      
      // Add error message for user feedback
      setMessages([{
        id: 'error',
        content: 'Sorry, we couldn\'t connect to chat right now. Please try again later.',
        type: 'agent',
        timestamp: new Date(),
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || !isConnected) return;

    // Hide welcome message when visitor sends first message
    setShowWelcomeMessage(false);

    const message: Message = {
      id: `msg_${Date.now()}`,
      content: inputMessage.trim(),
      type: 'visitor',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setInputMessage('');

    try {
        const response = await fetch('https://www.axelio.io/api/live-chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          workspaceId,
          content: message.content,
          sender: 'visitor',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Simulate agent typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Welcome message will be shown conditionally in the UI
      }, 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store visitor info in cookies
    if (visitorName) {
      setCookie('tryckeget_visitor_name', visitorName, 365);
    }
    if (visitorEmail) {
      setCookie('tryckeget_visitor_email', visitorEmail, 365);
    }
    
    setShowPreChatForm(false);
    connectToLiveChat(visitorName, visitorEmail);
  };

  const handleStartNewChat = () => {
    // Clear old session
    setSessionId('');
    setMessages([]);
    setShowWelcomeMessage(true); // Reset welcome message for new chat
    setShowPreChatForm(true);
    setIsConnected(false);
    
    // Clear session cookie
    document.cookie = 'tryckeget_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // If opening the chat
      const existingSessionId: string | null = getCookie('tryckeget_session_id');
      const storedVisitorName: string | null = getCookie('tryckeget_visitor_name');
      const storedVisitorEmail: string | null = getCookie('tryckeget_visitor_email');

      if (existingSessionId && storedVisitorName) {
        setSessionId(existingSessionId);
        setVisitorName(storedVisitorName);
        setVisitorEmail(storedVisitorEmail || '');
        setIsConnected(true);
        setShowPreChatForm(false); // Skip form if session exists
        console.log(`[LiveChat] Restored existing session on toggle:`, existingSessionId);
      } else {
        setShowPreChatForm(true); // Show form if no session
        setMessages([]); // Clear messages for new session
      }
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Live Chat</span>
              {isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
              </div>
              {/* Agent Avatars */}
              <div className="flex -space-x-2 ml-4">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format" 
                    alt="Agent Anna" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format" 
                    alt="Agent Erik" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format" 
                    alt="Agent Sofia" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Show welcome message only initially and when no real messages */}
            {showWelcomeMessage && messages.length === 0 && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format" 
                      alt="Agent Anna" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                    <p className="text-sm">Thanks for your message! One of our team members will respond soon.</p>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'visitor' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2">
                  {message.type === 'agent' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format" 
                        alt="Agent Anna" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.type === 'visitor'
                        ? 'bg-gray-900 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'visitor' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                    {message.timestamp.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Agent Typing Indicator (Phase 2 ready) */}
            {agentIsTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    A
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy Typing Indicator (for current simulation) */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    A
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Pre-Chat Form */}
          {showPreChatForm && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Welcome to our chat!</h3>
              <form onSubmit={handleStartChat} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                <input
                  type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="Your email (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                  <button
                    type="submit"
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  Start chat
                  </button>
              </form>
            </div>
          )}

          {/* Start New Chat Button */}
          {!isConnected && messages.some(m => m.id === 'chat_closed') && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleStartNewChat}
                className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Start new chat
              </button>
            </div>
          )}

          {/* Input */}
          {!showPreChatForm && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    
                    // Notify CRM that visitor is typing (fire-and-forget)
                    if (sessionId && isConnected) {
                      fetch('https://www.axelio.io/api/live-chat/typing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          sessionId,
                          workspaceId,
                          isTyping: e.target.value.length > 0,
                          visitorId: getCookie('tryckeget_visitor_id')
                        })
                      }).catch(() => {}); // Ignore errors for now
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || !isConnected}
                  className="bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              
              {!isConnected && (
                <p className="text-xs text-gray-500 mt-2">
                  Connecting to chat...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
