# Plan implementacji widoku generowania fiszek

## 1. Przegląd
Widok generowania fiszek umożliwia użytkownikom wklejenie tekstu źródłowego i automatyczne wygenerowanie zestawu fiszek przy użyciu AI. Użytkownicy mogą przeglądać, edytować, akceptować lub odrzucać wygenerowane propozycje fiszek przed ich ostatecznym zapisaniem.

## 2. Routing widoku
- Ścieżka: `/generate`
- Komponent strony: `src/pages/generate.astro`
- Komponent React: `src/components/GenerateView.tsx`

## 3. Struktura komponentów
```
GenerateView
├── TextInputSection
│   ├── TextArea (shadcn/ui)
│   └── CharacterCounter
├── GenerationProgress
│   └── LoadingIndicator
├── ErrorNotification
└── FlashcardReviewSection
    ├── FlashcardList
    │   ├── FlashcardListItem
    │   │   ├── FlashcardContent
    │   │   └── ActionButtons
    │   └── BulkActionButtons
    └── ReviewProgress
```

## 4. Szczegóły komponentów

### GenerateView
- Opis: Główny komponent widoku, zarządzający stanem generowania i przeglądu fiszek
- Główne elementy: Container, ErrorBoundary, TextInputSection/FlashcardReviewSection
- Obsługiwane interakcje: Przełączanie między trybami wprowadzania i przeglądu
- Typy: GenerateViewState
- Propsy: brak (komponent najwyższego poziomu)

### TextInputSection
- Opis: Sekcja wprowadzania tekstu źródłowego z walidacją
- Główne elementy: TextArea, CharacterCounter, Button
- Obsługiwane interakcje:
  - Wprowadzanie tekstu
  - Kliknięcie przycisku generowania
- Obsługiwana walidacja:
  - Minimalna długość tekstu: 1000 znaków
  - Maksymalna długość tekstu: 10000 znaków
- Typy: TextInputState
- Propsy:
  ```typescript
  interface TextInputSectionProps {
    onGenerate: (text: string) => void;
    isGenerating: boolean;
  }
  ```

### FlashcardReviewSection
- Opis: Sekcja przeglądania i oceny wygenerowanych fiszek
- Główne elementy: FlashcardList, ReviewProgress
- Obsługiwane interakcje:
  - Przejście do następnej/poprzedniej fiszki
  - Zapisanie wszystkich zaakceptowanych fiszek
- Typy: FlashcardReviewState
- Propsy:
  ```typescript
  interface FlashcardReviewSectionProps {
    flashcards: FlashcardProposalDto[];
    onComplete: (accepted: FlashcardDto[]) => void;
    generationId: string;
  }
  ```

### FlashcardList
- Opis: Komponent wyświetlający listę propozycji fiszek wraz z przyciskami akcji zbiorczych
- Główne elementy:
  - Lista FlashcardListItem
  - BulkActionButtons (Zaakceptuj wszystkie, Zapisz zaakceptowane)
- Obsługiwane interakcje:
  - Przewijanie listy
  - Akcje zbiorcze na wszystkich propozycjach
  - Filtrowanie widoku (wszystkie/zaakceptowane/odrzucone)
- Typy: FlashcardListState
- Propsy:
  ```typescript
  interface FlashcardListProps {
    proposals: FlashcardProposalViewModel[];
    onBulkAction: (action: BulkFlashcardAction) => void;
    onItemAction: (action: FlashcardAction) => void;
  }
  ```

### FlashcardListItem
- Opis: Komponent pojedynczej propozycji fiszki w liście
- Główne elementy:
  - FlashcardContent (przód i tył fiszki)
  - ActionButtons (akceptuj/odrzuć/edytuj)
  - Wskaźnik stanu (zaakceptowana/odrzucona/oczekująca)
  - Wskaźnik edycji (czy treść została zmieniona)
- Obsługiwane interakcje:
  - Edycja przodu/tyłu
  - Akceptacja/odrzucenie
  - Przełączanie trybu edycji
  - Przywracanie oryginalnej treści
- Obsługiwana walidacja:
  - Maksymalna długość przodu: 200 znaków
  - Maksymalna długość tyłu: 500 znaków
- Typy: FlashcardProposalViewModel, FlashcardAction
- Propsy:
  ```typescript
  interface FlashcardListItemProps {
    proposal: FlashcardProposalViewModel;
    onAction: (action: FlashcardAction) => void;
    isEditing: boolean;
  }
  ```

### GenerationProgress
- Opis: Komponent wyświetlający postęp generowania fiszek przez AI
- Główne elementy:
  - LoadingIndicator (animowany wskaźnik)
  - Komunikat o statusie
  - Licznik wygenerowanych fiszek (opcjonalnie)
- Obsługiwane interakcje:
  - Możliwość anulowania generowania (opcjonalnie)
- Typy: GenerationProgressState
- Propsy:
  ```typescript
  interface GenerationProgressProps {
    status: 'initializing' | 'generating' | 'finishing';
    progress?: {
      current: number;
      total?: number;
    };
    onCancel?: () => void;
  }
  ```

