"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Calendar, Clock, MapPin, ArrowLeft, CreditCard, Banknote, Loader2 } from "lucide-react";
import Link from "next/link";
import LocationInput from "@/components/LocationInput";
import { createClient } from "@/utils/supabase/client";

export default function BookingPage() {
    const router = useRouter();
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [providerName, setProviderName] = useState("Loading...");
    const [serviceType, setServiceType] = useState("Service");

    // Payment State (Just Preference now)
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");

    // Fetch Provider Details
    useEffect(() => {
        const fetchProvider = async () => {
            const supabase = createClient();
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', params.providerId)
                .single();

            if (profile) {
                setProviderName(profile.full_name);
                setServiceType(profile.service_category);
            }
        };

        if (params.providerId) {
            fetchProvider();
        }
    }, [params.providerId]);

    const [formData, setFormData] = useState({
        description: "",
        date: "",
        time: "",
        address: ""
    });

    const handleLocationChange = (loc: string) => {
        setFormData(prev => ({ ...prev, address: loc }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.date || !formData.time || !formData.address || !formData.description) {
            alert("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to book.");

            // Calculate a random estimated price for negotiation reference
            const randomPrice = Math.floor(Math.random() * (1200 - 500 + 1)) + 500;

            const { error } = await supabase
                .from('bookings')
                .insert({
                    customer_id: user.id,
                    provider_id: params.providerId,
                    description: formData.description,
                    booking_date: formData.date,
                    booking_time: formData.time,
                    address: formData.address,
                    status: 'requested',
                    // Save preference
                    payment_method: paymentMethod,
                    // CRITICAL: Always pending initially. Payment happens after service.
                    payment_status: 'pending',
                    price: randomPrice
                });

            if (error) throw error;

            alert("Booking Requested! Payment will be handled after the service is complete.");
            router.push("/dashboard/customer/bookings");
        } catch (error: any) {
            console.error("Booking error:", error);
            alert("Failed to create booking: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link
                href="/dashboard/customer"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Providers
            </Link>

            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border">
                    <h1 className="text-2xl font-bold text-foreground">Book Service</h1>
                    <p className="text-muted-foreground mt-1">
                        Requesting <span className="font-semibold text-foreground">{serviceType}</span> from <span className="font-semibold text-foreground">{providerName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Problem Description */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Describe the Problem
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full rounded-md border-border border p-3 focus:ring-primary focus:border-primary"
                            placeholder="e.g. My kitchen sink is leaking underneath the cabinet..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Preferred Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="date"
                                    required
                                    className="w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Preferred Time
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <select
                                    required
                                    className="w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary bg-white"
                                    value={formData.time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                >
                                    <option value="">Select Time</option>
                                    <option value="09:00">9:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="13:00">1:00 PM</option>
                                    <option value="14:00">2:00 PM</option>
                                    <option value="15:00">3:00 PM</option>
                                    <option value="16:00">4:00 PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Service Address
                        </label>
                        <LocationInput onLocationChange={handleLocationChange} />
                        <p className="text-xs text-muted-foreground mt-1">
                            Ensure this is the exact location where service is required.
                        </p>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                            Preferred Payment Method
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === "cash"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border hover:border-gray-300"
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${paymentMethod === "cash" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                                    <Banknote className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-foreground">Cash after Service</div>
                                    <div className="text-xs text-muted-foreground">Pay the provider directly</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("online")}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === "online"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border hover:border-gray-300"
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${paymentMethod === "online" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-foreground">Pay Online</div>
                                    <div className="text-xs text-muted-foreground">Pay after job is completed</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm">
                            <span className="text-muted-foreground">Estimated Invoice:</span>
                            <span className="block font-bold text-lg text-foreground">₹500 - ₹1200</span>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto px-8 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${isSubmitting ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-teal-800"
                                } text-primary-foreground`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                "Confirm Booking"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
