import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to
                  confirm your account before signing in.
                </p>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h3 className="mb-2 font-semibold text-sm">
                    Boost your visibility
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Complete your profile after confirming your email to help
                    chefs discover you and increase your chances of getting
                    bookings. This step is optional but highly recommended.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can complete this anytime from your profile settings.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href="/auth/login" className="flex-1">
                    <Button className="w-full" variant="outline">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
