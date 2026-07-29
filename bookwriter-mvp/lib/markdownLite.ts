// Converts between the plain "markdown-lite" text format PlotGhost stores
// generated content in (# / ## / ### headers, **bold**, - bullets, blank-line
// paragraphs — see app/api/export/pdf/route.ts and components/BookAIEditor.tsx
// for the other two places that read this same format) and Tiptap's JSON
// document model. Round-tripping through these keeps ContentEditor compatible
// with export, the chapter-heading parser, and the AI chat editor without
// changing how content is stored.

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
}

export interface TiptapDoc {
  type: "doc";
  content: TiptapNode[];
}

// Splits a line of text on **bold** spans into inline text nodes with marks.
function parseInline(text: string): TiptapNode[] {
  if (!text) return [];
  const nodes: TiptapNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  for (const part of parts) {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      nodes.push({ type: "text", text: boldMatch[1], marks: [{ type: "bold" }] });
    } else {
      nodes.push({ type: "text", text: part });
    }
  }
  return nodes.length ? nodes : [{ type: "text", text: "" }];
}

export function textToTiptapDoc(text: string): TiptapDoc {
  const lines = (text || "").split("\n");
  const content: TiptapNode[] = [];
  let listItems: TiptapNode[] = [];

  const flushList = () => {
    if (listItems.length) {
      content.push({ type: "bulletList", content: listItems });
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const h1 = line.match(/^#\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    const bullet = line.match(/^[-*]\s+(.+)/);

    if (h3) {
      flushList();
      content.push({ type: "heading", attrs: { level: 3 }, content: parseInline(h3[1]) });
    } else if (h2) {
      flushList();
      content.push({ type: "heading", attrs: { level: 2 }, content: parseInline(h2[1]) });
    } else if (h1) {
      flushList();
      content.push({ type: "heading", attrs: { level: 1 }, content: parseInline(h1[1]) });
    } else if (bullet) {
      listItems.push({ type: "listItem", content: [{ type: "paragraph", content: parseInline(bullet[1]) }] });
    } else {
      flushList();
      if (line.trim() === "") {
        // Blank line — skip; paragraph breaks are implicit between block nodes.
        continue;
      }
      content.push({ type: "paragraph", content: parseInline(line) });
    }
  }
  flushList();

  if (content.length === 0) {
    content.push({ type: "paragraph", content: [] });
  }

  return { type: "doc", content };
}

function inlineToText(nodes: TiptapNode[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type !== "text") return "";
      const isBold = n.marks?.some((m) => m.type === "bold");
      return isBold ? `**${n.text}**` : n.text || "";
    })
    .join("");
}

export function tiptapDocToText(doc: TiptapDoc | TiptapNode): string {
  const blocks = (doc as TiptapDoc).content || [];
  const lines: string[] = [];

  for (const node of blocks) {
    switch (node.type) {
      case "heading": {
        const level = (node.attrs?.level as number) || 1;
        lines.push(`${"#".repeat(Math.min(3, level))} ${inlineToText(node.content)}`);
        lines.push("");
        break;
      }
      case "bulletList": {
        for (const item of node.content || []) {
          const para = item.content?.[0];
          lines.push(`- ${inlineToText(para?.content)}`);
        }
        lines.push("");
        break;
      }
      case "paragraph": {
        lines.push(inlineToText(node.content));
        lines.push("");
        break;
      }
      default:
        break;
    }
  }

  // Collapse trailing blank lines and normalize double blank lines.
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
