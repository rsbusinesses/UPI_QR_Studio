'use strict';

/** Static site QA checker. Run after `npm run build`. */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
const stats = { pages: 0, localLinks: 0, localAssets: 0, fragments: 0, cssAssets: 0 };
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
    const relativeTarget = path.relative(ROOT, target);
    if (relativeTarget === '..' || relativeTarget.startsWith('..' + path.sep) || path.isAbsolute(relativeTarget)) {
      return { invalid: true, reason: 'local reference resolves outside the project root' };
    }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    return { target, fragment: decodeURIComponent(url.hash.slice(1)), hasPath: Boolean(url.pathname && url.pathname !== basePath) };
  } catch (error) {
    return { invalid: true, reason: error.message };
  }
}

function idExists($, id) {
  return $('[id]').toArray().some(node => $(node).attr('id') === id);
}

function parseSrcset(value) {
  const input = String(value || '');
  const urls = [];
  let position = 0;
  while (position < input.length) {
    while (position < input.length && /[\s,]/.test(input[position])) position++;
    if (position >= input.length) break;
    const start = position;
    while (position < input.length && !/\s/.test(input[position])) position++;
    let candidate = input.slice(start, position);
    let hadTrailingComma = false;
    while (candidate.endsWith(',')) {
      candidate = candidate.slice(0, -1);
      hadTrailingComma = true;
    }
    if (candidate) urls.push(candidate);
    if (hadTrailingComma) continue;
    while (position < input.length && input[position] !== ',') position++;
    if (input[position] === ',') position++;
  }
  return urls;
}

function isExternalReference(value) {
  const ref = String(value || '').trim();
  return !ref || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref);
}

function collectCssFiles() {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (['tools', 'components', 'node_modules'].includes(entry.name)) continue;
        walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.css')) {
        files.push(path.resolve(dir, entry.name));
      }
    }
  }
  walk(ROOT);
  return files.sort();
}

function accessibleNameExists($, element) {
  const node = $(element);
  if (String(node.attr('aria-label') || '').trim()) return true;
  const labelledBy = String(node.attr('aria-labelledby') || '').trim().split(/\s+/).filter(Boolean);
  if (labelledBy.length && labelledBy.every(id => idExists($, id))) return true;
  const id = node.attr('id');
  if (id && $('label[for]').toArray().some(label => $(label).attr('for') === id)) return true;
  if (node.closest('label').length) return true;
  return false;
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

  // Enforce accessible names for controls and descriptive text alternatives for media.
  $('img').each((_, element) => {
    if (!$(element).is('[alt]')) errors.push(rel + ': image is missing an alt attribute.');
  });
  $('iframe').each((_, element) => {
    if (!String($(element).attr('title') || '').trim()) errors.push(rel + ': iframe is missing a descriptive title.');
  });
  $('input, select, textarea').each((_, element) => {
    const type = String($(element).attr('type') || 'text').toLowerCase();
    if (element.name === 'input' && ['hidden', 'submit', 'reset', 'button', 'image'].includes(type)) return;
    if (!accessibleNameExists($, element)) {
      errors.push(rel + ': form control <' + element.name + '> does not have an associated label or accessible name.');
    }
  });
  $('button').each((_, element) => {
    const node = $(element);
    const hasText = Boolean(node.text().replace(/\s+/g, ' ').trim());
    const hasImageName = node.find('img[alt]').toArray().some(image => String($(image).attr('alt') || '').trim());
    if (!accessibleNameExists($, element) && !hasText && !hasImageName) {
      errors.push(rel + ': button does not have an accessible name.');
    }
  });

  // Detect duplicated page-level resources before they cause duplicate requests or behavior.
  for (const [selector, attribute, label] of [
    ['script[src]', 'src', 'script'],
    ['link[rel="stylesheet"][href]', 'href', 'stylesheet']
  ]) {
    const seen = new Set();
    $(selector).each((_, element) => {
      const value = String($(element).attr(attribute) || '').trim();
      if (value && seen.has(value)) errors.push(rel + ': duplicate ' + label + ' reference ' + value + '.');
      if (value) seen.add(value);
    });
  }

  function checkLocalReference(ref, kind) {
    if (isExternalReference(ref)) return;
    const parsed = parseHref(ref, page);
    if (!parsed || parsed.invalid) {
      errors.push(rel + ': invalid local ' + kind + ' reference ' + ref +
        (parsed && parsed.reason ? ' (' + parsed.reason + ')' : ''));
      return;
    }
    if (kind === 'link') stats.localLinks++;
    else stats.localAssets++;
    if (!fs.existsSync(parsed.target) || !fs.statSync(parsed.target).isFile()) {
      if (!String(ref).startsWith('#')) {
        errors.push(rel + ': missing local target ' + ref + ' -> ' + path.relative(ROOT, parsed.target));
      }
      return;
    }
    if (parsed.fragment) {
      stats.fragments++;
      const targetDoc = documents.get(path.resolve(parsed.target));
      if (targetDoc && !idExists(targetDoc, parsed.fragment)) {
        errors.push(rel + ': missing anchor ' + ref + ' in ' + path.relative(ROOT, parsed.target));
      }
    }
  }

  $('a[href], link[href], script[src], img[src], source[src], iframe[src], video[src], audio[src], track[src], embed[src], object[data]').each((_, element) => {
    const node = $(element);
    const isLink = ['a', 'link'].includes(element.name);
    const attribute = isLink ? 'href' : element.name === 'object' ? 'data' : 'src';
    const ref = node.attr(attribute);
    if (ref) checkLocalReference(ref, element.name === 'a' ? 'link' : 'asset');
  });

  $('img[srcset], source[srcset]').each((_, element) => {
    parseSrcset($(element).attr('srcset')).forEach(ref => checkLocalReference(ref, 'asset'));
  });
}

