import { NextResponse } from 'next/server';
import { checkCredentials, signSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = await signSession(username);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
