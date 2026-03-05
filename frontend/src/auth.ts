import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google" && profile?.email) {
        const usernameBase = (profile.email as string).split("@")[0] ?? "user";
        const normalizedUsername = usernameBase
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "");
        token.username = normalizedUsername;
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
          };
          token.accessToken = backendAuth.accessToken;
          token.refreshToken = backendAuth.refreshToken;
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
      }
      return session;
    },
  },
});
