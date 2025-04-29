# Logger Usage Guide

## Problem

ESLint pokazuje ostrzeżenia związane z użyciem `console.log`, `console.error` itp. bezpośrednio w kodzie, ponieważ w konfiguracji ESLint ustawiona jest reguła `"no-console": "warn"`.

## Rozwiązanie

Stworzyliśmy wrapper dla konsoli, który korzysta z istniejącego `LoggingService`. Wrapper ten pozwala na:

1. Ujednolicone zbieranie logów z możliwością ich filtrowania wg poziomu
2. Dodawanie kontekstu (nazwa serwisu/komponentu) do logów
3. Strukturyzowane logi w formacie JSON
4. Ustawienie poziomu logowania za pomocą zmiennej środowiskowej `LOG_LEVEL`
5. Sanityzację wrażliwych danych i bezpieczną obsługę cyklicznych referencji
6. Obsługę wielu argumentów w stylu `console.log` (np. `logger.log("Error:", error, moreData)`)

## Jak używać

### Podstawowe użycie

```typescript
import { logger } from "@/lib/logger";

// Zamiast console.log
logger.log("Ważna informacja");

// Zamiast console.error
logger.error("Wystąpił błąd", { kod: 123, powód: "Nieznany" });

// Możesz przekazać wiele argumentów (tak jak console.log)
logger.info("Status:", statusCode, response);
```

### Tworzenie loggera dla konkretnego modułu/komponentu

```typescript
import { createLogger } from "@/lib/logger";

// Tworzy logger z kontekstem
const logger = createLogger("NazwaKomponentu");

function mojaFunkcja() {
  // Użycie loggera
  logger.info("Jakaś informacja");

  try {
    // kod, który może rzucić wyjątek
  } catch (error) {
    logger.error("Błąd w funkcji mojaFunkcja", error);
  }
}
```

### Dostępne metody

```typescript
logger.debug("Informacje debugowe", dane);
logger.log("Standardowe informacje", dane);  // alias dla info
logger.info("Standardowe informacje", dane);
logger.warn("Ostrzeżenia", dane);
logger.error("Błędy", dane);
```

### Bezpieczne logowanie

System automatycznie:
- Usuwa wrażliwe dane uwzględniając kontekst (np. tokeny autoryzacyjne jak `accessToken` czy `bearerToken`, ale nie tokeny AI)
- Obsługuje cykliczne referencje w obiektach
- Obsługuje funkcje i inne specjalne typy danych

> **Ważne:** System rozróżnia między tokenami autoryzacyjnymi (np. `access_token`, `jwt_token`) a tokenami używanymi przez modele AI (np. liczba tokenów w komunikacji z OpenAI). Tylko tokeny związane z autoryzacją i poufnymi danymi są maskowane.

### Sanityzacja danych w innych miejscach

`LoggingService` udostępnia również metody do sanityzacji danych, które można wykorzystać poza kontekstem logowania:

```typescript
import { createLogger, LoggingService } from "@/lib/logger";

const logger = createLogger("MojSerwis");

// Sanityzacja obiektu z danymi przed wysłaniem do API
const userData = {
  name: "Jan Kowalski",
  email: "jan@example.com",
  password: "tajne_haslo", // to pole zostanie zamaskowane
  apiKey: "abc123xyz", // to pole również zostanie zamaskowane
  tokenCount: 1250, // to pole NIE zostanie zamaskowane (tokeny AI)
  accessToken: "xyz123abc" // to pole zostanie zamaskowane (token autoryzacyjny)
};

// Sanityzacja obiektu (np. przed logowaniem ręcznym)
const sanitizedData = logger.sanitizeData(userData);
console.log("Dane użytkownika:", sanitizedData);
// Wyświetli: Dane użytkownika: { name: "Jan Kowalski", email: "jan@example.com", password: "[REDACTED]", apiKey: "[REDACTED]", tokenCount: 1250, accessToken: "[REDACTED]" }

// Sanityzacja nagłówków HTTP
const headers = new Headers({
  "Content-Type": "application/json",
  "Authorization": "Bearer abc123xyz"
});
const sanitizedHeaders = logger.sanitizeHeaders(headers);
console.log("Nagłówki:", sanitizedHeaders);
// Wyświetli: Nagłówki: { "Content-Type": "application/json", "Authorization": "[REDACTED]" }
```

### Ustawienie poziomu logowania

W plikach środowiskowych (`.env`, `.env.development` itp.) możesz ustawić:

```
LOG_LEVEL=debug   # Pokaże wszystkie logi
LOG_LEVEL=info    # Pokaże info, warn, error
LOG_LEVEL=warn    # Pokaże warn, error
LOG_LEVEL=error   # Pokaże tylko error
```

Domyślny poziom to `info`.

### Zaawansowane użycie

Jeśli potrzebujesz bardziej zaawansowanej kontroli, możesz bezpośrednio utworzyć instancję LoggingService:

```typescript
import { LoggingService, LogLevel } from "@/lib/logger";

const logger = new LoggingService({
  serviceName: "CustomService",
  sensitiveKeys: ["password", "apiKey", "customSensitiveData"] // Dodatkowe wrażliwe klucze
});

logger.debug("Debug message", { someData: true });

// Możesz też użyć metod sanityzacji bezpośrednio
const sanitizedData = logger.sanitizeData(myObject);
```

## Dobre praktyki

1. Używaj `createLogger` dla każdego komponentu/modułu, aby łatwiej zidentyfikować źródło logów
2. W logach produkcyjnych nie umieszczaj wrażliwych informacji (system automatycznie maskuje znane wrażliwe pola)
3. Dla komponentów React, twórz logger na poziomie modułu, nie wewnątrz funkcji komponentu
4. Nie loguj zbyt dużych obiektów - może to spowolnić aplikację
5. Używaj odpowiednich poziomów logowania:
   - `debug`: Szczegółowe informacje do debugowania
   - `info`: Normalne wydarzenia, które warto odnotować
   - `warn`: Ostrzeżenia, które nie przerwały wykonania, ale wymagają uwagi
   - `error`: Błędy, które przerwały normalne działanie aplikacji
