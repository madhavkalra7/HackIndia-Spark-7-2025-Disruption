// Types for our authentication system
export interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  company?: string
  userType: "jobseeker" | "recruiter" | "admin"
  isVerified?: boolean
  trustScore?: number
  createdAt: string
  walletAddress?: string
  skills?: string[]
  education?: string
  yearsOfExperience?: number
  certifications?: string[]
  location?: string
}

// Local storage keys
export const AUTH_STORAGE_KEY = "job_shield_auth"

// Helper functions for authentication
export function saveUserToStorage(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }
}

export function getUserFromStorage(): User | null {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY)
    if (userData) {
      return JSON.parse(userData)
    }
  }
  return null
}

export function removeUserFromStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

// Generate a random ID for new users
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
