import { MetadataRoute } from 'next'
import { posts } from './blog/posts'
import { absoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolSlugs = ['stripe-fee-calculator', 'stripe-mtd-bridging-formatter', 'stripe-to-xero-converter', 'quickbooks-import-error-checker', 'stripe-fee-calculator-canada', 'stripe-fee-calculator-australia', 'stripe-vs-paypal-fee-comparison', 'stripe-fees-vs-square', 'stripe-nonprofit-pricing'];
  const toolUrls = toolSlugs.map((slug) => ({
    url: absoluteUrl(`/tools/${slug}`),
    lastModified: new Date('2026-09-12'),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  const blogUrls = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date('2026-09-12'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/tools'),
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/demo'),
      lastModified: new Date('2026-09-12'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...toolUrls,
    ...blogUrls,
  ]
}
