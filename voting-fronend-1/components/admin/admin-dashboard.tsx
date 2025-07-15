"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Users,
    Vote,
    FileText,
    BarChart3,
    UserPlus,
    Shield,
    TrendingUp,
    Plus,
    MoreHorizontal,
    Filter,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "./admin-sidebar"
import { CandidateManagement } from "./candidate-management"
import { NominationManagement } from "./nomination-management"
import { UserManagement } from "./user-management"
import { VotingMonitoring } from "./voting-monitoring"
import { ResultsOverview } from "./results-overview"

export function AdminDashboard() {
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState("dashboard")
    //@ts-ignore
    // Check on this logic
    const isSuperAdmin = user?.role === "super_admin"

    // Mock data - replace with actual API calls
    const dashboardStats = {
        totalVoters: 1247,
        votesSubmitted: 892,
        candidatesRegistered: 24,
        nominationsSubmitted: 18,
        nominationsApproved: 15,
        votingProgress: 71.5,
        anomaliesDetected: 2,
    }

    const renderMainContent = () => {
        switch (activeTab) {
            case "candidates":
                return isSuperAdmin ? <CandidateManagement /> : null
            case "nominations":
                return isSuperAdmin ? <NominationManagement /> : null
            case "monitoring":
                return <VotingMonitoring isSuperAdmin={isSuperAdmin} />
            case "results":
                return <ResultsOverview isSuperAdmin={isSuperAdmin} />
            case "users":
                return isSuperAdmin ? <UserManagement /> : null
            default:
                return (
                    <div className="space-y-6">
                        {/* Top Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-200">Total Voters</CardTitle>
                                    <Users className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{dashboardStats.totalVoters.toLocaleString()}</div>
                                    <div className="flex items-center text-xs text-green-400">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +12.5%
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Registered users</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-200">Votes Cast</CardTitle>
                                    <Vote className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{dashboardStats.votesSubmitted.toLocaleString()}</div>
                                    <div className="flex items-center text-xs text-red-400">
                                        <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                                        -5.2%
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Down from last period</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-200">Active Candidates</CardTitle>
                                    <UserPlus className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{dashboardStats.candidatesRegistered}</div>
                                    <div className="flex items-center text-xs text-green-400">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +8.1%
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Strong candidate pool</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-200">Turnout Rate</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{dashboardStats.votingProgress}%</div>
                                    <div className="flex items-center text-xs text-green-400">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +4.5%
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Meets growth projections</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart Section */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white">Voting Activity</CardTitle>
                                        <CardDescription className="text-gray-400">Total votes for the last 3 months</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-200">
                                            Last 3 months
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-gray-400">
                                            Last 30 days
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-gray-400">
                                            Last 7 days
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/*
                  CHART INTEGRATION POINT:
                  Replace this placeholder with shadcn/ui Chart component

                  Example:
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <AreaChart data={votingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="online"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="mobile"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                    </AreaChart>
                  </ChartContainer>
                */}
                                <div className="h-[400px] bg-gray-900 rounded-lg flex items-center justify-center border border-gray-600">
                                    <div className="text-center text-gray-400">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                        <p className="text-lg font-medium">Chart Integration Point</p>
                                        <p className="text-sm">Replace with shadcn/ui Chart component</p>
                                        <p className="text-xs mt-2">Area chart showing voting trends over time</p>
                                    </div>
                                </div>

                                {/* Chart Legend */}
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-300">Online Votes</span>
                                        <span className="text-sm text-gray-400">650</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-300">Mobile Votes</span>
                                        <span className="text-sm text-gray-400">242</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Table Section */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Tabs defaultValue="overview" className="w-full">
                                        <div className="flex items-center justify-between">
                                            <TabsList className="bg-gray-700">
                                                <TabsTrigger value="overview" className="data-[state=active]:bg-gray-600">
                                                    Overview
                                                </TabsTrigger>
                                                <TabsTrigger value="performance" className="data-[state=active]:bg-gray-600">
                                                    Performance
                                                    <Badge variant="secondary" className="ml-2 bg-gray-600">
                                                        3
                                                    </Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="positions" className="data-[state=active]:bg-gray-600">
                                                    Key Positions
                                                    <Badge variant="secondary" className="ml-2 bg-gray-600">
                                                        2
                                                    </Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="reports" className="data-[state=active]:bg-gray-600">
                                                    Reports
                                                </TabsTrigger>
                                            </TabsList>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-200">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    Customize Columns
                                                </Button>
                                                <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-200">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Section
                                                </Button>
                                            </div>
                                        </div>

                                        <TabsContent value="overview" className="mt-6">
                                            <div className="border border-gray-600 rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-700">
                                                    <tr>
                                                        <th className="text-left p-4 text-sm font-medium text-gray-200">Position</th>
                                                        <th className="text-left p-4 text-sm font-medium text-gray-200">Candidates</th>
                                                        <th className="text-left p-4 text-sm font-medium text-gray-200">Status</th>
                                                        <th className="text-left p-4 text-sm font-medium text-gray-200">Votes</th>
                                                        <th className="text-left p-4 text-sm font-medium text-gray-200">Turnout</th>
                                                        <th className="text-left p-4 text-sm font-medium text-gray-200">Leader</th>
                                                        <th className="text-right p-4 text-sm font-medium text-gray-200"></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    <tr className="border-t border-gray-600">
                                                        <td className="p-4 text-sm text-white">President</td>
                                                        <td className="p-4 text-sm text-gray-300">3 candidates</td>
                                                        <td className="p-4">
                                                            <Badge className="bg-yellow-600 text-yellow-100">In Progress</Badge>
                                                        </td>
                                                        <td className="p-4 text-sm text-white">892</td>
                                                        <td className="p-4 text-sm text-gray-300">71.5%</td>
                                                        <td className="p-4 text-sm text-gray-300">John Doe</td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-t border-gray-600">
                                                        <td className="p-4 text-sm text-white">Vice President</td>
                                                        <td className="p-4 text-sm text-gray-300">2 candidates</td>
                                                        <td className="p-4">
                                                            <Badge className="bg-green-600 text-green-100">Active</Badge>
                                                        </td>
                                                        <td className="p-4 text-sm text-white">856</td>
                                                        <td className="p-4 text-sm text-gray-300">68.6%</td>
                                                        <td className="p-4 text-sm text-gray-300">Jane Smith</td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-t border-gray-600">
                                                        <td className="p-4 text-sm text-white">General Secretary</td>
                                                        <td className="p-4 text-sm text-gray-300">1 candidate</td>
                                                        <td className="p-4">
                                                            <Badge className="bg-green-600 text-green-100">Unopposed</Badge>
                                                        </td>
                                                        <td className="p-4 text-sm text-white">834</td>
                                                        <td className="p-4 text-sm text-gray-300">66.9%</td>
                                                        <td className="p-4 text-sm text-gray-300">Alice Johnson</td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="performance" className="mt-6">
                                            <div className="text-center py-8 text-gray-400">
                                                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                                <p>Performance metrics will be displayed here</p>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="positions" className="mt-6">
                                            <div className="text-center py-8 text-gray-400">
                                                <Users className="h-12 w-12 mx-auto mb-4" />
                                                <p>Key positions analysis will be displayed here</p>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="reports" className="mt-6">
                                            <div className="text-center py-8 text-gray-400">
                                                <FileText className="h-12 w-12 mx-auto mb-4" />
                                                <p>Generated reports will be displayed here</p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                )
        }
    }

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSuperAdmin={isSuperAdmin}
                user={user}
                onLogout={logout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-white capitalize">
                                {activeTab === "dashboard" ? "Election Dashboard" : activeTab.replace("-", " ")}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-200">
                                Export Data
                            </Button>
                            <Badge variant={isSuperAdmin ? "default" : "secondary"} className="px-3 py-1">
                                <Shield className="w-4 h-4 mr-1" />
                                {isSuperAdmin ? "Super Admin" : "Member"}
                            </Badge>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-6">{renderMainContent()}</main>
            </div>
        </div>
    )
}
