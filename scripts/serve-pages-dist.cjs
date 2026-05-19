#!/usr/bin/env node
/**
 * Serves production `dist/` the way GitHub Pages does: assets under /ux-prototypes/.
 * Plain `sirv dist` breaks absolute /ux-prototypes/* URLs from the production build.
 */
const path = require('path');
const express = require('express');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const base =
  String(process.env.GITHUB_PAGES_BASENAME || '/ux-prototypes')
    .trim()
    .replace(/\/+$/, '') || '/ux-prototypes';
const baseWithSlash = base.startsWith('/') ? base : `/${base}`;
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';

const app = express();
app.use(baseWithSlash, express.static(dist, { index: false }));
app.get(`${baseWithSlash}/*`, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});
app.get('/', (_req, res) => {
  res.redirect(302, `${baseWithSlash}/`);
});

app.listen(port, host, () => {
  console.log(
    `Production preview: http://localhost:${port}${baseWithSlash}/\n` +
      '(matches GitHub Pages asset paths)',
  );
});
