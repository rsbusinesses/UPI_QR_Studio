'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');

function collectHtmlPages() {
  const pages = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['tools', 'components', 'node_modules', 'dist'].includes(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) pages.push(absolute);
    }
  }
  walk(ROOT);
  return pages.sort();
}

function main() {
  const pages = collectHtmlPages();
  const indexable = [];
  const issues = [];
  const brokenCopy = /\b(?:for|after|before using)\s+(?:what is|how to)\s+(?:upi|hello!?\s*upi|send money|keep your upi)\b/i;

  for (const file of pages) {
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const robots = String($('meta[name="robots"]').attr('content') || '').toLowerCase();
    if (!robots.includes('noindex')) indexable.push(rel);

    const text = $('main').text().replace(/\s+/g, ' ').trim();
    if (brokenCopy.test(text)) issues.push(rel + ': contains templated keyword-led guide copy');
  }

  const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const widget = fs.readFileSync(path.join(ROOT, 'pages', 'qr-widget.html'), 'utf8');
  if (!/id="upi-qr-guidance"/i.test(homepage)) issues.push('Missing homepage QR instructions');
  if (!homepage.includes('<strong>Required:</strong>') || !homepage.includes('<strong>Optional:</strong>')) {
    issues.push('Missing homepage required/optional field guidance');
  }
  if (!/id="qr-widget-limitations"/i.test(widget)) issues.push('Missing standalone QR scope explanation');
  if (!/allowed characters/i.test(widget) || !/does not check whether the UPI ID exists/i.test(widget)) {
    issues.push('Missing standalone QR format-only limitation');
  }
  if (pages.length !== 23) issues.push('Expected 23 HTML files including 404; found ' + pages.length);
  if (indexable.length !== 22) issues.push('Expected 22 indexable HTML pages; found ' + indexable.length);

  if (issues.length) {
    console.error('Content checks failed:');
    for (const issue of issues) console.error('- ' + issue);
    process.exitCode = 1;
    return;
  }
  console.log('Content checks passed: ' + pages.length + ' HTML pages, ' + indexable.length +
    ' indexable pages, no known templated keyword artefacts, and both QR tools explain their scope and limitations.');
}

main();
