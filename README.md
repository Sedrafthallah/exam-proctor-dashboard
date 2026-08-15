# Exam Proctor Dashboard

Vite + React monitoring console for proctors and admins.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173 — proxies /api and /ws
npm run build
npm run preview
```

## Local API (Stream watch)

By default the Vite proxy targets `http://localhost:5041`. Run the ASP.NET API locally, then:

```bash
npm run dev
```

For on-demand live camera watch (SignalR + WebRTC), see [docs/STREAM_WATCH.md](docs/STREAM_WATCH.md).

To proxy a different host:

```bash
VITE_PROXY_TARGET=https://manaraljarkas.visual-host.com npm run dev
```

Optional direct API origin (skips proxy for REST; hub needs CORS):

```bash
# .env
VITE_API_BASE_URL=http://localhost:5041
```

## Stack

- React 19, Ant Design 6, Zustand, React Router
- `@microsoft/signalr` for `/ws/monitoring`
