# AGENTS.md

## Project Overview

This repository is the KaiHor Backoffice CMS for managing content used by `khwebpage`, the public KaiHor volunteer camp website. The application is a private Next.js 16 App Router admin panel backed by Supabase Auth, PostgreSQL tables, and Supabase Storage. Its current production-shaped surface is camp content management, homepage alumni/student voice management, and News & Activities management: listing, searching, creating, editing, deleting, publishing, registration deadline metadata, action buttons, and attaching public image URLs to records.

The system should be understood as a CMS with these layers:

- Admin UI: Next.js routes under `src/app`.
- Auth/session layer: Supabase Auth through `@supabase/ssr`.
- Content store: Supabase tables typed in `src/types/database.ts`.
- Media store: Supabase Storage buckets named `camps`, `alumni-student-voices`, and `news-activities`.
- Delivery surface: Supabase table/storage data consumed by `khwebpage`; this repo also deep-links to the public site through `NEXT_PUBLIC_WEBSITE_URL`.

## Key Files and Entry Points

- `src/app/layout.tsx`: application metadata and global shell.
- `src/middleware.ts` and `src/lib/supabase/middleware.ts`: route protection and session refresh.
- `src/app/login/page.tsx`: email/password login with `supabase.auth.signInWithPassword`.
- `src/app/auth/callback/route.ts`: Supabase auth callback.
- `src/app/(dashboard)/layout.tsx`: protected dashboard layout and sidebar.
- `src/app/(dashboard)/dashboard/page.tsx`: CMS stats and setup checklist.
- `src/app/(dashboard)/camps`: camp list, detail, create, edit, and delete flows.
- `src/app/(dashboard)/alumni-student-voices`: CRUD and publish controls for the 3-person homepage Camp Voices content.
- `src/app/(dashboard)/events`: News & Activities list, create, edit, delete, image upload, category/status, registration deadline, action button, and publish controls for the public `/news-activities` and `/event/:id` pages.
- `src/components/image-upload.tsx`: upload UI and image-list editing.
- `src/services/storage.ts`: Supabase Storage upload/delete/list helpers.
- `src/lib/supabase/client.ts`: browser Supabase client.
- `src/lib/supabase/server.ts`: server Supabase client.
- `src/types/database.ts`: current inferred database contract for `camps`, `profiles`, `events`, and `alumni_student_voices`.
- `docs/alumni-student-voices.md`: SQL contract for the voices table, RLS policies, and Storage bucket.
- `docs/news-activities.md`: SQL contract for the events table fields, RLS policies, and public delivery rules.
- `docs/image-migration.md`: migration notes for moving `KHWebpage/public/camps` images into Supabase Storage.

## Logical Agents

### Authentication and Authorization Agent

Purpose: Protect the CMS and provide an authenticated Supabase session for admin operations.

Responsibilities:

- Sign users in from `src/app/login/page.tsx`.
- Exchange auth callback codes in `src/app/auth/callback/route.ts`.
- Refresh sessions and redirect unauthenticated users in middleware.
- Provide `User` data to dashboard layout, sidebar, and settings.
- Use `profiles.role` as the role model (`admin`, `editor`, `viewer`).

Inputs:

- Email and password.
- Supabase auth callback code.
- Request cookies.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Outputs:

- Supabase session cookies.
- Redirects to `/login` or `/dashboard`.
- Authenticated user object.

Interactions:

- Content, Media, and Publishing agents depend on this session.
- Role enforcement is assumed to happen through Supabase policies or future server checks. The current code checks authentication, but does not visibly gate every CMS action by role.

### Content Management Agent

Purpose: Manage structured content records for the public website.

Responsibilities:

- Read all camps from the `camps` table in `src/app/(dashboard)/camps/page.tsx`.
- Search and navigate camp rows in `src/app/(dashboard)/camps/camps-table.tsx`.
- Create and update camp records in `src/app/(dashboard)/camps/camp-form.tsx`.
- View individual camp metadata and image galleries in `src/app/(dashboard)/camps/[id]/page.tsx`.
- Delete camp records in `src/app/(dashboard)/camps/[id]/delete-button.tsx`.
- Manage homepage alumni/student voice rows in `src/app/(dashboard)/alumni-student-voices`.
- Use `is_published` and `display_order` to control public visibility and order; only 3 published voices should be visible on `khwebpage`.

Inputs:

- `camp_id`, `name`, `location`, `province`, `director`, `date`, and `img_src`.
- Voice `name`, `role`, `relation`, `camp_year`, `quote`, portrait URL, display order, and publish state.
- Supabase row IDs from route params.
- Search text in the camp table UI.

Outputs:

- Inserted, updated, or deleted rows in `public.camps` and `public.alumni_student_voices`.
- Toasts, inline errors, route refreshes, and dashboard stats.
- Public-site links of the form `${NEXT_PUBLIC_WEBSITE_URL}/camp/${camp.camp_id}`.