const cssFiles = collectCssFiles();
for (const file of cssFiles) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const css = fs.readFileSync(file, 'utf8');
  const pattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi;
  let match;
  while ((match = pattern.exec(css)) !== null) {
    const ref = String(match[1] || match[2] || match[3] || '').trim();
    if (isExternalReference(ref)) continue;
    const pathname = ref.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const target = pathname.startsWith('/')
      ? path.resolve(ROOT, '.' + pathname)
      : path.resolve(path.dirname(file), pathname);
    const relativeTarget = path.relative(ROOT, target);
    if (relativeTarget === '..' || relativeTarget.startsWith('..' + path.sep) || path.isAbsolute(relativeTarget)) {
      errors.push(rel + ': CSS asset reference escapes project root: ' + ref);
      continue;
    }
    stats.cssAssets++;
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      errors.push(rel + ': missing CSS asset ' + ref + ' -> ' + path.relative(ROOT, target));
    }
  }
}

const seenTitles = new Map();
for (const [page, $] of documents.entries()) {
  const title = $('title').first().text().trim().toLowerCase();
  if (!title) continue;
  if (seenTitles.has(title)) warnings.push(`Duplicate page title: ${path.relative(ROOT, seenTitles.get(title))} and ${path.relative(ROOT, page)}`);
  else seenTitles.set(title, page);
}

console.log(`Checked ${stats.pages} HTML pages.`);
console.log(`Local links checked: ${stats.localLinks}; local assets checked: ${stats.localAssets}; CSS assets checked: ${stats.cssAssets}; fragment links checked: ${stats.fragments}.`);
console.log(`Errors: ${errors.length}; warnings: ${warnings.length}.`);
for (const error of errors.slice(0, 100)) console.error(`ERROR: ${error}`);
for (const warning of warnings.slice(0, 50)) console.warn(`WARNING: ${warning}`);
if (errors.length > 100) console.error(`... ${errors.length - 100} additional errors omitted.`);
if (errors.length) process.exitCode = 1;
