"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    BarChart3,
    Users,
    FileText,
    Eye,
    Settings,
    HelpCircle,
    Search,
    Plus,
    Vote,
    UserPlus,
    Activity,
    LogOut,
    User,
} from "lucide-react"

interface AdminSidebarProps {
    activeTab: string
    setActiveTab: (tab: string) => void
    isSuperAdmin: boolean
    user: any
    onLogout: () => void
}

export function AdminSidebar({ activeTab, setActiveTab, isSuperAdmin, user, onLogout }: AdminSidebarProps) {
    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: BarChart3 },
        { id: "monitoring", label: "Live Monitoring", icon: Activity },
        { id: "results", label: "Results", icon: Vote },
        ...(isSuperAdmin
            ? [
                { id: "candidates", label: "Candidates", icon: UserPlus },
                { id: "nominations", label: "Nominations", icon: FileText },
                { id: "users", label: "User Management", icon: Users },
            ]
            : []),
    ]

    const documentItems = [
        { id: "reports", label: "Election Reports", icon: FileText },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "audit", label: "Audit Logs", icon: Eye },
    ]

    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <span className="font-semibold text-white">VoteWise Admin</span>
                </div>

                {/* Quick Create */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Quick Create" className="bg-gray-700 border-gray-600 text-white pl-10 text-sm" />
                    <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto p-4">
                <nav className="space-y-2">
                    {navigationItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={`w-full justify-start text-left ${
                                activeTab === item.id ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
                            }`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className="mr-3 h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>

                {/* Documents Section */}
                <div className="mt-8">
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Documents</h3>
                    <nav className="space-y-2">
                        {documentItems.map((item) => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-700"
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon className="mr-3 h-4 w-4" />
                                {item.label}
                            </Button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                </Button>

                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    Get Help
                </Button>

                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700">
                    <Search className="mr-3 h-4 w-4" />
                    Search
                </Button>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                    <AvatarFallback className="bg-gray-600">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-white truncate">{user?.name || "Admin User"}</div>
                                    <div className="text-xs text-gray-400 truncate">{user?.email || "admin@example.com"}</div>
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-gray-700" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
