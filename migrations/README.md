MIGRATIONS
==========

This folder contains SQL migrations for Escholar. Apply them in order against your Supabase/Postgres database.

Files
- `001_create_schema.sql` — Creates the core schema (`students`, `payments`, `admins`), indexes, view `student_totals`, and seeds example data if tables are empty.
- `002_rls_policies.sql` — Example Row Level Security (RLS) policies. Review and adapt to your auth model before applying.

How to run (recommended)

Using the Supabase CLI (recommended):

1. Install and login: `supabase login`
2. From workspace root, run:

```bash
supabase db remote set <YOUR_DB_CONNECTION_STRING>
supabase db push --file migrations/001_create_schema.sql
supabase db push --file migrations/002_rls_policies.sql
```

Or via `psql` (when you have a connection string):

```bash
psql <CONNECTION_STRING> -f migrations/001_create_schema.sql
psql <CONNECTION_STRING> -f migrations/002_rls_policies.sql
```

Notes
- `002_rls_policies.sql` contains example policies intended as a starting point. Test thoroughly in staging.
- If you use Supabase UI, you can paste the SQL into the SQL editor and run each file in order.
