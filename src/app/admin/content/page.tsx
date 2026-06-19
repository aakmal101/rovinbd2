import { db } from '@/lib/db';
import ContentForm from './ContentForm';

export default async function ContentPage() {
  const content = await db.getContent();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Site Content</h1>
      <p className="text-stone-600 mt-1">Edit the hero banner, site info, about page, contact details, and shipping rules.</p>
      <div className="mt-6 max-w-3xl"><ContentForm initial={content} /></div>
    </div>
  );
}
