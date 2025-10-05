import Link from "next/link";
import { cn } from "@/lib/utils";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { SignupFormClient } from "./SignupFormClient";
import Heading from "../shared/Heading";
import { Input } from "../ui/input";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SignupFormClient>
        <FieldGroup>
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Heading
              title="Create your Account"
              subtitle={
                <span>
                  Already have an account?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </span>
              }
            />
          </div>

          {/* Email and Password Fields */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Type password"
              required
            />
          </Field>
        </FieldGroup>
      </SignupFormClient>
    </div>
  );
}
