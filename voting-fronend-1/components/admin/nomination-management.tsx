"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Eye, Check, X, Clock, User, Mail, Calendar } from "lucide-react"

interface Nomination {
    id: string
    aspirantName: string
    position: string
    submissionDate: string
    verificationDate?: string
    status: "pending" | "verified" | "approved" | "rejected"
    nominatorEmail: string
    guarantorEmails: string[]
    documents: string[]
}

export function NominationManagement() {
    const [nominations, setNominations] = useState<Nomination[]>([
        {
            id: "1",
            aspirantName: "Alice Johnson",
            position: "President",
            submissionDate: "2024-01-15",
            status: "verified",
            nominatorEmail: "nominator1@example.com",
            guarantorEmails: ["guarantor1@example.com", "guarantor2@example.com"],
            documents: ["passport_photo.jpg", "statement.pdf"],
        },
        {
            id: "2",
            aspirantName: "Bob Wilson",
            position: "Vice-President",
            submissionDate: "2024-01-16",
            status: "pending",
            nominatorEmail: "nominator2@example.com",
            guarantorEmails: ["guarantor3@example.com", "guarantor4@example.com"],
            documents: ["passport_photo.jpg", "cv.pdf"],
        },
    ])

    const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null)
    const [actionReason, setActionReason] = useState("")

    const handleApprove = (id: string) => {
        setNominations(nominations.map((n) => (n.id === id ? { ...n, status: "approved" as const } : n)))
        setSelectedNomination(null)
        setActionReason("")
    }

    const handleReject = (id: string) => {
        setNominations(nominations.map((n) => (n.id === id ? { ...n, status: "rejected" as const } : n)))
        setSelectedNomination(null)
        setActionReason("")
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "verified":
                return "bg-blue-100 text-blue-800"
            case "approved":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4" />
            case "verified":
                return <Eye className="h-4 w-4" />
            case "approved":
                return <Check className="h-4 w-4" />
            case "rejected":
                return <X className="h-4 w-4" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Nomination Management
                    </CardTitle>
                    <CardDescription>Review and manage candidate nominations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Aspirant</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nominations.map((nomination) => (
                                    <TableRow key={nomination.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{nomination.aspirantName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{nomination.position}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {new Date(nomination.submissionDate).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(nomination.status)}>
                                                {getStatusIcon(nomination.status)}
                                                <span className="ml-1 capitalize">{nomination.status}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600">
                                                <div>Nominator: ✓</div>
                                                <div>Guarantors: {nomination.guarantorEmails.length}/2 ✓</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedNomination(nomination)}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View Details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Nomination Details</DialogTitle>
                                                            <DialogDescription>
                                                                Complete information for {nomination.aspirantName}'s nomination
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        {selectedNomination && (
                                                            <div className="space-y-6">
                                                                {/* Basic Information */}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label className="text-sm font-medium">Aspirant Name</Label>
                                                                        <p className="text-sm text-gray-600">{selectedNomination.aspirantName}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-sm font-medium">Position</Label>
                                                                        <p className="text-sm text-gray-600">{selectedNomination.position}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-sm font-medium">Submission Date</Label>
                                                                        <p className="text-sm text-gray-600">
                                                                            {new Date(selectedNomination.submissionDate).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-sm font-medium">Current Status</Label>
                                                                        <Badge className={getStatusColor(selectedNomination.status)}>
                                                                            {selectedNomination.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>

                                                                {/* Verification Status */}
                                                                <div>
                                                                    <Label className="text-sm font-medium">Verification Status</Label>
                                                                    <div className="mt-2 space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                                            <span className="text-sm">Nominator ({selectedNomination.nominatorEmail})</span>
                                                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                                Verified
                                                                            </Badge>
                                                                        </div>
                                                                        {selectedNomination.guarantorEmails.map((email, index) => (
                                                                            <div key={index} className="flex items-center gap-2">
                                                                                <Mail className="h-4 w-4 text-gray-400" />
                                                                                <span className="text-sm">
                                          Guarantor {index + 1} ({email})
                                        </span>
                                                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                                    Verified
                                                                                </Badge>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Documents */}
                                                                <div>
                                                                    <Label className="text-sm font-medium">Submitted Documents</Label>
                                                                    <div className="mt-2 space-y-2">
                                                                        {selectedNomination.documents.map((doc, index) => (
                                                                            <div key={index} className="flex items-center gap-2">
                                                                                <FileText className="h-4 w-4 text-gray-400" />
                                                                                <span className="text-sm">{doc}</span>
                                                                                <Button variant="link" size="sm" className="p-0 h-auto">
                                                                                    View
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Action Reason */}
                                                                {selectedNomination.status === "verified" && (
                                                                    <div>
                                                                        <Label htmlFor="reason">Action Reason (Optional)</Label>
                                                                        <Textarea
                                                                            id="reason"
                                                                            value={actionReason}
                                                                            onChange={(e) => setActionReason(e.target.value)}
                                                                            placeholder="Provide a reason for your decision..."
                                                                            rows={3}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Action Buttons */}
                                                                {selectedNomination.status === "verified" && (
                                                                    <div className="flex gap-2 pt-4">
                                                                        <Button
                                                                            onClick={() => handleApprove(selectedNomination.id)}
                                                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Check className="h-4 w-4 mr-2" />
                                                                            Approve Nomination
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => handleReject(selectedNomination.id)}
                                                                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                                        >
                                                                            <X className="h-4 w-4 mr-2" />
                                                                            Reject Nomination
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
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
