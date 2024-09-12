import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="fmin-h-screen items-center flex justify-center p-5">
      <SignUp />
    </div>
  )
}