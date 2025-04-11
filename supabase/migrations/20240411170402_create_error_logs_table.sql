-- Migration: Create generation error logs table
-- Description: Creates the table for storing generation error logs
-- Author: AI Assistant
-- Date: 2024-04-11

create table generation_error_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    error_details text not null,
    created_at timestamp not null default current_timestamp
);
