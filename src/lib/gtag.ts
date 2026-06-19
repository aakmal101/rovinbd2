// Client-side Google Analytics 4 helper. Safe no-op if gtag isn't loaded.
type GtagParams = Record<string, unknown>;

export function gtagEvent(name: string, params?: GtagParams) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (!w.gtag) return;
  w.gtag('event', name, params || {});
}

export const GA_CURRENCY = 'BDT';
