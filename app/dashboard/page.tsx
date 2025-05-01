"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, Briefcase, User, FileText, Award, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import EditProfileDialog from "@/components/edit-profile-dialog"

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
  postedBy: string
  postedDate: string
  trustScore: number
  isVerified: boolean
  applicants?: number
}

// Application type for local storage
interface Application {
  id: number
  jobId: number
  userId: string
  status: string
  appliedDate: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [postedJobs, setPostedJobs] = useState<Job[]>([])
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [showEditProfile, setShowEditProfile] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Load jobs and applications from local storage
  useEffect(() => {
    if (!user) return

    // Load jobs from local storage
    const storedJobs = localStorage.getItem("job_shield_jobs")
    if (storedJobs) {
      const allJobs: Job[] = JSON.parse(storedJobs)

      // Filter jobs posted by the current user
      if (user.userType === "recruiter") {
        const userJobs = allJobs.filter((job) => job.postedBy === user.id)
        setPostedJobs(userJobs)
      }

      // Load applications from local storage
      const storedApplications = localStorage.getItem("job_shield_applications")
      if (storedApplications) {
        const allApplications: Application[] = JSON.parse(storedApplications)

        if (user.userType === "jobseeker") {
          // Filter applications by the current user
          const userApplications = allApplications.filter((app) => app.userId === user.id)
          setApplications(userApplications)

          // Get applied jobs
          const userAppliedJobs = allJobs
            .filter((job) => userApplications.some((app) => app.jobId === job.id))
            .map((job) => {
              // Add status from application
              const application = userApplications.find((app) => app.jobId === job.id)
              return {
                ...job,
                status: application?.status || "Applied",
              }
            })

          setAppliedJobs(userAppliedJobs)

          // Get saved jobs
          const savedJobs = localStorage.getItem("job_shield_saved_jobs")
          if (savedJobs) {
            const savedJobsArray = JSON.parse(savedJobs)
            const userSavedJobs = savedJobsArray.filter((saved: any) => saved.userId === user.id)
            const savedJobsList = allJobs.filter((job) => userSavedJobs.some((saved: any) => saved.jobId === job.id))
            setSavedJobs(savedJobsList)
          }
        } else {
          // For recruiters, count applications for each job
          setPostedJobs(
            postedJobs.map((job) => {
              const jobApplications = allApplications.filter((app) => app.jobId === job.id)
              return {
                ...job,
                applicants: jobApplications.length,
              }
            }),
          )
        }
      }
    }
  }, [user])

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        {user.userType === "admin" && (
          <div className="flex items-center gap-2">
            <span>View as:</span>
            <Button
              variant={user.userType === "recruiter" ? "default" : "outline"}
              onClick={() => router.push("/dashboard?type=recruiter")}
              size="sm"
            >
              Recruiter
            </Button>
            <Button
              variant={user.userType === "jobseeker" ? "default" : "outline"}
              onClick={() => router.push("/dashboard?type=jobseeker")}
              size="sm"
            >
              Job Seeker
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value={user.userType === "recruiter" ? "posted" : "applied"}>
            {user.userType === "recruiter" ? "Posted Jobs" : "Applied Jobs"}
          </TabsTrigger>
          <TabsTrigger value={user.userType === "recruiter" ? "applications" : "saved"}>
            {user.userType === "recruiter" ? "Applications" : "Saved Jobs"}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.userType === "recruiter" ? "Verification Status" : "TrustScore"}
                </CardTitle>
                {user.userType === "recruiter" ? (
                  <Award className="h-4 w-4 text-primary" />
                ) : (
                  <Shield className="h-4 w-4 text-primary" />
                )}
              </CardHeader>
              <CardContent>
                {user.userType === "recruiter" ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        user.isVerified
                          ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                          : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100"
                      }
                    >
                      {user.isVerified ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Verified
                        </>
                      ) : (
                        "Pending Verification"
                      )}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {user.isVerified ? "NFT Badge Issued" : "Under Review"}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{user.trustScore || 85}/100</div>
                      <Badge>{(user.trustScore || 85) >= 90 ? "Excellent" : "Good"}</Badge>
                    </div>
                    <Progress value={user.trustScore || 85} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.userType === "recruiter" ? "Total Job Posts" : "Applications"}
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.userType === "recruiter" ? postedJobs.length : applications.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.userType === "recruiter"
                    ? `${postedJobs.filter((job) => job.isVerified).length} active listings`
                    : `${applications.filter((app) => app.status === "Interview Scheduled").length} in progress`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.userType === "recruiter" ? "Total Applicants" : "Profile Views"}
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.userType === "recruiter"
                    ? postedJobs.reduce((total, job) => total + (job.applicants || 0), 0)
                    : "28"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.userType === "recruiter" ? "12 new this week" : "↑ 14% from last week"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                {user.userType === "recruiter"
                  ? "Your company profile and verification details"
                  : "Your personal profile and job preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.userType === "recruiter" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Company Name</h3>
                      <p>{user.company || "Your Company"}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Industry</h3>
                      <p>Information Technology</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium">Company Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.company || "Your Company"} is a leading technology company specializing in web and mobile
                      application development, cloud solutions, and digital transformation.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Verification Date</h3>
                      <p>{user.isVerified ? new Date().toLocaleDateString() : "Pending"}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium">NFT Badge ID</h3>
                      <p className="font-mono text-xs">{user.isVerified ? "0x7a69...4e21" : "Not issued yet"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Full Name</h3>
                      <p>{user.name || `${user.firstName || ""} ${user.lastName || ""}`}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Job Title</h3>
                      <p>Senior Software Engineer</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">JavaScript</Badge>
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">Node.js</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">GraphQL</Badge>
                      <Badge variant="outline">AWS</Badge>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Location</h3>
                      <p>San Francisco, CA</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium">Preferences</h3>
                      <p>Remote, Full-Time</p>
                    </div>
                  </div>
                </>
              )}
              <Button variant="outline" className="mt-4" onClick={() => setShowEditProfile(true)}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posted/Applied Jobs Tab */}
        <TabsContent value={user.userType === "recruiter" ? "posted" : "applied"} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{user.userType === "recruiter" ? "Posted Jobs" : "Applied Jobs"}</CardTitle>
              <CardDescription>
                {user.userType === "recruiter" ? "Manage your job listings" : "Track your job applications"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.userType === "recruiter" ? (
                  postedJobs.length > 0 ? (
                    postedJobs.map((job) => (
                      <div key={job.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="outline">{job.applicants || 0} Applicants</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.company} • {job.location}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{job.type}</Badge>
                          {job.remote && <Badge variant="secondary">Remote</Badge>}
                          <span className="text-xs text-muted-foreground">Posted {job.postedDate}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline">
                            View Applicants
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit Listing
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                      <Button asChild>
                        <Link href="/post-job">Post Your First Job</Link>
                      </Button>
                    </div>
                  )
                ) : appliedJobs.length > 0 ? (
                  appliedJobs.map((job) => (
                    <div key={job.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            job.status === "Interview Scheduled"
                              ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                              : ""
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • {job.location}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{job.type}</Badge>
                        {job.remote && <Badge variant="secondary">Remote</Badge>}
                        <span className="text-xs text-muted-foreground">Posted {job.postedDate}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          View Application
                        </Button>
                        <Button size="sm" variant="outline">
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                    <Button asChild>
                      <Link href="/browse-jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                )}
              </div>
              {user.userType === "recruiter" && (
                <Button className="mt-6" asChild>
                  <Link href="/post-job">
                    <FileText className="mr-2 h-4 w-4" /> Post New Job
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications/Saved Jobs Tab */}
        <TabsContent value={user.userType === "recruiter" ? "applications" : "saved"} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{user.userType === "recruiter" ? "Applications" : "Saved Jobs"}</CardTitle>
              <CardDescription>
                {user.userType === "recruiter" ? "Review candidate applications" : "Jobs you've saved for later"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.userType === "recruiter" ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((id) => (
                    <div key={id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">Application for Senior Frontend Developer</h3>
                        <Badge variant="outline">New</Badge>
                      </div>
                      <p className="text-sm">John Smith • john.smith@example.com</p>
                      <p className="text-xs text-muted-foreground">Applied 2 days ago</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          View Resume
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Interview
                        </Button>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {savedJobs.length > 0 ? (
                    savedJobs.map((job) => (
                      <div key={job.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="outline" className={job.isVerified ? "bg-blue-50 text-blue-700" : ""}>
                            {job.isVerified ? "Verified" : "TrustScore: " + job.trustScore + "%"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.company} • {job.location}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{job.type}</Badge>
                          {job.remote && <Badge variant="secondary">Remote</Badge>}
                          <span className="text-xs text-muted-foreground">Posted {job.postedDate}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/browse-jobs?job=${job.id}`}>View Job</Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't saved any jobs yet.</p>
                      <Button asChild>
                        <Link href="/browse-jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <EditProfileDialog open={showEditProfile} onOpenChange={setShowEditProfile} user={user} />
    </div>
  )
}
