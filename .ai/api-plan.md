# REST API Plan

## 1. Resources

### Users
- **Table:** users
- **Description:** Managed by Supabase Auth.

### Flashcards
- **Table:** flashcards
- **Fields:**
  - `id`: UUID primary key
  - `user_id`: Reference to user
  - `generation_id`: Reference to generation (optional)
  - `front`: Question text (max 200 characters)
  - `back`: Answer text (max 500 characters)
  - `status`: 'pending', 'accepted', or 'rejected'
  - `source`: 'ai-full', 'ai-edited', or 'manual'
  - Review metadata: `review_count`, `next_review_date`, etc.

### Generations
- **Table:** generations
- **Fields:**
  - `id`: UUID primary key
  - `user_id`: Reference to user
  - `source_text_length`: Length of input text (1000-10000 chars)
  - `generated_count`: Number of flashcards generated
  - `source_text_hash`: Hash of input text
  - Duration and acceptance metadata

### Generation Error Logs
- **Table:** generation_error_logs
- **Fields:**
  - `id`: UUID primary key
  - `user_id`: Reference to user
  - `error_details`: Error information
  - `created_at`: Timestamp of error

## 2. Endpoints

### b. Flashcards

- **GET /flashcards**
  - **Description:** Retrieve a paginated list of flashcards.
  - **Query Parameters:**
    - `status` (optional): Filter by flashcard status (pending, accepted, rejected).
    - `sort_by` (optional): Field name such as `created_at` or `review_count`.
    - `page` and `page_size`: For pagination.
  - **Example Request:**
    ```
    GET /flashcards?status=pending&page=1&page_size=10
    ```
  - **Response:** A list of flashcard objects with their metadata.
  - **Example Reply:**
    ```json
    {
      "flashcards": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "user_id": "user-uuid",
          "generation_id": null,
          "front": "What is the capital of France?",
          "back": "Paris",
          "source": "manual",
          "created_at": "2023-10-10T12:00:00Z",
          "last_reviewed": null,
          "next_review_date": null,
          "review_count": 0,
          "easiness_factor": 2.5,
          "interval": 0
        }
      ]
    }
    ```
  - **Validations:**
    - `page` and `page_size` must be positive integers.
    - `status` must be one of the allowed values if provided.
  - **Errors:**
    - 400 Bad Request: Invalid query parameters.
    - 500 Internal Server Error: Unexpected error retrieving flashcards.

- **POST /flashcards**
  - **Description:** Create one or multiple flashcards.
  - **Request Payload (JSON):**
    - Single flashcard:
      ```json
      {
        "front": "string (max 200 characters)",
        "back": "string (max 500 characters)",
        "source": "manual",
        "generation_id": "optional UUID"
      }
      ```
    - Multiple flashcards:
      ```json
      {
        "flashcards": [
          {
            "front": "string (max 200 characters)",
            "back": "string (max 500 characters)",
            "source": "manual",
            "generation_id": "optional UUID"
          }
        ]
      }
      ```
  - **Example Request (Single):**
    ```json
    {
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "manual",
      "generation_id": null
    }
    ```
  - **Response:**
    - Single flashcard: The created flashcard object with all fields (including system-managed fields like id, user_id, created_at, last_reviewed, next_review_date, review_count, easiness_factor, and interval).
    - Multiple flashcards: Array of created flashcard objects with all fields.
  - **Example Reply (Single):**
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "user_id": "user-uuid",
      "generation_id": null,
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "manual",
      "created_at": "2023-10-10T12:00:00Z",
      "last_reviewed": null,
      "next_review_date": null,
      "review_count": 0,
      "easiness_factor": 2.5,
      "interval": 0
    }
    ```
  - **Example Reply (Multiple):**
    ```json
    [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "user_id": "user-uuid",
        "generation_id": "optional-uuid",
        "front": "What is the capital of France?",
        "back": "Paris",
        "source": "manual",
        "created_at": "2023-10-10T12:00:00Z",
        "last_reviewed": null,
        "next_review_date": null,
        "review_count": 0,
        "easiness_factor": 2.5,
        "interval": 0
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "user_id": "user-uuid",
        "generation_id": "optional-uuid",
        "front": "What is 2+2?",
        "back": "4",
        "source": "manual",
        "created_at": "2023-10-10T12:01:00Z",
        "last_reviewed": null,
        "next_review_date": null,
        "review_count": 0,
        "easiness_factor": 2.5,
        "interval": 0
      }
    ]
    ```
  - **Validations:**
    - `front` must not exceed 200 characters.
    - `back` must not exceed 500 characters.
    - `source` must be one of `manual`, `ai-full`, or `ai-edited`.
    - If provided, `generation_id` must be a valid UUID and reference an existing generation.
  - **Errors:**
    - 400 Bad Request: Validation errors in the payload.
    - 404 Not Found: Referenced generation_id not found.
    - 500 Internal Server Error: Error while creating flashcard(s).

- **PATCH /flashcards/:id**
  - **Description:** Update an existing flashcard.
  - **Request Payload (JSON):**
    ```json
    {
      "front": "optional updated string",
      "back": "optional updated string",
      "source": "optional string"
    }
    ```
  - **Example Request:**
    ```json
    {
      "front": "Updated question text",
      "source": "ai-edited"
    }
    ```
  - **Response:** The updated flashcard object.
  - **Example Reply:**
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "user_id": "user-uuid",
      "generation_id": "optional-uuid",
      "front": "Updated question text",
      "back": "Paris",
      "source": "ai-edited",
      "created_at": "2023-10-10T12:00:00Z",
      "last_reviewed": "2023-10-10T12:10:00Z",
      "next_review_date": "2023-10-15T12:00:00Z",
      "review_count": 1,
      "easiness_factor": 2.5,
      "interval": 1
    }
    ```
  - **Validations:**
    - If provided, `front` must not exceed 200 characters.
    - If provided, `back` must not exceed 500 characters.
    - If provided, `source` must be one of `manual`, `ai-full`, or `ai-edited`.
  - **Errors:**
    - 400 Bad Request: Invalid payload.
    - 404 Not Found: Flashcard not found.
    - 500 Internal Server Error: Error updating flashcard.

