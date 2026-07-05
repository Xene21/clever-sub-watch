const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ADD COLUMN "plaidItemId" TEXT;');
  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;');
  console.log('Migration done!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
