import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'ADMIN', description: 'Full access' },
    { name: 'EMPLEADO', description: 'Employee — QR scanner and reschedule' },
    { name: 'CLIENTE', description: 'Customer' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Roles seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
