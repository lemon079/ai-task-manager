import { SignupForm } from '@/components/signup-form'
import React from 'react'

const page = () => {
  return (
     <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}

export default page