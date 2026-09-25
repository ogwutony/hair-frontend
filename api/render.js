// api/render.js — returns the React app shell with real page text, title and
// meta tags already in the HTML, so search engines and ad crawlers see content
// without running JavaScript. React replaces the #root contents on load.
//
// vercel.json rewrites every non-file path here as /api/render?path=/<path>.
const {
  SITE, escapeHtml: esc, clip, readBuildFile, fetchDuma, itemId, isPublicId,
  publicPerspectives, publicRecommendations, authorName, itemDate,
} = require('./_lib/site');

const DEFAULT_DESC = 'Join The Majorities community. Discover premium, clean-beauty multicultural personal care products, tailored subscriptions, and routine bundles.';

// Members-only or utility screens: served normally, but kept out of search
const NOINDEX = [/^\/login$/, /^\/signup$/, /^\/forgot-password$/, /^\/reset-password\//, /^\/profile$/, /^\/messages$/, /^\/culture$/,
  /^\/orders$/, /^\/admin(\/|$)/, /^\/auth\//, /^\/oauth\//, /^\/model$/];

const wrap = (inner) => `<div style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:Inter,-apple-system,sans-serif;color:#222;line-height:1.6">${inner}</div>`;

function perspectiveCard(item) {
  const id = itemId(item);
  const d = itemDate(item);
  return `<article style="border:1px solid #eee;border-radius:24px;padding:24px;margin-bottom:20px">
<h3 style="margin:0 0 6px;color:#555"><a href="/duma/${esc(id)}" style="color:inherit">${esc(item.prompt || 'A perspective from The Majorities')}</a></h3>
<p style="margin:0 0 8px;font-size:13px;color:#888">By ${esc(authorName(item))}${d ? ` · <time datetime="${d.toISOString()}">${d.toISOString().slice(0, 10)}</time>` : ''}${item.location ? ` · ${esc(item.location)}` : ''}</p>
<p style="margin:0">${esc(clip(item.response || item.reason || item.desc, 600))}</p>
</article>`;
}

async function dumaPage({ perspectivesOnly }) {
  const items = await fetchDuma();
  const perspectives = publicPerspectives(items).slice(0, 60);
  const recs = perspectivesOnly ? [] : publicRecommendations(items).slice(0, 30);
  const heading = perspectivesOnly ? 'Perspectives' : "The Majorities' Duma";
  const intro = perspectivesOnly
    ? 'Perspectives on beauty, culture and identity from The Majorities community.'
    : 'Community recommendations, partnerships, and cultural contributions — vote to shape The Majorities.';
  let body = `<h1 style="font-size:1.5em;margin-bottom:6px">${heading}</h1><p style="color:#666">${intro}</p>`;
  body += perspectives.length
    ? `<section><h2 style="font-size:1.2em">Latest perspectives</h2>${perspectives.map(perspectiveCard).join('')}</section>`
    : '<p>Perspectives from our community are loading. <a href="/about">Learn about The Majorities</a>.</p>';
  if (recs.length) {
    body += `<section><h2 style="font-size:1.2em">Community product recommendations</h2><ul>${recs.map(r =>
      `<li><strong>${esc(r.name || r.product || 'Recommendation')}</strong>${r.company ? ` by ${esc(r.company)}` : ''}${r.reason ? ` — ${esc(clip(r.reason, 240))}` : ''}</li>`).join('')}</ul></section>`;
  }
  body += '<p><a href="/signup">Join The Majorities</a> to vote, share your perspective, and message members.</p>';
  return {
    title: perspectivesOnly ? 'Perspectives | The Majorities' : 'The Duma | The Majorities',
    description: perspectivesOnly
      ? 'Read perspectives on beauty, culture and identity shared by The Majorities community.'
      : 'The Majorities Duma — explore culture, recommendations, and perspectives from our community.',
    canonical: perspectivesOnly ? '/perspectives' : '/duma',
    html: wrap(body),
    ttl: items ? 300 : 60,
  };
}

async function perspectivePage(id) {
  const items = await fetchDuma();
  if (!items) return { title: 'Perspective | The Majorities', description: DEFAULT_DESC, canonical: `/duma/${id}`, html: wrap('<p>Loading perspective…</p><p><a href="/duma">Browse the Duma</a></p>'), ttl: 60 };
  const item = publicPerspectives(items).find(i => itemId(i) === id);
  if (!item) return { status: 404, noindex: true, title: 'Perspective not found | The Majorities', description: DEFAULT_DESC, html: wrap('<h1>This perspective isn’t available</h1><p><a href="/duma">Browse the Duma</a></p>'), ttl: 60 };
  const title = item.prompt || 'A perspective from The Majorities';
  const text = item.response || item.reason || item.desc || '';
  const d = itemDate(item);
  const created = item.createdAt ? new Date(item.createdAt) : d;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: clip(title, 110), articleBody: clip(text, 5000),
    author: { '@type': 'Person', name: authorName(item) },
    publisher: { '@id': `${SITE}/#organization` }, mainEntityOfPage: `${SITE}/duma/${id}`,
    ...(created && !Number.isNaN(created.getTime()) ? { datePublished: created.toISOString() } : {}),
    ...(d ? { dateModified: d.toISOString() } : {}),
  };
  const body = `<p style="font-size:13px"><a href="/duma">← The Duma</a></p>
<article><h1 style="font-size:28px;line-height:1.3">${esc(title)}</h1>
<p style="color:#888;font-size:13px">By ${esc(authorName(item))}${created && !Number.isNaN(created.getTime()) ? ` · <time datetime="${created.toISOString()}">${created.toISOString().slice(0, 10)}</time>` : ''}${item.location ? ` · ${esc(item.location)}` : ''}</p>
<div style="font-size:17px;line-height:1.75;white-space:pre-wrap">${esc(text)}</div></article>
<p><a href="/signup">Join The Majorities</a> to vote on perspectives and share your own.</p>`;
  return {
    title: `${clip(title, 60)} | The Majorities`, description: clip(text, 155) || DEFAULT_DESC, canonical: `/duma/${id}`,
    ogType: 'article', html: wrap(body).replace('max-width:1100px', 'max-width:760px'),
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`, ttl: 300,
  };
}

async function staticPage(route, host) {
  const manifest = JSON.parse((await readBuildFile('_prerender/manifest.json', host)) || '{}');
  const file = manifest[route];
  if (!file) return null;
  const raw = await readBuildFile(`_prerender/${file}.json`, host);
  if (!raw) return null;
  const page = JSON.parse(raw);
  const canonical = route === '/termsofservice' ? '/TermsofService' : route;
  return { title: page.title, description: page.description, canonical, html: page.html, ttl: 3600 };
}

const FALLBACK_TITLES = {
  '/': 'The Majorities | Premium Multicultural Personal Care & Community',
  '/about': 'About | The Majorities', '/contact': 'Contact Us | The Majorities', '/privacy': 'Privacy Policy | The Majorities',
  '/termsofservice': 'Terms of Service | The Majorities', '/returns': 'Return Policy | The Majorities',
  '/recommend': 'Recommend a Product | The Majorities', '/partner': 'Partner With Us | The Majorities',
};

function applyHead(shell, page) {
  let html = shell;
  const setMeta = (attr, key, value) => {
    if (value == null) return;
    const re = new RegExp(`(<meta[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`, 'i');
    html = re.test(html) ? html.replace(re, `$1${esc(value)}$2`) : html.replace('</head>', `<meta ${attr}="${key}" content="${esc(value)}" />\n</head>`);
  };
  if (page.title) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  setMeta('name', 'description', page.description);
  setMeta('property', 'og:title', page.title);
  setMeta('property', 'og:description', page.description);
  setMeta('name', 'twitter:title', page.title);
  setMeta('name', 'twitter:description', page.description);
  if (page.ogType) setMeta('property', 'og:type', page.ogType);
  if (page.canonical) {
    const url = `${SITE}${page.canonical === '/' ? '/' : page.canonical}`;
    html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${esc(url)}" />`);
    setMeta('property', 'og:url', url);
  }
  if (page.noindex) {
    html = html.replace(/<link rel="canonical"[^>]*>\s*/i, '');
    html = html.replace('</head>', '<meta name="robots" content="noindex" />\n</head>');
  }
  if (page.extraHead) html = html.replace('</head>', `${page.extraHead}\n</head>`);
  if (page.html) html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${page.html}</div>`);
  return html;
}

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let route = '/';
  try {
    const q = new URL(req.url, 'http://x').searchParams.get('path');
    route = decodeURIComponent(q || '/');
  } catch { /* keep "/" */ }
  route = `/${route.replace(/^\/+/, '')}`.replace(/\/+$/, '') || '/';
  const key = route.toLowerCase();

  const shell = await readBuildFile('app-shell.html', host);
  if (!shell) { res.statusCode = 500; res.end('App shell missing'); return; }

  let page;
  try {
    if (NOINDEX.some(re => re.test(key))) page = { noindex: true, ttl: 3600 };
    else if (key === '/duma' || key === '/legislature') page = await dumaPage({ perspectivesOnly: false });
    else if (key === '/perspectives') page = await dumaPage({ perspectivesOnly: true });
    else if (/^\/duma\/[^/]+$/.test(key)) {
      const id = route.split('/')[2];
      page = isPublicId(id) ? await perspectivePage(id) : { status: 404, noindex: true, ttl: 300 };
    } else {
      page = await staticPage(key, host);
      if (page && !page.title) page.title = FALLBACK_TITLES[key];
      if (!page && FALLBACK_TITLES[key]) page = { title: FALLBACK_TITLES[key], description: DEFAULT_DESC, canonical: key === '/termsofservice' ? '/TermsofService' : key, ttl: 300 };
      if (!page) page = { status: 404, noindex: true, title: 'Page not found | The Majorities', ttl: 300 };
    }
  } catch (err) {
    console.error('[prerender] failed for', route, err);
    page = { ttl: 30 }; // plain shell — the React app still works
  }

  res.statusCode = page.status || 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${page.ttl || 300}, stale-while-revalidate=86400`);
  if (page.noindex) res.setHeader('X-Robots-Tag', 'noindex');
  res.end(applyHead(shell, page));
};

module.exports.applyHead = applyHead; // for tests
