# Testing Setup & Developer Guide

## 1. Unit & Integration Testing (Vitest)
- **Test Runner:** [Vitest](https://vitest.dev/) is used for all unit and integration tests.
- **Config:** See `vitest.config.ts` for setup. Uses Astro’s `getViteConfig`. Test environment is `node`, globals enabled, coverage via V8 (`text` and `html`). Loads environment variables from `src/tests/setup/setup-env.ts`.
- **Supabase Mocking:** All Supabase interactions are mocked using Vitest’s `vi.mock` in `src/tests/mocks/supabase.ts`. This ensures tests are fast, isolated, and do not hit real Supabase services.
- **Test Locations:**
  - API route tests: `src/tests/api/`
  - Utility tests: alongside utility files (e.g., `src/utils/date.test.ts`)

## 2. End-to-End (E2E) Testing (Playwright)
- **Test Runner:** [Playwright](https://playwright.dev/) is set up for browser-based E2E tests.
- **Config:** See `playwright.config.ts`. Test directory: `src/tests/e2e/`. Uses the Astro dev server (`npm run dev`) as the web server (Netlify adapter does not support `npm run preview`). Base URL: `http://localhost:4321`.
- **Test Example:** `auth.spec.ts` verifies the `/signin` page loads and displays the correct title/button.
- **How to Run:**
  - `npx playwright test` (runs E2E tests)
  - `npx vitest` (runs unit/integration tests)

## 3. General Practices
- **Naming:**
  - Use `*.test.ts` for Vitest (unit/integration/component).
  - Use `*.spec.ts` for Playwright (E2E).
- **Mocking:** Mock external services (like Supabase) for fast, reliable tests.
- **Coverage:** Run `npx vitest run --coverage` for coverage reports.

## 4. Next Steps for New Devs
- Add new tests in the appropriate directories.
- For new API routes, create corresponding tests in `src/tests/api/`.
- For new utilities, add unit tests alongside the utility file.
- For new user flows, add E2E tests in `src/tests/e2e/`.
- If you add new environment variables, update `setup-env.ts`.

---

**Summary:**
This project uses Vitest for backend/unit tests (with Supabase mocking) and Playwright for E2E browser tests. All configs and examples are in place—just follow the patterns to add more tests as you develop!
