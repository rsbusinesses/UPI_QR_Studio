'use strict';

/** Apply topic-specific guide copy from tools/build-data.json. */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const DATA = require('./build-data.json');

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function contextualizeGuides(pages, root) {
  let modified = 0;
  const seenItems = new Set();

  const guidePaths = pages
    .map(file => path.resolve(file))
    .filter(file => path.basename(path.dirname(file)) === 'upi-guides')
    .sort();

  for (const file of guidePaths) {
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
    const summaries = DATA.SUMMARIES[path.basename(file)] || {};
    const panel = $('main [data-guide-editorial-note]').first();
    const aftercare = DATA.PANEL_AFTERCARE[path.basename(file)];
    if (panel.length && aftercare) {
      panel.find('p').each((_, paragraph) => {
        const p = $(paragraph);
        if (p.text().trim().startsWith('For “Practical checks before you act”')) {
          p.text(aftercare);
          modified++;
        }
      });
    }

    $('main section[id]').each((_, section) => {
      const sectionNode = $(section);
      const sectionId = sectionNode.attr('id') || '';
      const heading = sectionNode.find('h2, h3, h4').first();
      const topic = heading.length ? heading.text().replace(/\s+/g, ' ').trim() : sectionId.replace(/-/g, ' ');
      const firstParagraph = sectionNode.find('p').first();
      if (firstParagraph.length && Object.prototype.hasOwnProperty.call(summaries, sectionId)) {
        const currentText = firstParagraph.text();
        if (DATA.GENERIC_PREFIXES.some(prefix => currentText.toLocaleLowerCase().includes(prefix))) {
          firstParagraph.text(summaries[sectionId]);
          modified++;
        }
      }

      sectionNode.find('p').each((__, paragraph) => {
        const p = $(paragraph);
        const currentText = p.text().trim();
        if (currentText.startsWith('For “What to check afterwards”') ||
          (currentText.startsWith('For “') && currentText.includes('verify the current result in your official payment app'))) {
          p.text(`After ${topic.toLocaleLowerCase()}, verify the outcome in your official payment app or bank records. Keep the transaction reference for follow-up, and do not repeat an unclear transaction until you have checked its status.`);
          modified++;
        }
      });

      sectionNode.find('li').each((__, item) => {
        const li = $(item);
        const original = li.text().replace(/\s+/g, ' ').trim();
        const key = normalizeText(original);
        const template = DATA.REPEATED_ITEMS[key];
        if (!template) return;
        if (!seenItems.has(key)) {
          seenItems.add(key);
          return;
        }
        li.text(template.replaceAll('{topic}', topic.toLocaleLowerCase()));
        modified++;
      });
    });
    fs.writeFileSync(file, $.html(), 'utf8');
  }
  return modified;
}

module.exports = { contextualizeGuides };

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const pages = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['tools', 'components', 'node_modules'].includes(entry.name)) continue;
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
      else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(path.join(dir, entry.name));
    }
  })(root);
  console.log(`Applied ${contextualizeGuides(pages.sort(), root)} guide-content improvements.`);
}
