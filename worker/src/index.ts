/**
 * Gaṇaka place-search Worker.
 *
 * GET /search?q=guw&limit=20&country=IN
 *
 * Backs the static site's city search with a full GeoNames populated-places
 * table in D1, so villages that are too small for the bundled index are still
 * findable. Prefix matching is a pure index range scan on alias.key.
 *
 * Data: GeoNames, CC BY 4.0. See public/data/CITY-NOTICE.txt.
 */

export interface Env {
  DB: D1Database;
  /** Comma-separated origins allowed to call this Worker. */
  ALLOWED_ORIGINS?: string;
}

interface PlaceRow {
  id: number;
  name: string;
  state: string | null;
  country: string;
  lat: number;
  lon: number;
  tz: string | null;
  pop: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_QUERY = 2;

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allow = origin && allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra },
  });
}

/** Range bound: every key starting with `q`, using the index. */
const upperBound = (q: string) => q + '\u{10FFFF}';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(env, origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'GET') {
      return json({ error: 'method not allowed' }, 405, cors);
    }

    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ ok: true, service: 'ganaka-places' }, 200, cors);
    }
    if (url.pathname !== '/search') {
      return json({ error: 'not found' }, 404, cors);
    }

    const raw = (url.searchParams.get('q') || '').trim().toLowerCase();
    if (raw.length < MIN_QUERY) {
      return json({ query: raw, results: [] }, 200, cors);
    }

    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get('limit') || '', 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const country = (url.searchParams.get('country') || '').toUpperCase();

    // Escape LIKE wildcards; we only ever use the range form.
    const q = raw.replace(/[%_]/g, (m) => '\\' + m);
    const lo = q;
    const hi = upperBound(q);

    const sql = `
      SELECT p.id, p.name, p.state, p.country, p.lat, p.lon, p.tz, p.pop
      FROM place p
      WHERE p.id IN (
        SELECT place_id FROM alias WHERE key >= ?1 AND key < ?2
        UNION
        SELECT id FROM place WHERE lower(name) >= ?1 AND lower(name) < ?2
      )
      ${country ? 'AND p.country = ?4' : ''}
      ORDER BY p.pop DESC, p.name ASC
      LIMIT ?3
    `;

    const bindings: unknown[] = country ? [lo, hi, limit, country] : [lo, hi, limit];

    try {
      const { results } = await env.DB.prepare(sql).bind(...bindings).all<PlaceRow>();
      const rows = (results || []).map((r) => ({
        name: r.name,
        stateOrRegion: r.state || undefined,
        country: r.country,
        latitude: r.lat,
        longitude: r.lon,
        timezoneName: r.tz || 'UTC',
        population: r.pop,
      }));
      return json(
        { query: raw, count: rows.length, results: rows },
        200,
        { ...cors, 'Cache-Control': 'public, max-age=3600' }
      );
    } catch (err) {
      return json({ error: 'query failed', detail: String(err) }, 500, cors);
    }
  },
};
