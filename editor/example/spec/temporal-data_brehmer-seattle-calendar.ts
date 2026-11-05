import type { GoslingSpec } from '@gosling-lang/gosling-schema';

// Brehmer et al. (2017) design #17: grid (calendar) representation x chronological scale x segmented layout.
// The calendar is composed, not a layout of its own: the time axis is cut into ISO weeks
// (`period: { unit: "week" }`), every week is a row (`row` on the period field `week`), and `timeUnit: "day"`
// makes one cell per day, Monday to Sunday. Data: vega-datasets `seattle-weather.csv` (daily, 2012-2015), read
// unchanged; the filter keeps 2014.
//
// The header strip (title, legend) covers the first row of a track, so the rows start with an empty category.

const WEATHER = {
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/main/data/seattle-weather.csv',
    type: 'csv-time',
    dateFields: ['date']
} as const;

/** 2014 (1 January to 31 December, Unix seconds): a filter compares numbers. */
const YEAR_2014 = [{ type: 'filter', field: 'date', inRange: [1388534400, 1420070399] }];

/** The ISO weeks that hold days of 2014, as the period field names them, after an empty row under the header. */
const WEEKS = ['', ...Array.from({ length: 52 }, (_, i) => `2014-W${String(i + 1).padStart(2, '0')}`), '2015-W01'];

const CALENDAR_X = {
    field: 'date',
    type: 'temporal',
    period: { unit: 'week', newField: 'week' },
    timeUnit: 'day'
} as const;

const PRECIPITATION = {
    field: 'precipitation',
    type: 'quantitative',
    aggregate: 'mean',
    domain: [0, 50],
    range: 'bupu',
    title: 'mm'
} as const;

const spec = {
    title: 'On which days was Seattle wettest?',
    arrangement: 'horizontal',
    spacing: 0,
    views: [
        {
            tracks: [
                {
                    // the week labels, in a narrow track of their own: in the calendar they would cover the Mondays
                    title: 'Week',
                    data: WEATHER,
                    dataTransform: YEAR_2014,
                    mark: 'rect',
                    x: { ...CALENDAR_X, axis: 'none' },
                    row: { field: 'week', type: 'nominal', domain: WEEKS, legend: true },
                    color: { value: 'white' },
                    style: { outline: 'none' },
                    width: 80,
                    height: 800
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Precipitation per day (mm), weeks of 2014',
                    data: WEATHER,
                    dataTransform: YEAR_2014,
                    mark: 'rect',
                    x: { ...CALENDAR_X, axis: 'bottom' },
                    row: { field: 'week', type: 'nominal', domain: WEEKS },
                    color: PRECIPITATION,
                    stroke: { value: 'white' },
                    strokeWidth: { value: 1 },
                    tooltip: [
                        { field: 'date', type: 'temporal', alt: 'Day', format: '%a %d %b %Y' },
                        { field: 'precipitation', type: 'quantitative', alt: 'Precipitation (mm)', format: '.1f' }
                    ],
                    width: 360,
                    height: 800
                }
            ]
        },
        {
            tracks: [
                {
                    // the color legend, in a track of its own: a quantitative legend is drawn inside its track
                    title: 'Daily precipitation',
                    data: WEATHER,
                    dataTransform: [{ type: 'filter', field: 'weather', oneOf: [] }],
                    mark: 'rect',
                    x: { ...CALENDAR_X, axis: 'none' },
                    color: { ...PRECIPITATION, legend: true },
                    style: { outline: 'none' },
                    width: 160,
                    height: 160
                }
            ]
        }
    ]
};

export const EX_SPEC_TEMPORAL_BREHMER_SEATTLE_CALENDAR = spec as unknown as GoslingSpec;
