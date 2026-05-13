# Supabase Setup

1. Create a Supabase project.
2. Enable email/password auth and create the single admin user manually.
3. Run `supabase/Sql_Database/freelancedesk_supabase_full.sql` in the Supabase SQL editor.
4. Confirm RLS is enabled on every public table.
5. Copy your Supabase URL and anon key into `frontend/.env`.
6. Copy the project URL and anon key into `frontend/.env.local`.

Do not expose the service role key in the frontend. The frontend only uses the anon key for Supabase Auth.

The split files in `supabase/migrations` are legacy references. The consolidated SQL file is the production source of truth for this app.
