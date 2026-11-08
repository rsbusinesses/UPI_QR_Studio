'use strict';

/**
 * Build a least-privilege GitHub Pages artifact.
 * Run after build and validation. Source, tooling and documentation stay private
 * to the repository tree and are not copied into the public Pages artifact.
 */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'dist');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-config.json'), 'utf8'));
const SITE_URL = String(CONFIG.siteUrl || '').replace(/\/$/, '');

if (OUTPUT === ROOT || path.dirname(OUTPUT) !== ROOT || path.basename(OUTPUT) !== 'dist') {
  throw new Error('Refusing to package outside the repository dist directory.');
}
if (!/^https:\/\/[^/]+$/.test(SITE_URL)) {
  throw new Error('site-config.json must contain an HTTPS origin before packaging.');
}

function collectHtml(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'tools', 'components', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full, result);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) result.push(full);
  }
  return result.sort();
}

function copyFile(source) {
  const relative = path.relative(ROOT, source);
  const destination = path.join(OUTPUT, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function assertExists(relative) {
  const target = path.join(OUTPUT, relative);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    throw new Error('Required public output is missing: ' + relative);
  }
}

try {
  fs.rmSync(OUTPUT, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT, { recursive: true });

  for (const file of collectHtml(ROOT)) copyFile(file);
  for (const directory of ['assets', 'css', 'js']) {
    const source = path.join(ROOT, directory);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(OUTPUT, directory), { recursive: true });
  }
  for (const file of ['robots.txt', 'sitemap.xml', '.nojekyll', 'ads.txt']) {
    const source = path.join(ROOT, file);
    if (fs.existsSync(source)) copyFile(source);
  }

  for (const required of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll', 'assets/favicon.svg']) {
    assertExists(required);
  }

  const pageFiles = collectHtml(OUTPUT);
  if (!pageFiles.some(file => path.relative(OUTPUT, file) === 'index.html')) {
    throw new Error('The packaged site has no homepage.');
  }
  const sitemapText = fs.readFileSync(path.join(OUTPUT, 'sitemap.xml'), 'utf8');
  const sitemap = cheerio.load(sitemapText, { xmlMode: true });
  const locations = sitemap('urlset > url > loc').map((_, element) => sitemap(element).text().trim()).get();
  if (!locations.length) throw new Error('The packaged sitemap is empty.');

  const seen = new Set();
  for (const location of locations) {
    const url = new URL(location);
    if (url.origin !== SITE_URL || url.protocol !== 'https:') {
      throw new Error('Sitemap URL is outside the configured production origin: ' + location);
    }
    if (seen.has(location)) throw new Error('Duplicate sitemap URL: ' + location);
    seen.add(location);
    const relative = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || 'index.html';
    const target = path.resolve(OUTPUT, relative);
    const safeRelative = path.relative(OUTPUT, target);
    if (safeRelative === '..' || safeRelative.startsWith('..' + path.sep) || !fs.existsSync(target)) {
      throw new Error('Sitemap URL does not map to a packaged page: ' + location);
    }
  }

  // The Pages uploader excludes dotfiles by default. The workflow opts in so
  // .nojekyll is retained, but no other hidden file or directory may enter dist.
  const hiddenPaths = [];
  function collectHiddenPaths(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.name.startsWith('.')) {
        hiddenPaths.push(path.relative(OUTPUT, full).split(path.sep).join('/'));
      }
      if (entry.isDirectory()) collectHiddenPaths(full);
    }
  }
  collectHiddenPaths(OUTPUT);
  const unexpectedHiddenPaths = hiddenPaths.filter(item => item !== '.nojekyll');
  if (unexpectedHiddenPaths.length) {
    throw new Error('Public artifact contains unapproved hidden files or directories: ' + unexpectedHiddenPaths.join(', '));
  }
  if (!hiddenPaths.includes('.nojekyll')) {
    throw new Error('Public artifact is missing the required .nojekyll file.');
  }

  const forbidden = ['tools', 'components', '.github', 'node_modules', 'package.json', 'package-lock.json', 'site-config.json'];
  for (const item of forbidden) {
    if (fs.existsSync(path.join(OUTPUT, item))) {
      throw new Error('Development/source resource leaked into the Pages artifact: ' + item);
    }
  }

  let fileCount = 0;
  function countFiles(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) countFiles(full);
      else fileCount++;
    }
  }
  countFiles(OUTPUT);

  console.log('Packaged ' + pageFiles.length + ' HTML pages and ' + fileCount + ' total public files into dist/.');
  console.log('Validated ' + locations.length + ' unique HTTPS sitemap URLs on ' + SITE_URL + '.');
  console.log('Tooling, templates, documentation, configuration and package files are excluded.');
} catch (error) {
  console.error('Site packaging failed:', error && error.stack ? error.stack : error);
  process.exitCode = 1;
}
