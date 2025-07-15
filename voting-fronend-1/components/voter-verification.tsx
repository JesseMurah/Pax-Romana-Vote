"use client"

import { useState } from "react"
import { User, Phone, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-config"

interface VerificationState {
  fullName: string
  phoneNumber: string
  verificationCode: string
  isCodeSent: boolean
  isLoading: boolean
  error: string | null
}

export function VoterVerification() {
  const router = useRouter()
  const { login } = useAuth()
  const [state, setState] = useState<VerificationState>({
    fullName: "",
    phoneNumber: "",
    verificationCode: "",
    isCodeSent: false,
    isLoading: false,
    error: null,
  })

  const handleSendCode = async () => {
    if (!state.fullName.trim() || !state.phoneNumber.trim()) {
      setState((prev) => ({ ...prev, error: "Please fill in all required fields" }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await apiClient.sendVerification({
        fullName: state.fullName,
        phoneNumber: state.phoneNumber,
      })

      setState((prev) => ({
        ...prev,
        isCodeSent: true,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to send verification code",
      }))
    }
  }

  const handleVerifyAndProceed = async () => {
    if (!state.verificationCode.trim()) {
      setState((prev) => ({ ...prev, error: "Please enter the verification code" }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.verifyCode({
        fullName: state.fullName,
        phoneNumber: state.phoneNumber,
        verificationCode: state.verificationCode,
      })

      // Adapt this to match your backend response structure
      const { user, token } = response as any

      login(user, token)
        router.push("/voting")
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Invalid verification code",
      }))
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Voter Verification</CardTitle>
          <CardDescription className="text-gray-600">
            Please enter your phone number and name to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Full Name"
                  value={state.fullName}
                  onChange={(e) => setState((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="pl-10"
                  disabled={state.isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., (555) 123-4567"
                  value={state.phoneNumber}
                  onChange={(e) => setState((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  className="pl-10"
                  disabled={state.isLoading}
                />
              </div>
            </div>

            <Button
              onClick={handleSendCode}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={state.isLoading || state.isCodeSent}
            >
              {state.isLoading ? "Sending..." : state.isCodeSent ? "Code Sent!" : "Send Verification Code"}
            </Button>

            {state.isCodeSent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter code from SMS"
                      value={state.verificationCode}
                      onChange={(e) => setState((prev) => ({ ...prev, verificationCode: e.target.value }))}
                      className="pl-10"
                      disabled={state.isLoading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleVerifyAndProceed}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? "Verifying..." : "Verify & Proceed to Voting"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
