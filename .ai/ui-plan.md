# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Interfejs użytkownika aplikacji 10x-cards opiera się na centralnym dashboardzie, który integruje wszystkie główne moduły: generowanie fiszek (zarówno automatyczne przy użyciu AI, jak i manualne), przegląd oraz edycję fiszek, zarządzanie kontem użytkownika oraz przegląd statystyk. System jest modułowy, responsywny, zgodny z najlepszymi praktykami UX oraz WCAG i zapewnia bezpieczeństwo operacji (m.in. poprzez uwierzytelnianie oraz walidację krytycznych danych).

## 2. Lista widoków

- **Widok logowania/rejestracji**
  - **Ścieżka widoku:** `/login` i `/register`
  - **Główny cel:** Umożliwić użytkownikom uwierzytelnienie oraz rejestrację.
  - **Kluczowe informacje:** Formularze logowania i rejestracji, komunikaty walidacyjne oraz błędy.
  - **Kluczowe komponenty:** Formularze, przyciski, pola wejściowe z walidacją, mechanizm obsługi błędów.
  - **Uwagi UX/bezpieczeństwo:** Bezpieczne przetwarzanie danych, wykorzystanie tokenów JWT, wysoka dostępność i zgodność z WCAG.

- **Dashboard główny**
  - **Ścieżka widoku:** `/dashboard`
  - **Główny cel:** Stanowi centralny punkt sterowania, umożliwiając dostęp do wszystkich modułów aplikacji.
  - **Kluczowe informacje:** Podsumowanie aktywności (np. liczba fiszek oczekujących na przegląd), statystyki generacji fiszek, szybki dostęp do kluczowych funkcjonalności.
  - **Kluczowe komponenty:** Karty informacyjne, tabele lub zestawienia, komponenty nawigacyjne.
  - **Uwagi UX/bezpieczeństwo:** Intuicyjny design, responsywność, szybki dostęp do najważniejszych informacji.

- **Widok generowania fiszek (AI)**
  - **Ścieżka widoku:** `/generate`
  - **Główny cel:** Umożliwić użytkownikowi wklejenie długiego tekstu i automatyczne wygenerowanie propozycji fiszek.
  - **Kluczowe informacje:** Edytor tekstu z licznikiem znaków, liczba wygenerowanych fiszek, komunikaty walidacyjne.
  - **Kluczowe komponenty:** Formularz wprowadzania tekstu, przycisk generowania, lista lub siatka wyświetlająca propozycje fiszek.
  - **Uwagi UX/bezpieczeństwo:** Walidacja długości tekstu, szybkie przetwarzanie AI, przejrzyste komunikaty o błędach.

- **Widok przeglądu i edycji fiszek**
  - **Ścieżka widoku:** `/flashcards/review`
  - **Główny cel:** Umożliwić użytkownikowi akceptację, odrzucenie lub edycję wygenerowanych fiszek.
  - **Kluczowe informacje:** Lista fiszek z opcjami akceptacji, edycji i odrzucenia, limity znaków dla treści.
  - **Kluczowe komponenty:** Lista/tabela fiszek, przyciski akcji, modale edycji.
  - **Uwagi UX/bezpieczeństwo:** Interaktywność, walidacja zmian, możliwość regeneracji fiszek przy błędach.

- **Widok szczegółowy fiszki**
  - **Ścieżka widoku:** `/flashcards/:id`
  - **Główny cel:** Prezentacja szczegółowych informacji o wybranej fiszce oraz umożliwienie jej edycji.
  - **Kluczowe informacje:** Treść fiszki, metadane (np. data utworzenia, status, statystyki powtórek), historia edycji.
  - **Kluczowe komponenty:** Formularz edycji, przyciski zapisu, sekcja historii zmian.
  - **Uwagi UX/bezpieczeństwo:** Łatwość nawigacji, możliwość cofnięcia zmian, responsywny design.

