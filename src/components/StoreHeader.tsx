'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SearchBar from './SearchBar';

export default function StoreHeader({ siteName }: { siteName: string }) {
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]') as { qty: number }[];
        setCount(cart.reduce((s, i) => s + i.qty, 0));
      } catch { setCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart-updated', update);
    };
  }, []);

  const navLinks = (
    <>
      <Link href="/" className="hover:text-brand-600" onClick={() => setMenuOpen(false)}>Home</Link>
      <Link href="/shop" className="hover:text-brand-600" onClick={() => setMenuOpen(false)}>Shop</Link>
      <Link href="/about" className="hover:text-brand-600" onClick={() => setMenuOpen(false)}>About</Link>
      <Link href="/contact" className="hover:text-brand-600" onClick={() => setMenuOpen(false)}>Contact</Link>
    </>
  );

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl sm:text-2xl font-bold text-brand-700 truncate max-w-[55vw] sm:max-w-none">
          {siteName}
        </Link>

        <SearchBar className="hidden md:block w-56 lg:w-64 mx-4" />

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
          {navLinks}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/cart" className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-100" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-md hover:bg-stone-100"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1 text-base font-medium text-stone-700">
          <SearchBar className="mb-2" onNavigate={() => setMenuOpen(false)} />
          <Link href="/" className="py-2 hover:text-brand-600" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/shop" className="py-2 hover:text-brand-600" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/about" className="py-2 hover:text-brand-600" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/contact" className="py-2 hover:text-brand-600" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      )}
    </header>
  );
}
