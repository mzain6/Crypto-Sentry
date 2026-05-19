import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 12);

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      name: "Test User",
      passwordHash,
      emailVerified: new Date(),
    },
    create: {
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      emailVerified: new Date(),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
