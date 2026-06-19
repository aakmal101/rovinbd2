import { db } from '@/lib/db';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';

export default async function About() {
  const c = await db.getContent();
  return (
    <>
      <StoreHeader siteName={c.siteName} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <h1 className="font-display text-4xl font-bold">{c.aboutTitle}</h1>
        <div className="mt-6 text-stone-700 leading-relaxed whitespace-pre-wrap">{c.aboutBody}</div>
      </main>
      <StoreFooter siteName={c.siteName} email={c.contactEmail} phone={c.contactPhone} address={c.contactAddress} />
    </>
  );
}
