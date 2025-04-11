-- Migration: Disable RLS and remove policies
-- Description: Disables Row Level Security and removes all access policies from tables
-- Author: AI Assistant
-- Date: 2024-04-11

-- Drop all policies from generations table
drop policy if exists "Authenticated users can view their own generations" on generations;
drop policy if exists "Anonymous users cannot view generations" on generations;
drop policy if exists "Authenticated users can insert their own generations" on generations;
drop policy if exists "Anonymous users cannot insert generations" on generations;
drop policy if exists "Authenticated users can update their own generations" on generations;
drop policy if exists "Anonymous users cannot update generations" on generations;
drop policy if exists "Authenticated users can delete their own generations" on generations;
drop policy if exists "Anonymous users cannot delete generations" on generations;

-- Drop all policies from flashcards table
drop policy if exists "Authenticated users can view their own flashcards" on flashcards;
drop policy if exists "Anonymous users cannot view flashcards" on flashcards;
drop policy if exists "Authenticated users can insert their own flashcards" on flashcards;
drop policy if exists "Anonymous users cannot insert flashcards" on flashcards;
drop policy if exists "Authenticated users can update their own flashcards" on flashcards;
drop policy if exists "Anonymous users cannot update flashcards" on flashcards;
drop policy if exists "Authenticated users can delete their own flashcards" on flashcards;
drop policy if exists "Anonymous users cannot delete flashcards" on flashcards;

-- Drop all policies from generation_error_logs table
drop policy if exists "Authenticated users can view their own error logs" on generation_error_logs;
drop policy if exists "Anonymous users cannot view error logs" on generation_error_logs;
drop policy if exists "Authenticated users can insert their own error logs" on generation_error_logs;
drop policy if exists "Anonymous users cannot insert error logs" on generation_error_logs;
drop policy if exists "Authenticated users can delete their own error logs" on generation_error_logs;
drop policy if exists "Anonymous users cannot delete error logs" on generation_error_logs;

-- Disable Row Level Security on all tables
alter table generations disable row level security;
alter table flashcards disable row level security;
alter table generation_error_logs disable row level security;
