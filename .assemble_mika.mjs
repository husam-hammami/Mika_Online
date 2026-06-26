import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const OUT_DIR = '/tmp/mika_rec';
const SEQ_DIR = path.join(OUT_DIR, 'seq');
const frames = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'frames.json'), 'utf8'));

const FPS = 30;
const TOTAL_SEC = Number(process.argv[2] || 72);
const N = FPS * TOTAL_SEC;

fs.rmSync(SEQ_DIR, { recursive: true, force: true });
fs.mkdirSync(SEQ_DIR, { recursive: true });

let j = 0;
for (let i = 0; i < N; i++) {
  const tOut = (i / FPS) * 1000;
  while (j + 1 < frames.length && frames[j + 1].tMs <= tOut) j++;
  const src = frames[Math.min(j, frames.length - 1)].file;
  const dst = path.join(SEQ_DIR, `s${String(i).padStart(5, '0')}.jpg`);
  fs.copyFileSync(src, dst);
}
console.log(`Built ${N} resampled frames at ${FPS}fps -> ${TOTAL_SEC}s`);

const silentMp4 = path.join(OUT_DIR, 'silent.mp4');
const finalMp4 = path.join(OUT_DIR, 'mika_promo.mp4');
const music = '/home/runner/workspace/artifacts/mika-promo/public/audio/bg_music.mp3';

execFileSync('ffmpeg', [
  '-y',
  '-framerate', String(FPS),
  '-i', path.join(SEQ_DIR, 's%05d.jpg'),
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',
  '-crf', '18',
  '-preset', 'medium',
  '-movflags', '+faststart',
  silentMp4,
], { stdio: 'inherit' });

// Loop the soundtrack to fill the full runtime, then trim to video length.
execFileSync('ffmpeg', [
  '-y',
  '-i', silentMp4,
  '-stream_loop', '-1', '-i', music,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-map', '0:v:0',
  '-map', '1:a:0',
  '-t', String(TOTAL_SEC),
  '-shortest',
  finalMp4,
], { stdio: 'inherit' });

console.log('FINAL:', finalMp4);
