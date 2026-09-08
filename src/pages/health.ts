import type { APIRoute } from 'astro';

/*
  Deliberately does not touch the database. Railway health-checks the service before the
  first `db:push` has run, so a check that queried Postgres would fail the very first
  deploy and roll it back before you could migrate.
*/
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ status: 'ok', uptime: Math.round(process.uptime()) }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
