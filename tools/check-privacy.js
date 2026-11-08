'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-config.json'), 'utf8'));
const { getAdSenseState } = require('./adsense-config');
const ADSENSE_STATE = getAdSenseState(CONFIG);
const ADS_ENABLED = ADSENSE_STATE.canLoadAds;
const errors = [];
const checks = [];

function pass(message) {
  checks.push(message);
}

function fail(message) {
  errors.push(message);
}

function walkHtml(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, result);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) result.push(full);
  }
  return result;
}

for (const required of [
  'assets/vendor/qrcode.min.js',
  'assets/vendor/QRCODEJS-LICENSE.txt',
  'index.html',
  'pages/qr-widget.html',
  'pages/privacy-policy.html',
  'pages/terms-and-conditions.html'
]) {
  const full = path.join(ROOT, required);
  if (!fs.existsSync(full)) fail('Required privacy/security file is missing: ' + required);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
pass('Local QRCode.js asset and MIT license are present.');

const htmlPages = walkHtml(ROOT);
for (const file of htmlPages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file).split(path.sep).join('/');

  if (/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcodejs/i.test(html)) {
    fail(relative + ': still references the external QRCode.js CDN.');
  }

  const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)];
  for (const match of scriptTags) {
    const source = match[1];
    if (/^https?:\/\//i.test(source)) {
      const adScript = /^https:\/\/pagead\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-\d{16}$/i.test(source);
      if (!adScript || !ADS_ENABLED) fail(relative + ': unexpected or unapproved remote script: ' + source);
    }
  }

  if (['index.html', 'pages/qr-widget.html'].includes(relative)) {
    if (!/assets\/vendor\/qrcode\.min\.js/.test(html)) {
      fail(relative + ': QRCode.js must be loaded from the local vendor asset.');
    }
    if (!/privacy-disclosure/.test(html) || !/GitHub Pages logs visitor IP addresses/.test(html)) {
      fail(relative + ': visible QR privacy disclosure is missing.');
    }
  }

  const adPresent = /pagead\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(html);
  if (adPresent && !ADS_ENABLED) fail(relative + ': AdSense loader is present without both consent attestation and a valid publisher ID.');
}
pass('Generated pages use local QR scripts; no unapproved remote script tags are present.');

const applicationJsDir = path.join(ROOT, 'js');
const jsFiles = fs.readdirSync(applicationJsDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(applicationJsDir, file));
const forbidden = [
  [/\bdocument\.cookie\b/, 'document.cookie'],
  [/\blocalStorage\b/, 'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bindexedDB\b/i, 'IndexedDB'],
  [/\bfetch\s*\(/, 'fetch()'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [/\bWebSocket\b/, 'WebSocket'],
  [/\bEventSource\b/, 'EventSource'],
  [/\bsendBeacon\s*\(/, 'sendBeacon()'],
  [/\binnerHTML\b/, 'innerHTML'],
  [/\bouterHTML\b/, 'outerHTML'],
  [/\binsertAdjacentHTML\s*\(/, 'insertAdjacentHTML()'],
  [/\bdocument\.write\s*\(/, 'document.write()'],
  [/\beval\s*\(/, 'eval()'],
  [/\bnew\s+Function\b/, 'new Function()']
];
for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const [pattern, label] of forbidden) {
    if (pattern.test(source)) fail(path.relative(ROOT, file) + ': forbidden runtime API detected: ' + label);
  }
}
if (!errors.length) pass('Application JavaScript has no detected network, persistent-storage, cookie, or unsafe-HTML APIs.');

const builder = fs.readFileSync(path.join(ROOT, 'tools/build-site.js'), 'utf8');
if (!builder.includes('adsenseConsentConfigurationVerified === true')) {
  fail('Build pipeline is missing the explicit AdSense consent-configuration gate.');
}
if (!ADSENSE_STATE.canWriteAdsTxt && fs.existsSync(path.join(ROOT, 'ads.txt'))) {
  fail('ads.txt exists without a verified publisher ID and account-provided seller record.');
}
if (!ADS_ENABLED) pass('AdSense remains disabled until the full approval, consent, account-record and owner-authorization gates are satisfied.');

const privacy = fs.readFileSync(path.join(ROOT, 'pages/privacy-policy.html'), 'utf8');
const terms = fs.readFileSync(path.join(ROOT, 'pages/terms-and-conditions.html'), 'utf8');
for (const [name, text] of [['Privacy Policy', privacy], ['Terms', terms]]) {
  for (const phrase of ['GitHub Pages', 'QR', 'cookies', 'AdSense']) {
    if (!text.toLowerCase().includes(phrase.toLowerCase())) fail(name + ': expected disclosure missing: ' + phrase);
  }
}
if (errors.length) {
  console.error('Privacy/security checks failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}
console.log('Privacy/security checks passed (' + checks.length + ' checks):');
for (const check of checks) console.log(' - ' + check);
