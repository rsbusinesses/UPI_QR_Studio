'use strict';

/**
 * Replace generic guide lead paragraphs with topic-specific summaries.
 * Repeated instructions remain authored for their topic; do not inject
 * heading-derived keyword phrases into lists or aftercare copy.
 */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const DATA = require('./build-data.json');

function contextualizeGuides(pages) {
  let modified = 0;
  const guidePaths = pages
    .map(file => path.resolve(file))
    .filter(file => path.basename(path.dirname(file)) === 'upi-guides')
    .sort();

  for (const file of guidePaths) {
    const original = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(original, { decodeEntities: false });
    const summaries = DATA.SUMMARIES[path.basename(file)] || {};
    let pageModified = false;

    $('main section[id]').each((_, section) => {
      const sectionNode = $(section);
      const sectionId = sectionNode.attr('id') || '';
      const firstParagraph = sectionNode.find('p').first();
      if (!firstParagraph.length || !Object.prototype.hasOwnProperty.call(summaries, sectionId)) return;

      const currentText = firstParagraph.text().toLocaleLowerCase();
      if (DATA.GENERIC_PREFIXES.some(prefix => currentText.includes(prefix))) {
        firstParagraph.text(summaries[sectionId]);
        pageModified = true;
        modified++;
      }
    });

    if (pageModified) fs.writeFileSync(file, $.html(), 'utf8');
  }
  return modified;
}

module.exports = { contextualizeGuides };
