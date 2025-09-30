export const metadata = {
  title: "AI Task Automation - Sign In",
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
  children: React.ReactNode,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50">
      <div className="w-full max-w-md p-4 sm:p-0">{children}</div>
    </main>
  );
}
