import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
const URL = 'http://localhost:23724/';
const OUT_DIR = '/tmp/mika_rec';
const RAW_DIR = path.join(OUT_DIR, 'raw');
const TOTAL_SEC = Number(process.argv[2] || 72);
const CAPTURE_MS = (TOTAL_SEC + 2) * 1000;

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--window-size=1920,1080',
    '--autoplay-policy=no-user-gesture-required',
  ],
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });

const client = await page.target().createCDPSession();
await client.send('Page.enable');

const frames = [];
let idx = 0;
let t0 = null;

client.on('Page.screencastFrame', async (frame) => {
  const tsMs = frame.metadata.timestamp * 1000;
  if (t0 === null) t0 = tsMs;
  const rel = tsMs - t0;
  const file = path.join(RAW_DIR, `f${String(idx).padStart(6, '0')}.jpg`);
  fs.writeFileSync(file, Buffer.from(frame.data, 'base64'));
  frames.push({ tMs: rel, file });
  idx++;
  try {
    await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
  } catch {}
});

await client.send('Page.startScreencast', {
  format: 'jpeg',
  quality: 92,
  maxWidth: 1920,
  maxHeight: 1080,
  everyNthFrame: 1,
});

await new Promise((r) => setTimeout(r, CAPTURE_MS));
await client.send('Page.stopScreencast');
await browser.close();

fs.writeFileSync(path.join(OUT_DIR, 'frames.json'), JSON.stringify(frames));
console.log(`Captured ${frames.length} raw frames over ${(frames.at(-1)?.tMs / 1000).toFixed(1)}s (target ${TOTAL_SEC}s)`);
