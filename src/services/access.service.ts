import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function getAllowedTargetIds(
  userId: string,
  role: UserRole,
): Promise<string[] | null> {
  if (role === UserRole.SUPERADMIN) {
    return null;
  }

  const links = await prisma.userTarget.findMany({
    where: { userId },
    select: { targetId: true },
  });

  return links.map((item) => item.targetId);
}
