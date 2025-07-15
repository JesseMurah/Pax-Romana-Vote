"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { VoterVerification } from "@/components/voter-verification"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/voting")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <VoterVerification />
      </main>
    </div>
  )
}
