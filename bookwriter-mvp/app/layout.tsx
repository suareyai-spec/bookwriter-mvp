import type { Metadata } from "next";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { AffiliateTracker } from "@/app/_components/AffiliateTracker";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plot Ghost — AI Book Generator",
  description: "Create full-length books, scripts, theses, and courses with AI. Professional quality, export-ready formatting. From idea to finished work in minutes.",
  icons: {
    icon: "/favicon.svg",
    apple: "/og-image.png",
  },
  openGraph: {
    title: "Plot Ghost — AI Book Generator",
    description: "Create full-length books, scripts, theses, and courses with AI. Professional quality, export-ready formatting.",
    url: "https://plotghost.ai",
    siteName: "Plot Ghost",
    images: [{ url: "https://plotghost.ai/og-image.png", width: 1200, height: 630, alt: "Plot Ghost" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plot Ghost — AI Book Generator",
    description: "Create full-length books, scripts, theses, and courses with AI.",
    images: ["https://plotghost.ai/og-image.png"],
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
