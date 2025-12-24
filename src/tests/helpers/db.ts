import { prisma } from '../../../src/db/prisma';

export { prisma };

export async function cleanDb() {
  await prisma.observation.deleteMany({});
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
