'use strict';

/**
 * Build UPI QR Studio's static HTML/CSS/JS site using Node.js.
 * Usage: npm run build
 * Visitors do not run this script; GitHub Pages serves the generated static files.
 */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const DATA = require('./build-data.json');
const { fixFragmentTargets } = require('./fix-fragments');
const { contextualizeGuides } = require('./guide-content');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'site-config.json');
const DEFAULT_CONFIG = {
  siteName: 'UPI QR Studio',
  siteUrl: 'https://YOUR-USERNAME.github.io/YOUR-REPOSITORY',
  contactEmail: 'YOUR-CONTACT-EMAIL@example.com',
  adsenseClientId: ''
};
const CONFIG = {
  ...DEFAULT_CONFIG,
  ...(fs.existsSync(CONFIG_PATH) ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) : {})
};
const HEADER_TEMPLATE_PATH = path.join(ROOT, 'components', 'header.html');
const FOOTER_TEMPLATE_PATH = path.join(ROOT, 'components', 'footer.html');
const headerTemplate = fs.readFileSync(HEADER_TEMPLATE_PATH, 'utf8');
const footerTemplate = fs.readFileSync(FOOTER_TEMPLATE_PATH, 'utf8');

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function relativePrefix(page) {
  const parentRelative = path.relative(ROOT, path.dirname(page));
  const depth = parentRelative ? parentRelative.split(path.sep).filter(Boolean).length : 0;
  return '../'.repeat(depth);
}

function replaceTokens(value) {
  return String(value)
    .replaceAll('{{SITE_NAME}}', escapeHtml(CONFIG.siteName))
    .replaceAll('{{CONTACT_EMAIL}}', escapeHtml(CONFIG.contactEmail))
    .replaceAll('{{SITE_URL}}', String(CONFIG.siteUrl || '').replace(/\/$/, ''));
}

function templateForPage(template, page) {
  return replaceTokens(template.replaceAll('{{REL}}', relativePrefix(page)));
}

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

function localTarget(currentPage, href) {
  const raw = String(href || '').trim();
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return null;
  const pathPart = raw.split(/[?#]/, 1)[0];
  if (!pathPart) return null;
  const candidates = [];
  if (pathPart.startsWith('/')) candidates.push(path.join(ROOT, pathPart.replace(/^\/+/, '')));
  else {
    candidates.push(path.resolve(path.dirname(currentPage), pathPart));
    candidates.push(path.resolve(ROOT, pathPart));
  }
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return fs.realpathSync(candidate);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      const indexFile = path.join(candidate, 'index.html');
      if (fs.existsSync(indexFile)) return fs.realpathSync(indexFile);
    }
  }
  const baseName = path.basename(pathPart);
  const matches = [];
  function findMatches(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (['tools', 'components', 'node_modules'].includes(entry.name)) continue;
        findMatches(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name === baseName) matches.push(path.resolve(dir, entry.name));
    }
  }
  findMatches(ROOT);
  if (matches.length === 1) return fs.realpathSync(matches[0]);
  if (matches.length > 1) {
    const currentParts = path.relative(ROOT, currentPage).split(path.sep);
    matches.sort((a, b) => {
      const partsA = path.relative(ROOT, a).split(path.sep);
      const partsB = path.relative(ROOT, b).split(path.sep);
      const distanceA = symmetricDistance(currentParts, partsA);
      const distanceB = symmetricDistance(currentParts, partsB);
      return distanceA - distanceB || a.length - b.length;
    });
    return fs.realpathSync(matches[0]);
  }
  return null;
}

function symmetricDistance(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  let count = 0;
  for (const item of setA) if (!setB.has(item)) count++;
  for (const item of setB) if (!setA.has(item)) count++;
  return count;
}

