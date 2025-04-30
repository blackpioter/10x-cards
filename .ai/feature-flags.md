# Feature Flags System Plan

## Overview

Celem modułu feature flags jest rozdzielenie deploymentów od releasów poprzez wprowadzenie systemu flag funkcjonalności, umożliwiając łatwe włączanie/wyłączanie określonych funkcji w różnych środowiskach. System ten ma być używany na poziomie:

- Endpointów API (np. auth, generations, flashcards, openrouter)
- Stron Astro (np. login.astro, register.astro, forgot-password.astro)
- Komponentów React (np. TopNavbar.tsx)

## Wymagania

- Konfiguracja flag ustalana na etapie build time w module.
- Flagę, np. `registerEnabled`, sterującą dostępem do funkcji rejestracji.
- Obsługiwane środowiska: `dev`, `integration`, `production`. Możliwość rozszerzenia o kolejne środowiska w przyszłości.
- Środowisko określane przez zmienną PUBLIC_ENV_NAME (z użyciem import.meta.env lub process.env).
- Interfejs, który zwraca konfigurację dla danego środowiska.

## Plan Implementacji

1. Utworzenie modułu TypeScript (np. w `src/lib/featureFlags.ts`) do obsługi flag funkcjonalności, który będzie działał zarówno na frontendzie, jak i backendzie.

2. Definicja interfejsu `FeatureFlags`:
   - `registerEnabled: boolean` (kontrolujący możliwość rejestracji)
   - Możliwość dodania innych flag w przyszłości.

3. Utworzenie obiektu `FEATURE_CONFIG` jako mapowania środowiska na konfigurację flag:
   ```ts
   const FEATURE_CONFIG: Record<string, FeatureFlags> = {
     dev: {
       registerEnabled: true,
     },
     integration: {
       registerEnabled: false,
     },
     production: {
       registerEnabled: false,
     },
   };
   ```

4. Implementacja funkcji `getFeatureFlags(env: string): FeatureFlags | null`, która zwraca konfigurację dla zadanego środowiska lub null, jeśli środowisko nie jest skonfigurowane.

5. Implementacja funkcji `resolveCurrentEnv()`, która odczytuje aktualne środowisko z PUBLIC_ENV_NAME, używając `import.meta.env` lub `process.env`.

6. Eksportowanie stałych `currentEnv` i `currentFeatureFlags`, umożliwiających łatwy dostęp do aktualnej konfiguracji flag.

## Przykładowy Kod

```ts
export type Environment = 'dev' | 'integration' | 'production' | string;

export interface FeatureFlags {
  registerEnabled: boolean;
}

const FEATURE_CONFIG: Record<string, FeatureFlags> = {
  dev: {
    registerEnabled: true,
  },
  integration: {
    registerEnabled: false,
  },
  production: {
    registerEnabled: false,
  },
};

export function getFeatureFlags(env: string): FeatureFlags | null {
  return Object.hasOwnProperty.call(FEATURE_CONFIG, env)
    ? FEATURE_CONFIG[env]
    : null;
}

function resolveCurrentEnv(): string | null {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_ENV_NAME) {
    return import.meta.env.PUBLIC_ENV_NAME;
  } else if (typeof process !== 'undefined' && process.env && process.env.PUBLIC_ENV_NAME) {
    return process.env.PUBLIC_ENV_NAME;
  }
  return null;
}

export const currentEnv: string | null = resolveCurrentEnv();
export const currentFeatureFlags: FeatureFlags | null = currentEnv ? getFeatureFlags(currentEnv) : null;
```

## Kolejne Kroki

- Integracja modułu z endpointami API oraz stronami Astro i komponentami React (np. TopNavbar.tsx).
- Dalsze rozwijanie i rozszerzanie konfiguracji flag funkcjonalności w miarę potrzeb.
