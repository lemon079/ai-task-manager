"use client";

import { useSignup } from "@/hooks/auth/useSignup";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import CustomLoader from "../shared/CustomLoader";
import { Button } from "../ui/button";
import { Field, FieldSeparator } from "../ui/field";

export function SignupFormClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: signup, isPending } = useSignup();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signup(
      { email, password },
      {
        onSuccess: async () => {
          toast.success("Account created successfully!");
          setIsLoading(false);

          await signIn("credentials", { email, password, redirect: true, callbackUrl: '/task-ai' });
        },
        onError: (err: any) => {
          setIsLoading(false);
          toast.error(
            err?.response?.data?.message || "Signup failed. Please try again."
          );
        },
      }
    );
  }

  async function handleGoogleClick() {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/task-ai" });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-google]")) handleGoogleClick();
      }}
      className="space-y-4"
    >
      {children}

      {/* Create Account Button */}
      <Field>
        <Button disabled={isPending} type="submit" variant="customBlue" className="w-full">
          {(isLoading || isPending) ? <CustomLoader color="text-white" /> : "Create Account"}
        </Button>
      </Field>

      {/* Separator */}
      <FieldSeparator className="my-2" >Or</FieldSeparator>

      {/* Google Sign-in Button */}
      <Field>
        <Button disabled={isPending}
          variant="customBlue"
          type="button"
          className="w-full flex items-center justify-center gap-2"
          data-google
        >

          {(isLoading || isPending) ? <CustomLoader color="text-white" /> : <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-4"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </>
          }
        </Button>
      </Field>
    </form>
  );
}
