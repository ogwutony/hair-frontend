// api/sitemap.js — served at /sitemap.xml (see vercel.json). Lists the public
// pages plus every public Duma perspective, pulled live from the backend.
const { SITE, escapeHtml: esc, fetchDuma, sitemapUrls } = require('./_lib/site');

module.exports = async (req, res) => {
  const items = await fetchDuma();
  const urls = sitemapUrls(items);
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
