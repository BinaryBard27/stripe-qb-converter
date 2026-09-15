import { completeMetadata } from "@/lib/seo";
import Link from "next/link";
import { posts } from "./posts";

export const metadata = completeMetadata({ title: "Stripe & QuickBooks Guides | Stripe2QB", description: "Clear, practical guides for Stripe exports, QuickBooks imports, fees, payouts, and payment operations.", alternates: { canonical: "/blog" } });

export default function BlogIndex() {
  return <div className="blog-page"><div className="blog-wrap"><header className="blog-hero"><span className="section-label">STRIPE2QB JOURNAL</span><h1>Useful answers for<br /><em>messy payment data.</em></h1><p>Practical guides for turning Stripe activity into numbers you can actually reconcile.</p></header><div className="blog-grid">{posts.map((post, index) => <article className={index === 0 ? "blog-card featured" : "blog-card"} key={post.slug}><span className="blog-number">0{index + 1}</span><span className="blog-eyebrow">{post.eyebrow} · {post.readTime}</span><h2><Link href={"/blog/" + post.slug}>{post.title}</Link></h2><p>{post.description}</p><Link className="blog-read" href={"/blog/" + post.slug}>Read guide <span>↗</span></Link></article>)}</div></div></div>;
}
