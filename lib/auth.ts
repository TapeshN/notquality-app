import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/db";

const isProd = process.env.NODE_ENV === "production";

function githubContactEmail(profile: {
  id: string | number;
  login: string;
  email?: string | null;
}) {
  const trimmed =
    typeof profile.email === "string" ? profile.email.trim() : "";
  if (trimmed) return trimmed;
  return `${String(profile.id)}+${profile.login}@users.noreply.github.com`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Avoid __Secure- / Secure cookies on http://localhost (fixes JWE check cookies not round-tripping).
  useSecureCookies: isProd,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Encrypted state/PKCE cookies often fail to decode in local dev (Turbopack / host / cookie edge cases).
      // GitHub OAuth apps with a client secret can use authorization_code without these checks.
      // Production keeps `state` for CSRF protection.
      checks: isProd ? ["state"] : [],
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (
        !profile?.login ||
        profile.id === undefined ||
        profile.id === null
      ) {
        return false;
      }

      const email = githubContactEmail(
        profile as { id: string | number; login: string; email?: string | null },
      );

      await prisma.platformUser.upsert({
        where: { githubId: String(profile.id) },
        update: {
          email,
          username: profile.login as string,
          avatarUrl: (profile.avatar_url as string) ?? null,
        },
        create: {
          githubId: String(profile.id),
          email,
          username: profile.login as string,
          avatarUrl: (profile.avatar_url as string) ?? null,
        },
      });

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const platformUser = await prisma.platformUser.findUnique({
          where: { githubId: token.sub },
        });
        if (platformUser) {
          session.user.id = platformUser.id;
          session.user.username = platformUser.username;
        }
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.sub = String(profile.id);
      }
      return token;
    },
  },
});
