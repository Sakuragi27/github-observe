"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  token: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string, userId: string, email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.token && parsed.id && parsed.email) {
          setUser(parsed)
        }
      }
    } catch {
      localStorage.removeItem("auth")
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((token: string, userId: string, email: string) => {
    const userData: User = { id: userId, token, email }
    setUser(userData)
    localStorage.setItem("auth", JSON.stringify(userData))
    // Keep backward compatibility with old "token" key
    localStorage.setItem("token", token)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("auth")
    localStorage.removeItem("token")
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
