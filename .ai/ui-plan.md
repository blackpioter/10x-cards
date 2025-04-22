# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards to narzędzie umożliwiające generowanie, przeglądanie i edycję fiszek edukacyjnych zarówno przy użyciu AI, jak i ręcznie. Interfejs użytkownika jest oparty na nowoczesnych technologiach (Astro, React, Tailwind, Shadcn/ui) i zapewnia intuicyjny, responsywny oraz bezpieczny dostęp do wszystkich kluczowych funkcji. Widoki są projektowane z myślą o dostępności (WCAG) oraz płynnej nawigacji, a cały system opiera się na autoryzacji za pomocą JWT oraz obsłudze błędów poprzez inline komunikaty i toast notifications.

## 2. Lista widoków

1. **Ekran logowania/rejestracji**
   - **Ścieżka widoku:** `/login` (domyślny ekran aplikacji)
   - **Główny cel:** Umożliwić użytkownikowi logowanie oraz rejestrację, zapewniając bezpieczny dostęp do systemu.
   - **Kluczowe informacje:** Formularze logowania/rejestracji, komunikaty walidacyjne, przyciski do przełączania między trybami logowania i rejestracji.
   - **Kluczowe komponenty widoku:** Formularz uwierzytelniania, pola wejściowe, przyciski, mechanizmy walidacji, komponenty do wyświetlania błędów.
   - **UX, dostępność i względy bezpieczeństwa:** Zabezpieczone przetwarzanie danych (JWT), responsywny design, dostępność dla użytkowników z niepełnosprawnościami, czytelne komunikaty błędów.

2. **Dashboard główny (Widok fiszek)**
   - **Ścieżka widoku:** `/flashcards`
   - **Główny cel:** Centralny punkt, w którym użytkownik przegląda swoje fiszki, z możliwością filtrowania według statusu (zaakceptowane, odrzucone, pending) oraz szybkiej zmiany statusów.
   - **Kluczowe informacje:** Lista fiszek, statystyki (np. liczba fiszek oczekujących na przegląd), kontrolki filtrowania i paginacji.
   - **Kluczowe komponenty widoku:** FlashcardList, FlashcardListItem, filtry statusu, przyciski zmiany statusu, paginacja.
   - **UX, dostępność i względy bezpieczeństwa:** Intuicyjna nawigacja, szybki dostęp do kluczowych danych, responsywna struktura, mechanizmy potwierdzania akcji zmiany statusów fiszek.

3. **Widok generowania fiszek (AI)**
   - **Ścieżka widoku:** `/generate`
   - **Główny cel:** Umożliwić użytkownikowi wklejenie długiego tekstu i automatyczne wygenerowanie propozycji fiszek z wykorzystaniem AI.
   - **Kluczowe informacje:** Edytor tekstu z licznikami znaków, przycisk generowania, wskaźnik ładowania, lista propozycji fiszek.
   - **Kluczowe komponenty widoku:** Edytor tekstu, licznik znaków, przycisk generowania, lista podglądu wygenerowanych fiszek, wskaźnik ładowania (skeleton loader).
   - **UX, dostępność i względy bezpieczeństwa:** Walidacja długości tekstu, natychmiastowe informacje zwrotne o statusie operacji, responsywny design oraz bezpieczna komunikacja z API.

4. **Widok edycji pojedynczej fiszki**
   - **Ścieżka widoku:** `/flashcards/:id`
   - **Główny cel:** Pozwolić użytkownikowi na edycję treści wybranej fiszki (przód i tył) z zastosowaniem walidacji limitów znaków.
   - **Kluczowe informacje:** Szczegóły fiszki, pola edycji, komunikaty walidacyjne, przyciski zapisu/odrzucenia zmian.
   - **Kluczowe komponenty widoku:** Formularz edycji fiszki, pola tekstowe z limitem znaków, przyciski akcji, komponenty walidacyjne.
   - **UX, dostępność i względy bezpieczeństwa:** Jasno oznaczone stany edycji, intuicyjne komunikaty walidacyjne, możliwość cofnięcia zmian, kompatybilność z urządzeniami mobilnymi.

