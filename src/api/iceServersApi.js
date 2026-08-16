import { apiFetch } from "./apiClient";
import useAuthStore from "../store/useAuthStore";

const ICE_PATH = "/api/v1/proctoring/ice-servers";
const FALLBACK_TTL_MS = 5 * 60 * 1000;

let cache = null;

function authHeaders() {
  const accessToken = useAuthStore.getState().accessToken;
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
}

/**
 * Fetches ICE servers for WebRTC watches (PROCTORING_REALTIME_CONTRACT §7).
 * Cached until expiresAtUtc or 5 minutes.
 */
export async function getIceServers({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (
    !forceRefresh &&
    cache &&
    cache.expiresAtMs > now &&
    cache.iceServers?.length
  ) {
    return cache.iceServers;
  }

  const res = await apiFetch(ICE_PATH, { headers: authHeaders() });
  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.statusCode !== 200 || !json.data?.iceServers?.length) {
    const code = json.code ?? "ICE_CONFIG_UNAVAILABLE";
    throw new Error(code);
  }

  const iceServers = json.data.iceServers.map((entry) => {
    const mapped = {
      urls: entry.urls,
    };
    if (entry.username) mapped.username = entry.username;
    if (entry.credential) mapped.credential = entry.credential;
    return mapped;
  });

  const expiresAtUtc = json.data.expiresAtUtc
    ? Date.parse(json.data.expiresAtUtc)
    : NaN;
  const expiresAtMs = Number.isFinite(expiresAtUtc)
    ? expiresAtUtc
    : now + FALLBACK_TTL_MS;

  cache = { iceServers, expiresAtMs };
  return iceServers;
}

export function clearIceServersCache() {
  cache = null;
}
