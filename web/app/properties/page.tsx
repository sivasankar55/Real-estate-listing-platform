import { LoadMoreProperties } from "@/components/load-more-properties";
import { Navbar } from "@/components/navbar";
import { SearchFilters } from "@/components/search-filters";
import { getProperties } from "@/lib/api";

type PropertiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const allowedParams = new Set([
  "q",
  "city",
  "type",
  "listingType",
  "minPrice",
  "maxPrice",
  "bedrooms",
  "sort",
  "cursor",
]);

function makeSearch(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (allowedParams.has(key) && typeof value === "string" && value)
      query.set(key, value);
  return query.toString();
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const params = await searchParams;
  const search = makeSearch(params);
  const properties = await getProperties(search);
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">
              Find your next property
            </h1>
            <p className="mt-2 text-muted">
              Search homes, plots, and commercial spaces posted directly by
              owners.
            </p>
          </div>
          <form action="/properties" className="flex w-full gap-2 lg:w-auto">
            <label className="sr-only" htmlFor="query">
              City or locality
            </label>
            <input
              id="query"
              name="q"
              defaultValue={typeof params.q === "string" ? params.q : ""}
              placeholder="Search city or locality"
              className="min-h-11 w-full rounded-sm border border-line bg-surface px-3 text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand lg:w-72"
            />
            <button className="min-h-11 rounded-sm bg-brand px-4 font-semibold text-white hover:bg-brand-hover">
              Search
            </button>
          </form>
        </div>
        <SearchFilters values={params} />
        {properties.data.length ? (
          <LoadMoreProperties
            initial={properties.data}
            nextCursor={properties.nextCursor}
            search={search}
          />
        ) : (
          <section className="rounded-md border border-line bg-surface p-6 text-center">
            <h2 className="text-lg font-semibold text-ink">
              No properties match these filters.
            </h2>
            <p className="mt-2 text-muted">
              Try widening your search or clearing your filters.
            </p>
          </section>
        )}
      </main>
    </>
  );
}
