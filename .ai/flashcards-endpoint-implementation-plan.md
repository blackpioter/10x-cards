# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia pojedynczych lub wielu fiszek (flashcards). Po uwierzytelnieniu użytkownika endpoint umożliwia zapisanie nowej fiszki lub zestawu fiszek w bazie danych, opcjonalnie powiązanych z istniejącą generacją. Operacja ta wspiera walidację danych, autoryzację oraz transakcje, aby zapewnić spójność danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **URL:** /flashcards
- **Parametry i Request Body:**
  - **Pojedyncza fiszka:**
    - Wymagane:
      - `front`: string (maksymalnie 200 znaków)
      - `back`: string (maksymalnie 500 znaków)
      - `source`: wartość spośród: `manual`, `ai-full`, lub `ai-edited`
    - Opcjonalne:
      - `generation_id`: UUID (jeśli podane, musi być prawidłowe i referencyjne do istniejącej generacji)
  - **Wiele fiszek:**
    - Wymagana właściwość `flashcards`: tablica obiektów, gdzie każdy obiekt zawiera klucze takie jak w przypadku pojedynczej fiszki.

## 3. Wykorzystywane typy
- `FlashcardDto` – DTO zwracana przez API dla utworzonej fiszki.
- `FlashcardCreateDto` – DTO reprezentująca dane pojedynczej fiszki otrzymanej w żądaniu.
- `FlashcardCreateCommand` – Komenda umożliwiająca przesłanie jednego lub wielu obiektów fiszki.

## 4. Szczegóły odpowiedzi
- **Pojedyncza fiszka:**
  - **Status:** 201 Created
  - **Treść odpowiedzi:** Obiekt fiszki zawierający pola: `id`, `user_id`, `generation_id`, `front`, `back`, `source`, `created_at`, `last_reviewed`, `next_review_date`, `review_count`, `easiness_factor`, `interval`.
- **Wiele fiszek:**
  - **Status:** 201 Created
  - **Treść odpowiedzi:** Tablica obiektów fiszki zgodnych z powyższą strukturą.

## 5. Przepływ danych
1. Odebranie żądania POST na endpoint `/flashcards`.
2. Walidacja danych wejściowych przy użyciu narzędzia takiego jak Zod:
   - Sprawdzenie długości `front` (max 200 znaków) i `back` (max 500 znaków).
   - Weryfikacja poprawności `source` oraz opcjonalnego `generation_id`.
3. Autoryzacja użytkownika poprzez weryfikację tokenu (Supabase Auth lub odpowiedni mechanizm).
4. Przekazanie zweryfikowanych danych do warstwy serwisowej (np. `flashcards.service` w katalogu `src/lib/`), gdzie następuje:
   - Obsługa logiki biznesowej oraz ewentualna walidacja referencji (np. istnienie `generation_id`).
   - Wykonanie operacji INSERT w bazie danych z wykorzystaniem transakcji dla spójności.
5. Zwrócenie odpowiedzi zawierającej dane utworzonej(-ych) fiszki(-ek).

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Upewnienie się, że użytkownik jest uwierzytelniony przed przetwarzaniem żądania.
- **Walidacja danych:** Użycie Zod lub innego mechanizmu walidacji do sprawdzenia poprawności danych wejściowych.
- **Spójność danych:** Weryfikacja istnienia `generation_id` oraz zapewnienie, że operacje bazy danych są wykonywane w obrębie transakcji.
- **Bezpieczeństwo bazy danych:** Zapobieganie SQL injection i innym atakom poprzez użycie odpowiednich mechanizmów ORM/SDK (Supabase Client).

## 7. Obsługa błędów
- **400 Bad Request:** Zwracane, gdy dane wejściowe nie spełniają wymagań walidacyjnych (np. przekroczenie limitu znaków, nieprawidłowy format UUID).
- **404 Not Found:** Zwracane, gdy podane `generation_id` nie istnieje w bazie.
- **500 Internal Server Error:** Zwracane w przypadku nieoczekiwanych błędów serwera (np. problem z bazą danych). Dodatkowo, błędy mogą być logowane przy użyciu mechanizmu logowania oraz opcjonalnie zapisywane w tabeli `generation_error_logs` (jeśli dotyczy operacji generacji).

## 8. Rozważania dotyczące wydajności
- **Transakcje zbiorcze:** W przypadku wprowadzania wielu fiszek, użycie transakcji i operacji bulk insert w celu zmniejszenia liczby wywołań do bazy.
- **Optymalizacja walidacji:** Walidacja danych przed przekazaniem ich do bazy danych, aby ograniczyć obciążenie serwera.
- **Indeksowanie:** Upewnienie się, że kolumny takie jak `user_id` i `generation_id` są odpowiednio indeksowane, co usprawni wyszukiwanie i operacje JOIN.

## 9. Etapy wdrożenia
1. **Projektowanie API:** Określenie szczegółowych wymagań i przygotowanie specyfikacji endpointu.
2. **Implementacja walidacji:** Stworzenie schematów walidacyjnych (np. przy użyciu Zod) dla pojedynczej i wielu fiszek.
3. **Warstwa serwisowa:** Implementacja logiki biznesowej w serwisie, np. `flashcards.service`, w katalogu `src/lib/`.
4. **Integracja z bazą danych:** Wdrożenie operacji INSERT (z użyciem Supabase Client) wraz z transakcjami.
5. **Autoryzacja:** Integracja endpointu z mechanizmem autoryzacji (Supabase Auth), aby upewnić się, że operacje są wykonywane przez zalogowanego użytkownika.
6. **Obsługa błędów i logika fallback:** Implementacja mechanizmów obsługi błędów oraz logowania problemów.
7. **Testy manualne i review kodu:** Przegląd wdrożonego kodu oraz testy na środowisku testowym.
