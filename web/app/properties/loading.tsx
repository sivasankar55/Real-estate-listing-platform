export default function LoadingProperties() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-9 w-72 animate-pulse rounded-sm bg-line" />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="aspect-[3/4] animate-pulse rounded-md border border-line bg-surface"
          />
        ))}
      </div>
    </main>
  );
}
