# Supabase keep-alive

The `/api/keepalive` route performs a minimal server-side read from the
`public.keepalive` table. Vercel Cron calls it once per day so the Supabase
project receives database activity and is less likely to be paused for
inactivity on the Free plan.

## Setup

This repository does not use Supabase migrations. Run the following SQL once
in the Supabase SQL Editor:

```sql
create table if not exists public.keepalive (
  id bigint generated always as identity primary key,
  created_at timestamptz default now()
);

alter table public.keepalive enable row level security;

insert into public.keepalive default values
on conflict do nothing;
```

Configure these environment variables in the deployment that serves the
Next.js app:

- `NEXT_PUBLIC_SUPABASE_URL` — the existing Supabase project URL. The route
  only uses this as a URL; it does not make the service role key public.
- `SUPABASE_URL` — optional server-only override for the project URL. If it is
  not set, the route reuses `NEXT_PUBLIC_SUPABASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY` — the server-only Supabase service role key.
- `CRON_SECRET` — a long random value used to authenticate the endpoint. Vercel
  sends it as `Authorization: Bearer <CRON_SECRET>` for Cron requests.

Never commit real values or place `SUPABASE_SERVICE_ROLE_KEY` in a variable
whose name starts with `NEXT_PUBLIC_`.

## Cron schedule

`vercel.json` schedules a GET request to `/api/keepalive` daily at 00:00 UTC.
The endpoint requires the `CRON_SECRET` bearer token and returns
`{"ok":true}` after the database read succeeds.

## Manual test

Set the same secret in your shell and replace the domain with the deployed
Next.js app URL:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/keepalive
```

Expected success response:

```json
{"ok":true}
```

An invalid or missing token returns `401`. A missing server configuration or a
Supabase query failure returns `503` with a JSON error response.
