"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { User, LogIn, UserPlus, Settings, LogOut } from "lucide-react";
import { HoverPopover } from "@/components/custom/hover-popover";
import { navItems } from "@/consts/routesData";
import { APP_NAME } from "@/consts";

function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
      <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

      <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-7xl lg:w-5xl h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-lg overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
        <div className="flex justify-center items-center">
          <div className="flex justify-start items-center">
            <Link
              href={"/"}
              className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-5 font-serif"
            >
              {APP_NAME}
            </Link>
          </div>
          <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 flex justify-start items-start hidden sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
            <div className="flex justify-start items-center">
              <Link
                href={"/#features"}
                className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans"
              >
                Features
              </Link>
            </div>
            <div className="flex justify-start items-center">
              <Link
                href={"/#pricing"}
                className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans"
              >
                Pricing
              </Link>
            </div>
            <div className="flex justify-start items-center">
              <Link
                href={"/#faq"}
                className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
          {session?.user ? (
            <>
              {/* User Popover */}
              <Link href={"/dashboard"}>
                <Button
                  variant={"heroDark"}
                  size={"sm"}
                  className="rounded-2xl"
                >
                  Dashboard
                </Button>
              </Link>
              <HoverPopover
                trigger={
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full p-2 hover:bg-accent cursor-pointer"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {session.user.name || session.user.email}
                    </span>
                  </Button>
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
                      onClick={() => signOut()}
                      variant={"ghost"}
                      className="w-full justify-start gap-2 font-medium hover:bg-accent hocer:text-primary-foreground text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                }
              />
            </>
          ) : (
            <HoverPopover
              trigger={
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full p-2 hover:bg-accent"
                >
                  <User className="h-5 w-5" />
                </Button>
              }
              content={
                <div className="flex flex-col space-y-2">
                  <Link href={"/login"}>
                    <Button
                      variant={"ghost"}
                      className="w-full justify-start gap-2 font-medium hover:bg-accent"
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Button>
                  </Link>
                  <Link href={"/signup"}>
                    <Button
                      variant={"default"}
                      className="w-full justify-start gap-2 font-medium"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Button>
                  </Link>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Navigation;
