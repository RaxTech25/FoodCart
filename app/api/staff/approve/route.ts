import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { hashPassword } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const type = String(form.get('type'));
    const id = Number(form.get('id'));
    if (!type || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    if (type === 'vendor') {
      const vendor = await prisma.vendorProfile.update({
        where: { id },
        data: { approvalStatus: 'APPROVED', rejectionReason: null },
        include: { user: true }
      });

      const vendorId = `VND-${vendor.id}`;
      const newPasswordHash = await hashPassword(vendor.user.phone); // mobile as password

      await prisma.user.update({
        where: { id: vendor.userId },
        data: {
          username: vendorId,
          passwordHash: newPasswordHash,
        }
      });

      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          type: 'APPROVAL',
          content: `Vendor approved. Username: ${vendorId}, Password: Your mobile number.`
        }
      });

      return NextResponse.redirect(new URL('/staff', req.url));
    }

    if (type === 'partner') {
      const partner = await prisma.partnerProfile.update({
        where: { id },
        data: { approvalStatus: 'APPROVED', rejectionReason: null, kitShipped: true },
        include: { user: true }
      });

      const partnerId = `PTR-${partner.id}`;
      const newPasswordHash = await hashPassword(partner.user.phone);

      await prisma.user.update({
        where: { id: partner.userId },
        data: {
          username: partnerId,
          passwordHash: newPasswordHash,
        }
      });

      await prisma.notification.create({
        data: {
          userId: partner.userId,
          type: 'APPROVAL',
          content: `Partner approved. Username: ${partnerId}, Password: Your mobile number. Kit has been shipped.`
        }
      });

      return NextResponse.redirect(new URL('/staff', req.url));
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}