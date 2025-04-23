# Testowanie w projekcie 10x Cards

Ten dokument zawiera wskazówki dotyczące testowania aplikacji 10x Cards.

## Testy jednostkowe (Vitest)

Testy jednostkowe są używane do testowania pojedynczych komponentów i funkcji. Używamy Vitest jako naszego frameworka testowego.

### Uruchamianie testów jednostkowych

```bash
# Uruchomienie wszystkich testów
npm test

# Uruchomienie testów w trybie watch (obserwowanie zmian)
npm run test:watch

# Uruchomienie testów z interfejsem użytkownika
npm run test:ui

# Sprawdzenie pokrycia kodu testami
npm run test:coverage
```

### Struktura testów jednostkowych

- Pliki testowe powinny być umieszczone obok testowanych plików z rozszerzeniem `.test.ts` lub `.test.tsx`
- Używamy biblioteki `@testing-library/react` do testowania komponentów React
- Używamy biblioteki `@testing-library/user-event` do symulowania interakcji użytkownika
- Używamy biblioteki `msw` do mockowania żądań API

## Testy E2E (Playwright)

Testy E2E są używane do testowania całej aplikacji z perspektywy użytkownika. Używamy Playwright jako naszego frameworka E2E.

### Uruchamianie testów E2E

```bash
# Uruchomienie wszystkich testów E2E
npm run test:e2e

# Uruchomienie testów E2E z interfejsem użytkownika
npm run test:e2e:ui

# Generowanie kodu testów E2E przy użyciu codegen
npm run codegen
```

### Struktura testów E2E

- Testy E2E znajdują się w katalogu `e2e`
- Używamy wzorca Page Object Model (POM) do organizacji testów
- Pliki stron znajdują się w katalogu `e2e/pages`
- Dane testowe znajdują się w katalogu `e2e/fixtures`
- Funkcje pomocnicze znajdują się w katalogu `e2e/utils`

## Najlepsze praktyki

1. Testuj zachowanie, a nie implementację
2. Używaj testów jednostkowych dla logiki biznesowej i komponentów
3. Używaj testów E2E dla kluczowych ścieżek użytkownika
4. Izoluj testy, aby mogły być uruchamiane niezależnie
5. Mockuj zewnętrzne zależności w testach jednostkowych
6. Używaj rzeczywistych komponentów w testach jednostkowych, zamiast mockowanych
7. Twórz deterministyczne testy (bez losowości)
8. Unikaj testów, które zależą od konkretnych danych w bazie danych
9. Wykorzystuj porównania wizualne w testach E2E dla weryfikacji interfejsu użytkownika
10. Regularnie uruchamiaj testy jako część procesu CI/CD
