"use client";

import { usePathname } from "next/navigation";
import { pageTitles } from "@/consts/routesData";
import { useSession } from "next-auth/react";
import { getUserInitials } from "@/lib/utils";
import { HoverPopover } from "@/components/custom/hover-popover";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { APP_NAME } from "@/consts";
import { Logo } from "@/components/custom/Logo";
import { logOut } from "@/lib/user";

export function MobileHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userInitials = getUserInitials(session?.user?.name);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Get page title from pathname
  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#F7F5F3] border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
      <Logo/>
        
        <HoverPopover
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          trigger={
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              {userInitials}
            </button>
          }
          content={
            <div className="flex flex-col space-y-1 min-w-[160px]">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || 'No email'}
                </p>
              </div>
              
              <Link href="/dashboard/settings/profile" onClick={() => setPopoverOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-medium"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              
              <Link href="/dashboard/settings/account" onClick={() => setPopoverOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-medium"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              
              <Button
                onClick={logOut}
                variant="ghost"
                className="w-full justify-start gap-2 font-medium text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          }
        />
      </div>
    </header>
  );
}
