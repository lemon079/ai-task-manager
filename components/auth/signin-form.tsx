import Link from "next/link";
import { cn } from "@/lib/utils";
import { SigninFormClient } from "./SigninFormClient";

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full space-y-6", className)} {...props}>
      {/* Notion-style Header */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Log in
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Think it. Plan it. Build it with your AI workspace.
        </p>
      </div>

      <SigninFormClient />

      {/* Switch to Signup */}
      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Sign up
        </Link>
      </div>

      {/* Terms Disclaimer */}
      <p className="text-[11px] leading-relaxed text-muted-foreground/60 text-center px-4">
        By continuing, you acknowledge that you understand and agree to the Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
