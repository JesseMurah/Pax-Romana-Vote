"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, RotateCcw, Users, Mail, Phone } from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    phone?: string
    role: "super_admin" | "member"
    status: "active" | "inactive"
    lastLogin?: string
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([
        {
            id: "1",
            name: "John Admin",
            email: "admin@example.com",
            phone: "+1234567890",
            role: "super_admin",
            status: "active",
            lastLogin: "2024-01-20",
        },
        {
            id: "2",
            name: "Jane Member",
            email: "member@example.com",
            phone: "+1234567891",
            role: "member",
            status: "active",
            lastLogin: "2024-01-19",
        },
    ])

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRole, setSelectedRole] = useState<string>("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "member" as "super_admin" | "member",
    })

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === "all" || user.role === selectedRole
        return matchesSearch && matchesRole
    })

    const handleAddUser = () => {
        const newUser: User = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: "active",
        }
        setUsers([...users, newUser])
        setFormData({ name: "", email: "", phone: "", role: "member" })
        setIsAddDialogOpen(false)
    }

    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
        })
    }

    const handleUpdateUser = () => {
        if (!editingUser) return

        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)))
        setEditingUser(null)
        setFormData({ name: "", email: "", phone: "", role: "member" })
    }

    const handleResetPassword = (userId: string) => {
        // In a real app, this would trigger a password reset email
        alert(`Password reset email sent to user ${userId}`)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Management
                    </CardTitle>
                    <CardDescription>Manage system users and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>Create a new user account</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name or Identifier</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter user name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone (Optional)</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="role">Role Assignment</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value: "super_admin" | "member") => setFormData({ ...formData, role: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleAddUser} className="flex-1">
                                            Add User
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Users Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3 text-gray-400" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                                                {user.role === "super_admin" ? "Super Admin" : "Member"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                                        </TableCell>
                                        <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit User</DialogTitle>
                                                            <DialogDescription>Update user information and role</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="edit-name">Name</Label>
                                                                <Input
                                                                    id="edit-name"
                                                                    value={formData.name}
                                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-email">Email</Label>
                                                                <Input
                                                                    id="edit-email"
                                                                    type="email"
                                                                    value={formData.email}
                                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-phone">Phone</Label>
                                                                <Input
                                                                    id="edit-phone"
                                                                    value={formData.phone}
                                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-role">Role</Label>
                                                                <Select
                                                                    value={formData.role}
                                                                    onValueChange={(value: "super_admin" | "member") =>
                                                                        setFormData({ ...formData, role: value })
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="member">Member</SelectItem>
                                                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex gap-2 pt-4">
                                                                <Button onClick={handleUpdateUser} className="flex-1">
                                                                    Update
                                                                </Button>
                                                                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
