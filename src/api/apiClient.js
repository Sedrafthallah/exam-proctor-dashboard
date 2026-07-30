const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function apiFetch(path, options = {}) {
  return fetch(`${BASE_URL}${path}`, options);
}
