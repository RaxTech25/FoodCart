import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * Secure seed endpoint for production environments where scripts cannot be run.
 * Call with:
 *   POST /api/admin/seed
 *   Headers: x-seed-secret: YOUR_SECRET
 */
export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET || '';
  const header = req.headers.get('x-seed-secret') || '';
  if (!secret || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Admin
    const adminUsername = 'admin';
    const staffUsername = 'staff';

    const adminPassword = 'Admin@123';
    const staffPassword = 'Staff@123';

    const adminPhone = '9000000001';
    const staffPhone = '9000000002';

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const staffHash = await bcrypt.hash(staffPassword, 10);

    const admin = await prisma.user.upsert({
      where: { username: adminUsername },
      update: {},
      create: {
        username: adminUsername,
        passwordHash: adminHash,
        role: 'ADMIN',
        phone: adminPhone,
        email: 'admin@example.com',
        firstLoginOtpRequired: true,
      }
    });

    const staff = await prisma.user.upsert({
      where: { username: staffUsername },
      update: {},
      create: {
        username: staffUsername,
        passwordHash: staffHash,
        role: 'STAFF',
        phone: staffPhone,
        email: 'staff@example.com',
        firstLoginOtpRequired: true,
      }
    });

    return NextResponse.json({ ok: true, adminId: admin.id, staffId: staff.id });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}