# Plan implementacji widoku listy fiszek (`/flashcards`)

## 1. Przegląd
Widok `/flashcards` jest centralnym miejscem aplikacji, gdzie użytkownik może przeglądać, filtrować i zarządzać swoimi fiszkami. Umożliwia wyświetlanie fiszek w podziale na strony, filtrowanie według statusu (oczekujące, zaakceptowane, odrzucone), edycję treści oraz zmianę statusu poszczególnych fiszek. Widok prezentuje również podstawowe statystyki dotyczące kolekcji fiszek użytkownika.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/flashcards`. Implementacja będzie polegać na stworzeniu pliku `src/pages/flashcards.astro`.

## 3. Struktura komponentów
Hierarchia komponentów dla widoku `/flashcards`:

```
src/pages/flashcards.astro             # Główna strona Astro
└── src/components/FlashcardsView.tsx  # Główny komponent React zarządzający stanem
    ├── src/components/FlashcardStats.tsx      # Komponent wyświetlający statystyki
    ├── src/components/FlashcardFilters.tsx    # Komponent filtrów statusu
    ├── src/components/FlashcardList.tsx       # Komponent listy fiszek
    │   └── src/components/FlashcardListItem.tsx # Komponent pojedynczej fiszki (renderowany * n)
    │       └── (Opcjonalnie) src/components/FlashcardEditModal.tsx # Modal edycji fiszki
    │       └── (Opcjonalnie) src/components/ui/ConfirmDialog.tsx    # Modal potwierdzenia (np. usunięcia)
    └── src/components/ui/Pagination.tsx        # Komponent kontrolek paginacji (Shadcn)
```

## 4. Szczegóły komponentów

### `FlashcardsPage` (`src/pages/flashcards.astro`)
- **Opis:** Główny plik strony Astro dla ścieżki `/flashcards`. Definiuje layout strony i renderuje główny komponent React (`FlashcardsView`), przekazując mu ewentualne dane inicjalne (jeśli renderowanie serwerowe będzie częściowo wykorzystane) lub delegując całą logikę pobierania danych na stronę klienta.
- **Główne elementy:** Komponent `Layout`, komponent `<FlashcardsView client:load />`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów dla tego pliku.
- **Propsy:** Brak.

### `FlashcardsView` (`src/components/FlashcardsView.tsx`)
- **Opis:** Główny, kliencki komponent React. Zarządza stanem całego widoku: pobiera listę fiszek z API, obsługuje filtrowanie, paginację, stan ładowania, błędy oraz koordynuje akcje edycji, zmiany statusu i usuwania fiszek inicjowane w komponentach podrzędnych. Wykorzystuje potencjalnie hook `useFlashcards`.
- **Główne elementy:** `FlashcardStats`, `FlashcardFilters`, `FlashcardList`, `Pagination`. Komponenty UI z Shadcn do budowy layoutu i obsługi błędów/ładowania (np. `Spinner`, `Alert`).
- **Obsługiwane interakcje:** Reaguje na zmiany filtrów (`handleFilterChange`), zmiany strony (`handlePageChange`), żądania edycji (`handleEditRequest`), zapis edycji (`handleSaveEdit`), żądania usunięcia (`handleDeleteRequest`), potwierdzenie usunięcia (`handleConfirmDelete`), zmianę statusu (`handleStatusChange`).
- **Obsługiwana walidacja:** Sprawdza poprawność parametrów paginacji przed wywołaniem API.
- **Typy:** `FlashcardViewModel`, `PaginationDto`, `FlashcardStatus`, `FlashcardStatsViewModel`, `FlashcardListResponseDto` (dla odpowiedzi API).
- **Propsy:** Brak (pobiera dane samodzielnie).

### `FlashcardStats` (`src/components/FlashcardStats.tsx`)
- **Opis:** Wyświetla kluczowe statystyki dotyczące fiszek użytkownika, takie jak łączna liczba fiszek w bieżącym widoku (z uwzględnieniem filtrów) oraz liczba fiszek oczekujących na przegląd (`pending`).
- **Główne elementy:** Elementy tekstowe (`<p>`, `<span>`) opakowane w kontener (`<div>`). Wykorzystuje komponenty Shadcn (np. `Card`) do stylizacji.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardStatsViewModel`.
- **Propsy:** `stats: FlashcardStatsViewModel`.

