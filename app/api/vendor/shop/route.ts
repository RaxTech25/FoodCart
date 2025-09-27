import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { vendor: { include: { shop: true } } } });
  if (!user || user.role !== 'VENDOR' || !user.vendor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ shop: user.vendor.shop });
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { vendor: { include: { shop: true } } } });
    if (!user || user.role !== 'VENDOR' || !user.vendor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, address, lat, lng, authorized } = await req.json();
    if (!name || !address) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    if (user.vendor.shop) {
      const shop = await prisma.shop.update({
        where: { id: user.vendor.shop.id },
        data: { name, address, lat: lat ?? user.vendor.shop.lat, lng: lng ?? user.vendor.shop.lng, authorized: !!authorized },
      });
      return NextResponse.json({ ok: true, shop });
    }

    const shop = await prisma.shop.create({
      data: { vendorId: user.vendor.id, name, address, lat: lat ?? 0, lng: lng ?? 0, authorized: !!authorized },
    });
    return NextResponse.json({ ok: true, shop });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}