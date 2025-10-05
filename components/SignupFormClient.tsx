"use client";

import { signIn } from "next-auth/react";

export function SignupFormClient({
    children,
}: {
    children: React.ReactNode;
}) {

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await signIn("email", {redirect: false})
    }

    async function handleGoogleClick() {
        await signIn("google");
    }

    return (
        <form
            onSubmit={handleSubmit}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("[data-google]")) handleGoogleClick();
            }}
        >
            {children}
        </form>
    );
}
