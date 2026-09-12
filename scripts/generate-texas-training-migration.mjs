import fs from 'node:fs/promises';
import {LAW_OF_AGENCY_TRAINING_RUNTIME as definition} from '../config/texas/law-of-agency-training-runtime.mjs';
const template=await fs.readFile(new URL('../database/templates/024_texas_training_runtime.sql',import.meta.url),'utf8');
const literal="'"+JSON.stringify(definition).replaceAll("'","''")+"'::jsonb";
await fs.writeFile(new URL('../database/024_texas_training_runtime.sql',import.meta.url),template.replace('__RUNTIME_DEFINITION__',literal));
console.log('Generated 024 from 12 existing modules and their completion requirements.');
