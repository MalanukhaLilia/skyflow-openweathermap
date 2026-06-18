# SkyFlow - Weather Forecast

SkyFlow is a premium, high-performance weather forecasting application built using **React**, **Vite**, and **Bootstrap**. It delivers beautiful, real-time weather information, comprehensive 14-day forecasts, and a simulated 30-day monthly outlook, all wrapped in a sleek, responsive glassmorphism user interface.

## Features

- **Interactive Search**: Search real-time weather forecasts for any city in the world.
- **3D Card Flipping**: Flip the main weather card to reveal detailed statistics (Feels Like, Humidity, Wind speed, Air pressure, Sunrise, and Sunset).
- **14-Day Forecast View**: Access a detailed daily outlook. Click on any day to load a horizontal, scrollable, 3-hourly weather stats breakdown.
- **Monthly Forecast (30 Days)**: Access a simulated 30-day outlook generated dynamically from current forecast trends, complete with daily temperature fluctuations, condition summaries, and interactive selection.
- **My Locations (Favorites)**: Bookmark and manage your favorite cities. It automatically fetches and updates summaries for saved locations.
- **Unit Switcher**: Seamlessly toggle between Celsius (°C) and Fahrenheit (°F) across all views instantly.
- **Dynamic Gradients**: The background layout adapts dynamically to reflect the current weather condition of the selected city (Sunny, Cloudy, Rainy, Snowy, or Thunderstorm).
- **Dynamic Footer Advisory**: Receives real-time weather conditions for saved locations to suggest appropriate tips (e.g., carrying an umbrella or wearing sunglasses).
- **Aesthetic Refinements**: Fully customized glassmorphic panels, glowing left-edge active indicators for selected favorite cities, custom slim white-blue scrollbars, and high-contrast text rendering.

## SCSS Architecture

The project implements a modern, modular SCSS architecture without compiling variable values into the `:root` pseudo-selector. Instead, it compiles directly using SCSS partials located inside the `src/scss/` directory:
- **`src/scss/_vars.scss`**: Centrally defines all color tokens, fonts, glassmorphism constants, and layout specifications.
- **`src/scss/_mixins.scss`**: Encapsulates media queries (`respond-to`), custom scrollbars, and flex alignments.
- **`src/scss/_extends.scss`**: Shares reusable glass panels and flipping card face templates.
- **`src/scss/_keyframes.scss`**: Governs keyframe-based animations for weather icons.
- **`src/scss/index.scss`**: Connects Bootstrap, custom partials, and builds the layout. All custom properties have been refactored into native SCSS variables for compilation efficiency.

## Performance Optimizations (PageSpeed Insights 85+ Score)

To achieve maximum loading speed and score 85+ on PageSpeed Insights for both mobile and desktop:

1. **DNS Preconnection**: Optimized loading of external services by adding `<link rel="preconnect">` tags in `index.html` for Google Fonts and OpenWeatherMap APIs.
2. **Robust Caching**: Implemented a local storage caching wrapper with a 15-minute TTL (time-to-live). Repeated city queries load instantly, saving network requests and improving loading speed.
3. **Optimized Icons**: Leveraged native local assets and crisp SVG icons via `bootstrap-icons` to minimize bundle bloat and layout shifts (CLS).
4. **Clean Code & Small Bundles**: Avoided heavy charting libraries; instead, used custom CSS and responsive layouts to render forecasts.
5. **Parallel Queries**: Fetched current conditions and forecasts in parallel (`Promise.all`) to reduce time-to-first-paint.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Installation

1. Navigate to the project directory:
   ```bash
   cd exam_3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Local Development

Run the local development server:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Build for Production

Compile the production bundle:
```bash
npm run build
```
The optimized bundle will be generated in the `dist` folder. You can test the built assets locally using:
```bash
npm run preview
```

---

## Deployment Guide

The app base is configured to use relative paths (`./`) in `vite.config.js`, making it universally compatible with any subdirectory.

### Deploying to GitHub Pages

1. Initialize git (if not already done) and link your remote repository:
   ```bash
   git init
   ```
   ```bash
   git remote add origin https://github.com/username/your-repository.git
   ```

2. Run the deployment script:
   ```bash
   npm run deploy
   ```
   This compiles the project (`npm run build`) and publishes the `dist` folder directly to the `gh-pages` branch.

### Deploying to Netlify / Vercel

Simply connect your GitHub repository to Netlify or Vercel:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- The build will succeed automatically and deploy instantly!
