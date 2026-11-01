import NextAuthProvider from "@/components/NextAuthProvider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "NeuraTask - AI Task Manager",
  description: "Next-generation intelligent task management and AI automation",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeuraTask",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased min-h-screen bg-background text-foreground font-sans",
          inter.className,
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <QueryProvider>
              <PwaProvider>{children}</PwaProvider>
            </QueryProvider>
          </NextAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
