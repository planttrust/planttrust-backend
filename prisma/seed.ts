import { prisma } from '../src/shared/prisma';
import { seedM1 } from '../src/modules/m1-users/m1.seed';

async function main() {
  // Each module adds its seed step here in Sprint 1, in this order
  // (later modules depend on earlier data):
  //   M1 users → M4 projects → M2 investments → M3 scam typologies → M5 genesis anchor
  await seedM1(prisma);
  console.info('Seed finished.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
