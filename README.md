# time-i-gram

[![npm](https://img.shields.io/npm/v/@vanessa_stoiber1999/time-i-gram?label=npm%20(embed))](https://www.npmjs.com/package/@vanessa_stoiber1999/time-i-gram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

**time-i-gram: A Grammar for Interactive Visualization of Time-based Data**

<img width="1449" alt="teaser" src="https://github.com/vanessastoiber/thesis-datasets/blob/44333d134c2aa1faf1503f2af29a8ae4d5f738e4/figures/front-figure.png">

## Overview

**time-i-gram** is a grammar-based toolkit for creating scalable and interactive visualizations of **time-based data**. It extends [Gosling.js](https://github.com/gosling-lang/gosling.js), a grammar originally designed for genomics data visualization, by introducing first-class support for temporal data types, time-aware data fetchers, and a Unix time axis track.

With time-i-gram, users can declaratively specify rich, interactive time-series visualizations using a concise JSON specification, including features such as coordinated multiple views, semantic zooming, brushing & linking, and responsive layouts.

>  **[Observable Demo](https://observablehq.com/d/226caaa8a69fc9d3)**

---

## Key Features

### Temporal Data Type
A new `"temporal"` field type for encoding time on axes (`x` or `y`), alongside the existing `"genomic"`, `"quantitative"`, and `"nominal"` types.

```jsonc
{
  "x": { "field": "date", "type": "temporal", "axis": "bottom" }
}
```

### Time-aware Data Sources
Two new data source types for loading time-based datasets:

| Type | Description |
|---|---|
| `csv-time` | Load temporal data from CSV files with automatic date field parsing |
| `json-time` | Load temporal data from inline JSON values or remote JSON URLs |

Both support `dateFields` (for human-readable dates), `timestampField` (for Unix timestamps), and `interval` (for time ranges).

```jsonc
{
  "data": {
    "url": "https://example.com/weather.csv",
    "type": "csv-time",
    "dateFields": ["date"]
  }
}
```

### Unix Time Axis Track
A dedicated axis track that renders human-readable time labels (years, months, days, hours, etc.) with automatic tick formatting that adapts to the current zoom level.

### All Gosling.js Features
time-i-gram inherits the full power of Gosling.js, including:

- **Visual Marks**: `point`, `line`, `area`, `bar`, `rect`, `text`, `rule`, `link`, `triangle`, and more
- **Layouts**: Linear and circular
- **Coordinated Multiple Views**: Linking, brushing, and overview+detail
- **Semantic Zooming**: Dynamically changing visual representations at different zoom levels
- **Responsive Visualization**: Adapting to screen/container size
- **Theming**: Customizable visual styles
- **JavaScript API**: Programmatic control and event subscriptions

---

## Installation

### npm

```bash
# Install the embed package
npm install @vanessa_stoiber1999/time-i-gram
```

### Peer Dependencies

time-i-gram requires the following peer dependencies:

```bash
npm install pixi.js@^6.3.0 react@^18.0.0 react-dom@^18.0.0
```

---

## Quick Start

### Using the React Component

```tsx
import { GoslingComponent } from 'gosling.js';

const spec = {
  title: 'Seattle Weather',
  tracks: [{
    data: {
      url: 'https://raw.githubusercontent.com/vega/vega/main/docs/data/seattle-weather.csv',
      type: 'csv-time',
      dateFields: ['date']
    },
    mark: 'bar',
    x: { field: 'date', type: 'temporal', axis: 'bottom' },
    y: { field: 'precipitation', type: 'quantitative' },
    width: 800,
    height: 200
  }]
};

function App() {
  return <GoslingComponent spec={spec} />;
}
```

### Using the Embed API

```js
import { embed } from '@vanessa_stoiber1999/time-i-gram';

const spec = { /* your time-i-gram spec */ };

// Embed in a DOM element
embed(document.getElementById('container'), spec);
```

### Using in Observable Notebooks

```js
embed = {
  const mod = await import('https://cdn.jsdelivr.net/npm/@vanessa_stoiber1999/time-i-gram');
  return mod.embed;
}
```

---

## Examples

### Temporal Overview + Detail

An overview+detail pattern with brush-based linking for exploring unemployment rates across industries over time.

```jsonc
{
  "title": "Unemployment Rates",
  "tracks": [
    {
      "title": "Overview",
      "data": { "type": "json-time", "timestampField": "time", "values": [] },
      "mark": "line",
      "x": { "field": "time", "type": "temporal", "axis": "bottom" },
      "alignment": "overlay",
      "tracks": [
        {},
        { "mark": "brush", "x": { "linkingId": "detail-link" }, "color": { "value": "steelBlue" } }
      ],
      "width": 800,
      "height": 50
    },
    {
      "title": "Detail",
      "data": {
        "url": "https://raw.githubusercontent.com/vega/vega/main/docs/data/unemployment-across-industries.json",
        "type": "json-time",
        "dateFields": ["year", "month"]
      },
      "mark": "line",
      "x": { "field": "year", "type": "temporal", "axis": "bottom", "linkingId": "detail-link" },
      "y": { "field": "count", "type": "quantitative" },
      "width": 800,
      "height": 200
    }
  ]
}
```

### Multi-track Weather Dashboard

Combine precipitation bars, temperature lines, and categorical weather annotations with semantic zooming — all linked across views.

```jsonc
{
  "title": "Seattle Weather",
  "views": [
    {
      "alignment": "overlay",
      "tracks": [{
        "data": { "url": "...seattle-weather.csv", "type": "csv-time", "dateFields": ["date"] },
        "mark": "bar",
        "x": { "field": "date", "type": "temporal", "axis": "bottom", "linkingId": "linked-views" },
        "y": { "field": "precipitation", "type": "quantitative" },
        "width": 800, "height": 80
      }]
    },
    {
      "alignment": "overlay",
      "tracks": [{
        "data": { "url": "...seattle-weather.csv", "type": "csv-time", "dateFields": ["date"] },
        "mark": "line",
        "x": { "field": "date", "type": "temporal", "axis": "bottom", "linkingId": "linked-views" },
        "y": { "field": "temp_max", "type": "quantitative" },
        "width": 800, "height": 80
      }]
    }
  ]
}
```

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Yarn](https://yarnpkg.com/getting-started/install) (used instead of npm)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/vanessastoiber/time-i-gram.git
cd time-i-gram

# Install dependencies
yarn

# Start the development editor
yarn start
```

Then open [http://localhost:3000/](http://localhost:3000/) in your browser to explore the interactive editor with built-in examples.

## API

time-i-gram exposes the same API as Gosling.js:

```ts
import { GoslingComponent, compile, validateGoslingSpec, embed, init } from 'gosling.js';
```

| Export | Description |
|---|---|
| `GoslingComponent` | React component for rendering visualizations |
| `embed` | Embed a visualization into a DOM element |
| `compile` | Compile a Gosling spec into a HiGlass spec |
| `validateGoslingSpec` | Validate a specification against the schema |
| `init` | Register all track plugins and data fetchers (called automatically) |
| `GoslingSchema` | The JSON schema for validation |

---

## Built On

time-i-gram is built on top of these excellent projects:

- [Gosling.js](https://github.com/gosling-lang/gosling.js) — Grammar-based genomics visualization toolkit
- [HiGlass](https://github.com/higlass/higlass) — Fast multi-scale visualization engine
- [PixiJS](https://pixijs.com/) — 2D rendering engine
- [D3.js](https://d3js.org/) — Data-driven documents
- [React](https://react.dev/) — UI component library

---

## Citation

If you use time-i-gram in your research, please cite:

> V. Stoiber, N. Gehlenborg, W. Aigner, and M. Streit, "time-i-gram: A Grammar for Interactive Visualization of Time-based Data," *Center for Open Science*, 2024. doi: [10.31219/osf.io/m9ubg](https://doi.org/10.31219/osf.io/m9ubg)

```bibtex
@article{Stoiber2024,
  title     = {time-i-gram: A Grammar for Interactive Visualization of Time-based Data},
  url       = {http://dx.doi.org/10.31219/osf.io/m9ubg},
  DOI       = {10.31219/osf.io/m9ubg},
  publisher = {Center for Open Science},
  author    = {Stoiber, Vanessa and Gehlenborg, Nils and Aigner, Wolfgang and Streit, Marc},
  year      = {2024},
  month     = may
}
```

This work extends Gosling.js, which can be cited as:

> S. L'Yi, Q. Wang, F. Lekschas, and N. Gehlenborg, "Gosling: A Grammar-based Toolkit for Scalable and Interactive Genomics Data Visualization," *IEEE Transactions on Visualization and Computer Graphics*, 2022. doi: [10.1109/TVCG.2021.3114876](https://doi.org/10.1109/TVCG.2021.3114876)

```bibtex
@article{LYi2022,
  title = {Gosling: A Grammar-based Toolkit for Scalable and Interactive Genomics Data Visualization},
  volume = {28},
  ISSN = {2160-9306},
  url = {http://dx.doi.org/10.1109/TVCG.2021.3114876},
  DOI = {10.1109/tvcg.2021.3114876},
  number = {1},
  journal = {IEEE Transactions on Visualization and Computer Graphics},
  publisher = {Institute of Electrical and Electronics Engineers (IEEE)},
  author = {LYi,  Sehi and Wang,  Qianwen and Lekschas,  Fritz and Gehlenborg,  Nils},
  year = {2022},
  month = jan,
  pages = {140–150}
}
```