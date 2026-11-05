import type { GoslingSpec } from '@gosling-lang/gosling-schema';

// Brehmer et al. (2017) design #13: radial representation x relative scale x faceted layout.
// Each influenza season (ISO week 40 to week 39 of the next year, `groupby: { period: ... }`) is aligned to its own
// peak week (`anchor: { argmax: "INF_A" }`), and every season is a ring of its own (`row` on the new field
// `season`). The relative coordinate system and the circular layout are combined without anything specific to
// either: the same `relative` x as on a linear axis (see "Relative: Flu Seasons ..."), on a ring.
// Data: weekly influenza A cases in the USA, WHO FluNet (the file of the other WHO examples, read unchanged).
//
// The file starts in ISO week 1 of 2010, after the peak of the 2009/10 pandemic season, so that season's anchor
// would not be its peak; it is filtered out. The file ends in ISO week 1 of 2015, so 2014/15 is incomplete; its
// largest count (2014-W52) is close to the end of the file.

const FLU = {
    url: 'https://raw.githubusercontent.com/vanessastoiber/thesis-datasets/main/5_who-flu/who_flu_usa.csv',
    type: 'csv-time',
    dateFields: ['ISO_YEAR', 'ISO_WEEK'],
    includesCalendarWeek: true
} as const;

/** The seasons, outer ring first, after an empty row under the header; the same colors in every WHO figure. */
const SEASONS = ['2010/11', '2011/12', '2012/13', '2013/14', '2014/15'];
const SEASON_COLORS = ['#E5C011', '#12C340', '#1279C3', '#CC2F06', '#7B3294'];

const spec = {
    title: 'Do influenza seasons look alike once aligned to their own peak?',
    layout: 'circular',
    centerRadius: 0.3,
    tracks: [
        {
            title: 'Cases per week, 0 to 14,000 per ring; 0 = the peak week',
            data: FLU,
            dataTransform: [{ type: 'filter', field: 'season', oneOf: SEASONS }],
            alignment: 'overlay',
            x: {
                field: 'ISO_YEAR',
                type: 'temporal',
                relative: {
                    anchor: { argmax: 'INF_A' },
                    groupby: { period: { unit: 'year', weekBased: true, start: 40, newField: 'season' } },
                    unit: 'week',
                    label: "the season's peak"
                },
                domain: { interval: ['-16 weeks', '16 weeks'] },
                axis: 'top'
            },
            y: { field: 'INF_A', type: 'quantitative', domain: [0, 14000], axis: 'none', title: 'Cases per week' },
            row: { field: 'season', type: 'nominal', domain: ['', ...SEASONS] },
            color: {
                field: 'season',
                type: 'nominal',
                domain: SEASONS,
                range: SEASON_COLORS,
                legend: true,
                title: 'Season'
            },
            tracks: [{ mark: 'area', opacity: { value: 0.85 } }],
            width: 600,
            height: 600
        }
    ]
};

export const EX_SPEC_TEMPORAL_BREHMER_FLU_SEASON_RINGS = spec as unknown as GoslingSpec;
