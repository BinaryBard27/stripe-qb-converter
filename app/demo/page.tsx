import { completeMetadata } from "@/lib/seo";
import type { Metadata } from 'next';

export const metadata: Metadata = completeMetadata({
  title: 'Stripe to QuickBooks Converter Demo',
  description: 'Watch how Stripe2QB converts a Stripe export into a QuickBooks-ready CSV in your browser.',
  alternates: { canonical: '/demo' },
});

const videoSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'How to convert a Stripe export to QuickBooks',
  description: 'A short walkthrough of the private, browser-based Stripe2QB conversion workflow.',
  thumbnailUrl: 'https://stripe-qb-converter.vercel.app/logo.png',
  uploadDate: '2026-09-12',
  contentUrl: 'https://stripe-qb-converter.vercel.app/demo-recording.mp4',
  embedUrl: 'https://stripe-qb-converter.vercel.app/demo',
};

export default function DemoPage() {
  return <main className="article-page demo-watch-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} /><span className="section-label">PRODUCT WALKTHROUGH</span><h1>From Stripe export to QuickBooks-ready CSV.</h1><p className="demo-watch-intro">See how the converter reads, maps, and downloads your file without sending financial data to a server.</p><div className="video-frame"><video controls preload="metadata" poster="/logo.png"><source src="/demo-recording.mp4" type="video/mp4" />Your browser does not support embedded video.</video></div><p className="demo-watch-caption">The conversion runs locally in your browser. <a href="/">Try the free converter →</a></p></main>;
}
