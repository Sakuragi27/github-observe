"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react"
import { createContext, useContext, useCallback } from "react"
import { useRouter } from "next/navigation"

interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as any).id,
        email: session.user.email!,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/login" })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading",
        logout,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
