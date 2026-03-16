# FocusTrack

FocusTrack ar en frontend for tidsspårning och fokusplanering byggd med React och Vite. Applikationen lagrar sessioner, mal och timerdata i `localStorage` och visar statistik, historik, vader, energinivaer och maluppfoljning i ett sammanhallet gränssnitt.

## Installation

### Forutsattningar

- Node.js 18 eller senare
- npm 9 eller senare

### Installera beroenden

Projektets körbara webbapp ligger i `react/`.

```bash
cd react
npm install
```

### Starta utvecklingsservern

```bash
cd react
npm run dev
```

Vite visar lokal adress i terminalen, normalt `http://localhost:5173`.

### Bygg for produktion

```bash
cd react
npm run build
```

### Forhandsgranska produktionsbygget

```bash
cd react
npm run preview
```

### Linting

```bash
cd react
npm run lint
```

## Teknikstack

- React 19
- Vite 7
- React Router 7
- Recharts
- JavaScript och TypeScript
- CSS Modules och globala stilfiler

## Projektstruktur

```text
FocusTrack/
|-- README.md
|-- react/
|   |-- package.json
|   |-- vite.config.js
|   |-- src/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- components/
|   |   |   |-- Timer/
|   |   |   |-- Weather/
|   |   |   |-- EnergyLog/
|   |   |   |-- NavbarDesktop/
|   |   |   |-- NavbarMobile/
|   |   |   |-- Logo/
|   |   |   |-- SessionList.tsx
|   |   |   |-- RecentSessions.jsx
|   |   |   |-- GoalsProgressCard.jsx
|   |   |   |-- Last5DaysBarChart.jsx
|   |   |   |-- StatsSummary.jsx
|   |   |   |-- AppLayout.jsx
|   |   |   |-- Card.jsx
|   |   |   `-- Button.jsx
|   |   |-- hooks/
|   |   |   |-- useLanguage.tsx
|   |   |   |-- useSessions.js
|   |   |   |-- useStatsData.js
|   |   |   |-- useLocalStorage.js
|   |   |   `-- useMediaQuery.js
|   |   |-- pages/
|   |   |   |-- Dashboard.jsx
|   |   |   |-- History.jsx
|   |   |   |-- Stats.jsx
|   |   |   |-- ToDo/
|   |   |   `-- settings/
|   |   |-- utils/
|   |   |   |-- sessionsStore.js
|   |   |   |-- sessionsTransfer.js
|   |   |   |-- timerStore.js
|   |   |   |-- goalsStore.js
|   |   |   |-- goalsProgress.js
|   |   |   |-- chartsData.js
|   |   |   `-- recommendations.ts
|   |   |-- assets/
|   |   |-- index.css
|   |   |-- App.css
|   |   `-- media.css
|   `-- index.html
`-- sprint1.md
```

## Komponentstruktur

### Appniva

- `main.jsx` monterar appen.
- `App.jsx` satter upp routing, layouts och providers.
- `hooks/useLanguage.tsx` hanterar oversattningar via context.

### Sidor

- `pages/Dashboard.jsx` visar timer, vader, senaste sessioner och oversikt.
- `pages/History.jsx` visar sessionhistorik via `SessionList`.
- `pages/Stats.jsx` visar statistik, diagram och summeringar.
- `pages/ToDo/ToDo.jsx` innehaller att-gora-vyn.
- `pages/settings/Settings.jsx` samlar sprak, tema, mal, dataimport/export och rensning.

### Domankomponenter

- `components/Timer/` innehaller timerflode, startmodal och sparmodal.
- `components/Weather/Weather.tsx` visar vaderdata och presentation.
- `components/EnergyLog/` hanterar energinivaval.
- `components/GoalsProgressCard.jsx` visar progress mot dagliga och veckovisa mal.
- `components/Last5DaysBarChart.jsx` visualiserar de senaste fem dagarnas sessioner.
- `components/RecentSessions.jsx` och `components/SessionList.tsx` renderar sparade sessioner och redigering/radering.
- `components/StatsSummary.jsx` sammanfattar nyckeltal for statistikvyn.

### Layout och navigation

- `components/AppLayout.jsx` omsluter delade sidytor.
- `components/NavbarDesktop/` och `components/NavbarMobile/` delar upp navigation per breakpoint.
- `components/Logo/` innehaller logotypkomponenter.
- `components/Card.jsx` och `components/Button.jsx` ar generiska baskomponenter.

### Hooks och state

- `useSessions` ar huvudgranssnittet mot sessionslagring och redigering.
- `useStatsData` bygger statistikdata fran sessioner.
- `useLocalStorage` kapslar in enkel state-persistens.
- `useMediaQuery` hanterar responsiva brytpunkter.
- `useLanguage` ger oversattningsfunktion och valt sprak.

### Utilities

- `sessionsStore.js` ansvarar for CRUD mot `localStorage` for sessioner.
- `sessionsTransfer.js` importerar och exporterar sessioner som JSON.
- `timerStore.js` sparar timerstatus mellan sidladdningar.
- `goalsStore.js` sparar malvarden.
- `goalsProgress.js` raknar ut progresstal och streaks.
- `chartsData.js` transformerar sessioner till diagramdata.
- `recommendations.ts` bygger rekommenderad sessionslangd utifran tidigare data.

## Data och persistens

Applikationen anvander `localStorage` for:

- sessioner
- timerstatus
- sprakval
- mal

Ingen extern backend kravs for lokal utveckling av den nuvarande versionen.

## Kanda utvecklingsdetaljer

- Kodbasen blandar `.jsx`, `.js`, `.tsx` och `.ts`.
- Flera funktioner ar byggda kring browser-API:er som `localStorage`, `File`, `Blob` och `matchMedia`.
- Dokumentation och JSDoc i koden beskriver publika hooks och utilities som andra komponenter bygger pa.
