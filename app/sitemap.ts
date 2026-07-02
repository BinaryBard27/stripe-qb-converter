import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolsDir = path.join(process.cwd(), 'app/tools');
  
  // Read all folders in app/tools that have a page.tsx
  const toolSlugs = fs.readdirSync(toolsDir).filter((file) => {
    const isDirectory = fs.statSync(path.join(toolsDir, file)).isDirectory();
    const hasPage = fs.existsSync(path.join(toolsDir, file, 'page.tsx'));
    return isDirectory && hasPage;
  });

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
