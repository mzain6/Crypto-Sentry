import { createHash, randomBytes } from "crypto";

export function createResetToken() {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashResetToken(token),
  };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

