"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, User, CheckCircle, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ElectionResult {
    candidate: string
    position: string
    votes: number
    percentage: number
}

interface ResultsOverviewProps {
    isSuperAdmin: boolean
}

export function ResultsOverview({ isSuperAdmin }: ResultsOverviewProps) {
    const [selectedPosition, setSelectedPosition] = useState<string>("all")

    // Mock data - replace with actual API calls
    const electionResults: ElectionResult[] = [
        { candidate: "John Doe", position: "President", votes: 623, percentage: 52.5 },
        { candidate: "Jane Smith", position: "President", votes: 561, percentage: 47.5 },
        { candidate: "Alice Johnson", position: "Vice-President", votes: 789, percentage: 68.2 },
        { candidate: "Bob Wilson", position: "Vice-President", votes: 367, percentage: 31.8 },
        { candidate: "Eve Miller", position: "Gen. Secretary", votes: 945, percentage: 81.3 },
        { candidate: "Charlie Brown", position: "Gen. Secretary", votes: 217, percentage: 18.7 },
    ]

    const positions = [...new Set(electionResults.map((result) => result.position))]

    const filteredResults =
        selectedPosition === "all"
            ? electionResults
            : electionResults.filter((result) => result.position === selectedPosition)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Election Results Overview
                            </CardTitle>
                            <CardDescription>View detailed results for each position</CardDescription>
                        </div>
                        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                {positions.map((position) => (
                                    <SelectItem key={position} value={position}>
                                        {position}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Votes</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    {isSuperAdmin && <TableHead className="text-right">Status</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResults.map((result) => (
                                    <TableRow key={result.candidate}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{result.candidate}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{result.position}</Badge>
                                        </TableCell>
                                        <TableCell>{result.votes.toLocaleString()}</TableCell>
                                        <TableCell>{result.percentage}%</TableCell>
                                        {isSuperAdmin && (
                                            <TableCell className="text-right">
                                                {result.percentage > 50 ? (
                                                    //@ts-ignore
                                                    <Badge variant="ghost" className="text-green-500">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Elected
                                                    </Badge>
                                                ) : (
                                                    //@ts-ignore
                                                    <Badge variant="ghost" className="text-red-500">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Lost
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
