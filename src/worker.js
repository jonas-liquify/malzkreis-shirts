/**
 * Malzkreis Shirts – Cloudflare Worker
 * - leitet www.malzkreis.de dauerhaft auf malzkreis.de um
 * - liefert die statischen Dateien aus dist/ aus (ASSETS-Binding)
 * - setzt Sicherheits- und Cache-Header
 */
const CANONICAL_HOST = "malzkreis.de";

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // www → Apex-Domain
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const response = new Response(assetResponse.body, assetResponse);

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);

    // HTML immer frisch prüfen, versionierte CSS/JS und Bilder länger cachen
    const type = response.headers.get("Content-Type") || "";
    if (type.includes("text/html")) {
      response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else if (url.searchParams.has("v") && /\.(css|js)$/.test(url.pathname)) {
      response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (/\.(jpe?g|png|webp|avif|svg)$/.test(url.pathname)) {
      response.headers.set("Cache-Control", "public, max-age=604800");
    }

    return response;
  },
};
