import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/config";

const BASE_URL = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/auth/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/auth/signup`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/affiliates`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/special`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/special/university-course`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes];
}
