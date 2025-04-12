# REST API Plan

## 1. Resources

- **Users** (table: users): Managed by Supabase Auth.
- **Flashcards** (table: flashcards): Contains flashcard details including `id`, `user_id`, `generation_id`, `front` (max 200 characters), `back` (max 500 characters), `status` (values: pending, accepted, rejected), `source` (values: ai-full, ai-edited, manual), and review meta-data (e.g., `review_count`, `next_review_date`).
- **Generations** (table: generations): Captures flashcard generation events with fields like `id`, `user_id`, `source_text_length` (between 1000 and 10000 characters), counts for generated and accepted flashcards, `source_text_hash`, and duration metadata.
- **Generation Error Logs** (table: generation_error_logs): Stores error details encountered during flashcard generation with fields such as `id`, `user_id`, `error_details`, and `created_at`.

## 2. Endpoints



### b. Flashcards

- **GET /flashcards**
  - **Description:** Retrieve a paginated list of flashcards.
  - **Query Parameters:**
    - `status` (optional): Filter by flashcard status (pending, accepted, rejected).
    - `sort_by` (optional): Field name such as `created_at` or `review_count`.
    - `page` and `page_size` for pagination.
  - **Response:** A list of flashcard objects with their metadata.

- **POST /flashcards**
  - **Description:** Create a new flashcard manually.
  - **Request Payload (JSON):**
    {
      "front": "string (max 200 characters)",
      "back": "string (max 500 characters)",
      "source": "manual"
    }
  - **Response:** The created flashcard object.

- **PATCH /flashcards/:id**
  - **Description:** Update an existing flashcard (e.g., manual edits to front or back content).
  - **Request Payload (JSON):** Partial update with fields such as:
    {
      "front": "optional updated string",
      "back": "optional updated string"
    }
  - **Response:** The updated flashcard object.

- **DELETE /flashcards/:id**
  - **Description:** Delete a specified flashcard.
  - **Response:** Success message.

- **POST /flashcards/:id/approve**
  - **Description:** Mark a flashcard as approved (accepted).
  - **Response:** Flashcard object with updated status set to "accepted".

- **POST /flashcards/:id/reject**
  - **Description:** Mark a flashcard as rejected.
  - **Response:** Flashcard object with updated status set to "rejected".

- **POST /flashcards/:id/regenerate**
  - **Description:** Trigger regeneration of a flashcard if the content does not meet user criteria.
  - **Response:** A new flashcard object generated based on the original context.

- **GET /flashcards/review**
  - **Description:** Retrieve flashcards pending review to allow users to resume their evaluation process.
  - **Query Parameters:** May include filters such as `status=pending`.
  - **Response:** List of flashcards requiring review.

### c. Generations

- **POST /generations**
  - **Description:** Automatically generate flashcards from a provided text input using AI.
  - **Request Payload (JSON):**
    {
      "source_text": "string (between 1000 and 10000 characters)"
    }
  - **Response:** A generation record including metadata and an array of generated flashcards.

- **GET /generations/:id**
  - **Description:** Retrieve details for a specific generation event, including related flashcards.
  - **Response:** Generation details object.

### d. Generation Error Logs

- **GET /error-logs**
  - **Description:** Retrieve a list of generation error logs (typically for admin use).
  - **Response:** Array of error log objects.

- **POST /error-logs**
  - **Description:** Log an error encountered during flashcard generation.
  - **Request Payload (JSON):**
    {
      "error_details": "Detailed error message/string"
    }
  - **Response:** The logged error object.

### e. Statistics

- **GET /stats/generations**
  - **Description:** Retrieve aggregated statistics on flashcard generations (e.g., total generated, accepted counts).
  - **Response:** A JSON object with statistical data.



## 4. Validation and Business Logic

- **Validation:**
  - Flashcards:
    - `front` must be no longer than 200 characters.
    - `back` must be no longer than 500 characters.
  - Generations:
    - `source_text` must be between 1000 and 10000 characters.
  - All endpoints validate input against these constraints before processing.

- **Business Logic:**
  - **Automatic Generation:**
    - The POST /generations endpoint accepts a large block of text and uses AI to generate multiple flashcards, splitting the source text into digestible parts.
    - Generation records track metadata such as `generated_count` and accepted flashcards counts.
  - **Manual Editing & Review:**
    - Users can manually edit flashcards using the PATCH /flashcards/:id endpoint and decide to approve or reject them using dedicated endpoints.
    - The GET /flashcards/review endpoint allows users to retrieve flashcards pending review, enabling a session to be saved and resumed.
  - **Regeneration:**
    - If a flashcard does not meet standards, users can call POST /flashcards/:id/regenerate to receive a new version automatically generated by the AI, maintaining context.
  - **Error Logging:**
    - Errors encountered during AI generation are recorded via the /error-logs endpoints for later review and debugging.
  - **Performance Enhancements:**
    - Pagination, filtering, and sorting parameters are provided in list endpoints to manage data efficiently.
    - Database indexes (e.g., on `user_id`, `created_at`, `status`) will aid in optimizing query performance.

---

This API plan provides a comprehensive RESTful interface that reflects both the database schema and the product requirements, leveraging the specified technology stack (Astro, TypeScript, React, Tailwind, and Supabase). It ensures a clean separation of concerns, robust validation, and secure access to all resources.
