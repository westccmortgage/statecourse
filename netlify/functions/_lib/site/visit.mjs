import { createHmac } from 'node:crypto';

// Turns one raw page request into the small, non-identifying record that is stored.
// Pure functions: no network, no database, no clock except the one passed in.

const clip = (value, max) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : '';
const label = (value, max = 80) => { const text = clip(value, max); return /^[\w .:+\-/]+$/.test(text) ? text : null; };

// Safe operational diagnostics, never request data, addresses or credential values.
export function siteFailure(error) {
  const message = String(error?.message || '');
  if (message === 'database_not_configured') return 'database_not_configured';
  if (/permission denied|insufficient privilege/i.test(message)) return 'database_permission_denied';
  if (/could not find (?:the )?(?:table|function)|relation .+ does not exist|function .+ does not exist/i.test(message)) return 'database_schema_missing';
  return 'database_unavailable';
}

export function siteConfiguration(env = {}) {
  let databaseProject = null;
  try {
    const host = new URL(String(env.SUPABASE_URL || '').trim()).hostname;
    if (/^[a-z0-9]{20}\.supabase\.co$/.test(host)) databaseProject = host.split('.')[0];
  } catch { /* only a public project identifier may be logged */ }
  const recipient = String(env.SITE_REPORT_TO || '').trim() || 'data@statecourse.com';
  return { databaseProject, databaseUrlSet: Boolean(String(env.SUPABASE_URL || '').trim()),
    databaseKeySet: Boolean(String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim()),
    mailKeySet: Boolean(String(env.RESEND_API_KEY || '').trim()),
    reportRecipient: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) ? recipient : null };
}

// Clients that name themselves as automated. Order matters: the first match names the bot.
const NAMED_BOTS = [
  ['Googlebot', /googlebot|google-inspectiontool|googleother|adsbot-google|mediapartners-google|google-extended|storebot-google/i],
  ['Bingbot', /bingbot|bingpreview|msnbot|adidxbot/i], ['GPTBot', /gptbot|oai-searchbot|chatgpt-user/i],
  ['ClaudeBot', /claudebot|claude-web|claude-user|claude-searchbot|anthropic-ai/i], ['PerplexityBot', /perplexitybot|perplexity-user/i],
  ['Applebot', /applebot/i], ['DuckDuckBot', /duckduckbot|duckassistbot/i], ['YandexBot', /yandex(bot|images|mobilebot)/i],
  ['Baiduspider', /baiduspider/i], ['Bytespider', /bytespider/i], ['Amazonbot', /amazonbot/i], ['Meta', /facebookexternalhit|meta-externalagent|facebot/i],
  ['CCBot', /ccbot/i], ['AhrefsBot', /ahrefsbot/i], ['SemrushBot', /semrushbot/i], ['MJ12bot', /mj12bot/i], ['DotBot', /dotbot/i],
  ['PetalBot', /petalbot/i], ['DataForSeoBot', /dataforseo/i], ['Twitterbot', /twitterbot/i], ['LinkedInBot', /linkedinbot/i],
  ['Slackbot', /slackbot|slack-imgproxy/i], ['Discordbot', /discordbot/i], ['TelegramBot', /telegrambot/i], ['WhatsApp', /whatsapp/i],
  ['Pinterestbot', /pinterest(bot)?\//i], ['Archive.org', /ia_archiver|archive\.org_bot/i], ['UptimeRobot', /uptimerobot/i],
  ['Pingdom', /pingdom/i], ['Lighthouse', /chrome-lighthouse|pagespeed/i],
];
const GENERIC_BOT = /bot\b|bot[/;) ]|crawl|spider|slurp|scrape|fetch|monitor|headless|phantomjs|puppeteer|playwright|selenium|curl\/|wget\/|python-requests|python-urllib|aiohttp|httpx|go-http-client|java\/|okhttp|axios\/|node-fetch|undici|libwww|scrapy|httpclient|feedfetcher|preview/i;

