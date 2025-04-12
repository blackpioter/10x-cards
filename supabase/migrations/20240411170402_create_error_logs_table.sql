-- Migration: Create generation error logs table
-- Description: Creates the table for storing generation error logs
-- Author: AI Assistant
-- Date: 2024-04-11

create table generation_error_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    error_code text not null,
    error_message text not null,
    model text not null,
    source_text_hash text not null,
    source_text_length integer not null,
    created_at timestamp not null default current_timestamp
);
