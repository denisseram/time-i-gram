import fs from 'fs';
import path from 'path';
import { compile } from '../../src/compiler/compile';
import { getTheme } from '../../src/core/utils/theme';
import { validateGoslingSpec, type GoslingSpec } from '@gosling-lang/gosling-schema';
import { parseTimeValue } from '../../src/core/utils/time-units';
import { EX_SPEC_TEMPORAL_OVERVIEW_DETAIL } from './json-spec/temporal-data_overview-detail';
import { EX_SPEC_TEMPORAL_SEATTLE_WEATHER } from './spec/temporal-data_seattle-weather';
import { EX_SPEC_TEMPORAL_UNEMPLOYMENT_CIRCULAR_LINEAR } from './spec/temporal-data_unemployment-circular-linear';
import { EX_SPEC_TEMPORAL_SUPP_UNEMPLOYMENT } from './spec/temporal-data_supp-unemployment';
import { EX_SPEC_TEMPORAL_SUPP_SEATTLE_WEATHER } from './spec/temporal-data_supp-seattle-weather';
import { EX_SPEC_TEMPORAL_SUPP_SOLAR_WEATHER } from './spec/temporal-data_supp-solar-weather';
import { EX_SPEC_TEMPORAL_SUPP_NYC_TAXI } from './spec/temporal-data_supp-nyc-taxi';
import { EX_SPEC_TEMPORAL_SUPP_WHO_FLU } from './spec/temporal-data_supp-who-flu';
import { EX_SPEC_TEMPORAL_SUPP_FITBIT } from './spec/temporal-data_supp-fitbit';
import { EX_SPEC_TEMPORAL_WHO_FLU_PERIOD } from './spec/temporal-data_who-flu-period';
import { EX_SPEC_TEMPORAL_FITBIT_CYCLES } from './spec/temporal-data_fitbit-cycles';
import { EX_SPEC_TEMPORAL_UNEMPLOYMENT_GRANULARITY } from './spec/temporal-data_unemployment-granularity';
import { EX_SPEC_TEMPORAL_RELATIVE_ALIGNMENT } from './spec/temporal-data_relative-alignment';
import { EX_SPEC_TEMPORAL_TAXI_SPANS } from './spec/temporal-data_taxi-spans';
import { EX_SPEC_TEMPORAL_CMAPSS_ALIGNMENT } from './spec/temporal-data_cmapss-alignment';
import { EX_SPEC_TEMPORAL_CMAPSS_PROGNOSIS } from './spec/temporal-data_cmapss-prognosis';
import { EX_SPEC_TEMPORAL_CHRO_RING } from './spec/temporal-data_chro-ring';
import { EX_SPEC_TEMPORAL_BEIJING_AIR } from './spec/temporal-data_beijing-air';
import { EX_SPEC_TEMPORAL_NOVELISTS } from './spec/temporal-data_novelists';
import { EX_SPEC_TEMPORAL_KEELING_CO2 } from './spec/temporal-data_keeling-co2';
import { EX_SPEC_TEMPORAL_BREHMER_FLU_YEARS } from './spec/temporal-data_brehmer-flu-years';
import { EX_SPEC_TEMPORAL_BREHMER_INDUSTRY_RINGS } from './spec/temporal-data_brehmer-industry-rings';
import { EX_SPEC_TEMPORAL_BREHMER_FLU_SEASON_RINGS } from './spec/temporal-data_brehmer-flu-season-rings';
import { EX_SPEC_TEMPORAL_BREHMER_SEATTLE_CALENDAR } from './spec/temporal-data_brehmer-seattle-calendar';
import { EX_SPEC_TEMPORAL_BREHMER_CO2_DECADE_GRID } from './spec/temporal-data_brehmer-co2-decade-grid';
import { TIME_INPUT_DATE_AND_TIME, TIME_INPUT_UNIX_TIMESTAMPS } from './doc-examples/time-input';

/** The JS code blocks of README.md that build a spec, evaluated to the spec object. */
function readmeSpecs(): Record<string, GoslingSpec> {
    const md = fs.readFileSync(path.resolve(__dirname, '../../README.md'), 'utf8');
    const running = md.slice(
        md.indexOf('const DATA_URL'),
        md.indexOf('embed(document.getElementById("container"), spec);')
    );
    const quickStartBegin = md.indexOf("const spec = {\n      title: 'Seattle Weather'");
    const quickStart = md.slice(
        quickStartBegin,
        md.indexOf("embed(document.getElementById('container'), spec);", quickStartBegin)
    );
    return {
        'README running example': new Function(`${running}; return spec;`)(),
        'README quick start': new Function(`${quickStart}; return spec;`)()
    };
}

