import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stripe-qb-converter.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Stripe to QuickBooks Converter | Free, Private, Instant",
    description: "Convert Stripe exports into QuickBooks-ready CSV files entirely in your browser.",
    url: "/",
    siteName: "Stripe2QB",
    type: "website",
  },
  twitter: { card: "summary", title: "Stripe to QuickBooks Converter", description: "A free, private, browser-based Stripe to QuickBooks CSV converter." },
  icons: { icon: "/favicon.ico" },
  title: "Stripe to QuickBooks Converter — Free, Instant, No Signup",
  description: "Free tools for Stripe and QuickBooks users. Convert your Stripe CSV to QuickBooks-ready format instantly. No signup required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <header className="topbar">
          <div className="container topbar-inner">
            <Link href="/" className="brand"><span className="brand-mark">+</span> Stripe2QB</Link>
            <nav><Link href="/tools">Tools</Link><Link href="/blog">Blogs</Link><Link href="/tools/export-stripe-to-quickbooks" className="topbar-cta">Open converter ↗</Link></nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
