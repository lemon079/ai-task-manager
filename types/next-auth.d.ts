import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }

  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    accessToken?: string;
  }
}
