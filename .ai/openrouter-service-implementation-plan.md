# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter umożliwia integrację z interfejsem API OpenRouter w celu uzupełniania czatów opartych na LLM. Pozwala na wysyłanie zapytań z komunikatami systemowymi oraz użytkownika, a otrzymywana odpowiedź jest przetwarzana i walidowana zgodnie z predefiniowanym schematem JSON. Usługa jest implementowana przy użyciu Astro 5, React 19, TypeScript 5, Tailwind 4 oraz komponentów Shadcn/ui.

## 2. Opis konstruktora
Konstruktor usługi inicjalizuje wszystkie niezbędne parametry:
- Ustawia adres bazowy API oraz klucz autoryzacyjny (przechowywany jako zmienna środowiskowa).
- Definiuje nazwę modelu (np. `openrouter-chat-001`) oraz domyślne parametry modelu (np. `{ temperature: 0.7, max_tokens: 150 }`).
- Inicjalizuje mechanizmy logowania oraz obsługi błędów, takie jak retry logic i timeouts.

## 3. Publiczne metody i pola
**Metody:**
1. `initialize(apiKey: string, config: object)`: Inicjalizuje usługę i weryfikuje konfigurację.
2. `setSystemMessage(message: string)`: Ustawia komunikat systemowy, który nadaje ton całej konwersacji.
3. `sendUserMessage(message: string)`: Ustawia komunikat użytkownika przekazywany do API.
4. `setModelParameters(params: object)`: Konfiguruje parametry modelu, np. temperaturę i maksymalną liczbę tokenów.
5. `callAPI()`: Wysyła przygotowany payload do API OpenRouter i oczekuje na odpowiedź.
6. `getResponse()`: Pobiera i przetwarza odpowiedź z API, walidując ją zgodnie z ustalonym JSON schema.

**Pola:**
- `apiKey`: Klucz autoryzacyjny do API OpenRouter.
- `baseUrl`: Adres bazowy API.
- `modelName`: Nazwa modelu (np. `openrouter-chat-001`).
- `modelParams`: Parametry modelu.
- `systemMessage`: Komunikat systemowy.
- `userMessage`: Komunikat użytkownika.

## 4. Prywatne metody i pola
**Metody:**
1. `_preparePayload()`: Łączy komunikaty systemowy i użytkownika, nazwę modelu oraz parametry modelu w jeden spójny payload.
2. `_handleResponse(response: object)`: Przetwarza odpowiedź API, mapując dane do predefiniowanego schematu.
3. `_validateResponse(response: object)`: Waliduje odpowiedź przy użyciu schematu JSON. Przykładowy schemat:
   ```json
   { "type": "json_schema", "json_schema": { "name": "chatResponse", "strict": true, "schema": { "answer": "string", "references": "array" } } }
   ```
4. `_processError(error: Error)`: Centralny mechanizm obsługi błędów, który loguje szczegóły błędu i generuje przyjazne komunikaty dla użytkownika.

**Pola:**
- `_logger`: Mechanizm logowania błędów i zdarzeń.
- `_retries`: Liczba ponownych prób w przypadku awarii żądania.
- `_timeout`: Określenie maksymalnego czasu oczekiwania na odpowiedź API.

## 5. Obsługa błędów
Potencjalne scenariusze błędów oraz ich rozwiązania:
1. **Błąd połączenia (network error):**
   - Rozwiązanie: Implementacja retry logic z wykładniczym opóźnieniem.
2. **Błąd autentykacji (nieprawidłowy klucz API):**
   - Rozwiązanie: Walidacja klucza API podczas inicjalizacji i zwracanie szczegółowych komunikatów błędów.
3. **Błąd walidacji odpowiedzi (schema mismatch):**
   - Rozwiązanie: Użycie narzędzi walidacyjnych (np. ajv) do sprawdzania zgodności odpowiedzi z predefiniowanym schematem.
4. **Timeout lub przekroczenie limitu tokenów:**
   - Rozwiązanie: Implementacja limitów czasowych oraz alternatywnych ścieżek obsługi.
5. **Inne nieprzewidziane błędy:**
   - Rozwiązanie: Centralny mechanizm obsługi wyjątków agregujący i logujący wszystkie błędy.

## 6. Kwestie bezpieczeństwa
- Przechowywanie klucza API jako zmiennej środowiskowej, unikanie hardkodowania w kodzie źródłowym.
- Weryfikacja i walidacja wszystkich danych wejściowych aby zapobiec atakom typu injection.
- Implementacja mechanizmów rate limiting w celu ochrony przed nadużyciami.
- Zapewnienie bezpiecznej komunikacji poprzez HTTPS oraz regularne audyty bezpieczeństwa.
- Bezpieczne logowanie błędów, tak aby nie ujawniać wrażliwych informacji.

## 7. Plan wdrożenia krok po kroku
1. **Przygotowanie środowiska:**
   - Skonfigurować zmienne środowiskowe zawierające klucz API oraz adres bazowy API OpenRouter.
2. **Implementacja modułu OpenRouter:**
   - Utworzyć moduł w katalogu `/src/lib` lub `/src/components` zgodnie ze strukturą projektu.
   - Zaimplementować konstruktor oraz wszystkie metody publiczne i prywatne zgodnie z powyższą specyfikacją.
3. **Implementacja payload buildera:**
   - Połączyć elementy takie jak: komunikat systemowy, komunikat użytkownika, nazwa modelu, parametry modelu i response_format.
   - Przykłady:
     1. Komunikat systemowy: "System: Proszę o dokładną odpowiedź w formacie JSON."
     2. Komunikat użytkownika: "Użytkownik: Wyjaśnij, jak działa integracja OpenRouter."
     3. Response_format: `{ type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { answer: 'string', references: 'array' } } }`
     4. Nazwa modelu: "openrouter-chat-001"
     5. Parametry modelu: `{ temperature: 0.7, max_tokens: 150 }`
4. **Implementacja mechanizmów obsługi błędów:**
   - Zaimplementować retry logic, timeout oraz centralny logger do rejestrowania błędów.
5. **Audyt bezpieczeństwa:**
   - Dokonać przeglądu kodu pod kątem zabezpieczeń i walidacji danych wejściowych.
