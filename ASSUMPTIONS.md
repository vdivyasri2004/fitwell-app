# FitWell — Assumptions & Design Decisions

This document records the key assumptions and trade-offs made while building the
FitWell MVP. Read it before extending the project.

## Non-medical scope
- FitWell is a **general wellness** app. It does **not** diagnose or treat any
  condition. Onboarding never collects medical history or asks health-status
  questions.
- All calorie/nutrition targets are **estimates**. The UI consistently labels
  values as "Estimated daily target" rather than "Required".

## Nutrition target formulas
- **BMR**: Mifflin-St Jeor.
- **TDEE**: BMR × activity multiplier (`sedentary 1.2, light 1.375, moderate 1.55, very_active 1.725`).
- **Calorie target by goal** (relative to TDEE):
  - lose_weight: −20%
  - gain_weight: +15%
  - build_muscle: +5%
  - maintain: TDEE
- **Protein** (per kg body weight): lose 1.6 g, build/gain 1.8 g, maintain 1.2 g.
- **Water**: 33 ml/kg + activity bonus (light +200, moderate +400, very_active +600).
- These are heuristics and may not suit everyone; the disclaimer is shown at
  sign-up and can be re-shown in the profile.

## Reference data (seed)
- Foods are weighted toward an **Indian** food context (dal, paneer, idli, dosa,
  poha, bhakri, etc.) while still containing common general items.
- Nutrition values per serving are approximate and curated by hand rather than
  sourced from a database.
- The recommendation engine filters foods by dietary preference and explicit
  exclusions **before** ranking (see `dietFilter.ts`). Exclusions are non-negotiable.

## AI
- AI is **optional**. The app runs fully without an API key using the rule-based
  provider.
- `ExternalAIProvider` calls a secure server-side endpoint
  (`POST /api/ai/generate` on the local backend). The LLM API key lives only on
  the server (`FITWELL_AI_API_KEY`), never in the app.
- If the endpoint is unavailable or no key is set, the server returns 501 and
  `AIService` falls back to the rule-based provider, reporting which provider
  generated the response.

## Admin & roles
- Admin status is determined **server-side** only:
  - The user's role lives in the `users.role` column of the SQLite DB.
  - `requireAdmin` middleware re-reads the role from the database on **every**
    request — it never trusts a stale token claim — so promoting/demoting a user
    takes effect immediately and invalidates old tokens' admin access.
- The admin web dashboard performs all privileged operations through the
  `/api/admin/*` endpoints, which enforce `requireAdmin`. The client only
  receives the server's verdict.

## Routing / UI decisions
- Route depth: `(auth)` screens resolve sibling modules with `../../` (Expo
  Router groups do not add a directory level).
- Time inputs (notification times, sleep times) are plain `HH:MM` `TextInput`
  fields for the MVP, not native pickers, to reduce platform complexity.

## Backend auth & storage
- Passwords are hashed with Node's `crypto.scrypt` (salt + hash, constant-time
  compare); no plaintext is ever stored.
- Sessions are JWT-based (`30d` expiry). The mobile app stores the token in
  SecureStore on native and `localStorage` on web; the admin dashboard stores it
  in `localStorage`.
- Per-user data isolation is enforced server-side: every user-data route derives
  the user id from the verified token and scopes all queries by it. The server
  ignores any user id the client supplies. This replaces the RLS model used in
  the original Supabase design.
- Password reset has no email delivery in local dev, so the server returns a
  one-time signed reset token that the UI surfaces directly to the user.

## Admin dashboard note
- The admin dashboard authenticates a real user against the local backend and
  never embeds any privileged key in the browser; all admin work goes through
  server endpoints that verify `users.role === 'admin'` in the database.

## Known limitations / not implemented (MVP)
- No push-notification delivery for web; `notificationsSupported` returns a
  helpful message on web.
- No automated end-to-end UI tests; only pure-logic unit tests exist.
- No iOS/Android native crash reporting or over-the-air updates configured.
- External AI chat is unauthenticated beyond the normal user JWT; prompts are
  not logged server-side.
- `daily_steps` is captured via manual entry only (no health-app integration).
- The backend is a local single-process SQLite server. There is no multi-node
  deployment, rate limiting, or TLS in this MVP. For production you would sit a
  real reverse proxy in front and replace `FITWELL_JWT_SECRET`.
- The mobile app's API URL defaults to `http://localhost:4000`, which only works
  when the app and server run on the same machine (e.g. the Expo web demo). A
  physical device must point `EXPO_PUBLIC_API_URL` at the machine's LAN IP.
- `supabase/` contains the original PostgreSQL/RLS schema and SQL seeds, kept
  purely as a design reference. The live backend uses SQLite + Node and does not
  run these files.
