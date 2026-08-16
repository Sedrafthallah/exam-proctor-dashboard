# Exam Proctor Dashboard

Vite + React monitoring console for proctors and admins.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173 — proxies /api and /ws
npm run build
npm run preview
```

## API (Stream watch)

By default the Vite proxy targets the hosted API (`https://manaraljarkas.visual-host.com`). Then:

```bash
npm run dev
```

For on-demand live camera watch (SignalR + WebRTC), see [docs/STREAM_WATCH.md](docs/STREAM_WATCH.md).

For live alerts, warn/terminate, and heartbeat staleness, see [docs/MONITOR_LIVE.md](docs/MONITOR_LIVE.md).

To proxy a local backend instead:

```bash
VITE_PROXY_TARGET=http://localhost:5041 npm run dev
```

Optional direct API origin (skips proxy for REST; hub needs CORS):

```bash
# .env
VITE_API_BASE_URL=https://manaraljarkas.visual-host.com
```

## Stack

- React 19, Ant Design 6, Zustand, React Router
- `@microsoft/signalr` for `/ws/monitoring`
