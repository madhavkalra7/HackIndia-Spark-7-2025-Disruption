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
import { Shield, AlertCircle, Plus, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import WalletConnect from "@/components/wallet-connect"
import { analyzeTrustScore } from "@/lib/ml-scoring"

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
  // New fields for applicant conditions
  requiredSkills: string[]
  minExperience: number
  education: string
  certifications: string[]
  trustScoreDetails?: {
    flags: string[]
    recommendations: string[]
  }
}

export default function PostJob() {
  const [isRemote, setIsRemote] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState("")
  const [jobType, setJobType] = useState("")
  const [walletConnected, setWalletConnected] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // State for applicant conditions
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [minExperience, setMinExperience] = useState(0)
  const [education, setEducation] = useState("")
  const [certifications, setCertifications] = useState<string[]>([])
  const [newCertification, setNewCertification] = useState("")

  // State for trust score
  const [trustScore, setTrustScore] = useState(0)
  const [trustScoreDetails, setTrustScoreDetails] = useState<{
    flags: string[]
    recommendations: string[]
  }>({ flags: [], recommendations: [] })

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

    // Analyze trust score when job details change
    if (["title", "description", "company", "salary"].includes(name)) {
      const result = analyzeTrustScore(
        name === "title" ? value : formData.title,
        name === "description" ? value : formData.description,
        name === "company" ? value : formData.company,
        name === "salary" ? value : formData.salary,
        !!user?.isVerified,
      )
      setTrustScore(result.score)
      setTrustScoreDetails({
        flags: result.flags,
        recommendations: result.recommendations,
      })
    }
  }

  const addSkill = () => {
    if (newSkill && !requiredSkills.includes(newSkill)) {
      setRequiredSkills([...requiredSkills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill))
  }

  const addCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification])
      setNewCertification("")
    }
  }

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert))
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

    // Analyze final trust score
    const result = analyzeTrustScore(
      formData.title,
      formData.description,
      formData.company,
      formData.salary,
      !!user.isVerified,
    )

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
      trustScore: result.score,
      isVerified: !!user.isVerified,
      // New fields for applicant conditions
      requiredSkills,
      minExperience,
      education,
      certifications,
      trustScoreDetails: {
        flags: result.flags,
        recommendations: result.recommendations,
      },
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
    setRequiredSkills([])
    setMinExperience(0)
    setEducation("")
    setCertifications([])
    setTrustScore(0)
    setTrustScoreDetails({ flags: [], recommendations: [] })

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

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Connect Your Wallet</span>
                {walletConnected && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Connected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect your wallet to enable blockchain verification for your job postings. This increases your trust
                score and allows applicants to receive token rewards.
              </p>
              <WalletConnect onConnect={() => setWalletConnected(true)} />
            </CardContent>
          </Card>
        </div>

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

          {/* Applicant Conditions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Define minimum conditions for applicants. If an applicant meets at least 3 conditions, they will receive
                a token reward through our smart contract.
              </p>

              {/* Required Skills */}
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a required skill"
                  />
                  <Button type="button" size="icon" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full p-1 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {skill}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Minimum Experience */}
              <div className="space-y-2">
                <Label htmlFor="minExperience">Minimum Years of Experience</Label>
                <Select
                  value={minExperience.toString()}
                  onValueChange={(value) => setMinExperience(Number.parseInt(value))}
                >
                  <SelectTrigger id="minExperience">
                    <SelectValue placeholder="Select minimum experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No experience required</SelectItem>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="7">7+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="education">Required Education</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger id="education">
                    <SelectValue placeholder="Select required education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific education required</SelectItem>
                    <SelectItem value="high school">High School Diploma</SelectItem>
                    <SelectItem value="associate">Associate's Degree</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD or Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Required Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add a required certification"
                  />
                  <Button type="button" size="icon" onClick={addCertification}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="ml-1 rounded-full p-1 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {cert}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Score Section */}
          {trustScore > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Trust Score Analysis</span>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        trustScore >= 90
                          ? "bg-green-50 text-green-700"
                          : trustScore >= 70
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                      }
                    `}
                  >
                    {trustScore}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trustScoreDetails.flags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 font-medium">Potential Issues:</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {trustScoreDetails.flags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {trustScoreDetails.recommendations.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">Recommendations:</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {trustScoreDetails.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full">
            Post Job
          </Button>
        </form>
      </div>
    </div>
  )
}
