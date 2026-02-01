# KaiHor Backoffice

Admin panel for managing KaiHor camps and events, built with Next.js and Supabase.

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
│   │   │   ├── camps/        # Camps management
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── events/       # Events management
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
│   └── image-migration.md    # Image migration guide
└── .env.local.example        # Environment template
```

## Features

### Current
- [x] Admin authentication (email/password)
- [x] Dashboard with stats
- [x] Camps list view with search
- [x] Responsive sidebar navigation
- [x] Role-based access (admin/editor/viewer)

### Planned
- [ ] Add/Edit/Delete camps
- [ ] Image upload to Supabase Storage
- [ ] Events management
- [ ] Data import from KHWebpage JSON
- [ ] Profile management

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
```

## Related Projects

- [KHWebpage](../KHWebpage) - Public-facing website

## Deployment

This project can be deployed to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## License

Private - KaiHor Camp
# KHBackoffice
