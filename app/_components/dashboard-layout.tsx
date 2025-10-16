"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getUserInitials } from "@/lib/utils";
import { useState } from "react";
import { Settings, ChevronDown, LogOut } from "lucide-react";
import { navItems, pageTitles, settingsItems } from "@/consts/routesData";
import { signOut, useSession } from "next-auth/react";
import { APP_NAME } from "@/consts";
import { HoverPopover } from "@/components/custom/hover-popover";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const pathname = usePathname();
  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname.startsWith("/settings")
  );
  const { data: session } = useSession();

  // const pageTitle = pageTitles[pathname];
  const userInitials = getUserInitials(session?.user?.name as string);

  return (
    <div className="flex min-h-screen bg-[#F7F5F3]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-[#F7F5F3] transition-transform">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex justify-center h-16 items-center border-b border-border px-6">
            <Link
              href={"/"}
              className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-5 font-serif"
            >
              {APP_NAME}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Settings with submenu */}
            <div className="pt-2">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  pathname.startsWith("/settings")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Settings className="h-5 w-5" />
                Settings
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    settingsExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* Settings submenu */}
              <div
                className={cn(
                  "mt-1 space-y-1 overflow-hidden transition-all cursor-pointer",
                  settingsExpanded
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg py-2 pl-11 pr-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {userInitials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {session?.user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-[#F7F5F3] backdrop-blur supports-[backdrop-filter]:bg-[#F7F5F3]">
          <div className="flex justify-end">
            <HoverPopover
              onOpenChange={setPopoverOpen}
              open={popoverOpen}
              trigger={
                <div className="flex h-16 items-center justify-end px-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {userInitials}
                  </div>
                </div>
              }
              content={
                <div className="flex flex-col space-y-1">
                  <Button
                    onClick={() =>
                      signOut({
                        redirect: true,
                        callbackUrl: "/",
                      })
                    }
                    variant={"ghost"}
                    className="w-full justify-start gap-2 font-medium hover:bg-accent hocer:text-primary-foreground text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              }
            />
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
