CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "property_city_trgm"
  ON "Property" USING gin (lower(city) gin_trgm_ops);

CREATE INDEX "property_locality_trgm"
  ON "Property" USING gin (lower(locality) gin_trgm_ops);
