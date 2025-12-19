"use client";

import { useEffect, useState } from "react";
import { Check, X, MapPin, Calendar, User, FileText, Clock, Play, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function BookingsPage() {
    // 3 Tabs for better organization
    const [activeTab, setActiveTab] = useState<"requests" | "active" | "history">("requests");
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    customer:customer_id (
                        full_name,
                        email,
                        phone
                    )
                `)
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Subscribe to Realtime Changes
    useEffect(() => {
        fetchJobs();

        const channel = supabase
            .channel('bookings_provider')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchJobs(); // Refetch on any change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            // No need to manual fetch, realtime will trigger it (or we can optimistic update)
            // But simple fetch is safer
            fetchJobs();
        } catch (error: any) {
            console.error("Error updating status:", error);
            alert("Failed to update status: " + error.message);
        }
    };

    // Filter logic
    const filteredJobs = jobs.filter(job => {
        if (activeTab === "requests") {
            return job.status === "requested";
        } else if (activeTab === "active") {
            return ["accepted", "in_progress"].includes(job.status);
        } else {
            return ["completed", "cancelled", "rejected"].includes(job.status);
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>

                {/* Tabs */}
                <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "requests"
                            ? "bg-white text-primary shadow"
                            : "text-muted-foreground hover:bg-white/50"
                            }`}
                    >
                        Requests
                        {jobs.filter(j => j.status === "requested").length > 0 && (
                            <span className="ml-2 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">
                                {jobs.filter(j => j.status === "requested").length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "active"
                            ? "bg-white text-primary shadow"
                            : "text-muted-foreground hover:bg-white/50"
                            }`}
                    >
                        Active Jobs
                        {jobs.filter(j => ["accepted", "in_progress"].includes(j.status)).length > 0 && (
                            <span className="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
                                {jobs.filter(j => ["accepted", "in_progress"].includes(j.status)).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "history"
                            ? "bg-white text-primary shadow"
                            : "text-muted-foreground hover:bg-white/50"
                            }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="text-center py-12">Loading jobs...</div>
            ) : filteredJobs.length > 0 ? (
                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-lg shadow-sm border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-foreground">
                                        #{job.id.slice(0, 8)} - {job.customer?.full_name || "Customer"}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                        job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                            job.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                                job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {job.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {job.address}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> {job.booking_date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" /> {job.booking_time}
                                    </div>
                                </div>

                                {job.description && (
                                    <p className="text-sm text-muted-foreground mt-1 max-w-xl bg-gray-50 p-2 rounded">
                                        &quot;{job.description}&quot;
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {job.status === "requested" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(job.id, "rejected")}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                                        >
                                            <X className="h-4 w-4" /> Decline
                                        </button>
                                        <button
                                            onClick={() => updateStatus(job.id, "accepted")}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-teal-800"
                                        >
                                            <Check className="h-4 w-4" /> Accept
                                        </button>
                                    </>
                                )}
                                {job.status === "accepted" && (
                                    <button
                                        onClick={() => updateStatus(job.id, "in_progress")}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                                    >
                                        <Play className="h-4 w-4 mr-2" /> Start Job
                                    </button>
                                )}
                                {job.status === "in_progress" && (
                                    <button
                                        onClick={() => updateStatus(job.id, "completed")}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground">No Jobs in this Category</h3>
                    <p className="text-muted-foreground">
                        {activeTab === "requests" && "No new requests waiting."}
                        {activeTab === "active" && "You have no active jobs right now."}
                        {activeTab === "history" && "No past jobs found."}
                    </p>
                </div>
            )}
        </div>
    );
}
