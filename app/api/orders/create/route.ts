import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

type ItemInput = { productId: number; quantity: number; cutlery?: boolean };

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { customer: true } });
    if (!user || user.role !== 'CUSTOMER' || !user.customer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { items, address } = await req.json() as { items: ItemInput[]; address: string };
    if (!items || items.length === 0) return NextResponse.json({ error: 'No items' }, { status: 400 });

    // Load products and compute totals
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true }, include: { vendor: true } });
    if (products.length !== items.length) return NextResponse.json({ error: 'Invalid items' }, { status: 400 });

    // Assume all items from the same vendor for MVP (pick vendor of first product)
    const vendorId = products[0].vendorId;

    let subtotal = 0;
    let adminCommission = 0;
    let vendorEarning = 0;
    let partnerEarning = 0;

    const orderItemsData = items.map(i => {
      const p = products.find(pp => pp.id === i.productId)!;
      const base = Number(p.price) * i.quantity;
      const cutleryCost = i.cutlery ? 10 * i.quantity : 0; // simple cutlery cost, excluded from commission
      const commission = base * p.commissionRate;
      subtotal += base + cutleryCost;
      adminCommission += commission;
      vendorEarning += base - commission + cutleryCost;
      return {
        productId: i.productId,
        quantity: i.quantity,
        cutlery: !!i.cutlery,
        extrasJson: cutleryCost ? JSON.stringify({ cutleryCost }) : null
      };
    });

    const platformFee = 10; // configurable later
    const deliveryFee = 30; // configurable/distance-based later
    partnerEarning += deliveryFee;

    const total = subtotal + platformFee + deliveryFee;
    const adminEarning = adminCommission + platformFee;

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        customerId: user.customer.id,
        vendorId,
        status: 'PENDING',
        platformFee,
        deliveryFee,
        subtotal,
        total,
        vendorEarning,
        partnerEarning,
        adminEarning,
        expiresAt,
        items: { create: orderItemsData },
      }
    });

    // Notify stubs
    await prisma.notification.create({ data: { userId, type: 'ORDER', content: `Order ${order.id} created.` } });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}