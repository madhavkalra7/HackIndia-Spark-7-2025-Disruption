"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Briefcase, User, Lock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { generateId } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Signup() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") === "recruiter" ? "recruiter" : "jobseeker"
  const [userType, setUserType] = useState<"jobseeker" | "recruiter">(initialType)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
    jobTitle: "",
    businessEmail: "",
    phone: "",
    agreeToTerms: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (userType === "jobseeker") {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError("Please fill in all required fields")
        return
      }
    } else {
      if (!formData.companyName || !formData.contactName || !formData.businessEmail || !formData.password) {
        setError("Please fill in all required fields")
        return
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return
    }

    // Create user object
    const user = {
      id: generateId(),
      email: userType === "jobseeker" ? formData.email : formData.businessEmail,
      firstName: userType === "jobseeker" ? formData.firstName : undefined,
      lastName: userType === "jobseeker" ? formData.lastName : undefined,
      name: userType === "jobseeker" ? `${formData.firstName} ${formData.lastName}` : formData.contactName,
      company: userType === "recruiter" ? formData.companyName : undefined,
      userType,
      isVerified: userType === "recruiter" ? false : undefined,
      trustScore: userType === "jobseeker" ? 85 : undefined,
      createdAt: new Date().toISOString(),
    }

    // Sign up user
    signup(user)
    setSuccess(true)

    // Redirect after a short delay
    setTimeout(() => {
      router.push(userType === "recruiter" ? "/dashboard" : "/browse-jobs")
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">Join Job Shield to experience safe job hunting</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
            <AlertDescription>Account created successfully! Redirecting you to the dashboard...</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={initialType} onValueChange={(value) => setUserType(value as "jobseeker" | "recruiter")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobseeker" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Job Seeker
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Recruiter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobseeker">
            <Card>
              <CardHeader>
                <CardTitle>Job Seeker Registration</CardTitle>
                <CardDescription>Create an account to browse safe job opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>

                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Log in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruiter">
            <Card>
              <CardHeader>
                <CardTitle>Recruiter Registration</CardTitle>
                <CardDescription>Create an account to post jobs and find qualified candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Contact Name</Label>
                      <Input
                        id="contact-name"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input
                        id="job-title"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-email">Business Email</Label>
                    <Input
                      id="business-email"
                      name="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recruiter-password">Password</Label>
                    <Input
                      id="recruiter-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recruiter-confirm-password">Confirm Password</Label>
                    <Input
                      id="recruiter-confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="rounded-md bg-primary/10 p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Verification Required</h3>
                        <p className="text-sm text-muted-foreground">
                          After registration, you'll need to complete our verification process to receive your NFT badge
                          and post jobs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recruiter-terms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      required
                    />
                    <Label htmlFor="recruiter-terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Recruiter Account
                  </Button>

                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Log in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
