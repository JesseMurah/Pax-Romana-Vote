"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/file-upload";

interface Guarantor {
  name: string;
  programme: string;
  subgroup: string;
  contact: string;
  email: string;
}

interface NominationFormData {
  nominatorName: string;
  nominatorProgramme: string;
  nominatorLevel: string;
  nominatorSubgroup: string;
  nominatorContact: string;
  nominatorEmail: string;

  nomineeName: string;
  nomineeCollege: string;
  nomineeDepartment: string;
  nomineePosition: string;
  nomineeDateOfBirth: string;
  nomineeHostel: string;
  nomineeRoom: string;
  nomineeSex: string;
  nomineeCwa: string;
  nomineeProgramme: string;
  nomineeLevel: string;
  nomineeEmail: string;
  nomineeParish: string;
  nomineeNationality: string;
  nomineeSubgroups: string[];
  nomineeRegion: string;
  nomineeContact: string;

  nomineeEducation: string[];
  hasLeadershipPosition: boolean;
  leadershipPositions: string[];
  hasServedCommittee: boolean;
  committees: string[];

  skills: string[];
  visionForOffice: string[];
  knowledgeAboutOffice: string[];

  guarantors: Guarantor[];

  photo: File | null;
}

const initialGuarantor = {
  name: "",
  programme: "",
  subgroup: "",
  contact: "",
  email: "",
};

