# Logger Usage Guide

## Problem

ESLint pokazuje ostrzeżenia związane z użyciem `console.log`, `console.error` itp. bezpośrednio w kodzie, ponieważ w konfiguracji ESLint ustawiona jest reguła `"no-console": "warn"`.

## Rozwiązanie

Stworzyliśmy wrapper dla konsoli, który korzysta z istniejącego `LoggingService`. Wrapper ten pozwala na:

1. Ujednolicone zbieranie logów z możliwością ich filtrowania wg poziomu
2. Dodawanie kontekstu (nazwa serwisu/komponentu) do logów
3. Strukturyzowane logi w formacie JSON
4. Ustawienie poziomu logowania za pomocą zmiennej środowiskowej `LOG_LEVEL`

## Jak używać

### Podstawowe użycie

```typescript
import { logger } from "@/lib/logger";

// Zamiast console.log
logger.log("Ważna informacja");

// Zamiast console.error
logger.error("Wystąpił błąd", { kod: 123, powód: "Nieznany" });
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

### Ustawienie poziomu logowania

W plikach środowiskowych (`.env`, `.env.development` itp.) możesz ustawić:

```
LOG_LEVEL=debug   # Pokaże wszystkie logi
LOG_LEVEL=info    # Pokaże info, warn, error
LOG_LEVEL=warn    # Pokaże warn, error
LOG_LEVEL=error   # Pokaże tylko error
```

Domyślny poziom to `info`.

## Dobre praktyki

1. Używaj `createLogger` dla każdego komponentu/modułu, aby łatwiej zidentyfikować źródło logów
2. W logach produkcyjnych nie umieszczaj wrażliwych informacji (np. hasła, tokeny)
3. Dla komponentów React, twórz logger na poziomie modułu, nie wewnątrz funkcji komponentu
4. Nie loguj zbyt dużych obiektów - może to spowolnić aplikację
5. Używaj odpowiednich poziomów logowania:
   - `debug`: Szczegółowe informacje do debugowania
   - `info`: Normalne wydarzenia, które warto odnotować
   - `warn`: Ostrzeżenia, które nie przerwały wykonania, ale wymagają uwagi
   - `error`: Błędy, które przerwały normalne działanie aplikacji
