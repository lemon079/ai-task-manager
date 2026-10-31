import Sidebar from "@/components/shared/Sidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ModalProvider } from "../context/ModalContext";

export const metadata = {
  title: "NeuraTask - AI Task Manager",
  description: "Intelligent workspace for managing and automating tasks with conversational AI",
  keywords: ["AI automation", "task management", "productivity", "dashboard", "smart calendar"],
  authors: [{ name: "Bilal Tahir" }],
  openGraph: {
    title: "NeuraTask - AI Task Manager",
    description: "Intelligent workspace for managing and automating tasks with conversational AI",
    url: "https://dev-ai-task-manager-112.vercel.app",
    siteName: "NeuraTask",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ModalProvider>
          <DashboardHeader />
          <main className={cn("flex-1 w-full overflow-y-auto")}>
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
              {children}
            </div>
          </main>
        </ModalProvider>
      </div>

      <Toaster duration={2500} position="bottom-right" richColors />
    </div>
  );
}
