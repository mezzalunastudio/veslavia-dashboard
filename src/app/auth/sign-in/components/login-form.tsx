"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Spinner } from "@/components/icons"
import { useAuth } from "@/contexts/AuthContext"
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen"


const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginForm3Props extends React.ComponentProps<"div"> {
  className?: string
}

export function LoginForm({ className, ...props }: LoginForm3Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {postLoginLoading, login, loginWithGoogle, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormData) {
    setIsLoading(true)
    setError("")
    
    try {
      await login(values.email, values.password)
      // Redirect akan ditangani oleh AuthContext setelah login sukses
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError("")
    try {
      // Load Google SDK
      await new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.onload = resolve
        document.head.appendChild(script)
      })

      // Initialize Google Auth
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: any) => {
            try {
              await loginWithGoogle(response.credential)
              // Redirect akan ditangani oleh AuthContext setelah login sukses
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Google login failed"
              setError(errorMessage)
              console.error("Google login error:", err)
            } finally {
              setGoogleLoading(false)
            }
          },
        })

        // Trigger Google login
        window.google.accounts.id.prompt()
      } else {
        throw new Error("Google SDK failed to load")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google login failed"
      setError(errorMessage)
      console.error("Google SDK error:", err)
      setGoogleLoading(false)
    }
  }

  // Jika sedang loading auth check, tampilkan loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="p-6 md:p-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex justify-center mb-2">
                <Link href="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">Veslavia</span>
                </Link>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your veslavia account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  {...form.register("email")}
                  className={form.formState.errors.email ? "border-destructive" : ""}
                  disabled={isLoading || googleLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••" 
                  required 
                  {...form.register("password")}
                  className={form.formState.errors.password ? "border-destructive" : ""}
                  disabled={isLoading || googleLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full cursor-pointer" 
                disabled={isLoading || googleLoading}
              >
                {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 gap-4">
                {/* Google */}
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full cursor-pointer"
                  disabled={isLoading || googleLoading}
                  onClick={handleGoogleLogin}
                >
                  {googleLoading ? (
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/auth/sign-up" 
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          
          {/* Image Section */}
          <div className="bg-muted relative hidden md:block">
            {/* <Image
              src="/placeholder-login.jpg" 
              alt="Login image"
              fill
              className="object-cover dark:brightness-[0.95]"
              priority
            /> */}
          </div>
        </CardContent>
      </Card>
      {postLoginLoading && <AuthLoadingScreen />}
      {/* Footer */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

// Extend window interface untuk Google SDK
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}