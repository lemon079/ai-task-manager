import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma/prisma";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            // "https://www.googleapis.com/auth/calendar", // for read/write
            //"https://www.googleapis.com/auth/calendar.readonly", read-only
          ].join(" "),
          // access_type: "offline", // needed to get refresh token
          // prompt: "consent", // forces consent screen so refresh token is granted
        },
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {

        const { host } = new URL(url);

        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #0a84ff;">AI Task Manager</h2>
          <p>Click the button below to sign in:</p>
          <a href="${url}" 
             style="display:inline-block;padding:10px 20px;background-color:#0a84ff;color:white;text-decoration:none;border-radius:6px;">
             Sign in
          </a>
          <p style="margin-top:20px;font-size:0.9rem;color:#555;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color:#0a84ff;font-size:0.85rem;">${url}</p>
          <hr style="margin:20px 0;opacity:0.3;" />
          <p style="font-size:0.8rem;color:#888;">Sent by AI Task Manager · ${host}</p>
        </div>
      `,
        };

        const result = await transport.sendMail(mailOptions);

        if (result.rejected.length) {
          throw new Error(`Email(s) rejected: ${result.rejected.join(", ")}`);
        }
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
        token.refreshToken = account.refresh_token; // optional, needed for offline access
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
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // required in production
  session: { strategy: "jwt" },
} satisfies NextAuthOptions;

// Helper function so you can call auth() anywhere in server apis, components without having to pass authConfig each time
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authConfig);
}
