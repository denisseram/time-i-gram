import type { GoslingSpec } from '@gosling-lang/gosling-schema';

// TimeViz Browser: Cycle Plot (Cleveland 1993, "Visualizing Data", Hobart Press; Cleveland, Dunn & Terpenning 1978).
// The horizontal axis is cut into the positions of the cycle (here the 12 months); each position holds its own small
// line plot of that month's values across the years, in time order, and a horizontal line at their mean.
// Data: vega-datasets `unemployment-across-industries.json` (U.S. BLS, monthly), read unchanged; the filters keep
// Construction, which has a strong seasonal cycle, and the ten complete years 2000-2009.
//
// Grammar: composition, not `period`. A `period` axis superposes the years at the same position (a seasonal plot);
// the cycle plot instead lays the years out in order inside each position, which is a juxtaposition of twelve
// views, each filtered to one month (`month` is a column of the file). The mean is a `rule` with `timeUnit`
// "decade" and `aggregate: "mean"`: one value for the ten years, drawn across the panel.

const DATA = {
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/v3.3.1/data/unemployment-across-industries.json',
    type: 'json-time',
    dateFields: ['date']
} as const;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RATE = { field: 'rate', type: 'quantitative', domain: [0, 30], title: 'Unemployment rate (%)' } as const;

const LINE = { mark: 'line', color: { value: '#c44e52' }, size: { value: 1.5 } } as const;
const MEAN = { mark: 'rule', color: { value: '#555555' }, strokeWidth: { value: 1.5 } } as const;

/** One month: its values from 2000 to 2009 in time order, and their mean. Only January has the y axis. */
function monthPanel(name: string, i: number) {
    const axis = i === 0 ? 'left' : 'none';
    // the y title is in January's header only; the other headers would cut it
    const y = i === 0 ? { ...RATE, axis } : { field: RATE.field, type: RATE.type, domain: RATE.domain, axis };
    return {
        tracks: [
            {
                title: i === 0 ? `${name}; x: year` : name,
                data: DATA,
                dataTransform: [
                    { type: 'filter', field: 'series', oneOf: ['Construction'] },
                    { type: 'filter', field: 'month', oneOf: [i + 1] },
                    { type: 'filter', field: 'year', inRange: [2000, 2009] }
                ],
                alignment: 'overlay',
                x: {
                    field: 'date',
                    type: 'temporal',
                    axis: 'bottom',
                    linkingId: 'years',
                    domain: { interval: ['2000-01-01', '2009-12-01'] }
                },
                y,
                tracks: [
                    LINE,
                    // a member that redefines x must repeat the linkingId, or its panel leaves the link
                    {
                        ...MEAN,
                        x: { field: 'date', type: 'temporal', timeUnit: 'decade', linkingId: 'years' },
                        y: { ...y, aggregate: 'mean' }
                    }
                ],
                // January also holds the y axis (about 40 px), so that every panel has the same plot width
                width: i === 0 ? 150 : 110,
                height: 260
            }
        ]
    };
}

/** The legend of the line and the mean, in a track of its own: the panels are too narrow for a header legend. */
const legend = {
    tracks: [
        {
            data: DATA,
            dataTransform: [{ type: 'filter', field: 'series', oneOf: [] }],
            alignment: 'overlay',
            x: { field: 'date', type: 'temporal', axis: 'none', domain: { interval: ['2000-01-01', '2009-12-01'] } },
            y: { field: 'rate', type: 'quantitative', domain: [0, 30], axis: 'none' },
            tracks: [
                { ...LINE, style: { legendTitle: 'Construction', legendLabel: 'Rate, 2000 to 2009' } },
                { ...MEAN, style: { legendLabel: 'Mean of the month' } }
            ],
            style: { outline: 'none' },
            width: 1350,
            height: 30
        }
    ]
};

const spec = {
    title: 'Does every month of the year follow the same trend in construction unemployment?',
    arrangement: 'vertical',
    spacing: 0,
    views: [{ arrangement: 'horizontal', spacing: 4, views: MONTHS.map(monthPanel) }, legend]
};

export const EX_SPEC_TEMPORAL_TIMEVIZ_CYCLE_PLOT = spec as unknown as GoslingSpec;
