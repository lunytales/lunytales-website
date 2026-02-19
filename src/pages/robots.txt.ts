import type { APIRoute } from "astro";
import { IS_STAGING } from "../config/site";

const SITEMAP_LINE = "Sitemap: https://lunytales.com/sitemap.xml\n";
const STAGING_ROBOTS = `User-agent: *\nDisallow: /\n${SITEMAP_LINE}`;
const PRODUCTION_ROBOTS = `User-agent: *\nAllow: /\n${SITEMAP_LINE}`;

export const GET: APIRoute = () => {
  const body = IS_STAGING ? STAGING_ROBOTS : PRODUCTION_ROBOTS;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
