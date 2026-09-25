#!/usr/bin/env node
// scripts/prerender.js — runs after `react-scripts build`.
//
// 1. Server-renders the static pages (home, about, contact, privacy, terms,
//    returns, recommend, partner) from the real React components and saves the
//    HTML fragments + <head> tags to build/_prerender/*.json.
// 2. Renames build/index.html to build/app-shell.html so Vercel doesn't serve
//    the empty shell for "/" and every request goes through api/render.js,
//    which puts real text into the HTML before sending it.
//
// If a page fails to render here, the build still succeeds and api/render.js
// falls back to its own hand-written summary for that route.

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.BABEL_ENV = process.env.BABEL_ENV || 'production';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const OUT = path.join(BUILD, '_prerender');

// --- Minimal browser globals so components can render on the server ---------
const noop = () => {};
const memStore = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear() }; };
global.window = global.window || {
  innerWidth: 1280, innerHeight: 800, location: { href: 'https://themajorities.com/', pathname: '/', search: '' },
  addEventListener: noop, removeEventListener: noop, scrollTo: noop, matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
  setTimeout, clearTimeout, setInterval, clearInterval,
};
global.localStorage = global.localStorage || memStore();
global.sessionStorage = global.sessionStorage || memStore();
global.window.localStorage = global.localStorage;
global.window.sessionStorage = global.sessionStorage;
global.document = global.document || { title: '', addEventListener: noop, removeEventListener: noop, createElement: () => ({ style: {} }), head: { appendChild: noop, prepend: noop }, body: { appendChild: noop } };

// Non-JS imports become empty modules / file names
['.css', '.scss', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'].forEach(ext => {
  require.extensions[ext] = (m, filename) => { m.exports = ext === '.css' || ext === '.scss' ? {} : `/${path.basename(filename)}`; };
});

require('@babel/register')({
  presets: [[require.resolve('babel-preset-react-app'), { runtime: 'automatic' }]],
  extensions: ['.js', '.jsx'],
  only: [p => p.startsWith(path.join(ROOT, 'src'))],
  cache: false,
});

const React = require('react');
const { renderToString } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const { HelmetProvider } = require('react-helmet-async');

const noopFn = () => {};
const PAGES = [
  { route: '/', file: 'home', mod: './src/pages/LandingPage', exp: 'LandingPage', props: { saveSetToProfile: noopFn, onAddPoints: noopFn, savedSets: [] } },
  { route: '/about', file: 'about', mod: './src/pages/AboutPage', exp: 'AboutPage' },
  { route: '/contact', file: 'contact', mod: './src/pages/ContactPage', exp: 'ContactPage' },
  { route: '/privacy', file: 'privacy', mod: './src/pages/PrivacyPolicyPage', exp: 'PrivacyPolicyPage' },
  { route: '/termsofservice', file: 'terms', mod: './src/pages/TermsOfServicePage', exp: 'TermsOfServicePage' },
  { route: '/returns', file: 'returns', mod: './src/pages/ReturnPolicyPage', exp: 'ReturnPolicyPage' },
  { route: '/recommend', file: 'recommend', mod: './src/pages/RecommendPage', exp: 'RecommendPage', props: { addDumaItem: noopFn, userEmail: '', rankTitle: 'Comrade', rankScore: 1, authToken: '', userAvatar: '' } },
  { route: '/partner', file: 'partner', mod: './src/pages/PartnerPage', exp: 'PartnerPage', props: { addDumaItem: noopFn, userEmail: '', rankTitle: 'Comrade', rankScore: 1, authToken: '', userAvatar: '' } },
];

const pickHead = (helmet) => {
  if (!helmet) return {};
  const str = (x) => (x && typeof x.toString === 'function' ? x.toString() : '');
  const title = str(helmet.title).replace(/<[^>]+>/g, '').trim();
  const metaHtml = str(helmet.meta);
  const desc = /<meta[^>]*name="description"[^>]*content="([^"]*)"/i.exec(metaHtml);
  return { title: title || undefined, description: desc ? desc[1] : undefined };
};

function main() {
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    if (fs.existsSync(path.join(BUILD, 'app-shell.html'))) { console.log('[prerender] already processed'); return; }
    console.error('[prerender] build/index.html not found — run react-scripts build first');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = {};
  for (const page of PAGES) {
    try {
      const Comp = require(path.join(ROOT, page.mod))[page.exp];
      const helmetContext = {};
      const html = renderToString(
        React.createElement(HelmetProvider, { context: helmetContext },
          React.createElement(MemoryRouter, { initialEntries: [page.route] },
            React.createElement(Comp, page.props || {})))
      );
      const head = pickHead(helmetContext.helmet);
      fs.writeFileSync(path.join(OUT, `${page.file}.json`), JSON.stringify({ route: page.route, html, ...head }));
      manifest[page.route] = page.file;
      console.log(`[prerender] ${page.route} → ${html.length} chars${head.title ? ` (“${head.title}”)` : ''}`);
    } catch (err) {
      console.warn(`[prerender] skipped ${page.route}: ${err.message.split('\n')[0]}`);
    }
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
  fs.renameSync(path.join(BUILD, 'index.html'), path.join(BUILD, 'app-shell.html'));
  console.log('[prerender] build/index.html → build/app-shell.html');
}

main();
