import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const users: SeedUser[] = [
    {
      email: 'admin@tms.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
    {
      email: 'user@tms.com',
      password: await bcrypt.hash('User@123', 10),
      name: 'Normal User',
      role: UserRole.USER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✅ Seeded: ${user.email} / ${user.role}`);
  }

  console.log('\n Credentials:');
  console.log('   admin@tms.com  →  Admin@123');
  console.log('   user@tms.com   →  User@123');

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
