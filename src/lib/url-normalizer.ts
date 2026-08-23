/**
 * Normalizes input URLs, Social Handles, and App Store links into a canonical key
 * and clean display URL.
 */

const KNOWN_SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "shorturl.at",
  "linktr.ee",
];

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "ref",
  "source",
  "_ga",
  "_gl",
  "affiliate",
  "tag",
];

export interface NormalizedResult {
  rawInput: string;
  normalizedKey: string; // Used for uniqueness and DB indexing
  canonicalUrl: string; // The clean clickable URL
  displayTitle: string; // Suggested title extracted from domain/handle
  isHandle: boolean;
  platform?: "x" | "instagram" | "github" | "playstore" | "appstore" | "website";
}

/**
 * Resolves short links if any (with a 2.5s safe timeout)
 */
export async function resolveUrlRedirect(url: string): Promise<string> {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (KNOWN_SHORTENERS.includes(hostname)) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "RankBid-Bot/1.0",
        },
      });
      clearTimeout(timeoutId);

      if (response.url) {
        return response.url;
      }
    }
  } catch {
    // If resolution fails or times out, proceed with the original URL
  }
  return url;
}

export function normalizeUrlOrHandle(input: string): NormalizedResult {
  const trimmed = input.trim();

  // 1. Check if handle starting with @
  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1).toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    return {
      rawInput: trimmed,
      normalizedKey: `x.com/${handle}`,
      canonicalUrl: `https://x.com/${handle}`,
      displayTitle: `@${handle}`,
      isHandle: true,
      platform: "x",
    };
  }

  // 2. Add protocol if missing
  let workingUrl = trimmed;
  if (!/^https?:\/\//i.test(workingUrl)) {
    workingUrl = `https://${workingUrl}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(workingUrl);
  } catch {
    // If completely invalid URL, treat as generic handle
    const cleanKey = trimmed.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    return {
      rawInput: trimmed,
      normalizedKey: cleanKey,
      canonicalUrl: `https://${cleanKey}`,
      displayTitle: cleanKey,
      isHandle: true,
      platform: "website",
    };
  }

  let hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  let pathname = parsed.pathname.replace(/\/+$/, ""); // Remove trailing slash
  if (!pathname) pathname = "";

  // 3. Social & App store specialized normalizations
  // X / Twitter
  if (hostname === "twitter.com" || hostname === "x.com") {
    const parts = pathname.split("/").filter(Boolean);
    const handle = (parts[0] || "").toLowerCase();
    return {
      rawInput: trimmed,
      normalizedKey: `x.com/${handle}`,
      canonicalUrl: `https://x.com/${handle}`,
      displayTitle: `@${handle}`,
      isHandle: true,
      platform: "x",
    };
  }

  // Instagram
  if (hostname === "instagram.com" || hostname === "instagr.am") {
    const parts = pathname.split("/").filter(Boolean);
    const handle = (parts[0] || "").toLowerCase();
    return {
      rawInput: trimmed,
      normalizedKey: `instagram.com/${handle}`,
      canonicalUrl: `https://instagram.com/${handle}`,
      displayTitle: `@${handle}`,
      isHandle: true,
      platform: "instagram",
    };
  }

  // GitHub
  if (hostname === "github.com") {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const repoKey = `github.com/${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
      return {
        rawInput: trimmed,
        normalizedKey: repoKey,
        canonicalUrl: `https://${repoKey}`,
        displayTitle: `${parts[0]}/${parts[1]}`,
        isHandle: false,
        platform: "github",
      };
    } else if (parts.length === 1) {
      const userKey = `github.com/${parts[0].toLowerCase()}`;
      return {
        rawInput: trimmed,
        normalizedKey: userKey,
        canonicalUrl: `https://${userKey}`,
        displayTitle: parts[0],
        isHandle: true,
        platform: "github",
      };
    }
  }

  // Google Play Store
  if (hostname === "play.google.com") {
    const packageId = parsed.searchParams.get("id");
    if (packageId) {
      const cleanPkg = packageId.toLowerCase().trim();
      const playKey = `play.google.com/store/apps/details?id=${cleanPkg}`;
      return {
        rawInput: trimmed,
        normalizedKey: playKey,
        canonicalUrl: `https://${playKey}`,
        displayTitle: `Play Store: ${cleanPkg}`,
        isHandle: false,
        platform: "playstore",
      };
    }
  }

  // Apple App Store
  if (hostname === "apps.apple.com") {
    // Extract /app/app-name/id123456789 or /app/id123456789
    const idMatch = pathname.match(/id(\d+)/i);
    if (idMatch) {
      const appId = idMatch[1];
      const appKey = `apps.apple.com/app/id${appId}`;
      return {
        rawInput: trimmed,
        normalizedKey: appKey,
        canonicalUrl: `https://${appKey}`,
        displayTitle: `App Store: ${appId}`,
        isHandle: false,
        platform: "appstore",
      };
    }
  }

  // 4. Standard Website: Strip tracking parameters
  const cleanParams = new URLSearchParams();
  parsed.searchParams.forEach((val, key) => {
    const lowerKey = key.toLowerCase();
    if (!TRACKING_PARAMS.includes(lowerKey) && !lowerKey.startsWith("utm_")) {
      cleanParams.set(key, val);
    }
  });

  const searchString = cleanParams.toString() ? `?${cleanParams.toString()}` : "";
  const finalPath = pathname === "/" ? "" : pathname;
  const canonicalUrl = `https://${hostname}${finalPath}${searchString}`;
  
  // Normalized key strips query params completely for root domains
  const normalizedKey = `${hostname}${finalPath}`.toLowerCase();

  // Pretty display title
  const domainParts = hostname.split(".");
  const siteName = domainParts.length > 2 && domainParts[0] !== "www"
    ? `${domainParts[0]}.${domainParts[1]}`
    : domainParts[0];
  const displayTitle = siteName.charAt(0).toUpperCase() + siteName.slice(1);

  return {
    rawInput: trimmed,
    normalizedKey,
    canonicalUrl,
    displayTitle,
    isHandle: false,
    platform: "website",
  };
}
