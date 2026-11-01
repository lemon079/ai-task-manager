"use client";

import { useSignin } from "@/hooks/auth/useSignin";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export function SigninFormClient() {
  const { mutate: signin, isPending } = useSignin();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Configuration":
        return "Authentication configuration issue detected. Please check credentials or try email login.";
      case "AccessDenied":
        return "Access was denied. Please sign in with an authorized account.";
      case "Verification":
        return "The login link has expired or was already used.";
      case "CredentialsSignin":
        return "Invalid email or password. Please verify your credentials.";
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsEmailLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signin(
      { email, password },
      {
        onSuccess: () => {
          setIsEmailLoading(false);
          toast.success("Signed in successfully!");
          router.push("/task-ai");
        },
        onError: (err) => {
          toast.error(err.message || "Sign in failed. Please try again.");
          setIsEmailLoading(false);
        },
      }
    );
  }

  async function handleGoogleClick() {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl: "/task-ai" });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  const isBusy = isEmailLoading || isGoogleLoading || isPending;

  return (
    <div className="space-y-4">
      {/* Friendly OAuth / Config Error Banner */}
      {errorParam && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs leading-relaxed flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{getErrorMessage(errorParam)}</span>
        </div>
      )}

      {/* Primary Notion-style Social Button: Continue with Google */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleClick}
        disabled={isBusy}
        className="w-full h-10 rounded-lg border border-border/80 bg-card hover:bg-muted/50 text-foreground text-xs sm:text-sm font-medium shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </Button>

      {/* Notion-style Hairline Divider */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative bg-background px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          or continue with email
        </div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={isBusy}
            className="h-10 rounded-lg text-base sm:text-sm bg-background border-border/80 focus:border-foreground/40 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            disabled={isBusy}
            className="h-10 rounded-lg text-base sm:text-sm bg-background border-border/80 focus:border-foreground/40 transition-colors"
          />
        </div>

        {/* High-contrast Notion-style Submit Button */}
        <Button
          type="submit"
          disabled={isBusy}
          className="w-full h-10 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
        >
          {isEmailLoading || isPending ? (
            <Loader2 className="size-4 animate-spin text-background" />
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </div>
  );
}
