# 🌏 Live Emissions & Generation Mix Dashboard

## 🏢 Background

**Evnex** designs and manufactures smart EV chargers in New Zealand.
We use grid emissions data to:

* Optimize charging during low-emission periods
* Give customers real-time carbon insights
* Support decarbonization through smarter load management

---

## 🧠 Your Task

Build a **Live Emissions & Generation Mix Dashboard** comparing **New Zealand** and **Australia**.

---

## ✅ Core Requirements

* Display **current carbon intensity** for NZ and AU
* Show **generation mix** (chart or visualization)
* Enable **side-by-side comparison**
* Include a **manual refresh** button

---

## ✨ Optional Enhancements

* Auto-refresh every 5 minutes
* 24-hour historical trends
* Light animations or transitions
* Responsive design

---

## 📡 Data Sources

### 🇳🇿 New Zealand – Direct Frontend API Calls

Use **Transpower / EM6 APIs** directly from the frontend:

* Generation → `https://api.em6.co.nz/ords/em6/data_api/free/price?...`
* Carbon intensity → `https://api.em6.co.nz/ords/em6/data_api/current_carbon_intensity`

**Display:**

* Generation by fuel type (hydro, wind, gas, geothermal, coal)
* Total demand
* Carbon intensity (calculated or direct)

---

### 🇦🇺 Australia – Backend API (Required)

The **Australian data must be served from your own backend**, not fetched directly in the frontend.

#### Backend Requirements

* Use **Node.js + Express** (preferred) or any equivalent backend framework
* You may:

  * Fetch real data from [OpenElectricity](https://platform.openelectricity.org.au/)
  * Or **generate random/mock data** that resembles realistic values
* Normalize data to match the schema below
* Handle timeouts or missing data gracefully
* Expose one endpoint:

  ```
  GET /api/emissions/australia
  → returns { "QLD": {...}, "NSW": {...}, "VIC": {...}, "SA": {...}, "TAS": {...} }
  ```

> ⚠️ **If you run out of time or have API issues**, return a **hardcoded or randomly generated response**.
> Just note this in your README.

The frontend must always call this endpoint for AU data.

---

## 💻 UI Specification

### Country Comparison

* Two columns: **NZ** (direct API) vs **AU** (backend-fed)
* Each shows current carbon intensity and generation mix

### Carbon Intensity Card

* Prominent gCO₂/kWh value
* Color indicator (green < 100, yellow 100–500, red > 500)
* Timestamp of last update
* Optional: 24-hour trend

### Generation Mix Chart

* % by fuel type (pie/bar)
* MW values (optional)
* Renewable vs non-renewable ratio (optional)

### Refresh

* Manual refresh button
* Optional: auto-refresh every 5 minutes

---

## 🧱 Example Schema

```ts
interface CountryEmissions {
  country: "NZ" | "AU";
  timestamp: string;
  totalDemandMW: number;
  carbonIntensity_gCO2kWh: number;
  generationMix: {
    hydro?: number;
    wind?: number;
    solar?: number;
    gas?: number;
    coal?: number;
    geothermal?: number;
    other?: number;
  };
}
```

---

## 🧪 Implementation Notes

* **Frontend:** any stack (we use React + TypeScript + Material UI internally)
* **Backend:** required for AU data only
* **APIs:** may be mocked or random if unavailable
* **Timebox:** typically ≤ 8 hours
* **AI use:** allowed, must disclose

---

## 📤 Submission

Submit via **GitHub** by providing us a public link to your repo, including:

### `README.md`

* Setup and run instructions for frontend and backend

---

## 🔗 References

**New Zealand**

* [Transpower Live Data](https://www.transpower.co.nz/system-operator/live-system-and-market-data/consolidated-live-data)
* [EM6 Dashboard](https://app.em6.co.nz/)
* [Electricity Authority](https://www.ea.govt.nz/)

**Australia**

* [AEMO Dashboard](https://aemo.com.au/en/energy-systems/electricity/national-electricity-market-nem/data-nem/data-dashboard-nem)
* [OpenNEM](https://opennem.org.au/)

---

## 🚀 Questions

Contact us for clarification on API or technical details.

**Good luck.** We’re looking for clear data flow, clean structure, and practical problem-solving.
