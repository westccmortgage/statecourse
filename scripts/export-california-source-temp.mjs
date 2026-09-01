import { promises as fs } from 'node:fs';
import path from 'node:path';

// Temporary submission-package export. Remove after artifact retrieval.
//
// CHANGED 2026-08-20. This wrote into public/, so every build published the whole
// california/ tree - including all six final-exam answer keys - to the live site. RE 303:
// "Under no circumstances shall the final exam be furnished directly to the students."
// The output now goes to a gitignored local directory that no build publishes. Do not
// point this back at public/ or dist/ for any reason.
const root = process.cwd();
const sourceRoot = path.join(root, 'california');
const outputDir = path.join(root, '.local-export');
const outputPath = path.join(outputDir, 'california-source.json');

async function walk(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result = {};
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, await walk(absolute, base));
      continue;
    }
    if (!entry.isFile()) continue;
    const relative = path.relative(base, absolute).split(path.sep).join('/');
    const content = await fs.readFile(absolute, 'utf8');
    result[relative] = content;
  }
  return result;
}

const files = await walk(sourceRoot);
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(
  outputPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), files }),
  'utf8',
);
console.log(`Temporary California export written: ${outputPath} (${Object.keys(files).length} files)`);
