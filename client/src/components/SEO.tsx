/**
 * SEO Component — Dynamic meta tags for each page.
 * Uses react-helmet-async to inject title, description, OG tags, and structured data.
 */
import { Helmet } from "react-helmet-async";
import {
  DEFAULT_PARISH_SCHEDULE,
  DEFAULT_PARISH_INFO,
  generateOpeningHours,
} from "../../../shared/scheduleEngine";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "event";
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
}

const SITE_NAME = "St. Patrick Church, Armonk";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
const DEFAULT_DESCRIPTION =
  "Welcome to St. Patrick Church in Armonk, NY. Join our vibrant Catholic community for Mass, sacraments, faith formation, and fellowship.";
const DEFAULT_IMAGE = "/og-image.png";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = DEFAULT_IMAGE,
  type = "website",
  structuredData,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${BASE_URL}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Schema.org structured data for St. Patrick Church (CatholicChurch type).
 * Generated from the shared schedule engine — single source of truth.
 * Include this on the homepage for local SEO.
 */
function buildChurchStructuredData() {
  const info = DEFAULT_PARISH_INFO;
  const openingHours = generateOpeningHours(DEFAULT_PARISH_SCHEDULE);

  // Also include confession hours
  const confession = DEFAULT_PARISH_SCHEDULE.services.find(s => s.type === "confession");

  const openingHoursSpec = openingHours.map(h => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [h.dayOfWeek],
    opens: h.opens,
    closes: h.closes,
  }));

  // Add confession separately
  if (confession) {
    const startMin = parseInt(confession.time.split(":")[0]) * 60 +
      parseInt(confession.time.split(":")[1]?.split(" ")[0] || "0");
    // Use parseTimeToMinutes from engine
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const confStart = confession.time.replace(" PM", "").replace(" AM", "");
    const confStartH = confession.time.includes("PM") ?
      (parseInt(confStart.split(":")[0]) === 12 ? 12 : parseInt(confStart.split(":")[0]) + 12) :
      parseInt(confStart.split(":")[0]);
    const confStartM = parseInt(confStart.split(":")[1] || "0");
    const confEndTotal = confStartH * 60 + confStartM + confession.durationMin;
    const confEndH = Math.floor(confEndTotal / 60);
    const confEndM = confEndTotal % 60;

    openingHoursSpec.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [dayNames[confession.dayOfWeek]],
      opens: `${String(confStartH).padStart(2, "0")}:${String(confStartM).padStart(2, "0")}`,
      closes: `${String(confEndH).padStart(2, "0")}:${String(confEndM).padStart(2, "0")}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "CatholicChurch",
    name: info.name,
    alternateName: "St. Patrick's of Armonk",
    url: BASE_URL || "https://stpatsarmonk-24g7ux9f.manus.space",
    telephone: info.phone,
    email: info.officeEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: info.address,
      addressLocality: info.city,
      addressRegion: info.state,
      postalCode: info.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: info.mapCoordinates.lat,
      longitude: info.mapCoordinates.lng,
    },
    openingHoursSpecification: openingHoursSpec,
    sameAs: [
      "https://www.facebook.com/StPatricksArmonk",
    ],
    image: DEFAULT_IMAGE,
    priceRange: "Free",
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(info.name + " " + info.city + " " + info.state)}`,
  };
}

export const CHURCH_STRUCTURED_DATA = buildChurchStructuredData();

/**
 * Generate Event structured data (Schema.org/Event) for individual events.
 * Use on event detail pages for rich search results.
 */
export function buildEventStructuredData(event: {
  title: string;
  description?: string;
  startDate: string | number;
  endDate?: string | number;
  location?: string;
}) {
  const info = DEFAULT_PARISH_INFO;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || `${event.title} at St. Patrick Church, Armonk`,
    startDate: new Date(event.startDate).toISOString(),
    ...(event.endDate && { endDate: new Date(event.endDate).toISOString() }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location || info.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: info.address,
        addressLocality: info.city,
        addressRegion: info.state,
        postalCode: info.zip,
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: info.name,
      url: BASE_URL || "https://stpatsarmonk-24g7ux9f.manus.space",
    },
  };
}

/**
 * Generate BreadcrumbList structured data for navigation.
 * Helps search engines understand site hierarchy.
 */
export function buildBreadcrumbStructuredData(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL || "https://stpatsarmonk-24g7ux9f.manus.space"}${item.path}`,
    })),
  };
}
