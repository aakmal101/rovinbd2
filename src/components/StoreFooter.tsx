import Link from 'next/link';

export default function StoreFooter({
  siteName, email, phone, address,
}: { siteName: string; email: string; phone: string; address: string }) {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-display text-xl font-bold text-brand-700 mb-2">{siteName}</div>
          <p className="text-stone-600">Handcrafted bandanas, made for the bold.</p>
          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://www.facebook.com/Rovin2thestreets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rovin. on Facebook"
              className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 hover:bg-brand-600 hover:text-white flex items-center justify-center transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/rovin.street"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rovin. on Instagram"
              className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 hover:bg-brand-600 hover:text-white flex items-center justify-center transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Shop</div>
          <ul className="space-y-1 text-stone-600">
            <li><Link href="/shop" className="hover:text-brand-600">All Bandanas</Link></li>
            <li><Link href="/categories" className="hover:text-brand-600">Categories</Link></li>
            <li><Link href="/about" className="hover:text-brand-600">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-brand-600">Admin</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <ul className="space-y-1 text-stone-600">
            <li>{phone}</li>
            <li>{address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {siteName.replace(/\.$/, '')} · All rights reserved.
      </div>
    </footer>
  );
}