export function NominationForm() {
  const [formData, setFormData] = useState<NominationFormData>({
    nominatorName: "",
    nominatorProgramme: "",
    nominatorLevel: "",
    nominatorSubgroup: "",
    nominatorContact: "",
    nominatorEmail: "",

    nomineeName: "",
    nomineeCollege: "",
    nomineeDepartment: "",
    nomineePosition: "",
    nomineeDateOfBirth: "",
    nomineeHostel: "",
    nomineeRoom: "",
    nomineeSex: "",
    nomineeCwa: "",
    nomineeProgramme: "",
    nomineeLevel: "",
    nomineeEmail: "",
    nomineeParish: "",
    nomineeNationality: "",
    nomineeSubgroups: ["", "", "", ""],
    nomineeRegion: "",
    nomineeContact: "",

    nomineeEducation: ["", "", "", ""],
    hasLeadershipPosition: false,
    leadershipPositions: ["", "", "", ""],
    hasServedCommittee: false,
    committees: ["", "", ""],

    skills: ["", "", "", ""],
    visionForOffice: ["", "", ""],
    knowledgeAboutOffice: ["", "", ""],

    guarantors: Array(6).fill(null).map(() => ({ ...initialGuarantor })),

    photo: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: string, value: string | boolean | string[] | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuarantorChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedGuarantors = [...prev.guarantors];
      updatedGuarantors[index] = { ...updatedGuarantors[index], [field]: value };
      return { ...prev, guarantors: updatedGuarantors };
    });
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData((prev) => {
      const updatedArray = [...(prev[field as keyof NominationFormData] as string[])];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create the payload object - NOT FormData for JSON API
      const payload = {
        aspirantName: formData.nomineeName,
        aspirantPhoneNumber: formData.nomineeContact,
        aspirantEmail: formData.nomineeEmail,
        position: formData.nomineePosition,
        photoUrl: "https://example.com/placeholder.jpg",
        nomineeCollege: formData.nomineeCollege,
        nomineeDepartment: formData.nomineeDepartment,
        nomineeDateOfBirth: formData.nomineeDateOfBirth,
        nomineeHostel: formData.nomineeHostel,
        nomineeRoom: formData.nomineeRoom,
        nomineeSex: formData.nomineeSex,
        nomineeCwa: formData.nomineeCwa,
        nomineeProgramme: formData.nomineeProgramme,
        nomineeLevel: formData.nomineeLevel,
        nomineeParish: formData.nomineeParish,
        nomineeNationality: formData.nomineeNationality,
        nomineeRegion: formData.nomineeRegion,
        // Send as arrays, not JSON strings
        nomineeSubgroups: formData.nomineeSubgroups.filter(s => s.trim()),
        nomineeEducation: formData.nomineeEducation.filter(s => s.trim()),
        hasLeadershipPosition: formData.hasLeadershipPosition,
        leadershipPositions: formData.leadershipPositions.filter(s => s.trim()),
        hasServedCommittee: formData.hasServedCommittee,
        committees: formData.committees.filter(s => s.trim()),
        skills: formData.skills.filter(s => s.trim()),
        visionForOffice: formData.visionForOffice.filter(s => s.trim()),
        knowledgeAboutOffice: formData.knowledgeAboutOffice.filter(s => s.trim()),
        // Send as object, not JSON string
        nominatorVerification: {
          name: formData.nominatorName,
          email: formData.nominatorEmail,
          contact: formData.nominatorContact,
          programme: formData.nominatorProgramme,
          level: formData.nominatorLevel,
          subgroup: formData.nominatorSubgroup,
        },
        // Send as array of objects, not JSON string
        guarantorVerifications: formData.guarantors
            .filter((g) => g.name && g.email)
            .slice(0, 2)
            .map(g => ({
              name: g.name,
              email: g.email,
              contact: g.contact,
              programme: g.programme,
              subgroup: g.subgroup,
            }))
      };

      console.log("Sending payload:", payload);

      const response = await axios.post("http://localhost:3000/api/v1/nominations", payload, {
        headers: {
          "Content-Type": "application/json"
        },
      });

      console.log("Response:", response.data);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      let errorMsg = "Failed to submit nomination";

      //@ts-ignore
      if (error.response?.data?.message) {
        //@ts-ignore
        const backendMessage = error.response.data.message;

        // Handle specific error cases
        if (backendMessage.includes("already have a nomination for this position")) {
          errorMsg = `${formData.nomineeName} already has a nomination for ${formData.nomineePosition}. Each person can only be nominated once per position.`;
        } else if (backendMessage.includes("Service not available")) {
          errorMsg = "Email service is temporarily unavailable. The nomination was created but verification emails could not be sent. Please contact the administrator.";
        } else if (backendMessage.includes("Invalid email")) {
          errorMsg = "One or more email addresses are invalid. Please check all email fields.";
        } else {
          errorMsg = backendMessage;
        }
        //@ts-ignore
      } else if (error.message) {
        //@ts-ignore
        errorMsg = error.message;
      }

      //@ts-ignore
      console.error("Error:", error.response?.data || error);
      setError(errorMsg);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  if (success) {
    return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nomination Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your nomination has been submitted. Verification emails have been sent to the nominee and guarantors. They
            will need to verify the nomination for it to be considered.
          </p>
          <Button onClick={() => window.location.reload()} className="mx-auto">
            Submit Another Nomination
          </Button>
        </div>
    );
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="flex justify-between mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
                <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === step
                            ? "bg-blue-600 text-white"
                            : currentStep > step
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {currentStep > step ? (
                      <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                  ) : (
                      step
                  )}
                </div>
            ))}
          </div>
          <div className="text-sm font-medium text-gray-600">Step {currentStep} of 4</div>
        </div>

        {currentStep === 1 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Nominator Information</h3>
                <p className="text-sm text-blue-700">
                  As the nominator, you must be an active member of any subgroup. Please provide your details below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nominatorName">Full Name *</Label>
                  <Input
                      id="nominatorName"
                      value={formData.nominatorName}
                      onChange={(e) => handleInputChange("nominatorName", e.target.value)}
                      placeholder="Enter your full name"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominatorProgramme">Programme *</Label>
                  <Input
                      id="nominatorProgramme"
                      value={formData.nominatorProgramme}
                      onChange={(e) => handleInputChange("nominatorProgramme", e.target.value)}
                      placeholder="e.g., BSc. Computer Science"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominatorLevel">Year/Level *</Label>
                  <Select
                      value={formData.nominatorLevel}
                      onValueChange={(value) => handleInputChange("nominatorLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Level 100</SelectItem>
                      <SelectItem value="200">Level 200</SelectItem>
                      <SelectItem value="300">Level 300</SelectItem>
                      <SelectItem value="400">Level 400</SelectItem>
                      <SelectItem value="500">Level 500</SelectItem>
                      <SelectItem value="600">Level 600</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominatorSubgroup">Subgroup *</Label>
                  <Input
                      id="nominatorSubgroup"
                      value={formData.nominatorSubgroup}
                      onChange={(e) => handleInputChange("nominatorSubgroup", e.target.value)}
                      placeholder="Enter your subgroup"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominatorContact">Contact Number *</Label>
                  <Input
                      id="nominatorContact"
                      value={formData.nominatorContact}
                      onChange={(e) => handleInputChange("nominatorContact", e.target.value)}
                      placeholder="e.g., 0241234567"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominatorEmail">Email Address *</Label>
                  <Input
                      id="nominatorEmail"
                      type="email"
                      value={formData.nominatorEmail}
                      onChange={(e) => handleInputChange("nominatorEmail", e.target.value)}
                      placeholder="e.g., example@gmail.com"
                      required
                  />
                  <p className="text-xs text-gray-500">A verification email will be sent to this address</p>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Nominee Information</h3>
                <p className="text-sm text-blue-700">
                  Please provide the details of the person you are nominating for an executive position.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomineeName">Full Name of Nominee *</Label>
                  <Input
                      id="nomineeName"
                      value={formData.nomineeName}
                      onChange={(e) => handleInputChange("nomineeName", e.target.value)}
                      placeholder="Enter nominee's full name"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineePosition">Position Contesting For *</Label>
                  <Select
                      value={formData.nomineePosition}
                      onValueChange={(value) => handleInputChange("nomineePosition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESIDENT">President</SelectItem>
                      <SelectItem value="VICE_PRESIDENT">Vice President</SelectItem>
                      <SelectItem value="GEN_SECRETARY">Secretary</SelectItem>
                      <SelectItem value="FINANCIAL_SECRETARY">Financial Secretary</SelectItem>
                      <SelectItem value="ORGANIZING_SECRETARY_MAIN">Organizing Secretary(Main)</SelectItem>
                      <SelectItem value="ORGANIZING_SECRETARY_ASST">Organizing Secretary(Asst.)</SelectItem>
                      <SelectItem value="PRO_MAIN">PRO(Main)</SelectItem>
                      <SelectItem value="PRO_ASSISTANT">PRO(Asst.)</SelectItem>
                      <SelectItem value="WOMEN_COMMISSIONER">Women Commissioner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeCollege">College *</Label>
                  <Input
                      id="nomineeCollege"
                      value={formData.nomineeCollege}
                      onChange={(e) => handleInputChange("nomineeCollege", e.target.value)}
                      placeholder="e.g., College of Engineering"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeDepartment">Department *</Label>
                  <Input
                      id="nomineeDepartment"
                      value={formData.nomineeDepartment}
                      onChange={(e) => handleInputChange("nomineeDepartment", e.target.value)}
                      placeholder="e.g., Computer Engineering"
                      required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              </div>
            </>
        )}

        {currentStep === 2 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Nominee Personal Details</h3>
                <p className="text-sm text-blue-700">Please provide additional personal information about the nominee.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomineeDateOfBirth">Date of Birth *</Label>
                  <Input
                      id="nomineeDateOfBirth"
                      type="date"
                      value={formData.nomineeDateOfBirth}
                      onChange={(e) => handleInputChange("nomineeDateOfBirth", e.target.value)}
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeSex">Sex *</Label>
                  <Select value={formData.nomineeSex} onValueChange={(value) => handleInputChange("nomineeSex", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeHostel">Hostel/Hall *</Label>
                  <Input
                      id="nomineeHostel"
                      value={formData.nomineeHostel}
                      onChange={(e) => handleInputChange("nomineeHostel", e.target.value)}
                      placeholder="e.g., Independence Hall"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeRoom">Room Number *</Label>
                  <Input
                      id="nomineeRoom"
                      value={formData.nomineeRoom}
                      onChange={(e) => handleInputChange("nomineeRoom", e.target.value)}
                      placeholder="e.g., A24"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeCwa">CWA *</Label>
                  <Input
                      id="nomineeCwa"
                      value={formData.nomineeCwa}
                      onChange={(e) => handleInputChange("nomineeCwa", e.target.value)}
                      placeholder="e.g., 72.5"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeProgramme">Programme *</Label>
                  <Input
                      id="nomineeProgramme"
                      value={formData.nomineeProgramme}
                      onChange={(e) => handleInputChange("nomineeProgramme", e.target.value)}
                      placeholder="e.g., BSc. Computer Science"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeLevel">Year/Level *</Label>
                  <Select value={formData.nomineeLevel} onValueChange={(value) => handleInputChange("nomineeLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Level 100</SelectItem>
                      <SelectItem value="200">Level 200</SelectItem>
                      <SelectItem value="300">Level 300</SelectItem>
                      <SelectItem value="400">Level 400</SelectItem>
                      <SelectItem value="500">Level 500</SelectItem>
                      <SelectItem value="600">Level 600</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeEmail">Email Address *</Label>
                  <Input
                      id="nomineeEmail"
                      type="email"
                      value={formData.nomineeEmail}
                      onChange={(e) => handleInputChange("nomineeEmail", e.target.value)}
                      placeholder="e.g., example@gmail.com"
                      required
                  />
                  <p className="text-xs text-gray-500">A verification email will be sent to this address</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeParish">Home Parish *</Label>
                  <Input
                      id="nomineeParish"
                      value={formData.nomineeParish}
                      onChange={(e) => handleInputChange("nomineeParish", e.target.value)}
                      placeholder="e.g., St. Mary's Parish"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeNationality">Nationality *</Label>
                  <Input
                      id="nomineeNationality"
                      value={formData.nomineeNationality}
                      onChange={(e) => handleInputChange("nomineeNationality", e.target.value)}
                      placeholder="e.g., Ghanaian"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeRegion">Region *</Label>
                  <Input
                      id="nomineeRegion"
                      value={formData.nomineeRegion}
                      onChange={(e) => handleInputChange("nomineeRegion", e.target.value)}
                      placeholder="e.g., Greater Accra"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomineeContact">Contact Number *</Label>
                  <Input
                      id="nomineeContact"
                      value={formData.nomineeContact}
                      onChange={(e) => handleInputChange("nomineeContact", e.target.value)}
                      placeholder="e.g., 0241234567"
                      required
                  />
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label>Subgroups (up to 4)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                      <Input
                          key={index}
                          value={formData.nomineeSubgroups[index] || ""}
                          onChange={(e) => handleArrayInputChange("nomineeSubgroups", index, e.target.value)}
                          placeholder={`Subgroup ${index + 1}`}
                      />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label>Educational Background</Label>
                <div className="space-y-4">
                  {[0, 1, 2, 3].map((index) => (
                      <Input
                          key={index}
                          value={formData.nomineeEducation[index] || ""}
                          onChange={(e) => handleArrayInputChange("nomineeEducation", index, e.target.value)}
                          placeholder={`School ${index + 1}`}
                      />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                      id="hasLeadershipPosition"
                      checked={formData.hasLeadershipPosition}
                      onCheckedChange={(checked) => handleInputChange("hasLeadershipPosition", !!checked)}
                  />
                  <Label htmlFor="hasLeadershipPosition">Have you held any leadership position before?</Label>
                </div>

                {formData.hasLeadershipPosition && (
                    <div className="space-y-4 mt-4 pl-6">
                      <Label>Leadership Positions</Label>
                      {[0, 1, 2, 3].map((index) => (
                          <Input
                              key={index}
                              value={formData.leadershipPositions[index] || ""}
                              onChange={(e) => handleArrayInputChange("leadershipPositions", index, e.target.value)}
                              placeholder={`Position ${index + 1}`}
                          />
                      ))}
                    </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous Step
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              </div>
            </>
        )}

        {currentStep === 3 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Nominee Qualifications</h3>
                <p className="text-sm text-blue-700">
                  Please provide information about the nominee's skills, vision, and knowledge about the position.
                </p>
              </div>

              <div className="space-y-2 mt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                      id="hasServedCommittee"
                      checked={formData.hasServedCommittee}
                      onCheckedChange={(checked) => handleInputChange("hasServedCommittee", !!checked)}
                  />
                  <Label htmlFor="hasServedCommittee">Have you served on any committee before?</Label>
                </div>

                {formData.hasServedCommittee && (
                    <div className="space-y-4 mt-4 pl-6">
                      <Label>Committees</Label>
                      {[0, 1, 2].map((index) => (
                          <Input
                              key={index}
                              value={formData.committees[index] || ""}
                              onChange={(e) => handleArrayInputChange("committees", index, e.target.value)}
                              placeholder={`Committee ${index + 1}`}
                          />
                      ))}
                    </div>
                )}
              </div>

              <div className="space-y-2 mt-6">
                <Label>Skills (up to 4)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                      <Input
                          key={index}
                          value={formData.skills[index] || ""}
                          onChange={(e) => handleArrayInputChange("skills", index, e.target.value)}
                          placeholder={`Skill ${index + 1}`}
                      />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label>Vision for Office (up to 3)</Label>
                <div className="space-y-4">
                  {[0, 1, 2].map((index) => (
                      <Textarea
                          key={index}
                          value={formData.visionForOffice[index] || ""}
                          onChange={(e) => handleArrayInputChange("visionForOffice", index, e.target.value)}
                          placeholder={`Vision ${index + 1}`}
                          rows={2}
                      />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label>General Knowledge About the Office (up to 3)</Label>
                <div className="space-y-4">
                  {[0, 1, 2].map((index) => (
                      <Textarea
                          key={index}
                          value={formData.knowledgeAboutOffice[index] || ""}
                          onChange={(e) => handleArrayInputChange("knowledgeAboutOffice", index, e.target.value)}
                          placeholder={`Knowledge ${index + 1}`}
                          rows={2}
                      />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="photo">Passport Photo *</Label>
                <FileUpload id="photo" accept="image/*" onChange={(file) => handleInputChange("photo", file)} />
                <p className="text-xs text-gray-500">Upload a passport-sized photo of the nominee</p>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous Step
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              </div>
            </>
        )}

        {currentStep === 4 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Guarantors Information</h3>
                <p className="text-sm text-blue-700">
                  Please provide the details of 2 guarantors who endorse this nomination. Verification emails will be sent
                  to all guarantors.
                </p>
              </div>

              {[0, 1].map((index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-6">
                    <h3 className="font-semibold mb-4">Guarantor {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`guarantor-${index}-name`}>Full Name *</Label>
                        <Input
                            id={`guarantor-${index}-name`}
                            value={formData.guarantors[index]?.name || ""}
                            onChange={(e) => handleGuarantorChange(index, "name", e.target.value)}
                            placeholder="Enter guarantor's full name"
                            required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`guarantor-${index}-programme`}>Programme *</Label>
                        <Input
                            id={`guarantor-${index}-programme`}
                            value={formData.guarantors[index]?.programme || ""}
                            onChange={(e) => handleGuarantorChange(index, "programme", e.target.value)}
                            placeholder="e.g., BSc. Computer Science"
                            required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`guarantor-${index}-subgroup`}>Subgroup *</Label>
                        <Input
                            id={`guarantor-${index}-subgroup`}
                            value={formData.guarantors[index]?.subgroup || ""}
                            onChange={(e) => handleGuarantorChange(index, "subgroup", e.target.value)}
                            placeholder="Enter subgroup"
                            required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`guarantor-${index}-contact`}>Contact Number *</Label>
                        <Input
                            id={`guarantor-${index}-contact`}
                            value={formData.guarantors[index]?.contact || ""}
                            onChange={(e) => handleGuarantorChange(index, "contact", e.target.value)}
                            placeholder="e.g., 0241234567"
                            required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`guarantor-${index}-email`}>Email Address *</Label>
                        <Input
                            id={`guarantor-${index}-email`}
                            type="email"
                            value={formData.guarantors[index]?.email || ""}
                            onChange={(e) => handleGuarantorChange(index, "email", e.target.value)}
                            placeholder="e.g., example@gmail.com"
                            required
                        />
                        <p className="text-xs text-gray-500">A verification email will be sent to this address</p>
                      </div>
                    </div>
                  </div>
              ))}

              <div className="border border-gray-200 rounded-md p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="declaration" required />
                  <Label htmlFor="declaration" className="text-sm">
                    I declare that the information provided on this form is true and that if it is found untrue, I should be
                    held accountable for the penalty thereof. *
                  </Label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous Step
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Nomination"}
                </Button>
              </div>
            </>
        )}
      </form>
  );
}