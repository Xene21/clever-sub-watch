import { PrismaClient } from '@prisma/client';

// Shared singleton Prisma client — prevents connection pool exhaustion
// from multiple PrismaClient instances across route files.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
