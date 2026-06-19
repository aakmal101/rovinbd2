'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <button onClick={logout} className="w-full text-left px-3 py-2 rounded text-sm text-stone-300 hover:bg-stone-800">
      Sign out
    </button>
  );
}
