'use strict';

/** Static site QA checker. Run after `npm run build`. */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
const stats = { pages: 0, localLinks: 0, localAssets: 0, fragments: 0 };
const documents = new Map();

function collectHtmlPages() {
  const pages = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (['tools', 'components', 'node_modules'].includes(entry.name)) continue;
        walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        pages.push(path.resolve(dir, entry.name));
      }
    }
  }
  walk(ROOT);
  return pages.sort();
}

function parseHref(raw, page) {
  try {
    const basePath = '/' + path.relative(ROOT, page).split(path.sep).join('/');
    const url = new URL(raw, `https://local.invalid${basePath}`);
    if (url.origin !== 'https://local.invalid') return null;
    let localPath = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (!localPath) localPath = 'index.html';
    let target = path.resolve(ROOT, localPath);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    return { target, fragment: decodeURIComponent(url.hash.slice(1)), hasPath: Boolean(url.pathname && url.pathname !== basePath) };
  } catch (error) {
    return { invalid: true, reason: error.message };
  }
}

function idExists($, id) {
  return $('[id]').toArray().some(node => $(node).attr('id') === id);
}

const pages = collectHtmlPages();
for (const page of pages) {
  const $ = cheerio.load(fs.readFileSync(page, 'utf8'), { decodeEntities: false });
  documents.set(page, $);
}
stats.pages = pages.length;

for (const page of pages) {
  const rel = path.relative(ROOT, page).split(path.sep).join('/');
  const $ = documents.get(page);
  const title = $('title').first().text().trim();
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!$('meta[name="description"]').attr('content')) warnings.push(`${rel}: missing meta description`);
  if ($('header.site-header').length !== 1) errors.push(`${rel}: expected exactly one shared header, found ${$('header.site-header').length}`);
  if ($('footer.site-footer').length !== 1) errors.push(`${rel}: expected exactly one shared footer, found ${$('footer.site-footer').length}`);
  if ($('main').length < 1) errors.push(`${rel}: missing main landmark`);
  if (!$('main h1').length) warnings.push(`${rel}: no H1 inside main`);

  const ids = new Set();
  $('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (ids.has(id)) errors.push(`${rel}: duplicate id="${id}"`);
    ids.add(id);
  });

  $('a[href], link[href], script[src], img[src], source[src]').each((_, element) => {
    const node = $(element);
    const isLink = ['a', 'link'].includes(element.name);
    const ref = node.attr(isLink ? 'href' : 'src');
    if (!ref || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref) || ref.startsWith('data:') || ref.startsWith('javascript:')) return;
    if (isLink && ref.startsWith('mailto:') || isLink && ref.startsWith('tel:')) return;

    const parsed = parseHref(ref, page);
    if (!parsed || parsed.invalid) {
      errors.push(`${rel}: invalid local reference ${ref}`);
      return;
    }
    if (element.name === 'a') stats.localLinks++;
    else stats.localAssets++;
    if (!fs.existsSync(parsed.target) || !fs.statSync(parsed.target).isFile()) {
      // Hash-only links still resolve to the current document.
      if (!ref.startsWith('#')) errors.push(`${rel}: missing local target ${ref} -> ${path.relative(ROOT, parsed.target)}`);
      return;
    }
    if (parsed.fragment) {
      stats.fragments++;
      const targetDoc = documents.get(path.resolve(parsed.target));
      if (targetDoc && !idExists(targetDoc, parsed.fragment)) errors.push(`${rel}: missing anchor ${ref} in ${path.relative(ROOT, parsed.target)}`);
    }
  });
}

const seenTitles = new Map();
for (const [page, $] of documents.entries()) {
  const title = $('title').first().text().trim().toLowerCase();
  if (!title) continue;
  if (seenTitles.has(title)) warnings.push(`Duplicate page title: ${path.relative(ROOT, seenTitles.get(title))} and ${path.relative(ROOT, page)}`);
  else seenTitles.set(title, page);
}

console.log(`Checked ${stats.pages} HTML pages.`);
console.log(`Local links checked: ${stats.localLinks}; local assets checked: ${stats.localAssets}; fragment links checked: ${stats.fragments}.`);
console.log(`Errors: ${errors.length}; warnings: ${warnings.length}.`);
for (const error of errors.slice(0, 100)) console.error(`ERROR: ${error}`);
for (const warning of warnings.slice(0, 50)) console.warn(`WARNING: ${warning}`);
if (errors.length > 100) console.error(`... ${errors.length - 100} additional errors omitted.`);
if (errors.length) process.exitCode = 1;
