import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import useAuthStore from "../store/useAuthStore";
import { refreshAccessToken } from "./apiClient";

/**
 * Absolute or same-origin hub URL for MonitoringHub.
 * Empty VITE_API_BASE_URL → `/ws/monitoring` (Vite proxies to the API).
 */
export function getMonitoringHubUrl() {
  const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  if (!base) return "/ws/monitoring";
  return `${base}/ws/monitoring`;
}

let connection = null;
let handlersBound = false;
/** Serialize start/stop so Strict Mode / overlapping connects cannot abort negotiate. */
let startLock = Promise.resolve();

function getAccessToken() {
  return (
    useAuthStore.getState().accessToken ??
    sessionStorage.getItem("accessToken") ??
    ""
  );
}

function isUnauthorizedError(err) {
  const msg = String(err?.message ?? err ?? "");
  return /401|Unauthorized/i.test(msg);
}

/**
 * Builds (or returns) the singleton MonitoringHub connection.
 * Callers register handlers via [on] before [startConnection].
 */
export function getMonitoringConnection() {
  if (connection) return connection;

  const hubUrl = getMonitoringHubUrl();

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      // accessTokenFactory also appends ?access_token= for WebSockets (contract §2.2).
      accessTokenFactory: () => getAccessToken(),
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}

export function getConnectionState() {
  if (!connection) return HubConnectionState.Disconnected;
  return connection.state;
}

/** Drop a half-open connection so the next getMonitoringConnection() rebuilds. */
async function resetConnection() {
  const conn = connection;
  connection = null;
  handlersBound = false;
  if (!conn) return;
  try {
    if (conn.state !== HubConnectionState.Disconnected) {
      await conn.stop();
    }
  } catch {
    /* ignore */
  }
}

export async function startConnection() {
  const run = startLock.then(async () => {
    // Prefer a fresh JWT — SignalR negotiate does not go through apiFetch refresh.
    if (!getAccessToken()) {
      await refreshAccessToken();
    }

    let conn = getMonitoringConnection();

    if (conn.state === HubConnectionState.Connected) {
      return conn;
    }

    if (conn.state !== HubConnectionState.Disconnected) {
      await resetConnection();
      conn = getMonitoringConnection();
    }

    try {
      await conn.start();
      return conn;
    } catch (e) {
      await resetConnection();
      if (isUnauthorizedError(e)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          conn = getMonitoringConnection();
          await conn.start();
          return conn;
        }
      }
      throw e;
    }
  });

  startLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function stopConnection() {
  const run = startLock.then(async () => {
    await resetConnection();
  });
  startLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Registers hub event handlers once. Replaces prior bindings when rebuilt.
 */
export function bindHubHandlers(handlerMap) {
  const conn = getMonitoringConnection();
  if (handlersBound) {
    for (const name of Object.keys(handlerMap)) {
      conn.off(name);
    }
  }
  for (const [name, handler] of Object.entries(handlerMap)) {
    conn.on(name, handler);
  }
  handlersBound = true;
}

export async function hubInvoke(methodName, ...args) {
  const conn = getMonitoringConnection();
  if (conn.state !== HubConnectionState.Connected) {
    throw new Error("HUB_NOT_CONNECTED");
  }
  return conn.invoke(methodName, ...args);
}

export { HubConnectionState };
