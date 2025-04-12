# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Endpoint umożliwia automatyczne generowanie propozycji fiszek na podstawie dostarczonego tekstu. Wygenerowane propozycje są tymczasowe i wymagają ręcznej walidacji przez użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /generations
- **Parametry:**
  - **Wymagane:**
    - `source_text` (string, długość 1000-10000 znaków)
  - **Opcjonalne:** brak
- **Request Body:**
```json
{
  "source_text": "Detailed description or text content provided by the user..."
}
```

## 3. Wykorzystywane typy
- **DTO i Command Modele:**
  - `GenerateFlashcardsCommand` (dla wejściowego źródła tekstu)
  - `GenerationCreateResponseDto` (dla odpowiedzi zawierającej generację oraz propozycje fiszek)
  - `FlashcardProposalDto` (dla pojedynczych propozycji fiszek)

## 4. Szczegóły odpowiedzi
Odpowiedź to rekord generacji z metadanymi oraz listą propozycji fiszek:
- **Status 201 (Created)** dla pomyślnego utworzenia.
- **Przykładowa struktura odpowiedzi:**
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
    // ... kolejne propozycje
  ]
}
```

## 5. Przepływ danych
1. Klient wysyła żądanie POST z `source_text`.
2. Endpoint weryfikuje poprawność długości `source_text` przy użyciu walidacji (np. Zod).
3. Po walidacji wywoływana jest logika generowania fiszek umieszczona w osobnej usłudze (`src/lib/services/flashcardGenerationService.ts`).
4. Wyniki generacji są zapisywane w tabeli `generations` wraz z odpowiednimi metadanymi.
5. Propozycje fiszek (tymczasowe) są zapisywane w tabeli `flashcards` z ustawionym statusem `pending`.
6. W przypadku wystąpienia błędu podczas generacji, zapisywany jest wpis w tabeli `generation_error_logs`.
7. Odpowiedź zawiera rekord generacji wraz z propozycjami fiszek.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpoint wymaga autoryzacji – użytkownik musi być zalogowany (sprawdzenie za pomocą Supabase Auth i kontekstu `locals`).
- **Walidacja danych:** Użycie Zod do walidacji wejściowego `source_text`.
- **Bezpieczeństwo bazy danych:** Ograniczenie dostępu do operacji zapisu tylko dla autoryzowanych użytkowników.
- **Bezpieczeństwo transmisji:** Wymuszenie HTTPS i odpowiednie zarządzanie nagłówkami bezpieczeństwa.

## 7. Obsługa błędów
- **400 Bad Request:** Gdy `source_text` nie spełnia warunków długości (poniżej 1000 lub powyżej 10000 znaków).
- **500 Internal Server Error:** W przypadku błędu podczas generacji fiszek – błąd zostanie zalogowany w tabeli `generation_error_logs`.
- Inne kody: 401 (nieautoryzowany), 404 (zasób nie znaleziony).

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań:** Zapewnienie efektywnego dostępu do bazy danych dla operacji zapisu.
- **Asynchroniczność:** Rozważenie asynchronicznego przetwarzania generacji dla dużych żądań.
- **Caching i throttling:** Monitorowanie obciążenia generacji AI i zabezpieczenie przed nadużyciem zasobów.

## 9. Etapy wdrożenia
1. **Projektowanie endpointu:** Utworzenie pliku API np. `src/pages/api/generations.ts` z metodą POST.
2. **Walidacja wejścia:** Implementacja weryfikacji żądania przy użyciu Zod.
3. **Wyodrębnienie logiki generacji:** Refaktoryzacja logiki generacji fiszek do osobnej usługi w `src/lib/services/`.
4. **Interakcja z bazą danych:** Implementacja operacji zapisu w tabelach `generations`, `flashcards` oraz `generation_error_logs`.
5. **Zabezpieczenia:** Dodanie uwierzytelniania przy użyciu Supabase Auth oraz walidacji danych.
6. **Obsługa błędów:** Implementacja mechanizmu obsługi błędów z odpowiednimi kodami statusu.
7. **Testowanie:** Utworzenie testów jednostkowych oraz integracyjnych dla endpointu.
8. **Code review i wdrożenie:** Przeprowadzenie przeglądu kodu oraz wdrożenie do środowiska testowego.
