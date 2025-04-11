# Database Schema Plan for 10x-cards

## 1. Tables

### 1.1. users

This table is managed by Supabase Auth.

- **id:** UUID, Primary Key
- **email:** VARCHAR, NOT NULL, UNIQUE
- **encrypted_password:** VARCHAR, NOT NULL
- **created_at:** TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP
- **confirmed_at:** TIMESTAMP, Nullable

### 1.2. flashcards
- **id:** UUID, Primary Key, DEFAULT uuid_generate_v4()
- **user_id:** UUID, NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- **generation_id:** UUID, Nullable, FOREIGN KEY REFERENCES generations(id) ON DELETE SET NULL
- **front:** VARCHAR(200), NOT NULL, CHECK (char_length(front) <= 200)
- **back:** VARCHAR(500), NOT NULL, CHECK (char_length(back) <= 500)
- **status:** TEXT, NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'accepted', 'rejected'))
- **source:** TEXT, NOT NULL, CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- **created_at:** TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP
- **last_reviewed:** TIMESTAMP, Nullable
- **next_review_date:** TIMESTAMP, Nullable
- **review_count:** INTEGER, NOT NULL, DEFAULT 0, CHECK (review_count >= 0)
- **easiness_factor:** NUMERIC, NOT NULL, DEFAULT 2.5
- **interval:** INTEGER, NOT NULL, DEFAULT 0, CHECK (interval >= 0)

### 1.3. generations
- **id:** UUID, Primary Key, DEFAULT uuid_generate_v4()
- **user_id:** UUID, NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- **created_at:** TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP
- **source_text_length:** INTEGER, NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- **generated_count:** INTEGER, NOT NULL, DEFAULT 0, CHECK (generated_count >= 0)
- **accepted_unedited_count:** INTEGER, NULLABLE
- **accepted_edited_count:** INTEGER, NULLABLE
- **source_text_hash:** TEXT, NOT NULL
- **generation_duration:** INTERVAL, NULLABLE, CHECK (generation_duration IS NULL OR generation_duration >= INTERVAL '0 seconds')
- **updated_at:** TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP

### 1.4. generation_error_logs
- **id:** UUID, Primary Key, DEFAULT uuid_generate_v4()
- **user_id:** UUID, NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- **error_details:** TEXT, NOT NULL
- **created_at:** TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP

## 2. Relationships

- A **user** can have many **flashcards** (one-to-many).
- A **user** can have many **generations** (one-to-many).
- A **generation** can have many **flashcards** (one-to-many) associated with it.
- A **user** can have many **generation_error_logs** (one-to-many).

## 3. Indexes

- **flashcards** table:
  - Index on `user_id`
  - Index on `generation_id`
  - Index on `created_at`
  - Index on `status`
  - Index on `source`

- **generations** table:
  - Index on `user_id`
  - Index on `created_at`
  - Index on `updated_at`
  - Index on `source_text_hash`
  - Index on `generation_duration`

- **generation_error_logs** table:
  - Index on `user_id`
  - Index on `created_at`

## 4. Row Level Security (RLS) Policies

- Enable RLS on all tables.
- Define policies so that regular users can only access rows where `user_id` = auth.uid() (using Supabase Auth), while administrators have access to all rows.

_Example policy for the flashcards table:_

```sql
CREATE POLICY "Users can access their flashcards" ON flashcards
  FOR SELECT USING (user_id = auth.uid());
```

_Similar policies should be implemented for `users`, `generations`, and `generation_error_logs`._

## 5. Additional Notes

- All foreign key constraints enforce referential integrity and include appropriate ON DELETE behavior.
- The design adheres to 3NF for normalization, while indexes on filter columns (status, source, dates) will help optimize query performance for the MVP.
