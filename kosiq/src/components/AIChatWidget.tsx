'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function formatMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line) => {
    // Headings — strip the ## and render as bold
    line = line.replace(/^###\s+(.+)$/g, '<strong style="font-size:12px;display:block;margin-top:8px">$1</strong>');
    line = line.replace(/^##\s+(.+)$/g, '<strong style="font-size:13px;display:block;margin-top:10px">$1</strong>');
    line = line.replace(/^#\s+(.+)$/g, '<strong style="font-size:14px;display:block;margin-top:10px">$1</strong>');
    // Bold
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    line = line.replace(/`(.+?)`/g, '<code style="background:#f0f0f0;padding:1px 4px;border-radius:3px;font-size:11px">$1</code>');
    // Bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('- ')) {
      const content = line.trim().replace(/^[•-]\s*/, '');
      return `<div style="padding-left:12px;position:relative"><span style="position:absolute;left:0">·</span>${content}</div>`;
    }
    // Numbered lists
    if (/^\d+\.\s/.test(line.trim())) {
      return `<div style="padding-left:12px">${line.trim()}</div>`;
    }
    if (line.trim() === '') return '<br/>';
    return `<div>${line}</div>`;
  }).join('');
}

export default function AIChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I\'m the **KOSIQ AI Assistant**. Ask me about patients, risk scores, costs, medications, and more!\n\nTry: "How many patients do we have?" or "High risk patients"' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.error || 'No response' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (!session) return null;

  return (
    <>
      {/* Chat Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: isOpen ? '90px' : '-600px',
          right: '24px',
          width: '400px',
          maxWidth: 'calc(100vw - 48px)',
          height: '520px',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
          opacity: isOpen ? 1 : 0,
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#0071e3', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '16px'
            }}>🤖</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>KOSIQ AI Assistant</div>
              <div style={{ color: '#86868b', fontSize: '11px' }}>Ask about patients, costs & more</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none', border: 'none', color: '#86868b',
              cursor: 'pointer', fontSize: '20px', padding: '4px',
              lineHeight: 1, borderRadius: '6px',
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#86868b')}
          >✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          background: '#fafafa',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#0071e3' : '#f5f5f7',
                  color: msg.role === 'user' ? '#fff' : '#1d1d1f',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
              />
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 18px', borderRadius: '16px 16px 16px 4px',
                backgroundColor: '#f5f5f7', display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: '#86868b',
                    animation: `chatBounce 1.2s ease-in-out ${j * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{
          padding: '12px 16px', borderTop: '1px solid #e5e5e7',
          display: 'flex', gap: '8px', background: '#fff', flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about patients, costs, risks..."
            disabled={isLoading}
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid #d2d2d7',
              borderRadius: '20px', fontSize: '13px', outline: 'none',
              background: '#fafafa',
            }}
            onFocus={e => (e.target.style.borderColor = '#0071e3')}
            onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: input.trim() ? '#0071e3' : '#d2d2d7',
              border: 'none', color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0, transition: 'background 0.2s',
            }}
          >↑</button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#0071e3',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,113,227,0.4)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,113,227,0.5)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,113,227,0.4)'; }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Bounce animation */}
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
