import { db } from '@/lib/db';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';
import ProductCard from '@/components/ProductCard';
import CategoryShowcase from '@/components/CategoryShowcase';
import Link from 'next/link';

export default async function Home() {
  const [content, featured, categoryTiles, cats] = await Promise.all([
    db.getContent(),
    db.featuredProducts(),
    db.listCategoryTiles(),
    db.listProductCategories(),
  ]);
  const catLabel = (slug: string) => cats.find((c) => c.value === slug)?.label || slug;

  return (
    <>
      <StoreHeader siteName={content.siteName} />
      <main className="flex-1">
        <section className="relative w-full">
          <img
            src={content.heroImage || '/hero-banner.jpg'}
            alt={content.heroHeadline || content.siteName}
            className="w-full h-auto block"
          />
          {(content.heroHeadline || content.heroSubheadline) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="text-center px-6">
                {content.heroHeadline && (
                  <h1 className="font-display text-white text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide drop-shadow-lg">
                    {content.heroHeadline}
                  </h1>
                )}
                {content.heroSubheadline && (
                  <p className="mt-3 text-white/95 text-sm sm:text-base md:text-lg tracking-[0.25em] drop-shadow">
                    {content.heroSubheadline}
                  </p>
                )}
              </div>
            </div>
          )}
          {content.heroCtaText && (
            <div className="absolute inset-0 flex items-end justify-center pb-6 sm:pb-10 md:pb-16 pointer-events-none">
              <Link
                href={content.heroCtaLink || '/shop'}
                className="btn btn-primary shadow-lg pointer-events-auto"
              >
                {content.heroCtaText}
              </Link>
            </div>
          )}
        </section>

        <CategoryShowcase tiles={categoryTiles} />

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Bandanas</h2>
              <p className="text-stone-600 mt-1">Hand-picked favourites from our latest collection.</p>
            </div>
            <Link href="/shop" className="text-brand-600 hover:text-brand-700 font-medium hidden sm:inline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} categoryLabel={catLabel(p.category)} />)}
          </div>
        </section>

        <section className="relative bg-stone-900 text-white overflow-hidden">
          <img
            src="https://vf4esyy7o5nz5zo3.public.blob.vercel-storage.com/uploads/1781033272527-vl7m14.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 text-center">
            <h2 className="font-display text-3xl font-bold">{content.tagline}</h2>
            <p className="mt-3 text-stone-300 max-w-xl mx-auto">Premium cotton. Hand-finished edges. Made to last and made to stand out.</p>
            <Link href="/shop" className="btn btn-primary mt-6">Shop Now</Link>
          </div>
        </section>
      </main>
      <StoreFooter siteName={content.siteName} email={content.contactEmail} phone={content.contactPhone} address={content.contactAddress} />
    </>
  );
}
