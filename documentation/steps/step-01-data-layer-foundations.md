# Step 01 – Data Layer Foundations

## Dependencies
- Requires clarity on upstream payload formats from OpenElectricity and Transpower (use existing planning notes as the source of truth).
- No code dependencies from other steps; this step unblocks all subsequent backend and frontend integration work.

## Completion Criteria
- Compiles with strongly typed schemas and shared helpers that downstream modules can import without duplication.
- Other modules can import a single source of truth for emissions-related types without duplicating definitions.
- Schema definitions cover both country-level snapshots and region-level Australian data (`QLD`, `NSW`, `VIC`, `SA`, `TAS`) to satisfy the `/api/emissions/australia` contract.

## Focus
Lay the groundwork for shared contracts so backend services, loaders, and hooks agree on the shape of emissions data and required environment configuration.

## Key Tasks

### 1.1 Define Core Emissions Types
- Create `src/types/emissions.ts` (or equivalent) with TypeScript types (and optional runtime guards) for `CountryEmissions`, `GenerationMix`, `RegionalBreakdown`, and error payloads referenced in planning docs.

### 1.2 Define AU Region Snapshot Structure
- Model a TypeScript shape that represents the required `/api/emissions/australia` payload, keyed by NEM region (`QLD`, `NSW`, `VIC`, `SA`, `TAS`) with nested metrics (generation mix, demand, carbon intensity, metadata) so downstream steps can normalize SDK data into this structure.

### 1.3 Map NZ Generation Feed
- Record the NZ EM6 generation feed structure using the provided sample: `items[]` (185 entries) with `trading_date`, `grid_zone_id`, `grid_zone_name`, and `generation_type[]` objects containing `<fuel>_wap` and `<fuel>_mwh`. Map fuel abbreviations (`bat`, `cg`, `cog`, `gas`, `geo`, `hyd`, `liq`, `sol`, `win`) to friendly enum values and define zero-value handling.

### 1.4 Map NZ Carbon Intensity Feed
- Document the `current_carbon_intensity` fields (`trading_date`, `trading_period`, `timestamp`, intensity metrics, renewable share, rolling averages) and decide how they fit into the shared schema.

### 1.5 Align Schema with OpenElectricity SDK
- Review the SDK response (`network_region`, `fueltech`, `power`, `emissions`, `interval`) and ensure the shared schema supports Australian carbon intensity, total demand, and generation mix derived from those columns.

### 1.6 Define Normalization Helpers
- Add reusable helpers (e.g., `src/lib/normalization.ts`) for unit conversions, metadata stamps, and labeling that other modules can import when shaping OpenElectricity and Transpower payloads.

### 1.7 Establish Type Barrels
- Add `src/types/index.ts` to re-export shared types/helpers so downstream imports stay concise.
