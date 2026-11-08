'use strict';

/** Validate canonical SEO metadata, robots directives, sitemap and structured data. */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-config.json'), 'utf8'));
const SITE_URL = String(CONFIG.siteUrl || '').replace(/\/$/, '');
const ERRORS = [];
const WARNINGS = [];
const STATS = { pages: 0, indexablePages: 0, canonicalUrls: 0, sitemapUrls: 0, jsonLdBlocks: 0 };

function fail(message) { ERRORS.push(message); }
function warn(message) { WARNINGS.push(message); }

function collectHtmlPages() {
  const result = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (['tools', 'components', 'node_modules'].includes(entry.name)) continue;
        walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        result.push(path.resolve(dir, entry.name));
      }
    }
  }
  walk(ROOT);
  return result.sort();
}

function relativePath(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function canonicalFor(relpath) {
  return relpath === 'index.html' ? SITE_URL + '/' : SITE_URL + '/' + relpath;
}

function schemaTypesFor($, relpath) {
  const types = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    STATS.jsonLdBlocks++;
    try {
      const parsed = JSON.parse($(element).text());
      const records = Array.isArray(parsed) ? parsed : [parsed];
      for (const record of records) {
        if (record && record['@type']) types.push(record['@type']);
      }
    } catch (error) {
      fail(relpath + ': invalid JSON-LD: ' + error.message);
    }
  });
  return types;
}

if (!SITE_URL) fail('site-config.json: siteUrl is empty.');
try {
  const parsedSiteUrl = new URL(SITE_URL);
  if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.pathname !== '/') {
    fail('site-config.json: siteUrl must be an HTTPS origin without a path; found ' + SITE_URL);
  }
} catch (error) {
  fail('site-config.json: siteUrl is not a valid absolute URL: ' + SITE_URL);
}

const pages = collectHtmlPages();
STATS.pages = pages.length;
const seenTitles = new Map();
const expectedCanonicalUrls = [];

for (const page of pages) {
  const relpath = relativePath(page);
  const $ = cheerio.load(fs.readFileSync(page, 'utf8'), { decodeEntities: false });
  const is404 = relpath === '404.html';
  const title = $('title').first().text().trim();
  const descriptions = $('meta[name="description"]');
  const description = String(descriptions.first().attr('content') || '').trim();
  const canonicals = $('link[rel="canonical"]');
  const robots = String($('meta[name="robots"]').first().attr('content') || '').toLowerCase();
  const h1Count = $('main h1').length;

  if (!title) fail(relpath + ': missing title.');
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle && seenTitles.has(normalizedTitle)) {
    fail(relpath + ': duplicate title also used by ' + seenTitles.get(normalizedTitle) + '.');
  } else if (normalizedTitle) {
    seenTitles.set(normalizedTitle, relpath);
  }

  if (descriptions.length !== 1 || !description) {
    fail(relpath + ': expected exactly one non-empty meta description; found ' + descriptions.length + '.');
  } else if (description.length < 60 || description.length > 170) {
    warn(relpath + ': meta description is ' + description.length + ' characters; review the 60–170 character editorial range.');
  }

  if (h1Count !== 1) fail(relpath + ': expected one H1 in main; found ' + h1Count + '.');
  for (const property of ['og:type', 'og:title', 'og:description', 'og:site_name']) {
    if (!$('meta[property="' + property + '"]').attr('content')) {
      fail(relpath + ': missing Open Graph property ' + property + '.');
    }
  }

  const schemaTypes = schemaTypesFor($, relpath);
  const adScripts = $('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  const publisherId = String(CONFIG.adsenseClientId || '').trim();
  const validPublisherId = /^ca-pub-\d{16}$/.test(publisherId);

  if (is404) {
    if (canonicals.length !== 0) fail('404.html: must not have a canonical URL.');
    if (!robots.includes('noindex')) fail('404.html: expected robots noindex directive.');
    if (adScripts.length !== 0) fail('404.html: must not load the AdSense script.');
    if (schemaTypes.length !== 0) fail('404.html: must not contain structured data.');
    continue;
  }

  STATS.indexablePages++;
  const expectedCanonical = canonicalFor(relpath);
  expectedCanonicalUrls.push(expectedCanonical);
  if (canonicals.length !== 1) {
    fail(relpath + ': expected exactly one canonical link; found ' + canonicals.length + '.');
  } else {
    const actualCanonical = String(canonicals.attr('href') || '');
    if (actualCanonical !== expectedCanonical) {
      fail(relpath + ': canonical mismatch. Expected ' + expectedCanonical + ', found ' + actualCanonical + '.');
    }
    STATS.canonicalUrls++;
  }

  if (robots.includes('noindex')) fail(relpath + ': an indexable page contains a noindex directive.');
  if ($('meta[property="og:url"]').attr('content') !== expectedCanonical) {
    fail(relpath + ': og:url must match its canonical URL.');
  }

  if (validPublisherId) {
    if (adScripts.length !== 1) fail(relpath + ': expected one centralized AdSense loader; found ' + adScripts.length + '.');
    else if (!String(adScripts.attr('src') || '').includes('client=' + publisherId)) {
      fail(relpath + ': AdSense loader client does not match site-config.json.');
    }
  } else if (adScripts.length !== 0) {
    fail(relpath + ': AdSense loader exists although no valid publisher ID is configured.');
  }

  if (relpath === 'index.html') {
    if (schemaTypes.filter(type => type === 'WebSite').length !== 1) {
      fail('index.html: expected one WebSite JSON-LD object.');
    }
    if (schemaTypes.includes('BreadcrumbList')) fail('index.html: homepage should not contain BreadcrumbList JSON-LD.');
  } else if (schemaTypes.filter(type => type === 'BreadcrumbList').length !== 1) {
    fail(relpath + ': expected one BreadcrumbList JSON-LD object.');
  }
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
const sitemapText = fs.readFileSync(sitemapPath, 'utf8');
const sitemap = cheerio.load(sitemapText, { xmlMode: true });
const sitemapLocs = sitemap('urlset > url > loc').map((_, element) => sitemap(element).text().trim()).get();
STATS.sitemapUrls = sitemapLocs.length;

if (!sitemap('urlset').length) fail('sitemap.xml: missing urlset root element.');
if (new Set(sitemapLocs).size !== sitemapLocs.length) fail('sitemap.xml: duplicate loc entries found.');
const expectedSet = new Set(expectedCanonicalUrls);
const actualSet = new Set(sitemapLocs);
for (const url of expectedSet) {
  if (!actualSet.has(url)) fail('sitemap.xml: missing canonical URL ' + url + '.');
}
for (const url of actualSet) {
  if (!expectedSet.has(url)) fail('sitemap.xml: contains a non-canonical or non-public URL ' + url + '.');
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.origin !== SITE_URL) {
      fail('sitemap.xml: URL is not on the canonical HTTPS origin: ' + url + '.');
    }
  } catch (error) {
    fail('sitemap.xml: invalid absolute URL ' + url + '.');
  }
}

