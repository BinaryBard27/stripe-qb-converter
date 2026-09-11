import Link from "next/link";

export default function NotFound() {
  return <main className="article-page not-found-page"><span className="section-label">404 · NOT FOUND</span><h1>That page took a wrong turn.</h1><p>Try the converter, browse the free tools, or read the latest Stripe and QuickBooks guides.</p><div className="not-found-links"><Link href="/">Open converter ↗</Link><Link href="/tools">Browse tools ↗</Link><Link href="/blog">Read blogs ↗</Link></div></main>;
}
