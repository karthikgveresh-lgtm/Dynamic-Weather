# 🌍 Dynamic Weather & Travel Dashboard

A premium, interactive web application that integrates weather forecasting, geo-routing, and place discovery into a unified travel planning dashboard. The interface adapts dynamically in real-time according to the selected city's weather conditions.

## 🚀 Key Features

* **Weather-Adaptive UI:** The dashboard automatically updates its color palette, gradients, and icons based on the current weather (Clear, Cloudy, Foggy, Rainy, Snowy).
* **Live Interactive Mapping:** Powered by Leaflet, displaying custom markers for points of interest (POIs) and precise route lines.
* **Route Calculation & Navigation Simulation:** Calculates route distance, duration, and paths using the TomTom Routing API. Includes a live driving simulator to preview journeys.
* **Smart Place Discovery:** Fetches nearby attractions (Religious, Historic, Parks, etc.) via the TomTom Search API and enriches them with descriptions and live photos from Wikipedia.
* **Live GPS Tracking:** Integrates the browser's Geolocation API to update weather and discover attractions around the user's current coordinates.
* **Interactive Data Visualization:** Renders hourly temperature and humidity forecasts using Recharts.
* **Trip Planner & Local Storage Sync:** Allows users to build, save, and manage travel lists synced with the browser's LocalStorage.

---

## 🛠️ Tech Stack & Integrations

### Frontend Architecture
* **React 19 & Vite** - High-performance frontend library and build tool.
* **Custom Vanilla CSS** - Tailored glassmorphism styles, fluid layouts, and smooth transition animations.

### Map & Visualization
* **Leaflet & React-Leaflet** - Open-source interactive map rendering.
* **Recharts** - Responsive SVG charts for weather trends.
* **Lucide React** - High-quality iconography.

### APIs & Data Sources
* **Open-Meteo API** - Free, high-accuracy weather forecasts without API key restrictions.
* **TomTom Search & Routing APIs** - For geocoding, nearby POI queries, and route calculations.
* **Wikipedia API** - Dynamically fetches contextual summaries and real-time photos of POIs.
* **Browser Geolocation API** - Geolocation watch position tracking.

---

## ⚙️ Project Setup

### Prerequisites
Make sure you have Node.js installed. You will also need a TomTom API key.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karthikgveresh-lgtm/Dynamic-Weather.git
   cd Dynamic-Weather
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your TomTom API key:
   ```env
   VITE_TOMTOM_API_KEY=your_tomtom_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
