export default function AdminLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-7rem)] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading admin panel"
    >
      <div className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white px-12 py-10 text-center shadow-sm">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-stone-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
          <span className="font-display text-xl font-bold text-stone-800">R</span>
        </div>

        <p className="mt-5 font-display text-xl font-bold text-stone-900">
          Rovin Admin
        </p>
        <p className="mt-1 text-sm text-stone-500">Loading your dashboard...</p>

        <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
