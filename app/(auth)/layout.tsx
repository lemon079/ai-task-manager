import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export const metadata = {
  title: "NeuraTask - Sign In",
  description: "Login or register to access your AI Automation dashboard.",
  keywords: ["AI Automation", "journal AI", "Login", "Sign In"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Notion-style Top Bar */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-border/40 select-none">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-80"
        >
          <div className="size-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xs">
            N
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            NeuraTask
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[380px] space-y-6">
          {children}
        </div>
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="py-4 text-center text-[11px] text-muted-foreground/60 select-none">
        NeuraTask AI &bull; Intelligent Productivity
      </footer>
    </div>
  );
}
