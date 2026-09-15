const sitemapUrl = process.env.SITEMAP_URL ?? "http://localhost:3000/sitemap.xml";
const siteOrigin = process.env.SITE_ORIGIN ?? "http://localhost:3000";

function tagValue(html, pattern) {
  const match = html.match(pattern);
  return match?.[1] ?? "MISSING";
}

const sitemapResponse = await fetch(sitemapUrl);
if (!sitemapResponse.ok) throw new Error(`Could not fetch sitemap: ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length === 0) throw new Error("Sitemap contains no URLs");

let failures = 0;
for (const expected of urls) {
  const pageUrl = new URL(expected);
  const response = await fetch(`${siteOrigin}${pageUrl.pathname}`);
  const html = await response.text();
  const canonical = tagValue(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogUrl = tagValue(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  const twitterTitle = tagValue(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  const twitterDescription = tagValue(html, /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i);
  const pass = response.ok && canonical === expected && ogUrl === expected && twitterTitle !== "MISSING" && twitterDescription !== "MISSING";
  if (!pass) failures += 1;
  console.log(`${pass ? "PASS" : "FAIL"} ${expected}`);
  console.log(`  status=${response.status} canonical=${canonical}`);
  console.log(`  og:url=${ogUrl}`);
  console.log(`  twitter:title=${twitterTitle}`);
  console.log(`  twitter:description=${twitterDescription}`);
}

console.log(`\n${urls.length} URLs checked, ${failures} failed`);
process.exitCode = failures === 0 ? 0 : 1;
