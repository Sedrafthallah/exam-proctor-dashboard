# Stream Watch (Dashboard)

On-demand WebRTC viewer for proctors. Signaling uses the existing MonitoringHub;
media never touches the API (PROCTORING_REALTIME_CONTRACT).

## Local three-client smoke

1. **API** — run `exam-proctoring-app` on `http://localhost:5041` (Stream hub + ICE already required).
2. **Flutter** — student exam with live API:
   ```bash
   flutter run -d macos --dart-define=API_MODE=live \
     --dart-define=API_BASE_URL=http://localhost:5041
   ```
   Start/resume an attempt so the client calls `JoinStudentSession`.
3. **Dashboard** — from `exam-proctor-dashboard`:
   ```bash
   npm run dev
   ```
   Vite proxies `/api` and `/ws` to `http://localhost:5041` by default (`VITE_PROXY_TARGET` overrides).

4. Sign in as a proctor/admin with `MonitorExamSession`.
5. Open **Live Monitoring**, select the active exam session.
6. Confirm badge shows **WSS live**; when the Flutter client is joined, the student card shows a green presence dot and **Watch** enables.
7. Click **Watch** → modal should show video **and play audio** within a few seconds on LAN. Use **Mute / Unmute** in the modal header if needed.
8. **End watch** → Flutter “Proctor viewing” clears; ambient `AudioThreshold` monitoring resumes on the student; a second Watch should succeed.

## Env

See [`.env.example`](../.env.example):

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Empty = same-origin (proxy). Absolute URL = call API directly (CORS). |
| `VITE_PROXY_TARGET` | Vite proxy target (default `http://localhost:5041`). |

## Key modules

| Module | Role |
|---|---|
| `src/api/signalrClient.js` | Hub connection singleton |
| `src/store/useMonitoringHubStore.js` | Presence + watch PC lifecycle (recvonly video + audio) |
| `src/store/useMonitoringRosterStore.js` | `GET /api/monitoring/sessions/{id}/students` |
| `src/api/iceServersApi.js` | `GET /api/v1/proctoring/ice-servers` |
| `WatchStreamModal.jsx` | Viewer UI (A/V + mute toggle) |

## Out of scope

Native kiosk unlock and FR-24 offline buffer. Monitor live alerts (`AlertCreated` / warn / escalate) are documented in [MONITOR_LIVE.md](./MONITOR_LIVE.md). Stream Watch coexists with Monitor by pausing OpenCV capture **and** ambient mic monitoring on the student while WebRTC holds camera + microphone (one-way A/V to the proctor; no talk-back).
