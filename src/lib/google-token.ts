import "server-only";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type GoogleRefreshResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const EXPIRY_BUFFER_SECONDS = 60;

export async function getValidGoogleAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account) {
    throw new Error("No Google account is connected for this user.");
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const accessTokenStillValid =
    account.accessToken &&
    account.expiresAt &&
    account.expiresAt > nowInSeconds + EXPIRY_BUFFER_SECONDS;

  if (accessTokenStillValid) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    throw new Error(
      "Google access token expired and no refresh token is available.",
    );
  }

  if (!env.googleClientId || !env.googleClientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      refresh_token: account.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const body = (await response.json()) as GoogleRefreshResponse;

  if (!response.ok || !body.access_token) {
    throw new Error(
      body.error_description ||
        body.error ||
        "Failed to refresh Google access token.",
    );
  }

  const expiresAt = body.expires_in
    ? nowInSeconds + body.expires_in
    : account.expiresAt;

  await prisma.account.update({
    where: { id: account.id },
    data: {
      accessToken: body.access_token,
      expiresAt,
      tokenType: body.token_type ?? account.tokenType,
      scope: body.scope ?? account.scope,
      idToken: body.id_token ?? account.idToken,
      refreshToken: account.refreshToken,
    },
  });

  return body.access_token;
}