Interactions:

- Reads and writes `img_src` values provided by the Media Agent.
- Supplies content consumed by the API/Delivery Agent.
- Must preserve `camp_id` as the public website identifier; edit flows intentionally disable changing it.

### Media Agent

Purpose: Manage images attached to camp content.

Responsibilities:

- Accept drag-and-drop or file-input uploads in `ImageUpload`.
- Compress images larger than 5 MB with `browser-image-compression`.
- Store files in Supabase Storage bucket `camps`, under `main/{campIdFolder}/{fileName}`.
- Store alumni/student voice portraits in Supabase Storage bucket `alumni-student-voices`, under `voices/{fileName}`.
- Store News & Activities images in Supabase Storage bucket `news-activities`, under `events/{fileName}`.
- Convert decimal camp IDs to folder-safe names (`53.5` -> `53-5`).
- Return public URLs and update `camps.img_src`.
- Delete individual storage objects when an image is removed from a camp.

Inputs:

- Browser `FileList`.
- Current camp ID.
- Optional database row ID for edit-mode auto-save.
- Existing `img_src` URL array.

Outputs:

- Public image URLs.
- Storage objects in the `camps` bucket.
- Updated `img_src` arrays on camp rows.
- Upload progress, success, and error states.

Interactions:

- Called from the Content Management Agent through `CampForm`.
- Public `khwebpage` should render returned public URLs.
- In create mode, uploads can happen before the camp row is saved; if an editor abandons the form, orphaned storage files are possible.
- Deleting a camp row does not currently remove all related storage objects; handle cleanup separately if needed.

### Publishing Agent

Purpose: Control whether time-sensitive content is visible on the public site.

Current state:

- The `events` table type includes `title`, `description`, `event_date`, `start_date`, `end_date`, `location`, `img_src`, `type`, `status`, `action_label`, `action_url`, and `is_published`.
- `/events` lists News & Activities rows with search, category/status labels, publish state, edit links, and deletion confirmation.
- `/events/new` and `/events/[id]/edit` create and update public news/activity rows.
- No review queue, scheduled publish date, or approval table is visible in the current code.

Responsibilities:

- Create and edit event records.
- Delete event records after confirmation.
- Toggle `is_published`.
- Classify rows by category and public status.
- Ensure delivery queries expose only published records.

Inputs:

- Event title, description, event date, registration start/end dates, location, image URL, category, status, action label/URL, and publish state.

Outputs:

- Rows in `public.events`.
- Publicly deliverable event content when `is_published` is true.

Interactions:

- Uses Auth for editor identity.
- Uses the Media Agent to upload images into the `news-activities` bucket and stores the resulting public URL in `events.img_src`.
- Coordinates with the API/Delivery Agent so unpublished content is not exposed.

### API and Delivery Agent

Purpose: Deliver CMS-managed content to `khwebpage`.

Current state:

- This repo does not define custom content API routes.
- Supabase appears to be the content API: tables and public storage URLs are the source of truth.
- The backoffice detail view links to the public website using `NEXT_PUBLIC_WEBSITE_URL`.

Responsibilities:

- Keep table contracts stable for frontend consumers.
- Store public image URLs that `khwebpage` can render.
- Avoid leaking unpublished or private data through Supabase read policies.

Inputs:

- Read requests from `khwebpage` or any frontend service client.
- Public camp IDs and Supabase storage paths.

Outputs:

- Camp/event rows and media URLs.

Interactions:

- Reads content written by Content and Publishing agents.
- Reads media URLs produced by the Media Agent.
- Depends on Supabase Row Level Security and frontend query filters for delivery safety.

### Operations and Configuration Agent

Purpose: Keep the CMS runnable, deployable, and understandable.

Responsibilities:

- Maintain `package.json` scripts and dependency choices.
- Keep `README.md`, `docs/`, and this file aligned with real behavior.
- Track environment variables and deployment expectations.
- Verify changes with available project commands.

Inputs:

- `package.json`, `yarn.lock`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `components.json`, and `postcss.config.mjs`.

Outputs:

- Reliable local setup instructions.
- Passing lint/build checks.
- Clear documentation for future agents.

## System Workflows

### Login and Admin Access

1. User opens `/login`.
2. Login form calls Supabase Auth with email and password.
3. Middleware refreshes session cookies.
4. Authenticated users are redirected away from `/login` to `/dashboard`.
5. Unauthenticated users trying to access dashboard routes are redirected to `/login`.

Assumption: Role-specific permissions are intended because `profiles.role` exists, but the current UI does not fully enforce role-specific behavior. Add server-side checks or confirm Supabase RLS before relying on roles.

### Camp Creation

1. Admin opens `/camps/new`.
2. `CampForm` collects required camp metadata.
3. Optional images are uploaded through `ImageUpload`.
4. On submit, `CampForm` inserts a row into `camps`.
5. User is redirected back to `/camps`; Next route refreshes data.
6. `khwebpage` can consume the row from Supabase once delivery policies allow it.

