import type { GoslingSpec } from '@gosling-lang/gosling-schema';

// Brehmer et al. (2017) design #16: grid (base-10) representation x chronological scale x segmented layout.
// The time axis is cut into decades (`period: { unit: "decade" }`), every decade is a row (`row` on the period
// field `decade`), and `timeUnit: "year"` makes one cell per year, so the columns are the years 0 to 9 of each
// decade. Data: vega-datasets `co2-concentration.csv` (monthly means at Mauna Loa, NOAA GML and Scripps), read
// unchanged; the cell is the yearly mean.
//
// The header strip covers the first row of a track, so the rows start with an empty category; the decade labels are
// in a narrow track of their own, so that they do not cover the first column.

const DATA = {
    type: 'csv-time',
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/main/data/co2-concentration.csv',
    dateFields: ['Date']
} as const;

const DECADES = ['', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const GRID_X = {
    field: 'Date',
    type: 'temporal',
    period: { unit: 'decade', newField: 'decade' },
    timeUnit: 'year'
} as const;

const CO2 = {
    field: 'CO2',
    type: 'quantitative',
    aggregate: 'mean',
    domain: [310, 420],
    range: 'viridis',
    title: 'ppm'
} as const;

const spec = {
    title: 'How did CO2 rise from one decade to the next?',
    arrangement: 'horizontal',
    spacing: 0,
    views: [
        {
            tracks: [
                {
                    title: 'Decade',
                    data: DATA,
                    mark: 'rect',
                    x: { ...GRID_X, axis: 'none' },
                    row: { field: 'decade', type: 'nominal', domain: DECADES, legend: true },
                    color: { value: 'white' },
                    style: { outline: 'none' },
                    width: 70,
                    height: 360
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Yearly mean CO2 (ppm), one row per decade',
                    data: DATA,
                    mark: 'rect',
                    x: { ...GRID_X, axis: 'bottom' },
                    row: { field: 'decade', type: 'nominal', domain: DECADES },
                    color: CO2,
                    stroke: { value: 'white' },
                    strokeWidth: { value: 1 },
                    tooltip: [
                        { field: 'Date', type: 'temporal', alt: 'Year', format: '%Y' },
                        { field: 'CO2', type: 'quantitative', alt: 'Yearly mean CO2 (ppm)', format: '.1f' }
                    ],
                    width: 600,
                    height: 360
                }
            ]
        },
        {
            tracks: [
                {
                    // the color legend, in a track of its own: a quantitative legend is drawn inside its track
                    title: 'Yearly mean CO2',
                    data: DATA,
                    dataTransform: [{ type: 'filter', field: 'CO2', inRange: [0, 0] }],
                    mark: 'rect',
                    x: { ...GRID_X, axis: 'none' },
                    color: { ...CO2, legend: true },
                    style: { outline: 'none' },
                    width: 170,
                    height: 160
                }
            ]
        }
    ]
};

export const EX_SPEC_TEMPORAL_BREHMER_CO2_DECADE_GRID = spec as unknown as GoslingSpec;
