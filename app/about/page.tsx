import { Shield, Award, CheckCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">About Job Shield</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            We're on a mission to make job hunting safe, transparent, and scam-free.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
          <p className="mb-4 text-lg text-muted-foreground">
            Job Shield was founded in 2025 with a clear purpose: to protect job seekers from the growing threat of
            employment scams and fraudulent recruiters.
          </p>
          <p className="mb-4 text-lg text-muted-foreground">
            After witnessing countless talented professionals fall victim to sophisticated job scams, our team of
            cybersecurity experts, HR professionals, and blockchain developers came together to create a solution that
            leverages cutting-edge technology to verify recruiters and validate job opportunities.
          </p>
          <p className="text-lg text-muted-foreground">
            Today, Job Shield stands as the first job platform to combine AI-powered scam detection with blockchain
            verification, creating a trustworthy ecosystem where job seekers can pursue opportunities with confidence.
          </p>
        </div>
      </section>

      {/* Technology Section */}
      <section className="mb-16 rounded-xl bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Technology</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-background p-6 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Scam Detection</h3>
              <p className="text-muted-foreground">
                Our proprietary AI algorithms analyze job postings for over 50 indicators of fraud, catching
                sophisticated scams that humans might miss.
              </p>
            </div>

            <div className="rounded-lg bg-background p-6 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Recruiter NFT Badges</h3>
              <p className="text-muted-foreground">
                We verify recruiter identities and issue blockchain-based NFT badges that cannot be forged, ensuring
                authenticity.
              </p>
            </div>

            <div className="rounded-lg bg-background p-6 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">TrustScore System</h3>
              <p className="text-muted-foreground">
                Our dynamic TrustScore evaluates job listings based on multiple factors, helping job seekers identify
                the most reliable opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">How Job Shield Works</h2>

          <div className="space-y-12">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                1
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">Recruiter Verification</h3>
                <p className="text-muted-foreground">
                  Companies and recruiters submit verification documents through our secure portal. Our team verifies
                  their identity, business registration, and professional credentials.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                2
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">NFT Badge Issuance</h3>
                <p className="text-muted-foreground">
                  Once verified, recruiters receive a unique NFT badge on the blockchain. This badge is displayed on
                  their profile and job listings, signaling their verified status to job seekers.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                3
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">AI Scam Detection</h3>
                <p className="text-muted-foreground">
                  Every job posting undergoes analysis by our AI system, which checks for suspicious patterns,
                  unrealistic promises, and other red flags commonly found in fraudulent listings.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                4
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">Safe Job Application</h3>
                <p className="text-muted-foreground">
                  Job seekers can browse opportunities with confidence, filtering by TrustScore and verified status. Our
                  platform facilitates secure communication between candidates and recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Team</h2>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Team member"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Madhav Kalra</h3>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Team member"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Nikhil Kumar</h3>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Team member"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Lakshay Khandwal</h3>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Team member"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Manekas Singh</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16 rounded-xl bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Impact</h2>

          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">10,000+</div>
              <p className="text-muted-foreground">Verified Recruiters</p>
            </div>

            <div>
              <div className="mb-2 text-4xl font-bold">50,000+</div>
              <p className="text-muted-foreground">Job Seekers Protected</p>
            </div>

            <div>
              <div className="mb-2 text-4xl font-bold">2,500+</div>
              <p className="text-muted-foreground">Scams Prevented</p>
            </div>

            <div>
              <div className="mb-2 text-4xl font-bold">98%</div>
              <p className="text-muted-foreground">Detection Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold">Join the Job Shield Community</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Whether you're a job seeker looking for safe opportunities or a recruiter wanting to stand out, Job Shield
            is here for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
