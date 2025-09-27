import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const products = await prisma.product.findMany({
    where: { vendorId: user.vendor?.id },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { vendor: true } });
    if (!user || user.role !== 'VENDOR' || !user.vendor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, description, price, commissionRate, imageUrl } = await req.json();
    if (!name || !price) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        vendorId: user.vendor.id,
        name,
        description,
        price,
        commissionRate: commissionRate ?? 0.10,
        imageUrl,
      }
    });

    return NextResponse.json({ ok: true, product });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}