import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Real Job Postings - Community-Verified Job Board',
    template: '%s | Real Job Postings',
  },
  description: 'Find legitimate job opportunities verified by the community. AI-powered sentiment analysis helps identify real jobs from scams.',
  keywords: ['jobs', 'job board', 'verified jobs', 'real jobs', 'job listings', 'community verified', 'job search'],
  authors: [{ name: 'Real Job Postings' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    title: 'Real Job Postings - Community-Verified Job Board',
    description: 'Find legitimate job opportunities verified by the community. AI-powered sentiment analysis helps identify real jobs from scams.',
    siteName: 'Real Job Postings',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Job Postings - Community-Verified Job Board',
    description: 'Find legitimate job opportunities verified by the community.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-W7P60KCWFQ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W7P60KCWFQ');
        `}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
