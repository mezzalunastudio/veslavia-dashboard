"use client"

import { useAuth } from "@/contexts/AuthContext"
import { AuthLoadingScreen } from "./AuthLoadingScreen"

export function GlobalLoadingWrapper() {
  const { postLoginLoading } = useAuth()
  
  if (!postLoginLoading) return null
  
  return <AuthLoadingScreen />
}