- **Widok zarządzania kontem**
  - **Ścieżka widoku:** `/account`
  - **Główny cel:** Umożliwić użytkownikowi zarządzanie danymi konta, zmianę hasła i usuwanie konta.
  - **Kluczowe informacje:** Dane użytkownika, formularze aktualizacji, alerty bezpieczeństwa.
  - **Kluczowe komponenty:** Formularze, przyciski potwierdzenia, system alertów.
  - **Uwagi UX/bezpieczeństwo:** Potwierdzenie krytycznych operacji, wysoki poziom autoryzacji i autentykacji.

- **Widok statystyk i administracji**
  - **Ścieżka widoku:** `/stats` lub `/admin`
  - **Główny cel:** Prezentacja zbiorczych danych dotyczących generacji i przeglądu fiszek.
  - **Kluczowe informacje:** Wykresy, tabele z danymi, filtry, statystyki generacji i akceptacji fiszek.
  - **Kluczowe komponenty:** Wykresy, tabele, moduły filtrowania, komponenty interaktywne.
  - **Uwagi UX/bezpieczeństwo:** Dynamiczne aktualizacje, czytelna prezentacja, ograniczony dostęp dla administratorów.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę logowania/rejestracji i przeprowadza proces autoryzacji.
2. Po zalogowaniu trafia na dashboard główny, gdzie widzi podsumowanie aktywności i szybki dostęp do modułów.
3. Użytkownik przechodzi do widoku generowania fiszek (/generate), wkleja treść i uruchamia proces generacji fiszek przez AI.
4. Po zakończeniu generacji, użytkownik przechodzi do widoku przeglądu i edycji fiszek (/flashcards/review), gdzie przegląda wygenerowane fiszki, akceptuje lub odrzuca poszczególne propozycje oraz modyfikuje treść, jeśli jest taka potrzeba.
5. W przypadku potrzeby bardziej szczegółowej edycji, użytkownik przechodzi do widoku szczegółowego fiszki (/flashcards/:id) i dokonuje zmian.
6. Użytkownik zarządza swoim kontem poprzez widok `/account`, gdzie może aktualizować dane, zmieniać hasło lub usuwać konto.
7. Administrator lub zaawansowany użytkownik odwiedza widok statystyk (/stats lub /admin) w celu monitorowania wyników działania systemu.

## 4. Układ i struktura nawigacji

- Główna nawigacja (np. pasek nawigacyjny) jest wyświetlana na każdej stronie i zawiera odnośniki do: Dashboard, Generowanie, Przegląd fiszek, Konto oraz Statystyk.
- Responsywny design: Dla urządzeń mobilnych stosowane jest rozwijalne menu oraz intuicyjne ikony.
- Breadcrumbs: W widokach szczegółowych i zagnieżdżonych umożliwiają śledzenie ścieżki i szybki powrót do poprzednich modułów.
- Menu podręczne w dashboardzie umożliwia szybki dostęp do najczęściej używanych funkcji.
- Wyraźne komunikaty o błędach i potwierdzenia działań krytycznych (np. usunięcie konta) zwiększają bezpieczeństwo interakcji.

## 5. Kluczowe komponenty

- **Formularze:** Używane w logowaniu, rejestracji, generowaniu i edycji fiszek, z walidacją danych i komunikatami błędów.
- **Listy/Tabele:** Wyświetlanie fiszek, statystyk i historii operacji.
- **Karty informacyjne:** Pokazujące podsumowania na dashboardzie.
- **Modale:** Dla edycji szczegółowej, potwierdzania działań krytycznych oraz dodatkowych informacji.
- **Komponenty nawigacyjne:** Pasek nawigacyjny, breadcrumbs oraz responsywne menu.
- **Komponenty wizualizacji:** Wykresy i tabele w widoku statystyk, umożliwiające interaktywne filtrowanie i analizę danych.
- **System notyfikacji:** Alerty i toast notifications zapewniające feedback użytkownika przy operacjach sukcesu lub błędzie.
