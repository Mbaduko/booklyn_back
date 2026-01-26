import prisma from '../src/lib/prisma';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Prisma connected to the database successfully!');
  } catch (error) {
    console.error('Prisma failed to connect to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();