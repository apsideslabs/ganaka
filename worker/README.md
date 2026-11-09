# Place-search Worker

Backs the static site's city search with a full GeoNames populated-places table
in Cloudflare D1, so villages too small for the bundled index are still findable.

## Why this exists

The bundled index (`public/data/cities.json`) is built from GeoNames'
`cities5000`/`cities1000`/`cities500` extracts. Those are filtered by
**population threshold**, so Indian revenue villages — which carry feature code
`PPL` — are not in them at all. Adding `cities500` to the index moved the Indian
count from 7,229 to 7,312, i.e. essentially nothing. The villages only exist in
`allCountries.zip`, which is ~1.5 GB compressed and cannot be shipped to a
browser.

So: keep the fast offline index for towns, and query this Worker for the rest.

## Deploy

```bash
# 1. create the database, note the database_id it prints
npx wrangler d1 create ganaka-places

# 2. put that id into worker/wrangler.toml, then create the tables
npx wrangler d1 execute ganaka-places --remote --file=worker/schema.sql

# 3. get the raw data (1.5 GB) and generate chunked SQL for one country
curl -O https://download.geonames.org/export/dump/allCountries.zip
node worker/import-india.mjs --zip ./allCountries.zip --country IN --out ./sql

# 4. load it (each chunk is its own transaction)
for f in sql/*.sql; do
  npx wrangler d1 execute ganaka-places --remote --file "$f"
done

# 5. deploy the Worker
npx wrangler deploy --config worker/wrangler.toml
```

Then set the site's Worker URL at build time:

```
NEXT_PUBLIC_PLACE_API=https://ganaka-places.<your-subdomain>.workers.dev
```

## API

```
GET /search?q=guw&limit=20&country=IN
```

```json
{
  "query": "guw",
  "count": 2,
  "results": [
    { "name": "Guwahati", "stateOrRegion": "Assam", "country": "India",
      "latitude": 26.1862, "longitude": 91.7362,
      "timezoneName": "Asia/Kolkata", "population": 949000 }
  ]
}
```

Prefix matching is an index range scan on `alias.key`, so it stays fast at
several hundred thousand rows. Alternate names are indexed too, which is how
"Bombay" reaches Mumbai.

## Notes

- Minimum query length is 2 characters; maximum `limit` is 50.
- Responses are `Cache-Control: public, max-age=3600` and CORS-restricted to
  `ALLOWED_ORIGINS`.
- `state` is left `NULL` by the importer because resolving admin1 names for
  every village would need `admin1CodesASCII.txt` joined in; add it if you want
  the state shown.
- Data: GeoNames, CC BY 4.0. Attribution lives in `public/data/CITY-NOTICE.txt`
  and must stay visible on the site.
- The free D1 tier (5 GB storage, 5 M row reads/day) covers this comfortably.
