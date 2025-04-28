-- Add from_cache column to generations table
ALTER TABLE generations
ADD COLUMN from_cache BOOLEAN NOT NULL DEFAULT false;