// person, self-declared bot, or something that does not behave like a browser.
export function classifyVisitor(userAgent, { scriptRan, webdriver }) {
  const ua = clip(userAgent, 600);
  for (const [name, pattern] of NAMED_BOTS) if (pattern.test(ua)) return { visitorClass: 'bot', botName: name };
  if (GENERIC_BOT.test(ua)) return { visitorClass: 'bot', botName: (ua.match(/([A-Za-z][\w.-]{2,40}(?:bot|crawler|spider))/i)?.[1] || ua.split(/[/ ;(]/)[0] || 'unnamed').slice(0, 60) };
  // No real browser omits its user agent, drives itself, or refuses to run a page's script.
  if (!ua || ua.length < 25 || !/mozilla\/5\.0/i.test(ua) || webdriver === true || scriptRan !== true) return { visitorClass: 'suspect', botName: null };
  return { visitorClass: 'human', botName: null };
}

export function deviceOf(userAgent) {
  const ua = clip(userAgent, 600);
  if (/ipad|tablet|kindle|silk|playbook|android(?!.*mobile)/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return /windows nt|macintosh|x11|linux|cros/i.test(ua) ? 'desktop' : 'other';
}
export function browserOf(userAgent) {
  const ua = clip(userAgent, 600);
  for (const [name, pattern] of [['Edge', /edg(e|a|ios)?\//i], ['Opera', /opr\/|opera/i], ['Samsung Internet', /samsungbrowser/i], ['Firefox', /firefox\/|fxios/i],
    ['Chrome', /chrome\/|crios/i], ['Safari', /safari\//i]]) if (pattern.test(ua)) return name;
  return null;
}

const SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|yahoo\.com|yandex\.[a-z]+|baidu\.com|ecosia\.org|brave\.com|startpage\.com|kagi\.com)$/;
const SOCIAL = /(^|\.)(facebook\.com|fb\.com|instagram\.com|t\.co|x\.com|twitter\.com|linkedin\.com|lnkd\.in|youtube\.com|youtu\.be|tiktok\.com|reddit\.com|pinterest\.com|threads\.net|nextdoor\.com|t\.me|telegram\.org|whatsapp\.com)$/;
const AI = /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com|phind\.com|meta\.ai)$/;

// Where the visit came from. Only the referring site's host name is kept, never its path.
export function sourceOf({ referrer, utmSource, siteHost }) {
  const campaign = label(utmSource);
  let host = null;
  try { const url = new URL(clip(referrer, 2000)); if (/^https?:$/.test(url.protocol)) host = url.hostname.toLowerCase().replace(/^www\./, '').slice(0, 120); } catch { /* no usable referrer */ }
  if (campaign) return { sourceKind: 'campaign', sourceName: campaign.toLowerCase() };
  if (!host) return { sourceKind: 'direct', sourceName: null };
  if (host === siteHost || host.endsWith(`.${siteHost}`)) return { sourceKind: 'internal', sourceName: null };
  // AI assistants are tested before search so that gemini.google.com is not counted as Google search.
  return { sourceKind: AI.test(host) ? 'ai' : SEARCH.test(host) ? 'search' : SOCIAL.test(host) ? 'social' : 'referral', sourceName: host };
}

// The page path only: no query string, no fragment, nothing under the private areas.
export function publicPath(value) {
  const raw = clip(value, 400).split(/[?#]/)[0];
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || raw.includes('..')) return null;
  if (/^\/(api|admin|staff|\.netlify)(\/|$)/i.test(raw)) return null;
  const path = raw.replace(/\/index\.html$/i, '/').slice(0, 200);
  return /^[\w\-./~%]+$/.test(path) ? path : null;
}

// A one-way mark that is the same for one browser during one day and different the next
// day, so unique visitors can be counted without storing an address or following anyone.
export function dayHash({ ip, userAgent, day, secret }) {
  return createHmac('sha256', String(secret)).update(`site-visit:v1:${day}:${ip || ''}:${clip(userAgent, 600)}`).digest('hex').slice(0, 16);
}

const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

// input: what the page sent. request: what the server itself observed.
export function buildVisit(input, { userAgent, ip, geo, siteHost, secret, scriptRan, globalPrivacyControl = false, now = new Date() }) {
  const path = publicPath(input?.p);
  if (!path) return null;
  // A browser that signals Global Privacy Control is treated as having declined.
  const consent = globalPrivacyControl ? 'declined' : ['accepted', 'declined'].includes(input?.c) ? input.c : 'unset';
  const { visitorClass, botName } = classifyVisitor(userAgent, { scriptRan, webdriver: input?.w === 1 || input?.w === true });
  const { sourceKind, sourceName } = sourceOf({ referrer: input?.r, utmSource: input?.us, siteHost });
  return {
    kind: input?.k === 'consent' && consent === 'accepted' ? 'consent' : 'view', path, source_kind: sourceKind, source_name: sourceName,
    utm_source: label(input?.us), utm_medium: label(input?.um), utm_campaign: label(input?.uc),
    country: /^[A-Z]{2}$/.test(geo?.country?.code || '') ? geo.country.code : null, region: clip(geo?.subdivision?.name, 80) || null, city: clip(geo?.city, 80) || null,
    device: deviceOf(userAgent), browser: browserOf(userAgent), visitor_class: visitorClass, bot_name: botName, script_ran: scriptRan === true,
    day_hash: dayHash({ ip, userAgent, day: now.toISOString().slice(0, 10), secret }), consent,
    // Remembered only with consent, and only for something that looks like a person.
    visitor_id: consent === 'accepted' && visitorClass === 'human' && uuid(input?.v) ? input.v.toLowerCase() : null,
  };
}
