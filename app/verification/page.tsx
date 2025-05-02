"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Upload, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Verification request type
interface VerificationRequest {
  id: string
  userId: string
  companyName: string
  contactName: string
  email: string
  phone: string
  website: string
  businessDescription: string
  documents: string[]
  status: "pending" | "approved" | "rejected"
  submittedDate: string
  reviewedDate?: string
}

export default function VerificationPage() {
  const { user, login } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    businessDescription: "",
    documents: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [existingRequest, setExistingRequest] = useState<VerificationRequest | null>(null)

  useEffect(() => {
    // Redirect if not logged in or not a recruiter
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "recruiter") {
      router.push("/dashboard")
      return
    }

    // Check if user already has a verification request
    const storedRequests = localStorage.getItem("job_shield_verification_requests")
    if (storedRequests) {
      const requests: VerificationRequest[] = JSON.parse(storedRequests)
      const userRequest = requests.find((req) => req.userId === user.id)
      if (userRequest) {
        setExistingRequest(userRequest)
        setFormData({
          companyName: userRequest.companyName,
          website: userRequest.website || "",
          businessDescription: userRequest.businessDescription,
          documents: userRequest.documents,
        })
      }
    }

    // Pre-fill form with user data
    if (user.company) {
      setFormData((prev) => ({
        ...prev,
        companyName: user.company || "",
      }))
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileUpload = () => {
    // Simulate file upload by adding a mock document
    const mockDocuments = ["Business Registration.pdf", "Company ID.pdf", "Tax Certificate.pdf", "Proof of Address.pdf"]

    const randomDoc = mockDocuments[Math.floor(Math.random() * mockDocuments.length)]

    if (!formData.documents.includes(randomDoc)) {
      setFormData({
        ...formData,
        documents: [...formData.documents, randomDoc],
      })
    }
  }

  const handleRemoveDocument = (doc: string) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((d) => d !== doc),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validate form
    if (!formData.companyName || !formData.businessDescription || formData.documents.length === 0) {
      setError("Please fill in all required fields and upload at least one document")
      setIsSubmitting(false)
      return
    }

    if (!user) {
      setError("You must be logged in to submit a verification request")
      setIsSubmitting(false)
      return
    }

    // Create verification request
    const verificationRequest: VerificationRequest = {
      id: existingRequest?.id || `vr-${Date.now()}`,
      userId: user.id,
      companyName: formData.companyName,
      contactName: user.name || "",
      email: user.email,
      phone: "",
      website: formData.website,
      businessDescription: formData.businessDescription,
      documents: formData.documents,
      status: "pending",
      submittedDate: new Date().toISOString(),
    }

    // Save to local storage
    const storedRequests = localStorage.getItem("job_shield_verification_requests")
    let requests: VerificationRequest[] = storedRequests ? JSON.parse(storedRequests) : []

    if (existingRequest) {
      // Update existing request
      requests = requests.map((req) => (req.id === existingRequest.id ? verificationRequest : req))
    } else {
      // Add new request
      requests.push(verificationRequest)
    }

    localStorage.setItem("job_shield_verification_requests", JSON.stringify(requests))

    // Update user data to reflect pending verification
    const updatedUser = {
      ...user,
      company: formData.companyName,
      verificationStatus: "pending",
    }
    login(updatedUser)

    setSuccess(true)
    setIsSubmitting(false)

    // Redirect after a short delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (user.isVerified) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <CardTitle>Verification Complete</CardTitle>
              </div>
              <CardDescription>Your account has already been verified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Verified Recruiter</AlertTitle>
                <AlertDescription>
                  Your account has been verified and you have been issued an NFT badge. You can now post jobs with the
                  verified recruiter badge.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Verification Details</h3>
                <div className="grid gap-2 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="font-medium">Company:</span>
                    <span>{user.company}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">Verification Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">NFT Badge ID:</span>
                    <span className="font-mono">0x7a69...4e21</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Recruiter Verification</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
            <AlertTitle>Verification Request Submitted</AlertTitle>
            <AlertDescription>
              Your verification request has been submitted successfully. Our team will review your information and
              update your account status. You will be notified once the verification is complete.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Verification Request</CardTitle>
            <CardDescription>
              {existingRequest
                ? "Update your verification information"
                : "Submit your company information for verification"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description *</Label>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  placeholder="Describe your company, industry, and the types of roles you typically hire for..."
                  value={formData.businessDescription}
                  onChange={handleChange}
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Verification Documents *</Label>
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload business registration, company ID, or other verification documents
                  </p>
                  <Button type="button" onClick={handleFileUpload} className="mt-4">
                    Upload Document
                  </Button>
                </div>

                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Documents</Label>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">{doc}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-md bg-blue-50 p-4 text-blue-800 dark:bg-blue-900 dark:text-blue-50">
                <h3 className="mb-2 font-semibold">Verification Process</h3>
                <p className="text-sm">
                  Our team will review your information within 1-2 business days. Once verified, you will receive an NFT
                  badge that will appear on your profile and job postings, increasing trust with job seekers.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : existingRequest
                      ? "Update Verification Request"
                      : "Submit Verification Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
