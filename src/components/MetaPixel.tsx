'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { fbqTrack, mirrorToCapi, newEventId } from '@/lib/pixel';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();

  // Fire PageView on first load AND every client-side route change.
  // Each gets a fresh event_id so the browser pixel and the server CAPI
  // event deduplicate. The inline base code only runs fbq('init') — it no
  // longer auto-fires PageView, so there's no double counting.
  useEffect(() => {
    if (!PIXEL_ID) return;
    const eventId = newEventId('pv');
    fbqTrack('PageView', undefined, { eventID: eventId });
    mirrorToCapi('PageView', eventId);
  }, [pathname]);

  return null;
}
