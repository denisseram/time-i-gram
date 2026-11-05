/**
 * Headless render page for `scripts/export/export.cjs` (served by the editor dev server at
 * /scripts/export/render.html).
 *
 *   ?example=<editor ID>   renders a registered editor example (`editor/example/index.ts`)
 *   ?spec=<path or URL>    renders a JSON spec file (e.g. /docs/examples-export/brehmer/b03.json)
 *
 * It exposes `window.__render` with the resolved spec, the API, and counters of the rendering events
 * (`onNewTrack`, `rawData`), so the export script can wait until every track has drawn instead of a fixed timeout.
 */
import { embed } from 'gosling.js';
import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import 'higlass/dist/hglib.css';
import PubSub from 'pubsub-js';
import { examples } from '../../editor/example';

type RenderState = {
    spec?: GoslingSpec;
    api?: Awaited<ReturnType<typeof embed>>;
    error?: string;
    newTracks: string[];
    rawData: number;
    lastEvent: number;
};

const state: RenderState = { newTracks: [], rawData: 0, lastEvent: performance.now() };
(window as any).__render = state;

async function resolveSpec(): Promise<GoslingSpec> {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('example');
    if (id) {
        const example = examples[id];
        if (!example) throw new Error(`No example with the ID ${id}`);
        const spec = example.spec;
        // JS specs are stored as code strings that evaluate to the spec object
        return typeof spec === 'string' ? JSON.parse(spec) : structuredClone(spec);
    }
    const url = params.get('spec');
    if (!url) throw new Error('Give ?example=<ID> or ?spec=<URL>');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return response.json();
}

(async () => {
    try {
        const spec = await resolveSpec();
        state.spec = structuredClone(spec);
        // subscribe before embedding: tracks can draw before `embed` resolves
        PubSub.subscribe('onNewTrack', (_: string, data: { id: string }) => {
            state.newTracks.push(data.id);
            state.lastEvent = performance.now();
        });
        PubSub.subscribe('rawData', () => {
            state.rawData++;
            state.lastEvent = performance.now();
        });
        state.api = await embed(document.getElementById('container')!, spec, { padding: 0 });
    } catch (e) {
        state.error = String(e);
    }
})();
