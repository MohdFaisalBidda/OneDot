"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getUserInitials } from "@/lib/utils";
import { navItems } from "@/consts/routesData";
import { useSession } from "next-auth/react";
import { Home } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userInitials = getUserInitials(session?.user?.name as string);

  // Get visible nav items and add home
  const visibleNavItems = [
    { href: "/dashboard", label: "Home", icon: Home, show: true },
    ...navItems.filter((item) => item.show)
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#F7F5F3] border-t border-border safe-area-inset-bottom">
      <nav className="flex justify-around items-center h-16 px-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all flex-1 max-w-[80px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile/Settings button */}
        <Link
          href="/dashboard/settings/profile"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all flex-1 max-w-[80px]",
            pathname.startsWith("/dashboard/settings")
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold",
            pathname.startsWith("/dashboard/settings")
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {userInitials}
          </div>
          <span className="text-[10px] font-medium truncate w-full text-center">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
