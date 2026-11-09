'use strict';

/** Validate canonical SEO metadata, robots directives, sitemap and structured data. */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-config.json'), 'utf8'));
const SITE_URL = String(CONFIG.siteUrl || '').replace(/\/$/, '');
const { getAdSenseState, isAdSenseEligiblePage, adSenseLoaderUrl } = require('./adsense-config');
const ADSENSE_STATE = getAdSenseState(CONFIG);
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
        if (['tools', 'components', 'node_modules', 'dist'].includes(entry.name)) continue;
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

function schemaObjectsFor($, relpath) {
  const objects = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    STATS.jsonLdBlocks++;
    try {
      const parsed = JSON.parse($(element).text());
      const records = Array.isArray(parsed) ? parsed : [parsed];
      for (const record of records) {
        if (record && typeof record === 'object' && record['@type']) objects.push(record);
      }
    } catch (error) {
      fail(relpath + ': invalid JSON-LD: ' + error.message);
    }
  });
  return objects;
}

if (!String(CONFIG.siteName || '').trim()) fail('site-config.json: siteName must be a non-empty string.');
if (!String(CONFIG.contactEmail || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(CONFIG.contactEmail || '').trim())) {
  fail('site-config.json: contactEmail must be a valid email address.');
}
const configuredPublisherIdForValidation = String(CONFIG.adsenseClientId || '').trim();
if (configuredPublisherIdForValidation && !/^ca-pub-\d{16}$/.test(configuredPublisherIdForValidation)) {
  fail('site-config.json: adsenseClientId must be blank or a valid ca-pub- ID containing 16 digits.');
}
if (!SITE_URL) fail('site-config.json: siteUrl is empty.');
try {
  const parsedSiteUrl = new URL(SITE_URL);
  if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.pathname !== '/' || parsedSiteUrl.username || parsedSiteUrl.password || parsedSiteUrl.search || parsedSiteUrl.hash) {
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
  const htmlLanguage = String($('html').attr('lang') || '').trim().toLowerCase();
  if (htmlLanguage !== 'en') fail(relpath + ': expected html lang="en"; found "' + htmlLanguage + '".');
  const viewportTags = $('meta[name="viewport"]');
  if (viewportTags.length !== 1 || !String(viewportTags.first().attr('content') || '').trim()) {
    fail(relpath + ': expected exactly one non-empty viewport meta tag.');
  }
  const title = $('title').first().text().trim();
  const descriptions = $('meta[name="description"]');
  const description = String(descriptions.first().attr('content') || '').trim();
  const canonicals = $('link[rel="canonical"]');
  const robots = String($('meta[name="robots"]').first().attr('content') || '').toLowerCase();
  const h1Count = $('main h1').length;
  const guideSections = $('[data-guide-section]');

  if (guideSections.length) {
    const hiddenSections = guideSections.filter('[hidden]').length;
    const activeSections = guideSections.filter('.is-active').length;
    if (hiddenSections !== 0) {
      fail(relpath + ': guide sections must be visible in source HTML so navigation works without JavaScript; found ' + hiddenSections + ' hidden sections.');
    }
    if (activeSections !== 1) {
      fail(relpath + ': expected exactly one initially active guide section; found ' + activeSections + '.');
    }
  }

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
  const headingLevels = $('main h1, main h2, main h3, main h4, main h5, main h6').toArray()
    .map(element => Number(element.name.slice(1)));
  for (let index = 1; index < headingLevels.length; index++) {
    if (headingLevels[index] > headingLevels[index - 1] + 1) {
      fail(relpath + ': heading hierarchy skips from H' + headingLevels[index - 1] + ' to H' + headingLevels[index] + '.');
      break;
    }
  }
  $('img').each((_, image) => {
    if (!$(image).is('[alt]')) fail(relpath + ': image is missing an alt attribute.');
  });

  const requiredOgProperties = ['og:type', 'og:title', 'og:description', 'og:site_name'];
  if (!is404) requiredOgProperties.push('og:url');
  for (const property of requiredOgProperties) {
    const tags = $('meta[property="' + property + '"]');
    if (tags.length !== 1 || !String(tags.first().attr('content') || '').trim()) {
      fail(relpath + ': expected exactly one non-empty Open Graph property ' + property + '; found ' + tags.length + '.');
    }
  }
  for (const field of ['twitter:card', 'twitter:title', 'twitter:description']) {
    const tags = $('meta[name="' + field + '"]');
    if (tags.length !== 1 || !String(tags.first().attr('content') || '').trim()) {
      fail(relpath + ': expected exactly one non-empty ' + field + ' meta tag; found ' + tags.length + '.');
    }
  }
  if ($('meta[name="twitter:card"]').attr('content') !== 'summary') {
    fail(relpath + ': twitter:card must be "summary".');
  }
  if ($('meta[name="twitter:title"]').attr('content') !== $('meta[property="og:title"]').attr('content')) {
    fail(relpath + ': twitter:title must match og:title.');
  }
  if ($('meta[name="twitter:description"]').attr('content') !== $('meta[property="og:description"]').attr('content')) {
    fail(relpath + ': twitter:description must match og:description.');
  }

  const schemaObjects = schemaObjectsFor($, relpath);
  const schemaTypes = schemaObjects.map(schema => schema['@type']);
  const adScripts = $('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');

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
  const ogUrlTags = $('meta[property="og:url"]');
  if (ogUrlTags.length !== 1 || ogUrlTags.attr('content') !== expectedCanonical) {
    fail(relpath + ': exactly one og:url must match its canonical URL.');
  }

  const expectedAdLoader = ADSENSE_STATE.canLoadAds && isAdSenseEligiblePage(relpath, ADSENSE_STATE);
  if (expectedAdLoader) {
    if (adScripts.length !== 1) fail(relpath + ': expected the centrally authorized AdSense loader; found ' + adScripts.length + '.');
    else if (String(adScripts.attr('src') || '') !== adSenseLoaderUrl(ADSENSE_STATE.clientId)) {
      fail(relpath + ': AdSense loader URL does not match the configured publisher ID.');
    } else if (!adScripts.is('[async]') || String(adScripts.attr('crossorigin') || '').toLowerCase() !== 'anonymous') {
      fail(relpath + ': AdSense loader must use async and crossorigin="anonymous".');
    }
  } else if (adScripts.length !== 0) {
    fail(relpath + ': AdSense loader exists outside the approved page allowlist or before every activation gate is satisfied.');
  }

  if (relpath === 'index.html') {
    if (schemaTypes.length !== 1 || schemaTypes[0] !== 'WebSite') {
      fail('index.html: expected exactly one WebSite JSON-LD object.');
    } else {
      const website = schemaObjects[0];
      if (website.name !== CONFIG.siteName || website.url !== expectedCanonical || website.description !== description) {
        fail('index.html: WebSite JSON-LD name, URL and description must match site configuration and page metadata.');
      }
    }
  } else if (schemaTypes.length !== 1 || schemaTypes[0] !== 'BreadcrumbList') {
    fail(relpath + ': expected exactly one BreadcrumbList JSON-LD object.');
  } else {
    const breadcrumb = schemaObjects[0];
    const items = Array.isArray(breadcrumb.itemListElement) ? breadcrumb.itemListElement : [];
    if (items.length < 2 || items.some((item, index) => item.position !== index + 1 || !item.name || !item.item)) {
      fail(relpath + ': BreadcrumbList must contain ordered, named, absolute breadcrumb items.');
    } else {
      const lastItem = items[items.length - 1];
      if (lastItem.item !== expectedCanonical) fail(relpath + ': final BreadcrumbList item must match the page canonical.');
      for (const item of items) {
        try {
          const itemUrl = new URL(item.item);
          if (itemUrl.origin !== SITE_URL || itemUrl.protocol !== 'https:') {
            fail(relpath + ': BreadcrumbList URL is outside the configured production origin: ' + item.item);
          }
        } catch (error) {
          fail(relpath + ': BreadcrumbList contains an invalid absolute URL: ' + item.item);
        }
      }
    }
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
const sitemapDirectives = robotLines.filter(line => /^Sitemap:/i.test(line));
if (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== 'Sitemap: ' + SITE_URL + '/sitemap.xml') {
  fail('robots.txt: expected exactly one sitemap directive referencing ' + SITE_URL + '/sitemap.xml.');
}
if (/^Disallow:\s*\/\s*$/im.test(robotsText)) fail('robots.txt: site-wide Disallow: / would block crawling.');

const adsPath = path.join(ROOT, 'ads.txt');
if (ADSENSE_STATE.canWriteAdsTxt) {
  const expectedAdsTxt = ADSENSE_STATE.adsTxtRecord + '\n';
  if (!fs.existsSync(adsPath)) fail('ads.txt: verified account seller record is configured but the file is missing.');
  else if (fs.readFileSync(adsPath, 'utf8') !== expectedAdsTxt) fail('ads.txt: content does not match the exact verified account record in site-config.json.');
} else if (fs.existsSync(adsPath)) {
  fail('ads.txt: file exists without a verified publisher ID and account-provided seller record.');
}

console.log('SEO checked ' + STATS.pages + ' HTML pages (' + STATS.indexablePages + ' indexable).');
console.log('Canonical URLs: ' + STATS.canonicalUrls + '; sitemap URLs: ' + STATS.sitemapUrls + '; JSON-LD blocks: ' + STATS.jsonLdBlocks + '.');
console.log('Errors: ' + ERRORS.length + '; warnings: ' + WARNINGS.length + '.');
for (const error of ERRORS) console.error('ERROR: ' + error);
for (const warning of WARNINGS) console.warn('WARNING: ' + warning);
if (ERRORS.length) process.exitCode = 1;
