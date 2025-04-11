-- Migration: Create generations table
-- Description: Creates the base table for storing generation metadata
-- Author: AI Assistant
-- Date: 2024-04-11

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

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
