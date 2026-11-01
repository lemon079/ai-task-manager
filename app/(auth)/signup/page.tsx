import { SignupForm } from "@/components/auth/signup-form";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignupForm />
    </Suspense>
  );
}