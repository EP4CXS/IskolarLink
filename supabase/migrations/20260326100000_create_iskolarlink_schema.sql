-- IskolarLink schema for Supabase (PostgreSQL)
-- Mirrors the final state of Laravel migrations in database/migrations/
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE patterns where possible.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Laravel migrations tracker (so artisan migrate stays in sync if you prefer SQL)
-- ---------------------------------------------------------------------------
create table if not exists migrations (
    id serial primary key,
    migration varchar(255) not null,
    batch integer not null
);

-- ---------------------------------------------------------------------------
-- Users (string PKs — IskolarLink, not default Laravel bigint)
-- ---------------------------------------------------------------------------
create table if not exists users (
    id varchar(36) primary key,
    name varchar(150) not null,
    email varchar(190) not null unique,
    password varchar(255) not null,
    role varchar(20) not null default 'student'
        check (role in ('student', 'admin')),
    avatar text null,
    profile_json jsonb null,
    created_at timestamp(0) without time zone not null default now()
);

create table if not exists password_reset_tokens (
    email varchar(255) primary key,
    token varchar(255) not null,
    created_at timestamp(0) without time zone null
);

create table if not exists sessions (
    id varchar(255) primary key,
    user_id varchar(36) null,
    ip_address varchar(45) null,
    user_agent text null,
    payload text not null,
    last_activity integer not null
);

create index if not exists sessions_user_id_index on sessions (user_id);
create index if not exists sessions_last_activity_index on sessions (last_activity);

-- ---------------------------------------------------------------------------
-- Cache
-- ---------------------------------------------------------------------------
create table if not exists cache (
    key varchar(255) primary key,
    value text not null,
    expiration bigint not null
);

create index if not exists cache_expiration_index on cache (expiration);

create table if not exists cache_locks (
    key varchar(255) primary key,
    owner varchar(255) not null,
    expiration bigint not null
);

create index if not exists cache_locks_expiration_index on cache_locks (expiration);

-- ---------------------------------------------------------------------------
-- Queues
-- ---------------------------------------------------------------------------
create table if not exists jobs (
    id bigserial primary key,
    queue varchar(255) not null,
    payload text not null,
    attempts smallint not null,
    reserved_at integer null,
    available_at integer not null,
    created_at integer not null
);

create index if not exists jobs_queue_index on jobs (queue);

create table if not exists job_batches (
    id varchar(255) primary key,
    name varchar(255) not null,
    total_jobs integer not null,
    pending_jobs integer not null,
    failed_jobs integer not null,
    failed_job_ids text not null,
    options text null,
    cancelled_at integer null,
    created_at integer not null,
    finished_at integer null
);

create table if not exists failed_jobs (
    id bigserial primary key,
    uuid varchar(255) not null unique,
    connection text not null,
    queue text not null,
    payload text not null,
    exception text not null,
    failed_at timestamp(0) without time zone not null default now()
);

create index if not exists failed_jobs_connection_queue_failed_at_index
    on failed_jobs (connection, queue, failed_at);

-- ---------------------------------------------------------------------------
-- Sanctum
-- ---------------------------------------------------------------------------
create table if not exists personal_access_tokens (
    id bigserial primary key,
    tokenable_type varchar(255) not null,
    tokenable_id varchar(36) not null,
    name text not null,
    token varchar(64) not null unique,
    abilities text null,
    last_used_at timestamp(0) without time zone null,
    expires_at timestamp(0) without time zone null,
    created_at timestamp(0) without time zone null,
    updated_at timestamp(0) without time zone null
);

create index if not exists personal_access_tokens_tokenable_type_tokenable_id_index
    on personal_access_tokens (tokenable_type, tokenable_id);
create index if not exists personal_access_tokens_expires_at_index
    on personal_access_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- Domain: scholarships
-- ---------------------------------------------------------------------------
create table if not exists scholarships (
    id varchar(36) primary key,
    title varchar(255) not null,
    description text not null,
    deadline timestamp(0) without time zone not null,
    slots integer not null default 0,
    benefits_json jsonb null,
    criteria_json jsonb null,
    status varchar(20) not null default 'Draft'
        check (status in ('Active', 'Closed', 'Draft')),
    created_at timestamp(0) without time zone null,
    updated_at timestamp(0) without time zone null
);

