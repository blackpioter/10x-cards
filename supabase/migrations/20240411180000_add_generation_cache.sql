-- Create generation cache table
CREATE TABLE generation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_hash TEXT NOT NULL,
    source_text TEXT NOT NULL,
    flashcards JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,

    -- Add indexes
    CONSTRAINT generation_cache_text_hash_key UNIQUE (text_hash),

    -- Add foreign key
    CONSTRAINT generation_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE generation_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
    ON generation_cache
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access only for own records
CREATE POLICY "Allow insert access for own records"
    ON generation_cache
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add function to clean old cache entries
CREATE OR REPLACE FUNCTION clean_old_generation_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM generation_cache
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;
