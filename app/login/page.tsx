"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Briefcase, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { generateId } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Login() {
  const [userType, setUserType] = useState<"jobseeker" | "recruiter">("jobseeker")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    // In a real app, you would validate against a backend
    // For this demo, we'll create a mock user if the email contains valid domains
    if (email.includes("@") && password.length >= 6) {
      const user = {
        id: generateId(),
        email,
        name: email.split("@")[0],
        userType,
        isVerified: userType === "recruiter" ? Math.random() > 0.5 : undefined,
        trustScore: userType === "jobseeker" ? Math.floor(Math.random() * 20) + 80 : undefined,
        createdAt: new Date().toISOString(),
      }

      login(user)
      router.push(userType === "recruiter" ? "/dashboard" : "/browse-jobs")
    } else {
      setError("Invalid email or password. Password must be at least 6 characters.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to your Job Shield account</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="jobseeker" onValueChange={(value) => setUserType(value as "jobseeker" | "recruiter")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobseeker" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Job Seeker
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Recruiter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobseeker">
            <Card>
              <CardHeader>
                <CardTitle>Job Seeker Login</CardTitle>
                <CardDescription>Access your account to continue your job search</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Remember me</Label>
                  </div>

                  <Button type="submit" className="w-full">
                    Log In
                  </Button>

                  <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruiter">
            <Card>
              <CardHeader>
                <CardTitle>Recruiter Login</CardTitle>
                <CardDescription>Access your account to manage job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="business-email">Business Email</Label>
                    <Input
                      id="business-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recruiter-password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      id="recruiter-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="recruiter-remember" />
                    <Label htmlFor="recruiter-remember">Remember me</Label>
                  </div>

                  <Button type="submit" className="w-full">
                    Log In
                  </Button>

                  <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup?type=recruiter" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
