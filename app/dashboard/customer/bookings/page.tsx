"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, MapPin, Calendar, Star, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CustomerBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const supabase = createClient();

    const fetchBookings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log("No user found");
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    provider:provider_id (
                        full_name,
                        service_category
                    )
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log("Fetched bookings:", data);
            setBookings(data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        // Realtime Subscription
        const channel = supabase
            .channel('bookings_customer')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchBookings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const openRatingModal = (booking: any) => {
        setSelectedBooking(booking);
        setRating(booking.rating || 0); // Pre-fill if already rated
        setReview(booking.review_text || "");
        setIsRatingModalOpen(true);
    };

    const submitRating = async () => {
        if (!selectedBooking || rating === 0) return;
        setIsSubmittingRating(true);

        try {
            const { error } = await supabase
                .from('bookings')
                .update({
                    rating: rating,
                    review_text: review
                })
                .eq('id', selectedBooking.id);

            if (error) throw error;

            alert("Thank you for your feedback!");
            setIsRatingModalOpen(false);
            fetchBookings(); // Refresh to show submitted state

        } catch (error: any) {
            alert("Error submitting rating: " + error.message);
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "requested":
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Requested</span>;
            case "accepted":
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Accepted</span>;
            case "in_progress":
                return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">In Progress</span>;
            case "completed":
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
            case "cancelled":
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
            case "rejected":
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 relative">
            <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>

            {isLoading ? (
                <div className="text-center py-12">Loading bookings...</div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                    <p className="text-muted-foreground">You haven't made any bookings yet.</p>
                    <a href="/dashboard/customer" className="text-primary hover:underline font-medium mt-2 inline-block">Find a Pro</a>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-border p-6 transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-foreground">
                                            {booking.provider?.full_name || "Service Provider"}
                                        </h3>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {booking.provider?.service_category || "Service"}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{booking.booking_date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{booking.booking_time}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate max-w-xs">{booking.address}</span>
                                        </div>
                                    </div>
                                    {booking.description && (
                                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            &quot;{booking.description}&quot;
                                        </p>
                                    )}
                                    {booking.rating && (
                                        <div className="mt-2 flex items-center gap-1 text-sm text-yellow-600">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="font-medium">You rated: {booking.rating}/5</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {booking.status === "requested" && (
                                        <button className="text-sm text-red-600 hover:underline">
                                            Cancel Request
                                        </button>
                                    )}
                                    {booking.status === "completed" && (
                                        <button
                                            onClick={() => openRatingModal(booking)}
                                            className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-teal-800 transition-colors"
                                        >
                                            <Star className="h-3 w-3" /> {booking.rating ? "Edit Rating" : "Rate Provider"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rating Modal */}
            {isRatingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-foreground">Rate Experience</h3>
                            <button onClick={() => setIsRatingModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                How was your service with <span className="font-bold text-foreground">{selectedBooking?.provider?.full_name}</span>?
                            </p>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-medium mt-2 text-foreground">
                                {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Okay" : rating === 2 ? "Poor" : rating === 1 ? "Terrible" : "Select a rating"}
                            </p>
                        </div>

                        <div className="mb-6">
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Write a brief review (optional)..."
                                className="w-full p-3 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                            />
                        </div>

                        <button
                            onClick={submitRating}
                            disabled={isSubmittingRating || rating === 0}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmittingRating ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
