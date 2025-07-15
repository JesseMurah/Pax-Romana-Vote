"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, User, LogOut, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-config"

interface Candidate {
  id: string
  name: string
  party?: string
  photo?: string
  description?: string
}

interface Position {
  id: string
  title: string
  candidates: Candidate[]
  isUnopposed?: boolean
  description?: string
}

export function VotingInterface() {
  const router = useRouter()
  const { token, logout } = useAuth()
  const [positions, setPositions] = useState<Position[]>([])
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [submissionTime, setSubmissionTime] = useState<string>("")

  useEffect(() => {
    if (!token) {
      router.push("/")
      return
    }
    fetchPositions()
  }, [token, router])

  const fetchPositions = async () => {
    try {
      const response = await apiClient.getElections(token!)
      // Transform the response to match the Position interface
      // @ts-ignore
      const transformedPositions = response.map((election: any) => ({
        id: election.id,
        title: election.title,
        candidates: election.candidates,
        isUnopposed: election.candidates.length === 1,
        description: election.description,
      }))
      setPositions(transformedPositions)
    } catch (error) {
      setError("Failed to load elections. Please refresh the page.")
      if (error instanceof Error && error.message.includes("401")) {
        logout()
        router.push("/")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const currentPosition = positions[currentPositionIndex]
  const isLastPosition = currentPositionIndex === positions.length - 1
  const hasVotedForCurrentPosition = votes[currentPosition?.id] !== undefined

  const handleVote = (candidateId: string) => {
    if (!currentPosition) return
    setVotes((prev) => ({
      ...prev,
      [currentPosition.id]: candidateId,
    }))
  }

  const handleNext = () => {
    if (isLastPosition) {
      handleSubmitVotes()
    } else {
      setCurrentPositionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex((prev) => prev - 1)
    }
  }

  const handleSubmitVotes = async () => {
    if (!token) {
      router.push("/")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await apiClient.submitVotes(votes, token)

      const now = new Date()
      setSubmissionTime(
          now.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
      )

      setIsComplete(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit votes")
      if (error instanceof Error && error.message.includes("401")) {
        logout()
        router.push("/")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading ballot...</p>
          </div>
        </div>
    )
  }

  if (isComplete) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your vote has been recorded!</h1>
                <p className="text-gray-600">
                  Thank you for participating in the election. Your vote has been successfully submitted and recorded.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Submission Details</h3>
                <p className="text-sm text-gray-600">Timestamp: {submissionTime}</p>
              </div>

              <Button onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>

          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
            <p className="text-sm text-gray-500">Powered by Your Election Platform</p>
          </div>
        </div>
    )
  }

  if (!currentPosition) {
    return (
        <div className="text-center">
          <p>No positions available for voting.</p>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-gray-900">VoteWise</span>
            </div>
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Ballot</h1>
            <p className="text-gray-600">
              {currentPosition.isUnopposed
                  ? "Vote Yes or No for the unopposed candidate."
                  : "Select one candidate for each position."}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Position {currentPositionIndex + 1} of {positions.length}
            </span>
              <span>{Math.round(((currentPositionIndex + 1) / positions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPositionIndex + 1) / positions.length) * 100}%` }}
              />
            </div>
          </div>

          {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {/* Voting Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{currentPosition.title}</h2>
                {currentPosition.isUnopposed && <Badge variant="secondary">Unopposed</Badge>}
              </div>

              <div className="space-y-4">
                {currentPosition.isUnopposed ? (
                    // Unopposed candidate - Yes/No voting
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={currentPosition.candidates[0].photo || "/placeholder.svg?height=48&width=48"} />
                          <AvatarFallback>
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{currentPosition.candidates[0].name}</h3>
                          {currentPosition.candidates[0].party && (
                              <p className="text-sm text-gray-500">{currentPosition.candidates[0].party}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleVote("yes")}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                                votes[currentPosition.id] === "yes"
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-200 hover:border-green-300"
                            }`}
                        >
                          <div className="font-semibold">Yes</div>
                          <div className="text-sm text-gray-500">Support this candidate</div>
                        </button>
                        <button
                            onClick={() => handleVote("no")}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                                votes[currentPosition.id] === "no"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-200 hover:border-red-300"
                            }`}
                        >
                          <div className="font-semibold">No</div>
                          <div className="text-sm text-gray-500">Do not support</div>
                        </button>
                      </div>
                    </div>
                ) : (
                    // Regular candidates - select one
                    currentPosition.candidates.map((candidate) => (
                        <button
                            key={candidate.id}
                            onClick={() => handleVote(candidate.id)}
                            className={`w-full flex items-center space-x-4 p-4 border-2 rounded-lg text-left transition-all ${
                                votes[currentPosition.id] === candidate.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={candidate.photo || "/placeholder.svg?height=48&width=48"} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                            {candidate.party && <p className="text-sm text-gray-500">{candidate.party}</p>}
                            {candidate.description && <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>}
                          </div>
                          <div
                              className={`w-5 h-5 rounded-full border-2 ${
                                  votes[currentPosition.id] === candidate.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                              }`}
                          >
                            {votes[currentPosition.id] === candidate.id && (
                                <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                        </button>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentPositionIndex === 0}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!hasVotedForCurrentPosition || isSubmitting}>
              {isSubmitting ? "Submitting..." : isLastPosition ? "Submit Vote" : "Next"}
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-500">
          <p>© 2024 VoteWise. All rights reserved.</p>
          <p>Secure and Transparent Voting Solutions</p>
        </footer>
      </div>
  )
}
