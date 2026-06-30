# GridFlow

A Smartsheet-inspired collaborative project grid where a team's rows and its AI
agents work the same surface — people keep the judgment, agents take the busywork.

Built as a portfolio piece for the **Software Engineer – Frontend** role at
Smartsheet (Bellevue, WA). Every choice maps to the posting's stack and
responsibilities.

## Stack

- **React 18 + TypeScript** — modular, typed components
- **Redux Toolkit** — feature-sliced store, async thunks, memoized selectors
- **Jest + React Testing Library** — unit, component, and integration tests
- **JSON API contract** — typed shapes shared with a mocked Kotlin/Java back end,
  asserted in both `ts-jest` and a Postman collection
- **Vite** — dev server + production build
- **GitHub Actions** — CI/CD: typecheck → lint → coverage → build → deploy

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm test         # run the full test suite
npm run test:coverage   # tests + coverage report
npm run lint     # eslint
npm run typecheck       # tsc --noEmit
npm run build    # production build to dist/
```

## How it maps to the role

| Requirement | Where it shows up |
|---|---|
| HTML, CSS, React, Redux | `src/components`, `src/features`, `src/styles` |
| Collaborate on design + testing of features | Component + integration tests in `src/components` |
| JSON for software components | `src/types`, `src/api/client.ts` |
| Jest + React Testing Library | `*.test.tsx`, `src/test/renderWithStore.tsx` |
| Postman for API contract testing | `postman/GridFlow.postman_collection.json` + `src/api/contract.test.ts` |
| CI/CD for tests, linting, deployment | `.github/workflows/ci.yml` |
| Integrate with back-end services on AWS | Mock client in `src/api/client.ts`; deploy stage targets S3/CloudFront |

## Project layout

```
src/
  api/        mock client + JSON contract tests
  components/ presentational + container components and their tests
  features/   redux slices (sheet, agents), selectors
  store/      store factory + typed hooks
  styles/     design tokens + component styles
  test/       jest setup + render-with-store helper
  types/      shared JSON domain model
postman/      contract test collection
.github/      CI/CD workflow
```

## Notes

- The API layer is mocked in-memory so the demo runs with no external services.
  In production those calls would hit the Kotlin/Java services named in the role;
  the JSON contract and Postman collection are written so the front end and back
  end can be verified against the same shapes.
- ~98% statement coverage; thresholds enforced in `jest.config.mjs`.
