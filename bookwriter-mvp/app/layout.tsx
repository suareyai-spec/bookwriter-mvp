import type { Metadata } from "next";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { AffiliateTracker } from "@/app/_components/AffiliateTracker";
import { SITE_URL } from "@/lib/config";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PlotGhost — AI Book Generator",
  description: "Create full-length books, scripts, theses, and courses with AI. Professional quality, export-ready formatting. From idea to finished work in minutes.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/og-image.png",
  },
  openGraph: {
    title: "PlotGhost — AI Book Generator",
    description: "Create full-length books, scripts, theses, and courses with AI. Professional quality, export-ready formatting.",
    url: SITE_URL,
    siteName: "PlotGhost",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PlotGhost" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlotGhost — AI Book Generator",
    description: "Create full-length books, scripts, theses, and courses with AI.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} ${playfair.variable} antialiased`}>
        <SessionProvider>
          <Suspense fallback={null}>
            <AffiliateTracker />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
