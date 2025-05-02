"use client"

import { useEffect, useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import JobCard from "@/components/job-card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
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
  requirements?: string
  applicationInstructions?: string
  postedBy: string
  postedDate: string
  trustScore: number
  isVerified: boolean
  // New fields for applicant conditions
  requiredSkills?: string[]
  minExperience?: number
  education?: string
  certifications?: string[]
  trustScoreDetails?: {
    flags: string[]
    recommendations: string[]
  }
}

// Application type
interface Application {
  id: number
  jobId: number
  userId: string
  status: string
  appliedDate: string
}

// Mock data for job listings
const mockJobListings = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    trustScore: 95,
    isVerified: true,
    salary: "$120,000 - $150,000",
    type: "Full-Time",
    remote: true,
    description: "We're looking for an experienced Frontend Developer to join our team...",
    postedDate: "2 days ago",
    postedBy: "user1",
  },
  {
    id: 2,
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "New York, NY",
    trustScore: 88,
    isVerified: true,
    salary: "$110,000 - $130,000",
    type: "Full-Time",
    remote: false,
    description: "Join our data science team to work on cutting-edge analytics projects...",
    postedDate: "1 week ago",
    postedBy: "user2",
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Creative Designs",
    location: "Remote",
    trustScore: 92,
    isVerified: true,
    salary: "$90,000 - $110,000",
    type: "Full-Time",
    remote: true,
    description: "We're seeking a talented UX/UI Designer to create beautiful user experiences...",
    postedDate: "3 days ago",
    postedBy: "user3",
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Cloud Systems Inc.",
    location: "Austin, TX",
    trustScore: 85,
    isVerified: false,
    salary: "$130,000 - $160,000",
    type: "Full-Time",
    remote: true,
    description: "Looking for a DevOps Engineer to help us scale our cloud infrastructure...",
    postedDate: "5 days ago",
    postedBy: "user4",
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "Growth Marketing",
    location: "Chicago, IL",
    trustScore: 78,
    isVerified: false,
    salary: "$70,000 - $90,000",
    type: "Full-Time",
    remote: false,
    description: "Join our marketing team to develop and execute marketing strategies...",
    postedDate: "1 day ago",
    postedBy: "user5",
  },
  {
    id: 6,
    title: "Backend Developer",
    company: "Server Solutions",
    location: "Remote",
    trustScore: 90,
    isVerified: true,
    salary: "$100,000 - $130,000",
    type: "Full-Time",
    remote: true,
    description: "We need a skilled Backend Developer to build robust APIs and services...",
    postedDate: "4 days ago",
    postedBy: "user6",
  },
]

