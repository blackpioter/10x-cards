# API Endpoint Implementation Plan: Flashcards API

## 1. Przegląd punktów końcowych
Zestaw endpointów REST API do zarządzania fiszkami (flashcards). Obejmuje operacje CRUD oraz specjalne endpointy do obsługi statusów i przeglądów. Wszystkie endpointy wymagają uwierzytelnienia użytkownika poprzez Supabase Auth i zapewniają odpowiednią walidację danych wejściowych oraz obsługę błędów.

## 2. Szczegóły żądań

### 2.1. GET /flashcards
- **Metoda:** GET
- **Parametry URL:**
  - `status` (opcjonalny): pending, accepted, rejected
  - `sort_by` (opcjonalny): created_at, review_count
  - `page` (wymagany): liczba całkowita > 0
  - `page_size` (wymagany): liczba całkowita 10-100
- **Nagłówki:** Authorization Bearer Token

### 2.2. POST /flashcards
- **Metoda:** POST
- **Content-Type:** application/json
- **Body:** FlashcardCreateCommand (pojedyncza fiszka lub tablica)
- **Nagłówki:** Authorization Bearer Token

### 2.3. PATCH /flashcards/:id
- **Metoda:** PATCH
- **Parametry URL:** id (UUID)
- **Content-Type:** application/json
- **Body:** FlashcardUpdateDto
- **Nagłówki:** Authorization Bearer Token

### 2.4. DELETE /flashcards/:id
- **Metoda:** DELETE
- **Parametry URL:** id (UUID)
- **Nagłówki:** Authorization Bearer Token

### 2.5. GET /flashcards/review
- **Metoda:** GET
- **Parametry URL:**
  - `status` (opcjonalny, domyślnie "pending")
- **Nagłówki:** Authorization Bearer Token

## 3. Wykorzystywane typy

### 3.1. Data Transfer Objects (DTOs)
```typescript
interface FlashcardListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

interface FlashcardFilterParams {
  status?: 'pending' | 'accepted' | 'rejected';
  sort_by?: string;
  page: number;
  page_size: number;
}

interface FlashcardReviewDto {
  id: string;
  front: string;
  back: string;
  review_count: number;
  next_review_date: string | null;
}
```

### 3.2. Command Models
```typescript
interface FlashcardUpdateCommand {
  front?: string;
  back?: string;
  source?: FlashcardSource;
}
```

## 4. Przepływ danych

### 4.1. Pobieranie listy fiszek
1. Walidacja parametrów zapytania (page, page_size, sort_by)
2. Autoryzacja użytkownika (Supabase Auth)
3. Przekazanie parametrów do FlashcardsService
4. Pobranie danych z bazy z uwzględnieniem filtrów i paginacji
5. Transformacja do FlashcardListResponseDto
6. Zwrócenie odpowiedzi

### 4.2. Tworzenie fiszek
1. Walidacja body requestu (Zod schema)
2. Autoryzacja użytkownika
3. Walidacja biznesowa (np. istnienie generation_id)
4. Utworzenie fiszek w transakcji
5. Zwrócenie utworzonych obiektów

### 4.3. Aktualizacja fiszki
1. Walidacja parametrów i body
2. Autoryzacja i weryfikacja właściciela
3. Aktualizacja w bazie danych
4. Zwrócenie zaktualizowanego obiektu

### 4.4. Usuwanie fiszki
1. Walidacja ID
2. Autoryzacja i weryfikacja właściciela
3. Usunięcie z bazy danych
4. Zwrócenie potwierdzenia

### 4.5. Pobieranie fiszek do przeglądu
1. Walidacja parametrów
2. Autoryzacja użytkownika
3. Pobranie fiszek z uwzględnieniem algorytmu powtórek
4. Transformacja do FlashcardReviewDto
5. Zwrócenie listy

## 5. Względy bezpieczeństwa

### 5.1. Uwierzytelnianie i Autoryzacja
- Wykorzystanie Supabase Auth do uwierzytelniania
- Weryfikacja tokenu JWT w middleware
- Sprawdzanie właściciela zasobu przy operacjach modyfikacji
- Row Level Security (RLS) w bazie danych

### 5.2. Walidacja danych
- Sanityzacja wszystkich danych wejściowych
- Walidacja typów i zakresów wartości
- Ograniczenie długości pól tekstowych
- Walidacja UUID i referencji

### 5.3. Zabezpieczenia bazy danych
- Prepared statements dla wszystkich zapytań
- Transakcje dla operacji złożonych
- Indeksy dla często używanych kolumn
- Ograniczenia integralności danych

### 5.4. Rate Limiting
- Implementacja limitów zapytań per użytkownik
- Osobne limity dla różnych typów operacji
- Cache dla często pobieranych danych

## 6. Obsługa błędów

### 6.1. Kody HTTP
- 200: Sukces (GET, PATCH)
- 201: Utworzono zasób (POST)
- 400: Błędne dane wejściowe
- 401: Brak uwierzytelnienia
- 403: Brak uprawnień
- 404: Zasób nie znaleziony
- 429: Przekroczono limit zapytań
- 500: Błąd serwera

### 6.2. Struktura błędów
```typescript
interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]>;
  timestamp: string;
}
```

### 6.3. Logowanie błędów
- Wykorzystanie tabeli generation_error_logs
- Strukturyzowane logi dla debugowania
- Monitoring błędów krytycznych

## 7. Rozważania dotyczące wydajności

### 7.1. Optymalizacja bazy danych
- Indeksy dla kolumn używanych w filtrach i sortowaniu
- Partycjonowanie danych dla dużych zbiorów
- Optymalizacja zapytań przez EXPLAIN ANALYZE

### 7.2. Caching
- Cache dla często pobieranych fiszek
- Cache dla wyników paginacji
- Invalidacja cache przy modyfikacjach

### 7.3. Optymalizacja zapytań
- Eager loading powiązanych danych
- Limit pobieranych kolumn (SELECT)
- Bulk operations dla wielu operacji

## 8. Etapy wdrożenia

### 8.1. Przygotowanie
1. Aktualizacja schematów walidacji (Zod)
2. Rozszerzenie typów DTO i Command Models
3. Implementacja nowych metod w FlashcardsService

### 8.2. Implementacja endpointów
1. GET /flashcards z obsługą filtrów i paginacji
2. Rozszerzenie POST /flashcards o bulk operations
3. Implementacja PATCH /flashcards/:id
4. Implementacja DELETE /flashcards/:id
5. Implementacja GET /flashcards/review

### 8.3. Zabezpieczenia
1. Integracja z Supabase Auth
2. Implementacja middleware autoryzacji
3. Konfiguracja Rate Limitingu
4. Wdrożenie Row Level Security
