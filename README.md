# Emissions Dashboard - Implementation Guide

## Overview

This project is a **Live Emissions & Generation Mix Dashboard** that displays real-time electricity carbon intensity and generation data for **Australia** and **New Zealand**. It provides side-by-side comparison capabilities, regional breakdowns, and visualizations of the electricity generation mix.

## ✨ Features

This dashboard provides real-time electricity emissions and generation data for **Australia** and **New Zealand**, enabling side-by-side comparison and detailed regional analysis.

### Real-Time Data Display

* **Carbon Intensity**: Current emissions in gCO₂/kWh with color-coded severity indicators
* **Total Demand**: Real-time electricity demand in megawatts (MW)
* **Generation Mix**: Visual breakdown of electricity generation by fuel type (hydro, wind, solar, gas, coal, geothermal, etc.)
* **Renewable Share**: Percentage of renewable energy in the generation mix

### Dashboard Views

* **Australia Tab**: Comprehensive view of Australian NEM data with regional breakdowns for QLD, NSW, VIC, SA, and TAS
* **New Zealand Tab**: National-level metrics and generation mix for New Zealand
* **Compare Tab**: Side-by-side comparison of both countries with synchronized metrics

### Interactive Features

* **Manual Refresh**: On-demand data updates with loading states
* **Auto-Refresh**: Optional automatic updates every 5 minutes
* **Regional Breakdown**: Detailed regional statistics for Australian states
* **Data Freshness Indicators**: Timestamps showing when data was last fetched and updated
* **Error Handling**: Graceful error states with retry functionality

### Visualizations

* **Generation Mix Charts**: Interactive pie and bar charts showing fuel type distribution
* **Quick Stats Cards**: At-a-glance metrics for carbon intensity, demand, and renewable share
* **Comparison Cards**: Side-by-side metric comparisons with visual indicators
* **Responsive Design**: Optimized for desktop, tablet, and mobile devices

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- OpenElectricity API key (get one from [OpenElectricity Platform](https://platform.openelectricity.org.au/))

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd evnex-emissions
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory:
   ```bash
   # Create .env file
   touch .env
   ```

4. **Add your OpenElectricity API key** to the `.env` file:
   ```env
   OPEN_ELECTRICITY_API_KEY=your_api_key_here
   ```
   
   > **Important**: Replace `your_api_key_here` with your actual OpenElectricity API key. The API key is required for fetching Australian emissions data. Without it, the application will throw an error when trying to load AU data.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to:
   ```
   http://localhost:3000/dashboard
   ```

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests

---

## What's Implemented

### Core Features

1. **Real-Time Emissions Dashboard**
   - Current carbon intensity (gCO₂/kWh) for both countries
   - Total demand in megawatts (MW)
   - Generation mix breakdown by fuel type
   - Timestamp tracking for data freshness

2. **Country-Specific Data Sources**
   - **Australia**: Fetched via backend API using the OpenElectricity SDK
     - Data aggregated from the National Electricity Market (NEM)
     - Regional breakdowns for QLD, NSW, VIC, SA, and TAS
     - 5-minute interval updates
   - **New Zealand**: Fetched directly from frontend using Transpower/EM6 APIs
     - Real-time carbon intensity from EM6 API
     - Generation data from Transpower API
     - Client-side data transformation

3. **Dashboard Views**
   - **Australia Tab**: Shows AU-specific metrics, generation mix chart, and regional breakdown
   - **New Zealand Tab**: Shows NZ-specific metrics and generation mix
   - **Compare Tab**: Side-by-side comparison of both countries

4. **UI Components**
   - Quick statistics cards (carbon intensity, demand, renewable share)
   - Generation mix charts (pie/bar visualizations using Recharts)
   - Regional breakdown tables
   - Comparison view with side-by-side metrics
   - Manual refresh button with loading states
   - Stale data warnings

5. **Technical Architecture**
   - **Server-Side Rendering (SSR)**: Using TanStack Router with SSR support
   - **Data Fetching**: React Query for caching and state management
   - **API Route**: `/api/emissions/au` serves Australian data from backend
   - **Client Hydration**: React Query cache seeded during SSR for instant rendering
   - **Error Handling**: Graceful error states and retry logic

### Technology Stack

- **Framework**: TanStack Start (React with SSR)
- **Routing**: TanStack Router
- **Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **TypeScript**: Full type safety throughout
- **API Integration**: 
  - OpenElectricity SDK (v0.7.1-0) for Australian data
  - Direct HTTP calls to EM6/Transpower APIs for New Zealand data

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── CompareView.tsx
│   │   ├── GenerationMix.tsx
│   │   ├── QuickStats.tsx
│   │   └── RegionalBreakdown.tsx
│   └── ui/                 # shadcn/ui components
├── data/
│   └── openelectricity/    # OpenElectricity SDK integration
│       ├── client.ts       # SDK client singleton
│       ├── aggregation.ts  # Data transformation
│       └── ...
├── hooks/
│   ├── useAuData.ts        # Australian data hook
│   └── useNzData.ts        # New Zealand data hook
├── routes/
│   ├── dashboard.tsx       # Main dashboard route
│   └── api.emissions.au.ts # Backend API endpoint
└── types/                  # TypeScript type definitions
```

## Data Flow

### Australia Data Flow

1. **SSR Loader** (`/dashboard` route) fetches from `/api/emissions/au`
2. **API Route** (`/api/emissions/au`) calls `loadAuSnapshot()`
3. **Server Module** uses OpenElectricity SDK to fetch NEM data
4. **Data Transformation** normalizes API response to `CountryEmissionsSnapshot`
5. **React Query Cache** is seeded with snapshot data
6. **Client Hydration** renders immediately from cache
7. **Manual Refresh** triggers new fetch via React Query

### New Zealand Data Flow

1. **Client-Side Hook** (`useNzData`) fetches directly from EM6 APIs
2. **Parallel Requests** to carbon intensity and generation endpoints
3. **Data Transformation** normalizes EM6 response format
4. **React Query** caches and manages state
5. **Components** consume data via hook

## API Endpoints

### Internal API

- `GET /api/emissions/au` - Returns Australian emissions snapshot
  - Response: `CountryEmissionsSnapshot` JSON
  - Cache-Control: 5 minutes
  - Requires: `OPEN_ELECTRICITY_API_KEY` environment variable

### External APIs (NZ)

- `GET https://api.em6.co.nz/ords/em6/data_api/current_carbon_intensity` - NZ carbon intensity
- `GET https://api.em6.co.nz/ords/em6/data_api/free/price` - NZ generation data

## Troubleshooting

### Common Issues

1. **"OPEN_ELECTRICITY_API_KEY environment variable is required"**
   - Ensure you've created a `.env` file in the root directory
   - Verify the key is set as `OPEN_ELECTRICITY_API_KEY=your_key`
   - Restart the development server after creating/modifying `.env`

2. **Australian data not loading**
   - Check that your OpenElectricity API key is valid
   - Verify network connectivity
   - Check browser console and server logs for error messages

3. **New Zealand data not loading**
   - EM6 APIs may be temporarily unavailable
   - Check browser console for CORS or network errors
   - The app will show loading states if data is unavailable
   

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPEN_ELECTRICITY_API_KEY` | Yes | API key for OpenElectricity platform (Australian data) |

## Notes

- The application uses SSR for Australian data to improve initial load performance
- New Zealand data is fetched client-side as per requirements
- Data is cached for 5 minutes to match OpenElectricity's update cadence
- The dashboard includes manual refresh functionality
- All data transformations handle missing or malformed API responses gracefully

