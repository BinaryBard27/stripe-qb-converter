import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolSlugs = [
    "stripe-fee-calculator",
    "quickbooks-import-error-checker",
    "stripe-refund-impact-calculator",
    "stripe-vs-paypal-fee-comparison",
  ];

  const toolUrls = toolSlugs.map((slug) => ({
    url: `https://stripe-qb-converter.vercel.app/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://stripe-qb-converter.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://stripe-qb-converter.vercel.app/tools',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...toolUrls,
  ]
}
