import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function cleanDb() {
  await prisma.observation.deleteMany({});
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
