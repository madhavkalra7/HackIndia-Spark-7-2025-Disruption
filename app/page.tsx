import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, Award } from "lucide-react"
import TestimonialCard from "@/components/testimonial-card"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Shield className="h-20 w-20 text-primary" />
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight">Protect Your Career with Job Shield</h1>
          <p className="mb-10 text-xl text-muted-foreground">
            AI-powered scam detection + blockchain-verified recruiters = safe job hunting.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link href="/browse-jobs">Browse Jobs</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/post-job">Post a Job</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose Job Shield?</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Our platform combines cutting-edge AI with blockchain technology to create the safest job hunting
            experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <div className="mb-4 flex justify-center">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI Scam Detection</h3>
            <p className="text-muted-foreground">
              Our AI algorithms analyze job postings to detect potential scams and protect job seekers.
            </p>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <div className="mb-4 flex justify-center">
              <Award className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Verified Recruiters</h3>
            <p className="text-muted-foreground">
              Blockchain-verified NFT badges ensure you're dealing with legitimate recruiters.
            </p>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">TrustScore System</h3>
            <p className="text-muted-foreground">
              Our proprietary TrustScore helps you identify the most reliable job opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">What Our Users Say</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join thousands of job seekers and recruiters who trust Job Shield.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <TestimonialCard
            name="Sarah Johnson"
            role="Software Developer"
            image="/placeholder.svg?height=100&width=100"
            quote="Thanks to Job Shield's verification system, I found a legitimate remote position without worrying about scams."
          />
          <TestimonialCard
            name="Michael Chen"
            role="HR Manager"
            image="/placeholder.svg?height=100&width=100"
            quote="As a recruiter, the NFT badge has helped us stand out and attract more qualified candidates."
          />
          <TestimonialCard
            name="Priya Sharma"
            role="Data Scientist"
            image="/placeholder.svg?height=100&width=100"
            quote="The TrustScore feature helped me identify high-quality opportunities and land my dream job."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="my-16 rounded-xl bg-primary/10 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to Shield Your Career?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join our platform today and experience safe job hunting with blockchain verification.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
