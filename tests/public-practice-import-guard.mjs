/** Native Node import guard used only by the independent regression child process.
 * No writes and no protected module contents are loaded by this guard. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
let root;
export function initialize(data) { root = path.resolve(data.root); }
export async function resolve(specifier, context, nextResolve) {
  const resolved = await nextResolve(specifier, context);
  if (resolved.url.startsWith('file:')) {
    const file = fileURLToPath(resolved.url);
    const relative = path.relative(root, file).split(path.sep).join('/');
    if (!relative.startsWith('../') && /(?:final[-_]exam|exam[-_]bank|protected[\\/_-]|complete-course-(?:reviewer-engine|exam-delivery)|load-texas-reviewer-course)/i.test(relative)) {
      throw new Error('PUBLIC_IMPORT_PROTECTED_BOUNDARY: ' + relative);
    }
  }
  return resolved;
}
