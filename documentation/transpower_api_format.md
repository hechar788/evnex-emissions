# Transpower/EM6 API Format Documentation

This document describes the data format returned by the Transpower EM6 APIs used for New Zealand carbon intensity and generation data.

## API Endpoints

### 1. Current Carbon Intensity

**Endpoint:** `https://api.em6.co.nz/ords/em6/data_api/current_carbon_intensity`

**Method:** GET

**Description:** Returns the current carbon intensity for New Zealand's electricity grid.

#### Response Format

```json
{
  "items": [
    {
      "trading_date": "2025-11-09T11:00:00Z",
      "trading_period": 34,
      "timestamp": "2025-11-10T03:30:00Z",
      "nz_carbon_t": 113.55,
      "nz_carbon_gkwh": 41.07,
      "nz_carbon_gkwh_prev": 32.56,
      "nz_carbon_change_gkwh": 8.51,
      "nz_renewable": 95.14,
      "max_24hrs_gkwh": 41.07,
      "min_24hrs_gkwh": 12.98,
      "current_month_avg_gkwh": 23.86,
      "current_year_avg_gkwh": 90.54,
      "pct_current_year_gkwh": 18.14
    }
  ],
  "hasMore": false,
  "limit": 100,
  "offset": 0,
  "count": 3,
  "links": [...]
}
```

#### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `trading_date` | ISO 8601 DateTime | Trading date for the data point |
| `trading_period` | number | Trading period number (1-50) |
| `timestamp` | ISO 8601 DateTime | Actual timestamp of the data |
| `nz_carbon_t` | number | Total carbon emissions in tonnes |
| `nz_carbon_gkwh` | number | **Current carbon intensity in gCO₂/kWh** ⭐ |
| `nz_carbon_gkwh_prev` | number | Previous period's carbon intensity |
| `nz_carbon_change_gkwh` | number | Change in carbon intensity from previous period |
| `nz_renewable` | number | **Renewable generation percentage** ⭐ |
| `max_24hrs_gkwh` | number | Maximum carbon intensity in the last 24 hours |
| `min_24hrs_gkwh` | number | Minimum carbon intensity in the last 24 hours |
| `current_month_avg_gkwh` | number | Average carbon intensity for current month |
| `current_year_avg_gkwh` | number | Average carbon intensity for current year |
| `pct_current_year_gkwh` | number | Percentage relative to year average |

#### Notes

- The `items` array typically contains the 3 most recent trading periods
- The first item (index 0) is the most recent data point
- Carbon intensity is measured in grams of CO₂ per kilowatt-hour (gCO₂/kWh)
- Renewable percentage is a value from 0-100

---

### 2. Generation Data (Price)

**Endpoint:** `https://api.em6.co.nz/ords/em6/data_api/free/price`

**Method:** GET

**Description:** Returns generation data by fuel type with weighted average prices.

#### Response Format

```json
{
  "items": [
    {
      "trading_date": "2025-11-09T11:00:00Z",
      "grid_zone_id": 15,
      "grid_zone_name": "NZ",
      "generation_type": [
        {
          "bat_wap": 158.57,
          "bat_mwh": 60.06
        },
        {
          "cg_wap": 0,
          "cg_mwh": 0
        },
        {
          "cog_wap": 128.83,
          "cog_mwh": 990.27
        },
        {
          "gas_wap": 147.16,
          "gas_mwh": 2302.6
        },
        {
          "geo_wap": 121.19,
          "geo_mwh": 12898.96
        },
        {
          "hyd_wap": 116.28,
          "hyd_mwh": 55876.45
        },
        {
          "liq_wap": 0,
          "liq_mwh": 0
        },
        {
          "sol_wap": 153.57,
          "sol_mwh": 733.39
        },
        {
          "win_wap": 119.29,
          "win_mwh": 7857.54
        }
      ]
    }
  ],
  "hasMore": false,
  "limit": 0,
  "offset": 0,
  "count": 185,
  "links": [...]
}
```

#### Fuel Type Codes

