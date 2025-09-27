import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const type = String(form.get('type'));
    const id = Number(form.get('id'));
    const reason = String(form.get('reason') || '');
    if (!type || !id || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    if (type === 'vendor') {
      const v = await prisma.vendorProfile.update({
        where: { id },
        data: { approvalStatus: 'REJECTED', rejectionReason: reason },
      });
      await prisma.notification.create({
        data: { userId: v.userId, type: 'REJECTION', content: `Vendor rejected: ${reason}` }
      });
      return NextResponse.redirect(new URL('/staff', req.url));
    }

    if (type === 'partner') {
      const p = await prisma.partnerProfile.update({
        where: { id },
        data: { approvalStatus: 'REJECTED', rejectionReason: reason },
      });
      await prisma.notification.create({
        data: { userId: p.userId, type: 'REJECTION', content: `Partner rejected: ${reason}` }
      });
      return NextResponse.redirect(new URL('/staff', req.url));
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}