import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div className="min-h-svh flex">

      {/* LEFT SIDE (BRAND / HERO) */}
      <div className="hidden md:flex flex-1 bg-orange-500 text-white flex-col justify-center px-16 gap-16">
        <div>
          <h1 className="text-5xl font-bold mb-4">
            Hire the Perfect Chef
          </h1>
          <p className="text-lg opacity-90 max-w-md">
            Connect with professional chefs for your events, private dining,
            and special occasions.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button className="bg-white text-black hover:bg-gray-200">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE (LOGIN FORM) */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">

          {/* MOBILE BACK BUTTON */}
          <div className="mb-4 md:hidden">
            <Link href="/">
              <Button variant="outline" className="w-full">
                ← Back to Home
              </Button>
            </Link>
          </div>

          <LoginForm/>

        </div>
      </div>
    </div>
  )
}