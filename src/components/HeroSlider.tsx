'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Banner, SiteContent } from '@/lib/db';

type Props = {
  slides: Banner[];
  content: Pick<SiteContent, 'heroImage' | 'heroHeadline' | 'heroSubheadline' | 'heroCtaText' | 'heroCtaLink'>;
};

export default function HeroSlider({ slides, content }: Props) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  // If no banners, fall back to the static hero image from site content
  const hasSlides = slides.length > 0;

  const goTo = useCallback((next: number) => {
    if (next === idx) return;
    setFading(true);
    setTimeout(() => {
      setIdx(next);
      setFading(false);
    }, 300);
  }, [idx]);

  const prev = () => goTo((idx - 1 + slides.length) % slides.length);
  const next = () => goTo((idx + 1) % slides.length);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!hasSlides || slides.length < 2) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % slides.length);
        setFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(t);
  }, [slides.length, hasSlides]);

  if (!hasSlides) {
    // Static fallback
    return (
      <section className="relative w-full">
        <img src={content.heroImage || '/hero-banner.jpg'} alt={content.heroHeadline || 'Hero'} className="w-full h-auto block" />
        {(content.heroHeadline || content.heroSubheadline) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <div className="text-center px-6">
              {content.heroHeadline && <h1 className="font-display text-white text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide drop-shadow-lg">{content.heroHeadline}</h1>}
              {content.heroSubheadline && <p className="mt-3 text-white/95 text-sm sm:text-base md:text-lg tracking-[0.25em] drop-shadow">{content.heroSubheadline}</p>}
            </div>
          </div>
        )}
        {content.heroCtaText && (
          <div className="absolute inset-0 flex items-end justify-center pb-6 sm:pb-10 md:pb-16 pointer-events-none">
            <Link href={content.heroCtaLink || '/shop'} className="btn btn-primary shadow-lg pointer-events-auto">{content.heroCtaText}</Link>
          </div>
        )}
      </section>
    );
  }

  const slide = slides[idx];

  return (
    <section className="relative w-full overflow-hidden select-none">
      {/* Slide image */}
      <div className={`transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={slide.image || content.heroImage || '/hero-banner.jpg'}
          alt={slide.title || 'Hero'}
          className="w-full h-auto block"
        />
      </div>

      {/* Text overlay */}
      {(slide.title || slide.subtitle) && (
        <div className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="text-center px-6">
            {slide.title && <h1 className="font-display text-white text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide drop-shadow-lg">{slide.title}</h1>}
            {slide.subtitle && <p className="mt-3 text-white/95 text-sm sm:text-base md:text-lg tracking-[0.25em] drop-shadow">{slide.subtitle}</p>}
          </div>
        </div>
      )}

      {/* CTA */}
      {slide.ctaText && (
        <div className="absolute inset-0 flex items-end justify-center pb-6 sm:pb-10 md:pb-16 pointer-events-none">
          <Link href={slide.ctaLink || '/shop'} className="btn btn-primary shadow-lg pointer-events-auto">{slide.ctaText}</Link>
        </div>
      )}

      {/* Prev / Next arrows — only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
            aria-label="Next slide"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
