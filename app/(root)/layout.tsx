import MobileSidebar from "@/components/MobileSidebar";
import Sidebar from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ModalProvider } from "../context/ModalContext";

export const metadata = {
  title: "NeuraTask - AI Task Manager",
  description: "Dashboard for managing and automating AI-driven tasks efficiently",
  keywords: ["AI automation", "journals", "task management", "productivity", "dashboard"],
  authors: [{ name: "Bilal Tahir" }],
  openGraph: {
    title: "NeuraTask - AI Task Manager",
    description: "Dashboard for managing and automating AI-driven tasks efficiently",
    url: "https://yourdomain.com/ai-automation",
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
    <div className="min-h-screen md:flex bg-background">
      <MobileSidebar />
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className={cn("flex-1 w-full overflow-y-auto")}>
        <div className="max-w-7xl mx-auto px-4">
          <ModalProvider>
            {children}
          </ModalProvider>
        </div>
      </main>
      <Toaster duration={2000} position="bottom-right" richColors />
    </div>
  );
}

