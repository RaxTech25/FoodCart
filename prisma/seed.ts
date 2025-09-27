import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Seed Admin and Staff (no registration)
  const adminUsername = 'admin';
  const staffUsername = 'staff';

  const adminPassword = 'Admin@123'; // change later
  const staffPassword = 'Staff@123'; // change later

  const adminPhone = '9000000001';
  const staffPhone = '9000000002';

  const adminHash = await hashPassword(adminPassword);
  const staffHash = await hashPassword(staffPassword);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: adminHash,
      role: Role.ADMIN,
      phone: adminPhone,
      email: 'admin@example.com',
      firstLoginOtpRequired: true,
    }
  });

  await prisma.user.upsert({
    where: { username: staffUsername },
    update: {},
    create: {
      username: staffUsername,
      passwordHash: staffHash,
      role: Role.STAFF,
      phone: staffPhone,
      email: 'staff@example.com',
      firstLoginOtpRequired: true,
    }
  });

  console.log('Seeded Admin and Staff users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });