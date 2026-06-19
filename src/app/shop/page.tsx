import { db } from '@/lib/db';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';
import ProductCard from '@/components/ProductCard';
import PixelEvent from '@/components/PixelEvent';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await searchParams;
  const [content, all, cats] = await Promise.all([db.getContent(), db.listProducts(), db.listProductCategories()]);
  const catLabel = (slug: string) => cats.find((c) => c.value === slug)?.label || slug;
  const activeCat = cat?.toLowerCase();
  const query = (q || '').trim();
  const ql = query.toLowerCase();

  let products = activeCat ? all.filter((p) => p.category.toLowerCase() === activeCat) : all;
  if (ql) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        p.description.toLowerCase().includes(ql) ||
        p.category.toLowerCase().includes(ql),
    );
  }
  const activeLabel = activeCat ? catLabel(activeCat) : undefined;

  return (
    <>
      <StoreHeader siteName={content.siteName} />

      {query && (
        <PixelEvent
          key={`search-${query}`}
          event="Search"
          mirror
          params={{ search_string: query, content_type: 'product' }}
          gaEvent="search"
          gaParams={{ search_term: query }}
        />
      )}
      {!query && activeCat && (
        <PixelEvent
          key={`cat-${activeCat}`}
          event="ViewCategory"
          custom
          mirror
          params={{
            content_category: activeLabel || activeCat,
            content_ids: products.map((p) => p.id),
            content_type: 'product',
          }}
          gaEvent="view_item_list"
          gaParams={{
            item_list_id: activeCat,
            item_list_name: activeLabel || activeCat,
            items: products.map((p, i) => ({
              item_id: p.id,
              item_name: p.name,
              item_category: p.category,
              price: p.price,
              index: i,
            })),
          }}
        />
      )}

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <h1 className="font-display text-3xl font-bold">
          {query ? `Search: "${query}"` : activeLabel ? `${activeLabel} Bandanas` : 'All Bandanas'}
        </h1>
        <p className="text-stone-600 mt-1">{products.length} products</p>

        <div className="mt-5 max-w-md">
          <SearchBar defaultValue={query} />
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <Link
            href="/shop"
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              !activeCat ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
            }`}
          >
            All
          </Link>
          {cats.map((c) => (
            <Link
              key={c.value}
              href={`/shop?cat=${c.value}`}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                activeCat === c.value
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          {products.map((p) => <ProductCard key={p.id} product={p} categoryLabel={catLabel(p.category)} />)}
        </div>
        {products.length === 0 && (
          <div className="text-center text-stone-500 py-20">
            {query ? `No bandanas match "${query}".` : 'No products in this category yet.'}
          </div>
        )}
      </main>
      <StoreFooter siteName={content.siteName} email={content.contactEmail} phone={content.contactPhone} address={content.contactAddress} />
    </>
  );
}
