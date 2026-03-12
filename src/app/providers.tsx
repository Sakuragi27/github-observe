"use client"

import { ThemeProvider } from "@/providers/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { ToastProvider } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
