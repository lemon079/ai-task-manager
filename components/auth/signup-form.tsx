import Link from "next/link";
import { cn } from "@/lib/utils";
import { SignupFormClient } from "./SignupFormClient";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full space-y-6", className)} {...props}>
      {/* Notion-style Header */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Start organizing your work with AI automation.
        </p>
      </div>

      <SignupFormClient />

      {/* Switch to Signin */}
      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Log in
        </Link>
      </div>

      {/* Terms Disclaimer */}
      <p className="text-[11px] leading-relaxed text-muted-foreground/60 text-center px-4">
        By continuing, you acknowledge that you understand and agree to the Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
