# Plan Testów dla Projektu 10x-cards

## 1. Wprowadzenie i cele testowania

Niniejszy dokument opisuje strategię, zakres, podejście oraz zasoby przeznaczone do testowania aplikacji 10x-cards. Celem testów jest zapewnienie wysokiej jakości oprogramowania poprzez weryfikację funkcjonalności, wydajności, bezpieczeństwa i użyteczności aplikacji, zgodnie ze specyfikacją i wymaganiami.

**Główne cele:**

*   Wykrycie i zaraportowanie błędów przed wdrożeniem produkcyjnym.
*   Weryfikacja zgodności aplikacji z założeniami projektowymi.
*   Zapewnienie stabilności i niezawodności działania kluczowych komponentów.
*   Ocena wydajności aplikacji pod kątem oczekiwanych obciążeń.
*   Weryfikacja bezpieczeństwa danych i procesów.
*   Zapewnienie pozytywnego doświadczenia użytkownika (UX).

## 2. Zakres testów

Testy obejmą następujące obszary funkcjonalne i niefunkcjonalne aplikacji:

*   **Frontend:**
    *   Renderowanie stron i komponentów Astro.
    *   Funkcjonalność dynamicznych komponentów React (wysp).
    *   Poprawność działania layoutów Astro.
    *   Integracja i działanie komponentów Shadcn/ui.
    *   Routing po stronie klienta i serwera (Astro).
    *   Responsywność i poprawność wyświetlania na różnych urządzeniach (Tailwind).
    *   Walidacja formularzy po stronie klienta.
    *   Użyteczność i dostępność interfejsu.
*   **Backend/API:**
    *   Poprawność działania punktów końcowych API (`src/pages/api`).
    *   Walidacja danych wejściowych i odpowiedzi API.
    *   Logika biznesowa zaimplementowana w API.
    *   Obsługa błędów i zwracanie odpowiednich kodów statusu.
    *   Integracja z usługami zewnętrznymi (np. Supabase).
*   **Middleware:**
    *   Poprawność działania logiki middleware (`src/middleware/index.ts`).
    *   Kolejność wykonywania middleware.
    *   Obsługa autentykacji i autoryzacji (jeśli dotyczy).
*   **Baza danych:**
    *   Poprawność interakcji z bazą danych Supabase (`src/db`).
    *   Spójność danych.
    *   Poprawność migracji schematu (jeśli dotyczy).
*   **Bezpieczeństwo:**
    *   Testy penetracyjne podstawowe (np. OWASP Top 10).
    *   Weryfikacja mechanizmów autentykacji i autoryzacji.
    *   Zabezpieczenia przed atakami typu XSS, CSRF.
*   **Wydajność:**
    *   Czas ładowania stron.
    *   Czas odpowiedzi API pod obciążeniem.
    *   Optymalizacja zasobów (obrazy, skrypty).
*   **Typowanie:**
    *   Spójność typów TypeScript w całym projekcie (`src/types.ts`).

## 3. Typy testów do przeprowadzenia

*   **Testy jednostkowe (Unit Tests):**
    *   Cel: Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, usługi w `src/lib`).
    *   Narzędzia: Vitest, React Testing Library.
*   **Testy integracyjne (Integration Tests):**
    *   Cel: Weryfikacja współpracy pomiędzy różnymi modułami (np. frontend <-> API, API <-> baza danych, komponenty React z usługami).
    *   Narzędzia: Vitest, React Testing Library, Supertest (dla API), Mock Service Worker (MSW).
*   **Testy End-to-End (E2E Tests):**
    *   Cel: Symulacja rzeczywistych przepływów użytkownika w aplikacji, testowanie całej ścieżki od interfejsu po bazę danych.
    *   Narzędzia: Playwright lub Cypress.
*   **Testy wizualnej regresji (Visual Regression Tests):**
    *   Cel: Wykrywanie niezamierzonych zmian w interfejsie użytkownika.
    *   Narzędzia: Playwright/Cypress z integracją np. Percy.io lub Chromatic.
*   **Testy wydajnościowe (Performance Tests):**
    *   Cel: Ocena szybkości działania aplikacji i odpowiedzi API pod obciążeniem.
    *   Narzędzia: k6, Lighthouse.
*   **Testy bezpieczeństwa (Security Tests):**
    *   Cel: Identyfikacja potencjalnych luk bezpieczeństwa.
    *   Narzędzia: OWASP ZAP (podstawowe skanowanie), manualna weryfikacja.
*   **Testy manualne (Manual Tests):**
    *   Cel: Testy eksploracyjne, weryfikacja użyteczności (UX), testowanie przypadków trudnych do zautomatyzowania.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

*(Przykładowe scenariusze - należy je rozwinąć w oparciu o konkretne funkcjonalności aplikacji)*

*   **Logowanie/Rejestracja Użytkownika:**
    *   Poprawne logowanie z ważnymi danymi.
    *   Nieudane logowanie z błędnymi danymi.
    *   Poprawna rejestracja nowego użytkownika.
    *   Obsługa błędów podczas rejestracji (np. zajęty email).
    *   Wylogowanie.
*   **Główna funkcjonalność X (np. Zarządzanie kartami):**
    *   Wyświetlanie listy kart.
    *   Dodawanie nowej karty.
    *   Edycja istniejącej karty.
    *   Usuwanie karty.
    *   Walidacja danych wejściowych formularza karty.
*   **Routing i Nawigacja:**
    *   Przechodzenie między stronami.
    *   Poprawne działanie linków.
    *   Obsługa routingu chronionego (jeśli istnieje).
