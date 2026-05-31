import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { accessToken } = (await request.json()) as { accessToken: string };
  const cookieStore = await cookies();

  cookieStore.set('cinema_session', '1', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 h
  });

  // store token in a readable cookie so the client can attach Bearer headers
  cookieStore.set('cinema_access_token', accessToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('cinema_session');
  cookieStore.delete('cinema_access_token');
  return NextResponse.json({ ok: true });
}
