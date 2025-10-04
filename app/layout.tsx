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

  return (
    // <html lang="en" className={inter.variable}>
    <html lang="en">
      <body
        className={cn("antialiased", inter.className)}
        // className={cn("antialiased")}
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
