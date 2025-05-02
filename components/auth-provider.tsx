"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, getUserFromStorage, removeUserFromStorage, saveUserToStorage } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  signup: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from local storage on initial render
  useEffect(() => {
    const storedUser = getUserFromStorage()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    saveUserToStorage(userData)
    setUser(userData)
  }

  const signup = (userData: User) => {
    saveUserToStorage(userData)
    setUser(userData)
  }

  const logout = () => {
    removeUserFromStorage()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
