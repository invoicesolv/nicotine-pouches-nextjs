"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface AdminThemeProviderProps {
  children: React.ReactNode
  attribute?: "class" | "data-theme" | "data-mode"
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function AdminThemeProvider({ children, ...props }: AdminThemeProviderProps) {
  return (
    <div className="admin-dark">
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </div>
  )
}