const robotsText = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
const robotLines = robotsText.split(/\r?\n/).map(line => line.trim());
if (!robotLines.includes('User-agent: *')) fail('robots.txt: missing User-agent: *.');
if (!robotLines.includes('Allow: /')) fail('robots.txt: missing Allow: /.');
if (!robotLines.includes('Sitemap: ' + SITE_URL + '/sitemap.xml')) {
  fail('robots.txt: sitemap directive must reference ' + SITE_URL + '/sitemap.xml.');
}
if (/^Disallow:\s*\/\s*$/im.test(robotsText)) fail('robots.txt: site-wide Disallow: / would block crawling.');

const adsPath = path.join(ROOT, 'ads.txt');
const configuredPublisherId = String(CONFIG.adsenseClientId || '').trim();
if (/^ca-pub-\d{16}$/.test(configuredPublisherId)) {
  const expectedAdsTxt = 'google.com, ' + configuredPublisherId.replace(/^ca-/, '') + ', DIRECT, f08c47fec0942fa0\n';
  if (!fs.existsSync(adsPath)) fail('ads.txt: valid publisher ID is configured but ads.txt is missing.');
  else if (fs.readFileSync(adsPath, 'utf8') !== expectedAdsTxt) fail('ads.txt: content does not match site-config.json.');
} else if (fs.existsSync(adsPath)) {
  fail('ads.txt: file exists even though no valid publisher ID is configured.');
}

console.log('SEO checked ' + STATS.pages + ' HTML pages (' + STATS.indexablePages + ' indexable).');
console.log('Canonical URLs: ' + STATS.canonicalUrls + '; sitemap URLs: ' + STATS.sitemapUrls + '; JSON-LD blocks: ' + STATS.jsonLdBlocks + '.');
console.log('Errors: ' + ERRORS.length + '; warnings: ' + WARNINGS.length + '.');
for (const error of ERRORS) console.error('ERROR: ' + error);
for (const warning of WARNINGS) console.warn('WARNING: ' + warning);
if (ERRORS.length) process.exitCode = 1;
