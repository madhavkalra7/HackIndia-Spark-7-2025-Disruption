"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Shield, User, Briefcase, Wallet } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import ProfileSkills from "@/components/profile-skills"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updatedUser = {
      ...user,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: user.userType === "recruiter" ? (formData.get("company") as string) : user.company,
    }

    updateUser(updatedUser)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Your Profile</h1>
      </div>

      <Tabs defaultValue="account" className="space-y-8">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="skills">Skills & Qualifications</TabsTrigger>
          <TabsTrigger value="wallet">Blockchain Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={user.name || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} />
                </div>

                {user.userType === "recruiter" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" defaultValue={user.company || ""} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                      {user.userType === "recruiter" ? (
                        <>
                          <Briefcase className="mr-2 h-4 w-4" /> Recruiter
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" /> Job Seeker
                        </>
                      )}
                    </Badge>

                    {user.userType === "recruiter" && user.isVerified && (
                      <Badge variant="outline" className="bg-green-50 px-3 py-1 text-green-700">
                        <Shield className="mr-2 h-4 w-4" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <ProfileSkills />
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to verify your identity on the blockchain and receive token rewards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Your Wallet</h3>
                </div>

                {user.walletAddress ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Connected Address:</span>
                      <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                        {user.walletAddress.substring(0, 6)}...
                        {user.walletAddress.substring(user.walletAddress.length - 4)}
                      </code>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Your wallet is connected and ready to receive token rewards when you apply to jobs and meet the
                      required conditions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your MetaMask wallet to the Polygon Mumbai Testnet to enable blockchain verification and
                      token rewards.
                    </p>

                    <WalletConnect
                      onConnect={(address) => {
                        updateUser({
                          ...user,
                          walletAddress: address,
                        })
                      }}
                      showBalance={true}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">About Blockchain Integration</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Job Shield uses the Polygon Mumbai Testnet to verify job applications and reward qualified
                    applicants with tokens.
                  </p>
                  <p>
                    When you apply to a job and meet at least 3 of the recruiter's conditions, you'll automatically
                    receive tokens as a reward.
                  </p>
                  <p>These tokens can be used within the Job Shield ecosystem for premium features and services.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
