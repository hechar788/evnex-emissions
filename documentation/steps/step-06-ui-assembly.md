# Step 06 – UI Assembly

## Dependencies
- Requires Step 05 hooks for data consumption and refresh logic.
- Depends on Step 04 route outputs to supply initial data to components.

## Completion Criteria
- The dashboard renders all primary widgets (cards, charts, tables) with interactive controls wired to hooks.
- UI adheres to Shadcn conventions, providing consistent spacing, typography, and accessible states.

## Focus
Compose the dashboard interface with Shadcn components, charts, and layout primitives to deliver the planned visual experience.

## Key Tasks

### 6.1 Import Shadcn Components
- Install/import required Shadcn registry components (`card`, `chart`, `tabs`, `table`, `skeleton`, `button`, `toggle/switch`, `dropdown-menu`, `tooltip`, `badge`, `dialog`, `alert`, `toast`, `progress`, etc.) and consolidate exports under `src/components/ui`.

### 6.2 Build Dashboard Cards & Charts
- Construct cards for carbon intensity, generation mix, and demand using Shadcn `Card` structures and integrate chart components fed by hook data.

### 6.3 Implement Interaction Controls
- Add manual refresh buttons, auto-refresh toggles, region selectors, and tooltips using the planned interaction components.

### 6.4 Ensure Responsive Layout
- Apply Shadcn utilities (`separator`, `aspect-ratio`, `scroll-area`, `resizable`) and Tailwind classes to maintain consistent mobile/desktop experiences.

### 6.5 Document Styling Decisions
- Capture color tokens and typography choices (e.g., intensity thresholds) near the implementation or in shared styles for reuse.
