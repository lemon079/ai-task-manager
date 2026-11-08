import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma/prisma";
import bcrypt from "bcrypt";
import { getAuthSecret, resolveApiKey } from "@/lib/api-keys";

const googleClientId = resolveApiKey(["GOOGLE_CLIENT_ID"]);
const googleClientSecret = resolveApiKey(["GOOGLE_CLIENT_SECRET"]);

/**
 * NextAuth v5 (Auth.js) Configuration
 * @see https://authjs.dev/getting-started/migrating-to-v5
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.hashedPassword);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign-in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      // Attach DB id
      if (user) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email!,
              image: user.image,
            },
          });
        }
        token.id = dbUser.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { accessToken?: string }).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
