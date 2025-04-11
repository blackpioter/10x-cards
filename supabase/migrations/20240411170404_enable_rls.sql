-- Migration: Enable RLS and create policies
-- Description: Enables Row Level Security and creates access policies for all tables
-- Author: AI Assistant
-- Date: 2024-04-11

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
