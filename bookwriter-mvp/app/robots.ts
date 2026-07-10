import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://plotghost.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/account",
        "/library",
        "/library/",
        "/books/",
        "/create",
        "/affiliates/dashboard",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
