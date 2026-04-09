/**
 * CORS utility — determines allowed origins and builds CORS headers.
 *
 * Edge-runtime compatible — no Node.js APIs used.
 */

interface CorsConfig {
  /** The Origin header from the incoming request */
  origin: string | null;
  /** Configured app URL (from NEXT_PUBLIC_APP_URL) */
  appUrl?: string;
  /** Node environment */
  nodeEnv?: string;
}

/**
 * Determine the allowed origin for a request.
 * Returns the origin string if allowed, or empty string if not.
 */
export function getAllowedOrigin(config: CorsConfig): string {
  const { origin, appUrl, nodeEnv } = config;

  // If no origin header (same-origin or server-to-server), skip CORS
  if (!origin) return "";

  // If an app URL is configured, only allow that exact origin
  if (appUrl) {
    return origin === appUrl ? origin : "";
  }

  // In development without a configured app URL, allow localhost origins
  if (nodeEnv === "development") {
    try {
      const url = new URL(origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return origin;
      }
    } catch {
      // invalid origin
    }
  }

  return "";
}

/**
 * Build CORS headers for an allowed origin.
 * Returns a Headers object with CORS headers set, or empty Headers if origin is not allowed.
 */
export function buildCorsHeaders(allowedOrigin: string): Headers {
  const headers = new Headers();
  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return headers;
}
