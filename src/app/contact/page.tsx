import { db } from '@/lib/db';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';

export default async function Contact() {
  const c = await db.getContent();
  return (
    <>
      <StoreHeader siteName={c.siteName} />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
        <h1 className="font-display text-4xl font-bold">Get in touch</h1>
        <p className="mt-3 text-stone-600">We'd love to hear from you. Reach out via any of the channels below.</p>
        <div className="mt-8 space-y-3 text-stone-800">
          <div><span className="font-semibold">Phone:</span> {c.contactPhone}</div>
          <div><span className="font-semibold">Address:</span> {c.contactAddress}</div>
        </div>
      </main>
      <StoreFooter siteName={c.siteName} email={c.contactEmail} phone={c.contactPhone} address={c.contactAddress} />
    </>
  );
}
