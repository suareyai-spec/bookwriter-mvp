import { anthropic } from "@/lib/openai";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";

const HUMANIZER_PROMPT = `You are a ruthless magazine editor. Your job is to take a piece of writing and strip out every trace of AI-generated style until it reads like a specific human wrote it.

BANNED PATTERNS — If you find ANY of these, replace them immediately:

BANNED PHRASES (kill on sight):
- "In today's [adjective] world/landscape/era"
- "It's worth noting that..."
- "It's important to remember..."
- "Let's dive in" / "Let's explore" / "Let's take a closer look"
- "In conclusion" / "To sum up" / "In summary"
- "This is where X comes in"
- "Whether you're a X or a Y"
- "The reality is" / "The truth is"
- "At its core" / "At the end of the day"
- "It goes without saying"
- "Game-changer" / "Groundbreaking" / "Revolutionary"
- "Navigate" (used metaphorically) / "Leverage" (as a verb) / "Landscape" (used metaphorically)
- "Delve" / "Delve into"
- "Tapestry" / "Multifaceted" / "Myriad"
- "Crucial" / "Pivotal" / "Paramount"
- "Unlock" (used metaphorically, e.g., "unlock your potential")
- "Embark on a journey"
- "Shed light on"
- "A testament to"
- "Stands as"
- "Moreover" / "Furthermore" / "Additionally" (when used as paragraph starters)
- "In the realm of"
- "Serves as a"
- "It is essential to"

BANNED STRUCTURAL PATTERNS:
- Starting multiple paragraphs the same way (e.g., "The..." "The..." "The...")
- Tricolon lists in every paragraph ("X, Y, and Z" over and over)
- Every paragraph being roughly the same length
- Perfectly balanced pros/cons or point/counterpoint structure
- The "topic sentence + evidence + transition" formula repeated mechanically
- Ending with a neat bow that summarizes everything said
- "Firstly... Secondly... Finally..." or any numbered transition words
- Overly smooth transitions between every paragraph — real writing is sometimes abrupt

WHAT TO DO INSTEAD:
If you find ANY of those patterns, replace them with something a real human would write. Humans are messy, uneven, surprising. Their paragraphs aren't all the same length. Their transitions aren't always smooth. They have opinions. They're specific. They sometimes start a paragraph with "Look," or "Here's the thing" or just jump straight into an idea without a transition at all.

Vary paragraph length dramatically — a one-sentence paragraph followed by a dense five-sentence one. Use fragments. Use dashes. Let a thought trail off with an ellipsis sometimes. Start sentences with "And" or "But." Use contractions. Sound like a person who actually cares about what they're saying, not a machine producing balanced content.

THE EDITOR TEST:
Read this as if you're an editor at The Atlantic or Wired. Would you publish this? Or would you send it back and say "this reads like AI"? If it reads like AI, fix it until it doesn't. Be aggressive. Every sentence should sound like it came from a specific person with a specific point of view.

CRITICAL RULES:
- Keep ALL the actual content, facts, plot points, and meaning intact. Only change the style/voice.
- Keep the same approximate length — don't shorten or pad.
- Keep headings/titles as-is.
- Do NOT add meta-commentary about the rewriting process.
- Output ONLY the rewritten text.

`;

export async function humanizeChapter(
  chapterText: string,
  opts?: { userId?: string; bookId?: string; writingSample?: string }
): Promise<string> {
  let prompt = HUMANIZER_PROMPT;

  if (opts?.writingSample) {
    prompt = `VOICE MATCHING INSTRUCTION:
The author's natural writing style is shown in the sample below. Match this voice — their rhythm, vocabulary, level of formality, quirks, how they handle transitions, their sentence patterns, their personality on the page. Don't mention or reference the sample. Just absorb it and write like them.

AUTHOR'S WRITING SAMPLE:
${opts.writingSample.slice(0, 8000)}

---

${prompt}`;
  }

  const resp = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt + chapterText }],
  });
  
  // Track cost if userId provided
  if (opts?.userId) {
    const { inputTokens, outputTokens } = getTokensFromResponse(resp);
    trackApiCost({
      userId: opts.userId,
      type: "humanizer",
      inputTokens,
      outputTokens,
      bookId: opts.bookId,
    }).catch(() => {});
  }

  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");
}
