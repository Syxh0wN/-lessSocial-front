import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

type BackendTokenPayload = {
  exp?: number;
};

function DecodeJwtExpiryMs(tokenValue?: string) {
  if (!tokenValue) {
    return undefined;
  }
  try {
    const payloadPart = tokenValue.split(".")[1];
    if (!payloadPart) {
      return undefined;
    }
    const normalizedPart = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalizedPart, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as BackendTokenPayload;
    if (!payload.exp) {
      return undefined;
    }
    return payload.exp * 1000;
  } catch {
    return undefined;
  }
}

async function RefreshBackendToken(refreshToken: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  }).catch(() => null);
  if (!response?.ok) {
    return null;
  }
  return (await response.json()) as {
    accessToken: string;
    refreshToken: string;
    user?: {
      username?: string;
    };
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user, trigger, session }) {
      if (trigger === "update") {
        const updatedSession = session as
          | { username?: string; needsOnboarding?: boolean }
          | undefined;
        if (typeof updatedSession?.username === "string") {
          token.username = updatedSession.username;
        }
        if (typeof updatedSession?.needsOnboarding === "boolean") {
          token.needsOnboarding = updatedSession.needsOnboarding;
        }
      }
      if (account?.provider === "google" && profile?.email) {
        const usernameBase = (profile.email as string).split("@")[0] ?? "user";
        const normalizedUsername = usernameBase
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "");
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
        const response = await fetch(`${apiBaseUrl}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: profile.email,
            name: user.name ?? normalizedUsername,
            avatarUrl: user.image,
            username: normalizedUsername,
          }),
        }).catch(() => null);
        if (response?.ok) {
          const backendAuth = (await response.json()) as {
            accessToken: string;
            refreshToken: string;
            isNewUser?: boolean;
            user?: {
              username?: string;
            };
          };
          token.accessToken = backendAuth.accessToken;
          token.refreshToken = backendAuth.refreshToken;
          token.username = backendAuth.user?.username ?? normalizedUsername;
          token.needsOnboarding = Boolean(backendAuth.isNewUser);
        } else {
          token.username = normalizedUsername;
        }
      }
      const accessToken = token.accessToken as string | undefined;
      const refreshToken = token.refreshToken as string | undefined;
      if (accessToken && refreshToken) {
        const expiryMs = DecodeJwtExpiryMs(accessToken);
        const shouldRefresh = typeof expiryMs === "number" && Date.now() >= expiryMs - 30_000;
        if (shouldRefresh) {
          const refreshedToken = await RefreshBackendToken(refreshToken);
          if (refreshedToken) {
            token.accessToken = refreshedToken.accessToken;
            token.refreshToken = refreshedToken.refreshToken;
            if (refreshedToken.user?.username) {
              token.username = refreshedToken.user.username;
            }
          } else {
            token.accessToken = undefined;
            token.refreshToken = undefined;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name ?? "";
        (session.user as { username?: string }).username = token.username as
          | string
          | undefined;
        (session.user as { accessToken?: string }).accessToken = token.accessToken as
          | string
          | undefined;
        (session.user as { needsOnboarding?: boolean }).needsOnboarding = Boolean(
          token.needsOnboarding,
        );
      }
      return session;
    },
  },
});
