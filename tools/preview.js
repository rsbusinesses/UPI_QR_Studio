'use strict';

/** Tiny local-only static preview server; GitHub Pages does the hosting after deployment. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8000);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

const server = http.createServer((request, response) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }
  if (urlPath.includes('\0')) {
    response.writeHead(400); response.end('Bad request'); return;
  }
  if (urlPath === '/') urlPath = '/index.html';
  let target = path.resolve(ROOT, '.' + urlPath);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  if (target.split(path.sep).some(part => ['tools', 'node_modules', '.git'].includes(part))) {
    response.writeHead(404); response.end('Not found'); return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    const notFound = path.join(ROOT, '404.html');
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(target).pipe(response);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`UPI QR Studio preview: http://127.0.0.1:${PORT}`);
  console.log('Local preview only. Stop with Ctrl+C.');
});
