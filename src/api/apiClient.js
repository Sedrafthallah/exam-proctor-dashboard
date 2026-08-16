import useAuthStore from "../store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Auth endpoints must never go through the 401-refresh interceptor below —
// otherwise a failed login (wrong password) or the logout call itself could
// trigger a refresh attempt (and, on failure, another logout() call that
// re-enters apiFetch), looping forever.
const isAuthEndpoint = (path) =>
  path.startsWith("/api/auth/") || path.startsWith("/api/v1/auth/");

// Shared in-flight promise so concurrent 401s trigger a single refresh call
// instead of one per request.
let refreshPromise = null;

<<<<<<< HEAD
// Assumes the same response shape as /api/auth/login: { statusCode, data:
// { accessToken, refreshToken } } — unconfirmed against the actual contract.
function refreshAccessToken() {
=======
// NOTE: path/payload shape assumed to mirror /api/auth/login's response
// ({ statusCode, data: { accessToken, refreshToken } }) — confirm the exact
// contract with the backend once it's available.
export function refreshAccessToken() {
>>>>>>> exam_session
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken =
      useAuthStore.getState().refreshToken ??
      sessionStorage.getItem("refreshToken");

    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200 || !json.data?.accessToken) {
        return false;
      }

      useAuthStore
        .getState()
        .setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);

      return true;
    } catch {
      return false;
    }
  })();

  return refreshPromise.finally(() => {
    refreshPromise = null;
  });
}

export async function apiFetch(path, options = {}, isRetry = false) {
  const res = await fetch(`${BASE_URL}${path}`, options);

  if (res.status !== 401 || isRetry || isAuthEndpoint(path)) {
    return res;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    await useAuthStore.getState().logout();
    return res;
  }

  const accessToken = useAuthStore.getState().accessToken;

  return apiFetch(
    path,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    },
    true,
  );
}
