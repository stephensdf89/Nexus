export const ACCESS_TOKEN_COOKIE = "sb-access-token";
export const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function setAuthCookies(tokens: AuthTokens, remember: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  const cookieBase = "path=/; samesite=lax";
  const persistent = remember ? "; max-age=2592000" : "";

  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(tokens.accessToken)}; ${cookieBase}${persistent}`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(tokens.refreshToken)}; ${cookieBase}${persistent}`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getFacebookAuthConfig() {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export async function getCurrentUser() {
  if (typeof window !== "undefined") {
    return null;
  }

  const { getCurrentUser: getServerCurrentUser } = await import("@/src/lib/auth-server");
  return getServerCurrentUser();
}