'use strict';

/**
 * Repair stale same-site anchor fragments and de-duplicate long boilerplate
 * paragraphs in detailed guide articles. This runs at build time; visitors do
 * not execute it in their browsers.
 */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const STOP_WORDS = new Set([
  'how', 'what', 'when', 'where', 'why', 'who', 'is', 'are', 'was', 'were',
  'do', 'does', 'did', 'you', 'your', 'the', 'a', 'an', 'to', 'of', 'for',
  'in', 'on', 'at', 'with', 'if', 'can', 'could', 'should', 'would', 'and',
  'or', 'it', 'someone'
]);

function normalizeWords(value) {
  return new Set((String(value || '').toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(word => !STOP_WORDS.has(word)));
}

function hasId($, id) {
  return $('[id]').toArray().some(node => $(node).attr('id') === id);
}

function localPathFromHref(href) {
  const raw = String(href || '').trim();
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return null;
  const hashIndex = raw.indexOf('#');
  const beforeHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  const queryIndex = beforeHash.indexOf('?');
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const fragment = hashIndex >= 0 ? raw.slice(hashIndex + 1).split('?')[0] : '';
  return { pathname, fragment };
}

function findPreviousHeading($, element, fallbackText) {
  const headings = $('main h1, main h2, main h3, main h4, main h5, main h6, main summary').toArray();
  let previous = null;
  for (const heading of headings) {
    if (heading === element) break;
    if (isBeforeInDocument(heading, element)) previous = heading;
  }
  return previous ? $(previous).text().replace(/\s+/g, ' ').trim() : fallbackText;
}

function isBeforeInDocument(a, b) {
  // Both nodes belong to the same parsed document. Compare their positions in
  // a preorder walk so this works even when heading and paragraph are nested.
  const root = (a && a.parent) ? findRoot(a) : null;
  if (!root) return false;
  let seenA = false;
  let answer = false;
  (function walk(node) {
    if (!node || answer) return;
    if (node === a) seenA = true;
    if (node === b) { answer = seenA; return; }
    for (const child of node.children || []) walk(child);
  })(root);
  return answer;
}

function findRoot(node) {
  let current = node;
  while (current && current.parent) current = current.parent;
  return current;
}

function fixFragmentTargets(pages, root) {
  const parsed = new Map();
  for (const file of pages) {
    const absolute = path.resolve(file);
    parsed.set(absolute, cheerio.load(fs.readFileSync(absolute, 'utf8'), { decodeEntities: false }));
  }

  const changed = new Set();
  const unresolved = [];
  for (const [sourcePath, $source] of parsed.entries()) {
    $source('a[href]').each((_, anchor) => {
      const href = $source(anchor).attr('href');
      const parts = localPathFromHref(href);
      if (!parts || !parts.fragment) return;

      let targetPath = sourcePath;
      if (parts.pathname) targetPath = path.resolve(path.dirname(sourcePath), decodeURIComponent(parts.pathname));
      targetPath = path.resolve(targetPath);
      const $target = parsed.get(targetPath);
      if (!$target || hasId($target, decodeURIComponent(parts.fragment))) return;

      const fragment = decodeURIComponent(parts.fragment);
      if (fragment === 'main-content') {
        const main = $target('main').first();
        if (main.length) {
          main.prepend('<span id="main-content" class="main-content-anchor" tabindex="-1" aria-hidden="true"></span>');
          changed.add(targetPath);
          return;
        }
      }

      const label = $source(anchor).text().replace(/\s+/g, ' ').trim();
      const wanted = normalizeWords(label);
      if (!wanted.size) return;

      const candidates = [];
      $target('h1, h2, h3, h4, h5, h6, summary').each((__, heading) => {
        const words = normalizeWords($target(heading).text());
        if (!words.size) return;
        let overlap = 0;
        for (const word of wanted) if (words.has(word)) overlap++;
        const union = new Set([...wanted, ...words]).size;
        const score = overlap / Math.max(1, union);
        const containment = overlap / Math.max(1, Math.min(wanted.size, words.size));
        candidates.push({ score: Math.max(score, containment * 0.78), heading });
      });
      candidates.sort((a, b) => b.score - a.score);
      if (candidates.length && candidates[0].score >= 0.58) {
        const heading = $target(candidates[0].heading);
        if (!heading.attr('id')) heading.attr('id', fragment);
        else $target(heading).before(`<span id="${escapeAttribute(fragment)}" class="fragment-anchor" aria-hidden="true"></span>`);
        changed.add(targetPath);
      } else {
        unresolved.push({ source: path.relative(root, sourcePath).split(path.sep).join('/'), href, label });
      }
    });
  }

  for (const file of changed) fs.writeFileSync(file, parsed.get(file).html(), 'utf8');

  // Retain the original tool's cross-article repeat reduction while skipping
  // notes explicitly marked as shared editorial panels.
  const seenParagraphs = new Map();
  let repeatedRewrites = 0;
  const guidePaths = pages.map(p => path.resolve(p)).filter(file => {
    const rel = path.relative(root, file).split(path.sep);
    return rel.length >= 3 && rel[0] === 'pages' && rel[1] === 'upi-guides';
  }).sort();

  for (const file of guidePaths) {
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
    const main = $('main').first();
    if (!main.length) continue;
    const headingText = main.find('h1').first().text().trim() || path.basename(file, '.html').replace(/-/g, ' ');
    const localOccurrences = new Map();
    main.find('p').each((_, paragraph) => {
      const p = $(paragraph);
      if (p.closest('[data-guide-editorial-note]').length) return;
      const original = p.text().replace(/\s+/g, ' ').trim();
      if (original.length < 100) return;
      const key = original.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      localOccurrences.set(key, (localOccurrences.get(key) || 0) + 1);
      const occurrence = localOccurrences.get(key);
      if (!seenParagraphs.has(key)) {
        seenParagraphs.set(key, { file, occurrence });
        return;
      }
      const topic = findPreviousHeading($, paragraph, headingText);
      let variant = `For “${topic}”, verify the current result in your official payment app or bank records before taking another step. Keep the transaction reference if you need help from support.`;
      if (occurrence > 1) variant += ' If the status remains unclear, follow the in-app complaint instructions rather than repeating the payment.';
      p.text(variant);
      repeatedRewrites++;
    });
    fs.writeFileSync(file, $.html(), 'utf8');
  }

  console.log(`Rewrote ${repeatedRewrites} repeated long paragraphs across detailed guide articles.`);
  if (unresolved.length) {
    console.warn(`Notice: ${unresolved.length} fragment links need manual review:`);
    unresolved.slice(0, 30).forEach(item => console.warn(' ', item));
  } else {
    console.log('All internal fragment links resolved or safely aliased.');
  }
  return { unresolved, repeatedRewrites };
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

module.exports = { fixFragmentTargets };

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const pages = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (['tools', 'components', 'node_modules'].includes(entry.name)) continue;
        walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(path.join(dir, entry.name));
    }
  })(root);
  fixFragmentTargets(pages.sort(), root);
}
