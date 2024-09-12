import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return  (
    <div className="min-h-screen items-center flex justify-center p-5">
      <SignIn />
    </div>
  )
}