create table if not exists scholarship_applications (
    id varchar(36) primary key,
    student_id varchar(36) not null references users (id) on delete cascade,
    scholarship_id varchar(36) not null references scholarships (id) on delete cascade,
    status varchar(30) not null default 'Pending'
        check (status in ('Pending', 'Under Review', 'Screened', 'Approved', 'Rejected')),
    submission_date timestamp(0) without time zone not null,
    timeline_json jsonb null,
    documents_json jsonb null,
    answers_json jsonb null,
    rubric_json jsonb null,
    grant_disbursement_json jsonb null,
    grant_transactions_json jsonb null,
    reviewed_at timestamp(0) without time zone null,
    reviewed_by varchar(36) null,
    review_note text null,
    created_at timestamp(0) without time zone null,
    updated_at timestamp(0) without time zone null,
    constraint uq_application_student_scholarship unique (student_id, scholarship_id)
);

create table if not exists announcements (
    id varchar(36) primary key,
    title varchar(255) not null,
    content text not null,
    author_id varchar(36) not null references users (id) on delete cascade,
    target_audience varchar(100) not null default 'all',
    category varchar(30) not null default 'general'
        check (category in ('general', 'grant-release')),
    grant_release_date timestamp(0) without time zone null,
    created_at timestamp(0) without time zone not null default now()
);

create table if not exists notifications (
    id varchar(36) primary key,
    user_id varchar(36) not null references users (id) on delete cascade,
    title varchar(255) not null,
    message text not null,
    link varchar(255) null,
    is_read boolean not null default false,
    created_at timestamp(0) without time zone not null default now()
);

create table if not exists approved_applicants (
    id bigserial primary key,
    application_id varchar(36) not null unique
        references scholarship_applications (id) on delete cascade,
    student_id varchar(36) not null references users (id) on delete cascade,
    scholarship_id varchar(36) not null references scholarships (id) on delete cascade,
    approved_at timestamp(0) without time zone not null,
    notes text null,
    approved_by varchar(36) null
);

create table if not exists rejected_applicants (
    id bigserial primary key,
    application_id varchar(36) not null unique
        references scholarship_applications (id) on delete cascade,
    student_id varchar(36) not null references users (id) on delete cascade,
    scholarship_id varchar(36) not null references scholarships (id) on delete cascade,
    rejected_at timestamp(0) without time zone not null,
    reason text null,
    rejected_by varchar(36) null
);

create table if not exists scholarship_history (
    id bigserial primary key,
    scholarship_id varchar(36) not null,
    title varchar(255) not null,
    program_type varchar(50) null,
    ended_at timestamp(0) without time zone not null,
    ended_by varchar(36) null,
    total_applicants integer not null default 0,
    granted_applicants integer not null default 0,
    created_at timestamp(0) without time zone null,
    updated_at timestamp(0) without time zone null,
    constraint uq_history_scholarship unique (scholarship_id)
);

create table if not exists scholarship_history_applicants (
    id bigserial primary key,
    history_id bigint not null references scholarship_history (id) on delete cascade,
    application_id varchar(36) not null,
    student_id varchar(36) null,
    applicant_name varchar(150) null,
    applicant_email varchar(190) null,
    status varchar(30) not null,
    submission_date timestamp(0) without time zone null,
    created_at timestamp(0) without time zone not null default now(),
    constraint uq_history_application unique (history_id, application_id)
);

create table if not exists student_application_history (
    id bigserial primary key,
    application_id varchar(36) not null unique,
    student_id varchar(36) not null,
    scholarship_id varchar(36) not null,
    scholarship_title varchar(255) not null,
    program_type varchar(50) null,
    status varchar(30) not null,
    submission_date timestamp(0) without time zone null,
    archived_at timestamp(0) without time zone not null,
    archived_reason varchar(60) not null,
    created_at timestamp(0) without time zone null,
    updated_at timestamp(0) without time zone null
);

-- Mark Laravel migration files as applied (batch 1) if not already recorded
insert into migrations (migration, batch)
select v.migration, 1
from (values
    ('0001_01_01_000000_create_users_table'),
    ('0001_01_01_000001_create_cache_table'),
    ('0001_01_01_000002_create_jobs_table'),
    ('2026_05_24_165028_create_personal_access_tokens_table'),
    ('2026_05_25_000001_create_sessions_table'),
    ('2026_05_25_000001_create_iskolarlink_core_tables'),
    ('2026_05_26_120000_fix_personal_access_tokens_for_string_user_ids')
) as v(migration)
where not exists (
    select 1 from migrations m where m.migration = v.migration
);