*   **API - Endpoint Y:**
    *   Poprawna odpowiedź dla żądania GET.
    *   Poprawne przetworzenie żądania POST/PUT/DELETE.
    *   Zwrócenie błędu dla niepoprawnych danych wejściowych (status 4xx).
    *   Zwrócenie błędu serwera (status 5xx).

## 5. Środowisko testowe

*   **Środowisko deweloperskie:** Lokalne maszyny deweloperów.
*   **Środowisko CI/CD:** Platforma CI/CD (np. GitHub Actions, GitLab CI) do uruchamiania testów automatycznych.
*   **Środowisko stagingowe:** Odzwierciedlenie środowiska produkcyjnego, na którym będą przeprowadzane testy E2E, UAT i wydajnościowe przed wdrożeniem.
*   **Środowisko produkcyjne:** Ograniczone testy dymne (smoke tests) po wdrożeniu.

## 6. Narzędzia do testowania

*   **Framework do testów jednostkowych i integracyjnych:** Vitest
*   **Biblioteka do testowania komponentów React:** React Testing Library (@testing-library/react)
*   **Framework do testów E2E:** Playwright / Cypress
*   **Narzędzie do mockowania API:** Mock Service Worker (MSW)
*   **Narzędzie do testowania API:** Supertest
*   **Narzędzie do testów wydajnościowych:** k6, Lighthouse
*   **Narzędzie do testów wizualnej regresji:** Percy.io / Chromatic (zintegrowane z Playwright/Cypress)
*   **Narzędzie do podstawowych testów bezpieczeństwa:** OWASP ZAP
*   **System CI/CD:** GitHub Actions / GitLab CI / Jenkins itp.
*   **Narzędzie do zarządzania zadaniami i błędami:** Jira / Trello / GitHub Issues

## 7. Harmonogram testów

*   **Testy jednostkowe i integracyjne:** Pisane równolegle z rozwojem funkcjonalności, uruchamiane automatycznie w CI/CD przy każdym pushu/merge requeście.
*   **Testy E2E:** Uruchamiane automatycznie w CI/CD przed wdrożeniem na środowisko stagingowe i produkcyjne.
*   **Testy manualne/eksploracyjne:** Przeprowadzane przed każdym większym wydaniem na środowisku stagingowym.
*   **Testy wydajnościowe:** Przeprowadzane okresowo oraz przed wdrożeniem zmian mających potencjalny wpływ na wydajność.
*   **Testy bezpieczeństwa:** Przeprowadzane okresowo oraz przed wdrożeniem na produkcję.
*   **Testy akceptacyjne użytkownika (UAT):** Przeprowadzane na środowisku stagingowym przez interesariuszy przed wydaniem produkcyjnym.

## 8. Kryteria akceptacji testów

*   **Kryteria wejścia (rozpoczęcia testów):**
    *   Dostępna stabilna wersja aplikacji na odpowiednim środowisku testowym.
    *   Dostępna dokumentacja funkcjonalności.
    *   Przygotowane środowisko testowe i dane testowe.
*   **Kryteria wyjścia (zakończenia testów):**
    *   Wszystkie zaplanowane testy (automatyczne i manualne) zostały wykonane.
    *   Określony procent testów automatycznych zakończył się sukcesem (np. 95% dla jednostkowych/integracyjnych, 90% dla E2E).
    *   Wszystkie krytyczne i wysokie błędy zostały naprawione i zweryfikowane.
    *   Znane błędy o niższym priorytecie zostały udokumentowane i zaakceptowane przez interesariuszy.
    *   Raport z testów został przygotowany i zaakceptowany.

## 9. Role i odpowiedzialności w procesie testowania

*   **Deweloperzy:**
    *   Pisanie testów jednostkowych i integracyjnych dla tworzonego kodu.
    *   Naprawianie błędów zgłoszonych przez testerów lub system CI/CD.
    *   Utrzymanie progu pokrycia kodu testami.
*   **Inżynierowie QA / Testerzy:**
    *   Tworzenie i utrzymanie planu testów.
    *   Projektowanie i implementacja testów automatycznych (E2E, integracyjne wyższego poziomu).
    *   Wykonywanie testów manualnych i eksploracyjnych.
    *   Raportowanie i śledzenie błędów.
    *   Przygotowywanie raportów z testów.
    *   Konfiguracja i utrzymanie środowisk testowych.
*   **Product Owner / Interesariusze:**
    *   Udział w testach akceptacyjnych użytkownika (UAT).
    *   Definiowanie priorytetów dla naprawy błędów.
    *   Akceptacja wyników testów.

## 10. Procedury raportowania błędów

*   Wszystkie znalezione błędy będą raportowane w systemie śledzenia błędów (np. Jira, GitHub Issues).
*   Każdy raport błędu powinien zawierać:
    *   Tytuł: Krótki, zwięzły opis problemu.
    *   Opis: Szczegółowy opis błędu, kroki do reprodukcji.
    *   Środowisko: Wersja aplikacji, przeglądarka, system operacyjny, środowisko testowe (dev, staging).
    *   Oczekiwany rezultat: Jak aplikacja powinna się zachować.
    *   Rzeczywisty rezultat: Jak aplikacja się zachowała.
    *   Priorytet/Waga: (np. Krytyczny, Wysoki, Średni, Niski) - ustalany wstępnie przez testera, weryfikowany przez PO/zespół.
    *   Załączniki: Zrzuty ekranu, logi, nagrania wideo.
*   Błędy będą przypisywane do odpowiednich deweloperów w celu naprawy.
*   Po naprawieniu błędu, tester ponownie przetestuje zgłoszenie w celu weryfikacji poprawki.
*   Status błędu będzie aktualizowany w systemie śledzenia (np. Otwarty, W toku, Do weryfikacji, Zamknięty, Odrzucony).
