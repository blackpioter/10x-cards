# Specyfikacja modułu autentykacji i zarządzania kontem

## 1. Architektura interfejsu użytkownika

### a. Strony i layouty
- Wprowadzenie nowych stron dedykowanych autentykacji, takich jak:
  - `/login` – strona logowania
  - `/register` – strona rejestracji
  - `/forgot-password` – strona odzyskiwania hasła
  - `/reset-password` – strona resetowania hasła
- Utworzenie dedykowanego layoutu (np. `src/layouts/AuthLayout.astro`) dla trybu autoryzowanego, który będzie używany w widokach wymagających uwierzytelnienia.
- Strony w trybie non-auth (publiczne) pozostają oddzielone, z możliwością integracji dynamicznych komponentów React tam, gdzie potrzebna jest interaktywność.

### b. Komponenty client-side React a strony Astro
- Formularze autoryzacyjne (np. `LoginForm`, `RegisterForm`, `ForgotPasswordForm`) zostaną wdrożone jako komponenty React osadzone w stronach Astro.
- Odpowiedzialność:
  - Komponenty React:
    - Obsługa walidacji wejściowych (np. poprawność formatu email, minimalna długość hasła).
    - Obsługa komunikatów błędów i wyświetlanie feedbacku dla użytkownika.
    - Integracja z backendowymi endpointami przez AJAX/Fetch API dla rejestracji, logowania, wylogowania oraz odzyskiwania hasła.
  - Strony Astro:
    - Renderowanie struktury strony, routing oraz zarządzanie stanem sesji przy użyciu SSR.
    - Integracja z middleware, które przeprowadzą weryfikację autentykacji przed renderowaniem stron chronionych.

### c. Walidacja i komunikaty błędów
- Walidacja po stronie klienta:
  - Użycie wbudowanych validatorów HTML oraz bibliotek takich jak React Hook Form lub Formik.
  - Natychmiastowe informacje zwrotne (inline error messages) dla użytkownika, np. "Nieprawidłowy format adresu email" czy "Hasło musi zawierać przynajmniej 8 znaków".
- Walidacja po stronie serwera:
  - Wykorzystanie bibliotek (np. zod) do walidacji danych wejściowych.
  - Sprawdzenie, czy przyjmowane dane (email, hasło) spełniają wymagania bezpieczeństwa i formatu.
- Obsługa błędów:
  - Zarówno klient, jak i serwer będą zwracać czytelne komunikaty błędów.

## 2. Logika backendowa

### a. Struktura endpointów API
- Utworzenie nowych endpointów w katalogu `src/pages/api/auth`, np.:
  - `/api/auth/register` – rejestracja użytkownika
  - `/api/auth/login` – logowanie
  - `/api/auth/logout` – wylogowywanie
  - `/api/auth/forgot-password` – wysyłanie linku do odzyskiwania hasła
  - `/api/auth/reset-password` – resetowanie hasła przy użyciu tokenu
- Endpointy będą implementowane przy użyciu funkcji Astro API, obsługujących metody HTTP (POST, GET) oraz współpracujących ze strukturą API opisaną w `astro.config.mjs`.

### b. Modele danych i walidacja
- Modele danych związane z autentykacją definiowane będą w `src/types.ts` i ewentualnie w dedykowanych modułach domenowych.
- Walidacja danych wejściowych odbywać się będzie przy użyciu biblioteki (np. zod), która sprawdzi poprawność formatów (np. email, hasło) jeszcze przed przetwarzaniem danych w endpointach.
- Dodatkowe zabezpieczenia: ochrona przed SQL Injection, ograniczenie liczby zapytań (rate limiting) oraz wstępne sprawdzanie parametrów wejściowych.

### c. Obsługa wyjątków
- Każdy endpoint opakowany będzie w bloki try/catch, aby przechwycić wyjątkowe sytuacje.
- W przypadku błędów serwera lub niewłaściwych danych, system zwróci odpowiednie kody statusu HTTP (np. 400, 500) oraz czytelne komunikaty błędów, które będą logowane w centralnym systemie monitorującym.

### d. Aktualizacja renderowania stron server-side
- Middleware w `src/middleware/index.ts` zostanie rozszerzony o logikę weryfikacji sesji użytkownika, by chronić dostęp do stron wymagających autentykacji.
- Mechanizmy renderowania stron server-side zostaną zintegrowane z systemem sesji, umożliwiając dynamiczne przekierowywanie użytkowników do `/login` w przypadku braku autentykacji.

## 3. System autentykacji

### a. Wykorzystanie Supabase Auth
- System autentykacji opiera się na Supabase Auth, który zapewnia kompletny cykl operacji: rejestracja, logowanie, wylogowywanie oraz odzyskiwanie konta.
- Integracja nastąpi poprzez klienta Supabase umieszczonego w katalogu `src/db`, gdzie zostaną zaimplementowane metody do komunikacji z bazą danych oraz usługą autentykacji.

### b. Integracja z Astro
- Frontend: Komponenty React (np. `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`) będą korzystać z klienta Supabase, wysyłając żądania do API oraz obsługując odpowiedzi serwera.
- Server-side: Astro, przy pomocy middleware, wykorzysta dane sesyjne i tokeny do weryfikacji autentykacji, dynamicznego renderowania treści oraz zabezpieczenia stron wymagających logowania.

### c. Bezpieczeństwo
- Implementacja opiera się na najlepszych praktykach: ochrona przed atakami CSRF i XSS, bezpieczne przechowywanie danych sesji w ciasteczkach oraz szyfrowana komunikacja między frontendem a backendem.
- Proces odzyskiwania hasła obejmuje generowanie tokenu resetującego oraz wysyłanie instrukcji resetowania na zarejestrowany adres email.

## Podsumowanie

Specyfikacja modułu autentykacji i zarządzania kontem integruje nowoczesne rozwiązania frontendowe (Astro, React, Tailwind, Shadcn/ui) z bezpieczną logiką backendową opartą o Supabase Auth. Proponowany system obejmuje:
- Dedykowane strony i layouty dla trybu autentykacji oraz aplikację publiczną.
- Jasny podział odpowiedzialności: komponenty React obsługujące interakcje i walidację użytkownika oraz strony Astro i middleware przejmujące zarządzanie sesjami i renderowaniem server-side.
- Endpointy API zoptymalizowane pod kątem bezpieczeństwa i poprawności danych, z odpowiednią obsługą błędów i mechanizmami logowania.

Całość została zaprojektowana z myślą o zachowaniu integralności istniejącej aplikacji i spełnieniu wszystkich kluczowych wymagań opisanych w dokumentacji produktu oraz stacku technologicznym.
