"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Wrench, ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";

type UserRole = "customer" | "provider" | "admin";

import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<UserRole>("customer");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error("No user found");
            }

            // Fetch the user's role from metadata
            const userRole = data.user.user_metadata.role;

            // Strict check - only allow login if the selected tab matches
            if (userRole !== role && role !== 'admin') {
                await supabase.auth.signOut(); // Log them out immediately
                throw new Error(`This email is registered as a ${userRole}. Please switch to the ${userRole} tab to log in.`);
            }

            // Automatic Redirection based on ACTUAL account role
            if (userRole === "customer") {
                router.push("/dashboard/customer");
            } else if (userRole === "provider") {
                router.push("/dashboard/provider");
            } else if (userRole === "admin") {
                router.push("/dashboard/admin");
            } else {
                // Fallback if no role found
                router.push("/dashboard/customer");
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message || "Invalid login credentials");
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
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Or{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-primary hover:text-teal-800"
                    >
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
                    {/* Role Selection Tabs */}
                    <div className="flex space-x-1 rounded-xl bg-muted p-1 mb-6">
                        <button
                            onClick={() => setRole("customer")}
                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${role === "customer"
                                ? "bg-white text-primary shadow"
                                : "text-muted-foreground hover:bg-white/[0.12] hover:text-foreground"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="h-4 w-4" />
                                Customer
                            </div>
                        </button>
                        <button
                            onClick={() => setRole("provider")}
                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${role === "provider"
                                ? "bg-white text-primary shadow"
                                : "text-muted-foreground hover:bg-white/[0.12] hover:text-foreground"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Wrench className="h-4 w-4" />
                                Provider
                            </div>
                        </button>
                        <button
                            onClick={() => setRole("admin")}
                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${role === "admin"
                                ? "bg-white text-primary shadow"
                                : "text-muted-foreground hover:bg-white/[0.12] hover:text-foreground"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Admin
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
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
                                    className="block w-full pl-10 sm:text-sm border-border rounded-md focus:ring-primary focus:border-primary p-2 border"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 sm:text-sm border-border rounded-md focus:ring-primary focus:border-primary p-2 border"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-foreground"
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-primary hover:text-teal-800"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    "Signing in..."
                                ) : (
                                    <span className="flex items-center">
                                        Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <a
                                    href="#"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-white text-sm font-medium text-muted-foreground hover:bg-muted"
                                >
                                    <span className="sr-only">Sign in with Google</span>
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                </a>
                            </div>
                            <div>
                                <a
                                    href="#"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-white text-sm font-medium text-muted-foreground hover:bg-muted"
                                >
                                    <span className="sr-only">Sign in with Facebook</span>
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
