-- Migration: Create indexes
-- Description: Creates indexes for all tables
-- Author: AI Assistant
-- Date: 2024-04-11

-- Create indexes for flashcards table
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index flashcards_created_at_idx on flashcards(created_at);
create index flashcards_status_idx on flashcards(status);
create index flashcards_source_idx on flashcards(source);

-- Create indexes for generations table
create index generations_user_id_idx on generations(user_id);
create index generations_created_at_idx on generations(created_at);
create index generations_updated_at_idx on generations(updated_at);
create index generations_source_text_hash_idx on generations(source_text_hash);
create index generations_generation_duration_idx on generations(generation_duration);

-- Create indexes for generation_error_logs table
create index generation_error_logs_user_id_idx on generation_error_logs(user_id);
create index generation_error_logs_created_at_idx on generation_error_logs(created_at);
