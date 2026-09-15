import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({ title: "About Stripe2QB", description: "Stripe2QB makes Stripe and QuickBooks workflows simpler with private, browser-based tools.", alternates: { canonical: "/about" } });

export default function AboutPage() { return <main className="article-page"><span className="section-label">ABOUT STRIPE2QB</span><h1>Small tools for less bookkeeping friction.</h1><div className="article-body"><p>Stripe2QB is a collection of focused tools for people who accept payments with Stripe and keep their books in QuickBooks, Xero, or related accounting software.</p><p>The tools are designed around a simple principle: make the useful calculation or conversion obvious, fast, and safe to try. File conversion happens in your browser, so your exports do not need to be uploaded to a server.</p><h2>What we build</h2><p>Fee calculators, payout helpers, import checkers, and format converters that turn messy payment data into something you can review and use.</p><div className="article-cta"><h2>Start with the converter</h2><p>Convert a Stripe export into a QuickBooks-ready CSV in seconds.</p><Link href="/">Open the free converter ↗</Link></div></div></main>; }
