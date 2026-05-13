# FreelanceDesk

FreelanceDesk is a private personal dashboard for freelancers and developers. It manages clients, projects, domains, hosting, support requests, payments, unpaid work, reports, and reminders for one owner.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth and Postgres
- Supabase Row Level Security
- TanStack Query and Table
- React Hook Form and Zod
- Recharts
- lucide-react

## App Routes

```text
/login
/dashboard
/clients
/clients/new
/clients/:id
/clients/:id/edit
/projects
/projects/new
/projects/:id
/projects/:id/edit
/payments
/fixes
/fixes/new
/reports
/reminders
/settings
```

## API

All API logic is implemented as Next.js route handlers under `frontend/src/app/api`.

Public:

```text
GET /api/health
```

Protected endpoints require:

```text
Authorization: Bearer <supabase_access_token>
```

Endpoint groups:

```text
/api/dashboard
/api/clients
/api/projects
/api/payments
/api/support-requests
/api/reports
/api/reminders
/api/settings
```

## Environment Variables

Create `frontend/.env.local` from `frontend/.env.example`:

```env
VITE_API_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app also accepts these Next.js-style aliases:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

No service-role key is required by the application. API routes use the caller's Supabase access token and rely on RLS for owner-scoped access.

## Supabase Setup

1. Create a Supabase project.
2. Enable email/password authentication.
3. Run the SQL migrations in `supabase/migrations`.
4. Confirm Row Level Security is enabled.
5. Create your private admin user in Supabase Auth.
6. Copy the project URL and anon key into `frontend/.env.local`.

## Local Development

```bash
cd frontend
pnpm install
pnpm dev
```

The app runs at:

```text
http://localhost:3000
```

## Deployment

Deploy the repo root to Vercel. `vercel.json` points Vercel at the `frontend/` Next.js app.

Set these Vercel environment variables:

```text
VITE_API_URL=/api
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`VITE_API_URL` can be omitted if same-origin `/api` is desired.

## Testing Checklist

- Login and logout work
- Protected routes require authentication
- Clients can be created, edited, archived, and viewed
- Projects can be created, edited, archived, and viewed
- Payments can be created, edited, and deleted
- Support requests can be created, edited, and deleted
- Dashboard totals render
- Reports and reminders render
- JSON export works
- CSV exports work
- Supabase RLS protects owner data
- `pnpm --dir frontend build` passes

## Useful Commands

```bash
pnpm --dir frontend dev
pnpm --dir frontend build
pnpm --dir frontend start
```
