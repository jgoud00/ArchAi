## Running Pending Supabase Migrations

Follow these steps any time new SQL files appear under `supabase/migrations/`.

1. **Install Supabase CLI (if needed)**
   ```sh
   npm install -g supabase
   supabase --version
   ```

2. **Set required environment variables**
   ```sh
   export SUPABASE_ACCESS_TOKEN=<personal access token>
   export SUPABASE_DB_PASSWORD=<project db password>
   ```
   > On Windows PowerShell use `setx` / `$env:VAR`.

3. **Log into Supabase**
   ```sh
   supabase login
   ```

4. **Target the project**
   ```sh
   supabase link --project-ref <project-ref>
   ```

5. **Apply migrations in order**
   ```sh
   supabase migration up
   ```
   The CLI executes files by timestamp. To run one explicitly:
   ```sh
   supabase migration up 013_add_archived_status
   ```

6. **Verify**
   ```sh
   supabase db remote commit --dry-run
   supabase db diff --linked
   ```
   Confirm no pending diffs remain.

7. **Troubleshooting**
   - Use `supabase db reset` locally to replay migrations end-to-end.
   - For production failures, roll back with your DB snapshot; Supabase migrations are not auto-rolled-back.

