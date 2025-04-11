-- Migration: Initial schema creation
-- Description: Creates the base tables for the flashcard application
-- Tables: users (managed by auth), flashcards, generations, generation_error_logs
-- Author: AI Assistant
-- Date: 2024-03-19

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create generations table first (since it's referenced by flashcards)
create table generations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp not null default current_timestamp,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generated_count integer not null default 0 check (generated_count >= 0),
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash text not null,
    generation_duration interval check (generation_duration is null or generation_duration >= interval '0 seconds'),
    updated_at timestamp not null default current_timestamp
);

-- Create flashcards table (now generations table exists for the foreign key)
create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
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

-- Create generation_error_logs table
create table generation_error_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    error_details text not null,
    created_at timestamp not null default current_timestamp
);

-- Create indexes
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index flashcards_created_at_idx on flashcards(created_at);
create index flashcards_status_idx on flashcards(status);
create index flashcards_source_idx on flashcards(source);

create index generations_user_id_idx on generations(user_id);
create index generations_created_at_idx on generations(created_at);
create index generations_updated_at_idx on generations(updated_at);
create index generations_source_text_hash_idx on generations(source_text_hash);
create index generations_generation_duration_idx on generations(generation_duration);

create index generation_error_logs_user_id_idx on generation_error_logs(user_id);
create index generation_error_logs_created_at_idx on generation_error_logs(created_at);

-- Enable Row Level Security
alter table generations enable row level security;
alter table flashcards enable row level security;
alter table generation_error_logs enable row level security;

-- Create RLS policies for generations (first, since it's referenced by flashcards)
create policy "Authenticated users can view their own generations"
    on generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anonymous users cannot view generations"
    on generations for select
    to anon
    using (false);

create policy "Authenticated users can insert their own generations"
    on generations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anonymous users cannot insert generations"
    on generations for insert
    to anon
    with check (false);

create policy "Authenticated users can update their own generations"
    on generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Anonymous users cannot update generations"
    on generations for update
    to anon
    using (false);

create policy "Authenticated users can delete their own generations"
    on generations for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anonymous users cannot delete generations"
    on generations for delete
    to anon
    using (false);

-- Create RLS policies for flashcards
create policy "Authenticated users can view their own flashcards"
    on flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anonymous users cannot view flashcards"
    on flashcards for select
    to anon
    using (false);

create policy "Authenticated users can insert their own flashcards"
    on flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anonymous users cannot insert flashcards"
    on flashcards for insert
    to anon
    with check (false);

create policy "Authenticated users can update their own flashcards"
    on flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Anonymous users cannot update flashcards"
    on flashcards for update
    to anon
    using (false);

create policy "Authenticated users can delete their own flashcards"
    on flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anonymous users cannot delete flashcards"
    on flashcards for delete
    to anon
    using (false);

-- Create RLS policies for generation_error_logs
create policy "Authenticated users can view their own error logs"
    on generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anonymous users cannot view error logs"
    on generation_error_logs for select
    to anon
    using (false);

create policy "Authenticated users can insert their own error logs"
    on generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anonymous users cannot insert error logs"
    on generation_error_logs for insert
    to anon
    with check (false);

create policy "Authenticated users can delete their own error logs"
    on generation_error_logs for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Anonymous users cannot delete error logs"
    on generation_error_logs for delete
    to anon
    using (false);
