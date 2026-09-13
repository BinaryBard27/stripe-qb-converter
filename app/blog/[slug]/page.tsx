import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "../posts";

export function generateStaticParams() { return posts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  return post ? {
    title: post.title + " | Stripe2QB",
    description: post.description,
    alternates: { canonical: `https://stripe-qb-converter.vercel.app/blog/${post.slug}` },
  } : {};
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 2);
  return <article className="article-page"><Link href="/blog" className="article-back">← All blogs</Link><header className="article-header"><span className="section-label">{post.eyebrow} · {post.readTime}</span><h1>{post.title}</h1><p>{post.description}</p></header><div className="article-body">{post.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}<div className="article-cta"><h2>Ready to clean up your export?</h2><p>Convert your Stripe file locally and download a QuickBooks-ready CSV.</p><Link href="/">Open the free converter ↗</Link></div><aside className="related-links"><span className="section-label">KEEP READING</span>{related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`}>{item.title} <span>↗</span></Link>)}</aside></div></article>;
}
