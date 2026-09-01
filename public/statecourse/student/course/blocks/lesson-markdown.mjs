/* CA-BLOCK-1 — lesson markdown renderer for the block player.
   Adapted from the legacy course page renderer so the frozen lesson text renders with identical
   semantics (inline markup, tables, quotes, metadata rows), plus the callout layer: the quote
   forms the source already uses render as academic callout panels. PRESENTATION ONLY — the words
   come from the frozen lesson file, are never rewritten here, and no callout adds or removes a
   sentence. */

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

function sentenceCase(text) {
  return String(text ?? "").replace(/[A-Za-z]/, (letter) => letter.toUpperCase());
}

function titleCaseHeading(text) {
  const minor = new Set(["a","an","and","as","at","but","by","for","from","in","into","nor","of","on","or","over","per","the","to","via","with"]);
  const known = new Map([["dre","DRE"],["mlo","MLO"],["nmls","NMLS"],["dfpi","DFPI"],["fha","FHA"],["va","VA"],["apr","APR"],["tila","TILA"],["respa","RESPA"],["cfpb","CFPB"]]);
  const source = String(text ?? ""), words = source.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
  let index = 0;
  return source.replace(/[A-Za-z][A-Za-z'’-]*/g, (word) => {
    const lower = word.toLowerCase(), position = index++;
    if (known.has(lower)) return known.get(lower);
    if (/^[A-Z0-9]{2,}$/.test(word)) return word;
    if (position > 0 && position < words.length - 1 && minor.has(lower)) return lower;
    return lower.replace(/(^|-)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
  });
}

function inline(text) {
  const code = [];
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, body) => { code.push(body); return "\u0001" + (code.length - 1) + "\u0001"; })
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\u0001(\d+)\u0001/g, (_, index) => "<code>" + code[Number(index)] + "</code>");
}

/* Callout classification for blockquotes: driven by the quote's own opening words so the frozen
   text supplies its own label. Anything else renders as a REMEMBER panel — the quote form in
   these lessons is always an emphasis of something already taught. */
function calloutClass(text) {
  const start = text.trim().toLowerCase();
  if (start.startsWith("**solution")) return { className: "callout-example", label: "Worked solution" };
  if (start.includes("common") && start.includes("mistake")) return { className: "callout-mistake", label: "Common mistake" };
  if (start.startsWith("**a ") || start.startsWith("**the test")) return { className: "callout-key", label: "Key point" };
  return { className: "callout-remember", label: "Remember" };
}

export function renderLessonMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n"), output = [];
  let paragraph = [], list = [], ordered = [], quote = [], table = [];
  const flushParagraph = () => { if (paragraph.length) { output.push("<p>" + inline(sentenceCase(paragraph.join(" "))) + "</p>"); paragraph = []; } };
  const flushList = () => { if (list.length) { output.push("<ul>" + list.map((item) => "<li>" + inline(sentenceCase(item)) + "</li>").join("") + "</ul>"); list = []; } };
  const flushOrdered = () => { if (ordered.length) { output.push("<ol>" + ordered.map((item) => "<li>" + inline(sentenceCase(item)) + "</li>").join("") + "</ol>"); ordered = []; } };
  const flushQuote = () => {
    if (!quote.length) return;
    const body = quote.join("\n");
    const kind = calloutClass(body);
    const paragraphs = body.split(/\n{2,}/).map((part) => "<p>" + inline(sentenceCase(part.replace(/\n/g, " "))) + "</p>").join("");
    output.push(`<aside class="callout ${kind.className}"><span class="callout-label">${kind.label}</span>${paragraphs}</aside>`);
    quote = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((row) => !row.every((cell) => /^:?-+:?$/.test(cell)));
    if (rows.length) output.push('<div class="table-wrap"><table><thead><tr>' + rows[0].map((cell) => "<th>" + inline(titleCaseHeading(cell)) + "</th>").join("") + "</tr></thead><tbody>" + rows.slice(1).map((row) => "<tr>" + row.map((cell) => "<td>" + inline(sentenceCase(cell)) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>");
    table = [];
  };
  const flushText = () => { flushParagraph(); flushList(); flushOrdered(); };
  const flush = () => { flushText(); flushQuote(); flushTable(); };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("|") && line.endsWith("|")) { flushText(); flushQuote(); table.push(line.slice(1, -1).split("|").map((cell) => cell.trim())); continue; }
    if (table.length) flushTable();
    if (!line) { flushText(); if (quote.length) quote.push(""); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { flush(); output.push("<hr>"); continue; }
    const quoted = line.match(/^>\s?(.*)$/);
    if (quoted) { flushParagraph(); flushList(); flushOrdered(); quote.push(quoted[1]); continue; }
    if (quote.length) flushQuote();
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      if (level === 1) continue;
      output.push(`<h${level}>${inline(titleCaseHeading(heading[2]))}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) { flushParagraph(); flushOrdered(); list.push(line.replace(/^[-*]\s+/, "")); continue; }
    if (/^\d+[.)]\s+/.test(line)) { flushParagraph(); flushList(); ordered.push(line.replace(/^\d+[.)]\s+/, "")); continue; }
    flushList(); flushOrdered();
    paragraph.push(line);
  }
  flush();
  return output.join("");
}

/* A practice screen renders its scenario openly and its printed solution behind the commitment
   gate: everything from the first Worked-solution callout onward stays hidden until the student
   has committed an analysis. Split at the rendered HTML level so the frozen text is untouched. */
export function splitPracticeHtml(html) {
  const marker = html.indexOf('<aside class="callout callout-example"');
  if (marker < 0) return { scenario: html, solution: "" };
  return { scenario: html.slice(0, marker), solution: html.slice(marker) };
}
