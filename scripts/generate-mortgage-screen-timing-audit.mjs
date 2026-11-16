import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCourseConfiguration, getCourseDelivery } from '../config/course-registry.mjs';
import { screenStudyGate } from '../config/california-block-study-gates.mjs';
import { MORTGAGE_SCREEN_STUDY_METRICS } from '../config/california/mortgage-screen-study-metrics.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const courseId = 'ca-mortgage-loan-brokering-lending-45';
const course = getCourseConfiguration(courseId);
const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const rows = [['assignment','page_in_assignment','block','screen_in_block','screen','type','content_lines','words','assigned_minutes','assigned_time','title']];

for (const assignment of course.assignments) {
  const delivery = getCourseDelivery(courseId, assignment.id);
  let pageInAssignment = 0;
  for (const block of delivery.blocks) {
    let screenInBlock = 0;
    for (const screen of block.screens) {
      if (screen.type === 'completion') continue;
      pageInAssignment += 1;
      screenInBlock += 1;
      const metric = MORTGAGE_SCREEN_STUDY_METRICS[screen.id] || { lines: 0, words: 0 };
      const gate = screenStudyGate(delivery, assignment.expectedMinutes, screen.id, 0);
      const minutes = Math.floor(gate.allocatedSeconds / 60);
      const seconds = gate.allocatedSeconds % 60;
      rows.push([
        assignment.id, pageInAssignment, block.id, screenInBlock, screen.id, screen.type,
        metric.lines, metric.words, (gate.allocatedSeconds / 60).toFixed(2),
        `${minutes}:${String(seconds).padStart(2, '0')}`, screen.title,
      ]);
    }
  }
}

const target = path.join(root, 'california/ca-mortgage-loan-brokering-lending-45-v1/SCREEN_TIMING_AUDIT.csv');
fs.writeFileSync(target, rows.map((row) => row.map(quote).join(',')).join('\n') + '\n');
console.log(JSON.stringify({ target: path.relative(root, target), screens: rows.length - 1 }));
