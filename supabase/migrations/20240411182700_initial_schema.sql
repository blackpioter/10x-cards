--
-- Migration: Initial Schema Setup for 10x-cards
-- Description: Creates the core database schema including users, flashcards, generations, and error logs
-- Created At: 2024-04-11 18:27:00 UTC
-- Author: AI Assistant
--
-- Tables created:
--   - users (with auth integration)
--   - flashcards (for storing learning cards)
--   - generations (for tracking AI generation sessions)
--   - generation_error_logs (for error tracking)
--

-- Enable required extensions
create extension if not exists "uuid-ossp";

--
-- 1. Users table
-- Note: This table extends Supabase Auth with additional user data
--
create table users (
    id uuid primary key default uuid_generate_v4(),
    email varchar not null unique,
    encrypted_password text not null,
    created_at timestamp not null default current_timestamp,
    confirmed_at timestamp
);

-- Enable RLS
alter table users enable row level security;

-- RLS Policies for authenticated users
create policy "Allow users to view own profile"
    on users
    for select
    using (auth.uid() = id);

create policy "Allow users to update own profile"
    on users
    for update
    using (auth.uid() = id);

--
-- 2. Generations table
-- Tracks AI-powered flashcard generation sessions
--
create table generations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    created_at timestamp not null default current_timestamp,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generated_count integer not null default 0 check (generated_count >= 0),
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash text not null,
    generation_duration interval check (generation_duration is null or generation_duration >= interval '0 seconds'),
    updated_at timestamp not null default current_timestamp
);

-- Enable RLS
alter table generations enable row level security;

-- RLS Policies for authenticated users
create policy "Allow users to view own generations"
    on generations
    for select
    using (auth.uid() = user_id);

create policy "Allow users to create own generations"
    on generations
    for insert
    with check (auth.uid() = user_id);

create policy "Allow users to update own generations"
    on generations
    for update
    using (auth.uid() = user_id);

create policy "Allow users to delete own generations"
    on generations
    for delete
    using (auth.uid() = user_id);

--
-- 3. Flashcards table
-- Core table for storing learning cards with spaced repetition metadata
--
create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    generation_id uuid references generations(id) on delete set null,
    front varchar(200) not null check (char_length(front) <= 200),
    back varchar(500) not null check (char_length(back) <= 500),
    status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
    source text not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamp not null default current_timestamp,
    last_reviewed timestamp,
    next_review_date timestamp,
    review_count integer not null default 0 check (review_count >= 0),
    easiness_factor numeric not null default 2.5,
    interval integer not null default 0 check (interval >= 0)
);

-- Enable RLS
alter table flashcards enable row level security;

-- RLS Policies for authenticated users
create policy "Allow users to view own flashcards"
    on flashcards
    for select
    using (auth.uid() = user_id);

create policy "Allow users to create own flashcards"
    on flashcards
    for insert
    with check (auth.uid() = user_id);

create policy "Allow users to update own flashcards"
    on flashcards
    for update
    using (auth.uid() = user_id);

create policy "Allow users to delete own flashcards"
    on flashcards
    for delete
    using (auth.uid() = user_id);

--
-- 4. Generation Error Logs table
-- Tracks errors during the flashcard generation process
--
create table generation_error_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    error_details text not null,
    created_at timestamp not null default current_timestamp
);

-- Enable RLS
alter table generation_error_logs enable row level security;

-- RLS Policies for authenticated users
create policy "Allow users to view own error logs"
    on generation_error_logs
    for select
    using (auth.uid() = user_id);

create policy "Allow users to create error logs"
    on generation_error_logs
    for insert
    with check (auth.uid() = user_id);

--
-- 5. Indexes for performance optimization
--

-- Flashcards indexes
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_flashcards_created_at on flashcards(created_at);
create index idx_flashcards_status on flashcards(status);
create index idx_flashcards_source on flashcards(source);

-- Generations indexes
create index idx_generations_user_id on generations(user_id);
create index idx_generations_created_at on generations(created_at);
create index idx_generations_updated_at on generations(updated_at);
create index idx_generations_source_text_hash on generations(source_text_hash);
create index idx_generations_generation_duration on generations(generation_duration);

-- Generation Error Logs indexes
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);
create index idx_generation_error_logs_created_at on generation_error_logs(created_at);
