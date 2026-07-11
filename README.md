# KaiHor Backoffice

Admin panel for managing KaiHor camps, events, and alumni/student voices, built with Next.js and Supabase.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- A Supabase account

### 1. Clone and Install

```bash
cd kaihor-backoffice
yarn install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project (or use existing)
2. Go to **Project Settings** > **API**
3. Copy the **Project URL** and **anon public** key

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL

### 5. Import Camp Data

1. After running schema.sql, run the seed script
2. Copy contents of `supabase/seed.sql`
3. Paste and run in SQL Editor
4. This imports all 54 camps from KHWebpage

### 6. Set Up Image Storage (Optional)

1. Run `supabase/storage.sql` in SQL Editor
2. This creates a `camps` bucket for storing images
3. See `docs/image-migration.md` for migrating existing images

### 7. Create an Admin User

1. Go to **Authentication** > **Users** in Supabase
2. Click **Add user** > **Create new user**
3. Enter email and password
4. After user is created, go to **Table Editor** > **profiles**
5. Find the user and change `role` from `viewer` to `admin`

### 8. Start Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your admin credentials.

## Project Structure

```
kaihor-backoffice/
├── src/
│   ├── app/
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── alumni-student-voices/ # Homepage voice management
│   │   │   ├── camps/        # Camps management
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── events/       # News & Activities management
│   │   │   ├── settings/     # User settings
│   │   │   └── layout.tsx    # Dashboard layout with sidebar
│   │   ├── auth/             # Auth callback
│   │   ├── login/            # Login page
│   │   └── page.tsx          # Root redirect
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── app-sidebar.tsx   # Main navigation
│   ├── lib/
│   │   ├── supabase/         # Supabase client configs
│   │   └── utils.ts          # Utility functions
│   ├── types/
│   │   └── database.ts       # TypeScript types for DB
│   └── middleware.ts         # Auth middleware
├── supabase/
│   ├── schema.sql            # Database schema
│   ├── seed.sql              # Camp data import
│   └── storage.sql           # Storage bucket setup
├── docs/
│   ├── alumni-student-voices.md # Voice schema and storage SQL
│   └── image-migration.md    # Image migration guide
└── .env.local.example        # Environment template
```

## Features

### Current
- [x] Admin authentication (email/password)
- [x] Dashboard with stats
- [x] Camps list view with search
- [x] Alumni/student voice CRUD and publish control
- [x] News & Activities CRUD, search, category/status labels, and publish control
- [x] Public website feature flags for News & Activities and Camp Voices
- [x] Responsive sidebar navigation
- [x] Role-based access (admin/editor/viewer)

### Planned
- [ ] Add/Edit/Delete camps
- [ ] Image upload to Supabase Storage
- [ ] Data import from KHWebpage JSON
- [ ] Profile management

## Alumni/Student Voices

The `/alumni-student-voices` route manages the 3-person homepage Camp Voices section in KHWebpage. Run the SQL in `docs/alumni-student-voices.md` to create the `alumni_student_voices` table and `alumni-student-voices` Storage bucket. Only rows with `is_published = true` should be readable by the public website; KHWebpage renders the first 3 published rows by display order.

## News & Activities

The `/events` route manages the public KHWebpage `/news-activities` and
`/event/:id` pages. Run the SQL in `docs/news-activities.md` to create or update
the `events` table, RLS policies, and `news-activities` Storage bucket. Images
are uploaded from the CMS and saved into `events.img_src` as public URLs.
`event_date` is the main event date, while `start_date` and `end_date` support
registration windows, deadlines, and countdown labels. Only rows with
`is_published = true` should be readable by the public website.

## Website feature flags

The `/settings` route can show or hide News & Activities and Camp Voices on
KHWebpage without deleting content. Run the SQL in `docs/feature-flags.md` once
to create the shared table, seed the default flags, and install its RLS
policies. Flags default to visible if the public website cannot reach Supabase.

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access - create, read, update, delete |
| Editor | Create, read, update |
| Viewer | Read only |

## Scripts

```bash
yarn dev        # Start development server
yarn build      # Build for production
yarn start      # Start production server
yarn lint       # Run ESLint
yarn typecheck  # Run TypeScript without emitting files
```

## Related Projects

- [KHWebpage](../KHWebpage) - Public-facing website

## Deployment

No automatic deployment is configured in CI. Deploy manually only when the
project owner explicitly approves the target platform and any possible
deployment/build usage.

## CI

GitHub Actions runs on pushes and pull requests to `dev` and `main`. Feature
branches should merge into `dev`; `dev` should promote into `main` only when
the integrated feature set is ready for production:

1. ESLint with zero-warning enforcement.
2. TypeScript type checking.
3. Next.js production build.

The workflow does not deploy to Vercel or require a Vercel token.

## Scheduled health check

Production includes a protected daily Vercel Cron probe at `/api/health`. See
[`docs/health-check.md`](docs/health-check.md) for architecture, environment
variables, local testing, deployment, security, and monitoring guidance.

## License

Private - KaiHor Camp
# KHBackoffice
# KHBackoffice
