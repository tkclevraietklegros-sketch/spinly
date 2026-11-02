import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
export async function POST(req: NextRequest) {
  const attendu = process.env.SPINLY_ADMIN_PASSWORD;
  if (!attendu) return NextResponse.json({ succes: false }, { status: 500 });
  const { motDePasse } = await req.json();
  const a = Buffer.from(typeof motDePasse === 'string' ? motDePasse : '');
  const b = Buffer.from(attendu);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) {
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json({ succes: false });
  }
  return NextResponse.json({ succes: true });
}
