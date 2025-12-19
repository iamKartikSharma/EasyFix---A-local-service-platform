"use client";

import { useEffect, useState } from "react";
import { User, Wrench, DollarSign, Clock, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProviderProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        bio: "",
        experience_years: "",
        price_range: "",
        service_category: "",
        service_area: ""
    });

    const supabase = createClient();

    // Fetch existing profile data on load
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFormData({
                        full_name: profile.full_name || "",
                        email: profile.email || user.email || "",
                        phone: profile.phone || "",
                        bio: profile.bio || "",
                        experience_years: profile.experience_years || "",
                        price_range: profile.price_range || "",
                        service_category: profile.service_category || "Plumber",
                        service_area: profile.service_area || ""
                    });
                }
            }
            setIsFetching(false);
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    phone: formData.phone,
                    experience_years: parseInt(formData.experience_years) || 0,
                    price_range: formData.price_range,
                    service_category: formData.service_category,
                    service_area: formData.service_area
                })
                .eq('id', user.id);

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            alert("Error updating profile: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="block w-full rounded-md border-border border p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="block w-full rounded-md border-border border p-2.5 bg-muted text-muted-foreground sm:text-sm cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full rounded-md border-border border p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Service Category</label>
                            <select
                                name="service_category"
                                value={formData.service_category}
                                onChange={handleChange}
                                className="block w-full rounded-md border-border border p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                <option value="Plumber">Plumber</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Carpenter">Carpenter</option>
                                <option value="Cleaner">Cleaner</option>
                                <option value="Painter">Painter</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Professional Details Section */}
                <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        Professional Details
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Bio & Description</label>
                            <textarea
                                name="bio"
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                                className="block w-full rounded-md border-border border p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Tell customers about your skills and work ethic..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Years of Experience</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={formData.experience_years}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Min. 1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Price Range</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-muted-foreground font-bold">₹</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="price_range"
                                        value={formData.price_range}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="e.g. ₹500-₹1000"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Estimated hourly rate or job range.</p>
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-foreground mb-1">Service Areas</label>
                                <input
                                    type="text"
                                    name="service_area"
                                    value={formData.service_area}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-border border p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="e.g. New York, Brooklyn, Queens"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
