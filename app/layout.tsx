import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
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
  title: 'Stripe to QuickBooks Converter - Free & Instant',
  description: 'Convert Stripe CSV to QuickBooks format in 10 seconds. Free forever, no signup required. Works in your browser.',
  openGraph: {
    title: 'Stripe to QuickBooks Converter',
    description: 'Free tool to convert Stripe payments to QuickBooks format',
    url: 'https://stripeqbconverter-five.vercel.app',
    siteName: 'Stripe to QuickBooks Converter',
    images: [
      {
        url: 'https://stripeqbconverter-five.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stripe to QuickBooks Converter',
    description: 'Convert Stripe CSV to QuickBooks format in 10 seconds',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <GoogleAnalytics gaId="G-CH0RTJZ7TY" />
      </body>
    </html>
  );
}
