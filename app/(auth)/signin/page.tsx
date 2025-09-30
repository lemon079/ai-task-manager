"use client"
import React from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const page = () => {
  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="mb-5 text-2xl font-bold">Sign In</h1>
      <Button
        onClick={() => signIn('google', { callbackUrl: "/dashboard", redirect: true })}
        className="mb-5 bg-customBlue text-white"
      >
        Sign In with Google
      </Button>
      <form className="flex flex-col w-72">
        <Label htmlFor="email" className="mb-2">
          Email:
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          required
          className="mb-4"
        />
        <Label htmlFor="password" className="mb-2">
          Password:
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          required
          className="mb-4"
        />
        <Button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Sign In
        </Button>
      </form>
    </div>
  )
}

export default page