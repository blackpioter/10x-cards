import { expect, afterEach, afterAll, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Rozszerzenie Vitest o matchers z Testing Library
expect.extend(matchers);

// Czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Konfiguracja MSW (Mock Service Worker) dla mockowania API
export const restHandlers = [
  // Przykładowe handlery API
  http.get("/api/example", () => {
    return HttpResponse.json({ message: "Mocked response" });
  }),
];

const server = setupServer(...restHandlers);

// Startowanie i zatrzymywanie serwera MSW
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
