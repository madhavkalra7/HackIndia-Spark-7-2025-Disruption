// This file contains functions for analyzing job descriptions
// and assigning trust scores based on known scam patterns

// Define types for job data
export interface JobData {
  title: string
  company: string
  description: string
  salary?: string
  location?: string
  contactEmail?: string
  requirements?: string[]
}

// Define types for trust score result
export interface TrustScoreResult {
  score: number // 0-100 score
  riskLevel: "Low" | "Medium" | "High"
  flags: string[] // Reasons for flagging
  recommendations: string[] // Recommendations to improve score
}

// List of suspicious keywords that might indicate a scam
const SUSPICIOUS_KEYWORDS = [
  "urgent",
  "immediate start",
  "quick money",
  "work from home",
  "no experience",
  "get rich",
  "easy money",
  "cash advance",
  "wire transfer",
  "western union",
  "money transfer",
  "payment required",
  "application fee",
  "training fee",
  "background check fee",
  "certification fee",
  "processing fee",
]

// List of suspicious email domains
const SUSPICIOUS_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "mail.com",
  "protonmail.com",
  "aol.com",
  "icloud.com",
]

// Function to calculate trust score for a job listing (for compatibility with existing code)
export function calculateTrustScore(description: string, title: string, company: string): number {
  const result = analyzeTrustScore(title, description, company, "", false)
  return result.score
}

// Function to calculate trust score for a job listing
export function analyzeTrustScore(
  title: string,
  description: string,
  company: string,
  salary: string,
  isVerified: boolean,
): { score: number; flags: string[]; recommendations: string[] } {
  let score = 100 // Start with perfect score
  const flags: string[] = []
  const recommendations: string[] = []

  // Check for suspicious keywords in title and description
  const combinedText = `${title} ${description}`.toLowerCase()
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter((keyword) => combinedText.includes(keyword.toLowerCase()))

  if (foundKeywords.length > 0) {
    score -= foundKeywords.length * 5 // Deduct 5 points per suspicious keyword
    flags.push(`Contains suspicious keywords: ${foundKeywords.join(", ")}`)
    recommendations.push("Remove suspicious language that may appear in scam job postings")
  }

  // Check if company name is provided
  if (!company || company.trim() === "") {
    score -= 15
    flags.push("Missing company name")
    recommendations.push("Add a valid company name")
  }

  // Check if description is too short
  if (!description || description.length < 100) {
    score -= 10
    flags.push("Job description is too short")
    recommendations.push("Provide a detailed job description (at least 100 characters)")
  }

  // Check if salary is missing
  if (!salary || salary.trim() === "") {
    score -= 5
    flags.push("Salary information is missing")
    recommendations.push("Include salary information or range")
  }

  // Check if the job is verified
  if (!isVerified) {
    score -= 10
    flags.push("Job is not posted by a verified recruiter")
    recommendations.push("Get verified to increase trust score")
  }

  return {
    score: Math.max(0, score),
    flags,
    recommendations,
  }
}

// Function to get trust level based on score
export function getTrustLevel(score: number): "low" | "medium" | "high" {
  if (score >= 90) {
    return "high"
  } else if (score >= 70) {
    return "medium"
  } else {
    return "low"
  }
}

// Function to get color based on trust level
export function getTrustLevelColor(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "low":
      return "text-red-500"
    case "medium":
      return "text-yellow-500"
    case "high":
      return "text-green-500"
    default:
      return "text-gray-500"
  }
}

// Function to check applicant conditions
export function checkApplicantConditions(
  jobRequirements: {
    requiredSkills: string[]
    minExperience: number
    education: string
    certifications: string[]
    location: string
    remote: boolean
  },
  applicantProfile: {
    skills: string[]
    yearsOfExperience: number
    education: string
    certifications: string[]
    location: string
  },
): { conditionsMet: number; matchedConditions: string[] } {
  let conditionsMet = 0
  const matchedConditions: string[] = []

  // Check skills
  if (jobRequirements.requiredSkills && applicantProfile.skills) {
    const matchedSkills = jobRequirements.requiredSkills.filter((skill) => applicantProfile.skills.includes(skill))
    if (matchedSkills.length > 0) {
      conditionsMet++
      matchedConditions.push("Meets required skills")
    }
  }

  // Check experience
  if (jobRequirements.minExperience && applicantProfile.yearsOfExperience) {
    if (applicantProfile.yearsOfExperience >= jobRequirements.minExperience) {
      conditionsMet++
      matchedConditions.push("Meets minimum experience")
    }
  }

  // Check education
  if (jobRequirements.education && applicantProfile.education) {
    if (applicantProfile.education === jobRequirements.education) {
      conditionsMet++
      matchedConditions.push("Meets required education")
    }
  }

  // Check certifications
  if (jobRequirements.certifications && applicantProfile.certifications) {
    const matchedCerts = jobRequirements.certifications.filter((cert) => applicantProfile.certifications.includes(cert))
    if (matchedCerts.length > 0) {
      conditionsMet++
      matchedConditions.push("Meets required certifications")
    }
  }

  return { conditionsMet, matchedConditions }
}
