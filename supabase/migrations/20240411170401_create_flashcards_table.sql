-- Migration: Create flashcards table
-- Description: Creates the base table for storing flashcard data
-- Author: AI Assistant
-- Date: 2024-04-11

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
