import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";

export function useSignin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      if (!res?.ok) {
        throw new Error(res?.error || "Invalid credentials");
      }

      return res;
    },
  });
}
