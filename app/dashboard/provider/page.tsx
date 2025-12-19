"use client";

import { useState, useEffect } from "react";
import { DollarSign, Star, Briefcase, ArrowRight } from "lucide-react";
import LocationInput from "@/components/LocationInput";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ProviderDashboard() {
    const [currentLocation, setCurrentLocation] = useState("");
    const [stats, setStats] = useState({ rating: "0.0", reviews: 0, earnings: 0 });
    const [isProfileComplete, setIsProfileComplete] = useState(true);
    const [providerName, setProviderName] = useState("Service Pro");
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile stats
                const { data: profile } = await supabase.from('profiles').select('average_rating, total_reviews, service_category, full_name').eq('id', user.id).single();

                // Fetch earnings
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('price')
                    .eq('provider_id', user.id)
                    .eq('status', 'completed');

                const totalEarnings = bookings?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;

                if (profile) {
                    setIsProfileComplete(!!profile.service_category);
                    if (profile.full_name) {
                        setProviderName(profile.full_name);
                    }
                    setStats({
                        rating: profile.average_rating ? Number(profile.average_rating).toFixed(1) : "0.0",
                        reviews: profile.total_reviews || 0,
                        earnings: totalEarnings
                    });
                }
            }
        };

        fetchStats();

        // Subscribe to changes in bookings (ratings, completion, new earnings)
        const channel = supabase
            .channel('provider_dashboard_stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                // When bookings change (price, status, rating), refetch stats
                // Note: The rating trigger updates 'profiles', so we should really re-fetch profiles too.
                // Since 'fetchStats' fetches both, this is perfect.
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleLocationChange = (loc: string) => {
        setCurrentLocation(loc);
        console.log("Provider location updated:", loc);
        // In real app: Update provider's live location in DB
    };

    return (
        <div className="space-y-8">
            {/* Header / Location Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Welcome back, {providerName}!</h1>
                        <p className="text-muted-foreground mt-1">
                            Set your current location to get matched with nearby jobs.
                        </p>
                    </div>
                    <div className="w-full md:w-1/3">
                        <LocationInput onLocationChange={handleLocationChange} />
                    </div>
                </div>
            </div>

            {/* Profile Completion Nudge (Conditional) */}
            {/* Profile Completion Nudge (Conditional) */}
            {!isProfileComplete && (
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-foreground text-lg">Complete your Profile</h3>
                        <p className="text-muted-foreground text-sm">You need to select your <strong>Service Category</strong> (e.g., Plumber, Carpenter) to receive bookings.</p>
                    </div>
                    <Link
                        href="/dashboard/provider/profile"
                        className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-teal-800 transition-colors"
                    >
                        Go to Profile <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Earnings (Month)</h3>
                            <p className="text-2xl font-bold text-foreground">₹{stats.earnings}</p>
                        </div>
                    </div>
                    <p className="text-sm text-green-600 mt-4 pl-1">Keep working!</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Jobs Completed</h3>
                            <p className="text-2xl font-bold text-foreground">{stats.reviews}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 pl-1">Based on reviews</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Average Rating</h3>
                            <p className="text-2xl font-bold text-foreground">{stats.rating}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 pl-1">Based on {stats.reviews} reviews</p>
                </div>
            </div>

            <div className="opacity-50 pointer-events-none filter blur-[1px] select-none">
                {/* Visual filler to suggest more content below without it being interactive */}
                <div className="h-32 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-muted-foreground">More analytics coming soon...</span>
                </div>
            </div>
        </div>
    );
}