| Code | Full Name | Description |
|------|-----------|-------------|
| `bat` | Battery | Battery storage discharge |
| `cg` | Coal/Gas | Combined coal and gas (legacy) |
| `cog` | Co-generation | Co-generation plants |
| `gas` | Gas | Natural gas turbines |
| `geo` | Geothermal | Geothermal power |
| `hyd` | Hydro | Hydroelectric power |
| `liq` | Liquid | Diesel/liquid fuels |
| `sol` | Solar | Solar photovoltaic |
| `win` | Wind | Wind turbines |

#### Field Structure

Each generation type object contains:
- `{type}_wap`: Weighted average price in $/MWh
- `{type}_mwh`: Total generation in megawatt-hours

#### Notes

- `grid_zone_id: 15` represents the entire New Zealand grid
- `grid_zone_name: "NZ"` confirms national-level data
- Generation values are in MWh (megawatt-hours)
- Price values are in NZD per MWh
- Zero values indicate no generation from that source during the trading period

---

## Usage in Code

### Extracting Carbon Intensity

```typescript
const carbonData = await fetch(
  'https://api.em6.co.nz/ords/em6/data_api/current_carbon_intensity'
).then(res => res.json())

// Get the most recent data point
const latest = carbonData.items[0]

const carbonIntensity = latest.nz_carbon_gkwh        // e.g., 41.07
const renewableShare = latest.nz_renewable           // e.g., 95.14
const previousIntensity = latest.nz_carbon_gkwh_prev // e.g., 32.56
const change = latest.nz_carbon_change_gkwh          // e.g., 8.51
```

### Calculating Total Demand

```typescript
const generationData = await fetch(
  'https://api.em6.co.nz/ords/em6/data_api/free/price'
).then(res => res.json())

const latest = generationData.items[0]
const generationTypes = latest.generation_type

// Sum all generation to get total demand
const totalDemandMWh = generationTypes.reduce((sum, type) => {
  // Each type has a {type}_mwh field
  const mwhKey = Object.keys(type).find(key => key.endsWith('_mwh'))
  return sum + (mwhKey ? type[mwhKey] : 0)
}, 0)

// Convert daily MWh total to average MW (divide by 24 hours)
// Note: This endpoint returns daily aggregates, not trading period data
const totalDemandMW = totalDemandMWh / 24
```

### Calculating Renewable Share (Alternative Method)

```typescript
// Renewable sources: geo, hyd, sol, win
// Non-renewable: bat (storage), cg, cog, gas, liq

const renewableSources = ['geo', 'hyd', 'sol', 'win']
const generationTypes = latest.generation_type

let renewableGeneration = 0
let totalGeneration = 0

generationTypes.forEach(type => {
  const mwhKey = Object.keys(type).find(key => key.endsWith('_mwh'))
  if (!mwhKey) return

  const mwh = type[mwhKey]
  totalGeneration += mwh

  const fuelType = mwhKey.replace('_mwh', '')
  if (renewableSources.includes(fuelType)) {
    renewableGeneration += mwh
  }
})

const renewablePercentage = (renewableGeneration / totalGeneration) * 100
```

---

## Data Update Frequency

- Carbon intensity data: Updates every 30 minutes (aligned with trading periods)
- Generation data: Updates every 30 minutes (aligned with trading periods)
- New Zealand electricity market has 48 trading periods per day (30 minutes each)

## Data Quality Notes

1. **Timestamp Accuracy**: Always use the `timestamp` field rather than `trading_date` for precise temporal data
2. **Array Ordering**: Items are ordered with the most recent data first (index 0)
3. **Zero Values**: Zero generation from a fuel type is normal and indicates no generation during that period
4. **Battery Storage**: `bat_mwh` represents discharge (positive) or charge (negative)

## API Limitations

- No authentication required for these free/public endpoints
- Rate limits may apply (not documented)
- Historical data availability varies by endpoint
- Regional breakdown data (North Island/South Island) requires different endpoints (not documented here)

## References

- EM6 API Portal: https://api.em6.co.nz/ords/em6/
- Transpower: https://www.transpower.co.nz/
- Electricity Authority: https://www.ea.govt.nz/
