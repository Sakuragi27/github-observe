"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FolderGit2,
  Tags,
  RefreshCw,
  Settings,
  LogOut,
  Github,
  Moon,
  Sun,
  ChevronLeft,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "项目列表", icon: FolderGit2 },
  { href: "/tags", label: "标签管理", icon: Tags },
  { href: "/sync", label: "同步", icon: RefreshCw },
  { href: "/settings", label: "设置", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-card border p-2 shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl flex flex-col transition-all duration-300",
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Github className="h-4 w-4" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-lg"
            >
              GitHub Observe
            </motion.span>
          )}
          <button
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => {
                  // Close mobile sidebar on navigation
                  if (window.innerWidth < 1024) setCollapsed(true)
                }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return linkContent
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t px-2 py-3 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
            {!collapsed && <span>{resolvedTheme === "dark" ? "亮色模式" : "暗黑模式"}</span>}
          </button>

          <Separator />

          {/* User info */}
          {user && (
            <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && "justify-center")}>
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email}
                  className="w-8 h-8 rounded-full shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium shrink-0">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  {user.name && <p className="text-sm font-medium truncate">{user.name}</p>}
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              {!collapsed && (
                <Button variant="ghost" size="icon" onClick={logout} className="shrink-0 h-8 w-8">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
