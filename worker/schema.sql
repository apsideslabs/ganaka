-- Cloudflare D1 schema for village-level place search.
-- Apply with:  wrangler d1 execute ganaka-places --remote --file=worker/schema.sql

DROP TABLE IF EXISTS alias;
DROP TABLE IF EXISTS place;

CREATE TABLE place (
  id      INTEGER PRIMARY KEY,   -- GeoNames geonameid
  name    TEXT    NOT NULL,      -- display name
  state   TEXT,                  -- admin1 name
  country TEXT    NOT NULL,
  lat     REAL    NOT NULL,
  lon     REAL    NOT NULL,
  tz      TEXT,                  -- IANA zone
  pop     INTEGER NOT NULL DEFAULT 0
);

-- Every searchable key for a place: primary name, ascii name, and each
-- alternate name, all lowercased. One row per key keeps prefix lookup a pure
-- index range scan.
CREATE TABLE alias (
  key      TEXT    NOT NULL,
  place_id INTEGER NOT NULL,
  FOREIGN KEY (place_id) REFERENCES place(id)
);

CREATE INDEX idx_alias_key ON alias(key);
CREATE INDEX idx_place_pop ON place(pop DESC);
