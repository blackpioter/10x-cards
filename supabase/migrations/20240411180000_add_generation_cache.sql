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
