import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Vote, Lock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Pax Voting</h1>
            <p className="text-xl text-gray-600">Secure, accessible, and transparent digital voting platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Security First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our platform uses end-to-end encryption, multi-factor authentication, and blockchain technology to
                  ensure your vote is secure and tamper-proof.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Designed with accessibility in mind, our platform works across all devices and supports screen readers
                  and other assistive technologies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-purple-600" />
                  Easy to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simple, intuitive interface that makes voting quick and easy. Complete the entire process in just a
                  few minutes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  Privacy Protected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your personal information and voting choices are kept completely private and anonymous while
                  maintaining election integrity.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Our secure voting process in three simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Verify Your Identity</h3>
                    <p className="text-gray-600">
                      Enter your name and phone number to receive a secure verification code via SMS.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Cast Your Vote</h3>
                    <p className="text-gray-600">
                      Review all available elections and candidates, then make your selections.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure Submission</h3>
                    <p className="text-gray-600">
                      Your votes are encrypted and securely submitted to our tamper-proof system.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
