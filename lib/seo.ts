import type { Metadata } from "next";

// The only site-wide domain setting used by canonical and social metadata.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://stripe-qb-converter.vercel.app").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  const parsed = new URL(path || "/", `${SITE_URL}/`);
  const pathname = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (pathname === "/") return SITE_URL;
  return new URL(pathname, `${SITE_URL}/`).toString();
}

/** Completes page metadata from the page's own title and description. */
export function completeMetadata(metadata: Metadata, path?: string): Metadata {
  const canonical = path ?? (typeof metadata.alternates?.canonical === "string" ? metadata.alternates.canonical : "/");
  const url = absoluteUrl(canonical);
  const openGraph = metadata.openGraph && typeof metadata.openGraph === "object" ? metadata.openGraph : {};
  const title = typeof metadata.title === "string" ? metadata.title : typeof openGraph.title === "string" ? openGraph.title : "Stripe2QB";
  const description = metadata.description ?? (typeof openGraph.description === "string" ? openGraph.description : undefined);

  return {
    ...metadata,
    metadataBase: new URL(SITE_URL),
    alternates: { ...metadata.alternates, canonical: url },
    openGraph: { ...openGraph, url, title: openGraph.title ?? title, description: openGraph.description ?? description },
    twitter: { ...metadata.twitter, card: "summary", title, description },
  };
}
