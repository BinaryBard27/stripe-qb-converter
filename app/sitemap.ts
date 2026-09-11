import { MetadataRoute } from 'next'
import { posts } from './blog/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolSlugs = [
    'annual-bookkeeping-cost-calculator', 'bookkeeping-hours-saved-calculator', 'calculadora-comisiones-stripe',
    'csv-column-mapper', 'export-stripe-to-quickbooks', 'how-much-does-stripe-charge',
    'quickbooks-chart-of-accounts-generator', 'quickbooks-import-error-checker', 'stripe-ach-payment-calculator',
    'stripe-credit-card-fee-calculator', 'stripe-currency-conversion-calculator', 'stripe-fee-calculator-australia',
    'stripe-fee-calculator-brazil', 'stripe-fee-calculator-canada', 'stripe-fee-calculator-india',
    'stripe-fee-calculator-new-zealand', 'stripe-fee-calculator-singapore', 'stripe-fee-calculator-uk',
    'stripe-fee-calculator', 'stripe-international-fee-calculator', 'stripe-mtd-bridging-formatter',
    'stripe-payout-calculator', 'stripe-processing-fee-calculator', 'stripe-refund-impact-calculator',
    'stripe-revenue-forecaster', 'stripe-subscription-cost-calculator', 'stripe-to-freeagent-converter',
    'stripe-to-xero-converter', 'stripe-vs-paypal-fee-comparison', 'vat-threshold-calculator-uk',
  ];
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