- **DELETE /flashcards/:id**
  - **Description:** Delete a specified flashcard.
  - **Example Request:**
    ```
    DELETE /flashcards/123e4567-e89b-12d3-a456-426614174000
    ```
  - **Response:** Success confirmation message.
  - **Example Reply:**
    ```json
    {
      "message": "Flashcard deleted successfully."
    }
    ```
  - **Errors:**
    - 404 Not Found: Flashcard not found.
    - 500 Internal Server Error: Error deleting flashcard.

  - **Description:** Retrieve flashcards pending review.
  - **Query Parameters:**
    - `status` (optional, default "pending"): Filter flashcards that need review.
  - **Example Request:**
    ```
    GET /flashcards/review?status=pending
    ```
  - **Response:** List of flashcard objects requiring review.
  - **Example Reply:**
    ```json
    {
      "flashcards": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "user_id": "user-uuid",
          "generation_id": "optional-uuid",
          "front": "What is the capital of France?",
          "back": "Paris",
          "source": "manual",
          "status": "pending",
          "created_at": "2023-10-10T12:00:00Z",
          "last_reviewed": null,
          "next_review_date": null,
          "review_count": 0,
          "easiness_factor": 2.5,
          "interval": 0
        }
      ]
    }
    ```


### c. Generations

- **GET /generations**
  - **Description:** Retrieve a list of all generations for the authenticated user.
  - **Example Request:**
    ```
    GET /generations
    ```
  - **Response:** Array of generation objects.
  - **Example Reply:**
    ```json
    [
      {
        "id": "gen-uuid-001",
        "user_id": "user-uuid",
        "source_text_length": 1500,
        "generated_count": 3,
        "accepted_unedited_count": 0,
        "accepted_edited_count": 0,
        "source_text_hash": "hash-value",
        "generation_duration": "00:00:05",
        "updated_at": "2023-10-10T12:05:00Z",
        "flashcardProposals": [
          {
            "id": "flashcard-id-1",
            "user_id": "user-uuid",
            "generation_id": "gen-uuid-001",
            "front": "Generated Q1",
            "back": "Generated A1",
            "source": "ai-full",
            "status": "pending",
            "created_at": "2023-10-10T12:00:00Z",
            "last_reviewed": null,
            "next_review_date": null,
            "review_count": 0,
            "easiness_factor": 2.5,
            "interval": 0
          }
        ]
      },
      {
        "id": "gen-uuid-002",
        "user_id": "user-uuid",
        "source_text_length": 2000,
        "generated_count": 5,
        "accepted_unedited_count": 2,
        "accepted_edited_count": 1,
        "source_text_hash": "hash-value-2",
        "generation_duration": "00:00:07",
        "updated_at": "2023-10-10T14:05:00Z",
        "flashcardProposals": [
          {
            "id": "flashcard-id-2",
            "user_id": "user-uuid",
            "generation_id": "gen-uuid-002",
            "front": "Generated Q2",
            "back": "Generated A2",
            "source": "ai-full",
            "status": "pending",
            "created_at": "2023-10-10T14:00:00Z",
            "last_reviewed": null,
            "next_review_date": null,
            "review_count": 0,
            "easiness_factor": 2.5,
            "interval": 0
          }
        ]
      }
    ]
    ```
  - **Errors:**
    - 500 Internal Server Error: Error retrieving generations list.

