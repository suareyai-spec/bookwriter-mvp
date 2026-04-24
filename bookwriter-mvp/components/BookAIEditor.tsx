"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Chapter {
  title: string;
  index: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  editedContent?: string;
  chapterIndex?: number;
  applied?: boolean;
}

type Mode = "chat" | "edit" | "rewrite";

interface BookAIEditorProps {
  bookId: string;
  content: string;
  contentType?: string;
  onContentUpdated: () => Promise<void>;
}

function getLabel(ct: string): string {
  switch (ct) {
    case "newsletter": return "newsletter";
    case "article": return "article";
    case "comic": return "comic book";
    case "playwright": return "play";
    case "thesis": return "thesis";
    case "course": return "course";
    case "translation": return "translation";
    default: return "book";
  }
}

function getSectionLabel(ct: string): string {
  switch (ct) {
    case "newsletter": return "Section";
    case "article": return "Section";
    case "thesis": return "Section";
    case "course": return "Module";
    default: return "Chapter";
  }
}

function parseChapters(content: string): Chapter[] {
  const chapters: Chapter[] = [];
  const lines = content.split("\n");
  let idx = 0;
  for (const line of lines) {
    const match = line.match(/^## (.+)/);
    if (match) {
      chapters.push({ title: match[1].trim(), index: idx });
      idx++;
    }
  }
  return chapters;
}

function SimpleMarkdown({ text }: { text: string }) {
  // Strip out ```content ... ``` blocks from display (those are for editedContent)
  const cleaned = text.replace(/```content\n[\s\S]*?```/g, "").trim();
  
  const lines = cleaned.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={key++} className="font-semibold text-white">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }
    return parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\-\*]\s+(.+)/);

    if (bulletMatch) {
      inList = true;
      listItems.push(bulletMatch[1]);
    } else {
      flushList();
      if (line.trim() === "") {
        elements.push(<div key={`br-${i}`} className="h-2" />);
      } else {
        elements.push(<p key={`p-${i}`} className="my-1">{renderInline(line)}</p>);
      }
    }
  }
  flushList();

  return <div>{elements}</div>;
}

export default function BookAIEditor({ bookId, content, contentType = "book", onContentUpdated }: BookAIEditorProps) {
  const typeLabel = getLabel(contentType);
  const sectionLabel = getSectionLabel(contentType);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chat");
  const [selectedChapter, setSelectedChapter] = useState<number>(-1);
  const [sending, setSending] = useState(false);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const chapters = parseChapters(content);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const placeholders: Record<Mode, string> = {
    chat: `Ask about your ${typeLabel}...`,
    edit: "Describe what changes to make...",
    rewrite: "Describe how to rewrite this section...",
  };

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/books/${bookId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          selectedChapter: selectedChapter >= 0 ? selectedChapter : undefined,
          mode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Please try again." },
        ]);
        setSending(false);
        return;
      }

      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.response,
        editedContent: data.editedContent || undefined,
        chapterIndex: data.chapterIndex,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to connect. Please try again." },
      ]);
    }
    setSending(false);
  }

  async function applyChanges(msgIndex: number) {
    const msg = messages[msgIndex];
    if (!msg?.editedContent) return;

    setApplyingIndex(msgIndex);
    try {
      // Build new content by replacing the chapter
      let newContent = content;
      if (msg.chapterIndex !== undefined && msg.chapterIndex >= 0) {
        const lines = content.split("\n");
        const chapterStarts: number[] = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].match(/^## /)) {
            chapterStarts.push(i);
          }
        }
        if (msg.chapterIndex < chapterStarts.length) {
          const start = chapterStarts[msg.chapterIndex];
          const end = msg.chapterIndex + 1 < chapterStarts.length
            ? chapterStarts[msg.chapterIndex + 1]
            : lines.length;
          const before = lines.slice(0, start);
          const after = lines.slice(end);
          newContent = [...before, msg.editedContent, ...after].join("\n");
        } else {
          newContent = msg.editedContent;
        }
      } else {
        newContent = msg.editedContent;
      }

      const res = await fetch("/api/books/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          title: "",
          content: newContent,
          notes: `AI ${mode} edit`,
        }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m, i) => (i === msgIndex ? { ...m, applied: true } : m))
        );
        await onContentUpdated();
      }
    } catch {}
    setApplyingIndex(null);
  }

  function discardChanges(msgIndex: number) {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIndex ? { ...m, editedContent: undefined, applied: false } : m
      )
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const modeConfig: Record<Mode, { label: string; activeClass: string }> = {
    chat: { label: "Chat", activeClass: "bg-blue-600/30 border-blue-500/50 text-blue-300" },
    edit: { label: "Edit", activeClass: "bg-purple-600/30 border-purple-500/50 text-purple-300" },
    rewrite: { label: "Rewrite", activeClass: "bg-orange-600/30 border-orange-500/50 text-orange-300" },
  };

  return (
    <div className="flex flex-col h-full bg-white/[0.02]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">AI Editor</h3>
        </div>

        {/* Chapter selector */}
        <select
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(Number(e.target.value))}
        >
          <option value={-1} className="bg-gray-900">Entire {typeLabel}</option>
          {chapters.map((ch) => (
            <option key={ch.index} value={ch.index} className="bg-gray-900">
              {ch.title}
            </option>
          ))}
        </select>

        {/* Mode pills */}
        <div className="flex gap-1.5">
          {(Object.keys(modeConfig) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 text-xs font-medium rounded-lg px-3 py-1.5 border transition-all ${
                mode === m
                  ? modeConfig[m].activeClass
                  : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]"
              }`}
            >
              {modeConfig[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {messages.length === 0 && (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 mt-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              I&apos;ve read your {typeLabel}. Ask me anything, or select a section and choose Edit or Rewrite to make changes.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white/[0.04] border border-white/[0.06] text-gray-300"
              }`}
            >
              {msg.role === "assistant" ? (
                <SimpleMarkdown text={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Edited content card */}
              {msg.role === "assistant" && msg.editedContent && !msg.applied && (
                <div className="mt-3 border border-green-500/20 bg-green-500/5 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-green-500/20 bg-green-500/10">
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                      Suggested Changes
                    </span>
                  </div>
                  <div
                    className="px-3 py-2 text-xs text-gray-400 whitespace-pre-wrap overflow-y-auto font-mono leading-relaxed"
                    style={{ maxHeight: "300px" }}
                  >
                    {msg.editedContent}
                  </div>
                  <div className="px-3 py-2 border-t border-green-500/20 flex gap-2">
                    <button
                      onClick={() => applyChanges(i)}
                      disabled={applyingIndex === i}
                      className="flex-1 bg-green-600/30 hover:bg-green-600/40 border border-green-500/40 text-green-300 text-xs font-medium rounded-lg py-1.5 transition-all disabled:opacity-50"
                    >
                      {applyingIndex === i ? "Applying..." : "Apply Changes"}
                    </button>
                    <button
                      onClick={() => discardChanges(i)}
                      className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-gray-400 text-xs rounded-lg px-3 py-1.5 transition-all"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}

              {msg.role === "assistant" && msg.applied && (
                <div className="mt-2 text-xs text-green-400/70 font-medium">
                  Changes applied successfully
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none leading-relaxed"
            placeholder={placeholders[mode]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={(e) => { e.preventDefault(); sendMessage(); }}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.06] disabled:text-gray-600 text-white rounded-xl p-2.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
