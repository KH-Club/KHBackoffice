# Scheduled application health check

The production deployment exposes a protected `GET /api/health` Route Handler.
Vercel Cron invokes it once per day at `00:00 UTC` (`07:00 Asia/Bangkok`). The
handler performs one read of `camps.id` with `limit(1)`, so an empty table is
healthy and the response remains small.

## Architecture

```text
Vercel Cron (daily)
  -> Authorization: Bearer $CRON_SECRET
  -> GET /api/health
  -> server-only Supabase admin client
  -> SELECT id FROM camps LIMIT 1
  -> structured Vercel log + JSON response
```

## Files

```text
src/
├── app/api/health/route.ts       # Protected App Router Route Handler
└── lib/supabase/admin.ts         # Server-only service-role client
.env.example                      # Environment variable names only
vercel.json                       # Daily production cron schedule
```

- `route.ts` authenticates the caller, applies a five-second database timeout,
  disables caching, logs a request ID, and returns sanitized JSON.
- `middleware.ts` excludes only `/api/health` from dashboard session redirects;
  the route performs its own bearer-token authentication.
- `admin.ts` creates a Supabase client without cookies or session persistence.
  The `server-only` import prevents accidental use from a Client Component.
- `vercel.json` schedules the production invocation. Vercel cron schedules use
  UTC and run only for production deployments.

## Environment variables

Configure these in Vercel Project Settings for the **Production** environment:

| Variable                    | Scope       | Purpose                                        |
| --------------------------- | ----------- | ---------------------------------------------- |
| `SUPABASE_URL`              | Server only | Supabase project URL used by the probe         |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Reads the health-check table regardless of RLS |
| `CRON_SECRET`               | Server only | Authenticates Vercel Cron and manual checks    |

The existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
remain necessary for browser-facing application features. Never rename the
service-role key or cron secret with a `NEXT_PUBLIC_` prefix.

Generate the cron secret locally:

```bash
openssl rand -hex 32
```

## Responses

- `200`: Supabase responded successfully.
- `401`: missing or invalid bearer token.
- `503`: missing server configuration, timeout, or Supabase failure.

Example success response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-11T00:00:00.000Z",
  "requestId": "3b8e7d26-1cf5-4b04-b648-178d7ef58fb8",
  "durationMs": 94,
  "checks": { "database": "ok" }
}
```

Internal database errors are written to server logs but are not returned to the
caller.

## Local testing

1. Copy `.env.example` to `.env.local` and fill in real values.
2. Start the app with `yarn dev`.
3. Verify authentication:

```bash
curl -i http://localhost:3000/api/health
```

Expected: `401 Unauthorized`.

4. Run an authorized check:

```bash
curl -i \
  -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/health
```

Expected: `200 OK`. Temporarily use an invalid Supabase URL or key to verify a
sanitized `503 Service Unavailable` response, then restore the value.

## Deployment

1. Add all three server-only variables to Vercel Production settings.
2. Deploy the project to production. Preview deployments do not execute cron
   jobs.
3. Open the Vercel project’s Cron Jobs page and confirm `/api/health` is listed.
4. Trigger it manually or run the authenticated `curl` command against the
   production domain.
5. Inspect Runtime Logs for `health_check_succeeded` and its request ID.

Vercel does not follow redirects for cron invocations, so `/api/health` must be
the final route and must not redirect to login.

## Security

- Treat both `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` as production
  secrets. Rotate them after suspected disclosure.
- The service-role key bypasses RLS. Keep the health query read-only and keep
  `admin.ts` isolated from Client Components.
- The endpoint uses a timing-safe token comparison and returns no database
  error details.
- The endpoint is not a substitute for authorization elsewhere in the app.
- Do not log request authorization headers, keys, or environment values.

## Future monitoring

- Add a Vercel Log Drain or alert rule for `health_check_failed`.
- Send failures to Sentry with `requestId`, `durationMs`, and environment tags.
- Use Better Stack, Checkly, or UptimeRobot for an external availability probe;
  store a separate bearer secret for that monitor.
- Track latency over time and alert when it approaches the five-second timeout.
- Add separate checks for Supabase Auth and Storage only if incidents show they
  need independent monitoring; keep the daily database probe lightweight.
- For stronger isolation, create a dedicated one-row `health_checks` table and
  a narrowly scoped database role instead of using the service-role key.
