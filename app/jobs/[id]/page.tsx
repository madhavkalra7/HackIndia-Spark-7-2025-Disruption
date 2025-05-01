"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, MapPin, Briefcase, Clock, Award, Calendar, DollarSign, Building, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

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
  deadline?: string
}

interface Application {
  id: number
  jobId: number
  userId: string
  status: string
  coverLetter?: string
  appliedDate: string
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isApplied, setIsApplied] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | undefined>()
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [recruiter, setRecruiter] = useState<any>(null)

  useEffect(() => {
    const jobId = Number(params.id)
    if (isNaN(jobId)) {
      setError("Invalid job ID")
      setLoading(false)
      return
    }

    // Get job from local storage
    const storedJobs = localStorage.getItem("job_shield_jobs")
    if (storedJobs) {
      const jobs: Job[] = JSON.parse(storedJobs)
      const foundJob = jobs.find((j) => j.id === jobId)

      if (foundJob) {
        setJob(foundJob)

        // Get recruiter info
        const storedUsers = localStorage.getItem("job_shield_users")
        if (storedUsers) {
          const users = JSON.parse(storedUsers)
          const jobRecruiter = users.find((u: any) => u.id === foundJob.postedBy)
          if (jobRecruiter) {
            setRecruiter(jobRecruiter)
          }
        }

        // Check if user has applied
        if (user) {
          const storedApplications = localStorage.getItem("job_shield_applications")
          if (storedApplications) {
            const applications: Application[] = JSON.parse(storedApplications)
            const userApplication = applications.find((app) => app.jobId === jobId && app.userId === user.id)

            if (userApplication) {
              setIsApplied(true)
              setApplicationStatus(userApplication.status)
            }
          }
        }
      } else {
        setError("Job not found")
      }
    } else {
      setError("No jobs available")
    }

    setLoading(false)
  }, [params.id, user])

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
    if (score >= 80) return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100"
  }

  const handleApplyClick = () => {
    if (!user) {
      router.push("/login")
      return
    }

    setShowApplyDialog(true)
  }

  const handleApplySubmit = () => {
    if (!user || !job) return

    // Save application to local storage
    const applications = localStorage.getItem("job_shield_applications")
    const applicationsArray = applications ? JSON.parse(applications) : []

    // Check if already applied
    const existingApplication = applicationsArray.find((app: any) => app.jobId === job.id && app.userId === user.id)

    if (!existingApplication) {
      const newApplication = {
        id: Date.now(),
        jobId: job.id,
        userId: user.id,
        status: "Applied",
        coverLetter,
        appliedDate: new Date().toISOString(),
      }

      applicationsArray.push(newApplication)
      localStorage.setItem("job_shield_applications", JSON.stringify(applicationsArray))
    }

    setIsApplied(true)
    setApplicationStatus("Applied")
    setShowApplyDialog(false)

    // Update job applicants count
    const jobs = localStorage.getItem("job_shield_jobs")
    if (jobs) {
      const jobsArray = JSON.parse(jobs)
      const updatedJobs = jobsArray.map((j: any) => {
        if (j.id === job.id) {
          return {
            ...j,
            applicants: (j.applicants || 0) + 1,
          }
        }
        return j
      })
      localStorage.setItem("job_shield_jobs", JSON.stringify(updatedJobs))
    }

    // Add notification for the recruiter
    addNotification(job.postedBy, `New application received for ${job.title}`, "application", job.id)
  }

  const addNotification = (userId: string, message: string, type: string, jobId: number) => {
    const notifications = localStorage.getItem("job_shield_notifications")
      ? JSON.parse(localStorage.getItem("job_shield_notifications") || "[]")
      : []

    notifications.push({
      id: Date.now(),
      userId,
      message,
      type,
      jobId,
      read: false,
      date: new Date().toISOString(),
    })

    localStorage.setItem("job_shield_notifications", JSON.stringify(notifications))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Job not found"}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/browse-jobs")}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  // Calculate application deadline (2 weeks from posted date)
  const postedDate = job.postedDate.includes("T") ? new Date(job.postedDate) : new Date() // Fallback to current date if format is not ISO

  const deadlineDate = new Date(postedDate)
  deadlineDate.setDate(deadlineDate.getDate() + 14)
  const formattedDeadline = deadlineDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            Back
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge variant="outline" className={getTrustScoreColor(job.trustScore)}>
              <Shield className="mr-1 h-3 w-3" /> {job.trustScore}% TrustScore
            </Badge>
            {job.isVerified && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                <Award className="mr-1 h-3 w-3" /> Verified Recruiter
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Posted {job.postedDate}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Apply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line">{job.applicationInstructions}</p>
                </div>

                <div className="mt-6">
                  {isApplied ? (
                    <Button disabled className="w-full">
                      {applicationStatus || "Applied"}
                    </Button>
                  ) : (
                    <Button onClick={handleApplyClick} className="w-full">
                      Apply Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Job Type:</span>
                    <span>{job.type}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Salary:</span>
                    <span>{job.salary}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>
                      {job.location} {job.remote && "(Remote)"}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Application Deadline:</span>
                    <span>{job.deadline || formattedDeadline}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 text-sm font-medium">About the Company</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.company} is a leading company in the industry with a focus on innovation and growth.
                  </p>
                </div>

                {recruiter && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Posted by</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {recruiter.name?.substring(0, 1) || "R"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{recruiter.name}</p>
                        <p className="text-xs text-muted-foreground">{recruiter.company}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trust Score Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trust Score:</span>
                    <Badge variant="outline" className={getTrustScoreColor(job.trustScore)}>
                      {job.trustScore}%
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">Trust Score is calculated based on:</p>

                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Shield className="h-3 w-3" /> Recruiter verification status
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="h-3 w-3" /> Profile completeness
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-3 w-3" /> Previous hiring history
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Account age
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>Submit your application to {job.company} for this position.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cover Letter (Optional)</h4>
              <Textarea
                placeholder="Tell the employer why you're a good fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Your profile information and resume will be included with this application.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplySubmit}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
