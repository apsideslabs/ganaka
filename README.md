# Gaṇaka

A complete Vedic astrology (jyotiṣa) calculation engine and web application, written in TypeScript on Next.js. It computes charts, divisional charts, daśās, strengths, yogas, doṣas, muhūrta and a structured prediction layer from a birth date, time and place.

> **Note on accuracy:** planetary positions are computed from hand-written analytical series rather than a vetted ephemeris, and measured errors reach 0.8° for some planets. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) before relying on any output. This is the most important caveat in the project.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI, three.js, SVG.js |
| Language | TypeScript 5.9 |
| Runtime | Node 20+ / Bun |
| Astronomy | in-house VSOP87/Meeus-style series (no external ephemeris) |

## Quick start

```bash
bun install          # or: npm install
cp .env.example .env.local
bun dev              # or: npm run dev   ->  http://localhost:3000
```

```bash
bun run build        # production build
bun run lint         # eslint
```

## Repository layout

```
lib/                    engine core — 117 files, ~46,700 lines
  astronomy/            julian day, ayanāṁśa, coordinates, ephemeris
  jyotisha/             chart assembly, pañcāṅga, sphuṭas, kutas, predictions
  dashas/               Vimśottarī, Aṣṭottarī, Yoginī, Kālachakra, 4 Jaimini systems
  yogas/                Nabhasa, Bhāvādi, Rāja/Dhana, Ariṣṭa databases + engine
  doshas/               classical graha doṣas, gaṇḍānta, contested/modern doṣas
  shadbala/             ṣaḍbala (six-fold strength)
  ashtakavarga/         bindu calculations
  vargas/               divisional charts
  jaimini/              chara kārakas, arūḍhas
  muhurta/              electional astrology
  i18n/                 translations
  settings/             configuration
app/                    Next.js routes
components/             React UI
chart/                  North Indian chart rendering
hooks/                  React hooks
public/                 static assets
```

### Module sizes

| Directory | Files | Lines |
|---|---|---|
| `lib/jyotisha/` | 70 | 25,341 |
| `lib/yogas/` | 7 | 5,696 |
| `lib/doshas/` | 10 | 3,626 |
| `lib/dashas/` | 10 | 3,342 |
| `lib/muhurta/` | 5 | 3,159 |
| `lib/astronomy/` | 4 | 2,333 |
| `lib/i18n/` | 2 | 957 |
| `lib/vargas/` | 2 | 914 |
| `lib/jaimini/` | 1 | 440 |
| `lib/settings/` | 2 | 380 |
| `lib/ashtakavarga/` | 1 | 262 |
| `lib/shadbala/` | 1 | 159 |
| **`lib/` total** | **117** | **46,667** |

UI (`app/`, `components/`, `hooks/`, `chart/`) adds a further 97 files / ~36,700 lines.

## Using the engine directly

```ts
import { calculateAllPlanets } from '@/lib/astronomy/ephemeris';

const jd = 2454894.2645833334;            // Julian Day, UT
const planets = calculateAllPlanets(jd, 'lahiri');
console.log(planets.sun.siderealLongitude, planets.moon.siderealLongitude);
```

## Licence

No licence file is present in this repository. Until one is added, default copyright applies and the code may not be redistributed or reused.
