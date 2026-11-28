import { prisma } from '../src/shared/prisma';
import { seedM4 } from '../src/modules/m4-geofencing/m4.seed';
import { seedM3 } from '../src/modules/m3-mcp-ai/m3.seed';

async function main() {
  // Each module adds its seed step here in Sprint 1, in this order
  // (later modules depend on earlier data):
  //   M1 users → M4 projects → M2 investments → M3 scam typologies → M5 genesis anchor
  await seedM4(prisma);
  await seedM3(prisma);
  console.info('Seed finished.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
