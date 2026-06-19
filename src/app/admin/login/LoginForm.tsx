'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) router.push('/admin');
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <div><label className="label">Username</label><input className="input" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} /></div>
      <div><label className="label">Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button disabled={loading} className="btn btn-primary w-full">{loading ? 'Signing in…' : 'Sign In'}</button>
      <p className="text-xs text-stone-500 text-center pt-2">Default: admin / admin123 — change in .env.local</p>
    </form>
  );
}
