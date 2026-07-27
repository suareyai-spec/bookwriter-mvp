import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | PlotGhost",
  description: "Guides and comparisons on AI book writing, self-publishing, and getting the most out of AI-generated content.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Blog
        </h1>
        <p className="text-gray-400 mb-12">Guides on AI writing, book generation, and self-publishing.</p>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 transition-all"
            >
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
