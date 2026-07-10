export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-a-book-with-ai",
    title: "How to Write a Book with AI in 2026",
    excerpt: "A practical walkthrough of using AI to go from a rough idea to a finished, structured manuscript — what works, what to watch out for, and how to keep your voice.",
  },
  {
    slug: "best-ai-book-generator",
    title: "Best AI Book Generator Tools Compared (2026)",
    excerpt: "We compare the leading AI book generation tools on output quality, export formats, pricing, and how much editing they actually save you.",
  },
  {
    slug: "ai-book-amazon-kdp",
    title: "How to Self-Publish on Amazon KDP Using AI-Generated Books",
    excerpt: "Step-by-step guidance on formatting, disclosing AI use, and publishing an AI-assisted book on Kindle Direct Publishing.",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
