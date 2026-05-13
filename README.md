# FreelanceDesk

Private freelance admin dashboard for clients, projects, payments, support requests, reports, and reminders.

## Stack

- Next.js App Router
- React and TypeScript
- Supabase Auth and Postgres
- TanStack Query
- React Hook Form and Zod
- Recharts

## Environment

Create `.env.local` from `.env.example`.

```env
VITE_API_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Next.js aliases are also supported:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Supabase

Create a Supabase project, enable email/password auth, run the SQL migrations in `supabase/migrations`, and add the project URL plus anon key to `.env.local`.

## Build

```bash
pnpm lint
pnpm build
pnpm start
```

Deploy the Next.js app to Vercel and set the same Supabase environment variables.
