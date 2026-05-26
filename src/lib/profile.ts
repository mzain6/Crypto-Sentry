import bcrypt from "bcryptjs";
import { AlertStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 8;

export type ProfileSummary = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  hasPassword: boolean;
  createdAt: string;
  watchlistCount: number;
  activeAlertCount: number;
  daysSinceJoining: number;
};

export type PasswordStrengthResult = {
  valid: boolean;
  message: string;
};

export function validatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: "Password must be at least 8 characters.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must include an uppercase letter.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must include a lowercase letter.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must include a number.",
    };
  }

  return {
    valid: true,
    message: "Password strength accepted.",
  };
}

export async function getProfileSummary(
  userId: string,
): Promise<ProfileSummary | null> {
  const [user, watchlistCount, activeAlertCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        email: true,
        id: true,
        imageUrl: true,
        name: true,
        passwordHash: true,
      },
    }),
    prisma.watchlist.count({ where: { userId } }),
    prisma.alert.count({
      where: {
        userId,
        status: AlertStatus.ACTIVE,
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const joinedAt = user.createdAt.getTime();
  const daysSinceJoining = Math.max(
    0,
    Math.floor((Date.now() - joinedAt) / (24 * 60 * 60 * 1000)),
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt.toISOString(),
    watchlistCount,
    activeAlertCount,
    daysSinceJoining,
  };
}

export async function updateProfileName(userId: string, name: string) {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  if (trimmedName.length > 80) {
    throw new Error("Name must be 80 characters or fewer.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name: trimmedName },
    select: {
      email: true,
      id: true,
      imageUrl: true,
      name: true,
    },
  });
}
export async function updateProfileImage(userId: string, imageUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { imageUrl },
    select: {
      email: true,
      id: true,
      imageUrl: true,
      name: true,
    },
  });
}

export async function changeUserPassword({
  currentPassword,
  newPassword,
  userId,
}: {
  currentPassword: string;
  newPassword: string;
  userId: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    throw new Error(
      "This account does not have a local password yet. Use password setup first.",
    );
  }

  const currentPasswordMatches = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    throw new Error("Current password is incorrect.");
  }

  const strength = validatePasswordStrength(newPassword);

  if (!strength.valid) {
    throw new Error(strength.message);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      sessionVersion: {
        increment: 1,
      },
    },
  });
}
