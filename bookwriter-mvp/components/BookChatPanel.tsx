"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

type Mode = "chat" | "edit" | "rewrite";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  editedContent?: string;
  chapterIndex?: number;
  timestamp: Date;
  applied?: boolean;
}

interface Chapter {
  title: string;
  index: number;
}

interface BookChatPanelProps {
  bookId: string;
  content: string | undefined;
  onContentUpdated: () => Promise<void>;
}

function parseChaptersFromContent(content: string): Chapter[] {
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

function replaceChapterContent(fullContent: string, chapterIndex: number, newChapterContent: string): string {
  const lines = fullContent.split("\n");
  const chapterStarts: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^## /)) {
      chapterStarts.push(i);
    }
  }

  if (chapterIndex < 0 || chapterIndex >= chapterStarts.length) return fullContent;

  const startLine = chapterStarts[chapterIndex];
  const endLine = chapterIndex + 1 < chapterStarts.length ? chapterStarts[chapterIndex + 1] : lines.length;

  const before = lines.slice(0, startLine);
  const after = lines.slice(endLine);

  return [...before, newChapterContent, ...after].join("\n");
}

export default function BookChatPanel({ bookId, content, onContentUpdated }: BookChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chat");
  const [selectedChapter, setSelectedChapter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [showDiff, setShowDiff] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chapters = content ? parseChaptersFromContent(content) : [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/books/${bookId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          selectedChapter,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            editedContent: data.editedContent,
            chapterIndex: data.chapterIndex,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  }

  async function applyChanges(messageIndex: number) {
    const msg = messages[messageIndex];
    if (!msg.editedContent || !content) return;

    setApplying(messageIndex);

    try {
      let newContent: string;
      if (msg.chapterIndex !== undefined) {
        newContent = replaceChapterContent(content, msg.chapterIndex, msg.editedContent);
      } else {
        newContent = msg.editedContent;
      }

      const res = await fetch("/api/books/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          content: newContent,
          notes: `AI ${mode}: ${messages[messageIndex - 1]?.content?.slice(0, 100) || "chat edit"}`,
        }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m, i) => (i === messageIndex ? { ...m, applied: true } : m))
        );
        await onContentUpdated();
        setShowDiff(null);
      }
    } catch {
      // silently fail
    }

    setApplying(null);
  }

  function getOriginalContent(chapterIndex?: number): string {
    if (!content) return "";
    if (chapterIndex === undefined) return content;

    const lines = content.split("\n");
    const chapterStarts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^## /)) chapterStarts.push(i);
    }
    if (chapterIndex < 0 || chapterIndex >= chapterStarts.length) return content;
    const startLine = chapterStarts[chapterIndex];
    const endLine = chapterIndex + 1 < chapterStarts.length ? chapterStarts[chapterIndex + 1] : lines.length;
    return lines.slice(startLine, endLine).join("\n");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const modeLabels: Record<Mode, string> = {
    chat: "Chat",
    edit: "Edit Section",
    rewrite: "Rewrite Section",
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-white/10 border border-white/20 hover:bg-white/15"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-[420px] max-w-[100vw] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-[#0c0c14]/95 backdrop-blur-xl border-l border-white/[0.08] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-white/[0.08] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                AI Editor
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chapter Selector */}
            <select
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 mb-3 appearance-none"
              value={selectedChapter === undefined ? "all" : selectedChapter}
              onChange={(e) =>
                setSelectedChapter(e.target.value === "all" ? undefined : Number(e.target.value))
              }
            >
              <option value="all" className="bg-gray-900">
                Full Book
              </option>
              {chapters.map((ch) => (
                <option key={ch.index} value={ch.index} className="bg-gray-900">
                  {ch.title}
                </option>
              ))}
            </select>

            {/* Mode Buttons */}
            <div className="flex gap-1.5">
              {(["chat", "edit", "rewrite"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-lg transition-all ${
                    mode === m
                      ? m === "chat"
                        ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                        : m === "edit"
                        ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                        : "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                      : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {modeLabels[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-600 text-sm space-y-2">
                  <p className="text-gray-400 font-medium">AI Editor ready</p>
                  <p>Ask questions about your book, request edits, or rewrite sections.</p>
                  <p className="text-xs mt-4 text-gray-700">
                    Select a chapter above to focus on a specific section.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-100"
                      : "bg-white/[0.04] border border-white/[0.08] text-gray-300"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_pre]:bg-white/[0.06] [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-blue-300 [&_code]:text-xs">
                      <ReactMarkdown>{msg.content.replace(/```content\n[\s\S]*?```/g, "*(edited content below)*")}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <div className="mt-1.5 text-[10px] text-gray-600">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {/* Apply Changes Button */}
                  {msg.role === "assistant" && msg.editedContent && !msg.applied && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => setShowDiff(showDiff === i ? null : i)}
                        className="w-full text-xs text-gray-400 hover:text-gray-300 py-1 transition-colors"
                      >
                        {showDiff === i ? "Hide preview" : "Preview changes"}
                      </button>

                      {showDiff === i && (
                        <div className="rounded-lg overflow-hidden border border-white/[0.08]">
                          <div className="bg-red-500/10 border-b border-white/[0.06] p-2">
                            <div className="text-[10px] font-medium text-red-400 uppercase tracking-wider mb-1">Original</div>
                            <pre className="text-[11px] text-red-300/70 whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {getOriginalContent(msg.chapterIndex).slice(0, 500)}
                              {getOriginalContent(msg.chapterIndex).length > 500 ? "..." : ""}
                            </pre>
                          </div>
                          <div className="bg-green-500/10 p-2">
                            <div className="text-[10px] font-medium text-green-400 uppercase tracking-wider mb-1">New</div>
                            <pre className="text-[11px] text-green-300/70 whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {msg.editedContent.slice(0, 500)}
                              {msg.editedContent.length > 500 ? "..." : ""}
                            </pre>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => applyChanges(i)}
                        disabled={applying === i}
                        className="w-full bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/40 text-white text-sm font-semibold rounded-lg py-2.5 transition-all"
                      >
                        {applying === i ? "Applying..." : "Apply Changes"}
                      </button>
                    </div>
                  )}

                  {msg.role === "assistant" && msg.applied && (
                    <div className="mt-2 text-xs text-green-400 font-medium">
                      Changes applied successfully
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-white/[0.08] p-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                placeholder={
                  mode === "chat"
                    ? "Ask about your book..."
                    : mode === "edit"
                    ? "Describe the changes to make..."
                    : "Describe how to rewrite..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl px-4 py-2.5 transition-all disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-[10px] text-gray-700 text-center">
              {mode === "chat" ? "Chat mode" : mode === "edit" ? "Edit mode" : "Rewrite mode"}
              {selectedChapter !== undefined && chapters[selectedChapter]
                ? ` -- ${chapters[selectedChapter].title}`
                : " -- Full Book"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
