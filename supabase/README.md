# Supabase setup for IskolarLink

## Apply schema (choose one)

### A) Supabase SQL Editor (no local DB password needed)
1. Open https://supabase.com/dashboard/project/slqusnkphmlsqhphpkjy/sql
2. Paste and run: `supabase/migrations/20260326100000_create_iskolarlink_schema.sql`
3. Confirm tables under Table Editor

### B) Laravel migrate (needs database password)
1. Supabase → Project Settings → Database → copy Database password
2. Put it in `.env` as `DB_PASSWORD=...`
3. From project root:

```powershell
cd C:\laragon\www\IskolarLink_V2
php artisan config:clear
php artisan migrate --force
php artisan iskolarlink:provision-admin --force --email=admin@nemsu.edu.ph --password='#nemsu_2026!' --name="Admin Director"
```

## Tables created
users, password_reset_tokens, sessions, cache, cache_locks, jobs, job_batches,
failed_jobs, personal_access_tokens, scholarships, scholarship_applications,
announcements, notifications, approved_applicants, rejected_applicants,
scholarship_history, scholarship_history_applicants, student_application_history,
migrations
