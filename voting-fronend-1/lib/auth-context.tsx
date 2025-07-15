"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "super_admin" | "member"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: string, authToken: { id: string; name: string; email: never; role: string }) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session on mount
    const savedSession = localStorage.getItem("voter_session")
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setUser(session.user)
        setToken(session.token)
      } catch (error) {
        console.error("Failed to parse saved session:", error)
        localStorage.removeItem("voter_session")
      }
    }
  }, [])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem(
      "voter_session",
      JSON.stringify({
        user: userData,
        token: authToken,
      }),
    )
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("voter_session")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
