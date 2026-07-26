import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type DatabaseHealthChecker = () => Promise<void>;

export async function checkDatabaseHealth(): Promise<void> {
  await prisma.$queryRaw(Prisma.sql`SELECT 1`);
}
