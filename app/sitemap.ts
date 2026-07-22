import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://build.xystudio.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/access-key`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/legal/security`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/legal/service`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/legal/artifacts`, lastModified: now, changeFrequency: "monthly", priority: 0.6 }
  ];
}
