#!/usr/bin/env node
/**
 * Compress a folder of photos for upload to Sanity.
 *
 *   Usage:   node scripts/compress-photos.mjs /path/to/photo-folder
 *   Output:  /path/to/photo-folder-web   (originals are never touched)
 *
 * - Resizes to max 2560px on the long edge (largest size the site renders)
 * - JPEG quality 82, mozjpeg — visually lossless at display sizes
 * - Strips all metadata, including GPS location
 * - Bakes in EXIF rotation first, so photos keep their orientation
 * - Re-runs are incremental: already-converted photos are skipped
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const INPUT_EXTS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp', '.avif']);
const HEIC_EXTS = new Set(['.heic', '.heif']);
const MAX_EDGE = 2560;
const QUALITY = 82;

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

const arg = process.argv[2];
if (!arg || !fs.existsSync(arg) || !fs.statSync(arg).isDirectory()) {
  console.error('Usage: node scripts/compress-photos.mjs <photo-folder>');
  process.exit(1);
}
const srcDir = path.resolve(arg);
const outDir = srcDir + '-web';

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const all = [...walk(srcDir)];
const photos = all.filter((f) => INPUT_EXTS.has(path.extname(f).toLowerCase()));
const heic = all.filter((f) => HEIC_EXTS.has(path.extname(f).toLowerCase()));

if (photos.length === 0 && heic.length === 0) {
  console.log('No photos found in ' + srcDir);
  process.exit(0);
}

let inTotal = 0;
let outTotal = 0;
let done = 0;
let skipped = 0;
let failed = 0;

for (const file of photos) {
  const rel = path.relative(srcDir, file);
  const outPath = path.join(outDir, rel.replace(/\.[^.]+$/, '.jpg'));

  if (fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= fs.statSync(file).mtimeMs) {
    skipped++;
    continue;
  }

  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(file)
      .rotate() // apply EXIF orientation before metadata is stripped
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath);

    const inBytes = fs.statSync(file).size;
    const outBytes = fs.statSync(outPath).size;
    inTotal += inBytes;
    outTotal += outBytes;
    done++;
    console.log(`  ${rel}   ${mb(inBytes)} -> ${mb(outBytes)}`);
  } catch (err) {
    failed++;
    console.error(`  FAILED ${rel}: ${err.message}`);
  }
}

console.log('');
if (done > 0) {
  console.log(`Done: ${done} photo${done === 1 ? '' : 's'} -> ${outDir}`);
  console.log(`Total: ${mb(inTotal)} -> ${mb(outTotal)} (saved ${Math.round((1 - outTotal / inTotal) * 100)}%)`);
}
if (skipped > 0) console.log(`Skipped ${skipped} already converted (delete the -web folder to redo them).`);
if (failed > 0) console.log(`${failed} failed — see errors above.`);
if (heic.length > 0) {
  console.log(`\nNote: ${heic.length} HEIC file${heic.length === 1 ? '' : 's'} skipped — this tool can't read iPhone HEIC.`);
  console.log('Export them from the Photos app first: select photos -> File -> Export -> JPEG.');
}
