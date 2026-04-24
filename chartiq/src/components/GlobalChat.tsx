'use client';
import { useState, useRef, useEffect } from 'react';

export function GlobalChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('Failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMsg += parsed.text;
                  setMessages([...newMessages, { role: 'assistant', content: assistantMsg }]);
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error generating response.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand text-white rounded-full shadow-lg hover:bg-brand/90 flex items-center justify-center text-2xl z-50 transition-transform hover:scale-105">
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-brand/5 to-teal/5 rounded-t-2xl">
            <h3 className="font-semibold text-dark text-base">ChartIQ Assistant</h3>
            <p className="text-xs text-gray-400">Ask about patients, charts, labs, medications, or anything clinical</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-8 space-y-4">
                <p className="text-sm text-gray-400">How can I help you today?</p>
                <div className="space-y-2">
                  {['Which patients have critical lab values?', 'Summarize ICU patient status', 'Any pending urgent orders?', 'Who needs shift handoff attention?'].map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-brand/5 hover:text-brand transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-brand text-white' : 'bg-gray-50 text-dark border border-gray-100'
                }`}>
                  {m.content || <span className="animate-pulse text-gray-400">Thinking...</span>}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask anything about your patients..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/20" />
              <button onClick={send} disabled={loading}
                className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
