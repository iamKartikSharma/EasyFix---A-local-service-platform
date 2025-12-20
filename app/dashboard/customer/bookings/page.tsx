"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, MapPin, Calendar, Star, X, CreditCard, AlertCircle, Receipt, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PaymentModal from "@/components/PaymentModal";

export default function CustomerBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentBooking, setPaymentBooking] = useState<any>(null);

    const supabase = createClient();

    const fetchBookings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

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
            setBookings(data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
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

    // --- RATING LOGIC ---
    const openRatingModal = (booking: any) => {
        setSelectedBooking(booking);
        setRating(booking.rating || 0);
        setReview(booking.review_text || "");
        setIsRatingModalOpen(true);
    };

    const submitRating = async () => {
        if (!selectedBooking || rating === 0) return;
        setIsSubmittingRating(true);

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ rating: rating, review_text: review })
                .eq('id', selectedBooking.id);

            if (error) throw error;
            alert("Thank you for your feedback!");
            setIsRatingModalOpen(false);
            fetchBookings();
        } catch (error: any) {
            alert("Error submitting rating: " + error.message);
        } finally {
            setIsSubmittingRating(false);
        }
    };

    // --- PAYMENT LOGIC ---
    const openPaymentModal = (booking: any) => {
        setPaymentBooking(booking);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (status: string, source: string) => {
        if (!paymentBooking) return;
        try {
            // Note: We do NOT generate transactionId here. The provider does that upon confirmation.

            // Use RPC to bypass RLS and ensure update succeeds
            const { error } = await supabase.rpc('mark_payment_verifying', {
                booking_id: paymentBooking.id
            });

            if (error) throw error;
            fetchBookings();
        } catch (error: any) {
            console.error("Payment Update Error:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            requested: "bg-amber-100/50 text-amber-700 border-amber-200",
            accepted: "bg-blue-100/50 text-blue-700 border-blue-200",
            in_progress: "bg-indigo-100/50 text-indigo-700 border-indigo-200",
            completed: "bg-emerald-100/50 text-emerald-700 border-emerald-200",
            cancelled: "bg-red-100/50 text-red-700 border-red-200",
            rejected: "bg-red-100/50 text-red-700 border-red-200",
        };
        const defaultStyle = "bg-gray-100 text-gray-600 border-gray-200";
        // @ts-ignore
        const currentStyle = styles[status] || defaultStyle;

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider border ${currentStyle}`}>
                {status.replace("_", " ")}
            </span>
        );
    };

    const getPaymentBadge = (booking: any) => {
        if (booking.payment_status === 'paid') {
            return (
                <div className="flex flex-col items-start gap-1">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full text-xs border border-emerald-100">
                        <CheckCircle className="h-3.5 w-3.5" /> Paid ₹{booking.price}
                    </span>
                    <span className="text-[10px] text-gray-400 pl-2">
                        via {booking.payment_source}
                    </span>
                </div>
            );
        } else if (booking.payment_source === 'UPI Verifying') {
            return (
                <div className="flex flex-col items-start gap-1">
                    <span className="flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50/80 px-3 py-1 rounded-full text-xs border border-amber-100 animate-pulse">
                        <Clock className="h-3.5 w-3.5" /> Verifying Payment...
                    </span>
                    <span className="text-[10px] text-gray-400 pl-2">
                        Waiting for Provider
                    </span>
                </div>
            );
        } else if (booking.status === 'completed') {
            return (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 animate-pulse">
                    <AlertCircle className="h-3.5 w-3.5" /> Due: ₹{booking.price}
                </span>
            );
        } else {
            return (
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" /> Pending
                </span>
            );
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
                    <p className="text-gray-500 mt-2">Manage your service requests and history.</p>
                </div>
                <a href="/dashboard/customer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors">
                    Book New Service <ArrowRight className="h-4 w-4" />
                </a>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading your bookings...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 mb-4">No bookings found</p>
                    <a href="/dashboard/customer" className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-blue-600 transition-colors">Find a Professional</a>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="group bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

                                {/* Info Section */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between lg:justify-start gap-4 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                            {booking.provider?.full_name || "Provider"}
                                        </h3>
                                        {getStatusBadge(booking.status)}
                                    </div>

                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        {booking.provider?.service_category}
                                    </p>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full shadow-sm text-gray-400"><Calendar className="h-4 w-4" /></div>
                                            <span className="font-medium">{booking.booking_date}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full shadow-sm text-gray-400"><Clock className="h-4 w-4" /></div>
                                            <span className="font-medium">{booking.booking_time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 sm:col-span-2">
                                            <div className="p-2 bg-white rounded-full shadow-sm text-gray-400"><MapPin className="h-4 w-4" /></div>
                                            <span className="truncate block font-medium">{booking.address}</span>
                                        </div>
                                    </div>

                                    {booking.description && (
                                        <div className="text-sm text-gray-500 italic pl-1 border-l-2 border-gray-200">
                                            &quot;{booking.description}&quot;
                                        </div>
                                    )}

                                    {/* Action Area for Mobile (Payment status etc) */}
                                    <div className="lg:hidden flex justify-between items-center pt-4 border-t border-gray-50">
                                        {getPaymentBadge(booking)}
                                    </div>
                                </div>

                                {/* Actions / Sidebar */}
                                <div className="flex flex-col items-end gap-3 lg:pl-8 lg:border-l border-gray-50 min-w-[180px]">
                                    {/* Desktop Payment Badge */}
                                    <div className="hidden lg:block mb-4">
                                        {getPaymentBadge(booking)}
                                    </div>

                                    {/* PAY NOW BUTTON */}
                                    {booking.status === "completed" && booking.payment_status !== "paid" && (
                                        <button
                                            onClick={() => openPaymentModal(booking)}
                                            className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-600 hover:scale-105 shadow-lg shadow-primary/20 transition-all duration-300"
                                        >
                                            <CreditCard className="h-4 w-4" /> Pay Now
                                        </button>
                                    )}

                                    {booking.status === "requested" && (
                                        <button className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-4 py-2 hover:bg-red-50 rounded-lg">
                                            Cancel Request
                                        </button>
                                    )}

                                    {booking.status === "completed" && booking.payment_status === 'paid' && (
                                        booking.rating ? (
                                            <div className="w-full flex items-center justify-center gap-2 text-sm bg-amber-50 text-amber-900 px-5 py-2.5 rounded-xl border border-amber-100 font-medium">
                                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                                                You rated {booking.rating}/5
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openRatingModal(booking)}
                                                className="w-full flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                            >
                                                <Star className="h-4 w-4 text-amber-400 fill-current" />
                                                Rate Service
                                            </button>
                                        )
                                    )}

                                    {booking.transaction_id && (
                                        <div className="mt-auto text-[10px] text-gray-300 font-mono tracking-wider flex items-center gap-1">
                                            <Receipt className="h-3 w-3" /> {booking.transaction_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PaymentModal
                isOpen={isPaymentModalOpen}
                amount={paymentBooking?.price || 0}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Rating Modal */}
            {isRatingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Rate Experience</h3>
                            <button onClick={() => setIsRatingModalOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-8">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                    >
                                        <Star className={`h-10 w-10 ${rating >= star ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 text-sm font-medium text-gray-500">
                                {rating > 0 ? "You rated " + rating + " stars" : "Tap a star to rate"}
                            </p>
                        </div>

                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write a brief review..."
                            className="w-full p-4 bg-gray-50 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-primary mb-6 resize-none"
                            rows={3}
                        />

                        <button
                            onClick={submitRating}
                            disabled={isSubmittingRating || rating === 0}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {isSubmittingRating ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
