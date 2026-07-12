import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ChefHat } from 'lucide-react'
import { SESSION_COOKIE_NAME } from '@/lib/auth'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage() {
  const cookieStore = await cookies()
  if (cookieStore.has(SESSION_COOKIE_NAME)) redirect('/')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="rounded-lg bg-primary p-3">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Budget Feast PH</h1>
            <p className="text-sm text-muted-foreground">Sign in to the admin portal</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
