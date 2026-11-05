import type { GoslingSpec } from '@gosling-lang/gosling-schema';

// TimeViz Browser: SolarPlot (Chuah 1998, "Dynamic Aggregation with Circular Visual Designs", IEEE InfoVis,
// https://doi.org/10.1109/INFVIS.1998.729557).
// The whole series is one revolution of a circle; it is cut into bins, and each bin is a sunbeam whose length is
// the number of items in it. Here the items are the rainy days of vega-datasets `seattle-weather.csv` (NOAA,
// daily, 2012-2015, read unchanged; the filter keeps `weather` = rain). Chuah's ticket-sales data are not public.
// - The bins come from `timeUnit` rules with `aggregate: "count"`: by week while less than 1 year is visible, by
//   month above. Chuah changes the number of bins with the size of the circle; here it changes with the visible
//   span (zoom on either view).
// - The brush on the ring drives a linear detail with the same rules (Chuah shows the detail as an arc).

const WEATHER = {
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/v3.3.1/data/seattle-weather.csv',
    type: 'csv-time',
    dateFields: ['date']
} as const;

const RAIN = [{ type: 'filter', field: 'weather', oneOf: ['rain'] }];

/** Bins: weeks below one visible year, months above. */
const BINS = [{ unit: 'week', maxSpan: '1 year' }, { unit: 'month' }];

const RAINY_DAYS = { field: 'date', type: 'quantitative', aggregate: 'count', title: 'Rainy days per bin' } as const;

const spec = {
    title: 'How are rainy days spread over four years in Seattle?',
    arrangement: 'horizontal',
    spacing: 40,
    views: [
        {
            layout: 'circular',
            centerRadius: 0.35,
            tracks: [
                {
                    title: 'One revolution = 2012 to 2015; sunbeams: rainy days per month (per week below 1 year)',
                    data: WEATHER,
                    dataTransform: RAIN,
                    alignment: 'overlay',
                    x: {
                        field: 'date',
                        type: 'temporal',
                        timeUnit: BINS,
                        axis: 'top',
                        domain: { interval: ['2012', '2015'] }
                    },
                    y: {
                        ...RAINY_DAYS,
                        domain: [0, 25],
                        axis: 'none',
                        title: 'Rainy days per bin, 0 to 25 (beam length)'
                    },
                    tracks: [
                        { mark: 'bar', color: { value: '#2c7fb8' } },
                        {
                            mark: 'brush',
                            x: { linkingId: 'solar-detail' },
                            color: { value: 'steelBlue' },
                            opacity: { value: 0.15 }
                        }
                    ],
                    width: 460,
                    height: 460
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Detail of the brushed interval: rainy days per week (per month above 1 year); x: date',
                    data: WEATHER,
                    dataTransform: RAIN,
                    mark: 'bar',
                    x: {
                        field: 'date',
                        type: 'temporal',
                        timeUnit: BINS,
                        axis: 'bottom',
                        linkingId: 'solar-detail',
                        domain: { interval: ['2014-09', '2015-04'] }
                    },
                    y: { ...RAINY_DAYS, domain: [0, 25], axis: 'left', title: 'Rainy days per bin' },
                    color: { value: '#2c7fb8' },
                    width: 620,
                    height: 300
                }
            ]
        }
    ]
};

export const EX_SPEC_TEMPORAL_TIMEVIZ_SOLARPLOT = spec as unknown as GoslingSpec;
