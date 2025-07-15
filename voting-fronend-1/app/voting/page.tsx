"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, LogOut, User, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: string
  name: string
  party?: string
  photo?: string
  bio?: string
}

interface Position {
  id: string
  title: string
  candidates: Candidate[]
  isUnopposed?: boolean
}

// Mock data - replace with actual API calls
const positions: Position[] = [
  {
    id: "president",
    title: "President",
    candidates: [
      { id: "1", name: "Candidate A", party: "Party X", photo: "/placeholder.svg?height=40&width=40" },
      { id: "2", name: "Candidate B", party: "Party Y", photo: "/placeholder.svg?height=40&width=40" },
      { id: "3", name: "Candidate C", party: "Party Z", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "vice-president",
    title: "Vice President",
    candidates: [
      { id: "4", name: "John Doe", party: "Party A", photo: "/placeholder.svg?height=40&width=40" },
      { id: "5", name: "Jane Smith", party: "Party B", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "gen-secretary",
    title: "General Secretary",
    candidates: [{ id: "6", name: "Michael Johnson", party: "Party X", photo: "/placeholder.svg?height=40&width=40" }],
    isUnopposed: true,
  },
  {
    id: "financial-secretary",
    title: "Financial Secretary",
    candidates: [
      { id: "7", name: "Sarah Wilson", party: "Party Y", photo: "/placeholder.svg?height=40&width=40" },
      { id: "8", name: "David Brown", party: "Party Z", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "organizing-secretary-main",
    title: "Organizing Secretary (Main)",
    candidates: [
      { id: "9", name: "Emily Davis", party: "Party A", photo: "/placeholder.svg?height=40&width=40" },
      { id: "10", name: "Robert Miller", party: "Party B", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "organizing-secretary-assistant",
    title: "Organizing Secretary (Assistant)",
    candidates: [{ id: "11", name: "Lisa Anderson", party: "Party X", photo: "/placeholder.svg?height=40&width=40" }],
    isUnopposed: true,
  },
  {
    id: "pro-main",
    title: "PRO (Main)",
    candidates: [
      { id: "12", name: "James Taylor", party: "Party Y", photo: "/placeholder.svg?height=40&width=40" },
      { id: "13", name: "Maria Garcia", party: "Party Z", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "pro-assistant",
    title: "PRO (Assistant)",
    candidates: [
      { id: "14", name: "Kevin White", party: "Party A", photo: "/placeholder.svg?height=40&width=40" },
      { id: "15", name: "Amanda Lee", party: "Party B", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "women-commissioner",
    title: "Women Commissioner",
    candidates: [
      { id: "16", name: "Rachel Green", party: "Party X", photo: "/placeholder.svg?height=40&width=40" },
      { id: "17", name: "Monica Blue", party: "Party Y", photo: "/placeholder.svg?height=40&width=40" },
    ],
  },
]

export default function VotePage() {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [submissionTime, setSubmissionTime] = useState<string>("")

  const currentPosition = positions[currentPositionIndex]
  const isLastPosition = currentPositionIndex === positions.length - 1
  const hasVotedForCurrentPosition = votes[currentPosition.id] !== undefined

  const handleVote = (candidateId: string) => {
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
    setIsSubmitting(true)

    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

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
      console.error("Error submitting votes:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    // Replace with actual logout logic
    window.location.href = "/login"
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
            <p className="text-sm text-gray-500">Powered by Pax EC</p>
          </div>
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
                          <AvatarImage src={currentPosition.candidates[0].photo || "/placeholder.svg"} />
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
                            <AvatarImage src={candidate.photo || "/placeholder.svg"} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                            {candidate.party && <p className="text-sm text-gray-500">{candidate.party}</p>}
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
