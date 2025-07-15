"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, X, Clock } from "lucide-react"

interface VerificationData {
  nomineeName: string
  position: string
  expiresAt: string
  isExpired?: boolean
}

interface VerifyNominationPageProps {
  params: Promise<{ token: string }>
}

export default function VerifyNominationPage({ params }: VerifyNominationPageProps) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [data, setData] = useState<VerificationData | null>(null)
  const [comments, setComments] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  })

  // Unwrap params Promise
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (!token) return

    const fetchVerificationData = async () => {
      try {
        // Try nominator verification first
        let response
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
          response = await fetch(`${API_BASE_URL}/nominations/verify/nominator/${token}`)
        } catch (nominatorError) {
          // If nominator fails, try guarantor service
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
            response = await fetch(`${API_BASE_URL}/nominations/verify/guarantor/${token}`)
          } catch (guarantorError) {
            throw new Error("Invalid or expired verification link")
          }
        }

        if (!response.ok) {
          throw new Error("Invalid or expired verification link")
        }

        const result = await response.json()

        // Map the response to match your expected structure
        const mockData = {
          nomineeName: result.nomination?.nomineeName || result.nomination?.aspirant?.name || "Unknown Nominee",
          position: result.nomination?.nomineePosition || "Unknown Position",
          expiresAt: result.isExpired ? new Date().toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          isExpired: result.isExpired || false
        }

        setData(mockData)

        if (result.isExpired) {
          setError("This verification link has expired")
        }
      } catch (error) {
        console.error('Verification error:', error)
        setError("Invalid or expired verification link")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerificationData()
  }, [token])

  useEffect(() => {
    if (!data || data.isExpired) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const expiresAt = new Date(data.expiresAt)
      const difference = expiresAt.getTime() - now.getTime()

      if (difference <= 0) {
        setError("This verification link has expired")
        return { hours: "00", minutes: "00", seconds: "00" }
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [data])

  const handleConfirm = async () => {
    if (!token) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Try to confirm via nominator endpoint first
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
      let response

      try {
        response = await fetch(`${API_BASE_URL}/nominations/verify/nominator/${token}/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
            reason: comments
          }),
        })
      } catch (nominatorError) {
        // If nominator fails, try guarantor endpoint
        response = await fetch(`${API_BASE_URL}/nominations/verify/guarantor/${token}/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
            reason: comments
          }),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to verify nomination")
      }

      setSuccess(true)
    } catch (error) {
      console.error('Confirmation error:', error)
      setError("Failed to verify nomination. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDecline = async () => {
    if (!token) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Try to decline via nominator endpoint first
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
      let response

      try {
        response = await fetch(`${API_BASE_URL}/nominations/verify/nominator/${token}/decline`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "decline",
            reason: comments
          }),
        })
      } catch (nominatorError) {
        // If nominator fails, try guarantor endpoint
        response = await fetch(`${API_BASE_URL}/nominations/verify/guarantor/${token}/decline`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "decline",
            reason: comments
          }),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to decline nomination")
      }

      router.push("/")
    } catch (error) {
      console.error('Decline error:', error)
      setError("Failed to decline nomination. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading verification details...</p>
              </div>
            </div>
          </main>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-red-600">Verification Error</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <p className="mb-6">{error}</p>
                <Button onClick={() => router.push("/")} className="mx-auto">
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
    )
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-green-600">Verification Successful</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="mb-2">Thank you for verifying this nomination.</p>
                <p className="text-gray-600 mb-6">Your endorsement has been recorded successfully.</p>
                <Button onClick={() => router.push("/")} className="mx-auto">
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Approve Endorsement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg">
                  You are verifying <span className="font-semibold">{data?.nomineeName}</span> for the position of{" "}
                  <span className="font-semibold">{data?.position}</span>.
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex justify-center items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{timeLeft.hours}</div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{timeLeft.minutes}</div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{timeLeft.seconds}</div>
                    <div className="text-xs text-gray-500">Seconds</div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">Time remaining to verify</span>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea
                    placeholder="Additional comments (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleDecline} disabled={isSubmitting} className="w-full">
                    Decline
                  </Button>
                  <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full">
                    Confirm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}