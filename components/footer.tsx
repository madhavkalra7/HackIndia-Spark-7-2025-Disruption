import Link from "next/link"
import { Shield } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Job Shield</span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              AI-powered scam detection + blockchain-verified recruiters = safe job hunting.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse-jobs" className="text-muted-foreground hover:text-primary">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-primary">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">For Recruiters</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/post-job" className="text-muted-foreground hover:text-primary">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/signup?type=recruiter" className="text-muted-foreground hover:text-primary">
                  Get Verified
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  NFT Badge Program
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Job Shield. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
