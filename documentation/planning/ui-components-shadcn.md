# Shadcn/UI Component Plan

We catalogued the available registry items via:

```bash
npx shadcn@latest list @shadcn
```

From the 449 items returned, the components below map directly to the dashboard requirements.

## Core Display Components
| Component | Purpose | `shadcn add` Argument | Notes |
| --- | --- | --- | --- |
| Card | Wrap the carbon intensity and demand widgets. | `@shadcn/card` | Combine with `card-header`, `card-content` slots for consistent spacing. |
| Chart | Render the generation mix comparison (stacked bar / donut). | `@shadcn/chart` | Uses `recharts` under the hood; aligns with the user's chart preference. |
| Tabs | Switch between NZ vs AU or between overview/history panels. | `@shadcn/tabs` | Works well to keep the layout compact on mobile. |
| Table | Present regional AU breakdowns in a sortable grid. | `@shadcn/table` | Pair with `useReactTable` or simple `<Table>` API. |
| Skeleton | Loading placeholders while queries refetch. | `@shadcn/skeleton` | Mirror final dimensions to avoid layout shift. |

## Interaction & Controls
| Component | Purpose | `shadcn add` Argument | Notes |
| --- | --- | --- | --- |
| Button | Manual refresh + navigation CTAs. | `@shadcn/button` | Use `variant="outline"` for refresh to match card styling. |
| Toggle | Enable/disable auto refresh. | `@shadcn/toggle` | Alternative: `@shadcn/switch` if we prefer a switch UI. |
| Dropdown Menu | Pick AU state focus or data source (live vs mock). | `@shadcn/dropdown-menu` | Anchor to button; supports keyboard navigation. |
| Tooltip | Explain metrics (e.g. carbon intensity thresholds). | `@shadcn/tooltip` | Wrap icons, chart segments, and refresh control. |
| Badge | Highlight renewable share, stale data indicator. | `@shadcn/badge` | Pair with color tokens for severity (success/warning/destructive). |
| Dialog | Show detailed methodology or data-source notes. | `@shadcn/dialog` | Use to surface disclaimers without navigating away. |

## Feedback & Status
| Component | Purpose | `shadcn add` Argument | Notes |
| --- | --- | --- | --- |
| Alert | Display fallback status when upstream APIs fail. | `@shadcn/alert` | Compose inside cards with `destructive` variant. |
| Toast | Notify users when data refresh succeeds/fails. | `@shadcn/sonner` or `@shadcn/toast` | Keep toasts short-lived, accessible. |
| Progress | Visualize auto-refresh countdown or request latency. | `@shadcn/progress` | Optionally place beneath the refresh button. |

## Layout & Decorative Utilities
- `@shadcn/separator` for dividing card sections (e.g. metrics vs mix chart).
- `@shadcn/aspect-ratio` to maintain chart proportions in responsive layouts.
- `@shadcn/scroll-area` for overflow lists (e.g. historical events) inside cards.
- `@shadcn/resizable` if we want draggable panels between NZ and AU columns.

## Icons
- Continue using `lucide-react` (already installed) alongside Shadcn components for status icons.

## Implementation Notes
- Keep Shadcn styles centralized by importing base styles via `@shadcn/style`; TanStack Start already wires Tailwind so no extra setup.
- After adding components, re-export from `src/components/ui/index.ts` to keep import paths clean (`import { Card } from '@/components/ui/card'`).
- Document color usage for carbon intensity (green/yellow/red) inside `src/styles.css` or Tailwind config overrides.
