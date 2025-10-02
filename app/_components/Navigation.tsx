"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/daily-focus", label: "Daily Focus" },
  { href: "/decisions", label: "Decisions" },
  { href: "/history", label: "History" },
  { href: "/export", label: "Export" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-serif text-xl font-semibold text-foreground">
            ClarityLog
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
