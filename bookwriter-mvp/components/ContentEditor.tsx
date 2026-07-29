"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { textToTiptapDoc, tiptapDocToText } from "@/lib/markdownLite";
import { useCredits } from "@/lib/useCredits";
import ZeroCreditsModal from "@/components/ZeroCreditsModal";

interface ContentEditorProps {
  bookId: string;
  versionId?: string;
  initialContent: string;
  onSaved?: (newContent: string) => void;
}

const REWRITE_PLACEHOLDERS = [
  "Make this shorter",
  "Make this more formal",
  "Add more detail",
  "Simplify this",
];

type BubbleState = "menu" | "prompt" | "loading" | "suggestion";

const AUTOSAVE_INTERVAL_MS = 30000;

export default function ContentEditor({ bookId, versionId, initialContent, onSaved }: ContentEditorProps) {
  const { totalCredits } = useCredits();
  const [bubbleState, setBubbleState] = useState<BubbleState>("menu");
  const [instruction, setInstruction] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [showZeroCredits, setShowZeroCredits] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [wordCount, setWordCount] = useState(0);

  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const selectionRangeRef = useRef<{ from: number; to: number } | null>(null);
  const currentVersionIdRef = useRef(versionId);

  const editor = useEditor({
    extensions: [StarterKit],
    content: textToTiptapDoc(initialContent) as any,
    editable: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none min-h-[50vh] px-6 py-8 sm:px-10 text-gray-200 leading-[1.8] text-[15px]",
      },
    },
    onUpdate: ({ editor }) => {
      dirtyRef.current = true;
      setWordCount(editor.getText().split(/\s+/).filter(Boolean).length);
    },
    onBlur: () => {
      save();
    },
  });

  useEffect(() => {
    if (editor) setWordCount(editor.getText().split(/\s+/).filter(Boolean).length);
  }, [editor]);

  // Reset the bubble back to its default menu whenever the user selects a
  // genuinely different range (not just re-entering the same selection
  // while interacting with the open bubble panel itself).
  const lastRangeRef = useRef<{ from: number; to: number } | null>(null);
  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      const last = lastRangeRef.current;
      if (from === to) {
        lastRangeRef.current = null;
        return;
      }
      if (!last || last.from !== from || last.to !== to) {
        lastRangeRef.current = { from, to };
        resetBubble();
      }
    };
    editor.on("selectionUpdate", onSelectionUpdate);
    return () => { editor.off("selectionUpdate", onSelectionUpdate); };
  }, [editor]);

  // Rotate the rewrite input's placeholder examples while it's open.
  useEffect(() => {
    if (bubbleState !== "prompt") return;
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % REWRITE_PLACEHOLDERS.length), 2200);
    return () => clearInterval(t);
  }, [bubbleState]);

  const save = useCallback(async () => {
    if (!editor || !dirtyRef.current || savingRef.current) return;
    savingRef.current = true;
    setSaveState("saving");
    try {
      const content = tiptapDocToText(editor.getJSON() as any);
      const res = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, versionId: currentVersionIdRef.current, content }),
      });
      if (res.ok) {
        const data = await res.json();
        currentVersionIdRef.current = data.versionId || currentVersionIdRef.current;
        dirtyRef.current = false;
        setSaveState("saved");
        onSaved?.(content);
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
      } else {
        setSaveState("idle");
      }
    } catch {
      setSaveState("idle");
    }
    savingRef.current = false;
  }, [editor, bookId, onSaved]);

  // Auto-save every 30s while there are unsaved changes.
  useEffect(() => {
    const t = setInterval(() => save(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [save]);

  // Save on unmount / navigation away.
  useEffect(() => {
    return () => { save(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetBubble() {
    setBubbleState("menu");
    setInstruction("");
    setSuggestion(null);
    setRewriteError(null);
  }

  function handleCopy() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, "\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function openRewritePrompt() {
    if (totalCredits !== null && totalCredits <= 0) {
      setShowZeroCredits(true);
      return;
    }
    if (!editor) return;
    const { from, to } = editor.state.selection;
    selectionRangeRef.current = { from, to };
    setBubbleState("prompt");
  }

  async function submitRewrite() {
    if (!editor || !instruction.trim() || !selectionRangeRef.current) return;
    const { from, to } = selectionRangeRef.current;
    const selectedText = editor.state.doc.textBetween(from, to, "\n");
    if (!selectedText.trim()) return;

    // Surrounding paragraph, for tone/style continuity — the block just
    // before and after the selection, not the whole document.
    const docText = editor.getText();
    const idx = docText.indexOf(selectedText);
    const context = idx >= 0
      ? docText.slice(Math.max(0, idx - 300), Math.min(docText.length, idx + selectedText.length + 300))
      : "";

    setBubbleState("loading");
    setRewriteError(null);
    try {
      const res = await fetch("/api/content/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText, instruction: instruction.trim(), context }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsCredits) {
          setShowZeroCredits(true);
          resetBubble();
          return;
        }
        setRewriteError(data.error || "Rewrite failed");
        setBubbleState("prompt");
        return;
      }
      setSuggestion(data.rewrittenText);
      setBubbleState("suggestion");
    } catch {
      setRewriteError("Rewrite failed. Please try again.");
      setBubbleState("prompt");
    }
  }

  function acceptSuggestion() {
    if (!editor || !suggestion || !selectionRangeRef.current) return;
    const { from, to } = selectionRangeRef.current;
    editor.chain().focus().setTextSelection({ from, to }).deleteSelection().insertContent(suggestion).run();
    dirtyRef.current = true;
    resetBubble();
    save();
  }

  function rejectSuggestion() {
    resetBubble();
  }

  const insufficientCredits = totalCredits !== null && totalCredits <= 0;

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state }) => {
            const { from, to } = state.selection;
            return editor.isEditable && from !== to && !state.selection.empty;
          }}
          className="z-50"
        >
          <div className="bg-[#12121a] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden text-sm" style={{ minWidth: bubbleState === "menu" ? "auto" : "320px", maxWidth: "420px" }}>
            {bubbleState === "menu" && (
              <div className="flex items-stretch divide-x divide-white/[0.08]">
                <button
                  onClick={() => resetBubble()}
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-300 hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                >
                  ✏️ Edit manually
                </button>
                <button
                  onClick={openRewritePrompt}
                  className="flex items-center gap-1.5 px-3 py-2 text-blue-300 hover:bg-white/[0.06] transition-colors whitespace-nowrap font-medium"
                >
                  ✨ Rewrite (1 credit)
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-300 hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                >
                  📋 {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            {bubbleState === "prompt" && (
              <div className="p-3 space-y-2">
                <div className="text-xs text-gray-400 font-medium">How should I rewrite this?</div>
                {rewriteError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">{rewriteError}</div>}
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitRewrite(); if (e.key === "Escape") resetBubble(); }}
                    placeholder={REWRITE_PLACEHOLDERS[placeholderIdx]}
                    className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={submitRewrite}
                    disabled={!instruction.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                  >
                    Go
                  </button>
                </div>
                <button onClick={resetBubble} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
              </div>
            )}

            {bubbleState === "loading" && (
              <div className="p-4 flex items-center gap-2.5 text-gray-400">
                <span className="w-3.5 h-3.5 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin flex-shrink-0" />
                Rewriting selection...
              </div>
            )}

            {bubbleState === "suggestion" && suggestion && (
              <div className="p-3 space-y-2">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Suggested rewrite</div>
                <div className="bg-green-500/10 border border-green-500/25 rounded-lg p-2.5 text-green-300 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {suggestion}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={acceptSuggestion}
                    className="flex-1 bg-green-600/30 hover:bg-green-600/40 border border-green-500/40 text-green-300 text-xs font-medium rounded-lg py-1.5 transition-all"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={rejectSuggestion}
                    className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-gray-400 text-xs font-medium rounded-lg py-1.5 transition-all"
                  >
                    ✗ Keep original
                  </button>
                </div>
              </div>
            )}
          </div>
        </BubbleMenu>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01] flex-wrap">
        <ToolbarButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} label="B" title="Bold" bold />
        <ToolbarButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} label="I" title="Italic" italic />
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        <ToolbarButton active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" title="Heading 1" />
        <ToolbarButton active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" title="Heading 2" />
        <ToolbarButton active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" title="Heading 3" />
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        <ToolbarButton active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} label="•" title="Bullet list" />
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} label="↺" title="Undo" />
        <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} label="↻" title="Redo" />
      </div>

      {/* Editable content */}
      <EditorContent editor={editor} />

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] text-xs text-gray-500">
        <span>{wordCount.toLocaleString()} words</span>
        <span className="flex items-center gap-1.5">
          {saveState === "saving" && <>Saving...</>}
          {saveState === "idle" && dirtyRef.current === false && "All changes saved"}
        </span>
      </div>

      {/* "Saved ✓" toast */}
      {saveState === "saved" && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600/90 text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-2xl backdrop-blur-sm animate-in fade-in">
          Saved ✓
        </div>
      )}

      <ZeroCreditsModal isOpen={showZeroCredits} onClose={() => setShowZeroCredits(false)} />
      {insufficientCredits && null}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  title,
  bold,
  italic,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  title: string;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
        active ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
      } ${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`}
    >
      {label}
    </button>
  );
}
