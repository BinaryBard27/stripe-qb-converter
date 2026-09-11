import { MetadataRoute } from 'next'
import { posts } from './blog/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolSlugs = ['stripe-fee-calculator', 'stripe-mtd-bridging-formatter', 'stripe-to-xero-converter', 'quickbooks-import-error-checker', 'stripe-fee-calculator-canada', 'stripe-fee-calculator-australia', 'stripe-vs-paypal-fee-comparison', 'stripe-fees-vs-square', 'stripe-nonprofit-pricing'];
  const toolUrls = toolSlugs.map((slug) => ({
    url: `https://stripe-qb-converter.vercel.app/tools/${slug}`,
    lastModified: new Date('2026-09-12'),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  const blogUrls = posts.map((post) => ({
    url: `https://stripe-qb-converter.vercel.app/blog/${post.slug}`,
    lastModified: new Date('2026-09-12'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://stripe-qb-converter.vercel.app',
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://stripe-qb-converter.vercel.app/tools',
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://stripe-qb-converter.vercel.app/blog',
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://stripe-qb-converter.vercel.app/about',
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://stripe-qb-converter.vercel.app/contact',
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://stripe-qb-converter.vercel.app/demo',
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...toolUrls,
    ...blogUrls,
  ]
}