const examples: Record<string, GoslingSpec> = {
    'overview-detail': EX_SPEC_TEMPORAL_OVERVIEW_DETAIL,
    'seattle-weather': EX_SPEC_TEMPORAL_SEATTLE_WEATHER,
    'unemployment-circular-linear': EX_SPEC_TEMPORAL_UNEMPLOYMENT_CIRCULAR_LINEAR,
    'supp S3 unemployment': EX_SPEC_TEMPORAL_SUPP_UNEMPLOYMENT,
    'supp S4 seattle weather': EX_SPEC_TEMPORAL_SUPP_SEATTLE_WEATHER,
    'supp S5 solar and weather': EX_SPEC_TEMPORAL_SUPP_SOLAR_WEATHER,
    'supp S6 NYC taxi': EX_SPEC_TEMPORAL_SUPP_NYC_TAXI,
    'supp S7 WHO flu': EX_SPEC_TEMPORAL_SUPP_WHO_FLU,
    'supp S8 FitBit': EX_SPEC_TEMPORAL_SUPP_FITBIT,
    'period: WHO flu': EX_SPEC_TEMPORAL_WHO_FLU_PERIOD,
    'period: FitBit cycles': EX_SPEC_TEMPORAL_FITBIT_CYCLES,
    'granularity: unemployment': EX_SPEC_TEMPORAL_UNEMPLOYMENT_GRANULARITY,
    'relative: alignment': EX_SPEC_TEMPORAL_RELATIVE_ALIGNMENT,
    'spans: taxi': EX_SPEC_TEMPORAL_TAXI_SPANS,
    'relative: C-MAPSS alignment': EX_SPEC_TEMPORAL_CMAPSS_ALIGNMENT,
    'relative: C-MAPSS prognosis': EX_SPEC_TEMPORAL_CMAPSS_PROGNOSIS,
    'Chro-Ring': EX_SPEC_TEMPORAL_CHRO_RING,
    'calendar: Beijing air': EX_SPEC_TEMPORAL_BEIJING_AIR,
    'relative: novelists': EX_SPEC_TEMPORAL_NOVELISTS,
    'period: Keeling CO2': EX_SPEC_TEMPORAL_KEELING_CO2,
    'Brehmer #3: flu years': EX_SPEC_TEMPORAL_BREHMER_FLU_YEARS,
    'Brehmer #11: industry rings': EX_SPEC_TEMPORAL_BREHMER_INDUSTRY_RINGS,
    'Brehmer #13: flu season rings': EX_SPEC_TEMPORAL_BREHMER_FLU_SEASON_RINGS,
    'Brehmer #17: Seattle calendar': EX_SPEC_TEMPORAL_BREHMER_SEATTLE_CALENDAR,
    'Brehmer #16: CO2 decade grid': EX_SPEC_TEMPORAL_BREHMER_CO2_DECADE_GRID,
    'doc: date and time columns': TIME_INPUT_DATE_AND_TIME,
    'doc: Unix timestamps': TIME_INPUT_UNIX_TIMESTAMPS,
    ...readmeSpecs()
};

/** Compile a spec and return the HiGlass view config. */
function compileToHiGlass(spec: GoslingSpec) {
    let hiGlassSpec: any;
    compile(JSON.parse(JSON.stringify(spec)), hs => (hiGlassSpec = hs), [], getTheme(), {});
    return hiGlassSpec;
}

/** Initial x domains of the compiled views that contain a temporal track. */
function temporalViewDomains(spec: GoslingSpec): number[][] {
    return compileToHiGlass(spec)
        .views.filter((view: any) => JSON.stringify(view.tracks).includes('"type":"temporal"'))
        .map((view: any) => view.initialXDomain as number[]);
}

/**
 * Titles (or marks) of tracks that draw marks but have no data, neither their own nor inherited from an
 * enclosing view or track group. The compiler silently drops such tracks, so they would not appear at all.
 */
function tracksWithoutData(spec: any): string[] {
    const missing: string[] = [];
    const visit = (node: any, inherited: { data?: unknown; mark?: string }) => {
        const scope = { data: node.data ?? inherited.data, mark: node.mark ?? inherited.mark };
        const children = [...(node.views ?? []), ...(node.tracks ?? [])];
        if (children.length > 0) {
            children.forEach(child => visit(child, scope));
        } else if (scope.mark !== 'brush' && !scope.data) {
            missing.push(node.title ?? scope.mark ?? 'untitled track');
        }
    };
    visit(spec, {});
    return missing;
}

describe.each(Object.entries(examples))('temporal example "%s"', (_, spec) => {
    it('is valid, so the editor renders it', () => {
        const { state, details } = validateGoslingSpec(spec);
        expect(state, details).toEqual('success');
    });

    it('starts every temporal view at an explicit time domain, not the genomic default', () => {
        const domains = temporalViewDomains(spec);
        expect(domains.length).toBeGreaterThan(0);
        // without a domain, the view falls back to the length of hg38 (0 to 3,088,269,832), i.e. 1970-2067
        domains.forEach(domain => expect(domain).not.toEqual([0, 3088269832]));
    });

    it('gives every track that draws marks a data source', () => {
        expect(tracksWithoutData(spec)).toEqual([]);
    });
});

