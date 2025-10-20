"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Check, Users, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRemainingSlots } from "@/actions/auth";

export default function First100Offer() {
    const [remainingSlots, setRemainingSlots] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlots = async () => {
            const result = await getRemainingSlots();
            if (result.remaining !== undefined) {
                setRemainingSlots(result.remaining);
            }
            setLoading(false);
        };
        fetchSlots();
    }, []);

    const isFull = remainingSlots !== null && remainingSlots <= 0;

    return (
        <div className="w-full border-b py-12 sm:py-16 md:py-20 lg:py-24 px-4 relative overflow-hidden">
            {/* Background pattern */}
            {/* <div className="absolute inset-0 bg-[#F7F5F3] opacity-40"></div> */}

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center space-y-6">
                    {/* Badge */}
                    <div className="flex justify-center">
                        <Badge className="px-4 py-2 text-sm font-bold bg-[#37322F] text-[#F7F5F3] border border-[#E0DEDB]">
                            <Crown className="h-4 w-4 mr-2" />
                            EXCLUSIVE FOUNDING MEMBERS
                        </Badge>
                    </div>

                    {/* Main Heading */}
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#37322F]">
                        First 100 Users Get
                        <br />
                        <span className="relative inline-block">
                            <span className="absolute inset-0 bg-[#37322F] opacity-5 rounded-lg"></span>
                            <span className="relative">Lifetime Free Access</span>
                        </span>
                    </h2>

                    {/* Subheading */}
                    <p className="text-lg sm:text-xl text-[#605A57] max-w-2xl mx-auto">
                        Join our founding community and unlock all premium features forever—completely free. No credit card required.
                    </p>

                    {/* Remaining Slots Counter */}
                    <div className="py-6">
                        {loading ? (
                            <div className="text-[#605A57]">Loading availability...</div>
                        ) : isFull ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2 text-red-600">
                                    <Lock className="h-5 w-5" />
                                    <span className="text-lg font-semibold">All 100 Spots Claimed!</span>
                                </div>
                                <p className="text-sm text-[#605A57]">
                                    Join our waitlist to be notified when we open up again
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                    <Users className="h-6 w-6 text-[#37322F]" />
                                    <div className="text-4xl sm:text-5xl font-bold text-[#37322F]">
                                        {remainingSlots}
                                    </div>
                                    <span className="text-lg text-[#605A57] font-medium">spots left</span>
                                </div>
                                <div className="w-full max-w-md mx-auto">
                                    <div className="h-3 bg-[#E0DEDB] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#37322F] transition-all duration-500"
                                            style={{ width: `${((100 - (remainingSlots || 0)) / 100) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-[#605A57] mt-2">
                                        {100 - (remainingSlots || 0)} of 100 claimed
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Benefits */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#37322F] text-sm">Unlimited Entries</h4>
                                <p className="text-xs text-[#605A57]">No limits on focus or decision logs</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-orange-50 border border-[#E0DEDB] flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#37322F] text-sm">AI Smart Insights</h4>
                                <p className="text-xs text-[#605A57]">Personalized pattern analysis</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-blue-50 border border-[#E0DEDB] flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#37322F] text-sm">All Future Features</h4>
                                <p className="text-xs text-[#605A57]">Every update, forever free</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-6">
                        <Link href={isFull ? "/waitlist" : "/signup"}>
                            <Button
                                size="sm"
                                className="bg-[#37322F] hover:bg-[#49423D] text-white font-bold px-8 py-6 text-lg rounded-full shadow-[0px_4px_16px_rgba(55,50,47,0.2)] hover:shadow-[0px_6px_20px_rgba(55,50,47,0.3)] transition-all"
                            >
                                {isFull ? "Join Waitlist" : "Claim Your Free Spot Now"}
                            </Button>
                        </Link>
                        <p className="text-xs text-[#605A57] mt-3">
                            Takes less than 30 seconds • No credit card required
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
