import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = completeMetadata({ title: "Contact Stripe2QB", description: "Get help with Stripe2QB tools, imports, and conversion workflows.", alternates: { canonical: "/contact" } });

export default function ContactPage() { return <main className="article-page"><span className="section-label">CONTACT</span><h1>Have a question about a tool?</h1><div className="article-body"><p>For a bug report, a confusing import result, or a suggestion for a new calculator, open an issue in the project repository with the page URL and a small, anonymised example.</p><div className="article-cta"><h2>Open the GitHub repository</h2><p>Please do not include customer names, payment details, or private exports in an issue.</p><a href="https://github.com/BinaryBard27/stripe-qb-converter" target="_blank" rel="noreferrer">Contact through GitHub ↗</a></div></div></main>; }
