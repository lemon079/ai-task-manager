import NextAuthProvider from "@/components/NextAuthProvider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";

export const metadata = {
  title: "Ai-Task Automation",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {

  // TODO: Fix revalidation after messaging and getting response
  // TODO: create random quote using ai via cron job
  // TODO: make components server side as much as you can
  // TODO: learn langchain memory management.
  // TODO: create agentic workflow using langchain.

  return (
    <html lang="en">
      <body
        className={cn("antialiased", inter.className)}
      >
        <NextAuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
