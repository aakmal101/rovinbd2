'use client';
import { useEffect, useRef } from 'react';
import { fbqTrack, fbqTrackCustom, mirrorToCapi, newEventId } from '@/lib/pixel';
import { gtagEvent } from '@/lib/gtag';

// Fires a Meta Pixel event (and optional GA4 event) once when this component mounts.
// Use for server-rendered pages (ViewContent, ViewCategory, etc).
// When `mirror` is true, the same event is also sent to the Conversions API
// server-side with a matching event_id for deduplication + iOS recovery.
export default function PixelEvent({
  event,
  params,
  custom = false,
  mirror = false,
  gaEvent,
  gaParams,
}: {
  event: string;
  params?: Record<string, unknown>;
  custom?: boolean;
  mirror?: boolean;
  gaEvent?: string;
  gaParams?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (mirror) {
      const eventId = newEventId('pe');
      if (custom) fbqTrackCustom(event, params, { eventID: eventId });
      else fbqTrack(event, params, { eventID: eventId });
      mirrorToCapi(event, eventId, params);
    } else if (custom) {
      fbqTrackCustom(event, params);
    } else {
      fbqTrack(event, params);
    }
    if (gaEvent) gtagEvent(gaEvent, gaParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
