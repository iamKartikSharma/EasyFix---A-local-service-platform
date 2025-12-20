"use client";

import { useEffect, useState } from "react";
import { Check, X, MapPin, Calendar, User, FileText, Clock, Play, CheckCircle, CreditCard, Banknote, AlertCircle, Receipt } from "lucide-react";
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

    const updateStatus = async (id: string, newStatus: string, currentJob?: any) => {
        try {
            // Logic for completing a job
            let updatePayload: any = { status: newStatus };

            if (newStatus === "completed" && currentJob) {
                if (currentJob.payment_method === 'cash') {
                    // CASH FLOW: Verify collection immediately
                    const confirmed = window.confirm(
                        `💰 PLEASE CONFIRM:\n\nHave you collected ₹${currentJob.price} cash from ${currentJob.customer?.full_name}?\n\nClick OK to confirm payment and complete job.`
                    );

                    if (!confirmed) return; // Stop if not collected

                    // Mark as Paid + Completed + Source=Cash
                    updatePayload.payment_status = 'paid';
                    updatePayload.payment_source = 'Cash Provided';
                    updatePayload.transaction_id = 'CASH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                }
                // ONLINE FLOW: Do nothing extra. Job marks completed. Payment stays pending.
            }

            const { error } = await supabase
                .from('bookings')
                .update(updatePayload)
                .eq('id', id);

            if (error) throw error;

            fetchJobs();

        } catch (error: any) {
            console.error("Error updating status:", error);
            alert("Failed to update status: " + error.message);
        }
    };

    // Filter logic
    // Filter logic
    const filteredJobs = jobs.filter(job => {
        if (activeTab === "requests") {
            return job.status === "requested";
        } else if (activeTab === "active") {
            // Active: Accepted, In Progress, OR Completed but NOT PAID (Waiting for payment)
            return ["accepted", "in_progress"].includes(job.status) ||
                (job.status === "completed" && job.payment_status !== "paid");
        } else {
            // History: Cancelled, Rejected, OR Completed AND PAID
            return ["cancelled", "rejected"].includes(job.status) ||
                (job.status === "completed" && job.payment_status === "paid");
        }
    });

    const getPaymentBadge = (job: any) => {
        if (job.payment_status === 'paid') {
            return (
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        <CheckCircle className="h-3 w-3" /> Paid: ₹{job.price}
                    </div>
                    {job.payment_source && (
                        <span className="text-[10px] text-gray-500 mt-1">via {job.payment_source}</span>
                    )}
                </div>
            )
        } else if (job.status === 'completed') {
            // Completed but Unpaid (Waiting for Online Payment)
            return (
                <div className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium animate-pulse">
                    <AlertCircle className="h-3 w-3" /> Waiting for Payment
                </div>
            )
        } else if (job.payment_method === 'cash') {
            return <div className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                <Banknote className="h-3 w-3" /> Collect Cash: ₹{job.price}
            </div>
        } else {
            return <div className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                <CreditCard className="h-3 w-3" /> Online (Pending)
            </div>
        }
    };



    // Function to confirm online payment
    const confirmPayment = async (job: any) => {
        const confirmed = window.confirm(`💰 Check your bank account.\n\nDid you receive ₹${job.price} from ${job.customer?.full_name}?\n\nClick OK to confirm.`);
        if (!confirmed) return;

        const transactionId = "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        const { error } = await supabase
            .from('bookings')
            .update({
                payment_status: 'paid',
                payment_source: 'UPI', // Clear the 'Verifying' suffix
                transaction_id: transactionId
            })
            .eq('id', job.id);

        if (error) {
            alert("Error: " + error.message);
        } else {
            fetchJobs();
        }
    };

    const rejectPayment = async (job: any) => {
        const confirmed = window.confirm(`⚠️ Are you sure you haven't received the payment?\n\nThis will reject the customer's claim and ask them to pay again.\n\nClick OK to Reject.`);
        if (!confirmed) return;

        const { error } = await supabase
            .from('bookings')
            .update({
                payment_status: 'pending',
                payment_source: 'online' // Reset to default online status
            })
            .eq('id', job.id);

        if (error) {
            alert("Error: " + error.message);
        } else {
            fetchJobs();
        }
    };

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
                        {jobs.filter(j => ["accepted", "in_progress"].includes(j.status) || (j.status === "completed" && j.payment_status !== "paid")).length > 0 && (
                            <span className="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
                                {jobs.filter(j => ["accepted", "in_progress"].includes(j.status) || (j.status === "completed" && j.payment_status !== "paid")).length}
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
                        <div key={job.id} className="bg-white rounded-lg shadow-sm border border-border p-6 flex flex-col md:flex-row justify-between items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {job.customer?.full_name || "Customer"}
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

                                    {getPaymentBadge(job)}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {job.address}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> {job.booking_date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" /> {job.booking_time}
                                    </div>
                                    <div className="flex items-center gap-1 font-semibold text-foreground">
                                        <Banknote className="h-4 w-4" /> ₹{job.price} (Est)
                                    </div>
                                </div>

                                {job.transaction_id && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <Receipt className="h-3 w-3" /> TNX: {job.transaction_id}
                                    </div>
                                )}

                                {job.description && (
                                    <p className="text-sm text-muted-foreground mt-2 bg-gray-50 p-3 rounded border border-gray-100 w-full">
                                        &quot;{job.description}&quot;
                                    </p>
                                )}

                            </div>

                            <div className="flex gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">

                                {job.payment_source === 'UPI Verifying' && (
                                    <>
                                        <button
                                            onClick={() => rejectPayment(job)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm font-semibold hover:bg-red-100 shadow-sm"
                                        >
                                            <X className="h-4 w-4" /> Not Received
                                        </button>
                                        <button
                                            onClick={() => confirmPayment(job)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold hover:bg-green-700 shadow-md animate-pulse"
                                        >
                                            <CheckCircle className="h-4 w-4" /> Confirm Recieved
                                        </button>
                                    </>
                                )}

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
                                        onClick={() => updateStatus(job.id, "completed", job)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {job.payment_method === 'cash' ? 'Collect & Complete' : 'Complete (Wait for Pay)'}
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
