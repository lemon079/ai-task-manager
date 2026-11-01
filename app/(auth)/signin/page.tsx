import { SigninForm } from "@/components/auth/signin-form";
import { Suspense } from "react";

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SigninForm />
    </Suspense>
  );
}