// api/sitemap.js — served at /sitemap.xml (see vercel.json). Lists the public
// pages plus every public Duma perspective, pulled live from the backend.
const { SITE, escapeHtml: esc, fetchDuma, itemId, publicPerspectives, itemDate } = require('./_lib/site');

const STATIC = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/duma', changefreq: 'hourly', priority: '0.9' },
  { loc: '/perspectives', changefreq: 'hourly', priority: '0.8' },
  { loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { loc: '/recommend', changefreq: 'weekly', priority: '0.6' },
  { loc: '/partner', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
  { loc: '/returns', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/TermsofService', changefreq: 'yearly', priority: '0.3' },
];

module.exports = async (req, res) => {
  const items = await fetchDuma();
  const urls = STATIC.map(u => ({ ...u }));
  publicPerspectives(items).forEach(item => {
    const d = itemDate(item);
    urls.push({ loc: `/duma/${itemId(item)}`, changefreq: 'weekly', priority: '0.6', lastmod: d ? d.toISOString().slice(0, 10) : undefined });
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${esc(SITE + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${items ? 3600 : 120}, stale-while-revalidate=86400`);
  res.end(xml);
};