### `FlashcardFilters` (`src/components/FlashcardFilters.tsx`)
- **Opis:** Renderuje kontrolki umożliwiające filtrowanie listy fiszek według statusu (np. Wszystkie, Oczekujące, Zaakceptowane, Odrzucone).
- **Główne elementy:** Grupa przycisków (`Button` z Shadcn) lub `Select` z opcjami statusów.
- **Obsługiwane interakcje:** Kliknięcie przycisku filtra/wybranie opcji z listy wywołuje `onFilterChange`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardStatus`.
- **Propsy:** `currentFilter: FlashcardStatus | 'all'`, `onFilterChange: (filter: FlashcardStatus | 'all') => void`.

### `FlashcardList` (`src/components/FlashcardList.tsx`)
- **Opis:** Renderuje listę komponentów `FlashcardListItem` na podstawie przekazanej tablicy fiszek. Odpowiada za iterację i przekazanie danych oraz callbacków do poszczególnych elementów listy.
- **Główne elementy:** Kontener listy (`<div>` lub `<ul>`), mapowanie tablicy `flashcards` na komponenty `FlashcardListItem`.
- **Obsługiwane interakcje:** Deleguje zdarzenia `onStatusChange`, `onEdit`, `onDelete` z `FlashcardListItem` do `FlashcardsView`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardViewModel`.
- **Propsy:** `flashcards: FlashcardViewModel[]`, `onStatusChange: (id: string, newStatus: FlashcardStatus) => void`, `onEdit: (flashcard: FlashcardViewModel) => void`, `onDelete: (id: string) => void`.

### `FlashcardListItem` (`src/components/FlashcardListItem.tsx`)
- **Opis:** Wyświetla dane pojedynczej fiszki: przód, tył, status oraz przyciski akcji (Edytuj, Usuń, oraz Zmień Status - np. Akceptuj/Odrzuć, jeśli status to `pending`). Może obsługiwać edycję inline lub inicjować otwarcie modala edycji.
- **Główne elementy:** Komponenty Shadcn (`Card`, `CardHeader`, `CardContent`, `CardFooter`, `Button`, `Badge`). Elementy tekstowe do wyświetlania `front` i `back`. Warunkowo renderowane przyciski akcji w zależności od statusu fiszki.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Edytuj" (`onEdit`), "Usuń" (`onDelete`), "Akceptuj" (`onStatusChange` ze statusem `accepted`), "Odrzuć" (`onStatusChange` ze statusem `rejected`). Obsługa edycji inline (jeśli zaimplementowana).
- **Obsługiwana walidacja:** W przypadku edycji inline: walidacja długości `front` (max 200) i `back` (max 500) przed zapisem.
- **Typy:** `FlashcardViewModel`, `FlashcardStatus`.
- **Propsy:** `flashcard: FlashcardViewModel`, `onStatusChange: (id: string, newStatus: FlashcardStatus) => void`, `onEdit: (flashcard: FlashcardViewModel) => void`, `onDelete: (id: string) => void`.

