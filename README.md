# PujaPath (পূজাপথ) — Kolkata Durga Puja Guide & Metro Route Planner

PujaPath is a fast, responsive, mobile-first web app and cultural guide for Kolkata Durga Puja. It features 195 pandals with nearest metro stations and walking directions, North/South/Central/East hopping circuits, an interactive multi-stop route planner, offline-first local device storage, and a complete Kolkata Metro guide.

Built with pure vanilla HTML, modern CSS, and lightweight client-side JavaScript. Zero runtime dependencies, generated statically by Node.js.

---

## ✨ Features

- **Pandal Directory (195 Pandals):** Filter by Zone (North, South, Central, East), Metro Line (Blue, Green, Orange, Yellow, Purple), category (Must-Visit, Bonedi Bari, Themed), and walk distance.
- **Zone Hopping Circuits:** Curated walking and metro itineraries across North Heritage, South Theme Hubs, Central Classics, Salt Lake & East (including New Town & Rajarhat), and Bonedi Bari.
- **Interactive Route Planner:** Plan single or multi-pandal hopping itineraries ordered by metro proximity and walking efficiency, with one-tap Google Maps directions.
- **Local Device Storage:** Wishlists, custom route plans, filters, and hopping preferences persist locally in `localStorage` without tracking or logins.
- **Kolkata Metro Guide:** All metro lines and stations with pandal interchange information.
- **Performance & Adaptive Animation:** Includes smooth view transitions, active progress loading indicators, and automatic reduced-motion detection on slow network connections.
- **Production Ready:** Pre-rendered static pages, clean URLs, dynamic SVG icons, high-resolution pandal/idol photography, Open Graph tags, canonical links, XML sitemap, and robots.txt.

---

## 🛠️ Project Structure

```
pujapath/
├── build.mjs                 # Static site generator (generates public/)
├── data.mjs                  # Pandal directory, zones, metro lines & site config
├── package.json              # NPM scripts
├── vercel.json               # Vercel deployment configuration
├── netlify.toml              # Netlify deployment configuration
├── .github/workflows/        # Automated GitHub Pages CI/CD workflow
├── src/
│   ├── css/style.css         # Design system, responsive layout & animations
│   ├── js/
│   │   ├── app.js            # Client-side reactivity, storage, routing & filters
│   │   └── shared.js         # Shared helpers, templates & SVG icon definitions
│   └── assets/
│       ├── pandals/          # Curated pandal & idol photographs (195 pandals)
│       ├── hero-night.webp   # Hero background visual
│       └── og-image.jpg      # Open Graph social preview card
├── public/                   # Generated production distribution (204 URLs)
└── scripts/                  # Data & asset maintenance utilities
```

---

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nottherajyk/PujoPath.git
   cd PujoPath
   ```

2. **Build the static site:**
   ```bash
   npm run build
   # or: node build.mjs
   ```

3. **Preview locally:**
   ```bash
   npm start
   # or: npx serve public -l 3000
   ```

---

## 🌐 Deployment Options

### Vercel (Recommended)
1. Push to your GitHub repository.
2. Import the repository in [Vercel](https://vercel.com).
3. Vercel automatically detects [`vercel.json`](./vercel.json) and [`package.json`](./package.json):
   - **Build Command:** `node build.mjs`
   - **Output Directory:** `public`
4. Click **Deploy**.

### Netlify
1. Import the repository into [Netlify](https://www.netlify.com).
2. Netlify automatically reads [`netlify.toml`](./netlify.toml) with build command `node build.mjs` and publish directory `public`.

### GitHub Pages
- PujaPath includes a GitHub Actions workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).
- In your GitHub repository, go to **Settings > Pages > Source**, and select **GitHub Actions**. Pushes to `main` will build and deploy automatically.

---

## 📩 Support & Contact

- **Email:** [rajgupta.yk@gmail.com](mailto:rajgupta.yk@gmail.com)
- **Instagram:** [@nottherajyk](https://instagram.com/nottherajyk)
- **Year:** Durga Puja 2026
