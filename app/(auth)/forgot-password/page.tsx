"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        const supabase = createClient();

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (error) {
                throw error;
            }

            setMessage("Check your email for the password reset link.");
        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                        <Wrench className="h-8 w-8" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
                    {message ? (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Mail className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Email sent</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{message}</p>
                                    </div>
                                    <div className="mt-4">
                                        <div className="-mx-2 -my-1.5 flex">
                                            <Link
                                                href="/login"
                                                className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                            >
                                                Back to login
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-border rounded-md focus:ring-primary focus:border-primary p-2 border"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        "Sending..."
                                    ) : (
                                        <span className="flex items-center">
                                            Send reset link
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-center">
                                <Link href="/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
