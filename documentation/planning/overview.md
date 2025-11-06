# Implementation Overview

## Stack Shift Summary
- **Frontend**: Serve the dashboard via TanStack Start (`@tanstack/react-start` + file-based routing) with SSR loaders and React Query hydration.
- **Backend**: Replace the separate Express app with co-located server handlers, a shared 120-second cache, and `createServerFn` orchestrators under `src/data`, backed by the official OpenElectricity TypeScript SDK for Australian data.
- **UI**: Adopt Shadcn/UI components (see `ui-components-shadcn.md`) for cards, charts, and interactive controls.
- **State Management**: Centralize data access through custom hooks (`hooks-strategy.md`) backed by TanStack Query.

## Workstream Map
1. **Data Layer Foundations** – Build schemas, OpenElectricity fetchers, the 120-second AU cache, and dashboard orchestrators (`backend-services.md`, `backend-cache.md`).
2. **Frontend Loader & Query Wiring** – Implement the `/dashboard` route, SSR loader, and React Query integration (`frontend-data-fetching.md`).
3. **Hook Implementations** – Create reusable hooks for dashboard data and auto-refresh (`hooks-strategy.md`).
4. **UI Assembly** – Add Shadcn components, compose cards, charts, and controls (`ui-components-shadcn.md`).
5. **Polish & Resilience** – Error boundaries, skeletons, metrics logging, and operational hardening.

## Execution Sequencing
- Start by scaffolding the data modules so loader work has a stable contract.
- Implement server routes next to guarantee the frontend always hits a first-party endpoint for AU data.
- Wire the dashboard route with SSR + hydration, using hooks to abstract client logic.
- Assemble UI components and iterate on responsive layout.
- Finish with linting and documentation of env vars + data sources.

## Deliverables Checklist
- Normalized emissions payload available via `getDashboardSnapshot`.
- Documented NZ client-side fetch path plus `/api/emissions/au` endpoint backed by the shared 120-second cache with graceful degradation.
- `/dashboard` route rendering carbon intensity, generation mix chart, manual refresh, and optional auto-refresh.
- Shadcn UI integration with chart, cards, controls, and loading placeholders.
- Planning docs under `documentation/planning/` kept in sync with implementation.
