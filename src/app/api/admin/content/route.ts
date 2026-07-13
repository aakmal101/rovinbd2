import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const updated = await db.updateContent({
    siteName: body.siteName, tagline: body.tagline,
    aboutTitle: body.aboutTitle, aboutBody: body.aboutBody,
    contactEmail: body.contactEmail, contactPhone: body.contactPhone, contactAddress: body.contactAddress,
    shippingFee: Number(body.shippingFee) || 0, freeShippingOver: Number(body.freeShippingOver) || 0,
    heroImage: body.heroImage || '/hero-banner.jpg',
    heroHeadline: body.heroHeadline ?? '',
    heroSubheadline: body.heroSubheadline ?? '',
    heroCtaText: body.heroCtaText ?? '',
    heroCtaLink: body.heroCtaLink || '/shop',
    returnFee: Number(body.returnFee) || 0,
  });
  return NextResponse.json(updated);
}
