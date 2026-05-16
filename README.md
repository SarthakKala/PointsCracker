# PointsCracker

_"Crack the code on your reward points."_

PointsCracker is a browser-based calculator for Indian credit card reward points. Pick your card, enter your balance, and instantly see the rupee value across every redemption category — cashback, flights, hotels, shopping vouchers, and statement credit — with the best option highlighted. No backend, no login, no API keys. Card rules live in local JSON; all redemption math runs in a **C++ engine compiled to WebAssembly**, so nothing leaves your browser.

## 🛠️ Technologies

- **Vite** + **Vanilla TypeScript** (no React)
- **C++** compiled to **WebAssembly** via **Emscripten**
- **Plain CSS** (design tokens, dark fintech UI)
- Local **`cards.json`** (15 Indian credit cards)

## ✨ Features

- Dropdown of **15 Indian credit cards**, grouped by bank
- Enter points with **Indian-style comma formatting** (e.g. `10,00,000`)
- WASM-powered calculation of rupee value for **five redemption categories**
- **Best value** row highlighted with a gold accent and badge
- **Expiry warning** when a card’s points expire within 3 months
- **Below-minimum redemption** warning when balance is under the card’s threshold
- **Zero network calls** for calculations — fully client-side after load
- Data disclaimer: rates verified through **May 2026** (banks may change terms later)

## ⚡ Why WASM for Something That “Could Be JavaScript”?

Banks use different point-to-rupee ratios per category, and the “best” option is whichever category maximizes value — simple on paper, easy to get wrong when you’re comparing five numbers in your head. PointsCracker puts that logic in **C++** and ships it as **WASM** so the calculation engine is a real compiled module, not an afterthought in the UI bundle. JavaScript only renders the page and talks to the engine through a thin bridge. That split — **UI in TS, rules in C++** — is the whole point of the project.

## 🔧 Process

I started from a full product spec: data schema for cards, a self-contained C++ file with two exported functions (`calculate` and `getPointsValueSummary`), and a vanilla TypeScript front end that never imports WASM directly except through `wasmBridge.ts`.

The C++ side builds JSON with `std::ostringstream` (no JSON library), compares categories to pick the best redemption, and flags expiry and minimum-redemption edge cases. Emscripten compiles it to `public/calculator.js` + `calculator.wasm` with `MODULARIZE` so the glue loads as `CalculatorModule`.

On the front end, **Vite does not allow `import()` for files in `public/`**, so the bridge loads the Emscripten script with a dynamic `<script>` tag and calls the global factory. Card data comes from `cards.json` via a small loader; components handle the selector, formatted points input (caret pinned to the right), results panel with SVG category icons, and expiry banner.

Windows dev uses `build.ps1` instead of `make`; the Makefile remains for macOS/Linux/Git Bash.

## 📚 What I Learned

- **Emscripten on Windows** — `EXPORTED_RUNTIME_METHODS` changed across SDK versions; trimming exports to what the bridge actually uses (`cwrap`) avoided link-time errors
- **Vite + static WASM glue** — `public/` assets must be loaded as scripts, not ES modules; production build stays happy with an external `/calculator.js` boundary
- **Vanilla TS component pattern** — small render functions that own a DOM container, without a framework
- **Locale-aware UX** — `en-IN` formatting for points input and rupee display, with input validation and a 10M cap
- **Keeping WASM strings alive** — returned JSON from C++ must use a `static std::string` so pointers remain valid after the function returns

## 🌱 Overall Growth

PointsCracker is a focused static app, but it forced me to wire a full pipeline: **C++ → WASM → JS bridge → UI**, with real edge cases (minimum redemption, expiry, below-zero handling) and a deployable `dist/` output. It’s a good counterpoint to heavier full-stack projects: prove the engine in a systems language, keep the surface area small, and ship something useful in one sitting.

## 🚀 Running the Project

### Prerequisites

- **Node.js 18+**
- **Emscripten (emsdk)** — [install guide](https://emscripten.org/docs/getting_started/downloads.html)

After installing emsdk, activate it in each terminal:

```bash
# Git Bash / macOS / Linux
source /path/to/emsdk/emsdk_env.sh

# Windows CMD
C:\path\to\emsdk\emsdk_env.bat
```

### Setup

```bash
git clone https://github.com/SarthakKala/PointsCracker.git
cd PointsCracker

npm install

# Compile C++ → public/calculator.js + calculator.wasm
npm run build:wasm
# Windows: uses src/wasm/build.ps1
# macOS/Linux (with make): cd src/wasm && make build

npm run dev
# → http://localhost:5173
```

### Production build

```bash
npm run build:wasm   # ensure WASM artifacts exist
npm run build        # output in dist/
npm run preview      # optional local preview
```

Deploy **`dist/`** to Vercel or Netlify. Include `calculator.js` and `calculator.wasm` from `public/` (they are copied into `dist/` on build).

### Project layout

```
PointsCracker/
├── public/              # calculator.js + calculator.wasm (generated)
├── src/
│   ├── wasm/            # calculator.cpp, Makefile, build.ps1
│   ├── bridge/          # wasmBridge.ts (only JS ↔ WASM layer)
│   ├── components/      # UI renderers
│   ├── data/            # cards.json + loader.ts
│   └── types/           # TypeScript interfaces
├── index.html
└── vite.config.ts
```

## 📋 Card data

Rates in `src/data/cards.json` are approximate and sourced from official bank pages where possible. They are marked **current through May 2026** in the UI. Always verify with your issuer before redeeming.

