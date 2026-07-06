import { headers } from "next/headers";
import { config } from "@/lib/config";

const LOCAL_HOSTNAME_PATTERN = /^(localhost|127\.0\.0\.1)$/i;
const CANONICAL_URL = new URL(config.siteUrl);
const CANONICAL_HOST = CANONICAL_URL.host.toLowerCase();
const CANONICAL_HOSTNAME = CANONICAL_URL.hostname.toLowerCase();

function parseRuntimeUrl(value: string) {
  try {
    return new URL(`https://${value}`);
  } catch {
    return null;
  }
}

function hostHostname(host: string) {
  const parsed = parseRuntimeUrl(host);
  return parsed?.hostname.toLowerCase() ?? host.replace(/:\d+$/, "").toLowerCase();
}

function normalizeOrigin(protocol: string, host: string) {
  const parsed = parseRuntimeUrl(host);
  if (parsed) {
    parsed.protocol = `${protocol}:`;
    return parsed.origin;
  }
  return `${protocol}://${host}`.replace(/\/$/, "");
}

function isLocalRuntimeHost(host: string) {
  return LOCAL_HOSTNAME_PATTERN.test(hostHostname(host));
}

function normalizeForwardedHost(value: string | null) {
  return value?.split(",")[0]?.trim().toLowerCase() || "";
}

export function shouldForceCanonicalHost(requestHost: string | null) {
  const normalized = normalizeForwardedHost(requestHost);
  if (!normalized) return false;
  const normalizedHostname = hostHostname(normalized);
  if (LOCAL_HOSTNAME_PATTERN.test(normalizedHostname)) return false;
  if (normalized === CANONICAL_HOST || normalizedHostname === CANONICAL_HOSTNAME) return false;
  return true;
}

export async function resolveRequestSiteUrl() {
  const headerStore = await headers();
  const forwardedHost = normalizeForwardedHost(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  );
  const forwardedProto =
    (headerStore.get("x-forwarded-proto") ?? "").split(",")[0]?.trim().toLowerCase() || "";
  const origin = headerStore.get("origin");

  if (origin) {
    try {
      const url = new URL(origin);
      if (isLocalRuntimeHost(url.host)) {
        return normalizeOrigin(url.protocol.replace(/:$/, ""), url.host);
      }
    } catch {
      // Ignore malformed origin headers and fall back to forwarded values.
    }
  }

  if (forwardedHost && isLocalRuntimeHost(forwardedHost)) {
    const protocol = forwardedProto || "http";
    return normalizeOrigin(protocol, forwardedHost);
  }

  return config.siteUrl;
}

export function resolveSiteUrlFromRequestUrl(requestUrl: string) {
  try {
    const url = new URL(requestUrl);
    if (isLocalRuntimeHost(url.host)) {
      return normalizeOrigin(url.protocol.replace(/:$/, ""), url.host);
    }
  } catch {
    // Fall back to configured site URL.
  }

  return config.siteUrl;
}
