'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({
  defaultValue = '',
  className = '',
  onNavigate,
}: {
  defaultValue?: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    onNavigate?.();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop');
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`} role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search bandanas…"
        aria-label="Search bandanas"
        className="w-full pl-9 pr-3 py-2 rounded-md border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    </form>
  );
}
