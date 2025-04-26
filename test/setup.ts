import { expect, afterEach, afterAll, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Extend Vitest with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Configure MSW (Mock Service Worker) for API mocking
export const restHandlers = [
  // Example API handlers
  http.get("/api/example", () => {
    return HttpResponse.json({ message: "Mocked response" });
  }),
];

const server = setupServer(...restHandlers);

// Start and stop MSW server
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