### `PaginationControls` (`src/components/ui/Pagination.tsx` - Komponent Shadcn)
- **Opis:** Wyświetla standardowe kontrolki paginacji (Poprzednia, Następna, numery stron) na podstawie danych paginacji. Używa gotowego komponentu `Pagination` z Shadcn/ui.
- **Główne elementy:** Komponenty z biblioteki Shadcn/ui (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationLink`, `PaginationNext`, `PaginationEllipsis`).
- **Obsługiwane interakcje:** Kliknięcie na numer strony lub przyciski nawigacyjne wywołuje `onPageChange`.
- **Obsługiwana walidacja:** Brak (logika walidacji w `FlashcardsView`).
- **Typy:** `PaginationDto`.
- **Propsy:** `pagination: PaginationDto`, `onPageChange: (page: number) => void`.

### `FlashcardEditModal` (`src/components/FlashcardEditModal.tsx`)
- **Opis:** Opcjonalny komponent modalny (dialog) do edycji treści fiszki (`front` i `back`). Uruchamiany z poziomu `FlashcardListItem`.
- **Główne elementy:** Komponent `Dialog` z Shadcn/ui, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`. Pola formularza (`Input`, `Textarea` z Shadcn) dla `front` i `back`. Przyciski "Zapisz" i "Anuluj". Wyświetlanie liczników znaków i komunikatów walidacyjnych.
- **Obsługiwane interakcje:** Edycja pól `front` i `back`. Kliknięcie "Zapisz" (`onSave`), kliknięcie "Anuluj" (`onCancel`).
- **Obsługiwana walidacja:**
    - `front`: Wymagane, maksymalnie 200 znaków.
    - `back`: Wymagane, maksymalnie 500 znaków.
    - Przycisk "Zapisz" jest aktywny tylko gdy dane są poprawne. Komunikaty walidacyjne są wyświetlane przy polach.
- **Typy:** `FlashcardViewModel`.
- **Propsy:** `flashcard: FlashcardViewModel | null`, `isOpen: boolean`, `onSave: (id: string, front: string, back: string) => void`, `onCancel: () => void`.

### `ConfirmDialog` (`src/components/ui/AlertDialog.tsx` - Komponent Shadcn)
- **Opis:** Generyczny modal potwierdzenia akcji, np. usunięcia fiszki. Używa gotowego komponentu `AlertDialog` z Shadcn/ui.
- **Główne elementy:** Komponenty `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- **Obsługiwane interakcje:** Kliknięcie przycisku potwierdzającego (`onConfirm`), kliknięcie przycisku anulującego (`onCancel`).
- **Obsługiwana walidacja:** Brak.
- **Propsy:** `isOpen: boolean`, `title: string`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`.

## 5. Typy

Kluczowe typy danych używane w widoku:

```typescript
// Nowy typ/enum dla statusu fiszki
export type FlashcardStatus = "pending" | "accepted" | "rejected";

// Istniejący DTO fiszki (zakładamy, że API zwraca status lub da się go wywnioskować)
// (Zdefiniowany w src/types.ts, potencjalnie rozszerzony o status)
export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at" | "review_count" | "next_review_date" // Potrzebne pola do ew. wnioskowania statusu
> & { status: FlashcardStatus }; // Dodajemy status dla spójności w frontendzie

// Istniejący DTO odpowiedzi listy fiszek (z src/types.ts)
export interface FlashcardListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

// Istniejący DTO paginacji (z src/types.ts)
export interface PaginationDto {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Nowy ViewModel dla pojedynczej fiszki w widoku listy
export interface FlashcardViewModel extends FlashcardDto {
  // Dziedziczy pola z FlashcardDto (id, front, back, source, status, etc.)
  isEditing?: boolean;   // Flaga dla stanu edycji inline (jeśli używane)
  isSaving?: boolean;    // Flaga dla stanu operacji asynchronicznej (update/delete)
  errorMessage?: string; // Do wyświetlania błędów specyficznych dla elementu
}

// Nowy ViewModel dla statystyk
export interface FlashcardStatsViewModel {
  currentListTotal: number; // Liczba fiszek w bieżącym (przefiltrowanym) widoku (z pagination.total)
  pendingReviewCount: number; // Całkowita liczba fiszek oczekujących (pobrana osobno)
}

// Istniejący DTO do aktualizacji fiszki (z src/types.ts)
// Zakładamy, że API (PATCH /flashcards/:id) zostanie dostosowane do przyjmowania statusu
export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: FlashcardSource;
  status: FlashcardStatus; // Dodajemy możliwość aktualizacji statusu
}>;

```
*(Uwaga: Konieczne jest potwierdzenie z zespołem backendowym, czy `GET /flashcards` zwraca status oraz czy `PATCH /flashcards/:id` pozwala na aktualizację statusu. Plan zakłada, że tak.)*

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany w głównym komponencie `FlashcardsView` przy użyciu hooków React (`useState`, `useEffect`). Rozważone zostanie stworzenie customowego hooka `useFlashcards` w celu enkapsulacji logiki pobierania danych, obsługi filtrów, paginacji, stanu ładowania, błędów oraz funkcji mutujących stan (aktualizacja, usuwanie).

**Stan zarządzany w `FlashcardsView` (lub `useFlashcards`):**
- `flashcards: FlashcardViewModel[]`: Aktualnie wyświetlana lista fiszek.
- `pagination: PaginationDto`: Informacje o bieżącej stronie i całkowitej liczbie elementów/stron.
- `statusFilter: FlashcardStatus | 'all'`: Wybrany filtr statusu.
- `isLoading: boolean`: Wskaźnik ładowania danych.
- `error: string | null`: Komunikat błędu dla całego widoku.
- `stats: FlashcardStatsViewModel`: Obiekt ze statystykami.
- `editingFlashcard: FlashcardViewModel | null`: Fiszka aktualnie edytowana w modalu (jeśli używany).
- `confirmDeleteId: string | null`: ID fiszki, której usunięcie oczekuje na potwierdzenie.

**Custom Hook `useFlashcards` (propozycja):**
- Zwraca: `{ flashcards, pagination, stats, isLoading, error, filterByStatus, goToPage, updateFlashcardContent, updateFlashcardStatus, deleteFlashcard, reloadData }`.
- Wewnętrznie zarządza stanem i wywołaniami API.

## 7. Integracja API
Widok będzie komunikował się z następującymi endpointami API:

- **`GET /api/flashcards`**
  - **Cel:** Pobranie listy fiszek z uwzględnieniem filtrów i paginacji.
  - **Wywołanie:** Przy montowaniu komponentu, zmianie filtra statusu, zmianie strony.
  - **Parametry:** `?status={statusFilter}&page={page}&page_size={pageSize}`.
  - **Typ odpowiedzi:** `FlashcardListResponseDto`.
  - **Akcja FE:** Aktualizacja stanu `flashcards` i `pagination`, `isLoading`, `error`, `stats.currentListTotal`.

- **`GET /api/flashcards?status=pending&page_size=1`** (lub dedykowany endpoint statystyk)
  - **Cel:** Pobranie liczby fiszek oczekujących na przegląd.
  - **Wywołanie:** Przy montowaniu komponentu (raz).
  - **Typ odpowiedzi:** `FlashcardListResponseDto` (interesuje nas `pagination.total`).
  - **Akcja FE:** Aktualizacja stanu `stats.pendingReviewCount`.

- **`PATCH /api/flashcards/:id`**
  - **Cel:** Aktualizacja treści (`front`, `back`) lub statusu (`status`) fiszki.
  - **Wywołanie:** Po zapisaniu zmian w modalu edycji lub kliknięciu przycisku Akceptuj/Odrzuć.
  - **Typ żądania:** `FlashcardUpdateDto` (np. `{ front: "...", back: "..." }` lub `{ status: "accepted" }`).
  - **Typ odpowiedzi:** Zaktualizowany `FlashcardDto`.
  - **Akcja FE:** Aktualizacja odpowiedniego `FlashcardViewModel` w stanie `flashcards`. Wyświetlenie wskaźnika zapisywania (`isSaving`). Obsługa błędów. Opcjonalne przeładowanie danych (`reloadData`), jeśli zmiana statusu wpływa na widoczność w bieżącym filtrze.

- **`DELETE /api/flashcards/:id`**
  - **Cel:** Usunięcie fiszki.
  - **Wywołanie:** Po potwierdzeniu usunięcia w `ConfirmDialog`.
  - **Typ odpowiedzi:** `{ message: "..." }`.
  - **Akcja FE:** Usunięcie odpowiedniego `FlashcardViewModel` ze stanu `flashcards`. Wyświetlenie wskaźnika usuwania (`isSaving`). Obsługa błędów. Aktualizacja paginacji/statystyk lub przeładowanie danych (`reloadData`).

## 8. Interakcje użytkownika
- **Filtrowanie:** Użytkownik klika przycisk statusu (np. "Oczekujące") w `FlashcardFilters`. Wywoływane jest `onFilterChange`, co aktualizuje stan `statusFilter` w `FlashcardsView` i triggeruje ponowne pobranie danych z API z nowym parametrem `status`.
- **Paginacja:** Użytkownik klika numer strony lub przycisk "Następna"/"Poprzednia" w `PaginationControls`. Wywoływane jest `onPageChange`, co aktualizuje stan `pagination.page` w `FlashcardsView` i triggeruje ponowne pobranie danych z API z nowym parametrem `page`.
- **Edycja fiszki:**
  1. Użytkownik klika przycisk "Edytuj" na `FlashcardListItem`.
  2. Wywoływane jest `onEdit`.
  3. `FlashcardsView` ustawia stan `editingFlashcard` i otwiera `FlashcardEditModal`.
  4. Użytkownik modyfikuje `front` i `back` w modalu. Walidacja jest aktywna.
  5. Użytkownik klika "Zapisz". Wywoływane jest `onSave` z modala.
  6. `FlashcardsView` wywołuje `PATCH /api/flashcards/:id` z nowymi danymi.
  7. Po sukcesie API, modal jest zamykany, stan `flashcards` jest aktualizowany. W razie błędu, wyświetlany jest komunikat w modalu lub jako toast.
- **Usuwanie fiszki:**
  1. Użytkownik klika przycisk "Usuń" na `FlashcardListItem`.
  2. Wywoływane jest `onDelete`.
  3. `FlashcardsView` ustawia stan `confirmDeleteId` i otwiera `ConfirmDialog`.
  4. Użytkownik klika "Potwierdź" w dialogu. Wywoływane jest `onConfirm`.
  5. `FlashcardsView` wywołuje `DELETE /api/flashcards/:id`.
  6. Po sukcesie API, dialog jest zamykany, stan `flashcards` jest aktualizowany (usunięcie elementu). W razie błędu, wyświetlany jest komunikat.
- **Zmiana statusu (Akceptuj/Odrzuć):**
  1. Użytkownik klika "Akceptuj" lub "Odrzuć" na `FlashcardListItem` ze statusem `pending`.
  2. Wywoływane jest `onStatusChange` z odpowiednim nowym statusem (`accepted` lub `rejected`).
  3. `FlashcardsView` wywołuje `PATCH /api/flashcards/:id` z `{ status: newStatus }`.
  4. Po sukcesie API, stan `flashcards` jest aktualizowany (zmiana statusu). Jeśli aktywny jest filtr statusu, fiszka może zniknąć z listy. W razie błędu, wyświetlany jest komunikat.

## 9. Warunki i walidacja
- **Formularz edycji (`FlashcardEditModal` lub edycja inline):**
  - `front`: Wymagane. Maksymalna długość: 200 znaków.
  - `back`: Wymagane. Maksymalna długość: 500 znaków.
  - **Obsługa:** Walidacja na bieżąco (`onChange`, `onBlur`). Wyświetlanie komunikatów o błędach przy polach. Dezaktywacja przycisku "Zapisz", jeśli formularz jest niepoprawny.
- **Parametry API:**
  - `page`, `page_size`: Muszą być dodatnimi liczbami całkowitymi (zapewnione przez logikę paginacji).
  - `status`: Musi być jednym z `pending`, `accepted`, `rejected` lub brak (dla "wszystkie") - zapewnione przez `FlashcardFilters`.
- **Logika statusów:** Przyciski "Akceptuj"/"Odrzuć" powinny być widoczne i aktywne tylko dla fiszek ze statusem `pending`.

## 10. Obsługa błędów
- **Błędy pobierania danych (`GET /flashcards`):** W `FlashcardsView` wyświetlany jest ogólny komunikat błędu (np. "Nie udało się załadować fiszek. Spróbuj ponownie.") zamiast listy. Można dodać przycisk "Spróbuj ponownie".
- **Błędy zapisu/aktualizacji (`PATCH /flashcards/:id`):**
  - W modalu edycji: Wyświetlenie komunikatu błędu wewnątrz modala, utrzymanie modala otwartego.
  - Przy zmianie statusu: Wyświetlenie komunikatu błędu przy konkretnym `FlashcardListItem` (np. w `errorMessage` w `FlashcardViewModel`) lub jako globalny toast/alert. Stan `isSaving` jest resetowany.
- **Błędy usuwania (`DELETE /flashcards/:id`):** Wyświetlenie komunikatu błędu przy konkretnym `FlashcardListItem` lub jako globalny toast/alert. Stan `isSaving` jest resetowany. Dialog potwierdzenia jest zamykany.
- **Błędy walidacji:** Obsługiwane bezpośrednio w formularzu edycji (komunikaty przy polach, blokada zapisu).

## 11. Kroki implementacji
1.  **Utworzenie plików:** Stworzenie plików strony i komponentów zgodnie ze strukturą w punkcie 3 (`flashcards.astro`, `FlashcardsView.tsx`, `FlashcardList.tsx`, `FlashcardListItem.tsx`, `FlashcardFilters.tsx`, `FlashcardStats.tsx`, `FlashcardEditModal.tsx`).
2.  **Podstawowy layout `FlashcardsView`:** Implementacja struktury widoku w `FlashcardsView.tsx` z użyciem komponentów Shadcn/ui, wstawienie placeholderów dla dynamicznej zawartości.
3.  **Integracja API (GET):** Implementacja logiki pobierania danych w `FlashcardsView` (lub `useFlashcards`) dla `GET /flashcards`, obsługa stanu ładowania i błędów. Pobranie i wyświetlenie statystyk (`FlashcardStats`).
4.  **Implementacja `FlashcardList` i `FlashcardListItem`:** Wyświetlanie listy fiszek na podstawie danych z API. Wyświetlenie `front`, `back`, `status` (jako `Badge`). Dodanie przycisków Akcji (na razie bez logiki).
5.  **Implementacja paginacji:** Dodanie komponentu `PaginationControls` (Shadcn), podłączenie go do stanu i logiki pobierania danych (zmiana `page`).
6.  **Implementacja filtrowania:** Dodanie komponentu `FlashcardFilters`, podłączenie go do stanu i logiki pobierania danych (zmiana `status`).
7.  **Implementacja usuwania:**
    - Dodanie logiki do przycisku "Usuń" w `FlashcardListItem` (`onDelete`).
    - Implementacja `ConfirmDialog` (Shadcn `AlertDialog`).
    - Podłączenie logiki w `FlashcardsView` do otwierania dialogu i wywołania `DELETE /api/flashcards/:id` po potwierdzeniu.
    - Aktualizacja stanu listy po pomyślnym usunięciu.
8.  **Implementacja edycji:**
    - Dodanie logiki do przycisku "Edytuj" w `FlashcardListItem` (`onEdit`).
    - Implementacja `FlashcardEditModal` z formularzem i walidacją (pola `front`, `back`, liczniki znaków).
    - Podłączenie logiki w `FlashcardsView` do otwierania modala, przekazywania danych fiszki i wywołania `PATCH /api/flashcards/:id` po zapisaniu.
    - Aktualizacja stanu listy po pomyślnej edycji.
9.  **Implementacja zmiany statusu:**
    - Dodanie przycisków "Akceptuj"/"Odrzuć" (warunkowo dla `pending`) w `FlashcardListItem`.
    - Podłączenie logiki `onStatusChange`.
    - Implementacja wywołania `PATCH /api/flashcards/:id` w `FlashcardsView` ze zmianą statusu.
    - Aktualizacja stanu listy (zmiana statusu, potencjalne ukrycie elementu przy aktywnym filtrze).
10. **Styling i dopracowanie:** Dopracowanie wyglądu z użyciem Tailwind i Shadcn/ui, zapewnienie responsywności.
11. **Testowanie:** Przetestowanie wszystkich interakcji, obsługi błędów i przypadków brzegowych.
12. **Refaktoryzacja (opcjonalnie):** Wydzielenie logiki do customowego hooka `useFlashcards`, jeśli uzasadnione.
