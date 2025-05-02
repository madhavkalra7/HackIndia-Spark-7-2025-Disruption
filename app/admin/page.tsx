"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

// Job type
interface Job {
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
  postedBy: string
  reason?: string
  flags?: number
}

export default function AdminPanel() {
  const { user } = useAuth()
  const router = useRouter()
  const [pendingVerifications, setPendingVerifications] = useState<VerificationRequest[]>([])
  const [flaggedJobs, setFlaggedJobs] = useState<Job[]>([])
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [viewingDocuments, setViewingDocuments] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [viewingJob, setViewingJob] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "admin") {
      // For demo purposes, allow any user to access admin panel
      // In a real app, you would redirect non-admin users
      // router.push("/dashboard")
    }

    // Load verification requests
    const storedRequests = localStorage.getItem("job_shield_verification_requests")
    if (storedRequests) {
      const requests: VerificationRequest[] = JSON.parse(storedRequests)
      setPendingVerifications(requests.filter((req) => req.status === "pending"))
    }

    // Load flagged jobs (mock data for now)
    const storedJobs = localStorage.getItem("job_shield_jobs")
    if (storedJobs) {
      const jobs: Job[] = JSON.parse(storedJobs)
      // For demo purposes, randomly flag some jobs
      const flagged = jobs
        .filter(() => Math.random() > 0.7) // Randomly select ~30% of jobs
        .map((job) => ({
          ...job,
          reason: getRandomFlagReason(),
          flags: Math.floor(Math.random() * 8) + 1,
        }))
      setFlaggedJobs(flagged)
    }
  }, [user, router])

  const getRandomFlagReason = () => {
    const reasons = [
      "Suspicious payment requirements",
      "Unrealistic salary claims",
      "Request for personal information",
      "Misleading job description",
      "Potential phishing attempt",
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  const handleApproveVerification = (verificationId: string) => {
    // Get verification request
    const verification = pendingVerifications.find((v) => v.id === verificationId)
    if (!verification) return

    // Update verification status
    const storedRequests = localStorage.getItem("job_shield_verification_requests")
    if (storedRequests) {
      const requests: VerificationRequest[] = JSON.parse(storedRequests)
      const updatedRequests = requests.map((req) => {
        if (req.id === verificationId) {
          return {
            ...req,
            status: "approved",
            reviewedDate: new Date().toISOString(),
          }
        }
        return req
      })
      localStorage.setItem("job_shield_verification_requests", JSON.stringify(updatedRequests))
    }

    // Update user's verification status
    const storedUsers = localStorage.getItem("job_shield_auth")
    if (storedUsers) {
      const user = JSON.parse(storedUsers)
      if (user.id === verification.userId) {
        const updatedUser = {
          ...user,
          isVerified: true,
          company: verification.companyName,
        }
        localStorage.setItem("job_shield_auth", JSON.stringify(updatedUser))
      }
    }

    // Update jobs posted by this user
    const storedJobs = localStorage.getItem("job_shield_jobs")
    if (storedJobs) {
      const jobs: Job[] = JSON.parse(storedJobs)
      const updatedJobs = jobs.map((job) => {
        if (job.postedBy === verification.userId) {
          return {
            ...job,
            isVerified: true,
            trustScore: Math.min(job.trustScore + 10, 100), // Increase trust score but cap at 100
          }
        }
        return job
      })
      localStorage.setItem("job_shield_jobs", JSON.stringify(updatedJobs))
    }

    // Remove from pending verifications
    setPendingVerifications(pendingVerifications.filter((v) => v.id !== verificationId))
  }

  const handleRejectVerification = (verificationId: string) => {
    // Update verification status
    const storedRequests = localStorage.getItem("job_shield_verification_requests")
    if (storedRequests) {
      const requests: VerificationRequest[] = JSON.parse(storedRequests)
      const updatedRequests = requests.map((req) => {
        if (req.id === verificationId) {
          return {
            ...req,
            status: "rejected",
            reviewedDate: new Date().toISOString(),
          }
        }
        return req
      })
      localStorage.setItem("job_shield_verification_requests", JSON.stringify(updatedRequests))
    }

    // Remove from pending verifications
    setPendingVerifications(pendingVerifications.filter((v) => v.id !== verificationId))
  }

  const handleRemoveJob = (jobId: number) => {
    // Remove job from storage
    const storedJobs = localStorage.getItem("job_shield_jobs")
    if (storedJobs) {
      const jobs: Job[] = JSON.parse(storedJobs)
      const updatedJobs = jobs.filter((job) => job.id !== jobId)
      localStorage.setItem("job_shield_jobs", JSON.stringify(updatedJobs))
    }

    // Remove from flagged jobs
    setFlaggedJobs(flaggedJobs.filter((job) => job.id !== jobId))
  }

  const handleDismissFlag = (jobId: number) => {
    // Just remove from flagged jobs list
    setFlaggedJobs(flaggedJobs.filter((job) => job.id !== jobId))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      {user.userType !== "admin" && (
        <Alert variant="warning" className="mb-6">
          <AlertDescription>
            You are viewing the admin panel in demo mode. In a real application, this would be restricted to admin users
            only.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerifications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review and approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Jobs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedJobs.length}</div>
            <p className="text-xs text-muted-foreground">Reported as potentially fraudulent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Scam Detection</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Current detection accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verifications" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="verifications">Pending Verifications</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Verification Requests</CardTitle>
              <CardDescription>Review and approve recruiter verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingVerifications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVerifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell className="font-medium">{verification.companyName}</TableCell>
                        <TableCell>
                          {verification.contactName}
                          <div className="text-xs text-muted-foreground">{verification.email}</div>
                        </TableCell>
                        <TableCell>{formatDate(verification.submittedDate)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVerification(verification)
                              setViewingDocuments(true)
                            }}
                          >
                            View {verification.documents.length} Files
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="h-8 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveVerification(verification.id)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => handleRejectVerification(verification.id)}
                            >
                              <XCircle className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No pending verification requests at this time.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Job Listings</CardTitle>
              <CardDescription>Review jobs flagged as potentially fraudulent</CardDescription>
            </CardHeader>
            <CardContent>
              {flaggedJobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Flag Reason</TableHead>
                      <TableHead>Flag Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100">
                            {job.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.flags}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => {
                                setSelectedJob(job)
                                setViewingJob(true)
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => handleRemoveJob(job.id)}
                            >
                              Remove
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleDismissFlag(job.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No flagged jobs at this time.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Dialog */}
      <Dialog open={viewingDocuments} onOpenChange={setViewingDocuments}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Verification Documents</DialogTitle>
            <DialogDescription>
              Documents submitted by {selectedVerification?.companyName} for verification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedVerification?.documents.map((doc, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{doc}</span>
                </div>
                <div className="mt-2 h-32 rounded-md bg-muted p-2">
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Document preview would appear here
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingDocuments(false)}>
              Close
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedVerification) {
                  handleApproveVerification(selectedVerification.id)
                  setViewingDocuments(false)
                }
              }}
            >
              <CheckCircle className="mr-1 h-4 w-4" /> Approve Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Viewer Dialog */}
      <Dialog open={viewingJob} onOpenChange={setViewingJob}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Flagged Job Details</DialogTitle>
            <DialogDescription>Review the job listing that has been flagged</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">{selectedJob?.title}</h3>
              <div className="mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Company:</span>
                  <span>{selectedJob?.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Location:</span>
                  <span>{selectedJob?.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Salary:</span>
                  <span>{selectedJob?.salary}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-1 text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedJob?.description}</p>
              </div>

              <div className="mb-4">
                <h4 className="mb-1 text-sm font-medium">Flag Reason</h4>
                <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100">
                  {selectedJob?.reason}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  This job was flagged {selectedJob?.flags} times by users or our AI detection system.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingJob(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedJob) {
                  handleRemoveJob(selectedJob.id)
                  setViewingJob(false)
                }
              }}
            >
              Remove Job
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedJob) {
                  handleDismissFlag(selectedJob.id)
                  setViewingJob(false)
                }
              }}
            >
              Dismiss Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
