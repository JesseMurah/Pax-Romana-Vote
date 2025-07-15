"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { NominationForm } from "@/components/nomination-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle } from "lucide-react"

export default function NominationsPage() {
  const [activeTab, setActiveTab] = useState("submit")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">IMCS PAX ROMANA Nominations</h1>
            <p className="text-gray-600">Submit or verify nominations for the 2024/2025 academic year</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submit Nomination
              </TabsTrigger>
              <TabsTrigger value="verify" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Verify Nomination
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <Card>
                <CardHeader>
                  <CardTitle>Nomination Submission</CardTitle>
                  <CardDescription>
                    Fill out the nomination form for the 2024/2025 IMCS PAX ROMANA Executive positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NominationForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verify">
              <Card>
                <CardHeader>
                  <CardTitle>Nomination Verification</CardTitle>
                  <CardDescription>
                    Enter the verification code sent to your email to verify a nomination
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-center text-gray-600 mb-4">
                      Please enter the verification code that was sent to your email address.
                    </p>
                    <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                      <input
                        type="text"
                        placeholder="Enter verification code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Verify Nomination
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
