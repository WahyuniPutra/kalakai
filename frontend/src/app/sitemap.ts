import type { MetadataRoute } from "next";
import { backendApiUrl } from "@/lib/auth-proxy";
import { siteUrl } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [{ url: siteUrl + "/" }, { url: siteUrl + "/mitra" }];
  try {
    const response = await fetch(`${backendApiUrl}/api/partners`, { next: { revalidate: 300 } });
    if (!response.ok) return pages;
    const partners: { id: number }[] = await response.json();
    return [...pages, ...partners.map((partner) => ({ url: `${siteUrl}/mitra/${partner.id}` }))];
  } catch {
    return pages;
  }
}
