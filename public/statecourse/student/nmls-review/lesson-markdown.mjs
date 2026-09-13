// Small, escaped Markdown subset used by the private manuscript. Preserve words,
// case and quotations; no raw HTML, automatic callout labels or executable links.
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function inline(text) {
  const tokens = [];
  const token = (html) => `\u0001${tokens.push(html) - 1}\u0001`;
  let escaped = escapeHtml(String(text).replace(/[\u0000-\u0008]/g, ''));
  escaped = escaped.replace(/`([^`]+)`/g, (_, value) => token(`<code>${value}</code>`));
  escaped = escaped.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,
    (_, label, url) => token(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`));
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return escaped.replace(/\u0001(\d+)\u0001/g, (_, id) => tokens[Number(id)]);
}
export function renderLessonMarkdown(source) {
  const lines = String(source || '').replace(/\r/g, '').split('\n');
  const out = []; let i = 0;
  const tableRow = (line) => line.trim().slice(1, -1).split('|').map((v) => v.trim());
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { const level = Math.max(2, heading[1].length); out.push(`<h${level}>${inline(heading[2])}</h${level}>`); i++; continue; }
    if (/^---+$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (line.startsWith('|') && line.endsWith('|')) {
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i].trim())) rows.push(tableRow(lines[i++]));
      const content = rows.filter((row) => !row.every((cell) => /^:?-+:?$/.test(cell)));
      if (!content.length) continue;
      out.push('<div class="table-wrap" tabindex="0" role="region" aria-label="Lesson table"><table><thead><tr>' +
        content[0].map((cell) => `<th scope="col">${inline(cell)}</th>`).join('') + '</tr></thead><tbody>' +
        content.slice(1).map((row) => '<tr>' + row.map((cell) => `<td>${inline(cell)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^>/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^>/.test(lines[i].trim())) quoted.push(lines[i++].trim().replace(/^>\s?/, ''));
      out.push('<blockquote>' + renderLessonMarkdown(quoted.join('\n')) + '</blockquote>'); continue;
    }
    const list = line.match(/^([-*]|\d+[.)])\s+/);
    if (list) {
      const ordered = /^\d/.test(list[1]); const tag = ordered ? 'ol' : 'ul'; const items = [];
      const pattern = ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/;
      while (i < lines.length && pattern.test(lines[i].trim())) items.push(lines[i++].trim().replace(pattern, ''));
      out.push(`<${tag}>` + items.map((item) => `<li>${inline(item)}</li>`).join('') + `</${tag}>`); continue;
    }
    const paragraph = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*]\s|\d+[.)]\s|>|\||---+$)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    out.push('<p>' + paragraph.map((part) => inline(part.replace(/\\$/, '')) + (part.endsWith('\\') ? '<br>' : ' ')).join('').trim() + '</p>');
  }
  return out.join('\n');
}
