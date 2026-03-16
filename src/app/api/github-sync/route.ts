import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch(
    'https://api.github.com/repos/Ryansdee/woppy/commits/master',
    { headers: { Accept: 'application/vnd.github.v3+json' }, next: { revalidate: 60 } }
  );
  if (!res.ok) return NextResponse.json({ error: res.status }, { status: res.status });
  return NextResponse.json(await res.json());
}