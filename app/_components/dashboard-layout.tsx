"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getUserInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Settings, ChevronDown, LogOut, ChevronLeft, ChevronRight, User } from "lucide-react";
import { navItems, settingsItems } from "@/consts/routesData";
import { useSession } from "next-auth/react";
import { HoverPopover } from "@/components/custom/hover-popover";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/custom/Logo";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";
import { logOut } from "@/lib/user";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const pathname = usePathname();
  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname.startsWith("/settings")
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session } = useSession();

  // const pageTitle = pageTitles[pathname];
  const userInitials = getUserInitials(session?.user?.name);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F5F3] w-full">
      {/* Sidebar - Hidden on mobile */}
      <aside className={cn(
        "hidden md:block fixed left-0 top-0 z-40 h-screen border-r border-border bg-[#F7F5F3] transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex justify-center h-16 items-center border-b border-border px-6">
            {!sidebarCollapsed && <Logo />}
            {sidebarCollapsed && <Link href={"/"} className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-serif font-bold text-lg">•</span>
            </Link>}
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
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {!sidebarCollapsed && item.label}
                </Link>
              );
            })}

            {/* Settings with submenu */}
            {!sidebarCollapsed ? (
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
            ) : (
              <div className="pt-2">
                <Link
                  href="/dashboard/settings/profile"
                  className={cn(
                    "flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    pathname.startsWith("/settings")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-border p-3 space-y-2">
            {/* Collapse Button */}
            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              variant="ghost"
              className={cn(
                "w-full gap-2 text-muted-foreground hover:text-foreground hover:bg-accent",
                sidebarCollapsed ? "justify-center px-0" : "justify-start"
              )}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  Collapse
                </>
              )}
            </Button>

            {/* Logout Button */}
            <Button
              onClick={logOut}
              variant="ghost"
              className={cn(
                "w-full gap-2 text-muted-foreground hover:text-foreground hover:bg-accent",
                sidebarCollapsed ? "justify-center px-0" : "justify-start"
              )}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        {/* Mobile Header - Visible only on mobile */}
        <MobileHeader />

        {/* Header - Hidden on mobile */}
        <header className="hidden md:block sticky top-0 z-30 border-b border-border bg-[#F7F5F3] backdrop-blur supports-[backdrop-filter]:bg-[#F7F5F3]">
          <div className="flex justify-end">
            <HoverPopover
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              trigger={
                <div className="flex h-16 items-center justify-end px-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {userInitials}
                  </div>
                </div>
              }
              content={
                <div className="flex flex-col space-y-1">
                  {/* Mobile Navigation - Hidden on desktop */}
                  <div className="flex flex-col space-y-1 border-b pb-2 mb-2">
                    {navItems.map(
                      (item) =>
                        item.show && (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                              pathname === item.href
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            {item.label}
                          </Link>
                        )
                    )}
                  </div>
                  <Link href={"/dashboard/settings/profile"}>
                    <Button
                      variant={"ghost"}
                      className="w-full justify-start gap-2 font-medium hover:bg-accent hocer:text-primary-foreground text-muted-foreground hover:text-foreground"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link href={"/dashboard/settings/account"}>
                    <Button
                      variant={"ghost"}
                      className="w-full justify-start gap-2 font-medium hover:bg-accent hocer:text-primary-foreground text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    onClick={logOut}
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
        <main className="flex-1 pb-20 md:pb-0 pt-5">{children}</main>
      </div>

      {/* Bottom Navigation - Visible only on mobile */}
      <BottomNav />
    </div>
  );
}
