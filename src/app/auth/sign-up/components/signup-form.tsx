// components/signup-form.tsx
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Spinner } from "@/components/icons"
import { useAuth } from "@/contexts/AuthContext"
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen"

// Schema validasi untuk signup
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === false, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { register: registerUser, loading, postLoginLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  async function onSubmit(values: SignupFormData) {
    setIsLoading(true)
    setError("")
    
    try {
      await registerUser(values.email, values.password, values.name)
      // Redirect akan ditangani oleh AuthContext setelah register sukses
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
      console.error("Registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
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
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter your information to create a new account
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                {/* Name Field */}
                <div className="grid gap-3">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    {...form.register("name")}
                    className={form.formState.errors.name ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

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
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    {...form.register("password")}
                    className={form.formState.errors.password ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    required 
                    {...form.register("confirmPassword")}
                    className={form.formState.errors.confirmPassword ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    {...form.register("terms")}
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {form.formState.errors.terms && (
                  <p className="text-sm text-destructive -mt-4">
                    {form.formState.errors.terms.message}
                  </p>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer" 
                  disabled={isLoading}
                >
                  {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>

                {/* Separator */}
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Google */}
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                {/* Sign In Link */}
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link 
                    href="/auth/sign-in" 
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
            
            {/* Image Section */}
            <div className="bg-muted relative hidden md:block">
              {/* <Image
                src="/placeholder-signup.jpg"
                alt="Sign up image"
                fill
                className="object-cover dark:brightness-[0.95]"
                priority
              /> */}
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
      
      {/* Loading Screen */}
      {postLoginLoading && <AuthLoadingScreen />}
    </>
  )
}