"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, User, Upload } from "lucide-react"

const positions = [
    "President",
    "Vice-President",
    "Gen. Secretary",
    "Financial Secretary",
    "1st Organizer",
    "2nd Organizer",
    "Main PRO",
    "Deputy PRO",
    "Women's Organizer",
]

interface Candidate {
    id: string
    name: string
    position: string
    party?: string
    photo?: string
    biography?: string
    status: "active" | "inactive"
}

export function CandidateManagement() {
    const [candidates, setCandidates] = useState<Candidate[]>([
        {
            id: "1",
            name: "John Doe",
            position: "President",
            party: "Party A",
            photo: "/placeholder.svg?height=40&width=40",
            biography: "Experienced leader with vision for change",
            status: "active",
        },
        {
            id: "2",
            name: "Jane Smith",
            position: "Vice-President",
            party: "Party B",
            photo: "/placeholder.svg?height=40&width=40",
            biography: "Dedicated to student welfare and progress",
            status: "active",
        },
    ])

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPosition, setSelectedPosition] = useState<string>("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        position: "",
        party: "",
        biography: "",
        photo: "",
    })

    const filteredCandidates = candidates.filter((candidate) => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.party?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPosition = selectedPosition === "all" || candidate.position === selectedPosition
        return matchesSearch && matchesPosition
    })

    const handleAddCandidate = () => {
        const newCandidate: Candidate = {
            id: Date.now().toString(),
            name: formData.name,
            position: formData.position,
            party: formData.party,
            biography: formData.biography,
            photo: formData.photo || "/placeholder.svg?height=40&width=40",
            status: "active",
        }
        setCandidates([...candidates, newCandidate])
        setFormData({ name: "", position: "", party: "", biography: "", photo: "" })
        setIsAddDialogOpen(false)
    }

    const handleEditCandidate = (candidate: Candidate) => {
        setEditingCandidate(candidate)
        setFormData({
            name: candidate.name,
            position: candidate.position,
            party: candidate.party || "",
            biography: candidate.biography || "",
            photo: candidate.photo || "",
        })
    }

    const handleUpdateCandidate = () => {
        if (!editingCandidate) return

        setCandidates(candidates.map((c) => (c.id === editingCandidate.id ? { ...c, ...formData } : c)))
        setEditingCandidate(null)
        setFormData({ name: "", position: "", party: "", biography: "", photo: "" })
    }

    const handleRemoveCandidate = (id: string) => {
        setCandidates(candidates.filter((c) => c.id !== id))
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Candidate Management
                    </CardTitle>
                    <CardDescription>Manage candidates for all positions in the election</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search candidates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
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
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Candidate
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New Candidate</DialogTitle>
                                    <DialogDescription>Enter the candidate's information below</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter candidate name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="position">Position</Label>
                                        <Select
                                            value={formData.position}
                                            onValueChange={(value) => setFormData({ ...formData, position: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positions.map((position) => (
                                                    <SelectItem key={position} value={position}>
                                                        {position}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="party">Party (Optional)</Label>
                                        <Input
                                            id="party"
                                            value={formData.party}
                                            onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                                            placeholder="Enter party affiliation"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="biography">Biography (Optional)</Label>
                                        <Textarea
                                            id="biography"
                                            value={formData.biography}
                                            onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                                            placeholder="Brief candidate statement or biography"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="photo">Photo Upload</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="photo" type="file" accept="image/*" className="hidden" />
                                            <Button variant="outline" size="sm" asChild>
                                                <label htmlFor="photo" className="cursor-pointer">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload Photo
                                                </label>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleAddCandidate} className="flex-1">
                                            Add Candidate
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Candidates Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Party</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCandidates.map((candidate) => (
                                    <TableRow key={candidate.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={candidate.photo || "/placeholder.svg"} />
                                                    <AvatarFallback>
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{candidate.name}</div>
                                                    {candidate.biography && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{candidate.biography}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{candidate.position}</Badge>
                                        </TableCell>
                                        <TableCell>{candidate.party || "Independent"}</TableCell>
                                        <TableCell>
                                            <Badge variant={candidate.status === "active" ? "default" : "secondary"}>
                                                {candidate.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => handleEditCandidate(candidate)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Candidate</DialogTitle>
                                                            <DialogDescription>Update the candidate's information</DialogDescription>
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
                                                                <Label htmlFor="edit-position">Position</Label>
                                                                <Select
                                                                    value={formData.position}
                                                                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {positions.map((position) => (
                                                                            <SelectItem key={position} value={position}>
                                                                                {position}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-party">Party</Label>
                                                                <Input
                                                                    id="edit-party"
                                                                    value={formData.party}
                                                                    onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="edit-biography">Biography</Label>
                                                                <Textarea
                                                                    id="edit-biography"
                                                                    value={formData.biography}
                                                                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 pt-4">
                                                                <Button onClick={handleUpdateCandidate} className="flex-1">
                                                                    Update
                                                                </Button>
                                                                <Button variant="outline" onClick={() => setEditingCandidate(null)} className="flex-1">
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveCandidate(candidate.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No candidates found matching your criteria.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
