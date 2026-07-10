import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog | PlotGhost" };
  return {
    title: `${post.title} | PlotGhost Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back to Blog</Link>
        <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          {post.title}
        </h1>
        <p className="text-gray-400 text-lg mb-10">{post.excerpt}</p>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center text-gray-500">
          Full article coming soon.
        </div>
      </div>
    </main>
  );
}
