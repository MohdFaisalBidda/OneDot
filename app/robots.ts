import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signup"],
        disallow: [
          "/dashboard/*",
          "/login",
          "/api/*",
          "/_next/*",
          "/admin/*",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
