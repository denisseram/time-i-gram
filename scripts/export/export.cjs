/**
 * Headless export of time-i-gram examples: PNG at 2x, the exact spec as JSON, and a re-render check.
 *
 * Usage (editor dev server running: npx vite --mode editor --port 3456 --strictPort):
 *   node scripts/export/export.cjs <manifest.json> [--base http://localhost:3456] [--only name1,name2] [--verify]
 *
 * The manifest is a JSON array of cases:
 *   { "name": "b03-flu-years",            // base file name
 *     "dir": "docs/examples-export/brehmer",
 *     "example": "TEMPORAL_DATA_…"        // an editor example ID, or
 *     "spec": "docs/…/x.json",            // a JSON spec file (path in the repository)
 *     "states": [                          // optional interaction states, each saved as <name>-<state>.png
 *        { "name": "zoom", "steps": [{ "wheel": [x, y, deltaY, times] }, { "drag": [x0, y0, x1, y1] }] } ] }
 * Coordinates are CSS pixels relative to the top-left corner of the rendered visualization.
 *
 * For each case it writes <dir>/<name>.png (2x) and, for editor examples, <dir>/<name>.json: the spec as the
 * renderer received it. With --verify, every <dir>/<name>.json is rendered in a fresh page and compared with
 * <dir>/<name>.png (pixelmatch, threshold 0.1); differences above 0.5% of the pixels are reported.
 *
 * "Rendered" means: every Gosling track has drawn once (`onNewTrack`), the network is idle, no track has received
 * data for 1 s, and three consecutive screenshots, 500 ms apart, are identical. A case that does not settle within
 * 120 s is reported as unstable and its last screenshot is kept.
 *
 * Needs `pngjs` and `pixelmatch` (5.x), which are not dependencies of the repository: install them in a scratch
 * folder and run with NODE_PATH=<scratch>/node_modules.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
const option = (name, fallback) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : fallback);
const MANIFEST = argv.find(a => a.endsWith('.json'));
const BASE = option('base', 'http://localhost:3456');
const ONLY = option('only', null)?.split(',');
const ROOT = path.resolve(__dirname, '..', '..');
const MISMATCH = 0.005;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Wait until the visualization is fully drawn; returns the final screenshot (PNG buffer) and diagnostics. */
async function settle(page, target) {
    const started = Date.now();
    await page.waitForFunction(() => window.__render && (window.__render.api || window.__render.error), null, {
        timeout: 120000
    });
    const error = await page.evaluate(() => window.__render.error);
    if (error) throw new Error(error);
    // every Gosling track draws once, then reports `onNewTrack`
    await page.waitForFunction(() => window.__render.newTracks.length > 0, null, { timeout: 120000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {});
    let previous = null;
    let same = 0;
    let shot = null;
    while (Date.now() - started < 120000) {
        const quiet = await page.evaluate(() => performance.now() - window.__render.lastEvent > 1000);
        shot = await target.screenshot();
        if (quiet && previous && shot.equals(previous)) same++;
        else same = 0;
        if (same >= 2) return { shot, stable: true, ms: Date.now() - started };
        previous = shot;
        await sleep(500);
    }
    return { shot, stable: false, ms: Date.now() - started };
}

async function open(browser, query) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 2 });
    const messages = [];
    page.on('console', m => m.type() === 'error' && messages.push(m.text()));
    page.on('pageerror', e => messages.push(String(e)));
    await page.goto(`${BASE}/scripts/export/render.html?${query}`, { waitUntil: 'domcontentloaded' });
    const target = page.locator('#container');
    return { page, target, messages };
}

async function interact(page, target, steps) {
    const box = await target.boundingBox();
    for (const step of steps) {
        if (step.wheel) {
            const [x, y, delta, n] = step.wheel;
            await page.mouse.move(box.x + x, box.y + y);
            for (let i = 0; i < n; i++) {
                await page.mouse.wheel(0, delta);
                await sleep(120);
            }
        }
        if (step.drag) {
            const [x0, y0, x1, y1] = step.drag;
            await page.mouse.move(box.x + x0, box.y + y0);
            await page.mouse.down();
            await page.mouse.move(box.x + x1, box.y + y1, { steps: 12 });
            await page.mouse.up();
        }
        if (step.move) await page.mouse.move(box.x + step.move[0], box.y + step.move[1]);
    }
    // park the mouse outside the visualization, so no hover highlight or tooltip is captured
    await page.mouse.move(1, 1);
}

function compare(a, b) {
    const A = PNG.sync.read(a);
    const B = PNG.sync.read(b);
    if (A.width !== B.width || A.height !== B.height)
        return { share: 1, size: `${A.width}x${A.height} vs ${B.width}x${B.height}` };
    const n = pixelmatch(A.data, B.data, null, A.width, A.height, { threshold: 0.1 });
    return { share: n / (A.width * A.height) };
}

(async () => {
    const cases = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).filter(c => !ONLY || ONLY.includes(c.name));
    const browser = await chromium.launch();
    const report = [];
    for (const c of cases) {
        const dir = path.resolve(ROOT, c.dir);
        fs.mkdirSync(dir, { recursive: true });
        const base = path.join(dir, c.name);
        const entry = { name: c.name, dir: c.dir };
        try {
            if (!flag('verify')) {
                const query = c.example ? `example=${c.example}` : `spec=/${c.spec}`;
                const { page, target, messages } = await open(browser, query);
                const first = await settle(page, target);
                fs.writeFileSync(`${base}.png`, first.shot);
                if (c.example) {
                    const spec = await page.evaluate(() => window.__render.spec);
                    fs.writeFileSync(`${base}.json`, JSON.stringify(spec, null, 4) + '\n');
                }
                entry.load = { stable: first.stable, ms: first.ms };
                entry.states = [];
                for (const s of c.states ?? []) {
                    await interact(page, target, s.steps);
                    const after = await settle(page, target);
                    fs.writeFileSync(`${base}-${s.name}.png`, after.shot);
                    entry.states.push({ name: s.name, stable: after.stable, ms: after.ms });
                }
                entry.errors = messages.filter(m => !/favicon|DevTools|ReactDOM.render/.test(m)).slice(0, 5);
                await page.close();
            } else {
                // re-render the saved JSON in a fresh page and compare with the saved PNG
                const json = `${c.dir}/${c.name}.json`;
                JSON.parse(fs.readFileSync(path.join(ROOT, json), 'utf8')); // valid JSON
                const { page, target, messages } = await open(browser, `spec=/${json}`);
                const again = await settle(page, target);
                fs.writeFileSync(`${base}.verify.png`, again.shot);
                const diff = compare(fs.readFileSync(`${base}.png`), again.shot);
                entry.verify = { stable: again.stable, ...diff, ok: diff.share <= MISMATCH };
                if (entry.verify.ok) fs.unlinkSync(`${base}.verify.png`);
                entry.errors = messages.filter(m => !/favicon|DevTools|ReactDOM.render/.test(m)).slice(0, 5);
                await page.close();
            }
        } catch (e) {
            entry.failed = String(e).split('\n')[0];
        }
        console.log(JSON.stringify(entry));
        report.push(entry);
    }
    await browser.close();
    const out = option('report', null);
    if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2));
})();
