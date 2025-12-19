"use client";

import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Download, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function EarningsPage() {
    const [timeRange, setTimeRange] = useState("week");
    const [earnings, setEarnings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        created_at,
                        booking_date,
                        price,
                        status,
                        service_category:provider_id(service_category),
                        customer:customer_id(full_name)
                    `)
                    .eq('provider_id', user.id)
                    .order('booking_date', { ascending: false });

                if (error) throw error;
                setEarnings(data || []);
            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEarnings();

        // Subscribe to Realtime Changes
        const channel = supabase
            .channel('provider_earnings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchEarnings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const completedEarnings = earnings.filter(e => e.status === 'completed');
    const totalAmount = completedEarnings.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const pendingEarnings = earnings.filter(e => ['accepted', 'in_progress'].includes(e.status));
    const potentialAmount = pendingEarnings.reduce((acc, curr) => acc + (curr.price || 0), 0); // Assuming potential earnings based on price?

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">Earnings & Payouts</h1>
                <div className="flex bg-muted rounded-lg p-1">
                    {/* Time range buttons mock for UI, real filtering would need more logic */}
                    <button
                        onClick={() => setTimeRange("week")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === "week" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeRange("month")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === "month" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setTimeRange("year")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === "year" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                            <h3 className="text-3xl font-bold text-foreground mt-2">₹{totalAmount}</h3>
                        </div>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">Verified</span>
                        <span className="text-muted-foreground ml-1">completed jobs</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending / Active</p>
                            <h3 className="text-3xl font-bold text-foreground mt-2">₹{potentialAmount}</h3>
                        </div>
                        <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        From active jobs
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Jobs Completed</p>
                            <h3 className="text-3xl font-bold text-foreground mt-2">{completedEarnings.length}</h3>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Lifetime total
                    </p>
                </div>
            </div>

            {/* Earnings History List */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground">Job History</h2>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading history...</div>
                    ) : earnings.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No earnings history yet.</div>
                    ) : (
                        earnings.map((item) => (
                            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${item.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                        {item.status === 'completed' ? (
                                            <ArrowDownRight className={`h-5 w-5 ${item.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`} />
                                        ) : (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{item.description || "Service Booking"}</p>
                                        <p className="text-sm text-muted-foreground">{item.booking_date} • {item.customer?.full_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-foreground">₹{item.price || 0}</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
