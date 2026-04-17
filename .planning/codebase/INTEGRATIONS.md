# External Integrations

**Analysis Date:** 2026-04-16

## APIs & External Services

**Phaser Telemetry (gryzor.co):**
- `log.js` sends an HTTPS GET request to `https://gryzor.co/v/{event}/{phaserVersion}/{packageName}` on `dev` and `build` commands
- This is a Phaser Studio analytics/telemetry ping, not game-related
- Auth: None
- Can be bypassed using `npm run dev-nolog` or `npm run build-nolog`

**No other external APIs are used.** The game is entirely client-side with no backend communication.

## Data Storage

**Databases:**
- None - no database integration

**File Storage:**
- Local filesystem only - static assets served from `public/assets/`

**Caching:**
- None - browser default caching only

**State Persistence:**
- None detected - game state (resources, unit positions) exists only in memory and resets on page reload

## Authentication & Identity

**Auth Provider:**
- None - no authentication system

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- No logging framework - `console` only (no console.log calls observed in current source)

## CI/CD & Deployment

**Hosting:**
- Not configured - builds to `dist/` for static hosting

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files)

## Environment Configuration

**Required env vars:**
- None - the project has no `.env` files and reads no environment variables

**Secrets location:**
- Not applicable - no secrets needed

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None (the `log.js` telemetry is a one-way fire-and-forget GET request, not a webhook)

## Integration Summary

This is a self-contained client-side game with zero external integrations beyond the Phaser framework itself. There is no backend, no database, no authentication, and no third-party API usage. The only network call is an optional Phaser Studio telemetry ping at build/dev time.

Any future multiplayer, leaderboard, save/load, or other networked features would require adding integrations from scratch.

---

*Integration audit: 2026-04-16*
