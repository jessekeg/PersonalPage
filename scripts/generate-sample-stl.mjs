/**
 * Generates a sample binary STL — a lobed cycloidal-style disc with a center
 * bore — so the site's 3D viewer has a model to show before real CAD exports
 * are added. Output: public/models/cycloidal-disc-sample.stl
 *
 * Run with: npm run generate:sample-stl
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models');
const OUT_FILE = join(OUT_DIR, 'cycloidal-disc-sample.stl');

// Disc geometry (mm)
const R = 20; // mean outer radius
const A = 1.8; // lobe amplitude
const LOBES = 10;
const BORE = 6; // bore radius
const THICKNESS = 6;
const SEGMENTS = 480;

const outerR = (theta) => R + A * Math.cos(LOBES * theta);

const triangles = [];

function addTri(v1, v2, v3) {
  const ux = v2[0] - v1[0], uy = v2[1] - v1[1], uz = v2[2] - v1[2];
  const vx = v3[0] - v1[0], vy = v3[1] - v1[1], vz = v3[2] - v1[2];
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  triangles.push({ n: [nx / len, ny / len, nz / len], v: [v1, v2, v3] });
}

for (let i = 0; i < SEGMENTS; i++) {
  const t0 = (i / SEGMENTS) * Math.PI * 2;
  const t1 = ((i + 1) / SEGMENTS) * Math.PI * 2;

  const oB0 = [outerR(t0) * Math.cos(t0), outerR(t0) * Math.sin(t0), 0];
  const oB1 = [outerR(t1) * Math.cos(t1), outerR(t1) * Math.sin(t1), 0];
  const oT0 = [oB0[0], oB0[1], THICKNESS];
  const oT1 = [oB1[0], oB1[1], THICKNESS];
  const iB0 = [BORE * Math.cos(t0), BORE * Math.sin(t0), 0];
  const iB1 = [BORE * Math.cos(t1), BORE * Math.sin(t1), 0];
  const iT0 = [iB0[0], iB0[1], THICKNESS];
  const iT1 = [iB1[0], iB1[1], THICKNESS];

  // Top annulus (+z)
  addTri(iT0, oT0, oT1);
  addTri(iT0, oT1, iT1);
  // Bottom annulus (-z)
  addTri(iB0, oB1, oB0);
  addTri(iB0, iB1, oB1);
  // Outer wall (outward)
  addTri(oB0, oB1, oT1);
  addTri(oB0, oT1, oT0);
  // Bore wall (inward)
  addTri(iB0, iT0, iT1);
  addTri(iB0, iT1, iB1);
}

// Binary STL: 80-byte header, uint32 count, 50 bytes per triangle.
const buf = Buffer.alloc(84 + triangles.length * 50);
buf.write('Sample cycloidal disc — generated for jesse-kegley-site', 0, 'ascii');
buf.writeUInt32LE(triangles.length, 80);

let offset = 84;
for (const tri of triangles) {
  for (const val of tri.n) {
    buf.writeFloatLE(val, offset);
    offset += 4;
  }
  for (const vert of tri.v) {
    for (const val of vert) {
      buf.writeFloatLE(val, offset);
      offset += 4;
    }
  }
  buf.writeUInt16LE(0, offset);
  offset += 2;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, buf);
console.log(`Wrote ${triangles.length} triangles to ${OUT_FILE}`);
