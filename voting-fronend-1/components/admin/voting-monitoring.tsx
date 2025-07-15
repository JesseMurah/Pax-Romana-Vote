"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingUp, Users, RefreshCw, Activity } from "lucide-react"

interface VotingProgress {
    position: string
    totalVoters: number
    votesSubmitted: number
    percentage: number
    lastUpdate: string
}

interface Anomaly {
    id: string
    type: "suspicious_pattern" | "technical_issue" | "multiple_votes"
    description: string
    severity: "low" | "medium" | "high"
    timestamp: string
    resolved: boolean
}

interface VotingMonitoringProps {
    isSuperAdmin: boolean
}

export function VotingMonitoring({ isSuperAdmin }: VotingMonitoringProps) {
    const [votingProgress, setVotingProgress] = useState<VotingProgress[]>([
        {
            position: "President",
            totalVoters: 1247,
            votesSubmitted: 892,
            percentage: 71.5,
            lastUpdate: "2 minutes ago",
        },
        {
            position: "Vice-President",
            totalVoters: 1247,
            votesSubmitted: 856,
            percentage: 68.6,
            lastUpdate: "3 minutes ago",
        },
        {
            position: "Gen. Secretary",
            totalVoters: 1247,
            votesSubmitted: 834,
            percentage: 66.9,
            lastUpdate: "5 minutes ago",
        },
    ])

    const [anomalies, setAnomalies] = useState<Anomaly[]>([
        {
            id: "1",
            type: "suspicious_pattern",
            description: "Unusual voting pattern detected in President position",
            severity: "medium",
            timestamp: "10 minutes ago",
            resolved: false,
        },
        {
            id: "2",
            type: "technical_issue",
            description: "Temporary connection timeout for 3 users",
            severity: "low",
            timestamp: "25 minutes ago",
            resolved: true,
        },
    ])

    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsRefreshing(false)
    }

    const handleResolveAnomaly = (id: string) => {
        setAnomalies(anomalies.map((a) => (a.id === id ? { ...a, resolved: true } : a)))
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200"
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "low":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const unresolvedAnomalies = anomalies.filter((a) => !a.resolved)

    return (
        <div className="space-y-6">
            {/* Real-time Voting Progress */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Real-time Voting Progress
                            </CardTitle>
                            <CardDescription>Live voter turnout and progress for each position</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {votingProgress.map((progress) => (
                            <div key={progress.position} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">{progress.position}</h4>
                                        <p className="text-sm text-gray-600">
                                            {progress.votesSubmitted.toLocaleString()} of {progress.totalVoters.toLocaleString()} votes
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{progress.percentage}%</div>
                                        <p className="text-xs text-gray-500">Updated {progress.lastUpdate}</p>
                                    </div>
                                </div>
                                <Progress value={progress.percentage} className="h-3" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Anomaly Detection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Anomaly Detection
                        {unresolvedAnomalies.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unresolvedAnomalies.length} Active
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {isSuperAdmin
                            ? "Monitor and investigate voting irregularities"
                            : "View alerts and notifications-1 for anomalies"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {anomalies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No anomalies detected</p>
                            <p className="text-sm">System is running normally</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {anomalies.map((anomaly) => (
                                <Alert
                                    key={anomaly.id}
                                    className={`${getSeverityColor(anomaly.severity)} ${anomaly.resolved ? "opacity-60" : ""}`}
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    <div className="flex items-start justify-between w-full">
                                        <div className="flex-1">
                                            <AlertDescription>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {anomaly.type.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                    <Badge variant="outline" className={`text-xs ${getSeverityColor(anomaly.severity)}`}>
                                                        {anomaly.severity.toUpperCase()}
                                                    </Badge>
                                                    {anomaly.resolved && (
                                                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                                            RESOLVED
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm">{anomaly.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{anomaly.timestamp}</p>
                                            </AlertDescription>
                                        </div>
                                        {isSuperAdmin && !anomaly.resolved && (
                                            <div className="ml-4 flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleResolveAnomaly(anomaly.id)}>
                                                    Resolve
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Investigate
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Alert>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Live Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Voters</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">127</div>
                        <p className="text-xs text-muted-foreground">Currently online</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Healthy</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">245ms</div>
                        <p className="text-xs text-muted-foreground">Average response time</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
