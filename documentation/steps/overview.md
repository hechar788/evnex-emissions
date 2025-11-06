# Implementation Steps Overview

**Step 01 – Data Layer Foundations**
- Establish shared schemas and type contracts under `src/data` so every layer agrees on the payload shape.
- Expected outcome: Strongly typed `CountryEmissions` models with validated config inputs ready for backend fetchers to consume.

**Step 02 – Caching & OpenElectricity Fetchers**
- Build the in-memory cache helpers and the OpenElectricity TypeScript SDK wrapper that normalizes AU data into the shared schema.
- Expected outcome: Resilient cache-backed fetch API returning normalized AU snapshots with TTL metadata.

**Step 03 – Server Routes & Orchestrators**
- Wire `createServerFn` orchestration helpers and REST endpoints that expose cached AU data to loaders and external callers.
- Expected outcome: `/api/emissions/au` and dashboard server functions consistently sourcing data via the cache layer.

**Step 04 – Dashboard Loader & Hydration**
- Implement the `/dashboard` route loader and React Query hydration path to deliver SSR-first data.
- Expected outcome: Dashboard route renders with preloaded snapshot data and client cache primed for post-hydration updates.

**Step 05 – Dashboard Hooks**
- Create reusable hooks that wrap query access, auto-refresh, and derived country breakdown logic.
- Expected outcome: Components can pull normalized data, control refresh cadence, and access derived metrics through typed hooks.

**Step 06 – UI Assembly**
- Integrate Shadcn components, charts, and controls to present the dashboard experience across cards, tables, and charts.
- Expected outcome: Production-ready dashboard UI with consistent styling, responsive layout, and interactive controls.

**Step 07 – Polish & Resilience**
- Add error boundaries, loading states, metrics logging, and manual refresh UX enhancements.
- Expected outcome: Dashboard gracefully handles degraded upstreams, surfaces freshness metadata, and logs cache behaviour.
