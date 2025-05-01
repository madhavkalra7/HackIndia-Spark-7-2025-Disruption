"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

// Job type for local storage
interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: string
  type: string
  remote: boolean
  description: string
  requirements: string
  applicationInstructions: string
  postedBy: string
  postedDate: string
  trustScore: number
  isVerified: boolean
}

export default function PostJob() {
  const [isRemote, setIsRemote] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState("")
  const [jobType, setJobType] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    requirements: "",
    applicationInstructions: "",
  })

  // Check if user is logged in and is a recruiter
  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.userType !== "recruiter") {
      router.push("/browse-jobs")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Validate form
    if (
      !formData.title ||
      !formData.company ||
      !formData.location ||
      !formData.salary ||
      !jobType ||
      !formData.description ||
      !formData.requirements ||
      !formData.applicationInstructions
    ) {
      setFormError("Please fill in all required fields")
      return
    }

    if (!user) {
      setFormError("You must be logged in to post a job")
      return
    }

    if (user.userType !== "recruiter") {
      setFormError("Only recruiters can post jobs")
      return
    }

    // Create job object
    const newJob: Job = {
      id: Date.now(),
      title: formData.title,
      company: formData.company,
      location: formData.location,
      salary: formData.salary,
      type: jobType,
      remote: isRemote,
      description: formData.description,
      requirements: formData.requirements,
      applicationInstructions: formData.applicationInstructions,
      postedBy: user.id,
      postedDate: new Date().toISOString(),
      trustScore: user.isVerified ? 95 : 80,
      isVerified: !!user.isVerified,
    }

    // Save to local storage
    const existingJobs = localStorage.getItem("job_shield_jobs")
    const jobs = existingJobs ? JSON.parse(existingJobs) : []
    jobs.push(newJob)
    localStorage.setItem("job_shield_jobs", JSON.stringify(jobs))

    // Show success message
    setFormSubmitted(true)

    // Reset form
    setFormData({
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
      requirements: "",
      applicationInstructions: "",
    })
    setJobType("")
    setIsRemote(false)

    // Reset success message after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false)
    }, 3000)
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Post a Job</h1>
        </div>

        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verified Recruiters Only</AlertTitle>
          <AlertDescription>
            Only verified recruiters with an NFT badge can post jobs. This ensures all listings are legitimate and
            trustworthy.
            {!user.isVerified && (
              <p className="mt-2 font-semibold">
                Your account is pending verification. Jobs posted will be marked as unverified until your account is
                approved.
                <Button asChild variant="link" className="h-auto p-0 pl-2">
                  <Link href="/verification">Get Verified Now</Link>
                </Button>
              </p>
            )}
          </AlertDescription>
        </Alert>

        {formError && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {formSubmitted ? (
          <Alert className="mb-8 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your job posting has been submitted{!user.isVerified && " for review"}.
              {user.isVerified ? " It is now live on the platform." : " It will be live once approved by our team."}
            </AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              name="company"
              value={formData.company || user.company || ""}
              onChange={handleChange}
              placeholder="e.g. TechCorp Solutions"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. $80,000 - $100,000"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="remote" checked={isRemote} onCheckedChange={setIsRemote} />
              <Label htmlFor="remote">Remote Position</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List the skills, experience, and qualifications required..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="application">Application Instructions</Label>
            <Textarea
              id="application"
              name="applicationInstructions"
              value={formData.applicationInstructions}
              onChange={handleChange}
              placeholder="Explain how candidates should apply..."
              className="min-h-[100px]"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Post Job
          </Button>
        </form>
      </div>
    </div>
  )
}