function normalizeAssetAndAnchorLinks(page, $) {
  $('a, link, script, img, source').each((_, element) => {
    const node = $(element);
    const attribute = ['a', 'link'].includes(element.name) ? 'href' : 'src';
    const original = node.attr(attribute);
    if (!original || /^(?:#|mailto:|tel:|javascript:|data:|https?:|\/\/)/i.test(original)) return;
    const target = localTarget(page, original);
    if (!target) return;
    const rawPath = original.split(/[?#]/, 1)[0];
    const suffix = original.slice(rawPath.length);
    let relative = path.relative(path.dirname(page), target).split(path.sep).join('/');
    if (!relative) relative = path.basename(target);
    node.attr(attribute, `${relative}${suffix}`);
  });
}

function upsertMeta($, keyType, key, content) {
  let tag = $('meta').filter((_, element) => $(element).attr(keyType) === key).first();
  if (!tag.length) {
    tag = $('<meta>');
    tag.attr(keyType, key);
    $('head').append(tag);
  }
  tag.attr('content', content);
}

function pageTitle(relpath, $) {
  if (DATA.PAGE_TITLES[relpath]) return DATA.PAGE_TITLES[relpath];
  const title = $('title').first().text().trim() || path.basename(relpath, '.html').replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
  return title.split('|')[0].trim();
}

function addUniqueGuideContent(page, $, relpath) {
  const note = DATA.GUIDE_NOTES[path.basename(page)];
  if (!note || path.basename(path.dirname(page)) !== 'upi-guides') return;
  const main = $('main').first();
  if (!main.length || main.find('[data-guide-editorial-note]').length) return;

  const summary = note[0];
  const checklist = note[1] || [];
  const panel = $('<section class="guide-practical-panel content-card" data-guide-editorial-note="true" aria-labelledby="practical-heading"></section>');
  panel.append('<h2 id="practical-heading">Practical checks before you act</h2>');
  panel.append($('<p></p>').text(summary));
  const list = $('<ul></ul>');
  for (const item of checklist) list.append($('<li></li>').text(item));
  panel.append(list);

  const sourceNotes = {
    'biometric-authentication.html': 'Supported biometric sign-in and payment authorization vary by device and provider. Check the official app help, device security settings and your bank’s instructions.',
    'cash-deposit-and-withdrawal-services.html': 'Cash services are not available at every QR-enabled outlet. Confirm service type, eligibility, fees and limits with the participating bank or authorized service point before starting.',
    'conversational-payments.html': 'Voice-assisted payment availability varies by product, device and language. Use official app instructions and review the on-screen payee and amount before authorization.',
    'onboarding-account-activation.html': 'Account linking and authentication depend on bank support and the payment application. Use your bank’s official guidance for eligibility, activation and PIN recovery.',
    'popular-guides.html': 'For a baseline description of UPI and current product features, consult NPCI’s official UPI overview and then check the instructions provided by your bank or payment app.',
    'transaction-rules-and-merchant-payments.html': 'Transaction status, handling of failed payments and applicable caps depend on the payment type and participating institutions. Follow the status and grievance workflow in your own app or bank channel.',
    'upi-autopay-and-recurring-payments.html': 'Review mandate amount, frequency, validity and cancellation options in the application where the mandate is managed; biller and bank conditions may also apply.',
    'upi-circle-delegated-payments.html': 'Eligibility, user roles and spending controls for delegated payments can vary by participating provider. Read the current product terms before enabling access.',
    'upi-id-number-guide.html': 'A UPI ID is a payment address, not identity verification. Always inspect the recipient details presented by your payment app before approving a transfer.',
    'user-safety-and-daily-limits.html': 'Do not rely on a universal daily limit figure: check your bank and application for the current cap that applies to the specific transaction category.'
  };
  const sourceNote = $('<p class="source-note"></p>');
  sourceNote.append(escapeHtml(sourceNotes[path.basename(page)] || summary));
  sourceNote.append(escapeHtml(' Read the '));
  sourceNote.append('<a href="https://www.npci.org.in/what-we-do/upi/product-overview" rel="noopener noreferrer" target="_blank">official NPCI UPI overview</a>');
  sourceNote.append(escapeHtml(' and verify provider-specific details with your bank or payment app.'));
  panel.append(sourceNote);
  main.append(panel);
}

function addBreadcrumbs(page, $, relpath) {
  if (['index.html', '404.html'].includes(relpath)) return;
  const main = $('main').first();
  if (!main.length || $('nav[aria-label="Breadcrumb"]').length) return;
  const prefix = relativePrefix(page);
  const nav = $('<nav aria-label="Breadcrumb" class="breadcrumbs"><ol></ol></nav>');
  const list = nav.find('ol');
  list.append(`<li><a href="${prefix}index.html">Home</a></li>`);
  if (path.basename(path.dirname(page)) === 'upi-guides') {
    list.append('<li><a href="../upi-guide.html">UPI Guides</a></li>');
  }
  list.append($('<li aria-current="page"></li>').text(pageTitle(relpath, $)));
  main.prepend(nav);
}

function isPlaceholderSiteUrl(siteUrl) {
  return !siteUrl || siteUrl.includes('YOUR-USERNAME') || siteUrl.includes('YOUR-REPOSITORY');
}

function processPage(page) {
  const relpath = path.relative(ROOT, page).split(path.sep).join('/');
  const original = fs.readFileSync(page, 'utf8');
  const $ = cheerio.load(original, { decodeEntities: false });
  if (!$('html').length) return;
  $('html').attr('lang', 'en');
  if (!$('head').length) $('html').prepend('<head></head>');
  if (!$('body').length) $('html').append('<body></body>');
  if (!$('meta[name="viewport"]').length) $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');

  const title = pageTitle(relpath, $);
  $('title').first().length ? $('title').first().text(`${title} | ${CONFIG.siteName}`) : $('head').append($('<title></title>').text(`${title} | ${CONFIG.siteName}`));
  const description = DATA.DESCRIPTIONS[relpath] || `${title}. Read practical, independent guidance from ${CONFIG.siteName}; verify current payment rules with your bank or official provider.`;
  upsertMeta($, 'name', 'description', description);
  upsertMeta($, 'name', 'theme-color', '#5A7863');
  upsertMeta($, 'property', 'og:type', 'website');
  upsertMeta($, 'property', 'og:site_name', CONFIG.siteName);
  upsertMeta($, 'property', 'og:title', title);
  upsertMeta($, 'property', 'og:description', description);
  if (relpath === '404.html') upsertMeta($, 'name', 'robots', 'noindex, follow');

  $('link[rel="canonical"]').remove();
  const siteUrl = String(CONFIG.siteUrl || '').replace(/\/$/, '');
  if (relpath !== '404.html' && !isPlaceholderSiteUrl(siteUrl)) {
    const canonicalPath = relpath === 'index.html' ? '/' : `/${relpath}`;
    $('head').append(`<link rel="canonical" href="${escapeHtml(siteUrl + canonicalPath)}">`);
  }

  // Never insert advertising code on the noindex 404 page.
  const clientId = String(CONFIG.adsenseClientId || '').trim();
  $('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]').remove();
  if (relpath !== '404.html' && /^ca-pub-\d{16}$/.test(clientId)) {
    const script = $('<script></script>')
      .attr('src', `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`)
      .attr('async', '')
      .attr('crossorigin', 'anonymous');
    $('head').append(script);
  }

  $('link[rel="stylesheet"]').each((_, element) => {
    const href = String($(element).attr('href') || '');
    if (href.includes('theme.css') || href.includes('theme-refresh.css')) $(element).remove();
  });
  $('head').append(`<link rel="stylesheet" href="${relativePrefix(page)}css/theme.css">`);
  $('head link[rel]').each((_, element) => {
    const rel = String($(element).attr('rel') || '').toLowerCase().split(/\s+/);
    if (rel.includes('icon')) $(element).remove();
  });
  $('head').append(`<link rel="icon" type="image/svg+xml" href="${relativePrefix(page)}assets/favicon.svg">`);

  const hasAdSenseMarker = $('head').contents().toArray().some(node => node.type === 'comment' && String(node.data || '').includes('ADSENSE INSERTION POINT'));
  $('head').contents().toArray().forEach(node => {
    if (node.type === 'text' && String(node.data || '').includes('ADSENSE INSERTION POINT')) $(node).remove();
  });
  if (!hasAdSenseMarker) $('head').append('<!-- ADSENSE INSERTION POINT: use only the real code supplied by your own AdSense account after verification. Do not use a sample publisher ID. -->');

  $('header.site-header').remove();
  $('[id]').each((_, element) => {
    const id = String($(element).attr('id') || '');
    if (/(header|footer)-placeholder/i.test(id)) $(element).remove();
  });

  const skipLinks = $('body a.skip-link');
  let headerNode = cheerio.load(templateForPage(headerTemplate, page), { decodeEntities: false })('header.site-header').first();
  const existingSkip = skipLinks.first();
  if (existingSkip.length) existingSkip.after(headerNode);
  else $('body').prepend(headerNode);

  const allSkips = $('body a.skip-link');
  if (!allSkips.length) {
    const skip = $('<a class="skip-link" href="#main-content">Skip to main content</a>');
    headerNode.before(skip);
  } else {
    allSkips.slice(1).remove();
    allSkips.first().attr('href', '#main-content').text('Skip to main content');
  }

  let main = $('body main').first();
  if (!main.length) {
    main = $('<main id="main-content"></main>');
    const children = $('body').contents().toArray();
    for (const child of children) {
      const childElement = child.type === 'tag' ? child : null;
      if (childElement && ['header', 'footer', 'script'].includes(childElement.name)) continue;
      if (childElement && childElement.name === 'a' && (childElement.attribs.class || '').split(/\s+/).includes('skip-link')) continue;
      main.append(child);
    }
    headerNode.after(main);
  }
  if (!main.attr('id')) main.attr('id', 'main-content');
  else if (main.attr('id') !== 'main-content' && !$('[id="main-content"]').length) {
    main.prepend('<span id="main-content" class="main-content-anchor" tabindex="-1" aria-hidden="true"></span>');
  }
  if (!main.find('h1').length) main.prepend($('<h1 class="generated-page-title"></h1>').text(title));

  addUniqueGuideContent(page, $, relpath);
  addBreadcrumbs(page, $, relpath);

  $('body footer').remove();
  const footerNode = cheerio.load(templateForPage(footerTemplate, page), { decodeEntities: false })('footer.site-footer').first();
  $('body').append(footerNode);

  $('body script:not([src])').each((_, element) => {
    const inlineCode = $(element).text();
    if ((inlineCode.includes('const menuToggle') && inlineCode.includes('primaryNavigation')) || inlineCode.includes('getElementById("currentYear")')) $(element).remove();
  });
  $('body script[src]').each((_, element) => {
    const src = String($(element).attr('src') || '');
    if (src.endsWith('/js/main.js') || src === 'js/main.js') $(element).remove();
  });
  $('body').append(`<script src="${relativePrefix(page)}js/main.js" defer></script>`);

  normalizeAssetAndAnchorLinks(page, $);

  // Use site-config.json as the single source of truth for contact information.
  const contactEmail = String(CONFIG.contactEmail || 'YOUR-CONTACT-EMAIL@example.com').trim();
  const placeholders = [
    'YOUR-CONTACT-EMAIL@example.com', 'REPLACE-WITH-YOUR-PRIVACY-EMAIL',
    'REPLACE-WITH-YOUR-EMAIL', '[EMAIL ADDRESS NEEDED]'
  ];
  $('a[href]').each((_, element) => {
    const anchor = $(element);
    const href = String(anchor.attr('href') || '');
    if (href.startsWith('mailto:') && placeholders.some(token => href.includes(token))) anchor.attr('href', `mailto:${contactEmail}`);
    const text = anchor.text().trim();
    if (placeholders.some(token => text.includes(token))) anchor.text(contactEmail);
  });
  replacePlaceholdersInText($, placeholders, contactEmail);

  let finalHtml = $.html();
  finalHtml = finalHtml.replace(/^\s*(?:<!doctype\s+html>\s*)+/i, '<!DOCTYPE html>\n');
  if (!finalHtml.trimStart().toLowerCase().startsWith('<!doctype html>')) finalHtml = '<!DOCTYPE html>\n' + finalHtml;
  fs.writeFileSync(page, finalHtml, 'utf8');
}

function replacePlaceholdersInText($, placeholders, contactEmail) {
  function walk(node) {
    if (node.type === 'text' && typeof node.data === 'string') {
      if (node.data.includes('Replace this placeholder with an email address that you')) {
        node.data = 'Use the contact email address shown above for questions or concerns about this website.';
      } else if (placeholders.some(token => node.data.includes(token))) {
        for (const token of placeholders) node.data = node.data.split(token).join(contactEmail);
      }
    }
    for (const child of node.children || []) walk(child);
  }
  walk($.root()[0]);
}

function writeRobotsAndSitemap(htmlPages) {
  const siteUrl = String(CONFIG.siteUrl || '').replace(/\/$/, '');
  let robots = 'User-agent: *\nAllow: /\n';
  if (!isPlaceholderSiteUrl(siteUrl)) robots += `Sitemap: ${siteUrl}/sitemap.xml\n`;
  else robots += '# After setting siteUrl in site-config.json, rebuild to add your sitemap URL.\n';
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

  let sitemap;
  if (!isPlaceholderSiteUrl(siteUrl)) {
    const locations = htmlPages.filter(page => path.relative(ROOT, page).split(path.sep).join('/') !== '404.html')
      .map(page => {
        const rel = path.relative(ROOT, page).split(path.sep).join('/');
        const publicUrl = rel === 'index.html' ? `${siteUrl}/` : `${siteUrl}/${rel}`;
        return `  <url><loc>${escapeHtml(publicUrl)}</loc></url>`;
      });
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + locations.join('\n') + '\n</urlset>\n';
  } else {
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Set siteUrl in site-config.json and run npm run build to populate this sitemap. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
  }
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

  const clientId = String(CONFIG.adsenseClientId || '').trim();
  const adsPath = path.join(ROOT, 'ads.txt');
  if (/^ca-pub-\d{16}$/.test(clientId)) {
    const publisherId = clientId.replace(/^ca-/, '');
    fs.writeFileSync(adsPath, `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, 'utf8');
  } else if (fs.existsSync(adsPath)) {
    fs.unlinkSync(adsPath);
  }
}

function main() {
  const htmlPages = collectHtmlPages();
  for (const page of htmlPages) processPage(page);
  const fragmentResult = fixFragmentTargets(htmlPages, ROOT);
  const contentChanges = contextualizeGuides(htmlPages, ROOT);
  console.log(`Applied ${contentChanges} guide-content improvements.`);
  writeRobotsAndSitemap(htmlPages);
  console.log(`Built ${htmlPages.length} HTML pages.`);
  console.log('Shared header/footer, metadata, theme and link normalization applied.');
  console.log(`Fragment links requiring manual review: ${fragmentResult.unresolved.length}.`);
  if (isPlaceholderSiteUrl(String(CONFIG.siteUrl || ''))) {
    console.log('SETUP REQUIRED: replace siteUrl in site-config.json after creating your GitHub repository/domain; then run npm run build to generate canonical URLs and a populated sitemap.');
  }
  if (!CONFIG.contactEmail || String(CONFIG.contactEmail).includes('example.com')) {
    console.log('SETUP REQUIRED: replace contactEmail in site-config.json before publication.');
  }
  if (!String(CONFIG.adsenseClientId || '').trim()) {
    console.log('AdSense is not enabled. Leave adsenseClientId blank until you have your real publisher ID.');
  }
}

try {
  main();
} catch (error) {
  console.error('Website build failed:', error && error.stack ? error.stack : error);
  process.exitCode = 1;
}