- **POST /generations**
  - **Description:** Automatically generate flashcard proposals from a provided text input using AI. The generated proposals are temporary suggestions that will be reviewed and validated by the user to become final flashcards.
  - **Request Payload (JSON):**
    ```json
    {
      "source_text": "string (between 1000 and 10000 characters)"
    }
    ```
  - **Example Request:**
    ```json
    {
      "source_text": "Detailed description or text content provided by the user..."
    }
    ```
  - **Response:** A generation record including metadata and an array of generated flashcard proposals.
  - **Example Reply:**
    ```json
    {
      "id": "gen-uuid-001",
      "user_id": "user-uuid",
      "source_text_length": 1500,
      "generated_count": 3,
      "accepted_unedited_count": 0,
      "accepted_edited_count": 0,
      "source_text_hash": "hash-value",
      "generation_duration": "00:00:05",
      "updated_at": "2023-10-10T12:05:00Z",
      "flashcardProposals": [
        {
          "id": "flashcard-id-1",
          "user_id": "user-uuid",
          "generation_id": "gen-uuid-001",
          "front": "Generated Q1",
          "back": "Generated A1",
          "source": "ai-full",
          "status": "pending",
          "created_at": "2023-10-10T12:00:00Z",
          "last_reviewed": null,
          "next_review_date": null,
          "review_count": 0,
          "easiness_factor": 2.5,
          "interval": 0
        },
        {
          "id": "flashcard-id-2",
          "user_id": "user-uuid",
          "generation_id": "gen-uuid-001",
          "front": "Generated Q2",
          "back": "Generated A2",
          "source": "ai-full",
          "status": "pending",
          "created_at": "2023-10-10T12:00:10Z",
          "last_reviewed": null,
          "next_review_date": null,
          "review_count": 0,
          "easiness_factor": 2.5,
          "interval": 0
        }
      ]
    }
    ```
  - **Validations:**
    - `source_text` must be within 1000 to 10000 characters.
  - **Errors:**
    - 400 Bad Request: Invalid source text length.
    - 500 Internal Server Error: Error during flashcard generation (will be logged in generation_error_logs table with error details and user_id).

- **GET /generations/:id**
  - **Description:** Retrieve details for a specific generation event, including related flashcards.
  - **Example Request:**
    ```
    GET /generations/123e4567-e89b-12d3-a456-426614174000
    ```
  - **Response:** Generation details object.
  - **Example Reply:**
    ```json
    {
      "id": "gen-uuid-001",
      "user_id": "user-uuid",
      "source_text_length": 1500,
      "generated_count": 3,
      "accepted_unedited_count": 0,
      "accepted_edited_count": 0,
      "source_text_hash": "hash-value",
      "generation_duration": "00:00:05",
      "updated_at": "2023-10-10T12:05:00Z",
      "flashcardProposals": [
        {
          "id": "flashcard-id-1",
          "user_id": "user-uuid",
          "generation_id": "gen-uuid-001",
          "front": "Generated Q1",
          "back": "Generated A1",
          "source": "ai-full",
          "status": "pending",
          "created_at": "2023-10-10T12:00:00Z",
          "last_reviewed": null,
          "next_review_date": null,
          "review_count": 0,
          "easiness_factor": 2.5,
          "interval": 0
        }
      ]
    }
    ```
  - **Errors:**
    - 404 Not Found: Generation record not found.
    - 500 Internal Server Error: Error retrieving generation details.

### d. Generation Error Logs

- **GET /generation-error-logs**
  - **Description:** Retrieve a list of generation error logs (typically for administrative review).
  - **Example Request:**
    ```
    GET /generation-error-logs
    ```
  - **Response:** Array of error log objects.
  - **Example Reply:**
    ```json
    [
      {
        "id": "error-log-uuid-001",
        "user_id": "user-uuid",
        "error_details": "AI generation timeout error",
        "created_at": "2023-10-10T12:10:00Z"
      }
    ]
    ```
  - **Errors:**
    - 500 Internal Server Error: Error retrieving error logs.


## 4. Validation and Business Logic

- **Validation:**
  - Flashcards:
    - `front` must be no longer than 200 characters.
    - `back` must be no longer than 500 characters.
    - `source` must be one of: 'ai-full', 'ai-edited', 'manual'.
  - Generations:
    - `source_text` must be between 1000 and 10000 characters.
    - `source_text_hash` must be unique per user to prevent duplicate submissions.
  - All endpoints validate input against these constraints before processing.

- **Business Logic:**
  - **Automatic Generation:**
    - The POST /generations endpoint accepts a large block of text and uses AI to generate multiple flashcards, splitting the source text into digestible parts.
    - Generation records track metadata such as `generated_count` and accepted flashcards counts.
    - Any errors during generation are automatically logged to the `generation_error_logs` table with details including user_id, error specifics, and timestamp.
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
