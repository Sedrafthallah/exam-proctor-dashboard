# Live Monitoring (Dashboard Monitor Layer)

Proctor Live Monitoring console: REST roster + alert prefetch, SignalR live
`AlertCreated` / `AlertUpdated` / `StudentStatusChanged`, real dismiss/warn/escalate,
heartbeat/pipeline staleness, and Stream Watch on the same hub.

Contracts: `MONITORING_API_CONTRACT.md`, `PROCTORING_REALTIME_CONTRACT.md` §9–§10.

## Local three-client smoke

1. **API** — run `exam-proctoring-app` (Monitor + Stream hub already required). Apply DB migration for `AlertEvent.snapshot_url` if not applied.
2. **Flutter** — student exam with live API + real/fake camera as needed:
   ```bash
   flutter run -d macos --dart-define=API_MODE=live \
     --dart-define=API_BASE_URL=http://localhost:5041 \
     --dart-define=CAMERA=real --dart-define=FACE=real
   ```
   Start an attempt so the client joins `JoinStudentSession`, starts `MonitoringEngine`, and sends `Heartbeat`.
3. **Dashboard** — from `exam-proctor-dashboard`:
   ```bash
   VITE_PROXY_TARGET=http://localhost:5041 npm run dev
   ```
4. Sign in as a proctor/admin with `MonitorExamSession` (and Admin/SuperAdmin for escalate).
5. Open **Live Monitoring**, select the active exam session.
6. Confirm **WSS live**; student card shows green presence when Flutter is joined.
7. **Face absence** — cover camera → alert appears in feed within ~3s; snapshot thumbnail when upload succeeded.
8. **Warn** — enter message → Flutter shows non-blocking warning overlay; timer continues.
9. **Escalate** — enter reason → student attempt terminates; roster status updates.
10. **Heartbeat degraded** — stop Flutter monitoring / kill the student app so beats stop for >20s → **Monitoring degraded** badge (hub may still show online briefly). With a healthy engine, the badge must **clear** within one heartbeat interval; it must not stick while alerts keep arriving.
11. **Stream Watch** — Watch still works (engine pauses OpenCV for WebRTC); End watch resumes monitoring.

## Env

Same as [STREAM_WATCH.md](./STREAM_WATCH.md): `VITE_PROXY_TARGET`, optional `VITE_API_BASE_URL`.

## Key modules

| Module | Role |
|---|---|
| `src/api/signalrClient.js` | Hub connection singleton |
| `src/store/useMonitoringHubStore.js` | JoinSession, alerts, `StudentStatusChanged`, Stream Watch |
| `src/store/useMonitoringRosterStore.js` | REST roster + `patchStudent` / presence fields |
| `src/store/useAlertsStore.js` | Alerts REST, upsert, warn/escalate bodies |
| `src/utils/alertMappers.js` | Alert DTO → UI shape |
| `src/utils/monitoringHealth.js` | §10.3 staleness + presence refresh interval |
| `src/Pages/monitoring/Monitoring.jsx` | Live console; soft roster refresh every `H` |
| `AlertFeed.jsx` / `StudentStatusGrid.jsx` | Live UI |

## Out of scope

- Student violation ingest (`POST /api/v1/monitoring/events`) — Flutter only
- Hub `ReportViolation`
- Home dashboard `LiveAlerts` widget full hub migration
- Native kiosk unlock

## Phase 5 acceptance

Cross-repo automated + manual matrix:  
[`proctor_system/documentation/acceptance/MONITOR_PHASE5_ACCEPTANCE.md`](../../proctor_system/documentation/acceptance/MONITOR_PHASE5_ACCEPTANCE.md)