describe('temporal example "supp S8 FitBit"', () => {
    const spec = EX_SPEC_TEMPORAL_SUPP_FITBIT as any;
    const dailyActivity = spec.views[0].views[1];

    it('starts at the recording period of the heart-rate data (12 April to 12 May 2016)', () => {
        const [start, end] = spec.xDomain.interval;
        expect([parseTimeValue(start, 'start'), parseTimeValue(end, 'end')]).toEqual([
            Date.UTC(2016, 3, 12) / 1000,
            Date.UTC(2016, 4, 13) / 1000
        ]);
    });

    it('shows the activity of the participant whose heart rate it shows', () => {
        const heartRate = spec.views[0].views[0].tracks[0];
        expect(dailyActivity.dataTransform).toEqual(heartRate.dataTransform);
    });

    it('names the bars and the line in the legend and on their axes', () => {
        expect(dailyActivity.tracks.map((t: any) => [t.mark, t.style.legendLabel, t.y.title])).toEqual([
            ['bar', 'Steps (bars)', 'Steps'],
            ['line', 'Very active minutes (line)', 'Very active minutes']
        ]);
    });
});

/** Every track of a spec, with the properties inherited from its enclosing views and track groups. */
function leafTracks(node: any, inherited: any = {}): any[] {
    const scope = {
        ...inherited,
        ...Object.fromEntries(Object.entries(node).filter(([k]) => !['views', 'tracks'].includes(k)))
    };
    const children = [...(node.views ?? []), ...(node.tracks ?? [])];
    return children.length ? children.flatMap(child => leafTracks(child, scope)) : [scope];
}

describe('Brehmer et al. (2017) design cells', () => {
    const drawn = (spec: GoslingSpec) => leafTracks(spec).filter(t => t.mark !== 'brush');

    it('#3 linear chronological segmented: ISO years as rows of a linear period axis', () => {
        const [track] = drawn(EX_SPEC_TEMPORAL_BREHMER_FLU_YEARS);
        expect(track.layout ?? 'linear').toEqual('linear');
        expect(track.x.period).toEqual({ unit: 'year', weekBased: true, newField: 'year' });
        expect(track.row.field).toEqual('year');
    });

    it('#11 radial chronological faceted: absolute time on a ring, one ring per industry', () => {
        const tracks = drawn(EX_SPEC_TEMPORAL_BREHMER_INDUSTRY_RINGS);
        tracks.forEach(t => {
            expect(t.layout).toEqual('circular');
            expect(t.x.period ?? t.x.relative).toBeUndefined();
            expect(t.row.field).toEqual('series');
        });
    });

    it('#13 radial relative faceted: seasons aligned to their peak, one ring per season', () => {
        const tracks = drawn(EX_SPEC_TEMPORAL_BREHMER_FLU_SEASON_RINGS);
        tracks.forEach(t => {
            expect(t.layout).toEqual('circular');
            expect(t.x.relative.anchor).toEqual({ argmax: 'INF_A' });
            expect(t.x.relative.groupby.period).toMatchObject({
                unit: 'year',
                weekBased: true,
                start: 40,
                newField: 'season'
            });
            expect(t.row.field).toEqual('season');
        });
    });

    it('#16 base-10 grid: composed from period decade, row and timeUnit year', () => {
        const tracks = drawn(EX_SPEC_TEMPORAL_BREHMER_CO2_DECADE_GRID);
        tracks.forEach(t => {
            expect(t.layout ?? 'linear').toEqual('linear');
            expect(t.x.period).toEqual({ unit: 'decade', newField: 'decade' });
            expect(t.x.timeUnit).toEqual('year');
        });
        expect(tracks.filter(t => t.row).every(t => t.row.field === 'decade')).toBe(true);
    });

    it('#17 calendar: composed from period week, row and timeUnit day, without a calendar layout', () => {
        const tracks = drawn(EX_SPEC_TEMPORAL_BREHMER_SEATTLE_CALENDAR);
        tracks.forEach(t => {
            expect(t.layout ?? 'linear').toEqual('linear');
            expect(t.x.period).toEqual({ unit: 'week', newField: 'week' });
            expect(t.x.timeUnit).toEqual('day');
        });
        expect(tracks.filter(t => t.row).every(t => t.row.field === 'week')).toBe(true);
    });

    it('new design-cell examples have a title and no subtitle', () => {
        [
            EX_SPEC_TEMPORAL_BREHMER_FLU_YEARS,
            EX_SPEC_TEMPORAL_BREHMER_INDUSTRY_RINGS,
            EX_SPEC_TEMPORAL_BREHMER_FLU_SEASON_RINGS,
            EX_SPEC_TEMPORAL_BREHMER_SEATTLE_CALENDAR,
            EX_SPEC_TEMPORAL_BREHMER_CO2_DECADE_GRID
        ].forEach((spec: any) => {
            expect(spec.title).toMatch(/\?$/);
            expect(spec.subtitle).toBeUndefined();
        });
    });
});
