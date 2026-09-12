export default function StoreLoading() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf3] px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading Rovin"
    >
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-7 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-brand-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600 border-r-brand-600" />
          <span className="font-display text-3xl font-bold text-brand-700">R</span>
        </div>

        <p className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Rovin.
        </p>
        <p className="mt-2 text-sm tracking-[0.2em] text-stone-500 uppercase">
          Made for every adventure
        </p>

        <div className="mt-7 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:300ms]" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </main>
  );
}
