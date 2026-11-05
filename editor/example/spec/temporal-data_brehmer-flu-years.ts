import type { GoslingSpec } from '@gosling-lang/gosling-schema';

// Brehmer et al. (2017) design #3: linear representation x chronological scale x segmented layout.
// The time axis is cut into ISO week-based years (`period: { unit: "year", weekBased: true }`) and every year is
// drawn as its own row (`row` on the period field `year`), so ISO weeks 1 to 53 are the columns and the years can
// be read top to bottom. Data: weekly influenza A cases in the USA, WHO FluNet (the file of the other WHO
// examples, read unchanged). The file holds ISO years 2010 to 2014 and the first week of 2015.

const FLU = {
    url: 'https://raw.githubusercontent.com/vanessastoiber/thesis-datasets/44333d134c2aa1faf1503f2af29a8ae4d5f738e4/5_who-flu/who_flu_usa.csv',
    type: 'csv-time',
    // the Monday of each ISO week is stored in the first field (see the period example)
    dateFields: ['ISO_YEAR', 'ISO_WEEK'],
    includesCalendarWeek: true
} as const;

/** The complete ISO years of the file; its last row, 2015-W01, is left out (rows outside the domain are not drawn). */
const YEARS = ['2010', '2011', '2012', '2013', '2014'];

const spec = {
    title: 'Does every year follow the same influenza cycle?',
    tracks: [
        {
            title: 'Influenza A cases per week, by ISO week of the year',
            data: FLU,
            mark: 'area',
            x: {
                field: 'ISO_YEAR',
                type: 'temporal',
                period: { unit: 'year', weekBased: true, newField: 'year' },
                axis: 'bottom'
            },
            y: { field: 'INF_A', type: 'quantitative', domain: [0, 14000], axis: 'left', title: 'Cases per week' },
            row: { field: 'year', type: 'nominal', domain: YEARS, legend: true },
            color: { value: '#1279C3' },
            stroke: { value: '#0b4f80' },
            strokeWidth: { value: 1 },
            width: 900,
            height: 700
        }
    ]
};

export const EX_SPEC_TEMPORAL_BREHMER_FLU_YEARS = spec as unknown as GoslingSpec;
