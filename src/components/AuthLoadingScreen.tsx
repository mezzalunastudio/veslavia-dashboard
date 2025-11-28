"use client"

import { Spinner } from "@/components/icons"

export function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-8 bg-background border rounded-lg shadow-lg">
        <Spinner className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">Setting up your account</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Please wait while we prepare your dashboard...
          </p>
        </div>
      </div>
    </div>
  )
}