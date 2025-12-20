"use client";

import { useEffect, useState } from "react";
import LocationInput from "@/components/LocationInput";
import { Search, Star, Filter, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Categories for filtering
const categories = [
    { id: "all", name: "All Services" },
    { id: "Plumber", name: "Plumber" },
    { id: "Electrician", name: "Electrician" },
    { id: "Carpenter", name: "Carpenter" },
    { id: "Cleaner", name: "Cleaner" },
    { id: "Painter", name: "Painter" },
];

interface ProviderProfile {
    id: string;
    full_name: string;
    service_category: string;
    price_range: string;
    rating: number;
    review_count: number;
    bio: string;
    service_area: string;
}

export default function CustomerDashboard() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");
    const [providers, setProviders] = useState<ProviderProfile[]>([]);
    const [busyProviderIds, setBusyProviderIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();

                // 1. Fetch Providers
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'provider');

                if (selectedCategory !== "all") {
                    query = query.eq('service_category', selectedCategory);
                }

                const { data: providersData, error: providersError } = await query;
                if (providersError) throw providersError;

                // 2. Fetch Busy Providers (Providers I have an active booking with)
                let busyIds: string[] = [];
                if (user) {
                    const { data: activeBookings, error: bookingsError } = await supabase
                        .from('bookings')
                        .select('provider_id')
                        // Removed .eq('customer_id', user.id) to check GLOBAL availability
                        .in('status', ['accepted', 'in_progress']);

                    if (bookingsError) {
                        console.error("Error fetching bookings:", bookingsError);
                    } else {
                        busyIds = activeBookings?.map(b => b.provider_id) || [];
                    }
                }

                setBusyProviderIds(busyIds);
                setProviders(providersData || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory]);

    // Local filter for search text AND busy providers
    const filteredServices = providers.filter((provider) => {
        // Exclude busy providers
        if (busyProviderIds.includes(provider.id)) return false;

        const matchesSearch = (provider.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (provider.service_category?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleLocationChange = (loc: string) => {
        setLocation(loc);
        console.log("Customer location:", loc);
    };

    return (
        <div className="space-y-6">
            {/* Header / Search Section */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <h1 className="text-2xl font-bold text-foreground mb-4">Find a Pro</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location Input */}
                    <div className="w-full">
                        <LocationInput onLocationChange={handleLocationChange} />
                    </div>

                    {/* Search Input */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
                            Search Services
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="focus:ring-primary focus:border-primary block w-full rounded-md pl-10 sm:text-sm border-border border p-2.5"
                                placeholder="Plumber, Electrician..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service List */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Available Pros</h2>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <Filter className="h-4 w-4" /> Filter
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading available pros...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div key={service.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="h-40 bg-muted relative bg-gray-200 flex items-center justify-center">
                                    {/* Placeholder Image since we don't have real user avatars yet */}
                                    <span className="text-4xl">🛠️</span>
                                    <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-bold shadow-sm text-foreground">
                                        {service.price_range || "Contact for Price"}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-foreground">{service.full_name || "Service Provider"}</h3>
                                        <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded">
                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                                            <span className="ml-1 text-xs font-bold text-yellow-700">{service.rating || "5.0"}</span>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground capitalize text-sm mb-4">{service.service_category || "Uncategorized"}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{service.bio || "No description provided."}</p>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Available Today</span>
                                        </div>

                                        <Link
                                            href={`/dashboard/customer/book/${service.id}`}
                                            className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-md hover:bg-teal-800 transition-colors text-sm font-medium"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredServices.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground">No providers found. Try changing the category or search terms.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
