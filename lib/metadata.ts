import type { Metadata } from "next";

export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

// Base configuration for SEO
export const siteConfig = {
  name: "OneDot",
  title: "OneDot - Your Single Point of Focus & Clarity",
  description:
    "Streamline your day with mindful journaling that connects focus, progress, and decisions — all in one calm dashboard. Track daily focus, record decisions with purpose, and maintain clarity in your work.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://onedot.com",
  ogImage: "/og-image.jpg",
  keywords: [
    "daily focus tracker",
    "decision journal",
    "mindful journaling",
    "productivity app",
    "focus management",
    "decision tracking",
    "work clarity",
    "daily planning",
    "progress tracking",
    "focus journal",
  ],
  author: "OneDot Team",
  twitterHandle: "@onedot",
};

/**
 * Generate metadata for pages with sensible defaults
 * @param page - Page-specific metadata configuration
 * @returns Complete Metadata object for Next.js
 */
export function generatePageMetadata(page?: PageMetadata): Metadata {
  const title = page?.title
    ? `${page.title} | ${siteConfig.name}`
    : siteConfig.title;

  const description = page?.description || siteConfig.description;
  const keywords = page?.keywords?.length
    ? [...page.keywords, ...siteConfig.keywords]
    : siteConfig.keywords;

  const ogImage = page?.ogImage || siteConfig.ogImage;
  const canonicalUrl = page?.canonicalUrl
    ? `${siteConfig.url}${page.canonicalUrl}`
    : siteConfig.url;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    ...(page?.noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...(!page?.noIndex && {
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    }),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}${ogImage}`],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    metadataBase: new URL(siteConfig.url),
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      // Add social media links here when available
    ],
  };
}

/**
 * Generate JSON-LD structured data for WebApplication
 */
export function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Generate JSON-LD structured data for Article (blog posts, documentation)
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt?: string;
  author: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image || siteConfig.ogImage,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${article.url}`,
    },
  };
}
