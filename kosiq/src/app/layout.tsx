import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import AIChatWidget from '@/components/AIChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KOSIQ — AI Medical Economics Platform',
  description: 'AI-Powered Medical Economics Intelligence for Healthcare Providers',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-[#1d1d1f]`}>
        <Providers>
          {children}
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  );
}