### ReviewProgress
- Opis: Komponent wyświetlający postęp przeglądu wygenerowanych fiszek
- Główne elementy:
  - Pasek postępu
  - Liczniki (np. "3 z 10 fiszek ocenionych")
  - Statystyki (zaakceptowane/odrzucone)
- Obsługiwane interakcje:
  - Kliknięcie w licznik może pokazać szczegółowe statystyki
- Typy: ReviewProgressState
- Propsy:
  ```typescript
  interface ReviewProgressProps {
    total: number;
    reviewed: number;
    stats: {
      accepted: number;
      rejected: number;
      edited: number;
    };
  }
  ```

### ErrorNotification
- Opis: Komponent wyświetlający komunikaty o błędach w formie toast/alert
- Główne elementy:
  - Alert (shadcn/ui)
  - Ikona błędu
  - Treść błędu
  - Przycisk zamknięcia
  - Przycisk akcji (opcjonalnie, np. "Spróbuj ponownie")
- Obsługiwane interakcje:
  - Zamknięcie powiadomienia
  - Wykonanie akcji naprawczej (jeśli dostępna)
  - Automatyczne znikanie po czasie (konfigurowalne)
- Typy błędów:
  - Błędy walidacji
  - Błędy API
  - Błędy sieci
  - Błędy generowania
- Propsy:
  ```typescript
  interface ErrorNotificationProps {
    error: {
      type: 'validation' | 'api' | 'network' | 'generation';
      message: string;
      code?: string;
      action?: {
        label: string;
        handler: () => void;
      };
    };
    autoHideDuration?: number;
    position?: 'top' | 'bottom';
    onClose: () => void;
  }
  ```

## 5. Typy
```typescript
// View Models
interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  status: 'pending' | 'accepted' | 'rejected';
  isEdited: boolean;
  originalContent?: {
    front: string;
    back: string;
  };
}

interface FlashcardProposalListViewModel {
  proposals: FlashcardProposalViewModel[];
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    edited: number;
  };
}

interface GenerateViewState {
  stage: 'input' | 'generating' | 'review';
  error?: string;
  generationId?: string;
  proposals?: FlashcardProposalListViewModel;
}

interface FlashcardAction {
  type: 'accept' | 'reject' | 'edit' | 'accept-all';
  proposalId?: string;
  editedContent?: {
    front: string;
    back: string;
  };
}

interface FlashcardReviewState {
  currentIndex: number;
  proposals: FlashcardProposalViewModel[];
  generationId: string;
}

interface GenerationResult {
  generationId: string;
  proposals: Array<{
    id: string;
    front: string;
    back: string;
  }>;
}

interface FlashcardListState {
  filter: 'all' | 'accepted' | 'rejected';
  editingId: string | null;
}

interface BulkFlashcardAction {
  type: 'accept-all' | 'save-accepted';
}

interface GenerationProgressState {
  status: 'initializing' | 'generating' | 'finishing';
  progress?: {
    current: number;
    total?: number;
  };
  error?: string;
}

interface ReviewProgressState {
  total: number;
  reviewed: number;
  stats: {
    accepted: number;
    rejected: number;
    edited: number;
  };
  isDetailsVisible: boolean;
}

interface ErrorState {
  type: 'validation' | 'api' | 'network' | 'generation';
  message: string;
  code?: string;
  action?: {
    label: string;
    handler: () => void;
  };
  timestamp: number;
}
```

## 6. Zarządzanie stanem
### Custom Hooks:
```typescript
const useFlashcardGeneration = (text: string) => {
  // Zarządza procesem generowania fiszek
  // Zwraca ID generacji oraz propozycje fiszek
  return { isGenerating, error, generationResult: GenerationResult };
};

const useFlashcardReview = (flashcards: FlashcardProposalDto[], generationId: string) => {
  // Zarządza stanem przeglądu fiszek
  return {
    currentCard,
    decisions,
    navigate,
    handleAction,
    acceptAll,
    hasUnsavedChanges
  };
};

const useTextValidation = () => {
  // Zarządza walidacją tekstu wejściowego
  return { isValid, errorMessage, validate };
};

const useFlashcardList = (flashcards: FlashcardProposalDto[]) => {
  // Zarządza stanem listy fiszek
  return {
    filteredCards,
    filter,
    setFilter,
    handleItemAction,
    handleBulkAction,
    editingId,
    decisions
  };
};

const useErrorNotification = () => {
  // Zarządza stanem powiadomień o błędach
  return {
    errors: ErrorState[],
    showError: (error: Omit<ErrorState, 'timestamp'>) => void,
    clearError: (timestamp: number) => void,
    clearAll: () => void
  };
};
```

## 7. Integracja API
### Generowanie fiszek
```typescript
const generateFlashcards = async (text: string): Promise<GenerationResult> => {
  const response = await fetch('/api/generations', {
    method: 'POST',
    body: JSON.stringify({ source_text: text })
  });
  const result = await handleResponse(response);

  // Mapowanie odpowiedzi na model widoku
  return {
    generationId: result.generation_id,
    proposals: result.flashcard_proposals.map(proposal => ({
      id: proposal.id,
      front: proposal.front,
      back: proposal.back,
      status: 'pending',
      isEdited: false
    }))
  };
};
```

