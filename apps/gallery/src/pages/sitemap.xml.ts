import { canonicalOrigin, generatedDocumentRoutes, productionRoutes } from "../content/site";

const escaped = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function GET() {
  const locations = [
    ...productionRoutes.map((entry) => entry.route),
    ...generatedDocumentRoutes.filter((entry) => entry.indexInSitemap).map((entry) => entry.route),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locations.map((route) => `  <url><loc>${escaped(`${canonicalOrigin}${route}`)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
