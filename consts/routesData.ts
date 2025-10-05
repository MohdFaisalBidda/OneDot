import { Archive, BarChart3, BookOpen, CreditCard, Download, GitBranch, Home, Sliders, StoreIcon, User } from "lucide-react"

export const navItems = [
  { href: "/dashboard", label: "Home", icon: Home, show: false },
  { href: "/dashboard/daily-focus", label: "Daily Focus", icon: BookOpen,show: true },
  { href: "/dashboard/decisions", label: "Decisions", icon: GitBranch,show: true },
  { href: "/dashboard/history", label: "History", icon: BarChart3,show: false },
  { href: "/dashboard/export", label: "Export", icon: Download,show: false },
  { href: "/dashboard/archive", label: "Archives", icon:Archive ,show: true }, 
]

export const settingsItems = [
  { href: "/dashboard/settings/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings/account", label: "Account", icon: CreditCard },
  { href: "/dashboard/settings/preferences", label: "Preferences", icon: Sliders },
]

export const pageTitles: Record<string, string> = {
  "/dashboard/daily-focus": "Daily Focus Journal",
  "/dashboard/decisions": "Decision Tracker",
  "/dashboard/history": "History & Reflection",
  "/dashboard/export": "Export Data",
  "/dashboard/archive": "Complete Archive",
  "/dashboard/settings/profile": "Profile Settings",
  "/dashboard/settings/account": "Account Settings",
  "/dashboard/settings/preferences": "Preferences",
}

export const homeDashboardQuickLinks = [
  {
    title: "Daily Focus",
    description: "Set and track your daily intentions",
    icon: BookOpen,
    href: "/dashboard/daily-focus",
    color: "text-blue-600",
  },
  {
    title: "Decisions",
    description: "Document important choices",
    icon: GitBranch,
    href: "/dashboard/decisions",
    color: "text-purple-600",
  },
  {
    title: "History",
    description: "Review your progress and patterns",
    icon: BarChart3,
    href: "/dashboard/history",
    color: "text-green-600",
  },
  {
    title: "Export",
    description: "Download your data",
    icon: Download,
    href: "/dashboard/export",
    color: "text-orange-600",
  },
]