### Camp Editing and Media Update

1. Admin opens `/camps/[id]/edit`.
2. Server component fetches the camp row by database `id`.
3. `CampForm` updates editable metadata.
4. `ImageUpload` can auto-save `img_src` in edit mode because it receives `dbRecordId`.
5. On save, the camp row updates and the user returns to `/camps`.

### Camp Deletion

1. Admin opens a camp detail page.
2. `DeleteCampButton` confirms destructive intent.
3. Client deletes the row from `camps`.
4. User returns to `/camps`.

Important: This flow deletes the database row only. It does not bulk-delete all images in Supabase Storage for that camp.

### Event Publishing

1. Editor creates a news/activity draft from `/events/new`.
2. Editor sets category, status, date, location, description, and optional uploaded image.
3. Editor toggles `is_published`.
4. Delivery queries expose only published events.
5. Public website renders published events at `/news-activities`.

### Content Delivery to KHWebpage

1. Backoffice writes camp/event rows and image URLs to Supabase.
2. `khwebpage` reads from Supabase or a delivery layer.
3. Images are served from public Supabase Storage URLs.
4. Backoffice detail pages can link to public pages through `NEXT_PUBLIC_WEBSITE_URL`.

Assumption: The exact `khwebpage` delivery code lives outside this repo.

## Developer Setup and Usage

Use Yarn because this repo ships `yarn.lock`.

```bash
yarn install
yarn dev
yarn build
yarn start
yarn lint
```

On Windows PowerShell, use `yarn.cmd <script>` if `yarn` is blocked by the shell policy.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WEBSITE_URL=https://your-public-khwebpage-url
```

Access setup:

1. Create or use a Supabase project.
2. Ensure the `camps`, `events`, `profiles`, and `alumni_student_voices` tables match `src/types/database.ts`; use `docs/news-activities.md` for the `events` contract.
3. Ensure Supabase Storage has public `camps`, `alumni-student-voices`, and `news-activities` buckets if public image URLs are expected.
4. Create a Supabase Auth user.
5. Set that user's `profiles.role` to `admin` for full CMS access.
6. Start the app and sign in at `/login`.

Note: `README.md` references `supabase/schema.sql`, `supabase/seed.sql`, and `supabase/storage.sql`, but the `supabase/` directory is not present in this checkout. Treat `src/types/database.ts`, the live Supabase dashboard, `docs/image-migration.md`, `docs/alumni-student-voices.md`, and `docs/news-activities.md` as the current local evidence unless migrations are restored.

## Codebase Navigation Rules for Agents

- Start from `src/types/database.ts` to understand the data contract.
- For pages, follow Next App Router paths under `src/app`.
- Use `createClient` from `src/lib/supabase/server.ts` in server components and `src/lib/supabase/client.ts` in client components.
- Keep content CRUD close to the relevant route until shared reuse is clear.
- Keep storage logic in `src/services/storage.ts`; do not duplicate upload or URL parsing logic in components.
- Keep reusable UI primitives in `src/components/ui`; keep feature UI near the route.
- Preserve `@/*` imports and strict TypeScript.
- Do not introduce service-role keys into client code.
- Do not invent unsupported CMS states such as review, scheduling, or arbitrary permissions without adding schema, UI, and delivery rules.
- If adding publishing, define how drafts and unpublished records are hidden from `khwebpage`.
- If changing tables, update `src/types/database.ts`, setup docs, and any Supabase migration files that are restored.

## Verification Expectations

Available checks:

```bash
yarn lint
yarn typecheck
yarn build
```

No test runner is configured in this repo at the time of inspection. For CMS changes, also manually smoke-test:

- Login and logout.
- `/dashboard` stats.
- `/camps` list and search.
- `/events` list, search, create, edit, publish toggle, and delete.
- Camp create, edit, detail, and delete.
- Image upload, preview, removal, and public URL rendering.
- Public-site link generation through `NEXT_PUBLIC_WEBSITE_URL`.

CI runs the same lint, typecheck, and build gates on pushes and pull requests
to `dev` and `main`. Feature branches should merge into `dev`; `dev` then
promotes into `main` when the integrated feature set is production-ready. CI
does not deploy to Vercel or require a Vercel token.

## Assumptions and Known Gaps

- This repo is treated as the CMS for `khwebpage`, while the public frontend lives in a sibling project.
- Supabase is both the database and delivery API unless a separate API is added later.
- News & Activities publishing is implemented through `events.is_published`; review/approval workflows are not present.
- Review/approval workflows are not present.
- Role-based access is modeled but not fully visible in route-level code.
- Camp deletion does not clean up all attached media objects.
- Create-mode image uploads can leave orphaned files if a form is abandoned.
- Local migration SQL files referenced by the README are missing from this checkout.