export default function BrowseJobs() {
  const { user } = useAuth()
  const [jobListings, setJobListings] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [appliedJobs, setAppliedJobs] = useState<number[]>([])
  const [showAppliedOnly, setShowAppliedOnly] = useState(false)

  // Filter states
  const [titleFilter, setTitleFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("")
  const [trustScoreFilter, setTrustScoreFilter] = useState("")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  // Add a new filter for blockchain verified jobs
  const [blockchainVerifiedOnly, setBlockchainVerifiedOnly] = useState(false)

  // Load jobs from local storage or use mock data
  useEffect(() => {
    const storedJobs = localStorage.getItem("job_shield_jobs")
    let jobs: Job[] = []

    if (storedJobs) {
      jobs = JSON.parse(storedJobs)
    }

    // If no stored jobs, use mock data
    if (jobs.length === 0) {
      jobs = mockJobListings.map((job) => {
        // Add trust score analysis for mock jobs
        const result = analyzeTrustScore(job.title, job.description, job.company, job.salary, job.isVerified)

        return {
          ...job,
          trustScore: result.score,
          trustScoreDetails: {
            flags: result.flags,
            recommendations: result.recommendations,
          },
          // Add mock applicant conditions
          requiredSkills: ["JavaScript", "React", "TypeScript"],
          minExperience: 2,
          education: "bachelor",
          certifications: [],
        }
      })
      localStorage.setItem("job_shield_jobs", JSON.stringify(jobs))
    }

    // Format dates for display
    jobs = jobs.map((job) => {
      // If postedDate is an ISO string, convert to relative time
      if (job.postedDate.includes("T")) {
        const date = new Date(job.postedDate)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
          job.postedDate = "Today"
        } else if (diffDays === 1) {
          job.postedDate = "Yesterday"
        } else if (diffDays < 7) {
          job.postedDate = `${diffDays} days ago`
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7)
          job.postedDate = `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
        } else {
          job.postedDate = date.toLocaleDateString()
        }
      }
      return job
    })

    setJobListings(jobs)

    // Get user's applied jobs
    if (user && user.userType === "jobseeker") {
      const applications = localStorage.getItem("job_shield_applications")
      if (applications) {
        const parsedApplications: Application[] = JSON.parse(applications)
        const userApplications = parsedApplications.filter((app) => app.userId === user.id)
        const appliedJobIds = userApplications.map((app) => app.jobId)
        setAppliedJobs(appliedJobIds)

        // If there are applied jobs, show them by default
        if (appliedJobIds.length > 0) {
          setShowAppliedOnly(true)
        }
      }
    }
  }, [user])

  // Apply filters
  useEffect(() => {
    let filtered = [...jobListings]

    // Filter by applied jobs
    if (showAppliedOnly && appliedJobs.length > 0) {
      filtered = filtered.filter((job) => appliedJobs.includes(job.id))
    }

    // Filter by title
    if (titleFilter) {
      filtered = filtered.filter((job) => job.title.toLowerCase().includes(titleFilter.toLowerCase()))
    }

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    // Filter by job type
    if (jobTypeFilter && jobTypeFilter !== "all") {
      filtered = filtered.filter((job) => job.type.toLowerCase() === jobTypeFilter.toLowerCase())
    }

    // Filter by trust score
    if (trustScoreFilter && trustScoreFilter !== "any") {
      const minScore = Number.parseInt(trustScoreFilter)
      filtered = filtered.filter((job) => job.trustScore >= minScore)
    }

    // Filter verified only
    if (verifiedOnly) {
      filtered = filtered.filter((job) => job.isVerified)
    }

    // Filter remote only
    if (remoteOnly) {
      filtered = filtered.filter((job) => job.remote)
    }

    // Filter blockchain verified only
    if (blockchainVerifiedOnly) {
      // Get blockchain verified jobs from applications
      const applications = localStorage.getItem("job_shield_applications")
      if (applications) {
        const parsedApplications = JSON.parse(applications)
        const blockchainVerifiedJobs = parsedApplications
          .filter((app: any) => app.blockchainVerified)
          .map((app: any) => app.jobId)

        filtered = filtered.filter((job) => blockchainVerifiedJobs.includes(job.id))
      } else {
        filtered = []
      }
    }

    // Sort jobs
    if (sortBy === "newest") {
      filtered.sort((a, b) => {
        // If using ISO dates stored in localStorage
        if (a.postedDate.includes("T") && b.postedDate.includes("T")) {
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        }
        // Otherwise use the display strings (less accurate)
        return a.postedDate.localeCompare(b.postedDate)
      })
    } else if (sortBy === "trustscore") {
      filtered.sort((a, b) => b.trustScore - a.trustScore)
    } else if (sortBy === "salary") {
      filtered.sort((a, b) => {
        // Extract the max salary from the range for sorting
        const aMax = Number.parseInt(a.salary.split("-")[1]?.replace(/\D/g, "") || "0")
        const bMax = Number.parseInt(b.salary.split("-")[1]?.replace(/\D/g, "") || "0")
        return bMax - aMax
      })
    }

    setFilteredJobs(filtered)
  }, [
    jobListings,
    titleFilter,
    locationFilter,
    jobTypeFilter,
    trustScoreFilter,
    verifiedOnly,
    remoteOnly,
    blockchainVerifiedOnly,
    sortBy,
    showAppliedOnly,
    appliedJobs,
  ])

  const toggleAppliedFilter = () => {
    setShowAppliedOnly(!showAppliedOnly)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Browse Jobs</h1>

      <div className="grid gap-8 md:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="space-y-6 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Filters</h2>
            <Filter className="h-5 w-5" />
          </div>

          <div className="space-y-4">
            {user && user.userType === "jobseeker" && (
              <div className="flex items-center space-x-2">
                <Checkbox id="applied" checked={showAppliedOnly} onCheckedChange={toggleAppliedFilter} />
                <Label htmlFor="applied">Show Applied Jobs Only</Label>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Job Title</label>
              <Input
                placeholder="Search by title..."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Location</label>
              <Input
                placeholder="City, state, or remote"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Job Type</label>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Minimum TrustScore</label>
              <Select value={trustScoreFilter} onValueChange={setTrustScoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Score</SelectItem>
                  <SelectItem value="95">95+</SelectItem>
                  <SelectItem value="90">90+</SelectItem>
                  <SelectItem value="80">80+</SelectItem>
                  <SelectItem value="70">70+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="verified">Verified Recruiters Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={remoteOnly}
                onCheckedChange={(checked) => setRemoteOnly(checked as boolean)}
              />
              <Label htmlFor="remote">Remote Jobs Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="blockchain"
                checked={blockchainVerifiedOnly}
                onCheckedChange={(checked) => setBlockchainVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="blockchain">Blockchain Verified Only</Label>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              // Reset applied filter when applying other filters
              if (showAppliedOnly && appliedJobs.length > 0) {
                setShowAppliedOnly(false)
              }
            }}
          >
            Apply Filters
          </Button>
        </div>

        {/* Job Listings */}
        <div className="md:col-span-3">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted-foreground">Showing {filteredJobs.length} jobs</p>
            <div className="flex items-center gap-2">
              <label className="text-sm">Sort by:</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Newest first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="trustscore">Highest TrustScore</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} isApplied={appliedJobs.includes(job.id)} />)
            ) : (
              <div className="rounded-lg border p-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
