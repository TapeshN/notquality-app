import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // PKCE cookies can fail to round-trip locally (decode errors in logs). GitHub OAuth
      // apps support plain authorization_code + client_secret without PKCE.
      checks: ["state"],
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.login || !profile?.email) return false;

      await prisma.platformUser.upsert({
        where: { githubId: String(profile.id) },
        update: {
          email: profile.email as string,
          username: profile.login as string,
          avatarUrl: (profile.avatar_url as string) ?? null,
        },
        create: {
          githubId: String(profile.id),
          email: profile.email as string,
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
