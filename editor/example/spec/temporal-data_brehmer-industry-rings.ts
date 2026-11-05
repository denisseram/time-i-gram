import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { OKABE_ITO } from './palette';

// Brehmer et al. (2017) design #11: radial representation x chronological scale x faceted layout.
// One revolution is the whole decade in absolute time (January 2000 to February 2010), and every industry is a
// ring of its own (`row` on `series` in a circular track), so the same years line up along every radius.
// Data: vega-datasets `unemployment-across-industries.json` (U.S. BLS, monthly), read unchanged. The rate (%) is
// drawn, not the count, so that small and large industries share one scale.
//
// The header strip covers the first row of a track, so the rows start with an empty category.

const DATA = {
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/v3.3.1/data/unemployment-across-industries.json',
    type: 'json-time',
    dateFields: ['date']
} as const;

/** The industries, by their peak rate (outer ring: the highest), after an empty row under the header. */
export const INDUSTRIES = [
    'Agriculture',
    'Construction',
    'Leisure and hospitality',
    'Mining and Extraction',
    'Business services',
    'Manufacturing',
    'Wholesale and Retail Trade',
    'Information',
    'Transportation and Utilities',
    'Other',
    'Finance',
    'Self-employed',
    'Education and Health',
    'Government'
];

const spec = {
    title: 'Did every industry go through the same years?',
    layout: 'circular',
    centerRadius: 0.25,
    tracks: [
        {
            title: 'Unemployment rate, 0 to 30 % per ring',
            data: DATA,
            alignment: 'overlay',
            x: {
                field: 'date',
                type: 'temporal',
                axis: 'top',
                domain: { interval: ['2000-01', '2010-02'] }
            },
            y: { field: 'rate', type: 'quantitative', domain: [0, 30], axis: 'none', title: 'Unemployment rate (%)' },
            row: { field: 'series', type: 'nominal', domain: ['', ...INDUSTRIES] },
            tracks: [
                {
                    mark: 'area',
                    // one color for the 14 industries (more than the palette has); bluish green, not the blue of B3's neighbours
                    color: { value: OKABE_ITO.bluishGreen },
                    stroke: { value: OKABE_ITO.bluishGreen },
                    strokeWidth: { value: 0.5 }
                },
                {
                    // the name of each ring, at January 2005 (6 o'clock, where the text is upright)
                    dataTransform: [{ type: 'filter', field: 'date', inRange: [1104537600, 1104624000] }],
                    mark: 'text',
                    text: { field: 'series', type: 'nominal' },
                    y: { value: 6 },
                    color: { value: 'black' },
                    size: { value: 10 },
                    style: { textAnchor: 'start' }
                }
            ],
            width: 760,
            height: 760
        }
    ]
};

export const EX_SPEC_TEMPORAL_BREHMER_INDUSTRY_RINGS = spec as unknown as GoslingSpec;
