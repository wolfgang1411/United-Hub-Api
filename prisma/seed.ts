import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { env } from "../src/config/env";
import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash(env.seedSuperadminPassword, 10);

  const superadmin = await prisma.user.upsert({
    where: { email: env.seedSuperadminEmail },
    update: {
      passwordHash,
      role: UserRole.SUPERADMIN,
    },
    create: {
      email: env.seedSuperadminEmail,
      passwordHash,
      role: UserRole.SUPERADMIN,
      name: "Super Admin",
    },
  });

  console.log(`Superadmin ready: ${superadmin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
