import type { APIRoute } from "astro";
import { SITE_ORIGIN } from "../config/site";

const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap-index.xml</loc>
  </sitemap>
</sitemapindex>
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