5. **Panel administracyjny/Statystyk**
   - **Ścieżka widoku:** `/admin` lub `/stats`
   - **Główny cel:** Umożliwić administratorowi przegląd zbiorczych statystyk użytkowania, takich jak całkowita liczba fiszek, podział na statusy oraz inne metryki efektywności.
   - **Kluczowe informacje:** Wykresy, tabele danych, filtry statystyk, podsumowania liczbowe.
   - **Kluczowe komponenty widoku:** Karty statystyczne, wykresy, tabele, filtry, komponenty interaktywne do sortowania danych.
   - **UX, dostępność i względy bezpieczeństwa:** Intuicyjna prezentacja danych, dynamiczne aktualizacje, dostępność ograniczona tylko dla uprawnionych użytkowników, wysoki poziom ochrony danych.

6. **Widok zarządzania kontem użytkownika**
   - **Ścieżka widoku:** `/account`
   - **Główny cel:** Umożliwić użytkownikowi przegląd i edycję danych konta oraz bezpieczne zarządzanie hasłem lub usunięcie konta.
   - **Kluczowe informacje:** Szczegóły konta, formularze edycji, przyciski do zmiany hasła i usunięcia konta.
   - **Kluczowe komponenty widoku:** Formularz edycji danych konta, pola wejściowe, komponenty potwierdzające krytyczne operacje, modale ostrzegawcze.
   - **UX, dostępność i względy bezpieczeństwa:** Silna walidacja danych, intuicyjne komunikaty, potwierdzenia operacji krytycznych, zabezpieczenia związane z JWT.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na ekran logowania/rejestracji (`/login`).
2. Po poprawnej autoryzacji użytkownik jest przekierowywany do dashboardu głównego (`/dashboard`), gdzie widzi listę swoich fiszek oraz dostęp do filtrów i opcji zmiany statusu.
3. Z dashboardu użytkownik może:
   - Przejść do widoku generowania fiszek (`/generate`), aby wprowadzić tekst i otrzymać automatycznie wygenerowane propozycje fiszek.
   - Wybrać pojedynczą fiszkę i przejść do widoku edycji (`/flashcards/:id`), by wprowadzić modyfikacje.
   - Zarządzać swoim kontem poprzez widok `/account`.
4. Użytkownik o uprawnieniach administracyjnych ma dodatkowy dostęp do panelu statystyk (`/admin` lub `/stats`), gdzie może monitorować kluczowe metryki aplikacji.
5. Nawigacja i breadcrumbs umożliwiają łatwe przemieszczanie się między poszczególnymi widokami oraz powrót do poprzednich sekcji.

## 4. Układ i struktura nawigacji

- Po zalogowaniu użytkownik widzi górny pasek nawigacyjny, który zawiera:
  - Link do dashboardu (główna lista fiszek)
  - Link do widoku generowania fiszek
  - Link do widoku zarządzania kontem
  - Opcję wylogowania
- Dla głębszych widoków (np. edycji fiszek) zastosowane zostaną uproszczone breadcrumbs, które pomagają śledzić ścieżkę nawigacji.
- Na urządzeniach mobilnych stosowany będzie responsywny design z rozwijalnym menu (hamburger menu), zapewniający wygodę nawigacji.

## 5. Kluczowe komponenty

- **Nawigacja (Top Navbar):** Umożliwia szybki dostęp do głównych sekcji aplikacji oraz wylogowanie.
- **FlashcardList i FlashcardListItem:** Zarządzają prezentacją listy fiszek z funkcjami filtrowania, sortowania i paginacji.
- **Formularze:** Komponenty logowania, rejestracji, generowania fiszek, edycji fiszek i zarządzania kontem, wyposażone w walidację i komunikaty o błędach.
- **Komponenty wizualizacji statystyk:** Karty informacyjne, wykresy oraz tabele służące do prezentacji danych w panelu administracyjnym.
- **Toast Notifications:** Zapewniają informację zwrotną o operacjach sukcesu lub błędach w czasie rzeczywistym.
- **Responsywne Modale:** Do potwierdzania operacji krytycznych, takich jak usunięcie konta czy zatwierdzenie zmian w edycji fiszki.
