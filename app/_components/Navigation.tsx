"use client";

import { Button } from "@/components/ui/button";
import { cn, getUserInitials } from "@/lib/utils";
import {  signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  User,
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  Fingerprint,
} from "lucide-react";
import { HoverPopover } from "@/components/custom/hover-popover";
import { navItems } from "@/consts/routesData";
import { APP_NAME } from "@/consts";
import { ReusableDialog } from "@/components/custom/DialogWithForm";
import SignupForm from "./forms/signup-form";
import LoginForm from "./forms/login-form";
import { Logo } from "@/components/custom/Logo";
import { logOut } from "@/lib/user";
import { toast } from "sonner";
import AuthDialog, { useAuthDialog } from "@/components/custom/AuthDialog";

function Navigation() {

  const pathname = usePathname();
  const { data: session } = useSession();
  const {openSignup, openLogin, closeAll, popoverOpen, setPopoverOpen} = useAuthDialog();
  const userInitials = getUserInitials(session?.user?.name);

  
  return (
    <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-4 sm:px-6 md:px-8 lg:px-0">
      <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

      <div className="w-full max-w-[calc(100%-16px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-7xl lg:w-5xl h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 pr-1.5 sm:pr-2 md:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-lg overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
        <div className="flex justify-center items-center">
       <Logo/>
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

        <div className="flex justify-start items-center gap-2 sm:gap-0">
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
                open={popoverOpen}
                onOpenChange={setPopoverOpen}
                trigger={
                  <div className="flex h-12 items-center justify-end px-6 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
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
            </>
          ) : (
            <>
              <HoverPopover
                open={popoverOpen}
                onOpenChange={setPopoverOpen}
                trigger={
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full p-2 hover:bg-accent"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                }
                content={
                  <AuthDialog/>
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navigation;
