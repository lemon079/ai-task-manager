import MobileSidebar from "@/components/MobileSidebar";
import Sidebar from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ModalProvider } from "../context/ModalContext";

export const metadata = {
  title: "AI Automation Dashboard",
  description: "Dashboard for managing and automating AI-driven tasks efficiently",
  keywords: ["AI automation", "workflow", "task management", "productivity", "dashboard"],
  authors: [{ name: "Bilal Tahir" }],
  openGraph: {
    title: "AI Automation Dashboard",
    description: "Dashboard for managing and automating AI-driven tasks efficiently",
    url: "https://yourdomain.com/ai-automation",
    siteName: "AI Automation",
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
    <div className="min-h-screen md:flex bg-muted ">
      <MobileSidebar />       {/* appear only on small screens */}
      <div className="hidden md:flex"> {/* on small screens, hide the actual sidebar */}
        <Sidebar />
      </div>
      <main className={cn("flex-1 w-full max-w-6xl mx-auto")}>
        <ModalProvider>
          {children}
        </ModalProvider>
      </main>
      <Toaster duration={2000} position="bottom-right" richColors />
    </div>
  );
}
