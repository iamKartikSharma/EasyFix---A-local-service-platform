"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Save, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CustomerProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        address: "" // We can repurpose 'service_area' or add a new column, using service_area for now as "Address"
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFormData({
                        full_name: profile.full_name || "",
                        email: profile.email || user.email || "",
                        phone: profile.phone || "",
                        address: profile.service_area || "" // Using service_area column to store address for customers for simplicity
                    });
                }
            }
            setIsFetching(false);
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    phone: formData.phone,
                    service_area: formData.address // Saving address to service_area column
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
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-6">

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="block w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="block w-full rounded-md border-border border pl-10 p-2.5 bg-muted text-muted-foreground sm:text-sm cursor-not-allowed"
                        />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="block w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Default Address</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="block w-full rounded-md border-border border pl-10 p-2.5 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="123 Main St, City, Country"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
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
