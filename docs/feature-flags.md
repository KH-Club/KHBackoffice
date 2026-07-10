# Website feature flags

The Settings page controls public feature visibility through the shared
`public.feature_flags` table. Run the SQL below once in the Supabase SQL Editor
before using the controls.

```sql
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default true,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint feature_flags_known_key check (
    key in ('news_activities', 'camp_voices')
  )
);

insert into public.feature_flags (key, enabled, description)
values
  ('news_activities', true, 'Show public News & Activities navigation and pages'),
  ('camp_voices', true, 'Show the Camp Voices homepage section')
on conflict (key) do nothing;

alter table public.feature_flags enable row level security;

drop policy if exists "Feature flags are publicly readable"
  on public.feature_flags;
create policy "Feature flags are publicly readable"
  on public.feature_flags
  for select
  using (true);

drop policy if exists "Admins and editors can update feature flags"
  on public.feature_flags;
create policy "Admins and editors can update feature flags"
  on public.feature_flags
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'editor')
    )
  );

grant select on public.feature_flags to anon, authenticated;
grant update on public.feature_flags to authenticated;

create or replace function public.set_feature_flag_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_feature_flag_updated_at
  on public.feature_flags;
create trigger set_feature_flag_updated_at
before update on public.feature_flags
for each row execute function public.set_feature_flag_updated_at();
```

## Behavior

- `news_activities`: removes News from public navigation and redirects direct
  `/news-activities` and `/event/:id` visits to the homepage.
- `camp_voices`: removes the Camp Voices section from the homepage.
- The public website fails open to the committed defaults if Supabase cannot be
  reached, so an infrastructure issue does not remove content unexpectedly.
