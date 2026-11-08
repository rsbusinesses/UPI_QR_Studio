'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  getAdSenseState,
  isAdSenseEligiblePage,
  adSenseLoaderUrl
} = require('./adsense-config');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-config.json'), 'utf8'));
const STATE = getAdSenseState(CONFIG);
const errors = [];
const checks = [];

function pass(message) {
  checks.push(message);
}

function fail(message) {
  errors.push(message);
}

function collectHtml(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'tools', 'components', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full, result);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) result.push(full);
  }
  return result;
}

function inspectHtmlTree(base, label) {
  const htmlFiles = collectHtml(base);
  if (!htmlFiles.length) {
    fail(label + ': no HTML pages found.');
    return;
  }

  const seenPublisherIds = new Set();
  for (const file of htmlFiles) {
    const relative = path.relative(base, file).split(path.sep).join('/');
    const html = fs.readFileSync(file, 'utf8');
    const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)];
    const loaderTags = scriptTags
      .filter(match => /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(match[1]));
    const otherAdScripts = scriptTags.filter(match =>
      /googlesyndication|googleadservices|googletagservices|doubleclick|adservice/i.test(match[1]) &&
      !/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(match[1])
    );
    if (otherAdScripts.length) {
      fail(label + '/' + relative + ': unapproved third-party advertising script source found.');
    }
    const expectedLoader = STATE.canLoadAds && isAdSenseEligiblePage(relative, STATE);

    if (loaderTags.length > 1) {
      fail(label + '/' + relative + ': duplicate AdSense loader scripts (' + loaderTags.length + ').');
    }
    if (loaderTags.length !== (expectedLoader ? 1 : 0)) {
      fail(label + '/' + relative + ': AdSense loader count does not match the central page allowlist and activation gate.');
    }

    if (loaderTags.length === 1) {
      const tag = loaderTags[0][0];
      const source = loaderTags[0][1];
      if (source !== adSenseLoaderUrl(STATE.clientId)) {
        fail(label + '/' + relative + ': loader URL does not use the configured publisher ID.');
      }
      if (!/\basync(?:\s|=|>)/i.test(tag) || !/\bcrossorigin\s*=\s*["']anonymous["']/i.test(tag)) {
        fail(label + '/' + relative + ': AdSense loader is missing Google’s async/crossorigin attributes.');
      }
      const match = /[?&]client=(ca-pub-\d{16})(?:&|$)/i.exec(source);
      if (match) seenPublisherIds.add(match[1]);
    }

    // Catch hard-coded, stale or additional publisher identifiers anywhere
    // in the HTML, not only inside the loader URL or verification meta tag.
    for (const publisherMatch of html.matchAll(/ca-pub-\d{16}/gi)) {
      if (publisherMatch[0] !== STATE.clientId) {
        fail(label + '/' + relative + ': publisher ID differs from the central configuration.');
      }
      seenPublisherIds.add(publisherMatch[0]);
    }

    const verificationTags = [...html.matchAll(/<meta\b[^>]*name\s*=\s*["']google-adsense-account["'][^>]*>/gi)];
    const expectedMeta = relative === 'index.html' && STATE.canPublishVerificationMeta;
    if (verificationTags.length !== (expectedMeta ? 1 : 0)) {
      fail(label + '/' + relative + ': site-verification meta tag count does not match its dedicated homepage verification setting.');
    }
    for (const match of verificationTags) {
      const id = /\bcontent\s*=\s*["'](ca-pub-\d{16})["']/i.exec(match[0]);
      if (!id || id[1] !== STATE.clientId) {
        fail(label + '/' + relative + ': site-verification meta tag contains an unverified or mismatched publisher ID.');
      } else {
        seenPublisherIds.add(id[1]);
      }
    }

    if (/<ins\b[^>]*class\s*=\s*["'][^"']*\badsbygoogle\b/i.test(html) ||
        /\bdata-ad-(?:client|slot)\s*=/i.test(html) ||
        /\badsbygoogle\s*=\s*window\b/i.test(html) ||
        /\badsbygoogle\.push\s*\(/i.test(html)) {
      fail(label + '/' + relative + ': unexpected manual ad-unit markup/code found; this configuration supports Auto ads loader only.');
    }

    if (/ADSENSE INSERTION POINT/i.test(html)) {
      fail(label + '/' + relative + ': obsolete inert AdSense insertion marker remains in generated HTML.');
    }

    if (seenPublisherIds.size > 1) {
      fail(label + '/' + relative + ': more than one publisher ID was found across generated ad/verification code.');
    }
  }

  if (seenPublisherIds.size > 1) {
    fail(label + ': multiple publisher IDs detected.');
  }
  pass(label + ': ' + htmlFiles.length + ' HTML pages checked for duplicate loaders, publisher IDs, manual ad slots and page-level exclusions.');
}

if (!fs.existsSync(path.join(ROOT, 'tools', 'adsense-config.js'))) {
  fail('Shared AdSense configuration module is missing.');
} else {
  pass('Central AdSense configuration module is present.');
}

if (!STATE.modeValid) {
  fail('adsenseMode must be disabled or auto.');
}
if (Array.isArray(CONFIG.adsenseEligiblePages) &&
    new Set(CONFIG.adsenseEligiblePages).size !== CONFIG.adsenseEligiblePages.length) {
  fail('adsenseEligiblePages contains duplicate paths.');
}
for (const page of STATE.eligiblePages) {
  if (!fs.existsSync(path.join(ROOT, page))) fail('Configured advertising page does not exist: ' + page);
}
if (STATE.canLoadAds && STATE.eligiblePages.size === 0) {
  fail('Advertising is authorized but the page allowlist is empty.');
}
for (const blocked of [
  'index.html',
  '404.html',
  'pages/qr-widget.html',
  'pages/contact-us.html',
  'pages/privacy-policy.html',
  'pages/terms-and-conditions.html',
  'pages/safety-center.html'
]) {
  if (STATE.eligiblePages.has(blocked)) fail('Sensitive or utility page must not be on the advertising allowlist: ' + blocked);
}
if (errors.length) {
  console.error('AdSense checks failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}
pass('Advertising allowlist excludes QR tools, contact/legal pages, safety/emergency guidance, and navigation-only pages.');

inspectHtmlTree(ROOT, 'repository');
if (fs.existsSync(DIST)) inspectHtmlTree(DIST, 'dist');

const rootAdsTxt = path.join(ROOT, 'ads.txt');
const distAdsTxt = path.join(DIST, 'ads.txt');
if (STATE.canWriteAdsTxt) {
  if (!fs.existsSync(rootAdsTxt)) fail('Verified account-provided ads.txt record is missing from the repository root.');
  else if (fs.readFileSync(rootAdsTxt, 'utf8') !== STATE.adsTxtRecord + '\n') {
    fail('Root ads.txt does not exactly match the account-verified seller record in site-config.json.');
  }
  if (fs.existsSync(DIST)) {
    if (!fs.existsSync(distAdsTxt)) fail('Verified ads.txt record is missing from the packaged public artifact.');
    else if (fs.readFileSync(distAdsTxt, 'utf8') !== STATE.adsTxtRecord + '\n') {
      fail('Packaged ads.txt does not exactly match the account-verified seller record.');
    }
  }
  pass('ads.txt matches the exact account-provided record and publisher ID.');
} else {
  if (fs.existsSync(rootAdsTxt)) fail('Root ads.txt exists without a verified publisher ID and account-copied seller line.');
  if (fs.existsSync(distAdsTxt)) fail('Packaged ads.txt exists without a verified publisher ID and account-copied seller line.');
  pass('No placeholder, guessed, or unverified ads.txt record is present.');
}

if (STATE.canLoadAds) {
  pass('AdSense loader is authorized by all account, review, consent, ads.txt and owner-activation gates.');
} else {
  pass('No AdSense loader is authorized; site-verification meta tag (if configured) is non-ad-serving only.');
}

if (errors.length) {
  console.error('AdSense checks failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}
console.log('AdSense readiness checks passed (' + checks.length + ' checks):');
for (const check of checks) console.log(' - ' + check);
