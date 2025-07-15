"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Mail, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type AuthStep = "signup" | "verify" | "login"

interface SignupData {
    role: "super_admin" | "member"
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    agreeToTerms: boolean
}

export default function AuthForms() {
    const { login } = useAuth()
    const [currentStep, setCurrentStep] = useState<AuthStep>("login")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [signupEmail, setSignupEmail] = useState("")

    const [signupData, setSignupData] = useState<SignupData>({
        role: "member",
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        agreeToTerms: false,
    })

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Validate form
            if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
                throw new Error("Please fill in all required fields")
            }

            if (!signupData.agreeToTerms) {
                throw new Error("Please agree to the Terms and Conditions")
            }

            if (signupData.password.length < 8) {
                throw new Error("Password must be at least 8 characters long")
            }

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // In real implementation, call your backend API here
            // const response = await apiClient.signup(signupData)

            setSignupEmail(signupData.email)
            setSuccess("Account created successfully! Please check your email for verification code.")
            setCurrentStep("verify")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create account")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (!verificationCode || verificationCode.length !== 6) {
                throw new Error("Please enter a valid 6-digit verification code")
            }

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // In real implementation, verify the code with your backend
            // const response = await apiClient.verifyEmail(signupEmail, verificationCode)

            setSuccess("Email verified successfully! You can now sign in.")
            setCurrentStep("login")
            setLoginData({ email: signupEmail, password: "" })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify email")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (!loginData.email || !loginData.password) {
                throw new Error("Please enter both email and password")
            }

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // In real implementation, authenticate with your backend
            // const response = await apiClient.login(loginData)

            // Mock successful login
            const user = {
                id: "user-" + Date.now(),
                name: signupData.firstName ? `${signupData.firstName} ${signupData.lastName}` : "Admin User",
                email: loginData.email,
                role: loginData.email.includes("admin") ? ("super_admin" as const) : ("member" as const),
            }

            login("token-" + Date.now(), user)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to sign in")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setSuccess("Verification code resent to your email!")
        } catch (err) {
            setError("Failed to resend verification code")
        } finally {
            setIsLoading(false)
        }
    }

    if (currentStep === "signup") {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                    <CardHeader className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                        <CardTitle className="text-2xl text-white">Create an account</CardTitle>
                        <CardDescription className="text-gray-400">Welcome! Create an account to get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="border-green-500 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Label htmlFor="role" className="text-white">
                                    Role
                                </Label>
                                <Select
                                    value={signupData.role}
                                    onValueChange={(value: "super_admin" | "member") => setSignupData({ ...signupData, role: value })}
                                >
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="text-white">
                                        First name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={signupData.firstName}
                                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="text-white">
                                        Last name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        value={signupData.lastName}
                                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="username" className="text-white">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    value={signupData.username}
                                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-white">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={signupData.email}
                                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                    className="bg-gray-700 border-gray-600 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-white">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={signupData.password}
                                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={signupData.agreeToTerms}
                                    onCheckedChange={(checked) => setSignupData({ ...signupData, agreeToTerms: checked as boolean })}
                                />
                                <Label htmlFor="terms" className="text-sm text-gray-400">
                                    I agree to the{" "}
                                    <button type="button" className="text-white underline">
                                        Terms and Conditions
                                    </button>
                                </Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create free account"
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("login")}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    Already have an account? <span className="text-white underline">Sign in</span>
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (currentStep === "verify") {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                    <CardHeader className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-white">Verify your email</CardTitle>
                        <CardDescription className="text-gray-400">
                            We've sent a 6-digit verification code to <span className="text-white font-medium">{signupEmail}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerification} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="border-green-500 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Label htmlFor="code" className="text-white">
                                    Verification Code
                                </Label>
                                <Input
                                    id="code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    className="bg-gray-700 border-gray-600 text-white text-center text-lg tracking-widest"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>

                            <div className="text-center space-y-2">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={isLoading}
                                    className="text-sm text-gray-400 hover:text-white disabled:opacity-50"
                                >
                                    Didn't receive the code? <span className="text-white underline">Resend</span>
                                </button>
                                <br />
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("signup")}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    <span className="text-white underline">Back to signup</span>
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Login form
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                <CardHeader className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mx-auto">
                            <span className="text-white font-bold text-sm">V</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
                    <CardDescription className="text-gray-400">Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-500 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">{success}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <Label htmlFor="loginEmail" className="text-white">
                                Email address
                            </Label>
                            <Input
                                id="loginEmail"
                                type="email"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="loginPassword" className="text-white">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="loginPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="bg-gray-700 border-gray-600 text-white pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setCurrentStep("signup")}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                Don't have an account? <span className="text-white underline">Create account</span>
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
