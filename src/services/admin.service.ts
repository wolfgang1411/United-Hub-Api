import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function linkTargetToUser(userId: string, targetId: string) {
  return prisma.userTarget.upsert({
    where: {
      userId_targetId: {
        userId,
        targetId,
      },
    },
    update: {},
    create: {
      userId,
      targetId,
    },
  });
}

export async function unlinkTargetFromUser(userId: string, targetId: string) {
  return prisma.userTarget.delete({
    where: {
      userId_targetId: {
        userId,
        targetId,
      },
    },
  });
}
