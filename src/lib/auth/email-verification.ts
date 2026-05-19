import { createEmailVerificationToken, hashResetToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

function buildEmailVerificationUrl(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return `${baseUrl}/verify-email?token=${token}`;
}

export async function createAndSendEmailVerification({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) {
  const { token, tokenHash } = createEmailVerificationToken();
  const emailVerificationExpiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000,
  );
  const verificationUrl = buildEmailVerificationUrl(token);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt,
    },
  });

  await sendVerificationEmail({
    to: email,
    name,
    verificationUrl,
  });
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashResetToken(token);
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
  });

  return true;
}
