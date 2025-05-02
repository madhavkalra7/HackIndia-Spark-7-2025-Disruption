"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function ProfileSkills() {
  const { user, updateUser } = useAuth()

  const [skills, setSkills] = useState<string[]>(user?.skills || [])
  const [newSkill, setNewSkill] = useState("")

  const [education, setEducation] = useState<string>(user?.education || "")
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(user?.yearsOfExperience || 0)

  const [certifications, setCertifications] = useState<string[]>(user?.certifications || [])
  const [newCertification, setNewCertification] = useState("")

  const [location, setLocation] = useState<string>(user?.location || "")

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      const updatedSkills = [...skills, newSkill]
      setSkills(updatedSkills)
      setNewSkill("")

      if (user) {
        updateUser({
          ...user,
          skills: updatedSkills,
        })
      }
    }
  }

  const removeSkill = (skill: string) => {
    const updatedSkills = skills.filter((s) => s !== skill)
    setSkills(updatedSkills)

    if (user) {
      updateUser({
        ...user,
        skills: updatedSkills,
      })
    }
  }

  const addCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      const updatedCertifications = [...certifications, newCertification]
      setCertifications(updatedCertifications)
      setNewCertification("")

      if (user) {
        updateUser({
          ...user,
          certifications: updatedCertifications,
        })
      }
    }
  }

  const removeCertification = (cert: string) => {
    const updatedCertifications = certifications.filter((c) => c !== cert)
    setCertifications(updatedCertifications)

    if (user) {
      updateUser({
        ...user,
        certifications: updatedCertifications,
      })
    }
  }

  const handleEducationChange = (value: string) => {
    setEducation(value)

    if (user) {
      updateUser({
        ...user,
        education: value,
      })
    }
  }

  const handleExperienceChange = (value: string) => {
    const experience = Number.parseInt(value)
    setYearsOfExperience(experience)

    if (user) {
      updateUser({
        ...user,
        yearsOfExperience: experience,
      })
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)

    if (user) {
      updateUser({
        ...user,
        location: e.target.value,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills & Qualifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Add your skills and qualifications to match with job requirements and potentially earn token rewards when
            applying to jobs.
          </p>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" />
              <Button type="button" size="icon" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 rounded-full p-1 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {skill}</span>
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet</p>}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Select value={education} onValueChange={handleEducationChange}>
              <SelectTrigger id="education">
                <SelectValue placeholder="Select your education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No formal education</SelectItem>
                <SelectItem value="high school">High School Diploma</SelectItem>
                <SelectItem value="associate">Associate's Degree</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD or Doctorate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Select value={yearsOfExperience.toString()} onValueChange={handleExperienceChange}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Select years of experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No experience</SelectItem>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="2">2 years</SelectItem>
                <SelectItem value="3">3 years</SelectItem>
                <SelectItem value="4">4 years</SelectItem>
                <SelectItem value="5">5 years</SelectItem>
                <SelectItem value="7">7+ years</SelectItem>
                <SelectItem value="10">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={handleLocationChange} placeholder="City, State or Remote" />
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add a certification"
              />
              <Button type="button" size="icon" onClick={addCertification}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="ml-1 rounded-full p-1 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {cert}</span>
                  </button>
                </Badge>
              ))}
              {certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications added yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
