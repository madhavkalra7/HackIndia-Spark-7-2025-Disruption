"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, MapPin, Briefcase, Clock, Award, BookmarkPlus, BookmarkCheck, ExternalLink } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface JobCardProps {
  job: {
    id: number
    title: string
    company: string
    location: string
    trustScore: number
    isVerified: boolean
    salary: string
    type: string
    remote: boolean
    description: string
    postedDate: string
    status?: string
    postedBy: string
  }
  showSaveButton?: boolean
  isApplied?: boolean
}

export default function JobCard({ job, showSaveButton = true, isApplied = false }: JobCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [jobIsApplied, setJobIsApplied] = useState(isApplied)
  const [applicationStatus, setApplicationStatus] = useState<string | undefined>(job.status)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")

  // Check if job is saved or applied
  useEffect(() => {
    if (!user) return

    // Check if job is saved
    const savedJobs = localStorage.getItem("job_shield_saved_jobs")
    if (savedJobs) {
      const savedJobsArray = JSON.parse(savedJobs)
      setIsSaved(savedJobsArray.some((savedJob: any) => savedJob.jobId === job.id && savedJob.userId === user.id))
    }

    // Check if job is applied (from props or local storage)
    if (isApplied) {
      setJobIsApplied(true)
    } else {
      // Check local storage for application status
      const applications = localStorage.getItem("job_shield_applications")
      if (applications) {
        const applicationsArray = JSON.parse(applications)
        const application = applicationsArray.find((app: any) => app.jobId === job.id && app.userId === user.id)
        if (application) {
          setJobIsApplied(true)
          setApplicationStatus(application.status)
        }
      }
    }
  }, [user, job.id, isApplied])

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
    if (score >= 80) return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100"
  }

  const handleSaveJob = () => {
    if (!user) {
      router.push("/login")
      return
    }

    const savedJobs = localStorage.getItem("job_shield_saved_jobs")
    const savedJobsArray = savedJobs ? JSON.parse(savedJobs) : []

    if (isSaved) {
      // Remove job from saved jobs
      const updatedSavedJobs = savedJobsArray.filter(
        (savedJob: any) => !(savedJob.jobId === job.id && savedJob.userId === user.id),
      )
      localStorage.setItem("job_shield_saved_jobs", JSON.stringify(updatedSavedJobs))
      setIsSaved(false)
    } else {
      // Add job to saved jobs
      savedJobsArray.push({
        id: Date.now(),
        jobId: job.id,
        userId: user.id,
        savedDate: new Date().toISOString(),
      })
      localStorage.setItem("job_shield_saved_jobs", JSON.stringify(savedJobsArray))
      setIsSaved(true)
    }
  }

  const handleApplyClick = () => {
    if (!user) {
      router.push("/login")
      return
    }

    setShowApplyDialog(true)
  }

  const handleApplySubmit = () => {
    if (!user) return

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

    setJobIsApplied(true)
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

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <Badge variant="outline" className={getTrustScoreColor(job.trustScore)}>
                  <Shield className="mr-1 h-3 w-3" /> {job.trustScore}% TrustScore
                </Badge>
                {job.isVerified && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                    <Award className="mr-1 h-3 w-3" /> Verified Recruiter
                  </Badge>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
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

              <p className="mb-4 text-sm text-muted-foreground">{job.description}</p>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{job.salary}</Badge>
                <Badge variant="secondary">{job.type}</Badge>
                {job.remote && <Badge variant="secondary">Remote</Badge>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {jobIsApplied ? (
                <Button variant="outline" disabled>
                  {applicationStatus || "Applied"}
                </Button>
              ) : (
                <Button onClick={handleApplyClick}>Apply Now</Button>
              )}

              <Button variant="outline" asChild>
                <Link href={`/jobs/${job.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" /> View Details
                </Link>
              </Button>

              {showSaveButton && (
                <Button variant="outline" size="icon" onClick={handleSaveJob}>
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <BookmarkPlus className="h-4 w-4" />}
                  <span className="sr-only">{isSaved ? "Saved" : "Save Job"}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
    </>
  )
}
