import type { Metadata } from "next";
import { HOME_URL, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/**
 * Google Tag Manager — the ONLY tracker on the site (Clarity, GA4 etc. are added inside GTM).
 * TODO(owner): set NEXT_PUBLIC_GTM_ID (e.g. GTM-XXXXXXX) in Vercel env vars. Unset = nothing renders.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Self-hosted at build time by next/font: no render-blocking Google Fonts request.
// display "optional" + preload + size-adjusted fallback: text paints once, with no late swap
// that would re-trigger LCP on slow mobile connections.
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-inter", display: "optional", preload: false, adjustFontFallback: true });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-jakarta", display: "optional", preload: true, adjustFontFallback: true });

export const metadata: Metadata = {
  // Makes every relative canonical/OG URL below resolve to an absolute one.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "HireMind",
    "AI recruitment platform",
    "AI candidate matching",
    "resume parsing software",
    "recruitment agency software",
    "applicant tracking",
    "hiring automation",
    "job search India",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: HOME_URL,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

/**
 * Organization + WebSite structured data.
 *
 * "HireMind" is a contested brand term, so this is what tells Google which
 * HireMind this site is. Only facts already published on the site are claimed
 * here — no address, no ratings, no counts.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: HOME_URL,
      description: SITE_DESCRIPTION,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.png`,
        caption: SITE_NAME,
      },
      image: { "@id": `${SITE_URL}/#logo` },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contactus@arvantra-ai.com",
        url: `${SITE_URL}/contact`,
        availableLanguage: ["en"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: HOME_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`h-full ${inter.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full bg-white text-ink-900">
        <a href="#main" className="skip-link">Skip to content</a>
        {GTM_ID && (
          <>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
            <Script id="gtm" strategy="lazyOnload">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(GTM_ID)});`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