### Zapisywanie fiszek
```typescript
const saveFlashcards = async (
  proposals: FlashcardProposalViewModel[],
  generationId: string
): Promise<FlashcardDto[]> => {
  // Filtrujemy tylko zaakceptowane propozycje
  const acceptedProposals = proposals.filter(p => p.status === 'accepted');

  const response = await fetch('/api/flashcards', {
    method: 'POST',
    body: JSON.stringify({
      flashcards: acceptedProposals.map(p => ({
        front: p.front,
        back: p.back,
        source: p.isEdited ? 'ai-edited' : 'ai-full',
        generation_id: generationId
      }))
    })
  });
  return handleResponse(response);
};
```

## 8. Interakcje użytkownika
1. Wprowadzanie tekstu:
   - Walidacja w czasie rzeczywistym
   - Aktualizacja licznika znaków
   - Włączenie/wyłączenie przycisku generowania

2. Generowanie fiszek:
   - Wyświetlenie wskaźnika postępu
   - Aktualizacja statusu generowania w czasie rzeczywistym
   - Możliwość anulowania procesu generowania
   - Obsługa błędów generowania
   - Przejście do trybu przeglądu po otrzymaniu propozycji
   - Zachowanie ID generacji do późniejszego użycia

3. Przegląd fiszek:
   - Nawigacja między fiszkami
   - Edycja treści
   - Akceptacja/odrzucenie pojedynczej fiszki
   - Akceptacja wszystkich fiszek
   - Zapisywanie zaakceptowanych fiszek (pojedynczo lub wszystkich)
   - Ostrzeżenie o niezapisanych zmianach przy próbie wyjścia
   - Aktualizacja statystyk przeglądu w czasie rzeczywistym

4. Obsługa błędów:
   - Wyświetlanie powiadomień o błędach
   - Możliwość zamknięcia powiadomienia
   - Wykonywanie akcji naprawczych
   - Automatyczne znikanie powiadomień

## 9. Warunki i walidacja
1. Tekst źródłowy:
   - Długość: 1000-10000 znaków
   - Nie może być pusty

2. Fiszki:
   - Przód: maksymalnie 200 znaków
   - Tył: maksymalnie 500 znaków
   - Wymagane oba pola przy zapisie

## 10. Obsługa błędów
1. Błędy walidacji:
   - Wyświetlanie komunikatów pod polami
   - Blokowanie akcji przy nieprawidłowych danych
   - Pokazywanie ErrorNotification dla krytycznych błędów walidacji

2. Błędy API:
   - Retry dla czasowych problemów
   - Przyjazne komunikaty błędów w ErrorNotification
   - Możliwość ponowienia akcji poprzez przycisk w powiadomieniu
   - Różne typy powiadomień w zależności od kodu błędu

3. Błędy sieci:
   - Obsługa timeout
   - Informacja o braku połączenia przez ErrorNotification
   - Automatyczne ponowienie próby
   - Możliwość ręcznego ponowienia przez przycisk w powiadomieniu

4. Błędy generowania:
   - Szczegółowe komunikaty o problemach z generowaniem
   - Możliwość anulowania i ponownego rozpoczęcia
   - Zachowanie częściowych wyników w przypadku częściowego sukcesu

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów:
   - Konfiguracja routingu
   - Szkielet komponentów
   - Definicje typów
   - Implementacja ErrorBoundary
   - Implementacja ErrorNotification

2. Implementacja wprowadzania tekstu:
   - Komponent TextArea
   - Walidacja
   - Licznik znaków
   - Przycisk generowania

3. Implementacja generowania:
   - Integracja z API generations
   - Wskaźnik postępu
   - Obsługa błędów
   - Przechowywanie ID generacji

4. Implementacja listy fiszek:
   - Komponent FlashcardList
   - Komponent FlashcardListItem
   - Filtrowanie listy
   - Akcje zbiorcze
   - Wskaźnik postępu przeglądu

5. Implementacja pojedynczej fiszki:
   - Wyświetlanie treści
   - Przyciski akcji
   - Tryb edycji
   - Walidacja długości
   - Wskaźniki stanu

6. Implementacja akcji zbiorczych:
   - Zaakceptowanie wszystkich
   - Zapisanie zaakceptowanych
   - Komunikaty potwierdzenia

7. Implementacja zapisywania:
   - Integracja z API flashcards
   - Obsługa błędów
   - Komunikaty sukcesu
   - Zapisywanie pojedynczych fiszek
   - Zapisywanie wszystkich zaakceptowanych
   - Powiązanie fiszek z ID generacji

8. Optymalizacja i testowanie:
   - Testy komponentów
   - Optymalizacja wydajności
   - Testowanie edge cases
   - Testowanie scenariuszy masowego zapisywania
