import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { weatherColors } from './palette';

// TimeViz Browser: LifeLines2 (Wang, Plaisant, Shneiderman et al. 2009, "Temporal Summaries: Supporting Temporal
// Categorical Searching, Aggregation and Comparison", IEEE TVCG 15, https://doi.org/10.1109/TVCG.2009.187).
// Records are stacked rows of instantaneous, categorical events (triangles colored by category); the "align"
// operator aligns every record to an event of its own, and the time axis becomes relative to it; a histogram
// summarizes the events over the aligned time.
// The patient records of the original are not public. Comparable public data: vega-datasets `seattle-weather.csv`
// (NOAA, daily, 2012-2015, read unchanged), with the years as records and each day as an event whose category is
// its `weather` (rain, drizzle, sun, fog, snow).
// - Align: each year is aligned to its wettest day (`relative` with `anchor: { argmax: "precipitation" }` and
//   `groupby: { period: year }`). LifeLines2 aligns to the first event of a chosen type; the grammar's anchors are
//   `first`, `last`, `argmax`, `argmin`, a date or a field, so an event defined by its value stands in for it.
// - Histogram: the same relative axis, linked to the rows, with days per week counted by category (`timeUnit`
//   "week" + `aggregate: "count"`).

const WEATHER = {
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/v3.3.1/data/seattle-weather.csv',
    type: 'csv-time',
    dateFields: ['date']
} as const;

const YEARS = ['2012', '2013', '2014', '2015'];
const CATEGORIES = ['rain', 'drizzle', 'snow', 'fog', 'sun'];
const COLORS = weatherColors(CATEGORIES);

const ALIGNED_X = {
    field: 'date',
    type: 'temporal',
    relative: {
        anchor: { argmax: 'precipitation' },
        groupby: { period: { unit: 'year', newField: 'year' } },
        unit: 'week',
        label: "the year's wettest day"
    },
    domain: { interval: ['-10 weeks', '10 weeks'] },
    linkingId: 'aligned'
} as const;

const CATEGORY_COLOR = {
    field: 'weather',
    type: 'nominal',
    domain: CATEGORIES,
    range: COLORS,
    legend: true,
    title: 'Weather'
} as const;

const spec = {
    title: "What is the weather like in the weeks around each year's wettest day?",
    arrangement: 'vertical',
    spacing: 20,
    views: [
        {
            tracks: [
                {
                    title: 'One row per year, one triangle per day',
                    data: WEATHER,
                    mark: 'triangleBottom',
                    x: { ...ALIGNED_X, axis: 'bottom' },
                    row: { field: 'year', type: 'nominal', domain: ['', ...YEARS], legend: true },
                    color: CATEGORY_COLOR,
                    size: { value: 8 },
                    tooltip: [
                        { field: 'date', type: 'temporal', alt: 'Day', format: '%a %d %b %Y' },
                        { field: 'weather', type: 'nominal', alt: 'Weather' },
                        { field: 'precipitation', type: 'quantitative', alt: 'Precipitation (mm)', format: '.1f' }
                    ],
                    width: 900,
                    height: 220
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Histogram: days per week of aligned time, all years',
                    data: WEATHER,
                    mark: 'bar',
                    x: { ...ALIGNED_X, timeUnit: 'week', axis: 'bottom' },
                    y: { field: 'date', type: 'quantitative', aggregate: 'count', axis: 'left', title: 'Days (count)' },
                    color: CATEGORY_COLOR,
                    width: 900,
                    height: 160
                }
            ]
        }
    ]
};

export const EX_SPEC_TEMPORAL_TIMEVIZ_LIFELINES2 = spec as unknown as GoslingSpec;
